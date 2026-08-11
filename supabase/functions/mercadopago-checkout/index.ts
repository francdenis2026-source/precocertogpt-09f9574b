import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { describeMercadoPagoError, validateCheckoutBody, validateCheckoutEnv } from "../_shared/mercadopagoValidation.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const decoder = new TextDecoder();

function b64ToBytes(value: string) { return Uint8Array.from(atob(value), c => c.charCodeAt(0)); }
async function importEncryptionKey(secret: string) {
  const raw = b64ToBytes(secret);
  if (raw.length !== 32) throw new Error("MERCADOPAGO_TOKEN_ENCRYPTION_KEY inválida");
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]);
}
async function decryptToken(value: string, secret: string) {
  const [version, ivB64, cipherB64] = value.split(":");
  if (version !== "v1" || !ivB64 || !cipherB64) throw new Error("Reconecte a conta Mercado Pago");
  const key = await importEncryptionKey(secret);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToBytes(ivB64) }, key, b64ToBytes(cipherB64));
  return decoder.decode(plain);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const encryptionKey = Deno.env.get("MERCADOPAGO_TOKEN_ENCRYPTION_KEY");
  const publicKey = Deno.env.get("MERCADOPAGO_PUBLIC_KEY");
  const appBaseUrl = Deno.env.get("APP_BASE_URL");
  const webhookUrl = Deno.env.get("MERCADOPAGO_WEBHOOK_URL");
  const envCheck = validateCheckoutEnv({ publicKey, encryptionKey });
  if (!envCheck.ok) return json({ error: envCheck.error }, envCheck.status);

  const authHeader = req.headers.get("Authorization") || "";
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const admin = createClient(supabaseUrl, serviceKey);
  const { data: userData } = await userClient.auth.getUser();
  const user = userData.user;
  if (!user) return json({ error: "Faça login para pagar" }, 401);

  const body = await req.json().catch(() => ({}));
  const bodyCheck = validateCheckoutBody(body);
  if (!bodyCheck.ok) return json({ error: bodyCheck.error }, bodyCheck.status);
  const orderId = String(body.orderId);


  const { data: order, error: orderError } = await userClient
    .from("orders")
    .select("id,order_number,merchant_id,customer_id,customer_email,status,payment_status,total,platform_fee,order_items(id,product_name,quantity,unit_price,total_price)")
    .eq("id", orderId)
    .eq("customer_id", user.id)
    .maybeSingle();
  if (orderError || !order) return json({ error: "Pedido não encontrado" }, 404);
  if (order.status !== "pending_payment" || order.payment_status === "approved") return json({ error: "Este pedido não está disponível para pagamento" }, 409);

  const { data: connection } = await admin.from("merchant_payment_connections").select("access_token_encrypted,status").eq("merchant_id", order.merchant_id).eq("provider", "mercadopago").maybeSingle();
  if (!connection || connection.status !== "connected" || !connection.access_token_encrypted) return json({ error: "O estabelecimento ainda não conectou o Mercado Pago" }, 409);

  let sellerToken: string;
  try { sellerToken = await decryptToken(connection.access_token_encrypted, encryptionKey); }
  catch { return json({ error: "A conta Mercado Pago do estabelecimento precisa ser reconectada" }, 409); }

  const items = (order.order_items || []).map((item: any) => ({
    id: item.id,
    title: String(item.product_name).slice(0, 120),
    currency_id: "BRL",
    quantity: Number(item.quantity),
    unit_price: Number(item.unit_price),
  }));
  const itemsTotal = items.reduce((sum: number, item: any) => sum + Number(item.quantity) * Number(item.unit_price), 0);
  const deliveryAmount = Math.max(0, Number(order.total) - itemsTotal);
  if (deliveryAmount > 0) items.push({ id: `delivery-${order.id}`, title: "Taxa de entrega", currency_id: "BRL", quantity: 1, unit_price: Number(deliveryAmount.toFixed(2)) });

  const preference: Record<string, unknown> = {
    items,
    marketplace_fee: Number(order.platform_fee || 0),
    external_reference: order.id,
    statement_descriptor: "PRECO CERTO",
    payer: { email: order.customer_email || user.email },
    metadata: { order_id: order.id, order_number: order.order_number, merchant_id: order.merchant_id },
  };
  if (webhookUrl) preference.notification_url = webhookUrl;
  if (appBaseUrl) {
    preference.back_urls = {
      success: `${appBaseUrl.replace(/\/$/, "")}/meus-pedidos?pagamento=aprovado`,
      pending: `${appBaseUrl.replace(/\/$/, "")}/meus-pedidos?pagamento=pendente`,
      failure: `${appBaseUrl.replace(/\/$/, "")}/meus-pedidos?pagamento=falhou`,
    };
    preference.auto_return = "approved";
  }

  const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: { Authorization: `Bearer ${sellerToken}`, "Content-Type": "application/json", Accept: "application/json", "X-Idempotency-Key": `pc-${order.id}` },
    body: JSON.stringify(preference),
  });
  const result = await mpResponse.json();
  if (!mpResponse.ok || !result?.id) return json({ error: "Não foi possível iniciar o pagamento", detail: result?.message || result?.error }, 502);

  await admin.from("orders").update({ payment_provider: "mercadopago", updated_at: new Date().toISOString() }).eq("id", order.id);
  await admin.from("order_events").insert({
    order_id: order.id,
    event_type: "checkout_created",
    actor_user_id: user.id,
    actor_type: "customer",
    message: "Checkout Mercado Pago iniciado",
    metadata: { preference_id: result.id },
  });

  return json({ preferenceId: result.id, checkoutUrl: result.init_point, sandboxUrl: result.sandbox_init_point || null });
});
