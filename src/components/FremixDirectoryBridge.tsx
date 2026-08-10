import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function FremixDirectoryBridge(){
 const location=useLocation();const navigate=useNavigate();
 useEffect(()=>{if(location.pathname!=="/estabelecimentos")return;let timer=0;
  const wire=()=>{const card=document.querySelector('article[aria-label="Abrir catálogo de FreMix Produções"]') as HTMLElement|null;if(!card)return false;card.setAttribute("aria-label","Abrir espaço cultural da FreMix Produções");card.dataset.cultural="true";
   const type=Array.from(card.querySelectorAll("span")).find(el=>el.textContent?.trim()==="Comércio local");if(type)type.textContent="Cultura · Produtora musical";
   const enter=Array.from(card.querySelectorAll("span")).find(el=>el.textContent?.trim()==="Entrar no estabelecimento");if(enter)enter.textContent="Conhecer a FreMix Produções";
   const links=card.querySelectorAll("a");links.forEach(a=>{if((a.textContent||"").includes("Ver catálogo")||(a.textContent||"").includes("Explorar"))a.setAttribute("href","/cultura/fremix-producoes")});return true};
  const onClick=(e:MouseEvent)=>{const target=e.target as HTMLElement|null;const card=target?.closest?.('article[data-cultural="true"]');if(!card)return;e.preventDefault();e.stopPropagation();navigate("/cultura/fremix-producoes")};
  const onKey=(e:KeyboardEvent)=>{const target=e.target as HTMLElement|null;if(!target?.matches?.('article[data-cultural="true"]'))return;if(e.key==="Enter"||e.key===" "){e.preventDefault();e.stopPropagation();navigate("/cultura/fremix-producoes")}};
  document.addEventListener("click",onClick,true);document.addEventListener("keydown",onKey,true);if(!wire()){timer=window.setInterval(()=>{if(wire()){window.clearInterval(timer)}},140)}
  return()=>{document.removeEventListener("click",onClick,true);document.removeEventListener("keydown",onKey,true);if(timer)window.clearInterval(timer)};
 },[location.pathname,navigate]);return null;
}
