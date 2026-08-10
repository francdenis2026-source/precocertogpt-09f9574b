import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ASSETS_DIR = 'src/assets';

const mappings = [
  { pattern: /margarina.*delicia.*supreme/i, asset: 'margarina-delicia-supreme-500g.png.asset.json' },
  { pattern: /margarina.*delicia.*creme.*leite/i, asset: 'margarina-delicia-creme-leite-500g.png.asset.json' },
  { pattern: /margarina.*delicia/i, asset: 'margarina-delicia-creme-leite-500g.png.asset.json' },
  { pattern: /lasanha.*dona.*benta/i, asset: 'massa-lasanha-dona-benta-500g.png.asset.json' },
  { pattern: /melao/i, asset: 'melao-kg.png.asset.json' },
  { pattern: /mexerica|tangirina|ponkan/i, asset: 'mexerica-kg.png.asset.json' },
  { pattern: /milho.*verde.*ole/i, asset: 'milho-verde-ole-200g.png.asset.json' },
  { pattern: /molho.*tomate.*tarantella/i, asset: 'molho-tomate-tarantella-300g.png.asset.json' },
  { pattern: /molho.*tomate.*pizza.*ole/i, asset: 'molho-tomate-pizza-ole-300g.png.asset.json' },
  { pattern: /musculo/i, asset: 'musculo-kg.png.asset.json' },
  { pattern: /neston.*3.*cereais/i, asset: 'neston-3-cereais-360g.png.asset.json' }
];

async function updateBatch15() {
  console.log('--- Iniciando Lote 15 de imagens ---');
  const { data: products } = await supabase.from('products').select('id, name');
  if (!products) {
    console.error('Nenhum produto encontrado');
    return;
  }

  for (const product of products) {
    const normalizedName = product.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    
    // Safety check to avoid clashing with other brands or categories
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
  console.log('--- Lote 15 Concluído ---');
}

updateBatch15();
