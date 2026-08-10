
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ASSETS_DIR = 'src/assets';

const mappings = [
  { pattern: /abacate/i, asset: 'abacate-_kg.png.asset.json' },
  { pattern: /alcatra/i, asset: 'alcatra.png.asset.json' },
  { pattern: /alho/i, asset: 'alho-_kg.png.asset.json' },
  { pattern: /acucar.*itamarati.*1kg/i, asset: 'açúcar-itamarati-1kg.png.asset.json' },
  { pattern: /acucar.*demerara/i, asset: 'açúcar-itamarati-saca-_fardo.png.asset.json' },
  { pattern: /agua.*cristal.*1l/i, asset: 'água-sanitária-cristal-1l.png.asset.json' },
  { pattern: /agua.*cristal.*2l/i, asset: 'água-sanitária-cristal-2l.png.asset.json' },
  { pattern: /agua.*ype.*1l/i, asset: 'água-sanitária-ypê-1l.png.asset.json' },
  { pattern: /agua.*ype.*2l/i, asset: 'água-sanitária-ypê-2l.png.asset.json' },
  { pattern: /intimus.*noite/i, asset: 'absorvente-intimus-noite.png.asset.json' }
];

async function updateProductImages() {
  console.log('--- Iniciando atualização de imagens de produtos ---');

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name');

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return;
  }

  console.log(`Encontrados ${products.length} produtos.`);

  for (const product of products) {
    const match = mappings.find(m => m.pattern.test(product.name));
    if (match) {
      const assetPath = path.join(ASSETS_DIR, match.asset);
      if (fs.existsSync(assetPath)) {
        const assetData = JSON.parse(fs.readFileSync(assetPath, 'utf8'));
        const newUrl = assetData.url;

        console.log(`Atualizando "${product.name}" (ID: ${product.id}) -> ${newUrl}`);

        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: newUrl })
          .eq('id', product.id);

        if (updateError) {
          console.error(`Erro ao atualizar ${product.name}:`, updateError.message);
        } else {
          console.log(`Sucesso!`);
        }
      }
    }
  }

  console.log('--- Processo concluído ---');
}

updateProductImages();
