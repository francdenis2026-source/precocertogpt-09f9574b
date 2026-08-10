-- Hardening do módulo multi-nicho: evita políticas SELECT duplicadas e indexa FKs de ligação.
create index if not exists product_modifier_groups_group_idx on public.product_modifier_groups(modifier_group_id);
create index if not exists product_production_stations_station_idx on public.product_production_stations(station_id);

drop policy if exists variants_member_write on public.product_variants;
create policy variants_member_insert on public.product_variants for insert to authenticated with check (exists(select 1 from public.merchant_products mp where mp.id=merchant_product_id and private.is_merchant_member(mp.merchant_id)));
create policy variants_member_update on public.product_variants for update to authenticated using (exists(select 1 from public.merchant_products mp where mp.id=merchant_product_id and private.is_merchant_member(mp.merchant_id))) with check (exists(select 1 from public.merchant_products mp where mp.id=merchant_product_id and private.is_merchant_member(mp.merchant_id)));
create policy variants_member_delete on public.product_variants for delete to authenticated using (exists(select 1 from public.merchant_products mp where mp.id=merchant_product_id and private.is_merchant_member(mp.merchant_id)));

drop policy if exists modifier_groups_member_write on public.modifier_groups;
create policy modifier_groups_member_insert on public.modifier_groups for insert to authenticated with check (private.is_merchant_member(merchant_id));
create policy modifier_groups_member_update on public.modifier_groups for update to authenticated using (private.is_merchant_member(merchant_id)) with check (private.is_merchant_member(merchant_id));
create policy modifier_groups_member_delete on public.modifier_groups for delete to authenticated using (private.is_merchant_member(merchant_id));

drop policy if exists modifier_options_member_write on public.modifier_options;
create policy modifier_options_member_insert on public.modifier_options for insert to authenticated with check (exists(select 1 from public.modifier_groups mg where mg.id=modifier_group_id and private.is_merchant_member(mg.merchant_id)));
create policy modifier_options_member_update on public.modifier_options for update to authenticated using (exists(select 1 from public.modifier_groups mg where mg.id=modifier_group_id and private.is_merchant_member(mg.merchant_id))) with check (exists(select 1 from public.modifier_groups mg where mg.id=modifier_group_id and private.is_merchant_member(mg.merchant_id)));
create policy modifier_options_member_delete on public.modifier_options for delete to authenticated using (exists(select 1 from public.modifier_groups mg where mg.id=modifier_group_id and private.is_merchant_member(mg.merchant_id)));

drop policy if exists product_modifier_groups_member_write on public.product_modifier_groups;
create policy product_modifier_groups_member_insert on public.product_modifier_groups for insert to authenticated with check (exists(select 1 from public.merchant_products mp where mp.id=merchant_product_id and private.is_merchant_member(mp.merchant_id)));
create policy product_modifier_groups_member_update on public.product_modifier_groups for update to authenticated using (exists(select 1 from public.merchant_products mp where mp.id=merchant_product_id and private.is_merchant_member(mp.merchant_id))) with check (exists(select 1 from public.merchant_products mp where mp.id=merchant_product_id and private.is_merchant_member(mp.merchant_id)));
create policy product_modifier_groups_member_delete on public.product_modifier_groups for delete to authenticated using (exists(select 1 from public.merchant_products mp where mp.id=merchant_product_id and private.is_merchant_member(mp.merchant_id)));
