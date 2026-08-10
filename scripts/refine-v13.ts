import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function refineMappings() {
  console.log('--- Refinando mapeamentos do Lote 13 ---');
  
  // Reset non-produce items that matched "limão" generic pattern
  const { data: miscLimao } = await supabase.from('products')
    .select('id, name')
    .ilike('name', '%limão%');

  if (miscLimao) {
    for (const p of miscLimao) {
      if (p.name.toLowerCase().includes('limpa aluminio') || p.name.toLowerCase().includes('detergente') || p.name.toLowerCase().includes('sardinha') || p.name.toLowerCase().includes('nissin') || p.name.toLowerCase().includes('wafer') || p.name.toLowerCase().includes('sazon')) {
         // If it's cleaning, use the alpes/limpador asset if applicable
         if (p.name.toLowerCase().includes('alpes')) {
            const alpesAsset = "/__l5e/assets-v1/297d645a-3241-4953-9f8d-d10fa8bf908e/limpa-aluminio-alpes.png";
            await supabase.from('products').update({ image_url: alpesAsset }).eq('id', p.id);
            console.log(`Corrigido (Alpes): ${p.name}`);
         } else {
            // Otherwise reset to null to avoid wrong image
            await supabase.from('products').update({ image_url: null }).eq('id', p.id);
            console.log(`Resetado (Misc Limão): ${p.name}`);
         }
      }
    }
  }
}
refineMappings();
