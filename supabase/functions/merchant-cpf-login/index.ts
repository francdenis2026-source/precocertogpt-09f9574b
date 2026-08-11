import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

async function alias(cpf: string) {
  const bytes = new TextEncoder().encode(`precocerto-owner:${cpf}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return `u-${Array.from(new Uint8Array(hash))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")}@login.precocerto.com.br`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  
  try {
    if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);
    
    const body = await req.json().catch(() => ({}));
    const cpf = String(body.cpf || "").replace(/\D/g, "");
    const pin = String(body.pin || "");
    
    if (cpf.length !== 11) {
      return json({ error: "CPF inválido. Use 11 dígitos." }, 400);
    }
    
    // Suportamos PIN de 4 a 6 dígitos para maior flexibilidade
    if (!/^[0-9]{4,6}$/.test(pin)) {
      return json({ error: "PIN inválido. Use entre 4 e 6 números." }, 400);
    }
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Variáveis de ambiente do Supabase ausentes na Edge Function");
      return json({ error: "Configuração do servidor incompleta." }, 500);
    }
    
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    
    const email = await alias(cpf);
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password: pin,
    });
    
    if (error || !data.session) {
      console.log(`Falha de login para CPF ${cpf}: ${error?.message}`);
      return json({ 
        error: "Acesso empresarial não encontrado ou PIN incorreto. Verifique seus dados ou contate o administrador." 
      }, 401);
    }
    
    return json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
    });
  } catch (err) {
    console.error("Erro interno na Edge Function:", err);
    return json({ error: "Erro interno ao processar login." }, 500);
  }
});
