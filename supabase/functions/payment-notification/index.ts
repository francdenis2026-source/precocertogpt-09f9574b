// Envia o aviso por e-mail quando um pagamento PIX é aprovado ou falha.
// Se nenhum provedor de e-mail estiver configurado, responde 200 com skipped=true
// para que o app continue exibindo apenas a notificação interna.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authHeader = req.headers.get("Authorization") || "";
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: userData } = await userClient.auth.getUser();
  if (!userData.user) return json({ error: "Faça login para receber notificações" }, 401);

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim();
  const title = String(body.title || "Atualização do seu pagamento").slice(0, 120);
  const message = String(body.message || "").slice(0, 500);
  const orderId = String(body.orderId || "");
  if (!email || !message || !orderId) return json({ error: "email, orderId e message são obrigatórios" }, 400);

  // Garante que o pedido pertence a quem está autenticado (RLS já filtra por customer_id).
  const { data: order } = await userClient.from("orders").select("id").eq("id", orderId).maybeSingle();
  if (!order) return json({ error: "Pedido não encontrado" }, 404);

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromAddress = Deno.env.get("PAYMENT_NOTIFICATION_FROM");
  if (!resendKey || !fromAddress) {
    console.info(`[PIX-EMAIL-SKIPPED] order=${orderId} (provedor de e-mail não configurado)`);
    return json({ ok: true, skipped: true, reason: "email_provider_not_configured" });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: fromAddress,
      to: [email],
      subject: title,
      html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6"><h2 style="margin:0 0 12px">${title}</h2><p>${message}</p><p style="color:#6b7280;font-size:13px">Preço Certo · notificação automática de pagamento.</p></div>`,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error(`[PIX-EMAIL-ERROR] order=${orderId} status=${response.status}: ${detail}`);
    return json({ error: "Não foi possível enviar o e-mail", status: response.status, detail }, response.status);
  }

  return json({ ok: true, sent: true });
});
