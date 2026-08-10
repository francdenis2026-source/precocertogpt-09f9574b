-- ===========================================================================
-- PreçoCerto — Solicitações públicas: contato e cadastro de comércio.
-- Execute no SQL Editor do projeto Supabase.
-- Idempotente: não apaga dados existentes.
-- ===========================================================================

-- 1) Mensagens de contato --------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  subject text not null,
  message text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null
);

grant insert on public.contact_messages to anon;
grant select, insert on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;

alter table public.contact_messages enable row level security;

drop policy if exists "qualquer pessoa envia contato" on public.contact_messages;
create policy "qualquer pessoa envia contato"
on public.contact_messages for insert to anon, authenticated
with check (
  char_length(trim(name)) between 2 and 120
  and char_length(trim(contact)) between 3 and 180
  and char_length(trim(subject)) between 2 and 120
  and char_length(trim(message)) between 5 and 4000
);

drop policy if exists "admin le contatos" on public.contact_messages;
create policy "admin le contatos"
on public.contact_messages for select to authenticated
using (public.is_platform_admin(auth.uid()));

drop policy if exists "admin atualiza contatos" on public.contact_messages;
create policy "admin atualiza contatos"
on public.contact_messages for update to authenticated
using (public.is_platform_admin(auth.uid()))
with check (public.is_platform_admin(auth.uid()));

create index if not exists contact_messages_status_idx
on public.contact_messages (status, created_at desc);

-- 2) Solicitações de cadastro de comércio ---------------------------------
-- O formulário público NÃO grava diretamente em establishments.
-- A solicitação entra em fila e pode ser aprovada pela administração.
create table if not exists public.merchant_applications (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  neighborhood text not null,
  kind text not null default 'market',
  owner_name text,
  phone text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  approved_establishment_id uuid
);

grant insert on public.merchant_applications to anon;
grant select, insert on public.merchant_applications to authenticated;
grant all on public.merchant_applications to service_role;

alter table public.merchant_applications enable row level security;

drop policy if exists "qualquer pessoa solicita cadastro de comercio" on public.merchant_applications;
create policy "qualquer pessoa solicita cadastro de comercio"
on public.merchant_applications for insert to anon, authenticated
with check (
  char_length(trim(business_name)) between 2 and 160
  and char_length(trim(neighborhood)) between 2 and 120
  and kind in ('market', 'butcher', 'pharmacy', 'other')
  and (owner_name is null or char_length(trim(owner_name)) <= 160)
  and (phone is null or char_length(trim(phone)) <= 40)
);

drop policy if exists "admin le solicitacoes de comercio" on public.merchant_applications;
create policy "admin le solicitacoes de comercio"
on public.merchant_applications for select to authenticated
using (public.is_platform_admin(auth.uid()));

drop policy if exists "admin atualiza solicitacoes de comercio" on public.merchant_applications;
create policy "admin atualiza solicitacoes de comercio"
on public.merchant_applications for update to authenticated
using (public.is_platform_admin(auth.uid()))
with check (public.is_platform_admin(auth.uid()));

create index if not exists merchant_applications_status_idx
on public.merchant_applications (status, created_at desc);
