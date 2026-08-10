
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ASSETS_DIR = 'src/assets';

const mappings = [
  { pattern: /doce.*leite.*itambe/i, asset: 'doce-de-leite-itambe.png.asset.json' },
  { pattern: /extrato.*tomate.*elefante/i, asset: 'extrato-tomate-elefante.png.asset.json' },
  { pattern: /farinha.*mandioca.*agrovila/i, asset: 'farinha-mandioca-agrovila.png.asset.json' },
  { pattern: /farinha.*mandioca.*cooper/i, asset: 'farinha-mandioca-cooper.png.asset.json' },
  { pattern: /farinha.*milho.*sinha/i, asset: 'farinha-milho-sinha.png.asset.json' },
  { pattern: /farinha.*trigo.*dona.*benta/i, asset: 'farinha-trigo-dona-benta.png.asset.json' },
  { pattern: /farinha.*trigo.*finna/i, asset: 'farinha-trigo-finna.png.asset.json' },
  { pattern: /farinha.*lactea.*nestle/i, asset: 'farinha-lactea-nestle.png.asset.json' },
  { pattern: /feijao.*tio.*alemao/i, asset: 'feijao-tio-alemao.png.asset.json' },
  { pattern: /feijao.*preto.*kumbuca/i, asset: 'feijao-preto-kumbuca.png.asset.json' }
];

async function updateBatch8() {
  console.log('--- Iniciando Lote 8 de imagens (Mercearia) ---');
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
  console.log('--- Lote 8 Concluído ---');
}

updateBatch8();
