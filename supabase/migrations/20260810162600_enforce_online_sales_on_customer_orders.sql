create or replace function public.enforce_online_sales_on_customer_orders()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  _merchant public.merchants%rowtype;
  _payment_ready boolean;
begin
  if new.customer_id is null then return new; end if;
  if new.status not in ('pending_payment','pending_review') then return new; end if;

  select * into _merchant from public.merchants where id = new.merchant_id;
  if not found or _merchant.status <> 'active' then
    raise exception 'Estabelecimento indisponível para venda online';
  end if;
  if not _merchant.online_sales_enabled then
    raise exception 'Este estabelecimento ainda não ativou as vendas online';
  end if;
  if not (_merchant.delivery_enabled or _merchant.pickup_enabled) then
    raise exception 'Este estabelecimento ainda não configurou entrega ou retirada';
  end if;

  select exists(
    select 1 from public.merchant_payment_connections c
    where c.merchant_id = new.merchant_id
      and c.provider = 'mercadopago'
      and c.status = 'connected'
  ) into _payment_ready;
  if not _payment_ready then
    raise exception 'Pagamento online ainda não está configurado para este estabelecimento';
  end if;

  return new;
end;
$$;

drop trigger if exists orders_enforce_online_sales on public.orders;
create trigger orders_enforce_online_sales
before insert on public.orders
for each row execute function public.enforce_online_sales_on_customer_orders();

revoke all on function public.enforce_online_sales_on_customer_orders() from public, anon, authenticated;