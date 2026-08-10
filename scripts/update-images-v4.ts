
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ASSETS_DIR = 'src/assets';

const mappings = [
  { pattern: /batata.*doce/i, asset: 'batata-doce-2.png.asset.json' },
  { pattern: /biscoito.*galo/i, asset: 'biscoito-galo.png.asset.json' },
  { pattern: /itamarati/i, asset: 'biscoito-itamarati.png.asset.json' },
  { pattern: /show.*gol/i, asset: 'biscoito-show-gol.png.asset.json' },
  { pattern: /mirim/i, asset: 'biscoito-mirim.png.asset.json' },
  { pattern: /spantoo.*80g/i, asset: 'biscoito-spantoo-80g.png.asset.json' },
  { pattern: /spantoo.*30g/i, asset: 'biscoito-spantoo-30g.png.asset.json' },
  { pattern: /vitarella.*cracker/i, asset: 'biscoito-vitarella-cracker.png.asset.json' },
  { pattern: /vitarella.*delicita/i, asset: 'biscoito-vitarella-delicita.png.asset.json' },
  { pattern: /wafer.*bauducco/i, asset: 'wafer-bauducco.png.asset.json' }
];

async function updateBatch4() {
  console.log('--- Iniciando Lote 4 de imagens (Biscoitos Diversos) ---');
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
  console.log('--- Lote 4 Concluído ---');
}

updateBatch4();
