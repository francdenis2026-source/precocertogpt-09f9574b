import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const encoder = new TextEncoder();
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, x-signature, x-request-id" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function parseSignature(value: string | null) {
  const result: Record<string, string> = {};
  for (const part of (value || "").split(",")) {
    const [key, val] = part.trim().split("=", 2);
    if (key && val) result[key] = val;
  }
  return result;
}

async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return [...new Uint8Array(signature)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const webhookSecret = Deno.env.get("MERCADOPAGO_WEBHOOK_SECRET");
  if (!serviceKey || !supabaseUrl || !webhookSecret) return json({ error: "Webhook não configurado" }, 503);

  const url = new URL(req.url);
  const body = await req.json().catch(() => ({}));
  const dataId = url.searchParams.get("data.id") || url.searchParams.get("data_id") || String(body?.data?.id || "");
  const requestId = req.headers.get("x-request-id") || "";
  const parts = parseSignature(req.headers.get("x-signature"));
  const ts = parts.ts || "";
  const receivedHash = parts.v1 || "";
  if (!dataId || !requestId || !ts || !receivedHash) return json({ error: "Assinatura incompleta" }, 401);

  // Manifest oficial Mercado Pago: id:[data.id];request-id:[x-request-id];ts:[ts];
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expectedHash = await hmacHex(webhookSecret, manifest);
  if (!safeEqual(expectedHash, receivedHash)) return json({ error: "Assinatura inválida" }, 401);

  // Responde apenas a eventos de pagamento; outros tipos são reconhecidos e ignorados.
  const eventType = body?.type || url.searchParams.get("type");
  if (eventType && eventType !== "payment") return json({ ok: true, ignored: eventType });

  const admin = createClient(supabaseUrl, serviceKey);

  // Localiza uma conexão pelo user_id do vendedor da notificação quando disponível.
  const providerUserId = body?.user_id ? String(body.user_id) : null;
  let connection: any = null;
  if (providerUserId) {
    const { data } = await admin
      .from("merchant_payment_connections")
      .select("merchant_id,access_token_encrypted")
      .eq("provider", "mercadopago")
      .eq("provider_user_id", providerUserId)
      .eq("status", "connected")
      .maybeSingle();
    connection = data;
  }
  if (!connection?.access_token_encrypted) return json({ ok: true, pending_connection_match: true });

  const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(dataId)}`, {
    headers: { Authorization: `Bearer ${connection.access_token_encrypted}`, Accept: "application/json" },
  });
  const payment = await mpResponse.json();
  if (!mpResponse.ok) return json({ error: "Não foi possível consultar pagamento" }, 502);

  const externalReference = payment.external_reference ? String(payment.external_reference) : null;
  let order: any = null;
  if (externalReference) {
    const { data } = await admin
      .from("orders")
      .select("id,merchant_id,status,total")
      .eq("merchant_id", connection.merchant_id)
      .or(`id.eq.${externalReference},order_number.eq.${externalReference}`)
      .maybeSingle();
    order = data;
  }

  if (!order) return json({ ok: true, payment_found: true, order_found: false });

  const mappedStatus = payment.status === "approved" ? "approved" : payment.status === "refunded" ? "refunded" : payment.status === "cancelled" ? "cancelled" : payment.status === "rejected" ? "rejected" : "pending";
  const platformFee = Number(payment.fee_details?.find((fee: any) => fee.type === "application_fee")?.amount || 0);
  const providerFee = Number(payment.fee_details?.filter((fee: any) => fee.type !== "application_fee").reduce((sum: number, fee: any) => sum + Number(fee.amount || 0), 0) || 0);
  const gross = Number(payment.transaction_amount || order.total || 0);

  await admin.from("payments").upsert({
    order_id: order.id,
    merchant_id: order.merchant_id,
    provider: "mercadopago",
    external_payment_id: String(payment.id),
    external_reference: externalReference,
    status: mappedStatus,
    gross_amount: gross,
    provider_fee: providerFee,
    platform_fee: platformFee,
    merchant_net: Math.max(0, gross - providerFee - platformFee),
    payment_method: payment.payment_method_id || payment.payment_type_id || null,
    payload: { status_detail: payment.status_detail, live_mode: payment.live_mode },
    approved_at: payment.date_approved || null,
    refunded_at: mappedStatus === "refunded" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "provider,external_payment_id" });

  const orderPaymentStatus = mappedStatus === "approved" ? "approved" : mappedStatus;
  const orderStatus = mappedStatus === "approved" && order.status === "pending_payment" ? "paid" : order.status;
  await admin.from("orders").update({ payment_status: orderPaymentStatus, payment_provider: "mercadopago", status: orderStatus, updated_at: new Date().toISOString() }).eq("id", order.id);

  await admin.from("order_events").insert({
    order_id: order.id,
    event_type: "payment_webhook",
    status: orderStatus,
    actor_type: "payment",
    message: `Pagamento Mercado Pago: ${mappedStatus}`,
    metadata: { external_payment_id: String(payment.id), payment_status: mappedStatus },
  });

  return json({ ok: true });
});
