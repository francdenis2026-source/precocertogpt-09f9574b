
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ASSETS_DIR = 'src/assets';

const mappings = [
  { pattern: /file.*frango.*copacol|sassami/i, asset: 'file-frango-copacol-v2.png.asset.json' },
  { pattern: /flocao.*milho.*sao braz/i, asset: 'flocao-milho-sao-braz.png.asset.json' },
  { pattern: /fraldinha/i, asset: 'fraldinha-swift.png.asset.json' },
  { pattern: /frango.*nutriza/i, asset: 'frango-nutriza.png.asset.json' },
  { pattern: /frango.*sadia/i, asset: 'frango-sadia.png.asset.json' },
  { pattern: /frango.*seara/i, asset: 'frango-seara.png.asset.json' },
  { pattern: /galinha.*inteira|big frango/i, asset: 'galinha-big-frango.png.asset.json' },
  { pattern: /guarana.*po/i, asset: 'guarana-po-nero.png.asset.json' },
  { pattern: /baygon/i, asset: 'inseticida-baygon.png.asset.json' },
  { pattern: /raid/i, asset: 'inseticida-raid.png.asset.json' }
];

async function updateBatch10() {
  console.log('--- Iniciando Lote 10 de imagens (Carnes, Mercearia e Inseticidas) ---');
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
  console.log('--- Lote 10 Concluído ---');
}

updateBatch10();
