import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kqueiohjadwzxafdrrxk.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function finalSyncBatch14() {
  console.log('--- Sincronização Final Lote 14 ---');
  
  const finalMappings = [
    { pattern: 'Macarrão Araguaia Espaguete 400g', url: "/__l5e/assets-v1/45091764-1563-42e1-b75d-35e95b0f19a4/macarrao-araguaia-400g.png" },
    { pattern: 'Macarrão Espaguete Miragina 500g', url: "/__l5e/assets-v1/c4754ae6-18f9-4a8b-ae5d-4b9e9b88cdd2/macarrao-miragina-500g.png" },
    { pattern: 'Macarrão Liane Espaguete 400g', url: "/__l5e/assets-v1/c8733470-8777-4581-9b7e-96b60c9b0e25/macarrao-liane-400g.png" },
    { pattern: 'Macarrão Lilita Espaguete 500g', url: "/__l5e/assets-v1/52e92c43-9cd3-41a4-92df-420239b03ef3/macarrao-lilita-500g.png" },
    { pattern: 'Macarrão Instantâneo Nissin Lámen Galinha', url: "/__l5e/assets-v1/11ac7348-bc3a-47bd-b8a8-553d7bfb70c6/nissin-galinha.png" },
    { pattern: 'Macarrão Instantâneo Nissin Lámen Carne', url: "/__l5e/assets-v1/eaf6d2a0-50f7-4c3d-b70d-aae6be671ac3/nissin-carne-85g.png" },
    { pattern: 'Nissin Lámen Frango Assado com Limão', url: "/__l5e/assets-v1/78e61bbc-3673-49b7-8d5e-e4d86c0a85b0/nissin-limao-frango.png" },
    { pattern: 'Maçã (Kg)', url: "/__l5e/assets-v1/f8cdcce8-8153-4497-b5d7-330de503f84b/maca-kg.png" },
    { pattern: 'Maçã Comum', url: "/__l5e/assets-v1/f8cdcce8-8153-4497-b5d7-330de503f84b/maca-kg.png" },
    { pattern: 'Manga (Kg)', url: "/__l5e/assets-v1/eb57ffe1-17fd-41e9-b564-90a07d5eea4d/manga-kg.png" },
    { pattern: 'Maracujá (Kg)', url: "/__l5e/assets-v1/17fd1b14-b0e5-49fe-94fe-3cf62079f92a/maracuja-kg.png" }
  ];

  for (const m of finalMappings) {
    const { data } = await supabase.from('products').select('id, name').ilike('name', `%${m.pattern}%`);
    if (data && data.length > 0) {
      for (const p of data) {
        console.log(`Forçando imagem em: ${p.name}`);
        await supabase.from('products').update({ image_url: m.url }).eq('id', p.id);
      }
    }
  }
}
finalSyncBatch14();
