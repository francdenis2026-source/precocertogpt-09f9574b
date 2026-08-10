alter table public.merchants add column if not exists online_sales_enabled boolean not null default false;
alter table public.merchants add column if not exists online_sales_message text;
alter table public.merchants add column if not exists online_sales_started_at timestamptz;

create or replace function public.marketplace_public_availability()
returns table(
  establishment_id text,
  establishment_slug text,
  establishment_name text,
  merchant_id text,
  service_live boolean,
  online_sales_enabled boolean,
  sales_message text,
  delivery_enabled boolean,
  pickup_enabled boolean,
  payment_connected boolean,
  active_product_ids text[],
  active_merchant_product_ids text[],
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    e.id::text,
    coalesce(e.slug, e.id::text),
    coalesce(e.name, m.name),
    m.id::text,
    (
      m.status = 'active'
      and m.online_sales_enabled = true
      and (m.delivery_enabled = true or m.pickup_enabled = true)
      and exists (
        select 1 from public.merchant_products mp0
        where mp0.merchant_id = m.id and mp0.active = true and mp0.available = true
      )
      and exists (
        select 1 from public.merchant_payment_connections c
        where c.merchant_id = m.id and c.provider = 'mercadopago' and c.status = 'connected'
      )
    ) as service_live,
    m.online_sales_enabled,
    coalesce(nullif(trim(m.online_sales_message), ''), 'Este estabelecimento ainda não oferece vendas online pelo Preço Certo. Você pode consultar e comparar os preços normalmente.') as sales_message,
    m.delivery_enabled,
    m.pickup_enabled,
    exists (
      select 1 from public.merchant_payment_connections c
      where c.merchant_id = m.id and c.provider = 'mercadopago' and c.status = 'connected'
    ) as payment_connected,
    coalesce(array_agg(mp.product_id::text order by mp.product_id::text) filter (where mp.active = true and mp.available = true and mp.product_id is not null), array[]::text[]) as active_product_ids,
    coalesce(array_agg(mp.id::text order by mp.id::text) filter (where mp.active = true and mp.available = true), array[]::text[]) as active_merchant_product_ids,
    m.updated_at
  from public.merchants m
  join public.establishments e on e.id = m.establishment_id
  left join public.merchant_products mp on mp.merchant_id = m.id
  group by e.id, e.slug, e.name, m.id, m.name, m.status, m.online_sales_enabled, m.online_sales_message, m.delivery_enabled, m.pickup_enabled, m.updated_at;
$$;

revoke all on function public.marketplace_public_availability() from public;
grant execute on function public.marketplace_public_availability() to anon, authenticated;

create index if not exists merchants_establishment_online_idx on public.merchants(establishment_id, online_sales_enabled, status);
create index if not exists merchant_products_public_live_idx on public.merchant_products(merchant_id, product_id) where active = true and available = true;