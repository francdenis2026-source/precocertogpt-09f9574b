import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

async function check() {
  const content = fs.readFileSync('src/lib/supabase.ts', 'utf8');
  const urlMatch = content.match(/SUPABASE_URL\s*=\s*['"]([^'"]+)['"]/);
  const keyMatch = content.match(/SUPABASE_ANON_KEY\s*=\s*['"]([^'"]+)['"]/);
  
  if (!urlMatch || !keyMatch) {
    console.log("Credenciais não encontradas no arquivo.");
    return;
  }
  
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  
  const { count: estCount } = await supabase.from('establishments').select('*', { count: 'exact', head: true });
  const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: priceCount } = await supabase.from('prices').select('*', { count: 'exact', head: true });
  
  console.log(JSON.stringify({
    establishments: estCount,
    products: prodCount,
    prices: priceCount
  }));
}
check();
