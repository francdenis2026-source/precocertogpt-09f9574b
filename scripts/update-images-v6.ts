
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ASSETS_DIR = 'src/assets';

const mappings = [
  { pattern: /cebola.*branca|cebola.*kg/i, asset: 'cebola.png.asset.json' },
  { pattern: /cebola.*roxa/i, asset: 'cebola-roxa.png.asset.json' },
  { pattern: /cenoura/i, asset: 'cenoura.png.asset.json' },
  { pattern: /cereal.*moca/i, asset: 'cereal-moca.png.asset.json' },
  { pattern: /cereal.*nescau/i, asset: 'cereal-nescau.png.asset.json' },
  { pattern: /cereal.*snow.*flakes/i, asset: 'cereal-snow-flakes.png.asset.json' },
  { pattern: /coco.*ralado.*sococo/i, asset: 'coco-ralado.png.asset.json' },
  { pattern: /contra.*file/i, asset: 'contra-file.png.asset.json' },
  { pattern: /coracao.*bovino/i, asset: 'coracao-bovino.png.asset.json' },
  { pattern: /costela.*bovina/i, asset: 'costela-bovina.png.asset.json' }
];

async function updateBatch6() {
  console.log('--- Iniciando Lote 6 de imagens (Vegetais, Cereais e Carnes) ---');
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
  console.log('--- Lote 6 Concluído ---');
}

updateBatch6();
