import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});

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
  const body=await req.json().catch(()=>({})),merchantId=String(body.merchantId||""),email=String(body.email||"").trim().toLowerCase();
  if(!merchantId||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:"Estabelecimento e e-mail válido são obrigatórios."},400);
  const {data:merchant}=await admin.from("merchants").select("id,status").eq("id",merchantId).maybeSingle();
  if(!merchant)return json({error:"Estabelecimento não encontrado."},404);
  let target=null as {id:string}|null,invited=false,page=1;
  while(!target&&page<=20){const {data,error}=await admin.auth.admin.listUsers({page,perPage:1000});if(error)return json({error:"Não foi possível consultar as contas."},500);target=data.users.find(u=>u.email?.toLowerCase()===email)??null;if(data.users.length<1000)break;page++}
  if(!target){const {data,error}=await admin.auth.admin.inviteUserByEmail(email,{redirectTo:`${req.headers.get("origin")||url}/redefinir-senha`});if(error||!data.user)return json({error:error?.message||"Não foi possível enviar o convite."},400);target=data.user;invited=true}
  const {error:memberError}=await admin.from("merchant_members").upsert({merchant_id:merchantId,user_id:target.id,role:"owner",active:true},{onConflict:"merchant_id,user_id"});
  if(memberError)return json({error:memberError.message},400);
  if(merchant.status!=="active")await admin.from("merchants").update({status:"active",updated_at:new Date().toISOString()}).eq("id",merchantId);
  return json({ok:true,invited});
});
