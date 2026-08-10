import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ASSETS_DIR = 'src/assets';

const mappings = [
  { pattern: /tixan.*4kg|tixan.*ype.*4kg/i, asset: 'tixan-ype-4kg.png.asset.json' },
  { pattern: /tixan.*800g|tixan.*ype.*800g/i, asset: 'tixan-ype-800g.png.asset.json' },
  { pattern: /tixan.*maciez/i, asset: 'tixan-ype-maciez-800g.png.asset.json' },
  { pattern: /tixan.*2\.4kg/i, asset: 'tixan-ype-primavera-2.4kg.png.asset.json' },
  { pattern: /omo.*1\.6kg/i, asset: 'tixan-ype-omo-1.6kg.png.asset.json' },
  { pattern: /moca.*integral|moca.*lata/i, asset: 'leite-moca-integral.png.asset.json' },
  { pattern: /moca.*semi/i, asset: 'leite-moca-semi.png.asset.json' },
  { pattern: /leite.*coco.*bom/i, asset: 'leite-coco-bom-coco.png.asset.json' },
  { pattern: /molico.*desnatado/i, asset: 'leite-molico.png.asset.json' }
];

async function updateBatch12() {
  console.log('--- Iniciando Lote 12 de imagens (Tixan, Omo, Moça, Molico) ---');
  const { data: products } = await supabase.from('products').select('id, name');
  if (!products) {
    console.error('Nenhum produto encontrado ou erro na conexão');
    return;
  }

  for (const product of products) {
    const normalizedName = product.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
  console.log('--- Lote 12 Concluído ---');
}

updateBatch12();
