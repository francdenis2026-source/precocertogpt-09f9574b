import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ASSETS_DIR = 'src/assets';

const mappings = [
  { pattern: /peito.*reserva|peito.*friboi/i, asset: 'peito-bovino-reserva-friboi-kg.png.asset.json' },
  { pattern: /peito.*frango.*desfiado/i, asset: 'peito-frango-desfiado-aurora-kg.png.asset.json' },
  { pattern: /pescoco.*bovino/i, asset: 'pescoco-bovino-kg.png.asset.json' },
  { pattern: /picanha/i, asset: 'picanha-bovina-kg.png.asset.json' },
  { pattern: /polpa.*fruta|polpa.*de.*marchi/i, asset: 'polpa-fruta-de-marchi-100g.png.asset.json' },
  { pattern: /rabo.*bovino/i, asset: 'rabo-bovino-kg.png.asset.json' },
  { pattern: /repolho/i, asset: 'repolho-verde-un.png.asset.json' },
  { pattern: /sabao.*omo.*400g/i, asset: 'sabao-po-omo-lavagem-perfeita-400g.png.asset.json' },
  { pattern: /sabao.*tixan.*800g/i, asset: 'sabao-po-tixan-ype-800g.png.asset.json' }
];

async function updateBatch17() {
  console.log('--- Iniciando Lote 17 de imagens ---');
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
  console.log('--- Lote 17 Concluído ---');
}

updateBatch17();
