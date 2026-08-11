import { useEffect } from "react";

const STYLE_ID = "pc-rebuilt-internal-ux";

const css = `
body.pc-rebuilt[data-pc-route^='/painel-lojista'],
body.pc-rebuilt[data-pc-route^='/admin'],
body.pc-rebuilt[data-pc-route^='/lojista'],
body.pc-rebuilt[data-pc-route^='/meus-pedidos']{background:var(--pc-bg)!important;color:var(--pc-ink)!important}

body.pc-rebuilt[data-pc-route^='/painel-lojista'] main,
body.pc-rebuilt[data-pc-route^='/admin'] main,
body.pc-rebuilt[data-pc-route^='/lojista'] main,
body.pc-rebuilt[data-pc-route^='/meus-pedidos'] main{background:var(--pc-bg)!important;color:var(--pc-ink)!important;font-family:var(--body-font)!important}

body.pc-rebuilt[data-pc-route^='/painel-lojista'] :is(article,section,aside),
body.pc-rebuilt[data-pc-route^='/admin'] :is(article,section,aside),
body.pc-rebuilt[data-pc-route^='/lojista'] :is(article,section),
body.pc-rebuilt[data-pc-route^='/meus-pedidos'] :is(article,section){border-color:var(--pc-line)!important;box-shadow:none!important}

body.pc-rebuilt[data-pc-route^='/painel-lojista'] article,
body.pc-rebuilt[data-pc-route^='/admin'] article,
body.pc-rebuilt[data-pc-route^='/meus-pedidos'] article{background:var(--pc-surface)!important;border-radius:16px!important}

body.pc-rebuilt[data-pc-route^='/painel-lojista'] aside,
body.pc-rebuilt[data-pc-route^='/admin'] aside{background:var(--pc-surface)!important;border-right:1px solid var(--pc-line)!important}

body.pc-rebuilt[data-pc-route^='/painel-lojista'] nav button,
body.pc-rebuilt[data-pc-route^='/admin'] nav button{min-height:44px!important;border-radius:10px!important;color:var(--pc-text)!important;transition:background .16s ease,color .16s ease!important}
body.pc-rebuilt[data-pc-route^='/painel-lojista'] nav button:hover,
body.pc-rebuilt[data-pc-route^='/admin'] nav button:hover{background:var(--pc-surface-2)!important;color:var(--pc-ink)!important}

body.pc-rebuilt[data-pc-route^='/painel-lojista'] h1,
body.pc-rebuilt[data-pc-route^='/painel-lojista'] h2,
body.pc-rebuilt[data-pc-route^='/painel-lojista'] h3,
body.pc-rebuilt[data-pc-route^='/admin'] h1,
body.pc-rebuilt[data-pc-route^='/admin'] h2,
body.pc-rebuilt[data-pc-route^='/admin'] h3,
body.pc-rebuilt[data-pc-route^='/lojista'] h1,
body.pc-rebuilt[data-pc-route^='/lojista'] h2{font-family:var(--primary-font)!important;color:var(--pc-ink)!important;letter-spacing:-.025em!important}

body.pc-rebuilt[data-pc-route^='/painel-lojista'] p,
body.pc-rebuilt[data-pc-route^='/painel-lojista'] small,
body.pc-rebuilt[data-pc-route^='/admin'] p,
body.pc-rebuilt[data-pc-route^='/admin'] small,
body.pc-rebuilt[data-pc-route^='/lojista'] p,
body.pc-rebuilt[data-pc-route^='/meus-pedidos'] p{color:var(--pc-muted)!important}

body.pc-rebuilt[data-pc-route^='/painel-lojista'] button,
body.pc-rebuilt[data-pc-route^='/admin'] button,
body.pc-rebuilt[data-pc-route^='/lojista'] button,
body.pc-rebuilt[data-pc-route^='/meus-pedidos'] button{min-height:44px!important;border-radius:11px!important;font-weight:750!important}

body.pc-rebuilt[data-pc-route^='/painel-lojista'] :is(input,select,textarea),
body.pc-rebuilt[data-pc-route^='/admin'] :is(input,select,textarea),
body.pc-rebuilt[data-pc-route^='/lojista'] :is(input,select,textarea){min-height:46px!important;background:var(--pc-surface)!important;border:1px solid var(--pc-line)!important;color:var(--pc-ink)!important;border-radius:11px!important;font-size:16px!important}

body.pc-rebuilt[data-pc-route^='/painel-lojista'] table,
body.pc-rebuilt[data-pc-route^='/admin'] table{background:var(--pc-surface)!important;border-color:var(--pc-line)!important;border-radius:14px!important;overflow:hidden!important}
body.pc-rebuilt[data-pc-route^='/painel-lojista'] :is(th,td),
body.pc-rebuilt[data-pc-route^='/admin'] :is(th,td){border-color:var(--pc-line)!important}
body.pc-rebuilt[data-pc-route^='/painel-lojista'] th,
body.pc-rebuilt[data-pc-route^='/admin'] th{background:var(--pc-surface-2)!important;color:var(--pc-muted)!important;font-size:.78rem!important;letter-spacing:.04em!important;text-transform:uppercase!important}

body.pc-rebuilt[data-pc-route^='/estabelecimento/'],
body.pc-rebuilt[data-pc-route='/estabelecimentos'],
body.pc-rebuilt[data-pc-route^='/loja/']{background:var(--pc-bg)!important}
body.pc-rebuilt[data-pc-route^='/estabelecimento/'] :is(article,.card),
body.pc-rebuilt[data-pc-route='/estabelecimentos'] :is(article,.card),
body.pc-rebuilt[data-pc-route^='/loja/'] :is(article,.card){background:var(--pc-surface)!important;border:1px solid var(--pc-line)!important;border-radius:16px!important;box-shadow:none!important}
body.pc-rebuilt[data-pc-route^='/estabelecimento/'] h1,
body.pc-rebuilt[data-pc-route='/estabelecimentos'] h1,
body.pc-rebuilt[data-pc-route^='/loja/'] h1{font-family:var(--primary-font)!important;color:var(--pc-ink)!important;letter-spacing:-.04em!important}

body.pc-rebuilt :is(.auth-page,[class*='auth-']){font-family:var(--body-font)!important}
body.pc-rebuilt .auth-page{background:var(--pc-bg)!important}
body.pc-rebuilt .auth-form-wrap{background:var(--pc-bg)!important}
body.pc-rebuilt .auth-form{background:var(--pc-surface)!important;border:1px solid var(--pc-line)!important;border-radius:20px!important;box-shadow:var(--pc-shadow)!important}
body.pc-rebuilt .auth-form h2{font-family:var(--primary-font)!important;color:var(--pc-ink)!important;letter-spacing:-.04em!important}
body.pc-rebuilt .auth-form input{min-height:48px!important;background:var(--pc-surface)!important;border:1px solid var(--pc-line)!important;color:var(--pc-ink)!important;border-radius:11px!important;font-size:16px!important}

@media(max-width:760px){
  body.pc-rebuilt[data-pc-route^='/painel-lojista'] main,
  body.pc-rebuilt[data-pc-route^='/admin'] main,
  body.pc-rebuilt[data-pc-route^='/lojista'] main,
  body.pc-rebuilt[data-pc-route^='/meus-pedidos'] main{font-size:16px!important}
  body.pc-rebuilt[data-pc-route^='/painel-lojista'] :is(article,section),
  body.pc-rebuilt[data-pc-route^='/admin'] :is(article,section){border-radius:14px!important}
  body.pc-rebuilt[data-pc-route^='/painel-lojista'] small,
  body.pc-rebuilt[data-pc-route^='/admin'] small{font-size:.82rem!important;line-height:1.4!important}
  body.pc-rebuilt[data-pc-route^='/painel-lojista'] table,
  body.pc-rebuilt[data-pc-route^='/admin'] table{display:block!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important}
}
`;

export function RebuiltInternalUx(){
  useEffect(()=>{
    if(document.getElementById(STYLE_ID)) return;
    const style=document.createElement("style");
    style.id=STYLE_ID;
    style.textContent=css;
    document.head.appendChild(style);
  },[]);
  return null;
}
