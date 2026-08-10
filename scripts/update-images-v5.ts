
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ASSETS_DIR = 'src/assets';

const mappings = [
  { pattern: /bisteca.*suina|bisteca.*porco/i, asset: 'bisteca.png.asset.json' },
  { pattern: /bisteca.*bovina/i, asset: 'bisteca-bovina.png.asset.json' },
  { pattern: /frango.*nutriza/i, asset: 'frango-nutriza.png.asset.json' },
  { pattern: /frango.*sadia/i, asset: 'frango-sadia.png.asset.json' },
  { pattern: /frango.*seara/i, asset: 'frango-seara.png.asset.json' },
  { pattern: /carne.*bertin/i, asset: 'carne-bertin.png.asset.json' },
  { pattern: /carne.*moida/i, asset: 'carne-moida.png.asset.json' },
  { pattern: /ovo.*branco/i, asset: 'ovos-brancos.png.asset.json' },
  { pattern: /ovo.*vermelho|ovo.*caipira/i, asset: 'ovos-vermelhos.png.asset.json' }
];

async function updateBatch5() {
  console.log('--- Iniciando Lote 5 de imagens (Carnes e Ovos) ---');
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
  console.log('--- Lote 5 Concluído ---');
}

updateBatch5();
