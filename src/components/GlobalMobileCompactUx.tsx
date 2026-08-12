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

      /* Search and comparison */
      body.pc-global-mobile .scpm-shell{width:calc(100% - 20px)!important}
      body.pc-global-mobile .scpm-hero{padding:26px 0 20px!important}
      body.pc-global-mobile .scpm-hero__inner{gap:14px!important}
      body.pc-global-mobile .scpm-hero h1{margin:8px 0 10px!important;font-size:clamp(1.95rem,9.5vw,2.65rem)!important;line-height:1!important}
      body.pc-global-mobile .scpm-hero p{font-size:13px!important;line-height:1.5!important}
      body.pc-global-mobile .scpm-hero__metric{display:none!important}
      body.pc-global-mobile .scpm-searchbar{padding:7px 0!important}
      body.pc-global-mobile .scpm-searchbar form{min-height:50px!important;padding:4px 5px 4px 12px!important;border-radius:13px!important}
      body.pc-global-mobile .scpm-content{padding:18px 0 42px!important}
      body.pc-global-mobile .scpm-insight{margin-bottom:24px!important;border-radius:16px!important}
      body.pc-global-mobile .scpm-insight>header{padding:16px!important;gap:12px!important}
      body.pc-global-mobile .scpm-insight__score{padding:11px 13px!important;border-radius:12px!important}
      body.pc-global-mobile .scpm-variants{gap:8px!important;padding:0 9px 9px!important}
      body.pc-global-mobile .scpm-variant{padding:12px!important;border-radius:13px!important}
      body.pc-global-mobile .scpm-card{grid-template-columns:74px minmax(0,1fr)!important;min-height:144px!important;gap:10px!important;padding:10px!important;border-radius:14px!important}
      body.pc-global-mobile .scpm-card>.scpm-thumb{width:74px!important;height:92px!important;border-radius:10px!important}

      /* Establishment directory */
      body.pc-global-mobile .est-shell{width:calc(100% - 20px)!important}
      body.pc-global-mobile .est-header,.est-page .est-header__inner{height:54px!important}
      body.pc-global-mobile .est-header__cta{min-height:38px!important}
      body.pc-global-mobile .est-hero__inner{min-height:0!important;padding:27px 0 25px!important}
      body.pc-global-mobile .est-hero h1{margin:8px 0 10px!important;font-size:clamp(2rem,10vw,2.75rem)!important}
      body.pc-global-mobile .est-hero p{font-size:13px!important;line-height:1.5!important}
      body.pc-global-mobile .est-hero__actions{margin-top:16px!important}
      body.pc-global-mobile .est-strip{margin-top:9px!important}
      body.pc-global-mobile .est-strip__inner{gap:6px!important}
      body.pc-global-mobile .est-strip__item{min-height:58px!important;padding:9px 11px!important;border-radius:12px!important}
      body.pc-global-mobile .est-directory{padding:28px 0 38px!important}
      body.pc-global-mobile .est-filters{gap:7px!important;margin-bottom:12px!important}
      body.pc-global-mobile .est-search,.est-page .est-select,.est-page .est-filter{min-height:44px!important;border-radius:10px!important}
      body.pc-global-mobile .est-grid{gap:9px!important}
      body.pc-global-mobile .est-card{border-radius:14px!important}
      body.pc-global-mobile .est-card__head{padding:12px 12px 5px!important}
      body.pc-global-mobile .est-card__body{padding:6px 12px 10px!important}
      body.pc-global-mobile .est-card__footer{padding:9px 11px 11px!important}
      body.pc-global-mobile .est-logo{width:58px!important;height:58px!important;border-radius:12px!important}

      /* Online stores and checkout */
      body.pc-global-mobile .storefront-pro__top{height:54px!important;min-height:54px!important;padding:0 10px!important;gap:7px!important}
      body.pc-global-mobile .storefront-pro__back{font-size:0!important}
      body.pc-global-mobile .storefront-pro__back svg{width:21px!important}
      body.pc-global-mobile .storefront-pro__store small,
      body.pc-global-mobile .storefront-pro__top-actions>a,
      body.pc-global-mobile .storefront-pro__theme span{display:none!important}
      body.pc-global-mobile .storefront-pro__hero{min-height:0!important;grid-template-columns:1fr!important}
      body.pc-global-mobile .storefront-pro__hero-copy{padding:24px 14px!important}
      body.pc-global-mobile .storefront-pro__hero h1{margin:6px 0 9px!important;font-size:clamp(2rem,10vw,2.7rem)!important}
      body.pc-global-mobile .storefront-pro__hero-copy>p{font-size:12.5px!important;line-height:1.5!important}
      body.pc-global-mobile .storefront-pro__hero-meta{gap:7px!important;margin-top:12px!important}
      body.pc-global-mobile .storefront-pro__hero-art{display:none!important}
      body.pc-global-mobile .storefront-pro__layout{display:grid!important;grid-template-columns:1fr!important;gap:14px!important;width:calc(100% - 20px)!important;padding:22px 0 36px!important}
      body.pc-global-mobile .storefront-pro__grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important}
      body.pc-global-mobile .storefront-pro__image{height:160px!important;min-height:160px!important}
      body.pc-global-mobile .storefront-pro__image img{max-height:142px!important;object-fit:contain!important}
      body.pc-global-mobile .storefront-pro__product-body{padding:10px!important}
      body.pc-global-mobile .storefront-pro__checkout{position:static!important;top:auto!important}
      body.pc-global-mobile .storefront-pro__checkout-card{padding:14px!important;border-radius:12px!important}
      body.pc-global-mobile .storefront-pro__two{grid-template-columns:1fr!important}
      body.pc-global-mobile .storefront-pro__payment{padding:10px!important}

      /* Author, catalog and dashboards */
      body.pc-global-mobile .dorinha-pro__top nav>a{display:none!important}
      body.pc-global-mobile .dorinha-pro__top{padding-inline:12px!important}
      body.pc-global-mobile .dorinha-pro__catalog{padding:24px 10px 30px!important}
      body.pc-global-mobile .dorinha-pro__grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
      body.pc-global-mobile .dorinha-pro__book{border-radius:10px!important}
      body.pc-global-mobile .dorinha-pro__cover{height:190px!important}
      body.pc-global-mobile .dorinha-pro__cover img{max-height:170px!important}
      body.pc-global-mobile .dorinha-pro__book-body{padding:11px!important}
      body.pc-global-mobile .dorinha-pro__book p{display:none!important}
      body.pc-global-mobile .dorinha-pro__book h3{min-height:48px!important;font-size:16px!important}
      body.pc-global-mobile .sf-shell{width:calc(100% - 20px)!important}
      body.pc-global-mobile .sf-hero{padding-block:22px!important}
      body.pc-global-mobile .sf-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
      body.pc-global-mobile .merchant-shell,
      body.pc-global-mobile .admin-shell{width:calc(100% - 20px)!important;padding-inline:0!important}
      body.pc-global-mobile .merchant-grid,
      body.pc-global-mobile .management-grid,
      body.pc-global-mobile .platform-grid{grid-template-columns:1fr!important}
      body.pc-global-mobile .admin-card-head{align-items:flex-start!important;flex-direction:column!important;gap:9px!important}
      body.pc-global-mobile :where(button,a,[role="button"]):active{transform:scale(.98)}
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
      body.pc-global-mobile .storefront-pro__grid,
      body.pc-global-mobile .dorinha-pro__grid,
      body.pc-global-mobile .sf-grid{grid-template-columns:1fr!important}
      body.pc-global-mobile .storefront-pro__image{height:190px!important}
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
