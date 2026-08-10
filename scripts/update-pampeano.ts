
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ASSETS_DIR = 'src/assets';

async function updatePampeano() {
  console.log('--- Atualizando Carne Bovina Pampeano ---');
  const assetPath = path.join(ASSETS_DIR, 'carne-bovina-pampeano.png.asset.json');
  
  if (fs.existsSync(assetPath)) {
    const assetData = JSON.parse(fs.readFileSync(assetPath, 'utf8'));
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .ilike('name', '%pampeano%');

    if (products && products.length > 0) {
      for (const product of products) {
        if (product.name.toLowerCase().includes('carne')) {
          console.log(`Atualizando "${product.name}" -> ${assetData.url}`);
          await supabase.from('products').update({ image_url: assetData.url }).eq('id', product.id);
        }
      }
    } else {
      console.log('Produto "Pampeano Carne" não encontrado no banco.');
    }
  }
  console.log('--- Concluído ---');
}

updatePampeano();
