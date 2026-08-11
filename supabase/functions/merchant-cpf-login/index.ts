import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
async function alias(cpf:string){const bytes=new TextEncoder().encode(`precocerto-owner:${cpf}`),hash=await crypto.subtle.digest("SHA-256",bytes);return `u-${Array.from(new Uint8Array(hash)).map(x=>x.toString(16).padStart(2,"0")).join("")}@login.precocerto.internal`}

Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return json({error:"Método não permitido"},405);
 const body=await req.json().catch(()=>({})),cpf=String(body.cpf||"").replace(/\D/g,""),pin=String(body.pin||"");
 if(cpf.length!==11||!/^[0-9]{6}$/.test(pin))return json({error:"CPF ou PIN inválidos."},400);
 const client=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await client.auth.signInWithPassword({email:await alias(cpf),password:pin});
 if(error||!data.session)return json({error:"Acesso empresarial não encontrado ou PIN incorreto."},401);
 return json({access_token:data.session.access_token,refresh_token:data.session.refresh_token,expires_in:data.session.expires_in});
});
