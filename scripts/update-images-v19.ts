import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ASSETS_DIR = 'src/assets';

const mappings = [
  { pattern: /tempero.*alho.*sal.*1kg/i, asset: 'tempero-alho-sal-castelo-1kg.png.asset.json' },
  { pattern: /^tomate/i, asset: 'tomate-kg.png.asset.json' },
  { pattern: /vinagre.*alcool.*castelo/i, asset: 'vinagre-alcool-castelo-750ml.png.asset.json' },
  { pattern: /vinagre.*alcool.*toscano/i, asset: 'vinagre-alcool-toscano-750ml.png.asset.json' },
  { pattern: /vinagre.*maca.*toscano/i, asset: 'vinagre-maca-toscano-750ml.png.asset.json' }
];

async function updateBatch19() {
  console.log('--- Iniciando Lote 19 de imagens ---');
  const { data: products } = await supabase.from('products').select('id, name');
  if (!products) {
    console.error('Nenhum produto encontrado');
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
  console.log('--- Lote 19 Concluído ---');
}

updateBatch19();
