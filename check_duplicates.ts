import { createClient } from '@supabase/supabase-js';

async function check() {
  const url = "https://kqueiohjadwzxafdrrxk.supabase.co";
  const key = "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";
  const supabase = createClient(url, key);

  const { data: products } = await supabase.from('products').select('name, brand, size, unit');
  
  if (!products) return;

  const duplicates = new Map();
  products.forEach(p => {
    const key = `${p.name?.toLowerCase()}|${p.brand?.toLowerCase()}|${p.size?.toLowerCase()}|${p.unit?.toLowerCase()}`;
    duplicates.set(key, (duplicates.get(key) || 0) + 1);
  });

  const repeated = Array.from(duplicates.entries())
    .filter(([_, count]) => count > 1)
    .map(([key, count]) => ({ key, count }));

  console.log(JSON.stringify(repeated.slice(0, 10)));
}
check();
