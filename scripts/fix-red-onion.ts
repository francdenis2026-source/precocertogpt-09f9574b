
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixRedOnion() {
  const assetData = JSON.parse(fs.readFileSync('src/assets/cebola-roxa-v2.png.asset.json', 'utf8'));
  console.log(`Aplicando imagem correta para Cebola Roxa: ${assetData.url}`);
  
  const { data } = await supabase.from('products')
    .update({ image_url: assetData.url })
    .ilike('name', '%cebola roxa%');
    
  console.log('Correção concluída.');
}

fixRedOnion();
