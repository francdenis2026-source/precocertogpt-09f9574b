-- Preço Certo · Checkout multi-nicho
-- A função aplicada no Supabase valida variações/adicionais no servidor,
-- grava snapshots imutáveis no pedido e adiciona pending_review para farmácias.
-- Esta migration espelha a alteração aplicada no ambiente remoto em 2026-08-10.

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (
  status in ('pending_review','pending_payment','paid','accepted','preparing','ready','out_for_delivery','delivered','cancelled')
);

-- A implementação canônica da RPC create_marketplace_order no banco remoto:
-- • aceita em cada item: merchant_product_id, quantity, variant_id opcional,
--   modifier_option_ids opcional e notes opcional;
-- • valida que a variação pertence ao produto;
-- • valida grupos obrigatórios, min/max e opções pertencentes ao produto;
-- • recalcula preço base + variação + adicionais no servidor;
-- • salva variant_snapshot e modifier_snapshot em order_items;
-- • bloqueia itens farmacêuticos não elegíveis à venda remota;
-- • cria status pending_review quando houver análise farmacêutica obrigatória.
--
-- A RPC review_pharmacy_order(_order_id, _decision, _notes) foi criada para
-- aprovar/rejeitar solicitações, restrita a membros autorizados da farmácia.
--
-- Observação: o SQL integral das RPCs é gerenciado no histórico de migrations
-- do Supabase; este arquivo mantém a intenção arquitetural versionada no GitHub.
