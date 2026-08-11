// Papéis e permissões do PreçoCerto.
// REGRA DE SEGURANÇA: a autorização real é verificada no backend (RLS + função
// SECURITY DEFINER `has_role`). Nada em localStorage concede acesso administrativo.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://kqueiohjadwzxafdrrxk.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;


export type AppRole =
  | "super_admin"
  | "admin"
  | "moderator"
  | "merchant_owner"
  | "merchant_staff"
  | "consumer";

export const roleLabels: Record<AppRole, string> = {
  super_admin: "Superadministrador",
  admin: "Administrador",
  moderator: "Moderador",
  merchant_owner: "Responsável por estabelecimento",
  merchant_staff: "Equipe do estabelecimento",
  consumer: "Consumidor",
};

/** Papéis com acesso ao painel administrativo. */
export const adminRoles: AppRole[] = ["super_admin", "admin", "moderator"];

export type SessionProfile = {
  userId: string;
  email: string | null;
  name: string;
  roles: AppRole[];
  isAdmin: boolean;
};

/** Lê a sessão atual e consulta os papéis no banco (nunca no cliente). */
export async function loadSessionProfile(): Promise<SessionProfile | null> {
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return null;

  let roles: AppRole[] = [];
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (!error && data) roles = data.map(row => row.role as AppRole);

  return {
    userId: user.id,
    email: user.email ?? null,
    name: (user.user_metadata?.name as string) || user.email?.split("@")[0] || "Consumidor",
    roles,
    isAdmin: roles.some(role => adminRoles.includes(role)),
  };
}

/** Verificação autoritativa no backend: `public.has_role(auth.uid(), role)`. */
export async function hasRole(role: AppRole): Promise<boolean> {
  if (!supabase) return false;
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return false;

  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: role });
  if (error) return false;
  return data === true;
}

export async function signIn(email: string, password: string) {
  if (!supabase) return { error: "Autenticação indisponível: banco não configurado." };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signInMerchantWithCpf(cpf:string,pin:string){
  if(!supabase)return{error:"Autenticação indisponível: banco não configurado."};
  const {data,error}=await supabase.functions.invoke("merchant-cpf-login",{body:{cpf,pin}});
  if(error||!data?.access_token||!data?.refresh_token)return{error:data?.error??error?.message??"CPF ou PIN incorretos."};
  const {error:sessionError}=await supabase.auth.setSession({access_token:data.access_token,refresh_token:data.refresh_token});
  return{error:sessionError?.message??null};
}

export async function signUp(email: string, password: string, name: string) {
  if (!supabase) return { error: "Cadastro indisponível: banco não configurado." };
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  return { error: error?.message ?? null };
}

export async function requestPasswordReset(email: string) {
  if (!supabase) return { error: "Recuperação indisponível: banco não configurado." };
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/redefinir-senha`,
  });
  return { error: error?.message ?? null };
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
}
