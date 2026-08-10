-- Fase 2: Cesta Inteligente Determinística
-- Tabelas para armazenar cestas, itens e snapshots de preços

-- 1. Tabela de Cestas
CREATE TABLE IF NOT EXISTS public.smart_baskets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Minha Cesta',
    budget DECIMAL(10,2),
    optimization_mode TEXT NOT NULL CHECK (optimization_mode IN ('cheapest_single', 'cheapest_multi', 'best_value', 'within_budget')),
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Itens da Cesta (Configuração do usuário)
CREATE TABLE IF NOT EXISTS public.smart_basket_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    basket_id UUID REFERENCES public.smart_baskets(id) ON DELETE CASCADE NOT NULL,
    product_name TEXT NOT NULL,
    category TEXT,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'un',
    preferred_brands TEXT[] DEFAULT '{}',
    is_essential BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Snapshots de Preços (Para garantir que a cesta salva não mude se os preços mudarem)
CREATE TABLE IF NOT EXISTS public.basket_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    basket_id UUID REFERENCES public.smart_baskets(id) ON DELETE CASCADE NOT NULL,
    product_id UUID, -- Referência opcional ao produto real
    product_name TEXT NOT NULL,
    establishment_id UUID NOT NULL,
    establishment_name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2),
    valid_until TIMESTAMPTZ,
    captured_at TIMESTAMPTZ DEFAULT now()
);

-- Permissões
GRANT ALL ON public.smart_baskets TO authenticated;
GRANT ALL ON public.smart_basket_items TO authenticated;
GRANT ALL ON public.basket_snapshots TO authenticated;

GRANT ALL ON public.smart_baskets TO service_role;
GRANT ALL ON public.smart_basket_items TO service_role;
GRANT ALL ON public.basket_snapshots TO service_role;

-- RLS
ALTER TABLE public.smart_baskets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_basket_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.basket_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can manage their own baskets" ON public.smart_baskets;
CREATE POLICY "Users can manage their own baskets"
ON public.smart_baskets
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can view shared baskets" ON public.smart_baskets;
CREATE POLICY "Public can view shared baskets"
ON public.smart_baskets
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Users can manage items of their own baskets" ON public.smart_basket_items;
CREATE POLICY "Users can manage items of their own baskets"
ON public.smart_basket_items
FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.smart_baskets
    WHERE id = basket_id AND user_id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.smart_baskets
    WHERE id = basket_id AND user_id = auth.uid()
));

DROP POLICY IF EXISTS "Public can view items of shared baskets" ON public.smart_basket_items;
CREATE POLICY "Public can view items of shared baskets"
ON public.smart_basket_items
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Users can manage snapshots of their own baskets" ON public.basket_snapshots;
CREATE POLICY "Users can manage snapshots of their own baskets"
ON public.basket_snapshots
FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.smart_baskets
    WHERE id = basket_id AND user_id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.smart_baskets
    WHERE id = basket_id AND user_id = auth.uid()
));

DROP POLICY IF EXISTS "Public can view snapshots of shared baskets" ON public.basket_snapshots;
CREATE POLICY "Public can view snapshots of shared baskets"
ON public.basket_snapshots
FOR SELECT
TO anon, authenticated
USING (true);

-- Explicit Grants for Anonymous Access (Required for shared links)
GRANT SELECT ON public.smart_baskets TO anon;
GRANT SELECT ON public.smart_basket_items TO anon;
GRANT SELECT ON public.basket_snapshots TO anon;
