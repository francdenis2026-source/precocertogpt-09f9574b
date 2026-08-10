import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders,"Content-Type":"application/json; charset=utf-8"}});
const decoder=new TextDecoder();
function b64ToBytes(value:string){return Uint8Array.from(atob(value),c=>c.charCodeAt(0))}
async function importEncryptionKey(secret:string){const raw=b64ToBytes(secret);if(raw.length!==32)throw new Error("Chave de integração inválida");return crypto.subtle.importKey("raw",raw,"AES-GCM",false,["decrypt"])}
async function decryptToken(value:string,secret:string){const [version,ivB64,cipherB64]=value.split(":");if(version!=="v1"||!ivB64||!cipherB64)throw new Error("Conta Mercado Pago precisa ser reconectada");const key=await importEncryptionKey(secret);const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:b64ToBytes(ivB64)},key,b64ToBytes(cipherB64));return decoder.decode(plain)}
function validCpf(value:string){if(!/^\d{11}$/.test(value)||/^(\d)\1{10}$/.test(value))return false;const calc=(length:number)=>{let sum=0;for(let i=0;i<length;i++)sum+=Number(value[i])*(length+1-i);const digit=(sum*10)%11;return (digit===10?0:digit)===Number(value[length])};return calc(9)&&calc(10)}

Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
 if(req.method!=="POST")return json({error:"Método não permitido"},405);
 try{
  const supabaseUrl=Deno.env.get("SUPABASE_URL"),serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),encryptionKey=Deno.env.get("MERCADOPAGO_TOKEN_ENCRYPTION_KEY"),webhookUrl=Deno.env.get("MERCADOPAGO_WEBHOOK_URL");
  if(!supabaseUrl||!serviceKey)return json({error:"Serviço de pedidos não configurado"},503);
  if(!encryptionKey)return json({error:"Integração com Mercado Pago não configurada"},503);
  const body=await req.json().catch(()=>null);
  const bookId=String(body?.bookId||""),quantity=Math.trunc(Number(body?.quantity||1)),name=String(body?.name||"").trim().toLocaleUpperCase("pt-BR"),email=String(body?.email||"").trim().toLocaleLowerCase("pt-BR"),cpf=String(body?.cpf||"").replace(/\D/g,""),phone=String(body?.phone||"").replace(/\D/g,"");
  if(!bookId||!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:"Confira o nome e o e-mail informados"},400);
  if(quantity<1||quantity>10)return json({error:"A quantidade deve ser entre 1 e 10"},400);
  if(!validCpf(cpf))return json({error:"Informe um CPF válido"},400);
  const admin=createClient(supabaseUrl,serviceKey);
  const {data:book,error:bookError}=await admin.from("merchant_products").select("id,merchant_id,product_id,product_name,image_url,price,promotional_price,active,available,max_per_order,merchants!inner(id,status,business_type,service_settings)").eq("id",bookId).maybeSingle();
  if(bookError||!book)return json({error:"Livro não encontrado"},404);
  const merchant=Array.isArray(book.merchants)?book.merchants[0]:book.merchants;
  if(!book.active||!book.available||merchant?.status!=="active")return json({error:"Este livro não está disponível para compra"},409);
  if(!merchant?.service_settings?.guest_pix_enabled)return json({error:"O pagamento por PIX ainda não está habilitado para esta loja"},409);
  if(book.max_per_order&&quantity>Number(book.max_per_order))return json({error:`O limite para este título é ${book.max_per_order} por pedido`},400);
  const unitPrice=Number(book.promotional_price??book.price??0),total=Number((unitPrice*quantity).toFixed(2));
  if(!Number.isFinite(total)||total<=0)return json({error:"O preço deste livro ainda não foi definido"},409);
  const {data:connection}=await admin.from("merchant_payment_connections").select("access_token_encrypted,status").eq("merchant_id",book.merchant_id).eq("provider","mercadopago").maybeSingle();
  if(!connection?.access_token_encrypted||connection.status!=="connected")return json({error:"A conta Mercado Pago da loja ainda não está conectada"},409);
  let sellerToken:string;try{sellerToken=await decryptToken(connection.access_token_encrypted,encryptionKey)}catch{return json({error:"A conta Mercado Pago precisa ser reconectada"},409)}
  const {data:order,error:orderError}=await admin.from("orders").insert({merchant_id:book.merchant_id,customer_id:null,customer_name:name,customer_phone:phone||null,customer_email:email,delivery_type:"pickup",status:"pending_payment",payment_status:"pending",payment_provider:"mercadopago",subtotal:total,delivery_fee:0,discount:0,platform_fee:0,total,notes:"Compra direta de livro via PIX"}).select("id,order_number").single();
  if(orderError||!order)return json({error:"Não foi possível criar o pedido",detail:orderError?.message},500);
  const {error:itemError}=await admin.from("order_items").insert({order_id:order.id,product_id:book.product_id||null,merchant_product_id:book.id,product_name:book.product_name,image_url:book.image_url||null,quantity,unit_price:unitPrice,total_price:total});
  if(itemError){await admin.from("orders").delete().eq("id",order.id);return json({error:"Não foi possível adicionar o livro ao pedido"},500)}
  const paymentPayload:Record<string,unknown>={transaction_amount:total,description:String(book.product_name).slice(0,120),payment_method_id:"pix",external_reference:order.id,statement_descriptor:"PRECO CERTO",payer:{email,first_name:name.split(/\s+/)[0],last_name:name.split(/\s+/).slice(1).join(" ")||undefined,identification:{type:"CPF",number:cpf}},metadata:{order_id:order.id,order_number:order.order_number,merchant_id:book.merchant_id,guest_checkout:true}};
  if(webhookUrl)paymentPayload.notification_url=webhookUrl;
  const mpResponse=await fetch("https://api.mercadopago.com/v1/payments",{method:"POST",headers:{Authorization:`Bearer ${sellerToken}`,"Content-Type":"application/json",Accept:"application/json","X-Idempotency-Key":`pc-guest-${order.id}`},body:JSON.stringify(paymentPayload)});
  const payment=await mpResponse.json().catch(()=>({}));
  if(!mpResponse.ok||!payment?.id){await admin.from("orders").update({status:"cancelled",payment_status:"rejected",cancellation_reason:"Falha ao gerar PIX",updated_at:new Date().toISOString()}).eq("id",order.id);return json({error:"O Mercado Pago não conseguiu gerar o PIX",detail:payment?.message||payment?.error||payment?.cause?.[0]?.description},502)}
  await admin.from("payments").insert({order_id:order.id,merchant_id:book.merchant_id,provider:"mercadopago",external_payment_id:String(payment.id),external_reference:order.id,status:payment.status||"pending",gross_amount:total,provider_fee:0,platform_fee:0,merchant_net:total,payment_method:"pix",payload:{status_detail:payment.status_detail,live_mode:payment.live_mode}});
  await admin.from("order_events").insert({order_id:order.id,event_type:"pix_created",actor_type:"customer",message:"PIX gerado para compra direta",metadata:{external_payment_id:String(payment.id)}});
  const tx=payment.point_of_interaction?.transaction_data||{};
  return json({orderNumber:order.order_number,status:payment.status||"pending",qrCode:tx.qr_code||null,qrCodeBase64:tx.qr_code_base64||null,ticketUrl:tx.ticket_url||null,total});
 }catch(error){console.error("author-guest-pix",error);return json({error:"Erro interno ao gerar o PIX. Tente novamente em instantes."},500)}
});
