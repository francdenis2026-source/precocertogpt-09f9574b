import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ArrowRight, BookOpen, CheckCircle2, ExternalLink, Feather, MapPin, MessageCircle, Share2, Sparkles, Store } from "lucide-react";
import { supabase } from "../lib/supabase";
import imagimacaoAsset from "../assets/uma-viagem-ao-mundo-da-imaginacao.png.asset.json";
import mentePerversaAsset from "../assets/mente-perversa.png.asset.json";
import superacaoAsset from "../assets/uma-historia-de-superacao.png.asset.json";
import despertarAsset from "../assets/o-despertar-para-o-mundo-literario.png.asset.json";
import "./DorinhaAuthorStoreProMax.css";

type AssetMeta={url:string};
type ExternalStore={label:string;url:string};
type Book={id:string;slug:string;name:string;image_url:string|null;description:string|null;price:number;promotional_price:number|null;price_on_request:boolean;available:boolean;external_url?:string|null};
type MerchantProfile={whatsapp?:string|null;author_name?:string|null;author_bio?:string|null;author_birthplace?:string|null;external_stores?:unknown};
type Profile={merchant?:MerchantProfile|null;books?:unknown};

const localBooks:Book[]=[
 {id:"imaginação",slug:"uma-viagem-ao-mundo-da-imaginacao",name:"Uma Viagem ao Mundo da Imaginação",image_url:(imagimacaoAsset as AssetMeta).url,description:"Uma obra para leitores que gostam de atravessar novas paisagens pela força da imaginação.",price:0,promotional_price:null,price_on_request:true,available:true},
 {id:"mente",slug:"mente-perversa",name:"Mente Perversa",image_url:(mentePerversaAsset as AssetMeta).url,description:"Uma leitura marcada por tensão, escolhas e camadas humanas que convidam à reflexão.",price:0,promotional_price:null,price_on_request:true,available:true},
 {id:"superação",slug:"uma-historia-de-superacao",name:"Uma História de Superação",image_url:(superacaoAsset as AssetMeta).url,description:"Uma narrativa sobre resistência, recomeços e a capacidade de seguir adiante.",price:0,promotional_price:null,price_on_request:true,available:true},
 {id:"despertar",slug:"o-despertar-para-o-mundo-literario",name:"O Despertar para o Mundo Literário",image_url:(despertarAsset as AssetMeta).url,description:"Um convite para descobrir a literatura como espaço de expressão, memória e transformação.",price:0,promotional_price:null,price_on_request:true,available:true},
];

const cleanPhone=(v:string)=>v.replace(/\D/g,"");
const wa=(phone:string,book?:string)=>`https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(book?`Olá, Dorinha! Encontrei o livro “${book}” no PreçoCerto e gostaria de saber valor, disponibilidade e como comprar.`:"Olá, Dorinha! Encontrei sua página no PreçoCerto e gostaria de conhecer seus livros.")}`;

function asBookArray(value:unknown):Book[]{
 if(!Array.isArray(value)) return [];
 return value.filter((item):item is Book=>Boolean(item&&typeof item==="object"&&typeof (item as Book).name==="string"&&typeof (item as Book).slug==="string"));
}
function asStoreArray(value:unknown):ExternalStore[]{
 if(!Array.isArray(value)) return [];
 return value.filter((item):item is ExternalStore=>Boolean(item&&typeof item==="object"&&typeof (item as ExternalStore).label==="string"&&typeof (item as ExternalStore).url==="string"&&Boolean((item as ExternalStore).url)));
}

