import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
async function cpfAlias(cpf:string){const bytes=new TextEncoder().encode(`precocerto-owner:${cpf}`),hash=await crypto.subtle.digest("SHA-256",bytes);return `u-${Array.from(new Uint8Array(hash)).map(x=>x.toString(16).padStart(2,"0")).join("")}@login.precocerto.internal`}

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
  if(req.method!=="POST")return json({error:"Método não permitido"},405);
  const url=Deno.env.get("SUPABASE_URL")!,anon=Deno.env.get("SUPABASE_ANON_KEY")!,service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const auth=req.headers.get("Authorization")||"";
  const caller=createClient(url,anon,{global:{headers:{Authorization:auth}}});
  const admin=createClient(url,service,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data:{user}}=await caller.auth.getUser();
  if(!user)return json({error:"Não autenticado"},401);
  const {data:role}=await admin.from("user_roles").select("role").eq("user_id",user.id).in("role",["super_admin","admin"]).maybeSingle();
  if(!role)return json({error:"Apenas administradores podem ativar responsáveis."},403);
  const body=await req.json().catch(()=>({})),merchantId=String(body.merchantId||""),cpf=String(body.cpf||"").replace(/\D/g,""),pin=String(body.pin||""),cpfMode=cpf.length===11,email=cpfMode?await cpfAlias(cpf):String(body.email||"").trim().toLowerCase();
  if(!merchantId||(!cpfMode&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))||(cpfMode&&!/^[0-9]{6}$/.test(pin)))return json({error:"Informe e-mail válido ou CPF com novo PIN de 6 dígitos."},400);
  const {data:merchant}=await admin.from("merchants").select("id,status").eq("id",merchantId).maybeSingle();
  if(!merchant)return json({error:"Estabelecimento não encontrado."},404);
  let target=null as {id:string}|null,invited=false,page=1;
  while(!target&&page<=20){const {data,error}=await admin.auth.admin.listUsers({page,perPage:1000});if(error)return json({error:"Não foi possível consultar as contas."},500);target=data.users.find(u=>u.email?.toLowerCase()===email)??null;if(data.users.length<1000)break;page++}
  if(!target){if(cpfMode){const {data,error}=await admin.auth.admin.createUser({email,password:pin,email_confirm:true,user_metadata:{account_type:"merchant",credential:"cpf_pin"}});if(error||!data.user)return json({error:error?.message||"Não foi possível criar o acesso."},400);target=data.user}else{const {data,error}=await admin.auth.admin.inviteUserByEmail(email,{redirectTo:`${req.headers.get("origin")||url}/redefinir-senha`});if(error||!data.user)return json({error:error?.message||"Não foi possível enviar o convite."},400);target=data.user;invited=true}}else if(cpfMode){const {error}=await admin.auth.admin.updateUserById(target.id,{password:pin});if(error)return json({error:"Não foi possível atualizar o PIN."},400)}
  const {error:memberError}=await admin.from("merchant_members").upsert({merchant_id:merchantId,user_id:target.id,role:"owner",active:true},{onConflict:"merchant_id,user_id"});
  if(memberError)return json({error:memberError.message},400);
  if(merchant.status!=="active")await admin.from("merchants").update({status:"active",updated_at:new Date().toISOString()}).eq("id",merchantId);
  return json({ok:true,invited});
});
