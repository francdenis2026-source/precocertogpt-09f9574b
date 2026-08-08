import { createClient } from "@supabase/supabase-js";

const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxdWVpb2hqYWR3enhhZmRycnhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjE5MjY3MCwiZXhwIjoyMTAxNzY4NjcwfQ.jQeq_hUrnkzyf0nLJgGuRu2O70F-6QTk5C2kEFyRX6A";
const URL = "https://kqueiohjadwzxafdrrxk.supabase.co";

const supabase = createClient(URL, SERVICE_KEY);

/**
 * Função utilitária para disparar o seed a partir do frontend (área Admin).
 * Importante: Como o SQL direto é restrito via rede no sandbox Lovable para o Supabase externo,
 * esta função usa a REST API com a Service Key para popular as tabelas.
 */
export async function runPriceImport(
  onProgress: (msg: string) => void,
): Promise<{ success: boolean; count: number; duplicates?: number; error?: string }> {
  try {
    onProgress("Iniciando importação...");

    // 1. Buscar preços existentes para verificação de duplicidade
    onProgress("Verificando registros existentes no Supabase...");
    const { data: existingPrices, error: fetchError } = await supabase
      .from("prices")
      .select("product_id, establishment_id, value");

    if (fetchError) {
      console.warn("Erro ao buscar preços existentes:", fetchError);
    }

    const existingKeys = new Set(
      (existingPrices || []).map(
        (p) => `${p.product_id}_${p.establishment_id}_${p.value}`
      )
    );

    // 2. Carregar o catálogo local
    onProgress("Carregando 2.838 registros de preços...");
    const { buildCatalog } = await import("./catalog");
    const local = buildCatalog();

    // Mapeamento de lojas (CSV -> Supabase UUID)
    const storeMap: Record<number, string> = {
      1: "2148aff3-4b80-4b0d-adf8-a06e50e3c2c4", // CENTRAL SUPER
      2: "c3f3df85-42fe-41ed-97a1-3115330783e2", // REBOUÇAS
      3: "eb1e6277-db89-4e94-950e-d14540ce71c6", // PAGUE POUCO
      4: "0b39b658-42f1-42c4-b1ac-eb81e4ba27bf", // 100% FEIJOENSE
      5: "905ca83b-5bd5-4d91-a543-76b2966e7d45", // PARCEIRÃO
    };

    // Montar lista de novos preços (evitando duplicatas exatas)
    const pricesToInsert = [];
    let duplicateCount = 0;

    for (const p of local.products) {
      const establishmentId = storeMap[Number(p.establishmentId)] || storeMap[1];
      const key = `${p.id}_${establishmentId}_${p.minPrice}`;

      if (existingKeys.has(key)) {
        duplicateCount++;
        continue;
      }

      pricesToInsert.push({
        product_id: p.id,
        establishment_id: establishmentId,
        value: p.minPrice,
        previous_value: p.previousPrice || p.maxPrice,
        captured_at: new Date().toISOString(),
      });
    }

    if (pricesToInsert.length === 0) {
      onProgress(`Concluído: Todos os ${duplicateCount} registros já existem.`);
      return { success: true, count: 0, duplicates: duplicateCount };
    }

    onProgress(`Enviando ${pricesToInsert.length} novos registros em lotes... (${duplicateCount} duplicatas ignoradas)`);

    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < pricesToInsert.length; i += batchSize) {
      const batch = pricesToInsert.slice(i, i + batchSize);
      const { error } = await supabase.from("prices").upsert(batch);

      if (error) {
        throw new Error(`Erro no lote ${i}: ${error.message}`);
      }

      inserted += batch.length;
      onProgress(`Importado: ${inserted} novos registros...`);
    }

    return { success: true, count: inserted, duplicates: duplicateCount };
  } catch (err) {
    console.error("Erro na importação:", err);
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : "Erro desconhecido",
    };
  }
}
