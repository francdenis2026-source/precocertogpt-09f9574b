CREATE TABLE public.user_favorites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id uuid NOT NULL, -- Referência ao produto no catálogo
    created_at timestamptz DEFAULT now(),
    UNIQUE (user_id, product_id)
);

GRANT SELECT, INSERT, DELETE ON public.user_favorites TO authenticated;
GRANT ALL ON public.user_favorites TO service_role;

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites"
ON public.user_favorites
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
