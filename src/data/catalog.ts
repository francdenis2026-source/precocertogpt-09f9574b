// Catálogo PreçoCerto — fonte única de dados (antes servido pelo D1 via /api/catalog).
// Mantém a mesma forma de dados consumida pela interface, agregando preços por produto.

export type Product = {
  id: number; slug: string; name: string; brand: string; category: string; size: string;
  unit: string; barcode?: string; minPrice: number; avgPrice: number; maxPrice: number;
  storeCount: number; establishmentId: number; establishmentSlug: string; establishment: string;
  neighborhood: string; storeColor: string; capturedAt: string; previousPrice?: number;
};

export type StoreRow = { id: number; slug: string; name: string; neighborhood: string; color: string; products: number };

export type PlatformMetrics = { products: number; prices: number; stores: number };

export type CatalogPayload = { products: Product[]; stores: StoreRow[]; metrics: PlatformMetrics; updatedAt: string };

export const verifiedDatasetMetrics: PlatformMetrics = { products: 836, prices: 3080, stores: 12 };

type EstablishmentSeed = { id: number; slug: string; name: string; neighborhood: string; color: string };

export const establishmentSeed: EstablishmentSeed[] = [
  { id: 1, slug: "central-super", name: "Central Super", neighborhood: "Centro", color: "#1473E6" },
  { id: 2, slug: "mercado-reboucas", name: "Mercado Rebouças", neighborhood: "Esperança", color: "#16A36A" },
  { id: 3, slug: "pague-pouco", name: "Pague Pouco", neighborhood: "Centro", color: "#F4B400" },
  { id: 4, slug: "super-feijoense", name: "Super Feijoense", neighborhood: "Zenaide Paiva", color: "#EF6C3B" },
  { id: 5, slug: "parceirao", name: "Parceirão", neighborhood: "Conquista", color: "#7259C7" },
];

type ProductSeed = { id: number; slug: string; name: string; brand: string; category: string; size: string; unit: string; barcode?: string };

export const productSeed: ProductSeed[] = [
  { id: 1, slug: "arroz-tio-joao-5kg", name: "Arroz Tio João Tipo 1", brand: "Tio João", category: "Mercearia", size: "5 kg", unit: "pacote", barcode: "7893500020014" },
  { id: 2, slug: "cafe-3-coracoes-500g", name: "Café 3 Corações Tradicional", brand: "3 Corações", category: "Mercearia", size: "500 g", unit: "pacote", barcode: "7896005800037" },
  { id: 3, slug: "leite-italac-1l", name: "Leite Integral Italac", brand: "Italac", category: "Laticínios", size: "1 L", unit: "caixa", barcode: "7898080640416" },
  { id: 4, slug: "feijao-kicaldo-1kg", name: "Feijão Carioca Kicaldo", brand: "Kicaldo", category: "Mercearia", size: "1 kg", unit: "pacote", barcode: "7896116900022" },
  { id: 5, slug: "oleo-soja-liza-900ml", name: "Óleo de Soja Liza", brand: "Liza", category: "Mercearia", size: "900 ml", unit: "garrafa", barcode: "7896036090240" },
  { id: 6, slug: "acucar-uniao-1kg", name: "Açúcar Refinado União", brand: "União", category: "Mercearia", size: "1 kg", unit: "pacote", barcode: "7891910000190" },
  { id: 7, slug: "frango-congelado-kg", name: "Frango Congelado Inteiro", brand: "Regional", category: "Açougue", size: "1 kg", unit: "quilo" },
  { id: 8, slug: "detergente-ype-500ml", name: "Detergente Ypê Neutro", brand: "Ypê", category: "Limpeza", size: "500 ml", unit: "frasco", barcode: "7896098900201" },
];

type PriceSeed = { productId: number; establishmentId: number; value: number; previousValue: number };

