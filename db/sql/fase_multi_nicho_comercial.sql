-- Preço Certo · Camada multi-nicho para comerciantes
-- Nichos suportados inicialmente: mercado/mercearia, pizzaria, lanchonete,
-- padaria, farmácia, restaurante, bebidas, pet shop, cosméticos e serviços locais.

alter table public.merchants
  add column if not exists business_type text not null default 'grocery',
  add column if not exists business_capabilities jsonb not null default '{}'::jsonb,
  add column if not exists service_settings jsonb not null default '{}'::jsonb;

alter table public.merchants drop constraint if exists merchants_business_type_check;
alter table public.merchants add constraint merchants_business_type_check check (
  business_type in ('grocery','supermarket','pizzeria','snack_bar','bakery','pharmacy','restaurant','beverage','pet_shop','cosmetics','services','other')
);

alter table public.merchant_products
  add column if not exists item_type text not null default 'product',
  add column if not exists unit_mode text not null default 'unit',
  add column if not exists preparation_minutes integer,
  add column if not exists allow_customer_notes boolean not null default true,
  add column if not exists composition_rules jsonb not null default '{}'::jsonb,
  add column if not exists regulated_item boolean not null default false,
  add column if not exists prescription_requirement text not null default 'none';

alter table public.merchant_products drop constraint if exists merchant_products_item_type_check;
alter table public.merchant_products add constraint merchant_products_item_type_check check (item_type in ('product','prepared_food','service','medicine','bakery_item'));
alter table public.merchant_products drop constraint if exists merchant_products_unit_mode_check;
alter table public.merchant_products add constraint merchant_products_unit_mode_check check (unit_mode in ('unit','weight','volume','portion','service'));
alter table public.merchant_products drop constraint if exists merchant_products_prescription_requirement_check;
alter table public.merchant_products add constraint merchant_products_prescription_requirement_check check (prescription_requirement in ('none','review_required','prescription_required','blocked_remote_sale'));

alter table public.orders
  add column if not exists scheduled_for timestamptz,
  add column if not exists service_channel text not null default 'delivery',
  add column if not exists operation_stage text,
  add column if not exists customer_instructions text,
  add column if not exists table_reference text;

alter table public.orders drop constraint if exists orders_service_channel_check;
alter table public.orders add constraint orders_service_channel_check check (service_channel in ('delivery','pickup','counter','table','scheduled'));

alter table public.order_items
  add column if not exists variant_snapshot jsonb,
  add column if not exists modifier_snapshot jsonb not null default '[]'::jsonb,
  add column if not exists item_notes text,
  add column if not exists regulatory_snapshot jsonb not null default '{}'::jsonb;

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  merchant_product_id uuid not null references public.merchant_products(id) on delete cascade,
  name text not null,
  sku text,
  price_delta numeric(12,2) not null default 0,
  price_override numeric(12,2),
  stock_quantity numeric(12,3),
  active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.modifier_groups (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  name text not null,
  description text,
  required boolean not null default false,
  min_select integer not null default 0 check (min_select >= 0),
  max_select integer not null default 1 check (max_select >= 1),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (max_select >= min_select)
);

