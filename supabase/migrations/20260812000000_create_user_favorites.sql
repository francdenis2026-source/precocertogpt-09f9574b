CREATE TABLE IF NOT EXISTS public.user_favorites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT user_favorites_user_product_key UNIQUE (user_id, product_id)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can add own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can remove own favorites" ON public.user_favorites;

CREATE POLICY "Users can view own favorites"
ON public.user_favorites FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can add own favorites"
ON public.user_favorites FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites"
ON public.user_favorites FOR DELETE TO authenticated
USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON public.user_favorites TO authenticated;
GRANT ALL ON public.user_favorites TO service_role;
REVOKE ALL ON public.user_favorites FROM anon;

CREATE INDEX IF NOT EXISTS user_favorites_user_created_idx
ON public.user_favorites (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS user_favorites_product_idx
ON public.user_favorites (product_id);