export const priceSeed: PriceSeed[] = [
  { productId: 1, establishmentId: 1, value: 29.89, previousValue: 32.5 },
  { productId: 1, establishmentId: 2, value: 31.49, previousValue: 31.99 },
  { productId: 1, establishmentId: 3, value: 32.9, previousValue: 34.5 },
  { productId: 1, establishmentId: 4, value: 30.99, previousValue: 33.2 },
  { productId: 2, establishmentId: 2, value: 15.75, previousValue: 17.2 },
  { productId: 2, establishmentId: 1, value: 16.49, previousValue: 16.99 },
  { productId: 2, establishmentId: 5, value: 17.9, previousValue: 18.5 },
  { productId: 3, establishmentId: 3, value: 5.69, previousValue: 5.99 },
  { productId: 3, establishmentId: 1, value: 5.89, previousValue: 6.2 },
  { productId: 3, establishmentId: 4, value: 6.09, previousValue: 6.09 },
  { productId: 4, establishmentId: 4, value: 7.49, previousValue: 8.19 },
  { productId: 4, establishmentId: 2, value: 7.79, previousValue: 7.99 },
  { productId: 4, establishmentId: 1, value: 8.29, previousValue: 8.49 },
  { productId: 5, establishmentId: 1, value: 7.29, previousValue: 7.69 },
  { productId: 5, establishmentId: 3, value: 7.39, previousValue: 7.99 },
  { productId: 5, establishmentId: 5, value: 7.89, previousValue: 8.19 },
  { productId: 6, establishmentId: 2, value: 4.69, previousValue: 4.99 },
  { productId: 6, establishmentId: 1, value: 4.89, previousValue: 5.2 },
  { productId: 6, establishmentId: 4, value: 5.09, previousValue: 5.29 },
  { productId: 7, establishmentId: 4, value: 11.99, previousValue: 12.9 },
  { productId: 7, establishmentId: 2, value: 12.49, previousValue: 13.25 },
  { productId: 7, establishmentId: 1, value: 13.19, previousValue: 13.5 },
  { productId: 8, establishmentId: 5, value: 2.19, previousValue: 2.49 },
  { productId: 8, establishmentId: 1, value: 2.29, previousValue: 2.59 },
  { productId: 8, establishmentId: 3, value: 2.39, previousValue: 2.59 },
];

function round(value: number) { return Math.round(value * 100) / 100; }

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function buildCatalog(query = ""): CatalogPayload {
  const now = Date.now();
  const q = normalize(query);

  const products = productSeed
    .map((product, index) => {
      const prices = priceSeed.filter(price => price.productId === product.id);
      const values = prices.map(price => price.value);
      const best = prices.reduce((lowest, price) => (price.value < lowest.value ? price : lowest), prices[0]);
      const store = establishmentSeed.find(item => item.id === best.establishmentId)!;
      return {
        ...product,
        minPrice: round(Math.min(...values)),
        avgPrice: round(values.reduce((total, value) => total + value, 0) / values.length),
        maxPrice: round(Math.max(...values)),
        storeCount: new Set(prices.map(price => price.establishmentId)).size,
        establishmentId: store.id,
        establishmentSlug: store.slug,
        establishment: store.name,
        neighborhood: store.neighborhood,
        storeColor: store.color,
        capturedAt: new Date(now - (index * 7 + 8) * 60_000).toISOString(),
        previousPrice: best.previousValue,
      } satisfies Product;
    })
    .filter(product => !q || [product.name, product.category, product.brand].some(field => normalize(field).includes(q)))
    .sort((a, b) => a.minPrice - b.minPrice || a.name.localeCompare(b.name, "pt-BR"));

  const stores: StoreRow[] = establishmentSeed.map(store => ({
    id: store.id,
    slug: store.slug,
    name: store.name,
    neighborhood: store.neighborhood,
    color: store.color,
    products: new Set(priceSeed.filter(price => price.establishmentId === store.id).map(price => price.productId)).size,
  }));

  const metrics: PlatformMetrics = {
    products: Math.max(verifiedDatasetMetrics.products, productSeed.length),
    prices: Math.max(verifiedDatasetMetrics.prices, priceSeed.length),
    stores: Math.max(verifiedDatasetMetrics.stores, establishmentSeed.length),
  };

  return { products, stores, metrics, updatedAt: new Date(now).toISOString() };
}
