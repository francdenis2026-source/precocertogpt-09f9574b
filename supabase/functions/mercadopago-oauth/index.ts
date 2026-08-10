import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const encoder = new TextEncoder();

function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
function bytesToB64(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)); }
function b64ToBytes(value: string) { return Uint8Array.from(atob(value), c => c.charCodeAt(0)); }
function randomBytes(size = 32) { const b = new Uint8Array(size); crypto.getRandomValues(b); return b; }
async function sha256(value: string) { return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))); }
async function importEncryptionKey(secret: string) {
  const raw = b64ToBytes(secret);
  if (raw.length !== 32) throw new Error("MERCADOPAGO_TOKEN_ENCRYPTION_KEY deve ter 32 bytes em base64");
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt"]);
}
async function encryptToken(value: string | null | undefined, secret: string) {
  if (!value) return null;
  const key = await importEncryptionKey(secret);
  const iv = randomBytes(12);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(value)));
  return `v1:${bytesToB64(iv)}:${bytesToB64(cipher)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const clientId = Deno.env.get("MERCADOPAGO_CLIENT_ID");
  const clientSecret = Deno.env.get("MERCADOPAGO_CLIENT_SECRET");
  const redirectUri = Deno.env.get("MERCADOPAGO_REDIRECT_URI");
  const encryptionKey = Deno.env.get("MERCADOPAGO_TOKEN_ENCRYPTION_KEY");
  if (!clientId || !clientSecret || !redirectUri || !encryptionKey) return json({ error: "Mercado Pago não configurado no ambiente." }, 503);

  const authHeader = req.headers.get("Authorization") || "";
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const admin = createClient(supabaseUrl, serviceKey);
  const { data: userData } = await userClient.auth.getUser();
  const user = userData.user;
  if (!user) return json({ error: "Não autenticado" }, 401);

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || "");
  const merchantId = String(body.merchantId || "");
  if (!merchantId) return json({ error: "merchantId obrigatório" }, 400);

  const { data: membership } = await admin.from("merchant_members").select("role").eq("merchant_id", merchantId).eq("user_id", user.id).eq("active", true).in("role", ["owner", "manager", "finance"]).maybeSingle();
  if (!membership) return json({ error: "Sem permissão para configurar pagamentos desta loja." }, 403);

  if (action === "authorize") {
    const state = base64url(randomBytes(24));
    const verifier = base64url(randomBytes(48));
    const challenge = base64url(await sha256(verifier));
    const now = new Date();
    await admin.from("merchant_payment_connections").upsert({
      merchant_id: merchantId,
      provider: "mercadopago",
      status: "pending",
      metadata: { oauth_state: state, oauth_user_id: user.id, oauth_created_at: now.toISOString(), pkce_verifier: verifier },
      updated_at: now.toISOString(),
    }, { onConflict: "merchant_id,provider" });

    const params = new URLSearchParams({ client_id: clientId, response_type: "code", platform_id: "mp", redirect_uri: redirectUri, state, code_challenge: challenge, code_challenge_method: "S256" });
    return json({ url: `https://auth.mercadopago.com.br/authorization?${params.toString()}` });
  }

  if (action === "callback") {
    const code = String(body.code || "");
    const state = String(body.state || "");
    if (!code || !state) return json({ error: "code e state obrigatórios" }, 400);

    const { data: connection } = await admin.from("merchant_payment_connections").select("id,metadata").eq("merchant_id", merchantId).eq("provider", "mercadopago").maybeSingle();
    const metadata = connection?.metadata as Record<string, unknown> | undefined;
    const createdAt = metadata?.oauth_created_at ? Date.parse(String(metadata.oauth_created_at)) : 0;
    const stateExpired = !createdAt || Date.now() - createdAt > 10 * 60 * 1000;
    if (!connection || metadata?.oauth_state !== state || metadata?.oauth_user_id !== user.id || stateExpired) return json({ error: "Estado OAuth inválido ou expirado" }, 400);

    const form = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "authorization_code", code, redirect_uri: redirectUri, state });
    if (metadata?.pkce_verifier) form.set("code_verifier", String(metadata.pkce_verifier));
    const tokenResponse = await fetch("https://api.mercadopago.com/oauth/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" }, body: form });
    const token = await tokenResponse.json();
    if (!tokenResponse.ok || !token?.access_token) return json({ error: "Falha ao conectar Mercado Pago", detail: token?.message || token?.error }, 400);

    const now = new Date();
    await admin.from("merchant_payment_connections").update({
      status: "connected",
      provider_user_id: String(token.user_id ?? ""),
      access_token_encrypted: await encryptToken(token.access_token, encryptionKey),
      refresh_token_encrypted: await encryptToken(token.refresh_token, encryptionKey),
      token_expires_at: token.expires_in ? new Date(Date.now() + Number(token.expires_in) * 1000).toISOString() : null,
      scopes: token.scope ?? null,
      connected_at: now.toISOString(),
      last_sync_at: now.toISOString(),
      metadata: { connected_by: user.id, live_mode: Boolean(token.live_mode) },
      updated_at: now.toISOString(),
    }).eq("id", connection.id);
    return json({ ok: true });
  }

  return json({ error: "Ação inválida" }, 400);
});
