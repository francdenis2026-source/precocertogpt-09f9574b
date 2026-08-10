import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ASSETS_DIR = 'src/assets';

const mappings = [
  { pattern: /oleo.*soja.*soya/i, asset: 'oleo-soja-soya-900ml.png.asset.json' },
  { pattern: /ovos.*brancos.*duzia|ovos.*brancos.*12/i, asset: 'ovos-brancos-duzia.png.asset.json' },
  { pattern: /ovos.*brancos.*meia.*duzia|ovos.*brancos.*6/i, asset: 'ovos-brancos-meia-duzia.png.asset.json' },
  { pattern: /ovos.*vermelhos.*duzia|ovos.*vermelhos.*12/i, asset: 'ovos-vermelhos-duzia.png.asset.json' },
  { pattern: /ovos.*vermelhos.*meia.*duzia|ovos.*vermelhos.*6/i, asset: 'ovos-vermelhos-meia-duzia.png.asset.json' },
  { pattern: /pa.*com.*osso/i, asset: 'pa-com-osso-kg.png.asset.json' },
  { pattern: /papel.*higienico.*fofinho/i, asset: 'papel-higienico-fofinho-30m-4-rolos.png.asset.json' },
  { pattern: /papel.*higienico.*deluxe.*cotton/i, asset: 'papel-higienico-deluxe-cotton-12-rolos.png.asset.json' },
  { pattern: /papel.*higienico.*mili.*bianco/i, asset: 'papel-higienico-mili-bianco-60m-4-rolos.png.asset.json' },
  { pattern: /patinho/i, asset: 'patinho-kg.png.asset.json' }
];

async function updateBatch16() {
  console.log('--- Iniciando Lote 16 de imagens ---');
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
  console.log('--- Lote 16 Concluído ---');
}

updateBatch16();
