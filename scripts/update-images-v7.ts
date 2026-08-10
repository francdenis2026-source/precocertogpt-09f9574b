
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ASSETS_DIR = 'src/assets';

const mappings = [
  { pattern: /coxao.*duro/i, asset: 'coxao-duro.png.asset.json' },
  { pattern: /coxao.*mole/i, asset: 'coxao-mole.png.asset.json' },
  { pattern: /colgate.*total.*12.*whitening|colgate.*branqueador/i, asset: 'colgate-total-12-whitening.png.asset.json' },
  { pattern: /colgate.*luminous.*white/i, asset: 'colgate-luminous-white.png.asset.json' },
  { pattern: /colgate.*maxima.*protecao/i, asset: 'colgate-maxima-protecao.png.asset.json' },
  { pattern: /colgate.*sensitive|colgate.*alivio/i, asset: 'colgate-sensitive-pro-alivio.png.asset.json' },
  { pattern: /colgate.*total.*gengiva/i, asset: 'colgate-total-gengiva-saudavel.png.asset.json' },
  { pattern: /sorriso.*tripla.*acao/i, asset: 'sorriso-tripla-acao.png.asset.json' },
  { pattern: /cup.*noodles.*galinha.*picante/i, asset: 'cup-noodles-galinha-picante.png.asset.json' },
  { pattern: /pinho.*sol/i, asset: 'pinho-sol.png.asset.json' }
];

async function updateBatch7() {
  console.log('--- Iniciando Lote 7 de imagens (Carnes e Higiene) ---');
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
  console.log('--- Lote 7 Concluído ---');
}

updateBatch7();
