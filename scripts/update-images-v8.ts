
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ASSETS_DIR = 'src/assets';

const mappings = [
  { pattern: /detergente.*limpol/i, asset: 'detergente-limpol.png.asset.json' },
  { pattern: /detergente.*ype/i, asset: 'detergente-ype.png.asset.json' },
  { pattern: /farinha.*lactea.*nestle/i, asset: 'farinha-lactea-nestle-v2.png.asset.json' },
  { pattern: /feijao.*carioca.*bernardo/i, asset: 'feijao-carioca-bernardo.png.asset.json' },
  { pattern: /feijao.*praia|feijao.*kumbuca.*praia/i, asset: 'feijao-praia-kumbuca.png.asset.json' },
  { pattern: /feijao.*preto.*bernardo/i, asset: 'feijao-preto-bernardo.png.asset.json' },
  { pattern: /feijao.*rajado/i, asset: 'feijao-rajado-kumbuca.png.asset.json' },
  { pattern: /file.*bovino/i, asset: 'file-bovino.png.asset.json' },
  { pattern: /file.*frango.*copacol|sassami/i, asset: 'file-frango-copacol.png.asset.json' },
  { pattern: /file.*frango.*lar|peito.*frango.*lar/i, asset: 'file-frango-lar.png.asset.json' }
];

async function updateBatch8() {
  console.log('--- Iniciando Lote 8 de imagens (Limpeza, Mercearia e Carnes) ---');
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
