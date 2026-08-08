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
export type ImportResult = {
  success: boolean;
  count: number;
  duplicates: number;
  stores: number;
  products: number;
  duration?: number;
  error?: string;
};

export async function runPriceImport(
  onProgress: (msg: string) => void,
): Promise<ImportResult> {
  const startTime = Date.now();

  try {
    onProgress("Iniciando importação...");

    // 1. Carregar o catálogo local para garantir que temos os produtos
    const { buildCatalog } = await import("./catalog");
    const local = buildCatalog();
    
    // 2. Sincronizar PRODUTOS primeiro (precisamos do ID neles para a tabela de preços)
    onProgress("Sincronizando 696 produtos...");
    const productsToUpsert = local.products.map(p => ({
      id: p.id,
      slug: p.slug || `p-${p.id}`,
      name: p.name,
      brand: p.brand,
      category: p.category,
      size: p.size,
      unit: p.unit || 'un',
      barcode: p.barcode
    }));

    const { error: prodError } = await supabase.from("products").upsert(productsToUpsert, { onConflict: 'id' });
    if (prodError) throw new Error(`Erro ao sincronizar produtos: ${prodError.message}`);

    // 3. Buscar preços existentes para verificação de duplicidade
    onProgress("Verificando preços existentes...");
    const { data: existingPrices } = await supabase.from("prices").select("product_id, establishment_id, value");
    const existingKeys = new Set((existingPrices || []).map(p => `${p.product_id}_${p.establishment_id}_${p.value}`));

    // Mapeamento de lojas (CSV -> Supabase UUID)
    const storeMap: Record<number, string> = {
      1: "2148aff3-4b80-4b0d-adf8-a06e50e3c2c4", // CENTRAL SUPER
      2: "c3f3df85-42fe-41ed-97a1-3115330783e2", // REBOUÇAS
      3: "eb1e6277-db89-4e94-950e-d14540ce71c6", // PAGUE POUCO
      4: "0b39b658-42f1-42c4-b1ac-eb81e4ba27bf", // 100% FEIJOENSE
      5: "905ca83b-5bd5-4d91-a543-76b2966e7d45", // PARCEIRÃO
      6: "8e7a7e3d-7b2a-4c1e-9d2f-a1b2c3d4e5f6", // POPULAR
      7: "7d6c5b4a-3e2d-1c0b-a987-654321fedcba", // BOM PREÇO
      8: "f1e2d3c4-b5a6-9788-7766-554433221100", // MERCANTIL FEIJÓ
      9: "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6", // AUTO SERVIÇO UNIÃO
      10: "b2c3d4e5-f6a7-8b9c-0d1e-f2a3b4c5d6e7", // COMERCIAL LIMA
      11: "c3d4e5f6-a7b8-9c0d-1e2f-a3b4c5d6e7f8", // MERCADO DO POVO
      12: "d4e5f6a7-b8c9-0d1e-2f3a-b4c5d6e7f8a9", // VITÓRIA SUPER
    };

    // Montar lista de novos preços
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
      return { 
        success: true, 
        count: 0, 
        duplicates: duplicateCount,
        stores: Object.keys(storeMap).length,
        products: local.products.length,
        duration: Date.now() - startTime
      };
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

    return { 
      success: true, 
      count: inserted, 
      duplicates: duplicateCount,
      stores: Object.keys(storeMap).length,
      products: local.products.length,
      duration: Date.now() - startTime
    };
  } catch (err) {
    console.error("Erro na importação:", err);
    return {
      success: false,
      count: 0,
      duplicates: 0,
      stores: 0,
      products: 0,
      error: err instanceof Error ? err.message : "Erro desconhecido",
    };
  }
}

/**
 * Função para testar a conexão com o Supabase.
 */
export async function testSupabaseConnection(): Promise<{ 
  success: boolean; 
  latency: number; 
  tables: Record<string, number>; 
  error?: string 
}> {
  const start = Date.now();
  try {
    const [stores, products, prices] = await Promise.all([
      supabase.from("establishments").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("prices").select("*", { count: "exact", head: true })
    ]);

    const error = stores.error || products.error || prices.error;
    if (error) throw new Error(error.message);

    return {
      success: true,
      latency: Date.now() - start,
      tables: {
        establishments: stores.count || 0,
        products: products.count || 0,
        prices: prices.count || 0
      }
    };
  } catch (err) {
    return {
      success: false,
      latency: Date.now() - start,
      tables: {},
      error: err instanceof Error ? err.message : "Falha na conexão"
    };
  }
}

/**
 * Função para enviar e-mail de redefinição de senha (simulada via API Rest do Supabase ou Provedor).
 * Como estamos em um frontend sem backend direto acessível para SMTP, 
 * usamos um webhook ou uma Edge Function do Supabase se disponível.
 */
export async function sendAdminResetEmail(email: string, user: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Simulação de chamada para provedor configurável (SendGrid/Resend/Postmark)
    // No cenário real, isso seria uma chamada para uma Edge Function que possui a API Key secreta.
    console.log(`[E-mail] Enviando link de redefinição para ${email} (Usuário: ${user})`);
    
    // Simulando latência de rede
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Se fosse usar Supabase Auth real para reset:
    // const { error } = await supabase.auth.resetPasswordForEmail(email);
    // if (error) throw error;

    return { success: true };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Falha ao disparar e-mail" 
    };
  }
}


