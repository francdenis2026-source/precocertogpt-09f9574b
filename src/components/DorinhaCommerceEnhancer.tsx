import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { BookOpen, Check, Copy, CreditCard, ExternalLink, LockKeyhole, QrCode, ShieldCheck, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Book={id:string;slug:string;name:string;price:number;promotional_price:number|null;price_on_request:boolean;preview_url?:string|null;preview_summary?:string|null;external_url?:string|null};
type Profile={merchant:{guest_pix_enabled?:boolean};books:Book[]};
type PixResult={orderNumber:string;status:string;qrCode?:string|null;qrCodeBase64?:string|null;ticketUrl?:string|null;total:number};
const brl=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
const authorPaths=new Set(["/autora/dorinha-barroso","/dorinha-barroso"]);
function qrUrl(slug:string){const base=String(import.meta.env.VITE_SUPABASE_URL||"").replace(/\/$/,"");return `${base}/functions/v1/book-sales-qr?book=${encodeURIComponent(slug)}`}
function upperName(value:string){return value.toLocaleUpperCase("pt-BR")}
function lowerEmail(value:string){return value.toLocaleLowerCase("pt-BR").replace(/\s/g,"")}
function maskCpf(value:string){const digits=value.replace(/\D/g,"").slice(0,11);return digits.replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2")}
function maskPhone(value:string){const digits=value.replace(/\D/g,"").slice(0,11);return digits.length>10?digits.replace(/(\d{2})(\d{5})(\d{1,4})/,"($1) $2-$3"):digits.replace(/(\d{2})(\d{4})(\d{1,4})/,"($1) $2-$3")}
async function functionErrorMessage(error:unknown){
 const fallback=error instanceof Error?error.message:"Não foi possível gerar o PIX.";
 const context=(error as {context?:Response})?.context;
 if(!context)return fallback;
 try{const payload=await context.clone().json();return payload?.error||payload?.detail||fallback}catch{return fallback}
}

export function DorinhaCommerceEnhancer(){
 const location=useLocation();
 const active=authorPaths.has(location.pathname);
 const [profile,setProfile]=useState<Profile|null>(null),[book,setBook]=useState<Book|null>(null),[pix,setPix]=useState<PixResult|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(""),[copied,setCopied]=useState(false),[showQr,setShowQr]=useState(false);
 useEffect(()=>{if(!active||!supabase)return;void supabase.rpc("author_store_public_profile",{_slug:"dorinha-barroso-livros"}).then(({data})=>setProfile(data as Profile));},[active]);
 useEffect(()=>{if(!active||!profile)return;const wanted=new URLSearchParams(location.search).get("comprar");if(wanted){const b=profile.books.find(x=>x.slug===wanted);if(b)queueMicrotask(()=>setBook(b))}},[active,profile,location.search]);
 useEffect(()=>{if(!active||!profile)return;const enhance=()=>{document.querySelectorAll("article").forEach(card=>{const title=Array.from(card.querySelectorAll("h3,strong")).map(x=>x.textContent?.trim()).find(t=>profile.books.some(b=>b.name===t));if(!title)return;const b=profile.books.find(x=>x.name===title);if(!b)return;const direct=Array.from(card.querySelectorAll("a")).find(a=>a.textContent?.includes("Comprar direto"));if(direct&&!direct.getAttribute("data-pc-pix")){direct.setAttribute("data-pc-pix",b.slug);direct.setAttribute("href",`?comprar=${encodeURIComponent(b.slug)}`);direct.innerHTML="Comprar com PIX";direct.addEventListener("click",e=>{e.preventDefault();setBook(b);history.replaceState(null,"",`${location.pathname}?comprar=${encodeURIComponent(b.slug)}`)});const row=document.createElement("div");row.setAttribute("data-pc-book-tools",b.slug);row.style.cssText="display:flex;gap:6px;margin-top:8px";if(b.preview_url){const a=document.createElement("a");a.href=b.preview_url;a.target="_blank";a.rel="noreferrer";a.textContent="Ler prévia";a.style.cssText="flex:1;text-align:center;padding:9px;border:1px solid #ded6df;border-radius:9px;text-decoration:none;color:#493c4e;font-size:11px;font-weight:800";row.appendChild(a)}const q=document.createElement("button");q.type="button";q.textContent="QR da obra";q.style.cssText="flex:1;padding:9px;border:1px solid #ded6df;border-radius:9px;background:#fff;color:#493c4e;font-size:11px;font-weight:800;cursor:pointer";q.onclick=()=>{setBook(b);setShowQr(true)};row.appendChild(q);direct.parentElement?.parentElement?.appendChild(row)}})};enhance();const mo=new MutationObserver(enhance);mo.observe(document.body,{subtree:true,childList:true});return()=>mo.disconnect()},[active,profile,location.pathname]);
 const unit=useMemo(()=>book?Number(book.promotional_price??book.price??0):0,[book]);
 function close(){setBook(null);setPix(null);setError("");setShowQr(false);if(active)history.replaceState(null,"",location.pathname)}
 function formatField(e:ChangeEvent<HTMLInputElement>,formatter:(value:string)=>string){e.currentTarget.value=formatter(e.currentTarget.value)}
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!book||!supabase)return;setBusy(true);setError("");setPix(null);
  const fd=new FormData(e.currentTarget);
  const body={bookId:book.id,quantity:Number(fd.get("quantity")||1),name:upperName(String(fd.get("name")||"").trim()),email:lowerEmail(String(fd.get("email")||"").trim()),cpf:String(fd.get("cpf")||"").replace(/\D/g,""),phone:String(fd.get("phone")||"").replace(/\D/g,"")};
  const {data,error:fnError}=await supabase.functions.invoke("author-guest-pix",{body});setBusy(false);
  if(fnError||data?.error){setError(data?.error||await functionErrorMessage(fnError)||"Não foi possível gerar o PIX.");return}setPix(data as PixResult)
 }
 async function copyPix(){if(!pix?.qrCode)return;await navigator.clipboard.writeText(pix.qrCode);setCopied(true);setTimeout(()=>setCopied(false),1600)}
 if(!active||!book)return null;
 return <div style={s.overlay} role="dialog" aria-modal="true" aria-labelledby="pix-title"><style>{`
  .pc-pix-modal h2{font-size:clamp(1.35rem,3vw,1.8rem);line-height:1.05;margin:4px 0}
  .pc-pix-modal h3,.pc-pix-modal p{margin:3px 0}
  @media(max-width:620px){.pc-pix-fields{grid-template-columns:1fr!important}.pc-pix-modal{max-height:calc(100dvh - 10px)!important;border-radius:13px!important}.pc-pix-form{padding:11px 14px 14px!important}.pc-pix-summary{grid-template-columns:1fr auto!important}.pc-pix-modal .pc-pix-summary>div:last-child{text-align:right!important}}
  @media(max-height:720px) and (min-width:621px){.pc-pix-modal .pc-pix-fields{gap:6px 9px!important}.pc-pix-modal input,.pc-pix-modal select{min-height:35px!important}.pc-pix-modal .pc-pix-form{gap:6px!important;padding-top:10px!important;padding-bottom:11px!important}}
 `}</style><div className="pc-pix-modal" style={s.modal}>
  <button type="button" aria-label="Fechar compra" style={s.close} onClick={close}><X size={20}/></button>
  <div style={s.brandBar}><span>PREÇOCERTO</span><div><ShieldCheck size={15}/> Ambiente seguro</div></div>
  <div style={s.head}><span style={s.kicker}>COMPRA DIRETA · PIX</span><h2 id="pix-title">Finalize seu pedido</h2><p style={s.bookName}>{book.name}</p><p>Preencha seus dados para gerar o QR Code. Não é necessário criar uma conta.</p></div>
  {showQr&&!pix?<section style={s.qrSection}><span style={s.iconCircle}><QrCode size={25}/></span><h3>QR da página desta obra</h3><p>Use este código para voltar diretamente à compra deste título.</p><img src={qrUrl(book.slug)} alt={`QR para comprar ${book.name}`} style={s.bookQr}/><button style={s.primary} onClick={()=>setShowQr(false)}>Continuar para o pagamento</button></section>:pix?<section style={s.pix}><span style={s.successIcon}><Check size={25}/></span><span style={s.ok}>PIX GERADO COM SUCESSO</span><h3>Pedido #{pix.orderNumber}</h3><strong style={s.total}>{brl.format(pix.total)}</strong>{pix.qrCodeBase64&&<img src={`data:image/png;base64,${pix.qrCodeBase64}`} alt="QR Code PIX" style={s.pixQr}/>}<button onClick={copyPix} style={s.primary}><Copy size={17}/>{copied?"Código copiado":"Copiar código PIX"}</button>{pix.ticketUrl&&<a href={pix.ticketUrl} target="_blank" rel="noreferrer" style={s.secondary}><ExternalLink size={16}/> Abrir no Mercado Pago</a>}<p style={s.secureNote}><LockKeyhole size={15}/> A confirmação acontece automaticamente após o pagamento.</p></section>:<form className="pc-pix-form" onSubmit={submit} style={s.form}>
   <div className="pc-pix-summary" style={s.orderSummary}><div><span>Livro selecionado</span><strong>{book.name}</strong></div><div style={s.price}><span>Valor unitário</span><strong>{brl.format(unit)}</strong></div></div>
   {unit<=0&&<div style={s.warning}>O preço deste título ainda não foi definido. O PIX será liberado assim que o valor for atualizado.</div>}
   {book.preview_url&&<a href={book.preview_url} target="_blank" rel="noreferrer" style={s.preview}><BookOpen size={16}/> Ler uma prévia antes de comprar</a>}
   <div style={s.sectionLabel}>DADOS DO COMPRADOR</div>
   <div className="pc-pix-fields" style={s.fields}>
    <label style={s.label}>Nome completo<input style={s.input} name="name" required minLength={3} maxLength={120} autoComplete="name" placeholder="SEU NOME COMPLETO" onInput={e=>formatField(e as ChangeEvent<HTMLInputElement>,upperName)}/></label>
    <label style={s.label}>E-mail para confirmação<input style={s.input} name="email" type="email" required maxLength={160} autoComplete="email" placeholder="seuemail@exemplo.com" onInput={e=>formatField(e as ChangeEvent<HTMLInputElement>,lowerEmail)}/></label>
    <label style={s.label}>CPF<input style={s.input} name="cpf" inputMode="numeric" required maxLength={14} placeholder="000.000.000-00" onInput={e=>formatField(e as ChangeEvent<HTMLInputElement>,maskCpf)}/></label>
    <label style={s.label}>Telefone <small>(opcional)</small><input style={s.input} name="phone" inputMode="tel" autoComplete="tel" maxLength={15} placeholder="(68) 99999-9999" onInput={e=>formatField(e as ChangeEvent<HTMLInputElement>,maskPhone)}/></label>
    <label style={s.label}>Quantidade<select style={s.input} name="quantity" defaultValue="1" required>{[1,2,3,4,5,6,7,8,9,10].map(q=><option key={q} value={q}>{q} {q===1?"exemplar":"exemplares"}</option>)}</select></label>
   </div>
   {error&&<div role="alert" style={s.error}><strong>Não foi possível gerar o PIX.</strong><span>{error}</span></div>}
   <button disabled={busy||unit<=0} style={{...s.primary,...((busy||unit<=0)?s.disabled:{})}}><CreditCard size={18}/>{busy?"Gerando seu PIX…":"Gerar PIX agora"}</button>
   <div style={s.trustRow}><span><ShieldCheck size={14}/> Pagamento Mercado Pago</span><span><LockKeyhole size={14}/> Dados protegidos</span></div>
   <small style={s.helper}>Seu CPF é usado somente para processar o pagamento. O pedido será confirmado automaticamente quando o Mercado Pago aprovar o PIX.</small>
  </form>}
 </div></div>
}

