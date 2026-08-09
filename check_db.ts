import { createClient } from '@supabase/supabase-js';

async function check() {
  const url = "https://kqueiohjadwzxafdrrxk.supabase.co";
  const key = "sb_publishable_7EXe8ySDhRTgYHQfWv-nag_tNOserrG";
  
  const supabase = createClient(url, key);
  
  const { count: estCount, error: errEst } = await supabase.from('establishments').select('*', { count: 'exact', head: true });
  const { count: prodCount, error: errProd } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: priceCount, error: errPrice } = await supabase.from('prices').select('*', { count: 'exact', head: true });
  
  console.log(JSON.stringify({
    establishments: estCount,
    products: prodCount,
    prices: priceCount,
    errors: { est: errEst?.message, prod: errProd?.message, price: errPrice?.message }
  }));
}
check();
