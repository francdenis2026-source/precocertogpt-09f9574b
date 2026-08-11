import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_ID = "pc-global-mobile-compact";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    html{-webkit-text-size-adjust:100%}
    body.pc-global-mobile{overflow-x:hidden}
    body.pc-global-mobile img{height:auto}

    @media(max-width:900px){
      body.pc-global-mobile .shell{width:min(100% - 28px,1280px)!important}
      body.pc-global-mobile .section{padding-block:2rem!important}
      body.pc-global-mobile .page-shell{padding-block:28px 56px!important}
      body.pc-global-mobile .page-title{align-items:flex-start!important;gap:12px!important;margin-bottom:18px!important}
      body.pc-global-mobile .page-title h1,
      body.pc-global-mobile .generic-hero h1,
      body.pc-global-mobile .center-heading h1{font-size:clamp(1.8rem,7vw,2.55rem)!important}
      body.pc-global-mobile .section-heading{align-items:flex-start!important;gap:14px!important;margin-bottom:20px!important}
      body.pc-global-mobile .section-heading h2{font-size:clamp(1.55rem,5vw,2.1rem)!important}
      body.pc-global-mobile .final-cta{min-height:0!important;padding:30px!important;border-radius:22px!important;gap:24px!important}
      body.pc-global-mobile .final-cta h2{font-size:clamp(1.8rem,6vw,2.5rem)!important}
      body.pc-global-mobile .benefit-grid,
      body.pc-global-mobile .basket-grid,
      body.pc-global-mobile .search-page,
      body.pc-global-mobile .dashboard-preview{grid-template-columns:1fr!important}
      body.pc-global-mobile .preview-sidebar{display:none!important}
      body.pc-global-mobile .admin-filters,
      body.pc-global-mobile .store-product-form,
      body.pc-global-mobile .pc-service-grid2{grid-template-columns:1fr!important}
      body.pc-global-mobile .admin-modal-content{width:min(94vw,720px)!important;max-height:calc(100dvh - 20px)!important;overflow:auto!important}
      body.pc-global-mobile .admin-table,
      body.pc-global-mobile .store-product-table,
      body.pc-global-mobile .compare-table-wrapper,
      body.pc-global-mobile .price-table-card{max-width:100%!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch}
      body.pc-global-mobile .admin-table>*,
      body.pc-global-mobile .store-product-table>*{min-width:680px}
      body.pc-global-mobile input,
      body.pc-global-mobile select,
      body.pc-global-mobile textarea{max-width:100%;font-size:16px}
      body.pc-global-mobile main>footer:last-child{min-height:0!important;padding:14px 18px!important;gap:10px!important;font-size:9px!important}
    }

    @media(max-width:620px){
      body.pc-global-mobile .shell{width:calc(100% - 24px)!important}
      body.pc-global-mobile .site-header{height:68px!important;min-height:68px!important;background:color-mix(in srgb,var(--surface) 94%,transparent)!important;backdrop-filter:blur(18px) saturate(1.25)!important}
      body.pc-global-mobile .site-header .shell{width:calc(100% - 16px)!important;padding:0!important}
      body.pc-global-mobile .header-inner{height:68px!important;min-height:68px!important;gap:6px!important}
      body.pc-global-mobile .header-brand-zone{min-width:0!important;flex:1 1 auto!important}
      body.pc-global-mobile .header-logo-container{min-width:0!important}
      body.pc-global-mobile .site-header .brand__logo-img{max-width:124px!important;max-height:42px!important;width:auto!important;object-fit:contain!important}
      body.pc-global-mobile .header-location,
      body.pc-global-mobile .desktop-nav,
      body.pc-global-mobile .header-actions .text-link,
      body.pc-global-mobile .header-actions .button,
      body.pc-global-mobile .header-actions .theme-toggle--compact{display:none!important}
      body.pc-global-mobile .header-actions{display:flex!important;flex:0 0 auto!important;gap:5px!important;margin:0!important;padding:4px!important;border-radius:15px!important}
      body.pc-global-mobile .header-actions .icon-button{display:grid!important;width:44px!important;height:44px!important;min-width:44px!important;min-height:44px!important;padding:0!important;border-radius:12px!important}
      body.pc-global-mobile .header-actions .icon-button svg{width:21px!important;height:21px!important}
      body.pc-global-mobile .mobile-menu-button{display:grid!important;flex:0 0 46px!important;width:46px!important;height:46px!important;border-radius:13px!important}
      body.pc-global-mobile .mobile-menu-button svg{width:22px!important;height:22px!important}
      body.pc-global-mobile .mobile-bar{height:auto!important;min-height:64px!important;padding:5px 6px calc(5px + env(safe-area-inset-bottom))!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:3px!important}
      body.pc-global-mobile .mobile-bar a{min-width:0!important;min-height:52px!important;padding:5px 2px!important;border-radius:12px!important;gap:2px!important;font-size:10px!important}
      body.pc-global-mobile .mobile-bar a svg{width:22px!important;height:22px!important}
      body.pc-global-mobile .mobile-bar a.active{background:var(--green-soft)!important;color:var(--green)!important}
      body.pc-global-mobile .button{min-height:40px!important;padding-inline:13px!important;font-size:12px!important}
      body.pc-global-mobile .section{padding-block:1.55rem!important}
      body.pc-global-mobile .page-shell{padding-block:20px 44px!important}
      body.pc-global-mobile .page-title{display:grid!important}
      body.pc-global-mobile .hero{min-height:0!important;padding-bottom:24px!important}
      body.pc-global-mobile .hero-content{padding-top:78px!important;padding-bottom:16px!important}
      body.pc-global-mobile .hero h1{font-size:clamp(2rem,10vw,2.65rem)!important}
      body.pc-global-mobile .hero-content>p{font-size:.93rem!important;line-height:1.5!important;margin-bottom:18px!important}
      body.pc-global-mobile .metrics-float{height:auto!important;margin-top:-16px!important;padding:10px!important;border-radius:14px!important;grid-template-columns:1fr!important}
      body.pc-global-mobile .metrics-float>div{min-height:56px!important;padding:8px 12px!important;border-right:0!important;border-bottom:1px solid var(--border)}
      body.pc-global-mobile .benefit-grid article,
      body.pc-global-mobile .basket-grid>article{padding:18px!important;border-radius:15px!important}
      body.pc-global-mobile .final-cta{display:grid!important;padding:22px 18px!important;border-radius:16px!important}
      body.pc-global-mobile .cta-stat{width:100%!important;padding:17px!important}
      body.pc-global-mobile .admin-card,
      body.pc-global-mobile .admin-modal-body{padding:14px!important}
      body.pc-global-mobile .store-summary-grid{grid-template-columns:1fr 1fr!important;gap:7px!important}
      body.pc-global-mobile .store-form-fields{grid-template-columns:1fr!important}
      body.pc-global-mobile .store-form-fields .wide{grid-column:auto!important}
      body.pc-global-mobile .pc-service-shell{padding-left:14px!important;padding-right:14px!important}
      body.pc-global-mobile .pc-service-hero,
      body.pc-global-mobile .pc-service-card,
      body.pc-global-mobile .pc-service-info{padding:18px!important}
      body.pc-global-mobile .pc-service-topbar{min-height:56px!important}
      body.pc-global-mobile main>footer:last-child{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;text-align:center!important;padding:11px 14px!important;line-height:1.3!important}
      body.pc-global-mobile main>footer:last-child>div{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;gap:8px!important}
    }

    @media(max-width:380px){
      body.pc-global-mobile .shell{width:calc(100% - 18px)!important}
      body.pc-global-mobile .site-header .shell{width:calc(100% - 12px)!important}
      body.pc-global-mobile .site-header .brand__logo-img{max-width:108px!important;max-height:38px!important}
      body.pc-global-mobile .header-actions{gap:3px!important;padding:3px!important}
      body.pc-global-mobile .header-actions .icon-button{width:42px!important;height:42px!important;min-width:42px!important;min-height:42px!important}
      body.pc-global-mobile .header-actions .header-search-button{display:none!important}
      body.pc-global-mobile .mobile-menu-button{flex-basis:44px!important;width:44px!important;height:44px!important}
      body.pc-global-mobile .button{min-height:38px!important;padding-inline:10px!important;font-size:11px!important}
      body.pc-global-mobile h1{overflow-wrap:anywhere}
      body.pc-global-mobile .store-summary-grid{grid-template-columns:1fr!important}
      body.pc-global-mobile .admin-modal-content{width:calc(100vw - 10px)!important;margin:5px!important;border-radius:12px!important}
      body.pc-global-mobile .mobile-bar{padding-inline:6px!important}
      body.pc-global-mobile .mobile-bar a{font-size:8px!important}
    }

    @media(max-height:700px) and (max-width:900px){
      body.pc-global-mobile .admin-modal-content,
      body.pc-global-mobile .pc-pix-modal{max-height:calc(100dvh - 8px)!important}
    }
  `;
  document.head.appendChild(style);
}

export function GlobalMobileCompactUx() {
  const { pathname } = useLocation();

  useEffect(() => {
    installStyles();
    // The rebuilt homepage has its own mobile system. Do not let this older
    // global compact layer override its typography, hero, buttons or spacing.
    const eligible = pathname !== "/";
    document.body.classList.toggle("pc-global-mobile", eligible);
    return () => document.body.classList.remove("pc-global-mobile");
  }, [pathname]);

  return null;
}
