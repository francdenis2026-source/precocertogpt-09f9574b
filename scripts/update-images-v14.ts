import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ASSETS_DIR = 'src/assets';

const mappings = [
  { pattern: /maca/i, asset: 'maca-kg.png.asset.json' },
  { pattern: /manga/i, asset: 'manga-kg.png.asset.json' },
  { pattern: /maracuja/i, asset: 'maracuja-kg.png.asset.json' },
  { pattern: /nissin.*galinha/i, asset: 'nissin-galinha.png.asset.json' },
  { pattern: /nissin.*carne/i, asset: 'nissin-carne-85g.png.asset.json' },
  { pattern: /nissin.*limao.*frango|nissin.*frango.*limao/i, asset: 'nissin-limao-frango.png.asset.json' },
  { pattern: /araguaia.*espaguete/i, asset: 'macarrao-araguaia-400g.png.asset.json' },
  { pattern: /miragina.*espaguete/i, asset: 'macarrao-miragina-500g.png.asset.json' },
  { pattern: /liane.*espaguete/i, asset: 'macarrao-liane-400g.png.asset.json' },
  { pattern: /lilita.*espaguete|d'italia.*espaguete/i, asset: 'macarrao-lilita-500g.png.asset.json' },
  // Generic fallbacks
  { pattern: /espaguete.*400g/i, asset: 'macarrao-liane-400g.png.asset.json' },
  { pattern: /espaguete.*500g/i, asset: 'macarrao-miragina-500g.png.asset.json' }
];

async function updateBatch14() {
  console.log('--- Iniciando Lote 14 de imagens (Frutas e Macarrão) ---');
  const { data: products } = await supabase.from('products').select('id, name');
  if (!products) {
    console.error('Nenhum produto encontrado ou erro na conexão');
    return;
  }

  for (const product of products) {
    const normalizedName = product.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    
    // Skip if it's a specific detergent/cleaning item that might clash with fruit names
    if ((normalizedName.includes('detergente') || normalizedName.includes('limpeza')) && 
        (normalizedName.includes('maca') || normalizedName.includes('limao'))) continue;

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
  console.log('--- Lote 14 Concluído ---');
}

updateBatch14();
