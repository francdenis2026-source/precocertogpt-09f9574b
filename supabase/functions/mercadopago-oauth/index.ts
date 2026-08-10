import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function randomState() {
  return crypto.randomUUID().replaceAll("-", "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const clientId = Deno.env.get("MERCADOPAGO_CLIENT_ID");
  const clientSecret = Deno.env.get("MERCADOPAGO_CLIENT_SECRET");
  const redirectUri = Deno.env.get("MERCADOPAGO_REDIRECT_URI");

  if (!clientId || !clientSecret || !redirectUri) return json({ error: "Mercado Pago não configurado no ambiente." }, 503);

  const authHeader = req.headers.get("Authorization") || "";
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const admin = createClient(supabaseUrl, serviceKey);
  const { data: userData } = await userClient.auth.getUser();
  const user = userData.user;
  if (!user) return json({ error: "Não autenticado" }, 401);

  const body = await req.json().catch(() => ({}));
  const action = body.action as string;
  const merchantId = body.merchantId as string;

  if (!merchantId) return json({ error: "merchantId obrigatório" }, 400);

  const { data: membership } = await admin
    .from("merchant_members")
    .select("role")
    .eq("merchant_id", merchantId)
    .eq("user_id", user.id)
    .eq("active", true)
    .in("role", ["owner", "manager", "finance"])
    .maybeSingle();

  if (!membership) return json({ error: "Sem permissão para configurar pagamentos desta loja." }, 403);

  if (action === "authorize") {
    const state = randomState();
    await admin.from("merchant_payment_connections").upsert({
      merchant_id: merchantId,
      provider: "mercadopago",
      status: "pending",
      metadata: { oauth_state: state, oauth_user_id: user.id, oauth_created_at: new Date().toISOString() },
      updated_at: new Date().toISOString(),
    }, { onConflict: "merchant_id,provider" });

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      platform_id: "mp",
      redirect_uri: redirectUri,
      state,
    });
    return json({ url: `https://auth.mercadopago.com.br/authorization?${params.toString()}` });
  }

  if (action === "callback") {
    const code = body.code as string;
    const state = body.state as string;
    if (!code || !state) return json({ error: "code e state obrigatórios" }, 400);

    const { data: connection } = await admin
      .from("merchant_payment_connections")
      .select("id,metadata")
      .eq("merchant_id", merchantId)
      .eq("provider", "mercadopago")
      .maybeSingle();

    if (!connection || connection.metadata?.oauth_state !== state || connection.metadata?.oauth_user_id !== user.id) {
      return json({ error: "Estado OAuth inválido ou expirado" }, 400);
    }

    const tokenResponse = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, grant_type: "authorization_code", code, redirect_uri: redirectUri }),
    });
    const token = await tokenResponse.json();
    if (!tokenResponse.ok) return json({ error: "Falha ao conectar Mercado Pago", detail: token?.message }, 400);

    // IMPORTANTE: em produção, cifre os tokens com KMS/Vault antes de persistir.
    // Esta Edge Function é o único ponto autorizado a escrevê-los; RLS/revoke impede leitura pelo frontend.
    await admin.from("merchant_payment_connections").update({
      status: "connected",
      provider_user_id: String(token.user_id ?? ""),
      access_token_encrypted: token.access_token,
      refresh_token_encrypted: token.refresh_token ?? null,
      token_expires_at: token.expires_in ? new Date(Date.now() + Number(token.expires_in) * 1000).toISOString() : null,
      scopes: token.scope ?? null,
      connected_at: new Date().toISOString(),
      last_sync_at: new Date().toISOString(),
      metadata: { connected_by: user.id },
      updated_at: new Date().toISOString(),
    }).eq("id", connection.id);

    return json({ ok: true });
  }

  return json({ error: "Ação inválida" }, 400);
});
