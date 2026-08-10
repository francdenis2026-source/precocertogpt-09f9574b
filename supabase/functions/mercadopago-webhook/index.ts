import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, x-signature, x-request-id" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function parseSignature(value: string | null) {
  const result: Record<string, string> = {};
  for (const part of (value || "").split(",")) { const [key, val] = part.trim().split("=", 2); if (key && val) result[key] = val; }
  return result;
}
function b64ToBytes(value: string) { return Uint8Array.from(atob(value), c => c.charCodeAt(0)); }
async function importEncryptionKey(secret: string) {
  const raw = b64ToBytes(secret);
  if (raw.length !== 32) throw new Error("MERCADOPAGO_TOKEN_ENCRYPTION_KEY inválida");
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]);
}
async function decryptToken(value: string, secret: string) {
  const [version, ivB64, cipherB64] = value.split(":");
  if (version !== "v1" || !ivB64 || !cipherB64) throw new Error("Token armazenado em formato inseguro ou desconhecido");
  const key = await importEncryptionKey(secret);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToBytes(ivB64) }, key, b64ToBytes(cipherB64));
  return decoder.decode(plain);
}
async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return [...new Uint8Array(signature)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0; for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i); return result === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const webhookSecret = Deno.env.get("MERCADOPAGO_WEBHOOK_SECRET");
  const encryptionKey = Deno.env.get("MERCADOPAGO_TOKEN_ENCRYPTION_KEY");
  if (!serviceKey || !supabaseUrl || !webhookSecret || !encryptionKey) return json({ error: "Webhook não configurado" }, 503);

  const url = new URL(req.url);
  const body = await req.json().catch(() => ({}));
  const dataId = url.searchParams.get("data.id") || url.searchParams.get("data_id") || String(body?.data?.id || "");
  const requestId = req.headers.get("x-request-id") || "";
  const parts = parseSignature(req.headers.get("x-signature"));
  const ts = parts.ts || "";
  const receivedHash = parts.v1 || "";
  if (!dataId || !requestId || !ts || !receivedHash) return json({ error: "Assinatura incompleta" }, 401);

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expectedHash = await hmacHex(webhookSecret, manifest);
  if (!safeEqual(expectedHash, receivedHash)) return json({ error: "Assinatura inválida" }, 401);

  const eventType = body?.type || url.searchParams.get("type");
  if (eventType && eventType !== "payment") return json({ ok: true, ignored: eventType });

  const admin = createClient(supabaseUrl, serviceKey);
  const providerUserId = body?.user_id ? String(body.user_id) : null;
  if (!providerUserId) return json({ ok: true, missing_seller: true });

  const { data: connection } = await admin.from("merchant_payment_connections").select("merchant_id,access_token_encrypted").eq("provider", "mercadopago").eq("provider_user_id", providerUserId).eq("status", "connected").maybeSingle();
  if (!connection?.access_token_encrypted) return json({ ok: true, pending_connection_match: true });

  let sellerToken: string;
  try { sellerToken = await decryptToken(connection.access_token_encrypted, encryptionKey); }
  catch { return json({ error: "Credencial do vendedor precisa ser reconectada" }, 409); }

  const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(dataId)}`, { headers: { Authorization: `Bearer ${sellerToken}`, Accept: "application/json" } });
  const payment = await mpResponse.json();
  if (!mpResponse.ok) return json({ error: "Não foi possível consultar pagamento" }, 502);

  const externalReference = payment.external_reference ? String(payment.external_reference) : null;
  if (!externalReference) return json({ ok: true, payment_found: true, order_found: false });

  const { data: order } = await admin.from("orders").select("id,merchant_id,total").eq("merchant_id", connection.merchant_id).or(`id.eq.${externalReference},order_number.eq.${externalReference}`).maybeSingle();
  if (!order) return json({ ok: true, payment_found: true, order_found: false });

  const mappedStatus = payment.status === "approved" ? "approved" : payment.status === "refunded" ? "refunded" : payment.status === "cancelled" ? "cancelled" : payment.status === "rejected" ? "rejected" : "pending";
  const providerFee = Number(payment.fee_details?.filter((fee: any) => fee.type !== "application_fee").reduce((sum: number, fee: any) => sum + Number(fee.amount || 0), 0) || 0);
  const gross = Number(payment.transaction_amount || order.total || 0);

  const { error: confirmError } = await admin.rpc("confirm_marketplace_payment", {
    _order_id: order.id,
    _provider: "mercadopago",
    _external_payment_id: String(payment.id),
    _status: mappedStatus,
    _gross_amount: gross,
    _provider_fee: providerFee,
    _payment_method: payment.payment_method_id || payment.payment_type_id || null,
    _payload: { status_detail: payment.status_detail, live_mode: payment.live_mode, date_approved: payment.date_approved },
  });
  if (confirmError) return json({ error: "Falha ao conciliar pagamento" }, 500);

  await admin.from("order_events").insert({ order_id: order.id, event_type: "payment_webhook", actor_type: "payment", message: `Pagamento Mercado Pago: ${mappedStatus}`, metadata: { external_payment_id: String(payment.id), payment_status: mappedStatus } });
  return json({ ok: true });
});
