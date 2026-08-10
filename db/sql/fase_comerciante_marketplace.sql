-- Preço Certo · Plataforma comercial multiestabelecimento
-- Execute no Supabase SQL Editor após revisar em ambiente de teste.
-- Objetivo: catálogo por loja, equipe, pedidos, entrega, pagamentos,
-- assinaturas, faturamento agregado e auditoria com isolamento por RLS.

create extension if not exists pgcrypto;

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
  min_order numeric(12,2) not null default 0,
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
  promotional_price numeric(12,2),
  stock_quantity numeric(12,3) not null default 0,
  low_stock_threshold numeric(12,3) not null default 5,
  active boolean not null default true,
  available boolean not null default true,
  max_per_order numeric(12,3),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (merchant_id, product_slug)
);

create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  name text not null,
  neighborhood text,
  fee numeric(12,2) not null default 0,
  free_above numeric(12,2),
  minimum_order numeric(12,2) not null default 0,
  estimated_min_minutes integer not null default 30,
  estimated_max_minutes integer not null default 60,
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
  subtotal numeric(12,2) not null default 0,
  delivery_fee numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  platform_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
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

comment on column public.merchant_payment_connections.access_token_encrypted is 'Somente backend/service role. Nunca expor ao cliente.';
comment on column public.merchant_payment_connections.refresh_token_encrypted is 'Somente backend/service role. Nunca expor ao cliente.';

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id),
  provider text not null,
  external_payment_id text,
  external_reference text,
  status text not null default 'pending',
  gross_amount numeric(12,2) not null default 0,
  provider_fee numeric(12,2) not null default 0,
  platform_fee numeric(12,2) not null default 0,
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
  amount numeric(12,2) not null default 0,
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

create or replace function public.is_merchant_member(_merchant_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.merchant_members mm
    where mm.merchant_id = _merchant_id and mm.user_id = auth.uid() and mm.active = true
  );
$$;

create or replace function public.merchant_member_role(_merchant_id uuid)
returns text language sql stable security definer set search_path=public as $$
  select mm.role from public.merchant_members mm
  where mm.merchant_id = _merchant_id and mm.user_id = auth.uid() and mm.active = true
  order by case mm.role when 'owner' then 1 when 'manager' then 2 else 3 end
  limit 1;
$$;

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role::text in ('super_admin','admin','moderator')
  );
$$;

create or replace function public.touch_order_status_times()
returns trigger language plpgsql as $$
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

drop trigger if exists trg_touch_order_status_times on public.orders;
create trigger trg_touch_order_status_times before update on public.orders for each row execute function public.touch_order_status_times();

create or replace function public.log_order_status_event()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_events(order_id,event_type,status,actor_user_id,actor_type,message)
    values(new.id,'order_created',new.status,auth.uid(),case when auth.uid()=new.customer_id then 'customer' else 'system' end,'Pedido criado');
  elsif new.status is distinct from old.status then
    insert into public.order_events(order_id,event_type,status,actor_user_id,actor_type,message)
    values(new.id,'status_changed',new.status,auth.uid(),case when public.is_merchant_member(new.merchant_id) then 'merchant' when auth.uid()=new.customer_id then 'customer' else 'system' end,'Status atualizado para ' || new.status);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_order_event on public.orders;
create trigger trg_log_order_event after insert or update on public.orders for each row execute function public.log_order_status_event();

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

-- MERCHANTS: público pode ler lojas ativas; membros leem a própria; admin gerencia cadastro.
drop policy if exists merchants_public_read on public.merchants;
create policy merchants_public_read on public.merchants for select using (status='active' or public.is_merchant_member(id) or public.is_platform_admin());
drop policy if exists merchants_admin_write on public.merchants;
create policy merchants_admin_write on public.merchants for all using (public.is_platform_admin()) with check (public.is_platform_admin());
drop policy if exists merchants_owner_update on public.merchants;
create policy merchants_owner_update on public.merchants for update using (public.merchant_member_role(id) in ('owner','manager')) with check (public.merchant_member_role(id) in ('owner','manager'));

-- EQUIPE: somente a própria loja; administração não entra na gestão de funcionários.
drop policy if exists merchant_members_self_read on public.merchant_members;
create policy merchant_members_self_read on public.merchant_members for select using (user_id=auth.uid() or public.is_merchant_member(merchant_id));
drop policy if exists merchant_members_owner_write on public.merchant_members;
create policy merchant_members_owner_write on public.merchant_members for all using (public.merchant_member_role(merchant_id)='owner') with check (public.merchant_member_role(merchant_id)='owner');

-- CATÁLOGO: leitura pública dos itens ativos; escrita restrita a membros da loja.
drop policy if exists merchant_products_public_read on public.merchant_products;
create policy merchant_products_public_read on public.merchant_products for select using ((active and available) or public.is_merchant_member(merchant_id));
drop policy if exists merchant_products_member_write on public.merchant_products;
create policy merchant_products_member_write on public.merchant_products for all using (public.is_merchant_member(merchant_id)) with check (public.is_merchant_member(merchant_id));

