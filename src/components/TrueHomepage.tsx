import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Heart, ImageOff, MapPin, Menu, Search, ShieldCheck, ShoppingBasket, Sparkles, Store, TrendingDown, X } from "lucide-react";
import { buildCatalog, type Product, type StoreRow } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { getStoreLogoUrl } from "../data/storeLogos";
import { resolveProductImage } from "../data/productImageResolver";
import { searchProducts } from "../lib/productSearch";
import "./TrueHomepage.css";
import "./TrueHomepageInteractionProMax.css";
import "./TrueHomepageColorContrastProMax.css";
import "./TrueHomepageDensityProMax.css";
import "./TrueHomepageLiveSearchProMax.css";
import "./TrueHomepageSearchLayerProMax.css";
import "./TrueHomepageSecondaryHeroProMax.css";
import "./TrueHomepageSearchResultsProMax.css";
import "./TrueHomepageCardsModalProMax.css";
import "./TrueHomepageTasteDeep.css";
import "./TrueHomepageTasteV2.css";

const seed = buildCatalog();
const money = (value:number) => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(value);
const number = (value:number) => new Intl.NumberFormat("pt-BR").format(value);

function ProductImage({product}:{product:Product}) {
 const category=(product.category||"Produto").trim();
 const image=resolveProductImage(product);
 return <div className="th-product__media">{image?<img src={image} alt={product.name} loading="lazy"/>:<div className="th-product__placeholder" aria-label={`Imagem indisponível para ${product.name}`}><span><ImageOff aria-hidden="true"/></span><strong>{category}</strong><small>Imagem em atualização</small></div>}</div>;
}

function SearchThumb({product}:{product:Product}){
 const image=resolveProductImage(product);
 return <span className="th-search-result__thumb">{image?<img src={image} alt="" loading="lazy"/>:<ImageOff aria-hidden="true"/>}</span>;
}

