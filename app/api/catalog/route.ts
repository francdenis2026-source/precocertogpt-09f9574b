import { getD1 } from "../../../db/runtime";

const establishments = [
  ["central-super", "Central Super", "Centro", "#1473E6"],
  ["mercado-reboucas", "Mercado Rebouças", "Esperança", "#16A36A"],
  ["pague-pouco", "Pague Pouco", "Centro", "#F4B400"],
  ["super-feijoense", "Super Feijoense", "Zenaide Paiva", "#EF6C3B"],
  ["parceirao", "Parceirão", "Conquista", "#7259C7"],
] as const;

const products = [
  ["arroz-tio-joao-5kg", "Arroz Tio João Tipo 1", "arroz tio joao tipo 1", "Tio João", "Mercearia", "5 kg", "pacote", "7893500020014"],
  ["cafe-3-coracoes-500g", "Café 3 Corações Tradicional", "cafe 3 coracoes tradicional", "3 Corações", "Mercearia", "500 g", "pacote", "7896005800037"],
  ["leite-italac-1l", "Leite Integral Italac", "leite integral italac", "Italac", "Laticínios", "1 L", "caixa", "7898080640416"],
  ["feijao-kicaldo-1kg", "Feijão Carioca Kicaldo", "feijao carioca kicaldo", "Kicaldo", "Mercearia", "1 kg", "pacote", "7896116900022"],
  ["oleo-soja-liza-900ml", "Óleo de Soja Liza", "oleo de soja liza", "Liza", "Mercearia", "900 ml", "garrafa", "7896036090240"],
  ["acucar-uniao-1kg", "Açúcar Refinado União", "acucar refinado uniao", "União", "Mercearia", "1 kg", "pacote", "7891910000190"],
  ["frango-congelado-kg", "Frango Congelado Inteiro", "frango congelado inteiro", "Regional", "Açougue", "1 kg", "quilo", null],
  ["detergente-ype-500ml", "Detergente Ypê Neutro", "detergente ype neutro", "Ypê", "Limpeza", "500 ml", "frasco", "7896098900201"],
] as const;

const priceRows = [
  [1, 1, 29.89, 32.5], [1, 2, 31.49, 31.99], [1, 3, 32.9, 34.5], [1, 4, 30.99, 33.2],
  [2, 2, 15.75, 17.2], [2, 1, 16.49, 16.99], [2, 5, 17.9, 18.5],
  [3, 3, 5.69, 5.99], [3, 1, 5.89, 6.2], [3, 4, 6.09, 6.09],
  [4, 4, 7.49, 8.19], [4, 2, 7.79, 7.99], [4, 1, 8.29, 8.49],
  [5, 1, 7.29, 7.69], [5, 3, 7.39, 7.99], [5, 5, 7.89, 8.19],
  [6, 2, 4.69, 4.99], [6, 1, 4.89, 5.2], [6, 4, 5.09, 5.29],
  [7, 4, 11.99, 12.9], [7, 2, 12.49, 13.25], [7, 1, 13.19, 13.5],
  [8, 5, 2.19, 2.49], [8, 1, 2.29, 2.59], [8, 3, 2.39, 2.59],
] as const;

async function ensureCatalog(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS establishments (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'Supermercado', neighborhood TEXT NOT NULL, city TEXT NOT NULL DEFAULT 'Feijó', state TEXT NOT NULL DEFAULT 'AC', phone TEXT, brand_color TEXT NOT NULL DEFAULT '#1473E6', verified INTEGER NOT NULL DEFAULT 1, active INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, normalized_name TEXT NOT NULL, brand TEXT NOT NULL, category TEXT NOT NULL, size TEXT NOT NULL, unit TEXT NOT NULL, barcode TEXT, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS prices (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL REFERENCES products(id), establishment_id INTEGER NOT NULL REFERENCES establishments(id), value REAL NOT NULL, previous_value REAL, verified INTEGER NOT NULL DEFAULT 1, captured_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS user_actions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, payload TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, action, entity_type, entity_id))`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_products_search ON products(normalized_name, category)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_prices_product_value ON prices(product_id, value)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_user_actions_user ON user_actions(user_id, created_at)`),
  ]);

  const count = await db.prepare("SELECT COUNT(*) AS total FROM products").first<{ total: number }>();
  if ((count?.total ?? 0) > 0) return;

  await db.batch(establishments.map((row) => db.prepare("INSERT INTO establishments (slug, name, neighborhood, brand_color) VALUES (?, ?, ?, ?)").bind(...row)));
  await db.batch(products.map((row) => db.prepare("INSERT INTO products (slug, name, normalized_name, brand, category, size, unit, barcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(...row)));
  await db.batch(priceRows.map((row) => db.prepare("INSERT INTO prices (product_id, establishment_id, value, previous_value, captured_at) VALUES (?, ?, ?, ?, datetime('now', '-' || ((? * 7) % 90) || ' minutes'))").bind(row[0], row[1], row[2], row[3], row[0] + row[1])));
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export async function GET(request: Request) {
  try {
    const db = getD1();
    await ensureCatalog(db);
    const url = new URL(request.url);
    const q = normalize(url.searchParams.get("q") ?? "");
    const like = `%${q}%`;

    const results = await db.prepare(`
      SELECT p.id, p.slug, p.name, p.brand, p.category, p.size, p.unit, p.barcode,
        ROUND(MIN(pr.value), 2) AS minPrice,
        ROUND(AVG(pr.value), 2) AS avgPrice,
        ROUND(MAX(pr.value), 2) AS maxPrice,
        COUNT(DISTINCT pr.establishment_id) AS storeCount,
        e.id AS establishmentId, e.slug AS establishmentSlug, e.name AS establishment,
        e.neighborhood, e.brand_color AS storeColor,
        MAX(pr.captured_at) AS capturedAt,
        MIN(CASE WHEN pr.value = (SELECT MIN(p2.value) FROM prices p2 WHERE p2.product_id = p.id) THEN pr.previous_value END) AS previousPrice
      FROM products p
      JOIN prices pr ON pr.product_id = p.id
      JOIN establishments e ON e.id = pr.establishment_id
      WHERE (? = '' OR p.normalized_name LIKE ? OR lower(p.category) LIKE ? OR lower(p.brand) LIKE ?)
        AND pr.value = (SELECT MIN(p3.value) FROM prices p3 WHERE p3.product_id = p.id)
      GROUP BY p.id, e.id
      ORDER BY minPrice ASC, p.name ASC
      LIMIT 24
    `).bind(q, like, like, like).all();

    const stores = await db.prepare(`SELECT e.id, e.slug, e.name, e.neighborhood, e.brand_color AS color, COUNT(DISTINCT pr.product_id) AS products FROM establishments e LEFT JOIN prices pr ON pr.establishment_id = e.id WHERE e.active = 1 GROUP BY e.id ORDER BY e.name`).all();
    const metrics = await db.prepare(`SELECT (SELECT COUNT(*) FROM products) AS products, (SELECT COUNT(*) FROM prices) AS prices, (SELECT COUNT(*) FROM establishments WHERE active = 1) AS stores`).first();
    return Response.json({ products: results.results, stores: stores.results, metrics, updatedAt: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Falha ao carregar o catálogo" }, { status: 500 });
  }
}
