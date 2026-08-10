import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function refineBatch14() {
  console.log('--- Refinando Lote 14 (Corrigindo falsos positivos de Maçã/Maracujá) ---');
  
  const { data: products } = await supabase.from('products').select('id, name, image_url');
  
  const macaAsset = "/__l5e/assets-v1/f8cdcce8-8153-4497-b5d7-330de503f84b/maca-kg.png";
  const maracujaAsset = "/__l5e/assets-v1/17fd1b14-b0e5-49fe-94fe-3cf62079f92a/maracuja-kg.png";
  
  const assetsToFix = {
    maca: {
      url: macaAsset,
      names: ['macarrao', 'espaguete', 'penne', 'parafuso', 'vinagre', 'limpa aluminio', 'lava roupas', 'nissin', 'miojo']
    },
    maracuja: {
      url: maracujaAsset,
      names: ['biscoito', 'gelatina', 'sabonete', 'hidratante', 'esfoliante']
    }
  };

  if (products) {
    for (const p of products) {
      const normalizedName = p.name.toLowerCase();
      
      // Fix items that incorrectly got the Apple (Maçã) fruit image
      if (p.image_url === assetsToFix.maca.url) {
        if (assetsToFix.maca.names.some(keyword => normalizedName.includes(keyword))) {
          console.log(`Resetando imagem incorreta de Maçã: ${p.name}`);
          await supabase.from('products').update({ image_url: null }).eq('id', p.id);
        }
      }
      
      // Fix items that incorrectly got the Passion Fruit (Maracujá) fruit image
      if (p.image_url === assetsToFix.maracuja.url) {
        if (assetsToFix.maracuja.names.some(keyword => normalizedName.includes(keyword))) {
          console.log(`Resetando imagem incorreta de Maracujá: ${p.name}`);
          await supabase.from('products').update({ image_url: null }).eq('id', p.id);
        }
      }
    }
  }

  // Second pass: specifically apply the correct Pasta images which were overriden by the Apple regex
  console.log('--- Aplicando imagens corretas de Macarrão ---');
  const pastaMappings = [
    { pattern: /araguaia.*espaguete/i, url: "/__l5e/assets-v1/45091764-1563-42e1-b75d-35e95b0f19a4/macarrao-araguaia-400g.png" },
    { pattern: /miragina.*espaguete/i, url: "/__l5e/assets-v1/c4754ae6-18f9-4a8b-ae5d-4b9e9b88cdd2/macarrao-miragina-500g.png" },
    { pattern: /liane.*espaguete/i, url: "/__l5e/assets-v1/c8733470-8777-4581-9b7e-96b60c9b0e25/macarrao-liane-400g.png" },
    { pattern: /lilita.*espaguete|d'italia.*espaguete/i, url: "/__l5e/assets-v1/52e92c43-9cd3-41a4-92df-420239b03ef3/macarrao-lilita-500g.png" }
  ];

  for (const m of pastaMappings) {
    const { data: matches } = await supabase.from('products').select('id, name').ilike('name', `%${m.pattern.source.replace(/\\i|i/g, '').replace(/\.\*/g, '%')}%`);
    if (matches) {
      for (const p of matches) {
        console.log(`Aplicando imagem correta: ${p.name}`);
        await supabase.from('products').update({ image_url: m.url }).eq('id', p.id);
      }
    }
  }
}
refineBatch14();