drop policy if exists delivery_zones_public_read on public.delivery_zones;
create policy delivery_zones_public_read on public.delivery_zones for select using (active or public.is_merchant_member(merchant_id));
drop policy if exists delivery_zones_member_write on public.delivery_zones;
create policy delivery_zones_member_write on public.delivery_zones for all using (public.merchant_member_role(merchant_id) in ('owner','manager')) with check (public.merchant_member_role(merchant_id) in ('owner','manager'));

-- PEDIDOS: cliente vê os próprios; loja vê apenas os dela. Admin não recebe acesso linha-a-linha.
drop policy if exists orders_customer_read on public.orders;
create policy orders_customer_read on public.orders for select using (customer_id=auth.uid());
drop policy if exists orders_merchant_read on public.orders;
create policy orders_merchant_read on public.orders for select using (public.is_merchant_member(merchant_id));
drop policy if exists orders_customer_insert on public.orders;
create policy orders_customer_insert on public.orders for insert with check (customer_id=auth.uid());
drop policy if exists orders_merchant_update on public.orders;
create policy orders_merchant_update on public.orders for update using (public.is_merchant_member(merchant_id)) with check (public.is_merchant_member(merchant_id));

-- Itens e eventos herdam a visibilidade do pedido.
drop policy if exists order_items_read on public.order_items;
create policy order_items_read on public.order_items for select using (exists(select 1 from public.orders o where o.id=order_id and (o.customer_id=auth.uid() or public.is_merchant_member(o.merchant_id))));
drop policy if exists order_items_customer_insert on public.order_items;
create policy order_items_customer_insert on public.order_items for insert with check (exists(select 1 from public.orders o where o.id=order_id and o.customer_id=auth.uid()));
drop policy if exists order_events_read on public.order_events;
create policy order_events_read on public.order_events for select using (exists(select 1 from public.orders o where o.id=order_id and (o.customer_id=auth.uid() or public.is_merchant_member(o.merchant_id))));

-- Conexões de pagamento: lojista pode ver somente metadados da conexão, nunca tokens.
-- Recomenda-se expor uma VIEW sem campos de token para o frontend e manter writes via Edge Function/service_role.
revoke select(access_token_encrypted, refresh_token_encrypted) on public.merchant_payment_connections from anon, authenticated;
drop policy if exists payment_connections_member_read on public.merchant_payment_connections;
create policy payment_connections_member_read on public.merchant_payment_connections for select using (public.merchant_member_role(merchant_id) in ('owner','manager','finance'));

-- Pagamentos: cliente consulta pagamento do próprio pedido; loja consulta os seus.
drop policy if exists payments_read on public.payments;
create policy payments_read on public.payments for select using (public.is_merchant_member(merchant_id) or exists(select 1 from public.orders o where o.id=order_id and o.customer_id=auth.uid()));

-- Assinatura: lojista vê a própria; admin vê agregado/gestão de cobrança.
drop policy if exists subscriptions_merchant_read on public.merchant_subscriptions;
create policy subscriptions_merchant_read on public.merchant_subscriptions for select using (public.is_merchant_member(merchant_id));
drop policy if exists subscriptions_admin_read on public.merchant_subscriptions;
create policy subscriptions_admin_read on public.merchant_subscriptions for select using (public.is_platform_admin());

-- Auditoria somente plataforma.
drop policy if exists audit_admin_read on public.platform_audit_log;
create policy audit_admin_read on public.platform_audit_log for select using (public.is_platform_admin());

-- Views agregadas: o administrador vê faturamento e saúde, sem lista de clientes/pedidos.
create or replace view public.platform_daily_revenue as
select
  date_trunc('day', created_at)::date as day,
  count(*) filter (where status <> 'cancelled') as orders,
  coalesce(sum(total) filter (where status <> 'cancelled'),0)::numeric(14,2) as gmv,
  coalesce(sum(platform_fee) filter (where status <> 'cancelled'),0)::numeric(14,2) as commission_revenue,
  count(*) filter (where status='cancelled') as cancelled_orders
from public.orders
group by 1;

create or replace view public.platform_monthly_revenue as
select
  date_trunc('month', created_at)::date as month,
  count(*) filter (where status <> 'cancelled') as orders,
  coalesce(sum(total) filter (where status <> 'cancelled'),0)::numeric(14,2) as gmv,
  coalesce(sum(platform_fee) filter (where status <> 'cancelled'),0)::numeric(14,2) as commission_revenue
from public.orders
group by 1;

grant select on public.platform_daily_revenue to authenticated;
grant select on public.platform_monthly_revenue to authenticated;

-- Realtime para operação live. Se já estiverem na publicação, o bloco ignora erro de duplicidade.
do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.order_events;
exception when duplicate_object then null;
end $$;
