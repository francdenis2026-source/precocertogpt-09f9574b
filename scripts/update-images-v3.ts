
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ASSETS_DIR = 'src/assets';

const mappings = [
  { pattern: /batata.*doce/i, asset: 'batata-doce-_kg.png.asset.json' },
  { pattern: /batata/i, asset: 'batata-_kg.png.asset.json' },
  { pattern: /beterraba/i, asset: 'beterraba-_kg.png.asset.json' },
  { pattern: /dallas/i, asset: 'biscoito-dallas-300g.png.asset.json' },
  { pattern: /atrevidos/i, asset: 'biscoito-atrevidos.png.asset.json' },
  { pattern: /brandini/i, asset: 'biscoito-brandini.png.asset.json' },
  { pattern: /cookies.*bauducco/i, asset: 'cookies-bauducco.png.asset.json' },
  { pattern: /cracker.*liane/i, asset: 'cream-cracker-liane.png.asset.json' },
  { pattern: /cracker.*vivale/i, asset: 'cream-cracker-vivale.png.asset.json' },
  { pattern: /dende.*200ml/i, asset: 'azeite-dende-cepera-200ml.png.asset.json' }
];

async function updateBatch3() {
  console.log('--- Iniciando Lote 3 de imagens (Hortifruti & Biscoitos) ---');
  const { data: products } = await supabase.from('products').select('id, name');
  if (!products) return;

  for (const product of products) {
    const normalizedName = product.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const match = mappings.find(m => m.pattern.test(normalizedName));
    
    if (match) {
      const assetPath = path.join(ASSETS_DIR, match.asset);
      if (fs.existsSync(assetPath)) {
        const assetData = JSON.parse(fs.readFileSync(assetPath, 'utf8'));
        console.log(`Atualizando "${product.name}" -> ${assetData.url}`);
        await supabase.from('products').update({ image_url: assetData.url }).eq('id', product.id);
      }
    }
  }
  console.log('--- Lote 3 Concluído ---');
}

updateBatch3();
