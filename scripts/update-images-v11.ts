import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ASSETS_DIR = 'src/assets';

const mappings = [
  { pattern: /kit.*dabelle.*abacate/i, asset: 'kit-dabelle-abacate.png.asset.json' },
  { pattern: /kit.*dabelle.*liso/i, asset: 'kit-dabelle-liso.png.asset.json' },
  { pattern: /kit.*elseve.*hidra|elseve.*hialuronico/i, asset: 'kit-elseve-hidra.png.asset.json' },
  { pattern: /minuano.*1\.6kg|minuano.*perfumacao/i, asset: 'lava-roupas-minuano-1.6kg.png.asset.json' },
  { pattern: /omo.*coco.*900ml|omo.*delicadas/i, asset: 'lava-roupas-omo-coco-900ml.png.asset.json' },
  { pattern: /laranja.*lima/i, asset: 'laranja-lima.png.asset.json' },
  { pattern: /lava.*louca.*minuano/i, asset: 'lava-loucas-minuano.png.asset.json' },
  { pattern: /ype.*lava.*louca.*kit|ype.*500ml.*kit/i, asset: 'lava-loucas-ype-kit.png.asset.json' },
  { pattern: /omo.*lavanda.*1\.6kg/i, asset: 'lava-roupas-omo-lavanda.png.asset.json' },
  { pattern: /omo.*puro.*cuidado.*1\.6kg/i, asset: 'lava-roupas-omo-puro-cuidado.png.asset.json' }
];

async function updateBatch11() {
  console.log('--- Iniciando Lote 11 de imagens (Limpeza e Kits) ---');
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
  console.log('--- Lote 11 Concluído ---');
}

updateBatch11();
