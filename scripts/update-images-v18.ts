import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ASSETS_DIR = 'src/assets';

const mappings = [
  { pattern: /sabao.*tixan.*maciez.*400g/i, asset: 'sabao-po-tixan-ype-maciez-400g.png.asset.json' },
  { pattern: /sabao.*barra.*glicerinado.*ype|sabao.*ype.*900g/i, asset: 'sabao-barra-glicerinado-ype-900g.png.asset.json' },
  { pattern: /sal.*cisne/i, asset: 'sal-refinado-cisne-1kg.png.asset.json' },
  { pattern: /salsicha.*molho.*bordon.*300g/i, asset: 'salsicha-ao-molho-bordon-300g.png.asset.json' },
  { pattern: /salsicha.*viena.*bordon|salsicha.*bordon.*180g/i, asset: 'salsicha-viena-bordon-180g.png.asset.json' },
  { pattern: /seleta.*legumes.*ole/i, asset: 'seleta-legumes-ole-200g.png.asset.json' },
  { pattern: /shampoo.*clear.*200ml/i, asset: 'shampoo-clear-men-200ml.png.asset.json' },
  { pattern: /shampoo.*clear.*400ml/i, asset: 'shampoo-clear-men-400ml.png.asset.json' },
  { pattern: /sopao.*apti.*galinha/i, asset: 'sopao-apti-galinha-180g.png.asset.json' },
  { pattern: /sopao.*maggi.*galinha/i, asset: 'sopao-maggi-galinha-200g.png.asset.json' }
];

async function updateBatch18() {
  console.log('--- Iniciando Lote 18 de imagens ---');
  const { data: products } = await supabase.from('products').select('id, name');
  if (!products) {
    console.error('Nenhum produto encontrado');
    return;
  }

  for (const product of products) {
    const normalizedName = product.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    
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
  console.log('--- Lote 18 Concluído ---');
}

updateBatch18();
