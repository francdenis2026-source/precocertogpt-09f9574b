import { useEffect, useMemo, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { buildCatalog, type Product } from "../../data/catalog";
import { fetchCatalog } from "../../data/remoteCatalog";
import { useFavorites } from "./FavoritesProvider";
import "./commerce-intents.css";

const normalize = (value:string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/\s+/g," ").trim();
const roots = new WeakMap<Element, Root>();
const LEGACY_FAVORITE_SELECTOR = '[aria-label*="favorit" i]:not(.pc-favorite-action):not(.scpm-favorite)';
const storeHueByName = new Map<string, number>();
const reservedStoreHues = new Set<number>();

function getStoreHue(value:string){
  const key=normalize(value);
  const saved=storeHueByName.get(key);
  if(saved!==undefined)return saved;

  let hash=2166136261;
  for(let index=0;index<key.length;index+=1){
    hash^=key.charCodeAt(index);
    hash=Math.imul(hash,16777619)>>>0;
  }

  let hue=hash%360;
  while(reservedStoreHues.has(hue))hue=(hue+47)%360;
  storeHueByName.set(key,hue);
  reservedStoreHues.add(hue);
  return hue;
}

function FavoriteControl({ product, compact=false }:{product:Product;compact?:boolean}){
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(product.id);
  return <button type="button" className={`pc-favorite-action${active?" is-saved":""}${compact?" is-compact":""}`} aria-pressed={active} aria-label={active?`Remover ${product.name} dos favoritos`:`Favoritar ${product.name}`} title={active?"Remover dos favoritos":"Salvar nos favoritos"} onClick={event=>{event.preventDefault();event.stopPropagation();void toggleFavorite(product.id);}}><Heart aria-hidden="true" fill={active?"currentColor":"none"}/>{!compact&&<span>{active?"Salvo":"Favoritar"}</span>}</button>;
}

function HeaderFavoriteShortcut(){
  const { favoriteIds } = useFavorites();
  return <a href="/favoritos" className="pc-favorites-shortcut" aria-label={`Favoritos: ${favoriteIds.length} salvos`}><Heart aria-hidden="true" fill={favoriteIds.length?"currentColor":"none"}/><span>Favoritos</span>{favoriteIds.length>0&&<b>{favoriteIds.length}</b>}</a>;
}

export function CommerceIntentBridge(){
  const navigate = useNavigate();
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();
  const [products,setProducts]=useState<Product[]>(buildCatalog().products);
  const byName=useMemo(()=>new Map(products.map(product=>[normalize(product.name),product])),[products]);

  useEffect(()=>{let active=true;fetchCatalog().then(result=>{if(active)setProducts(result.products)});return()=>{active=false}},[]);

  useEffect(()=>{
    const findProduct=(host:Element):Product|undefined=>{
      const name=host.querySelector(".pc-product-info strong,.pc-dialog h2,.professional-result-card h3,.compact-product a,.scpm-card h3")?.textContent?.trim()||"";
      return byName.get(normalize(name));
    };

    const renderInto=(host:Element,product:Product,compact:boolean)=>{
      let mount=host.querySelector<HTMLElement>(":scope > .pc-favorite-mount");
      if(!mount){mount=document.createElement("span");mount.className="pc-favorite-mount";host.appendChild(mount)}
      mount.classList.toggle("is-modal",host.classList.contains("pc-dialog"));
      let root=roots.get(mount);if(!root){root=createRoot(mount);roots.set(mount,root)}
      root.render(<FavoriteControl product={product} compact={compact}/>);
    };

    const bindModalStores=(dialog:Element,product:Product)=>{
      const offerByStore=new Map((product.offers??[]).map(offer=>[normalize(offer.establishment||""),offer]));
      dialog.querySelectorAll<HTMLElement>(".pc-dialog-offers > div").forEach(row=>{
        const storeName=row.querySelector<HTMLElement>("strong");
        if(!storeName)return;
        const name=storeName.textContent?.trim()||"";
        const offer=offerByStore.get(normalize(name));
        const fallbackMatches=normalize(product.establishment||"")===normalize(name);
        const identifier=offer?.establishmentSlug||offer?.establishmentId||(fallbackMatches?(product.establishmentSlug||product.establishmentId):undefined);
        if(!identifier)return;
        const href=`/estabelecimento/${encodeURIComponent(String(identifier))}`;
        storeName.classList.add("pc-modal-store-link");
        storeName.dataset.pcStoreHref=href;
        storeName.setAttribute("role","link");
        storeName.setAttribute("tabindex","0");
        storeName.setAttribute("aria-label",`Abrir estabelecimento ${name}`);
        storeName.setAttribute("title",`Ver ${name}`);
      });

      dialog.querySelectorAll<HTMLAnchorElement>(".pc-dialog-actions a[href^='/produto/']").forEach(link=>{
        link.dataset.pcDirectNavigation="true";
        link.setAttribute("title","Abrir página completa do produto");
      });
    };

    const applySearchStoreIdentity=()=>{
      document.querySelectorAll<HTMLElement>(".pc-results .pc-result-copy em").forEach(label=>{
        const storeName=label.textContent?.replace(/\s+/g," ").trim()||"";
        if(!storeName)return;
        label.style.setProperty("--pc-store-hue",String(getStoreHue(storeName)));
        label.dataset.pcStoreIdentity=normalize(storeName);
      });
    };

    const patch=()=>{
      document.querySelectorAll(".pc-product-card").forEach(card=>{const p=findProduct(card);if(p)renderInto(card,p,true)});
      document.querySelectorAll(".pc-dialog").forEach(dialog=>{const p=findProduct(dialog);if(p){renderInto(dialog,p,true);bindModalStores(dialog,p)}});
      applySearchStoreIdentity();

      const actions=document.querySelector(".pc-header .pc-header-actions");
      if(actions&&!actions.querySelector(".pc-favorites-header-mount")){
        const mount=document.createElement("span");mount.className="pc-favorites-header-mount";actions.insertBefore(mount,actions.querySelector(".pc-merchant"));
        const root=createRoot(mount);roots.set(mount,root);root.render(<HeaderFavoriteShortcut/>);
      }else if(actions){const mount=actions.querySelector(".pc-favorites-header-mount");if(mount){let root=roots.get(mount);if(!root){root=createRoot(mount);roots.set(mount,root)}root.render(<HeaderFavoriteShortcut/>)}}

      const checkout=document.querySelector(".storefront-pro__checkout-card");
      if(checkout&&!checkout.querySelector(".pc-store-cart-identity")){
        const note=document.createElement("div");note.className="pc-store-cart-identity";note.innerHTML='<span aria-hidden="true">🛍️</span><span><strong>Carrinho desta loja</strong><small>Compra online separada da sua Cesta inteligente.</small></span>';
        checkout.insertBefore(note,checkout.firstChild);
      }
      document.querySelectorAll(".storefront-pro__checkout-head > div:first-child > span").forEach(node=>{if(/finalizar compra|seu pedido/i.test(node.textContent||""))node.textContent="CARRINHO DA LOJA"});

      document.querySelectorAll<HTMLElement>(LEGACY_FAVORITE_SELECTOR).forEach(button=>{
        const host=button.closest("article,.compact-product,.professional-result-card")||button.parentElement;
        const p=host?findProduct(host):undefined;if(!p)return;
        button.setAttribute("aria-pressed",String(isFavorite(p.id)));button.dataset.pcFavoriteProduct=String(p.id);
        button.classList.toggle("active",isFavorite(p.id));
      });
    };

    const capture=(event:Event)=>{
      const element=event.target as Element|null;
      const storeLink=element?.closest<HTMLElement>(".pc-modal-store-link[data-pc-store-href]");
      if(storeLink){
        const href=storeLink.dataset.pcStoreHref;
        if(href){event.preventDefault();event.stopPropagation();navigate(href);return;}
      }

      const legacy=element?.closest<HTMLElement>(LEGACY_FAVORITE_SELECTOR);
      if(!legacy)return;
      const host=legacy.closest("article,.compact-product,.professional-result-card")||legacy.parentElement;
      const product=host?findProduct(host):undefined;if(!product)return;
      event.preventDefault();event.stopPropagation();(event as any).stopImmediatePropagation?.();void toggleFavorite(product.id);
    };

    const keyCapture=(event:KeyboardEvent)=>{
      if(event.key!=="Enter"&&event.key!==" ")return;
      const element=event.target as Element|null;
      const storeLink=element?.closest<HTMLElement>(".pc-modal-store-link[data-pc-store-href]");
      const href=storeLink?.dataset.pcStoreHref;
      if(!href)return;
      event.preventDefault();event.stopPropagation();navigate(href);
    };

    patch();
    const observer=new MutationObserver(patch);observer.observe(document.body,{childList:true,subtree:true});
    document.addEventListener("click",capture,true);
    document.addEventListener("keydown",keyCapture,true);
    return()=>{observer.disconnect();document.removeEventListener("click",capture,true);document.removeEventListener("keydown",keyCapture,true)};
  },[byName,favoriteIds,isFavorite,navigate,toggleFavorite]);

  return null;
}
