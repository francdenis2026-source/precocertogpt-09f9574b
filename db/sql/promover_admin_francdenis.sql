-- ===========================================================================
-- PreçoCerto — promover o administrador da plataforma.
-- Execute no SQL Editor do SEU projeto Supabase (banco próprio, externo).
-- Requisito: rodar antes o arquivo db/sql/fase0_roles_auditoria_denuncias.sql
-- ===========================================================================

-- 1) Confirmar o e-mail do usuário (caso a confirmação por e-mail esteja ativa)
update auth.users
   set email_confirmed_at = coalesce(email_confirmed_at, now())
 where email = 'francdenisbr@gmail.com';

-- 2) Conceder o papel de administrador (papéis NUNCA ficam em profiles/users)
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
  from auth.users
 where email = 'francdenisbr@gmail.com'
on conflict (user_id, role) do nothing;

-- 3) Conferir o resultado
select u.email, r.role
  from public.user_roles r
  join auth.users u on u.id = r.user_id
 where u.email = 'francdenisbr@gmail.com';
