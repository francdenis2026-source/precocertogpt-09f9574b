import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_ID = "pc-rebuilt-visual-system";

const css = `
:root{
  --pc-bg:#f6f8fb;--pc-surface:#fff;--pc-surface-2:#eef3f7;--pc-surface-3:#e4ebf1;
  --pc-ink:#0b1f33;--pc-text:#31445a;--pc-muted:#6b7b8f;--pc-line:#d8e1e8;
  --pc-brand:#0f8a57;--pc-brand-strong:#087044;--pc-brand-soft:#e6f6ee;
  --pc-accent:#0b6ff4;--pc-accent-soft:#e9f2ff;--pc-danger:#d94b5b;
  --pc-radius-sm:10px;--pc-radius:14px;--pc-radius-lg:20px;--pc-radius-xl:28px;
  --pc-shadow-sm:0 1px 3px rgba(13,36,55,.08);--pc-shadow:0 14px 40px rgba(13,36,55,.08);--pc-shadow-lg:0 28px 70px rgba(13,36,55,.14);
  --pc-container:min(1240px,calc(100vw - 40px));--pc-header:72px;
}
[data-theme='dark']{
  --pc-bg:#08131f;--pc-surface:#0f1d2b;--pc-surface-2:#152638;--pc-surface-3:#1d3145;
  --pc-ink:#f4f7fa;--pc-text:#c7d1dc;--pc-muted:#91a0b0;--pc-line:#263a4e;
  --pc-brand:#46d69a;--pc-brand-strong:#65e5ad;--pc-brand-soft:rgba(70,214,154,.12);
  --pc-accent:#79b2ff;--pc-accent-soft:rgba(121,178,255,.12);--pc-danger:#ff7f8e;
  --pc-shadow-sm:0 1px 3px rgba(0,0,0,.22);--pc-shadow:0 14px 40px rgba(0,0,0,.22);--pc-shadow-lg:0 28px 70px rgba(0,0,0,.35)
}

html{scroll-behavior:smooth;scroll-padding-top:calc(var(--pc-header) + 16px)}
body.pc-rebuilt{background:var(--pc-bg)!important;color:var(--pc-ink)!important;font-family:var(--body-font);font-size:16px;line-height:1.6;text-rendering:optimizeLegibility}
body.pc-rebuilt *{box-sizing:border-box}
body.pc-rebuilt .shell{width:var(--pc-container)!important;max-width:none!important;margin-inline:auto!important;padding-inline:0!important}
body.pc-rebuilt a{color:inherit}
body.pc-rebuilt :is(button,a,input,select,textarea):focus-visible{outline:3px solid color-mix(in srgb,var(--pc-accent) 48%,transparent)!important;outline-offset:3px!important}
body.pc-rebuilt button,body.pc-rebuilt .button,body.pc-rebuilt [role='button']{min-height:44px}

body.pc-rebuilt .site-header{position:sticky!important;top:0!important;z-index:1200!important;height:var(--pc-header)!important;background:color-mix(in srgb,var(--pc-surface) 92%,transparent)!important;border-bottom:1px solid var(--pc-line)!important;box-shadow:none!important;backdrop-filter:blur(16px)!important}
body.pc-rebuilt .header-inner{min-height:var(--pc-header)!important;gap:24px!important}
body.pc-rebuilt .brand__logo-img{height:58px!important;width:auto!important;object-fit:contain!important}
body.pc-rebuilt .desktop-nav{display:flex!important;align-items:center!important;gap:4px!important;background:transparent!important;border:0!important;padding:0!important}
body.pc-rebuilt .desktop-nav a{min-height:42px!important;padding:10px 12px!important;border-radius:10px!important;font-size:.92rem!important;font-weight:700!important;color:var(--pc-text)!important}
body.pc-rebuilt .desktop-nav a:hover{background:var(--pc-surface-2)!important;color:var(--pc-ink)!important;transform:none!important}
body.pc-rebuilt .header-actions{gap:8px!important}
body.pc-rebuilt .header-actions .icon-button,body.pc-rebuilt .mobile-menu-button{width:44px!important;height:44px!important;border-radius:12px!important;border:1px solid var(--pc-line)!important;background:var(--pc-surface)!important;color:var(--pc-ink)!important}
body.pc-rebuilt .header-signup-button{border-radius:12px!important;background:var(--pc-brand)!important;color:#fff!important;box-shadow:none!important}

body.pc-rebuilt .hero{margin-top:0!important;min-height:auto!important;background:linear-gradient(135deg,#071a2a 0%,#0a2635 58%,#0d3c3c 100%)!important;overflow:hidden!important;position:relative!important}
body.pc-rebuilt .hero-photo{opacity:.18!important;filter:saturate(.72) contrast(1.05)!important;background-position:center!important}
body.pc-rebuilt .hero-wash{background:linear-gradient(90deg,rgba(4,16,27,.98) 0%,rgba(4,16,27,.92) 48%,rgba(4,16,27,.62) 100%)!important}
body.pc-rebuilt .hero-content{min-height:560px!important;padding-top:72px!important;padding-bottom:64px!important;display:grid!important;grid-template-columns:minmax(0,1.25fr) minmax(320px,.75fr)!important;gap:56px!important;align-items:center!important}
body.pc-rebuilt .hero-copy{max-width:720px!important}
body.pc-rebuilt .hero-live,body.pc-rebuilt .eyebrow--light{display:inline-flex!important;align-items:center!important;gap:7px!important;font-size:.78rem!important;letter-spacing:.04em!important;font-weight:800!important;color:#cbd8e3!important}
body.pc-rebuilt .hero h1{font-family:var(--primary-font)!important;font-size:clamp(3.1rem,6vw,5.1rem)!important;line-height:.95!important;letter-spacing:-.055em!important;max-width:760px!important;margin:16px 0 20px!important;color:#fff!important;text-wrap:balance}
body.pc-rebuilt .hero h1 span{color:#67dfa8!important;background:none!important;-webkit-text-fill-color:initial!important}
body.pc-rebuilt .hero-copy>p{max-width:660px!important;font-size:1.08rem!important;line-height:1.65!important;color:#d1dbe4!important;margin-bottom:26px!important}
body.pc-rebuilt .hero-actions{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:10px!important;max-width:760px!important;position:relative!important;z-index:20!important}
body.pc-rebuilt .search-combo__form{min-height:60px!important;padding:5px!important;background:#fff!important;border:1px solid rgba(255,255,255,.75)!important;border-radius:16px!important;box-shadow:0 22px 54px rgba(0,0,0,.24)!important}
body.pc-rebuilt .search-combo__input{font-size:1rem!important;min-height:48px!important;color:#10243a!important}
body.pc-rebuilt .search-combo__button{min-height:48px!important;border-radius:12px!important;background:var(--pc-brand)!important;color:#fff!important;font-weight:800!important;box-shadow:none!important}
body.pc-rebuilt .hero-actions>.button--white{min-height:60px!important;border-radius:16px!important;border:1px solid rgba(255,255,255,.2)!important;background:rgba(255,255,255,.08)!important;color:#fff!important;box-shadow:none!important}
body.pc-rebuilt .hero-trust{display:flex!important;flex-wrap:wrap!important;gap:18px!important;margin-top:16px!important;color:#afbecb!important;font-size:.82rem!important}
body.pc-rebuilt .hero-trust svg{color:#67dfa8!important}
body.pc-rebuilt .hero-insight{background:rgba(255,255,255,.06)!important;border:1px solid rgba(255,255,255,.13)!important;border-radius:20px!important;padding:22px!important;box-shadow:none!important;backdrop-filter:blur(12px)!important;transform:none!important}
body.pc-rebuilt .hero-insight__item{background:rgba(255,255,255,.04)!important;border:1px solid rgba(255,255,255,.06)!important;border-radius:12px!important}

body.pc-rebuilt .category-rail{width:var(--pc-container)!important;margin:16px auto 0!important;padding:10px!important;display:flex!important;gap:8px!important;align-items:center!important;background:var(--pc-surface)!important;border:1px solid var(--pc-line)!important;border-radius:16px!important;box-shadow:var(--pc-shadow-sm)!important}
body.pc-rebuilt .category-rail a{min-height:42px!important;padding:9px 12px!important;border-radius:10px!important;background:var(--pc-surface-2)!important;border:1px solid transparent!important;color:var(--pc-text)!important;font-weight:700!important}
body.pc-rebuilt .category-rail a:hover{background:var(--pc-brand-soft)!important;border-color:color-mix(in srgb,var(--pc-brand) 30%,var(--pc-line))!important;color:var(--pc-brand-strong)!important;transform:none!important}

body.pc-rebuilt .section,body.pc-rebuilt .featured-products,body.pc-rebuilt .professional{padding-top:64px!important;padding-bottom:64px!important}
body.pc-rebuilt .section-heading{margin-bottom:26px!important}
body.pc-rebuilt .section-heading h2{font-family:var(--primary-font)!important;font-size:clamp(2rem,3.5vw,2.75rem)!important;line-height:1.05!important;letter-spacing:-.04em!important;color:var(--pc-ink)!important;text-wrap:balance}
body.pc-rebuilt .section-heading p{max-width:720px!important;font-size:1rem!important;color:var(--pc-muted)!important}
body.pc-rebuilt .eyebrow{font-size:.78rem!important;font-weight:800!important;letter-spacing:.07em!important;color:var(--pc-brand-strong)!important}

body.pc-rebuilt .visual-product-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:18px!important}
body.pc-rebuilt .visual-product-card{display:flex!important;flex-direction:column!important;background:var(--pc-surface)!important;border:1px solid var(--pc-line)!important;border-radius:18px!important;overflow:hidden!important;box-shadow:none!important;transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease!important}
body.pc-rebuilt .visual-product-card:hover{transform:translateY(-4px)!important;border-color:color-mix(in srgb,var(--pc-brand) 30%,var(--pc-line))!important;box-shadow:var(--pc-shadow)!important}
body.pc-rebuilt .visual-product-image{height:210px!important;padding:18px!important;background:linear-gradient(180deg,var(--pc-surface),var(--pc-surface-2))!important}
body.pc-rebuilt .visual-product-image img{max-width:92%!important;max-height:92%!important;object-fit:contain!important;filter:drop-shadow(0 10px 18px rgba(13,36,55,.12))!important;transform:none!important}
body.pc-rebuilt .visual-product-card:hover .visual-product-image img{transform:translateY(-3px) scale(1.025)!important}
body.pc-rebuilt .visual-product-content{padding:18px!important}
body.pc-rebuilt .visual-product-name{font-size:1.02rem!important;line-height:1.35!important;min-height:2.75rem!important;color:var(--pc-ink)!important;font-weight:800!important}
body.pc-rebuilt .visual-store{font-size:.86rem!important;color:var(--pc-muted)!important}
body.pc-rebuilt .visual-price strong{font-size:1.7rem!important;color:var(--pc-brand-strong)!important;font-variant-numeric:tabular-nums!important}
body.pc-rebuilt .visual-product-actions .button{min-height:44px!important;border-radius:11px!important}
body.pc-rebuilt .favorite-button,body.pc-rebuilt [aria-label*='favorit']{min-width:44px!important;min-height:44px!important;border-radius:11px!important}

body.pc-rebuilt .price-table-card,body.pc-rebuilt .basket-plan,body.pc-rebuilt .store-card,body.pc-rebuilt .step-card,body.pc-rebuilt .admin-card,body.pc-rebuilt .panel,body.pc-rebuilt .card{background:var(--pc-surface)!important;border:1px solid var(--pc-line)!important;border-radius:18px!important;box-shadow:none!important}
body.pc-rebuilt .price-table-card{overflow:hidden!important}
body.pc-rebuilt .price-table-head{background:var(--pc-surface-2)!important;color:var(--pc-muted)!important;font-size:.78rem!important;font-weight:800!important;letter-spacing:.04em!important;text-transform:uppercase!important}
body.pc-rebuilt .price-row{border-color:var(--pc-line)!important}
body.pc-rebuilt .price-row:hover{background:color-mix(in srgb,var(--pc-brand-soft) 44%,transparent)!important}
body.pc-rebuilt .price-row :is(strong,b){font-variant-numeric:tabular-nums!important}
body.pc-rebuilt .store-card{padding:18px!important;transition:transform .18s ease,border-color .18s ease!important}
body.pc-rebuilt .store-card:hover{transform:translateY(-3px)!important;border-color:color-mix(in srgb,var(--pc-brand) 28%,var(--pc-line))!important}
body.pc-rebuilt .basket-plan{padding:28px!important}

body.pc-rebuilt input,body.pc-rebuilt select,body.pc-rebuilt textarea{min-height:46px;border:1px solid var(--pc-line)!important;border-radius:11px!important;background:var(--pc-surface)!important;color:var(--pc-ink)!important;font-size:16px!important}
body.pc-rebuilt label{color:var(--pc-text)!important;font-weight:700!important}
body.pc-rebuilt .button--primary{background:var(--pc-brand)!important;color:#fff!important;border-color:var(--pc-brand)!important;box-shadow:none!important}
body.pc-rebuilt .button--primary:hover{background:var(--pc-brand-strong)!important;transform:none!important}
body.pc-rebuilt .button--ghost{background:transparent!important;border:1px solid var(--pc-line)!important;color:var(--pc-text)!important}

body.pc-rebuilt .final-cta{background:linear-gradient(135deg,#092236,#0a3a3a)!important;border:1px solid rgba(255,255,255,.08)!important;border-radius:24px!important;color:#fff!important;box-shadow:none!important;padding:38px!important}
body.pc-rebuilt .site-footer{background:#071622!important;border-top:1px solid rgba(255,255,255,.07)!important;color:#bac8d4!important}
body.pc-rebuilt .site-footer h3{color:#fff!important}
body.pc-rebuilt .site-footer a:hover{color:#71e2ad!important;transform:none!important}

body.pc-rebuilt .search-results-dynamic{z-index:4000!important;border:1px solid var(--pc-line)!important;border-radius:14px!important;box-shadow:var(--pc-shadow-lg)!important}

@media(max-width:1020px){
  body.pc-rebuilt .desktop-nav{display:none!important}
  body.pc-rebuilt .hero-content{grid-template-columns:1fr!important;gap:26px!important;min-height:auto!important;padding-top:56px!important;padding-bottom:48px!important}
  body.pc-rebuilt .hero-insight{max-width:680px!important}
  body.pc-rebuilt .visual-product-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
}
@media(max-width:640px){
  :root{--pc-header:62px;--pc-container:calc(100vw - 28px)}
  body.pc-rebuilt{font-size:16px}
  body.pc-rebuilt .site-header{height:var(--pc-header)!important}
  body.pc-rebuilt .header-inner{min-height:var(--pc-header)!important}
  body.pc-rebuilt .brand__logo-img{height:44px!important}
  body.pc-rebuilt .hero-content{padding-top:42px!important;padding-bottom:32px!important}
  body.pc-rebuilt .hero h1{font-size:clamp(2.45rem,13vw,3.35rem)!important;line-height:.98!important}
  body.pc-rebuilt .hero-copy>p{font-size:1rem!important;line-height:1.55!important}
  body.pc-rebuilt .hero-actions{grid-template-columns:1fr!important}
  body.pc-rebuilt .hero-actions>.button--white{display:none!important}
  body.pc-rebuilt .hero-insight{display:none!important}
  body.pc-rebuilt .hero-trust{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;font-size:.84rem!important}
  body.pc-rebuilt .category-rail{width:100%!important;margin-top:0!important;border-radius:0!important;border-left:0!important;border-right:0!important;overflow-x:auto!important;padding-inline:14px!important;scrollbar-width:none!important}
  body.pc-rebuilt .category-rail::-webkit-scrollbar{display:none!important}
  body.pc-rebuilt .category-rail>span{display:none!important}
  body.pc-rebuilt .category-rail a{flex:0 0 auto!important;font-size:.86rem!important}
  body.pc-rebuilt .section,body.pc-rebuilt .featured-products,body.pc-rebuilt .professional{padding-top:42px!important;padding-bottom:42px!important}
  body.pc-rebuilt .section-heading h2{font-size:2rem!important}
  body.pc-rebuilt .section-heading p{font-size:.95rem!important;line-height:1.55!important}
  body.pc-rebuilt .visual-product-grid{display:flex!important;overflow-x:auto!important;gap:12px!important;margin-right:-14px!important;padding-right:14px!important;scroll-snap-type:x mandatory!important;scrollbar-width:none!important}
  body.pc-rebuilt .visual-product-grid::-webkit-scrollbar{display:none!important}
  body.pc-rebuilt .visual-product-card{flex:0 0 min(84vw,310px)!important;scroll-snap-align:start!important}
  body.pc-rebuilt .visual-product-image{height:176px!important}
  body.pc-rebuilt .visual-product-name{font-size:1rem!important}
  body.pc-rebuilt .visual-store{font-size:.88rem!important}
  body.pc-rebuilt .visual-price strong{font-size:1.55rem!important}
  body.pc-rebuilt .price-table-head{display:none!important}
  body.pc-rebuilt .price-row{margin:8px!important;padding:14px!important;border:1px solid var(--pc-line)!important;border-radius:13px!important}
  body.pc-rebuilt :is(.suggestions-header,.search-result-item__meta,.search-result-item__store,.table-footer,.hero-live,.eyebrow--light){font-size:.8rem!important}
  body.pc-rebuilt .final-cta{margin-inline:14px!important;padding:26px 20px!important;border-radius:18px!important}
}
@media(prefers-reduced-motion:reduce){body.pc-rebuilt *,body.pc-rebuilt *:before,body.pc-rebuilt *:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;

export function RebuiltVisualSystem(){
  const { pathname } = useLocation();
  useEffect(()=>{
    if(!document.getElementById(STYLE_ID)){
      const style=document.createElement("style");
      style.id=STYLE_ID;
      style.textContent=css;
      document.head.appendChild(style);
    }
    document.body.classList.add("pc-rebuilt");
    document.body.dataset.pcRoute = pathname;
    return ()=>{ delete document.body.dataset.pcRoute; };
  },[pathname]);
  return null;
}
