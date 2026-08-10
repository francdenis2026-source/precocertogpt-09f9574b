-- Preço Certo · Plataforma comercial multiestabelecimento
-- Catálogo por loja, equipe, pedidos, entrega, pagamentos, assinaturas,
-- faturamento agregado e auditoria com isolamento por RLS.

create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  document text,
  phone text,
  email text,
  address jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','active','suspended','blocked')),
  plan_code text not null default 'essential',
  delivery_enabled boolean not null default false,
  pickup_enabled boolean not null default true,
  min_order numeric(12,2) not null default 0 check (min_order >= 0),
  opening_hours jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.merchant_members (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'orders' check (role in ('owner','manager','orders','stock','finance')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (merchant_id, user_id)
);

create table if not exists public.merchant_products (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  product_id uuid,
  product_slug text,
  product_name text not null,
  image_url text,
  price numeric(12,2) not null default 0 check (price >= 0),
  promotional_price numeric(12,2) check (promotional_price is null or promotional_price >= 0),
  stock_quantity numeric(12,3) not null default 0 check (stock_quantity >= 0),
  low_stock_threshold numeric(12,3) not null default 5 check (low_stock_threshold >= 0),
  active boolean not null default true,
  available boolean not null default true,
  max_per_order numeric(12,3) check (max_per_order is null or max_per_order > 0),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (merchant_id, product_slug)
);

create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  name text not null,
  neighborhood text,
  fee numeric(12,2) not null default 0 check (fee >= 0),
  free_above numeric(12,2) check (free_above is null or free_above >= 0),
  minimum_order numeric(12,2) not null default 0 check (minimum_order >= 0),
  estimated_min_minutes integer not null default 30 check (estimated_min_minutes >= 0),
  estimated_max_minutes integer not null default 60 check (estimated_max_minutes >= estimated_min_minutes),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('PC-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  merchant_id uuid not null references public.merchants(id),
  customer_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  delivery_address jsonb,
  delivery_type text not null default 'delivery' check (delivery_type in ('delivery','pickup')),
  delivery_zone_id uuid references public.delivery_zones(id) on delete set null,
  status text not null default 'pending_payment' check (status in ('pending_payment','paid','accepted','preparing','ready','out_for_delivery','delivered','cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending','approved','rejected','refunded','cancelled')),
  payment_provider text,
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  platform_fee numeric(12,2) not null default 0 check (platform_fee >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  notes text,
  accepted_at timestamptz,
  preparing_at timestamptz,
  ready_at timestamptz,
  dispatched_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid,
  merchant_product_id uuid references public.merchant_products(id) on delete set null,
  product_name text not null,
  image_url text,
  quantity numeric(12,3) not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  total_price numeric(12,2) not null check (total_price >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_type text not null,
  status text,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_type text not null default 'system' check (actor_type in ('customer','merchant','admin','system','payment','delivery')),
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.merchant_payment_connections (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  provider text not null,
  provider_user_id text,
  status text not null default 'disconnected' check (status in ('disconnected','pending','connected','error','revoked')),
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  scopes text,
  connected_at timestamptz,
  last_sync_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (merchant_id, provider)
);

comment on column public.merchant_payment_connections.access_token_encrypted is 'Backend only. Nunca expor no Data API para o frontend.';
comment on column public.merchant_payment_connections.refresh_token_encrypted is 'Backend only. Nunca expor no Data API para o frontend.';

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id),
  provider text not null,
  external_payment_id text,
  external_reference text,
  status text not null default 'pending',
  gross_amount numeric(12,2) not null default 0 check (gross_amount >= 0),
  provider_fee numeric(12,2) not null default 0 check (provider_fee >= 0),
  platform_fee numeric(12,2) not null default 0 check (platform_fee >= 0),
  merchant_net numeric(12,2) not null default 0,
  payment_method text,
  payload jsonb not null default '{}'::jsonb,
  approved_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, external_payment_id)
);

create table if not exists public.merchant_subscriptions (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  plan_code text not null,
  status text not null default 'pending' check (status in ('trial','pending','paid','past_due','cancelled')),
  amount numeric(12,2) not null default 0 check (amount >= 0),
  period_start date,
  period_end date,
  due_at timestamptz,
  paid_at timestamptz,
  provider text,
  external_subscription_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_audit_log (
  id bigserial primary key,
  merchant_id uuid references public.merchants(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists merchant_members_user_idx on public.merchant_members(user_id, active);
create index if not exists merchant_products_store_idx on public.merchant_products(merchant_id, active, available);
create index if not exists orders_merchant_created_idx on public.orders(merchant_id, created_at desc);
create index if not exists orders_customer_created_idx on public.orders(customer_id, created_at desc);
create index if not exists orders_status_idx on public.orders(merchant_id, status, created_at desc);
create index if not exists payments_merchant_created_idx on public.payments(merchant_id, created_at desc);
create index if not exists order_events_order_idx on public.order_events(order_id, created_at);
create index if not exists subscriptions_merchant_idx on public.merchant_subscriptions(merchant_id, created_at desc);

create or replace function private.is_merchant_member(_merchant_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists(
    select 1 from public.merchant_members mm
    where mm.merchant_id = _merchant_id
      and mm.user_id = (select auth.uid())
      and mm.active = true
  );
$$;

create or replace function private.merchant_member_role(_merchant_id uuid)
returns text
language sql stable security definer
set search_path = ''
as $$
  select mm.role from public.merchant_members mm
  where mm.merchant_id = _merchant_id
    and mm.user_id = (select auth.uid())
    and mm.active = true
  order by case mm.role when 'owner' then 1 when 'manager' then 2 else 3 end
  limit 1;
$$;

create or replace function private.is_platform_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists(
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role::text in ('super_admin','admin','moderator')
  );
$$;

revoke all on function private.is_merchant_member(uuid) from public, anon;
revoke all on function private.merchant_member_role(uuid) from public, anon;
revoke all on function private.is_platform_admin() from public, anon;
grant execute on function private.is_merchant_member(uuid) to authenticated;
grant execute on function private.merchant_member_role(uuid) to authenticated;
grant execute on function private.is_platform_admin() to authenticated;

create or replace function private.touch_order_status_times()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  if new.status is distinct from old.status then
    if new.status = 'accepted' and new.accepted_at is null then new.accepted_at = now(); end if;
    if new.status = 'preparing' and new.preparing_at is null then new.preparing_at = now(); end if;
    if new.status = 'ready' and new.ready_at is null then new.ready_at = now(); end if;
    if new.status = 'out_for_delivery' and new.dispatched_at is null then new.dispatched_at = now(); end if;
    if new.status = 'delivered' and new.delivered_at is null then new.delivered_at = now(); end if;
    if new.status = 'cancelled' and new.cancelled_at is null then new.cancelled_at = now(); end if;
  end if;
  return new;
end;
$$;

create or replace function private.log_order_status_event()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_events(order_id,event_type,status,actor_user_id,actor_type,message)
    values(new.id,'order_created',new.status,(select auth.uid()),case when (select auth.uid())=new.customer_id then 'customer' else 'system' end,'Pedido criado');
  elsif new.status is distinct from old.status then
    insert into public.order_events(order_id,event_type,status,actor_user_id,actor_type,message)
    values(
      new.id,'status_changed',new.status,(select auth.uid()),
      case when private.is_merchant_member(new.merchant_id) then 'merchant' when (select auth.uid())=new.customer_id then 'customer' else 'system' end,
      'Status atualizado para ' || new.status
    );
  end if;
  return new;
end;
$$;

revoke all on function private.touch_order_status_times() from public, anon, authenticated;
revoke all on function private.log_order_status_event() from public, anon, authenticated;

drop trigger if exists trg_touch_order_status_times on public.orders;
create trigger trg_touch_order_status_times before update on public.orders for each row execute function private.touch_order_status_times();
drop trigger if exists trg_log_order_event on public.orders;
create trigger trg_log_order_event after insert or update on public.orders for each row execute function private.log_order_status_event();

alter table public.merchants enable row level security;
alter table public.merchant_members enable row level security;
alter table public.merchant_products enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.merchant_payment_connections enable row level security;
alter table public.payments enable row level security;
alter table public.merchant_subscriptions enable row level security;
alter table public.platform_audit_log enable row level security;

-- Data API grants. RLS continua sendo a autorização de linha.
grant select on public.merchants, public.merchant_products, public.delivery_zones to anon;
grant select, insert, update, delete on public.merchants, public.merchant_members, public.merchant_products, public.delivery_zones to authenticated;
grant select, insert, update on public.orders to authenticated;
grant select, insert on public.order_items to authenticated;
grant select on public.order_events, public.payments to authenticated;
grant select, insert, update, delete on public.merchant_subscriptions to authenticated;
grant select on public.platform_audit_log to authenticated;
-- Segredos de gateway não são expostos a anon/authenticated.
revoke all on public.merchant_payment_connections from public, anon, authenticated;

-- Lojas: público lê ativas; membros leem a própria; administração gerencia cadastro.
drop policy if exists merchants_anon_read on public.merchants;
create policy merchants_anon_read on public.merchants for select to anon using (status='active');
drop policy if exists merchants_authenticated_read on public.merchants;
create policy merchants_authenticated_read on public.merchants for select to authenticated
using (status='active' or private.is_merchant_member(id) or private.is_platform_admin());
drop policy if exists merchants_admin_all on public.merchants;
create policy merchants_admin_all on public.merchants for all to authenticated
using (private.is_platform_admin()) with check (private.is_platform_admin());
drop policy if exists merchants_owner_update on public.merchants;
create policy merchants_owner_update on public.merchants for update to authenticated
using (private.merchant_member_role(id) in ('owner','manager'))
with check (private.merchant_member_role(id) in ('owner','manager'));

-- Equipe: administração da plataforma não entra na gestão operacional da equipe.
drop policy if exists merchant_members_read on public.merchant_members;
create policy merchant_members_read on public.merchant_members for select to authenticated
using (user_id=(select auth.uid()) or private.is_merchant_member(merchant_id));
drop policy if exists merchant_members_owner_insert on public.merchant_members;
create policy merchant_members_owner_insert on public.merchant_members for insert to authenticated
with check (private.merchant_member_role(merchant_id)='owner');
drop policy if exists merchant_members_owner_update on public.merchant_members;
create policy merchant_members_owner_update on public.merchant_members for update to authenticated
using (private.merchant_member_role(merchant_id)='owner')
with check (private.merchant_member_role(merchant_id)='owner');
drop policy if exists merchant_members_owner_delete on public.merchant_members;
create policy merchant_members_owner_delete on public.merchant_members for delete to authenticated
using (private.merchant_member_role(merchant_id)='owner');

-- Catálogo e entrega.
drop policy if exists merchant_products_anon_read on public.merchant_products;
create policy merchant_products_anon_read on public.merchant_products for select to anon using (active and available);
drop policy if exists merchant_products_authenticated_read on public.merchant_products;
create policy merchant_products_authenticated_read on public.merchant_products for select to authenticated
using ((active and available) or private.is_merchant_member(merchant_id));
drop policy if exists merchant_products_member_insert on public.merchant_products;
create policy merchant_products_member_insert on public.merchant_products for insert to authenticated
with check (private.is_merchant_member(merchant_id));
drop policy if exists merchant_products_member_update on public.merchant_products;
create policy merchant_products_member_update on public.merchant_products for update to authenticated
using (private.is_merchant_member(merchant_id)) with check (private.is_merchant_member(merchant_id));
drop policy if exists merchant_products_member_delete on public.merchant_products;
create policy merchant_products_member_delete on public.merchant_products for delete to authenticated
using (private.merchant_member_role(merchant_id) in ('owner','manager'));

drop policy if exists delivery_zones_anon_read on public.delivery_zones;
create policy delivery_zones_anon_read on public.delivery_zones for select to anon using (active);
drop policy if exists delivery_zones_authenticated_read on public.delivery_zones;
create policy delivery_zones_authenticated_read on public.delivery_zones for select to authenticated
using (active or private.is_merchant_member(merchant_id));
drop policy if exists delivery_zones_member_insert on public.delivery_zones;
create policy delivery_zones_member_insert on public.delivery_zones for insert to authenticated
with check (private.merchant_member_role(merchant_id) in ('owner','manager'));
drop policy if exists delivery_zones_member_update on public.delivery_zones;
create policy delivery_zones_member_update on public.delivery_zones for update to authenticated
using (private.merchant_member_role(merchant_id) in ('owner','manager'))
with check (private.merchant_member_role(merchant_id) in ('owner','manager'));
drop policy if exists delivery_zones_member_delete on public.delivery_zones;
create policy delivery_zones_member_delete on public.delivery_zones for delete to authenticated
using (private.merchant_member_role(merchant_id) in ('owner','manager'));

-- Pedidos: cliente vê os próprios; loja vê apenas os dela. Admin não recebe SELECT linha a linha.
drop policy if exists orders_customer_read on public.orders;
create policy orders_customer_read on public.orders for select to authenticated using (customer_id=(select auth.uid()));
drop policy if exists orders_merchant_read on public.orders;
create policy orders_merchant_read on public.orders for select to authenticated using (private.is_merchant_member(merchant_id));
drop policy if exists orders_customer_insert on public.orders;
create policy orders_customer_insert on public.orders for insert to authenticated with check (customer_id=(select auth.uid()));
drop policy if exists orders_merchant_update on public.orders;
create policy orders_merchant_update on public.orders for update to authenticated
using (private.is_merchant_member(merchant_id)) with check (private.is_merchant_member(merchant_id));

-- Itens e eventos herdam a visibilidade do pedido.
drop policy if exists order_items_read on public.order_items;
create policy order_items_read on public.order_items for select to authenticated using (
  exists(select 1 from public.orders o where o.id=order_id and (o.customer_id=(select auth.uid()) or private.is_merchant_member(o.merchant_id)))
);
drop policy if exists order_items_customer_insert on public.order_items;
create policy order_items_customer_insert on public.order_items for insert to authenticated with check (
  exists(select 1 from public.orders o where o.id=order_id and o.customer_id=(select auth.uid()))
);
drop policy if exists order_events_read on public.order_events;
create policy order_events_read on public.order_events for select to authenticated using (
  exists(select 1 from public.orders o where o.id=order_id and (o.customer_id=(select auth.uid()) or private.is_merchant_member(o.merchant_id)))
);

-- Pagamentos: somente leitura do próprio pedido/loja; gravação fica para backend/service role.
drop policy if exists payments_read on public.payments;
create policy payments_read on public.payments for select to authenticated using (
  private.is_merchant_member(merchant_id)
  or exists(select 1 from public.orders o where o.id=order_id and o.customer_id=(select auth.uid()))
);

-- Assinaturas: lojista vê a própria; admin gerencia cobrança, sem acessar pedidos.
drop policy if exists subscriptions_merchant_read on public.merchant_subscriptions;
create policy subscriptions_merchant_read on public.merchant_subscriptions for select to authenticated
using (private.is_merchant_member(merchant_id));
drop policy if exists subscriptions_admin_all on public.merchant_subscriptions;
create policy subscriptions_admin_all on public.merchant_subscriptions for all to authenticated
using (private.is_platform_admin()) with check (private.is_platform_admin());

-- Auditoria: leitura apenas da plataforma; escrita somente backend/service role.
drop policy if exists audit_admin_read on public.platform_audit_log;
create policy audit_admin_read on public.platform_audit_log for select to authenticated using (private.is_platform_admin());

-- Métricas administrativas: retorna somente agregados; jamais linhas de pedidos/clientes.
create or replace function public.get_platform_dashboard_summary()
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  _result jsonb;
begin
  if (select auth.uid()) is null or not private.is_platform_admin() then
    raise exception 'Acesso negado' using errcode='42501';
  end if;

  select jsonb_build_object(
    'gmvToday', coalesce(sum(o.total) filter (where o.status <> 'cancelled'),0),
    'platformRevenueToday', coalesce(sum(o.platform_fee) filter (where o.status <> 'cancelled'),0),
    'commissionRevenueToday', coalesce(sum(o.platform_fee) filter (where o.status <> 'cancelled'),0),
    'ordersToday', count(*),
    'cancelledToday', count(*) filter (where o.status='cancelled'),
    'averageTicket', case when count(*) filter (where o.status <> 'cancelled') > 0
      then coalesce(sum(o.total) filter (where o.status <> 'cancelled'),0) / (count(*) filter (where o.status <> 'cancelled'))
      else 0 end,
    'activeMerchants', (select count(*) from public.merchants m where m.status='active'),
    'subscriptionRevenueMonth', (
      select coalesce(sum(ms.amount),0) from public.merchant_subscriptions ms
      where ms.status='paid' and ms.paid_at >= date_trunc('month', now())
    )
  ) into _result
  from public.orders o
  where o.created_at >= date_trunc('day', now());

  return _result;
end;
$$;

revoke all on function public.get_platform_dashboard_summary() from public, anon;
grant execute on function public.get_platform_dashboard_summary() to authenticated;

create or replace function public.get_merchant_payment_connection_status(_merchant_id uuid, _provider text default 'mercadopago')
returns table(provider text, provider_user_id text, status text, connected_at timestamptz, last_sync_at timestamptz)
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or private.merchant_member_role(_merchant_id) not in ('owner','manager','finance') then
    raise exception 'Acesso negado' using errcode='42501';
  end if;
  return query
  select c.provider,c.provider_user_id,c.status,c.connected_at,c.last_sync_at
  from public.merchant_payment_connections c
  where c.merchant_id=_merchant_id and c.provider=_provider;
end;
$$;
revoke all on function public.get_merchant_payment_connection_status(uuid,text) from public, anon;
grant execute on function public.get_merchant_payment_connection_status(uuid,text) to authenticated;

-- Realtime para operação live.
do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.order_events;
exception when duplicate_object then null;
end $$;
