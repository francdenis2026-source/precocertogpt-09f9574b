
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ASSETS_DIR = 'src/assets';

const mappings = [
  { pattern: /almondega/i, asset: 'almondegas-pampeano.png.asset.json' },
  { pattern: /arroz.*bernardo/i, asset: 'arroz-bernardo-5kg.png.asset.json' },
  { pattern: /arroz.*kumbuca/i, asset: 'arroz-kumbuca-30kg.png.asset.json' },
  { pattern: /arroz.*alemao/i, asset: 'arroz-tio-alemao-1kg.png.asset.json' },
  { pattern: /arroz.*tio.*urbano.*branco/i, asset: 'arroz-tio-urbano-5kg.png.asset.json' },
  { pattern: /arroz.*urbano.*branco/i, asset: 'arroz-urbano-30kg.png.asset.json' },
  { pattern: /arroz.*urbano.*parboilizado.*1kg/i, asset: 'arroz-urbano-parboilizado-1kg.png.asset.json' },
  { pattern: /arroz.*urbano.*parboilizado.*5kg/i, asset: 'arroz-urbano-parboilizado-5kg.png.asset.json' },
  { pattern: /aveia.*quaker/i, asset: 'aveia-quaker.png.asset.json' },
  { pattern: /dende/i, asset: 'azeite-dende-cepera.png.asset.json' }
];

async function updateBatch2() {
  console.log('--- Iniciando Lote 2 de imagens ---');
  const { data: products } = await supabase.from('products').select('id, name');
  if (!products) return;

  for (const product of products) {
    const match = mappings.find(m => m.pattern.test(product.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
    if (match) {
      const assetPath = path.join(ASSETS_DIR, match.asset);
      if (fs.existsSync(assetPath)) {
        const assetData = JSON.parse(fs.readFileSync(assetPath, 'utf8'));
        console.log(`Atualizando "${product.name}" -> ${assetData.url}`);
        await supabase.from('products').update({ image_url: assetData.url }).eq('id', product.id);
      }
    }
  }
  console.log('--- Lote 2 Concluído ---');
}

updateBatch2();