const s:Record<string,React.CSSProperties>={
 overlay:{position:"fixed",inset:0,zIndex:9999,background:"rgba(17,12,20,.78)",backdropFilter:"blur(10px)",display:"grid",placeItems:"center",padding:14},
 modal:{width:"min(720px,100%)",maxHeight:"calc(100dvh - 20px)",overflow:"auto",background:"#fff",borderRadius:18,position:"relative",boxShadow:"0 28px 90px rgba(0,0,0,.38)",fontFamily:"Inter,system-ui,sans-serif",color:"#241d27"},
 close:{position:"absolute",right:12,top:9,border:"1px solid #e8e1e9",background:"#fff",color:"#46394a",borderRadius:9,width:34,height:34,display:"grid",placeItems:"center",cursor:"pointer",zIndex:2},
 brandBar:{minHeight:52,padding:"0 58px 0 22px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #eee8ef",fontSize:9,fontWeight:900,letterSpacing:".09em"},
 head:{padding:"15px 22px 12px",background:"linear-gradient(135deg,#fbf8fc,#f3ecf5)",borderBottom:"1px solid #ece4ee"},kicker:{fontSize:9,fontWeight:900,letterSpacing:".14em",color:"#7a4e83"},bookName:{fontWeight:850,color:"#513d57",margin:"5px 0 2px"},
 form:{display:"grid",gap:9,padding:"14px 22px 17px"},orderSummary:{display:"grid",gridTemplateColumns:"1fr auto",gap:14,alignItems:"center",padding:"11px 13px",border:"1px solid #e8e1e9",borderRadius:11,background:"#fcfbfc"},price:{textAlign:"right",display:"grid",gap:2},sectionLabel:{fontSize:9,fontWeight:900,letterSpacing:".13em",color:"#806e84",marginTop:1},
 fields:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"9px 11px"},two:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9},label:{display:"grid",gap:4,fontSize:10,fontWeight:800,color:"#493e4c"},input:{width:"100%",minHeight:39,border:"1px solid #dcd4de",borderRadius:9,padding:"0 11px",font:"inherit",fontSize:12,color:"#29202c",background:"#fff",outlineColor:"#76507d",boxSizing:"border-box"},
 warning:{padding:12,borderRadius:10,background:"#fff5df",color:"#795515",fontSize:12},preview:{display:"flex",alignItems:"center",gap:7,padding:11,borderRadius:10,border:"1px solid #ded5df",textDecoration:"none",color:"#493b4e",fontWeight:800,fontSize:12},
 primary:{minHeight:43,border:0,borderRadius:10,background:"linear-gradient(135deg,#44294e,#2d1935)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontWeight:900,cursor:"pointer",textDecoration:"none",fontSize:12,boxShadow:"0 8px 18px rgba(57,32,65,.18)"},disabled:{opacity:.55,cursor:"not-allowed",boxShadow:"none"},secondary:{minHeight:40,border:"1px solid #ddd5df",borderRadius:9,background:"#fff",color:"#45384b",display:"flex",alignItems:"center",justifyContent:"center",gap:7,fontWeight:800,cursor:"pointer",textDecoration:"none"},
 error:{padding:13,borderRadius:11,background:"#fff0f0",border:"1px solid #f3cccc",color:"#932c2c",fontSize:12,display:"grid",gap:4},helper:{color:"#7c727f",fontSize:10,lineHeight:1.55,textAlign:"center"},trustRow:{display:"flex",justifyContent:"center",flexWrap:"wrap",gap:16,color:"#5e6c63",fontSize:10,fontWeight:800},secureNote:{display:"flex",alignItems:"center",justifyContent:"center",gap:6,color:"#657168",fontSize:11},
 pix:{display:"grid",gap:8,textAlign:"center",padding:"16px 22px"},successIcon:{width:44,height:44,borderRadius:"50%",display:"grid",placeItems:"center",background:"#e9f8ef",color:"#1f7b49",margin:"0 auto"},ok:{color:"#237147",fontSize:9,letterSpacing:".12em",fontWeight:900},total:{fontSize:25},pixQr:{width:"min(205px,35vh)",height:"min(205px,35vh)",objectFit:"contain",margin:"0 auto",border:"1px solid #ece8ed",borderRadius:12,padding:6},
 qrSection:{display:"grid",placeItems:"center",textAlign:"center",gap:8,padding:"18px 22px"},iconCircle:{width:44,height:44,borderRadius:"50%",display:"grid",placeItems:"center",background:"#f2ebf4",color:"#65456d"},bookQr:{width:"min(190px,34vh)",height:"min(190px,34vh)",background:"white",border:"1px solid #eee",borderRadius:12,padding:6}
};