export function TrueHomepage(){
 const [products,setProducts]=useState<Product[]>(seed.products);
 const [stores,setStores]=useState<StoreRow[]>(seed.stores);
 const [metrics,setMetrics]=useState(seed.metrics);
 const [query,setQuery]=useState("");
 const [menuOpen,setMenuOpen]=useState(false);
 const [selectedProduct,setSelectedProduct]=useState<Product|null>(null);

 useEffect(()=>{let active=true;fetchCatalog().then(r=>{if(active){setProducts(r.products);setStores(r.stores);setMetrics(r.metrics)}}).catch(()=>undefined);return()=>{active=false}},[]);
 useEffect(()=>{
  if(!selectedProduct) return;
  const previous=document.body.style.overflow;
  document.body.style.overflow="hidden";
  const onKey=(event:globalThis.KeyboardEvent)=>{if(event.key==="Escape") setSelectedProduct(null)};
  window.addEventListener("keydown",onKey);
  return()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",onKey)};
 },[selectedProduct]);

 const featured=useMemo(()=>[...products].filter(p=>Number.isFinite(p.minPrice)&&p.minPrice>0).sort((a,b)=>Math.max(0,b.maxPrice-b.minPrice)-Math.max(0,a.maxPrice-a.minPrice)||a.minPrice-b.minPrice).slice(0,4),[products]);
 const topStores=useMemo(()=>[...stores].sort((a,b)=>b.products-a.products).slice(0,4),[stores]);
 const liveResults=useMemo(()=>{const term=query.trim();if(term.length<2)return [];return searchProducts(products,term).filter(p=>Number.isFinite(p.minPrice)&&p.minPrice>0).slice(0,6)},[products,query]);
 const showLiveSearch=query.trim().length>=2;
 const submitSearch=(e:FormEvent)=>{e.preventDefault();const v=query.trim();window.location.href=v?`/buscar?q=${encodeURIComponent(v)}`:"/buscar"};
 const openProduct=(product:Product)=>setSelectedProduct(product);
 const productKey=(event:KeyboardEvent<HTMLElement>,product:Product)=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();openProduct(product)}};

 return <div className="true-home">
  <header className="th-header"><div className="th-shell th-header__inner"><a className="th-brand" href="/" aria-label="PreçoCerto - início"><img src="/logo-preco-certo-inversa.svg" alt="PreçoCerto"/><span>Feijó-AC</span></a><nav className="th-nav"><a href="/buscar">Comparar</a><a href="/cesta-basica">Cesta inteligente</a><a href="/estabelecimentos">Lojas</a></nav><div className="th-header__actions"><a className="th-login" href="/login">Entrar</a><a className="th-button th-button--brand th-header__cta" href="/buscar">Pesquisar preços</a><button className="th-menu" type="button" aria-label="Abrir menu" onClick={()=>setMenuOpen(true)}><Menu/></button></div></div></header>
  {menuOpen&&<div className="th-mobile-menu" role="dialog" aria-modal="true"><button type="button" aria-label="Fechar menu" onClick={()=>setMenuOpen(false)}><X/></button><a href="/buscar">Comparar preços</a><a href="/cesta-basica">Cesta inteligente</a><a href="/estabelecimentos">Estabelecimentos</a><a href="/lojista">Sou comerciante</a><a href="/login">Entrar</a></div>}
  <main>
   <section className="th-hero"><div className="th-hero__image"/><div className="th-hero__overlay"/><div className="th-shell th-hero__content"><div className="th-hero__copy"><div className="th-local-context"><MapPin/> Feijó, Acre <span>preços do comércio local</span></div><h1>Compare antes. <strong>Compre com mais clareza.</strong></h1><p>Pesquise um produto e veja, em poucos segundos, como os preços variam entre os comércios de Feijó.</p><div className="th-search-wrap"><form className="th-search" onSubmit={submitSearch}><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Busque arroz, café, leite..." aria-label="Buscar produto" autoComplete="off"/><button type="submit">Comparar <ArrowRight/></button></form>{showLiveSearch&&<div className="th-search-results" role="listbox" aria-label="Sugestões de produtos">{liveResults.length>0?<>{liveResults.map(p=><a className="th-search-result" href={`/produto/${p.slug||p.id}`} key={String(p.id)} role="option"><SearchThumb product={p}/><span className="th-search-result__copy"><strong>{p.name}</strong><small>{p.establishment||"Estabelecimento local"}</small></span><span className="th-search-result__price">{money(p.minPrice)}</span><ArrowRight aria-hidden="true"/></a>)}<a className="th-search-results__all" href={`/buscar?q=${encodeURIComponent(query.trim())}`}>Ver todos os resultados para “{query.trim()}” <ArrowRight/></a></>:<div className="th-search-results__empty"><Search aria-hidden="true"/><div><strong>Nenhum produto encontrado</strong><span>Tente outro nome, marca ou categoria.</span></div></div>}</div>}</div><div className="th-trust"><span><CheckCircle2/> preços locais</span><span><ShieldCheck/> comparação transparente</span><span><TrendingDown/> foco em economia</span></div></div><aside className="th-hero-card"><div className="th-hero-card__label">Panorama local</div><div className="th-hero-card__stats"><div><strong>{number(metrics.products)}</strong><span>produtos</span></div><div><strong>{number(metrics.stores)}</strong><span>lojas</span></div><div><strong>{number(metrics.prices)}</strong><span>preços</span></div></div><a href="/melhores-precos">Ver melhores preços <ArrowRight/></a></aside></div></section>

   <section className="th-quick"><div className="th-shell th-quick__grid"><a href="/buscar"><span><Search/></span><div><strong>Buscar produto</strong><small>Compare em segundos</small></div><ArrowRight/></a><a href="/cesta-basica"><span><ShoppingBasket/></span><div><strong>Montar cesta</strong><small>Planeje sua compra</small></div><ArrowRight/></a><a href="/estabelecimentos"><span><Store/></span><div><strong>Ver lojas</strong><small>Explore Feijó</small></div><ArrowRight/></a></div></section>

   <section className="th-section th-opportunities"><div className="th-shell"><div className="th-heading"><div><span className="th-section-note">Oportunidades do catálogo</span><h2>Diferenças de preço que merecem atenção.</h2><p>Veja oportunidades do catálogo atual e abra cada produto para conferir os detalhes antes de comparar.</p></div><a href="/melhores-precos">Ver todos <ArrowRight/></a></div><div className="th-products">{featured.map(p=>{const saving=Math.max(0,p.maxPrice-p.minPrice);return <article className="th-product" key={String(p.id)} role="button" tabIndex={0} aria-label={`Ver detalhes de ${p.name}`} onClick={()=>openProduct(p)} onKeyDown={event=>productKey(event,p)}><ProductImage product={p}/><div className="th-product__body"><div className="th-product__topline"><span>{p.category||"Produto"}</span><button type="button" aria-label={`Favoritar ${p.name}`} onClick={event=>event.stopPropagation()}><Heart/></button></div><h3>{p.name}</h3><p>{p.establishment}</p><div className="th-product__price"><strong>{money(p.minPrice)}</strong>{saving>0&&<span>diferença de até {money(saving)}</span>}</div><a href={`/produto/${p.slug||p.id}`} onClick={event=>event.stopPropagation()}>Comparar <ArrowRight/></a></div></article>})}</div></div></section>

   <section className="th-mid-hero"><div className="th-mid-hero__image"/><div className="th-mid-hero__overlay"/><div className="th-shell th-mid-hero__inner"><div className="th-mid-hero__copy"><h2>Da pesquisa à cesta, encontre uma escolha melhor para o seu bolso.</h2><p>Compare preços locais, descubra onde cada item custa menos e monte sua compra com mais clareza antes de sair de casa.</p><div className="th-mid-hero__actions"><a href="/buscar">Comparar produtos <ArrowRight/></a><a href="/cesta-basica">Montar cesta inteligente <ShoppingBasket/></a></div></div><aside className="th-mid-hero__panel"><span><TrendingDown/> Como economizar</span><strong>Três passos simples.</strong><p>Use o PreçoCerto como ponto de partida para decidir melhor onde comprar.</p><div className="th-mid-hero__steps"><span><Search/> Pesquise o produto</span><span><Store/> Compare entre lojas</span><span><CheckCircle2/> Escolha a melhor opção</span></div></aside></div></section>

   <section className="th-section th-discover"><div className="th-shell th-discover__grid"><div className="th-basket-mini"><h2>Uma compra inteira, não só um produto.</h2><p>Monte sua lista, informe seu orçamento e compare combinações para gastar melhor.</p><a className="th-button th-button--brand" href="/cesta-basica">Montar minha cesta <ArrowRight/></a></div><div className="th-stores-wrap"><div className="th-heading th-heading--compact"><div><span className="th-section-note">Catálogo local</span><h2>Comércios de Feijó.</h2></div><a href="/estabelecimentos">Ver todos <ArrowRight/></a></div><div className="th-stores">{topStores.map(s=>{const logo=getStoreLogoUrl(s.name);return <a className="th-store" href={`/estabelecimento/${s.slug||s.id}`} key={String(s.id)}><div className="th-store__logo" style={{background:s.color||"#e2e8f0"}}>{logo?<img src={logo} alt={`Logo ${s.name}`} loading="lazy"/>:<Store/>}</div><div><strong>{s.name}</strong><span>{s.neighborhood}</span><small>{number(s.products)} produtos</small></div><ArrowRight/></a>})}</div></div></div></section>
   <section className="th-merchant"><div className="th-shell th-merchant__inner"><div><h2>Seu comércio onde o consumidor já procura preço.</h2><p>Mostre catálogo, ofertas e presença local dentro do PreçoCerto.</p></div><a className="th-button th-button--light" href="/lojista">Conhecer área do lojista <ArrowRight/></a></div></section>
  </main>

  {selectedProduct&&(()=>{const image=resolveProductImage(selectedProduct);const saving=Math.max(0,selectedProduct.maxPrice-selectedProduct.minPrice);return <div className="th-product-modal" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setSelectedProduct(null)}}><section className="th-product-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="th-product-modal-title"><button className="th-product-modal__close" type="button" aria-label="Fechar detalhes do produto" onClick={()=>setSelectedProduct(null)}><X/></button><div className="th-product-modal__grid"><div className="th-product-modal__media">{image?<img src={image} alt={selectedProduct.name}/>:<div className="th-product-modal__placeholder"><ImageOff/><span>Imagem em atualização</span></div>}</div><div className="th-product-modal__content"><span className="th-product-modal__eyebrow">{selectedProduct.category||"Produto"}</span><h2 id="th-product-modal-title">{selectedProduct.name}</h2><div className="th-product-modal__store"><Store/> {selectedProduct.establishment||"Estabelecimento local"}</div><div className="th-product-modal__prices"><div><span>Menor preço</span><strong>{money(selectedProduct.minPrice)}</strong></div><div><span>Média local</span><strong>{money(selectedProduct.avgPrice)}</strong></div><div><span>Maior preço</span><strong>{money(selectedProduct.maxPrice)}</strong></div></div>{saving>0&&<div className="th-product-modal__saving"><TrendingDown/> Diferença de até {money(saving)} entre os preços encontrados.</div>}<div className="th-product-modal__actions"><a href={`/produto/${selectedProduct.slug||selectedProduct.id}`}>Ver comparação completa <ArrowRight/></a><a href={`/buscar?q=${encodeURIComponent(selectedProduct.name)}`}>Buscar similares <Search/></a></div></div></div></section></div>})()}

  <footer className="th-footer"><div className="th-shell th-footer__row"><div className="th-footer__brand"><img src="/logo-preco-certo-inversa.svg" alt="PreçoCerto"/><span>Feijó-AC</span></div><nav><a href="/buscar">Comparar</a><a href="/cesta-basica">Cesta</a><a href="/estabelecimentos">Lojas</a><a href="/lojista">Lojista</a><a href="/fale-conosco">Contato</a></nav><small>Feijó-AC • informação local para comprar melhor</small></div></footer>
 </div>
}