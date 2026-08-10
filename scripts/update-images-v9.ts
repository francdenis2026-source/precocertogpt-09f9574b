
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ASSETS_DIR = 'src/assets';

const mappings = [
  { pattern: /frango.*inteiro/i, asset: 'frango-inteiro.png.asset.json' },
  { pattern: /fuba.*milho.*sinha/i, asset: 'fuba-milho-sinha.png.asset.json' },
  { pattern: /gelatina.*oetker/i, asset: 'gelatina-oetker.png.asset.json' },
  { pattern: /gelatina.*royal/i, asset: 'gelatina-royal.png.asset.json' },
  { pattern: /goiabada.*palmeiron/i, asset: 'goiabada-palmeiron.png.asset.json' },
  { pattern: /hamburguer.*sadia/i, asset: 'hamburguer-sadia.png.asset.json' },
  { pattern: /hamburguer.*seara/i, asset: 'hamburguer-seara.png.asset.json' },
  { pattern: /iogurte.*danone/i, asset: 'iogurte-danone.png.asset.json' },
  { pattern: /iogurte.*nestle/i, asset: 'iogurte-nestle.png.asset.json' },
  { pattern: /iogurte.*itambe/i, asset: 'iogurte-itambe.png.asset.json' }
];

async function updateBatch9() {
  console.log('--- Iniciando Lote 9 de imagens (Mercearia e Frios) ---');
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
  console.log('--- Lote 9 Concluído ---');
}

updateBatch9();