export function DorinhaAuthorStoreProMax(){
 const [profile,setProfile]=useState<Profile|null>(null);const [copied,setCopied]=useState(false);
 useEffect(()=>{document.title="Dorinha Barroso · Livros | PreçoCerto";let alive=true;(async()=>{if(!supabase)return;try{const {data,error}=await supabase.rpc("author_store_public_profile",{_slug:"dorinha-barroso-livros"});if(!alive||error||!data)return;const normalized=(typeof data==="string"?(()=>{try{return JSON.parse(data)}catch{return null}})():data) as Profile|null;if(normalized&&typeof normalized==="object")setProfile(normalized)}catch{/* fallback local permanente */}})();return()=>{alive=false}},[]);
 const remoteBooks=useMemo(()=>asBookArray(profile?.books),[profile]);
 const books=useMemo(()=>{if(!remoteBooks.length)return localBooks;return localBooks.map(local=>{const match=remoteBooks.find(b=>b.slug===local.slug||b.name.toLowerCase()===local.name.toLowerCase());return match?{...local,...match,image_url:match.image_url||local.image_url}:local})},[remoteBooks]);
 const merchant=profile?.merchant&&typeof profile.merchant==="object"?profile.merchant:null;
 const author=merchant?.author_name||"Dorinha Barroso";const bio=merchant?.author_bio||"Uma autora que transforma experiências, imaginação e sensibilidade em livros feitos para criar conexão com seus leitores.";const birthplace=merchant?.author_birthplace||"Acre";const whatsapp=merchant?.whatsapp||"5568999564762";const stores=useMemo(()=>asStoreArray(merchant?.external_stores).slice(0,3),[merchant]);
 async function share(){const d={title:"Dorinha Barroso · Livros",text:"Conheça os livros de Dorinha Barroso no PreçoCerto.",url:window.location.href};if(navigator.share){try{await navigator.share(d);return}catch{}}try{await navigator.clipboard?.writeText(window.location.href);setCopied(true);setTimeout(()=>setCopied(false),1600)}catch{/* compartilhamento indisponível */}}
 return <main className="dorinha-pro">
  <header className="dorinha-pro__top"><a href="/" className="dorinha-pro__brand">PreçoCerto <span>Marketplace local</span></a><nav><a href="#livros">Livros</a><a href="#autora">A autora</a><button onClick={share} type="button"><Share2/>{copied?"Link copiado":"Compartilhar"}</button></nav></header>
  <section className="dorinha-pro__hero"><div className="dorinha-pro__aurora one"/><div className="dorinha-pro__aurora two"/><div className="dorinha-pro__hero-copy"><span className="dorinha-pro__eyebrow"><Feather/> Literatura local em destaque</span><h1>Histórias que nascem perto e podem chegar <em>muito longe.</em></h1><p>Conheça o universo literário de <strong>{author}</strong>, descubra seus livros e fale diretamente com a autora para saber disponibilidade e formas de compra.</p><div className="dorinha-pro__hero-actions"><a href="#livros">Explorar os livros <ArrowRight/></a><a href={wa(whatsapp)} target="_blank" rel="noreferrer"><MessageCircle/> Falar com a autora</a></div><div className="dorinha-pro__hero-meta"><span><CheckCircle2/> Página oficial no PreçoCerto</span><span><MapPin/> {birthplace}</span></div></div><div className="dorinha-pro__books-stage">{books.slice(0,4).map((book,index)=><img key={book.id} src={book.image_url||undefined} alt={`Capa de ${book.name}`} style={{"--book-index":index} as CSSProperties}/>)}</div></section>
  <section className="dorinha-pro__intro"><div><span>Uma vitrine autoral</span><h2>Livros com identidade, presença e uma experiência de compra mais humana.</h2></div><p>Esta página reúne as obras da autora em um espaço editorial próprio dentro do marketplace local, valorizando o livro, a história de quem escreve e o contato direto com o leitor.</p></section>
  <section className="dorinha-pro__catalog" id="livros"><div className="dorinha-pro__section-head"><div><span>Biblioteca da autora</span><h2>Escolha sua próxima leitura.</h2></div><BookOpen/></div><div className="dorinha-pro__grid">{books.map((book,index)=>{const price=book.promotional_price||book.price;return <article className="dorinha-pro__book" key={book.id} style={{"--delay":`${index*45}ms`} as CSSProperties}><div className="dorinha-pro__cover"><span>{String(index+1).padStart(2,"0")}</span>{book.image_url?<img src={book.image_url} alt={`Capa de ${book.name}`} loading="lazy"/>:<BookOpen/>}</div><div className="dorinha-pro__book-body"><span className="dorinha-pro__book-label">Obra de {author}</span><h3>{book.name}</h3><p>{book.description||"Conheça esta obra e fale diretamente com a autora para receber mais informações."}</p><div className="dorinha-pro__book-footer"><strong>{book.price_on_request||!price?"Consulte o valor":price.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</strong><a href={wa(whatsapp,book.name)} target="_blank" rel="noreferrer">Quero este livro <MessageCircle/></a></div></div></article>})}</div></section>
  <section className="dorinha-pro__author" id="autora"><div className="dorinha-pro__author-art"><div className="dorinha-pro__monogram">DB</div><span>Palavras também criam lugares.</span></div><div className="dorinha-pro__author-copy"><span className="dorinha-pro__eyebrow"><Sparkles/> Sobre a autora</span><h2>{author}</h2><p>{bio}</p><div className="dorinha-pro__facts"><div><strong>{books.length}</strong><span>obras em destaque</span></div><div><strong>Local</strong><span>literatura próxima do leitor</span></div><div><strong>Direto</strong><span>contato com a autora</span></div></div><a href={wa(whatsapp)} target="_blank" rel="noreferrer"><MessageCircle/> Conversar pelo WhatsApp</a></div></section>
  <section className="dorinha-pro__market"><div><Store/><span>Onde encontrar</span><h2>Compre de forma simples e escolha o canal que preferir.</h2><p>Fale diretamente com a autora ou acesse uma das plataformas cadastradas quando disponíveis.</p></div><div className="dorinha-pro__market-actions"><a className="is-primary" href={wa(whatsapp)} target="_blank" rel="noreferrer"><MessageCircle/> Compra direta</a>{stores.map(store=><a key={`${store.label}-${store.url}`} href={store.url} target="_blank" rel="noreferrer">{store.label}<ExternalLink/></a>)}</div></section>
  <footer className="dorinha-pro__footer"><div><strong>Dorinha Barroso</strong><span>Literatura local dentro do PreçoCerto Marketplace</span></div><a href="/estabelecimentos">Explorar o marketplace <ArrowRight/></a></footer>
 </main>
}