create table if not exists public.modifier_options (
  id uuid primary key default gen_random_uuid(),
  modifier_group_id uuid not null references public.modifier_groups(id) on delete cascade,
  name text not null,
  price_delta numeric(12,2) not null default 0,
  active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.product_modifier_groups (
  merchant_product_id uuid not null references public.merchant_products(id) on delete cascade,
  modifier_group_id uuid not null references public.modifier_groups(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (merchant_product_id, modifier_group_id)
);

create table if not exists public.production_stations (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  name text not null,
  station_type text not null default 'general',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_production_stations (
  merchant_product_id uuid not null references public.merchant_products(id) on delete cascade,
  station_id uuid not null references public.production_stations(id) on delete cascade,
  primary key (merchant_product_id, station_id)
);

create table if not exists public.pharmacy_product_compliance (
  merchant_product_id uuid primary key references public.merchant_products(id) on delete cascade,
  anvisa_registration text,
  active_ingredient text,
  dosage text,
  prescription_required boolean not null default false,
  controlled_special boolean not null default false,
  pharmacist_review_required boolean not null default false,
  remote_sale_allowed boolean not null default true,
  compliance_notes text,
  updated_at timestamptz not null default now()
);

create index if not exists product_variants_product_idx on public.product_variants(merchant_product_id, active, sort_order);
create index if not exists modifier_groups_merchant_idx on public.modifier_groups(merchant_id, active, sort_order);
create index if not exists modifier_options_group_idx on public.modifier_options(modifier_group_id, active, sort_order);
create index if not exists stations_merchant_idx on public.production_stations(merchant_id, active, sort_order);
create index if not exists merchants_business_type_idx on public.merchants(business_type, status);
create index if not exists orders_scheduled_for_idx on public.orders(merchant_id, scheduled_for) where scheduled_for is not null;

alter table public.product_variants enable row level security;
alter table public.modifier_groups enable row level security;
alter table public.modifier_options enable row level security;
alter table public.product_modifier_groups enable row level security;
alter table public.production_stations enable row level security;
alter table public.product_production_stations enable row level security;
alter table public.pharmacy_product_compliance enable row level security;

grant select on public.product_variants, public.modifier_groups, public.modifier_options, public.product_modifier_groups to anon;
grant select,insert,update,delete on public.product_variants, public.modifier_groups, public.modifier_options, public.product_modifier_groups, public.production_stations, public.product_production_stations, public.pharmacy_product_compliance to authenticated;

create policy variants_anon_read on public.product_variants for select to anon using (
  active and exists(select 1 from public.merchant_products mp where mp.id=merchant_product_id and mp.active and mp.available)
);
create policy variants_auth_read on public.product_variants for select to authenticated using (
  active or exists(select 1 from public.merchant_products mp where mp.id=merchant_product_id and private.is_merchant_member(mp.merchant_id))
);
create policy variants_member_write on public.product_variants for all to authenticated
using (exists(select 1 from public.merchant_products mp where mp.id=merchant_product_id and private.is_merchant_member(mp.merchant_id)))
with check (exists(select 1 from public.merchant_products mp where mp.id=merchant_product_id and private.is_merchant_member(mp.merchant_id)));

create policy modifier_groups_anon_read on public.modifier_groups for select to anon using (active);
create policy modifier_groups_auth_read on public.modifier_groups for select to authenticated using (active or private.is_merchant_member(merchant_id));
create policy modifier_groups_member_write on public.modifier_groups for all to authenticated using (private.is_merchant_member(merchant_id)) with check (private.is_merchant_member(merchant_id));

create policy modifier_options_anon_read on public.modifier_options for select to anon using (
  active and exists(select 1 from public.modifier_groups mg where mg.id=modifier_group_id and mg.active)
);
create policy modifier_options_auth_read on public.modifier_options for select to authenticated using (
  active or exists(select 1 from public.modifier_groups mg where mg.id=modifier_group_id and private.is_merchant_member(mg.merchant_id))
);
create policy modifier_options_member_write on public.modifier_options for all to authenticated
using (exists(select 1 from public.modifier_groups mg where mg.id=modifier_group_id and private.is_merchant_member(mg.merchant_id)))
with check (exists(select 1 from public.modifier_groups mg where mg.id=modifier_group_id and private.is_merchant_member(mg.merchant_id)));

create policy product_modifier_groups_anon_read on public.product_modifier_groups for select to anon using (
  exists(select 1 from public.merchant_products mp where mp.id=merchant_product_id and mp.active and mp.available)
);
create policy product_modifier_groups_auth_read on public.product_modifier_groups for select to authenticated using (
  exists(select 1 from public.merchant_products mp where mp.id=merchant_product_id and (mp.active or private.is_merchant_member(mp.merchant_id)))
);
create policy product_modifier_groups_member_write on public.product_modifier_groups for all to authenticated
using (exists(select 1 from public.merchant_products mp where mp.id=merchant_product_id and private.is_merchant_member(mp.merchant_id)))
with check (exists(select 1 from public.merchant_products mp where mp.id=merchant_product_id and private.is_merchant_member(mp.merchant_id)));

create policy stations_member_all on public.production_stations for all to authenticated using (private.is_merchant_member(merchant_id)) with check (private.is_merchant_member(merchant_id));
create policy product_stations_member_all on public.product_production_stations for all to authenticated
using (exists(select 1 from public.merchant_products mp where mp.id=merchant_product_id and private.is_merchant_member(mp.merchant_id)))
with check (exists(select 1 from public.merchant_products mp where mp.id=merchant_product_id and private.is_merchant_member(mp.merchant_id)));

create policy pharmacy_compliance_member_all on public.pharmacy_product_compliance for all to authenticated
using (exists(select 1 from public.merchant_products mp where mp.id=merchant_product_id and private.is_merchant_member(mp.merchant_id)))
with check (exists(select 1 from public.merchant_products mp where mp.id=merchant_product_id and private.is_merchant_member(mp.merchant_id)));

create or replace function private.enforce_pharmacy_remote_sale()
returns trigger language plpgsql set search_path='' as $$
declare _merchant_type text; _blocked boolean;
begin
  select m.business_type into _merchant_type from public.merchants m where m.id=new.merchant_id;
  if _merchant_type <> 'pharmacy' then return new; end if;
  select exists(
    select 1
    from public.order_items oi
    join public.pharmacy_product_compliance pc on pc.merchant_product_id=oi.merchant_product_id
    where oi.order_id=new.id and (pc.controlled_special=true or pc.remote_sale_allowed=false)
  ) into _blocked;
  if _blocked and new.status not in ('cancelled','pending_payment') then
    raise exception 'Pedido contém item não autorizado para venda remota';
  end if;
  return new;
end; $$;
revoke all on function private.enforce_pharmacy_remote_sale() from public,anon,authenticated;
drop trigger if exists trg_enforce_pharmacy_remote_sale on public.orders;
create trigger trg_enforce_pharmacy_remote_sale before update on public.orders for each row execute function private.enforce_pharmacy_remote_sale();
