import { useEffect } from "react";

export function EstablishmentsNavBridge(){
  useEffect(()=>{
    const normalize=(v:string)=>v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase();
    const bind=()=>{
      document.querySelectorAll<HTMLAnchorElement>("a").forEach(a=>{
        const label=normalize(a.textContent||"");
        if(label==="estabelecimentos"||label==="ver estabelecimentos"||label==="comercios") a.href="/estabelecimentos";
      });
    };
    bind();
    const observer=new MutationObserver(bind);observer.observe(document.body,{childList:true,subtree:true});
    return()=>observer.disconnect();
  },[]);
  return null;
}
