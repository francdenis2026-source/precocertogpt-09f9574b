import { supabase } from "../lib/supabase";
import {
  buildCatalog,
  verifiedDatasetMetrics,
  type CatalogPayload,
  type PlatformMetrics,
  type Product,
  type StoreRow,
} from "./catalog";

type EstablishmentRow = {
  id: string;
  slug: string | null;
  name: string | null;
  neighborhood: string | null;
  brand_color: string | null;
};

type ProductRow = {
  id: string | number;
  slug: string | null;
  name: string | null;
  brand: string | null;
  category: string | null;
  size: string | null;
  unit: string | null;
  barcode: string | null;
  image_url: string | null;
};

type PriceRow = {
  product_id: string;
  establishment_id: string;
  value: number | string | null;
  previous_value: number | string | null;
  captured_at: string | null;
  source?: string;
};

export type CatalogSource = "supabase" | "local";

export type CatalogResult = CatalogPayload & { source: CatalogSource; error?: string };

const round = (value: number) => Math.round(value * 100) / 100;
const toNumber = (value: number | string | null) => (value === null ? NaN : Number(value));

export const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/** Lê establishments/products/prices do Supabase e agrega no formato da UI. */
export async function fetchCatalog(query = ""): Promise<CatalogResult> {
  const local = buildCatalog(query);

  if (!supabase) {
    return { ...local, source: "local", error: "Supabase não configurado." };
  }

  try {
    const [establishments, products, prices] = await Promise.all([
      supabase.from("establishments").select("id, name, neighborhood, brand_color"),
      supabase.from("products").select("id, name, brand, category, size, unit, barcode, image_url"),
      supabase
        .from("prices")
        .select("product_id, establishment_id, value, previous_value, captured_at, source"),
    ]);

    const failure = establishments.error ?? products.error ?? prices.error;
    if (failure) {
      return { ...local, source: "local", error: failure.message };
    }

    const storeRows = (establishments.data ?? []) as unknown as EstablishmentRow[];
    const productRows = (products.data ?? []) as unknown as ProductRow[];
    const priceRows = ((prices.data ?? []) as unknown as PriceRow[]).filter(row =>
      Number.isFinite(toNumber(row.value)),
    );

    // Sem dados suficientes para montar comparações: mantém o catálogo local.
    if (!storeRows.length || !productRows.length || !priceRows.length) {
      return { ...local, source: "local", error: "Banco conectado, porém sem dados de preços." };
    }

    const q = normalize(query);

    // Agrupa preços por produto normalizado para tratar itens divergentes (duplicados com IDs diferentes)
    const productPriceMap = new Map<string, PriceRow[]>();
    
    productRows.forEach(product => {
      const key = `${normalize(product.name || "")}|${normalize(product.brand || "")}|${normalize(product.size || "")}|${normalize(product.unit || "")}`;
      const rows = priceRows.filter(price => String(price.product_id) === String(product.id));
      
      if (!productPriceMap.has(key)) {
        productPriceMap.set(key, []);
      }
      productPriceMap.get(key)!.push(...rows);
    });

    // Mapeia os produtos usando a primeira ocorrência de cada produto normalizado e seus preços agregados
    const uniqueProductRows = Array.from(
      productRows.reduce((map, p) => {
        const key = `${normalize(p.name || "")}|${normalize(p.brand || "")}|${normalize(p.size || "")}|${normalize(p.unit || "")}`;
        if (!map.has(key)) map.set(key, p);
        return map;
      }, new Map<string, ProductRow>()).values()
    );

    const mapped = uniqueProductRows
      .map((product): Product | null => {
        const key = `${normalize(product.name || "")}|${normalize(product.brand || "")}|${normalize(product.size || "")}|${normalize(product.unit || "")}`;
        const rows = productPriceMap.get(key) || [];
        
        if (!rows.length) return null;

        const values = rows.map(row => toNumber(row.value));
        const best = rows.reduce((lowest, row) =>
          toNumber(row.value) < toNumber(lowest.value) ? row : lowest,
        );
        const store = storeRows.find(item => item.id === best.establishment_id);
        if (!store) return null;

        const previous = toNumber(best.previous_value);

        return {
          id: product.id,
          slug: String(product.id),
          name: product.name ?? "Produto sem nome",
          brand: product.brand ?? "—",
          category: product.category ?? "Geral",
          size: product.size ?? "—",
          unit: product.unit ?? "un",
          barcode: product.barcode ?? undefined,
          minPrice: round(Math.min(...values)),
          avgPrice: round(values.reduce((total, value) => total + value, 0) / values.length),
          maxPrice: round(Math.max(...values)),
          storeCount: new Set(rows.map(row => row.establishment_id)).size,
          establishmentId: store.id,
          establishmentSlug: String(store.id),
          establishment: store.name ?? "Estabelecimento",
          neighborhood: store.neighborhood ?? "—",
          storeColor: store.brand_color ?? "#1473E6",
          capturedAt: best.captured_at ?? new Date().toISOString(),
          previousPrice: Number.isFinite(previous) ? round(previous) : undefined,
          image_url: product.image_url || undefined,
          source: best.source ?? "Coleta Manual",
          updated_at: best.captured_at || undefined,
          price_history: rows
            .map(r => ({ date: r.captured_at || new Date().toISOString(), value: toNumber(r.value) }))
            .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
        };
      })
      .filter((product): product is Product => product !== null)
      .filter(
        product => {
          if (!q) return true;
          const searchFields = [
            product.name,
            product.category,
            product.brand,
            product.barcode
          ].filter(Boolean) as string[];
          
          return searchFields.some(field => normalize(field).includes(q));
        }
      )
      .sort((a, b) => a.minPrice - b.minPrice || a.name.localeCompare(b.name, "pt-BR"));

    const stores: StoreRow[] = storeRows.map(store => ({
      id: store.id,
      slug: String(store.id),
      name: store.name ?? "Estabelecimento",
      neighborhood: store.neighborhood ?? "—",
      color: store.brand_color ?? "#1473E6",
      products: new Set(
        priceRows.filter(row => row.establishment_id === store.id).map(row => row.product_id),
      ).size,
    }));

    const metrics: PlatformMetrics = {
      products: productRows.length || verifiedDatasetMetrics.products,
      prices: priceRows.length || verifiedDatasetMetrics.prices,
      stores: storeRows.length || verifiedDatasetMetrics.stores,
    };

    return {
      products: mapped,
      stores,
      metrics,
      updatedAt: new Date().toISOString(),
      source: "supabase",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao consultar o banco.";
    return { ...local, source: "local", error: message };
  }
}
