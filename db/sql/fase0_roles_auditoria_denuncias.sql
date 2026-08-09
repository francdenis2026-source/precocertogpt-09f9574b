-- ===========================================================================
-- PreçoCerto — Fase 0/1: papéis seguros, auditoria e denúncia de preço.
-- Execute no SQL Editor do SEU projeto Supabase (banco próprio, externo).
-- Nenhuma tabela existente é apagada ou recriada: tudo é idempotente.
-- ===========================================================================

-- 1) Enum de papéis -------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum (
      'super_admin', 'admin', 'moderator', 'merchant_owner', 'merchant_staff', 'consumer'
    );
  end if;
end $$;

-- 2) Papéis por usuário (NUNCA em profiles/users) -------------------------
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

-- 3) Verificação autoritativa de papel (SECURITY DEFINER evita recursão) --
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

create or replace function public.is_platform_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role in ('super_admin', 'admin', 'moderator')
  );
$$;

drop policy if exists "usuario le os proprios papeis" on public.user_roles;
create policy "usuario le os proprios papeis"
on public.user_roles for select to authenticated
using (user_id = auth.uid() or public.is_platform_admin(auth.uid()));

drop policy if exists "admin gerencia papeis" on public.user_roles;
create policy "admin gerencia papeis"
on public.user_roles for all to authenticated
using (public.has_role(auth.uid(), 'super_admin') or public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'super_admin') or public.has_role(auth.uid(), 'admin'));

-- 4) Auditoria de operações sensíveis ------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text,
  entity_id text,
  severity text not null default 'info',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

grant select, insert on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;

alter table public.audit_logs enable row level security;

drop policy if exists "admin le auditoria" on public.audit_logs;
create policy "admin le auditoria"
on public.audit_logs for select to authenticated
using (public.is_platform_admin(auth.uid()));

drop policy if exists "usuario registra auditoria propria" on public.audit_logs;
create policy "usuario registra auditoria propria"
on public.audit_logs for insert to authenticated
with check (actor_id = auth.uid());

-- 5) Denúncia de preço incorreto (Fase 1) --------------------------------
create table if not exists public.price_reports (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  establishment_id text,
  reported_price numeric(12,2),
  reason text not null,
  comment text,
  reporter_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null
);

grant insert on public.price_reports to anon;
grant select, insert on public.price_reports to authenticated;
grant all on public.price_reports to service_role;

alter table public.price_reports enable row level security;

drop policy if exists "qualquer pessoa informa preco incorreto" on public.price_reports;
create policy "qualquer pessoa informa preco incorreto"
on public.price_reports for insert to anon, authenticated
with check (true);

drop policy if exists "autor e moderacao leem denuncias" on public.price_reports;
create policy "autor e moderacao leem denuncias"
on public.price_reports for select to authenticated
using (reporter_id = auth.uid() or public.is_platform_admin(auth.uid()));

drop policy if exists "moderacao atualiza denuncias" on public.price_reports;
create policy "moderacao atualiza denuncias"
on public.price_reports for update to authenticated
using (public.is_platform_admin(auth.uid()))
with check (public.is_platform_admin(auth.uid()));

create index if not exists price_reports_status_idx on public.price_reports (status, created_at desc);

-- 6) Promover o administrador da plataforma ------------------------------
-- Crie o usuário em Authentication > Users e rode (ajuste o e-mail):
-- insert into public.user_roles (user_id, role)
-- select id, 'admin'::public.app_role from auth.users where email = 'seu-email@dominio.com'
-- on conflict (user_id, role) do nothing;
