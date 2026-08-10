import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ASSETS_DIR = 'src/assets';

const mappings = [
  { pattern: /ninho.*380g|ninho.*integral/i, asset: 'leite-ninho-380g.png.asset.json' },
  { pattern: /condensado.*piracanjuba/i, asset: 'leite-condensado-piracanjuba.png.asset.json' },
  { pattern: /limao/i, asset: 'limao-kg.png.asset.json' },
  { pattern: /limpa.*aluminio.*alpes/i, asset: 'limpa-aluminio-alpes.png.asset.json' },
  { pattern: /limpador.*alpes/i, asset: 'limpador-alpes-fragrancias.png.asset.json' },
  { pattern: /limpador.*casa.*perfumes/i, asset: 'limpador-casa-perfumes.png.asset.json' },
  { pattern: /pinho.*sol|pinho.*eucalipto/i, asset: 'pinho-sol-1l.png.asset.json' },
  { pattern: /linguica.*aurora.*calabresa/i, asset: 'linguica-aurora-calabresa.png.asset.json' },
  { pattern: /linguica.*perdigao.*calabresa/i, asset: 'linguica-perdigao-calabresa.png.asset.json' },
  { pattern: /linguica.*sadia.*toscana/i, asset: 'linguica-sadia-toscana.png.asset.json' },
  // Generic fallbacks for these types
  { pattern: /linguica.*calabresa/i, asset: 'linguica-perdigao-calabresa.png.asset.json' },
  { pattern: /linguica.*toscana/i, asset: 'linguica-sadia-toscana.png.asset.json' }
];

async function updateBatch13() {
  console.log('--- Iniciando Lote 13 de imagens (Ninho, Limão, Limpeza, Linguiças) ---');
  const { data: products } = await supabase.from('products').select('id, name');
  if (!products) {
    console.error('Nenhum produto encontrado ou erro na conexão');
    return;
  }

  for (const product of products) {
    const normalizedName = product.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const match = mappings.find(m => m.pattern.test(normalizedName));
    
    if (match) {
      const assetPath = path.join(ASSETS_DIR, match.asset);
      if (fs.existsSync(assetPath)) {
        const assetData = JSON.parse(fs.readFileSync(assetPath, 'utf8'));
        console.log(`Atualizando "${product.name}" -> ${assetData.url}`);
        const { error } = await supabase.from('products').update({ image_url: assetData.url }).eq('id', product.id);
        if (error) console.error(`Erro ao atualizar ${product.name}:`, error);
      }
    }
  }
  console.log('--- Lote 13 Concluído ---');
}

updateBatch13();
