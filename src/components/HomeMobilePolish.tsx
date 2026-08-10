import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_ID = "pc-home-mobile-polish";

function installMobileStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 560px) {
      body.pc-home-mobile {
        overflow-x: hidden;
      }

      body.pc-home-mobile .shell {
        padding-left: 16px !important;
        padding-right: 16px !important;
      }

      body.pc-home-mobile .site-header {
        height: 60px !important;
        min-height: 60px !important;
      }
      body.pc-home-mobile .site-header .shell {
        min-height: 60px !important;
        gap: 8px !important;
      }
      body.pc-home-mobile .header-location,
      body.pc-home-mobile .header-actions,
      body.pc-home-mobile .desktop-nav {
        display: none !important;
      }
      body.pc-home-mobile .brand img,
      body.pc-home-mobile .brand svg {
        max-height: 34px !important;
        width: auto !important;
      }
      body.pc-home-mobile .mobile-menu-button {
        width: 44px !important;
        height: 44px !important;
        border-radius: 12px !important;
      }

      body.pc-home-mobile .hero {
        min-height: 0 !important;
      }
      body.pc-home-mobile .hero-photo {
        opacity: .20 !important;
        background-position: 62% center !important;
      }
      body.pc-home-mobile .hero-wash {
        background: linear-gradient(180deg, rgba(7,26,41,.98), rgba(7,26,41,.93) 70%, rgba(7,26,41,.98)) !important;
      }
      body.pc-home-mobile .hero-content {
        display: block !important;
        min-height: 0 !important;
        padding-top: 82px !important;
        padding-bottom: 28px !important;
      }
      body.pc-home-mobile .hero-copy {
        max-width: none !important;
      }
      body.pc-home-mobile .hero-live {
        margin-bottom: 8px !important;
        font-size: 11px !important;
      }
      body.pc-home-mobile .eyebrow--light {
        font-size: 11px !important;
      }
      body.pc-home-mobile .hero h1 {
        font-size: clamp(2.15rem, 10.8vw, 2.7rem) !important;
        line-height: 1.02 !important;
        letter-spacing: -.04em !important;
        margin: 12px 0 12px !important;
      }
      body.pc-home-mobile .hero-copy > p {
        font-size: .95rem !important;
        line-height: 1.52 !important;
        margin-bottom: 18px !important;
      }
      body.pc-home-mobile .hero-insight,
      body.pc-home-mobile .hero-actions > .button--white {
        display: none !important;
      }

      body.pc-home-mobile .hero-actions {
        display: block !important;
        width: 100% !important;
        max-width: none !important;
        position: relative !important;
        z-index: 30000 !important;
      }
      body.pc-home-mobile .search-combo,
      body.pc-home-mobile .search-combo--hero {
        width: 100% !important;
        position: relative !important;
        overflow: visible !important;
      }
      body.pc-home-mobile .search-combo__form {
        display: grid !important;
        grid-template-columns: minmax(0,1fr) auto !important;
        align-items: center !important;
        min-height: 56px !important;
        padding: 4px !important;
        border-radius: 14px !important;
        background: #fff !important;
        box-shadow: 0 14px 36px rgba(0,0,0,.24) !important;
        overflow: visible !important;
      }
      body.pc-home-mobile .search-combo__input-wrapper {
        min-width: 0 !important;
        min-height: 48px !important;
      }
      body.pc-home-mobile .search-combo__input {
        min-width: 0 !important;
        min-height: 48px !important;
        padding-left: 40px !important;
        padding-right: 34px !important;
        font-size: 16px !important;
      }
      body.pc-home-mobile .search-combo__icon {
        left: 12px !important;
        width: 19px !important;
        height: 19px !important;
      }
      body.pc-home-mobile .search-combo__clear {
        right: 6px !important;
        width: 34px !important;
        height: 34px !important;
      }
      body.pc-home-mobile .search-combo__button {
        min-width: 96px !important;
        min-height: 48px !important;
        height: 48px !important;
        padding: 0 12px !important;
        border-radius: 11px !important;
        font-size: .84rem !important;
        gap: 5px !important;
      }
      body.pc-home-mobile .search-combo__button svg {
        width: 15px !important;
      }

      body.pc-home-mobile .search-results-dynamic {
        position: absolute !important;
        top: calc(100% + 8px) !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        max-height: min(56vh, 430px) !important;
        margin: 0 !important;
        padding: 5px !important;
        border-radius: 14px !important;
        z-index: 999999 !important;
        box-shadow: 0 24px 60px rgba(2,6,23,.36) !important;
      }
      body.pc-home-mobile .suggestions-header {
        position: sticky !important;
        top: 0 !important;
        z-index: 2 !important;
        min-height: 38px !important;
        padding: 9px 10px !important;
        background: #fff !important;
        border-radius: 9px 9px 0 0 !important;
      }
      body.pc-home-mobile .search-result-item {
        display: grid !important;
        grid-template-columns: 46px minmax(0,1fr) auto !important;
        min-height: 64px !important;
        gap: 9px !important;
        padding: 8px 9px !important;
        border-radius: 9px !important;
      }
      body.pc-home-mobile .search-result-item__image,
      body.pc-home-mobile .search-result-item__image img {
        width: 44px !important;
        height: 44px !important;
        max-width: 44px !important;
        max-height: 44px !important;
      }
      body.pc-home-mobile .search-result-item__name {
        font-size: .86rem !important;
        line-height: 1.22 !important;
      }
      body.pc-home-mobile .search-result-item__meta,
      body.pc-home-mobile .search-result-item__store {
        font-size: .69rem !important;
      }
      body.pc-home-mobile .search-result-item__price {
        font-size: .88rem !important;
      }
      body.pc-home-mobile .suggestions-footer a {
        min-height: 42px !important;
        font-size: .8rem !important;
      }

      body.pc-home-mobile .hero-trust {
        display: grid !important;
        grid-template-columns: repeat(3,minmax(0,1fr)) !important;
        gap: 6px !important;
        margin-top: 12px !important;
      }
      body.pc-home-mobile .hero-trust span {
        justify-content: flex-start !important;
        gap: 5px !important;
        font-size: .66rem !important;
        line-height: 1.25 !important;
      }
      body.pc-home-mobile .hero-trust svg {
        width: 13px !important;
        min-width: 13px !important;
      }

      body.pc-home-mobile .category-rail {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        padding: 11px 16px !important;
        margin: 0 !important;
        overflow-x: auto !important;
        scrollbar-width: none !important;
      }
      body.pc-home-mobile .category-rail::-webkit-scrollbar { display: none !important; }
      body.pc-home-mobile .category-rail > span {
        display: none !important;
      }
      body.pc-home-mobile .category-rail a {
        flex: 0 0 auto !important;
        min-height: 40px !important;
        padding: 8px 11px !important;
        font-size: .78rem !important;
        border-radius: 11px !important;
      }

      body.pc-home-mobile .section,
      body.pc-home-mobile .featured-products,
      body.pc-home-mobile .professional {
        padding-top: 38px !important;
        padding-bottom: 38px !important;
      }
      body.pc-home-mobile .section-heading {
        display: block !important;
        margin-bottom: 18px !important;
      }
      body.pc-home-mobile .section-heading h2 {
        font-size: 1.65rem !important;
        line-height: 1.08 !important;
        margin-bottom: 6px !important;
      }
      body.pc-home-mobile .section-heading p {
        font-size: .86rem !important;
        line-height: 1.45 !important;
      }
      body.pc-home-mobile .section-heading .inline-link {
        display: inline-flex !important;
        margin-top: 10px !important;
        font-size: .82rem !important;
      }

      body.pc-home-mobile .visual-product-grid {
        display: flex !important;
        gap: 11px !important;
        overflow-x: auto !important;
        scroll-snap-type: x mandatory !important;
        padding: 1px 2px 8px !important;
        margin-right: -16px !important;
        padding-right: 16px !important;
        scrollbar-width: none !important;
      }
      body.pc-home-mobile .visual-product-grid::-webkit-scrollbar { display:none !important; }
      body.pc-home-mobile .visual-product-card {
        flex: 0 0 min(78vw, 290px) !important;
        min-width: min(78vw, 290px) !important;
        scroll-snap-align: start !important;
        border-radius: 14px !important;
      }
      body.pc-home-mobile .visual-product-image {
        height: 158px !important;
        padding: 12px !important;
      }
      body.pc-home-mobile .visual-product-content {
        padding: 14px !important;
      }
      body.pc-home-mobile .visual-product-name {
        font-size: .94rem !important;
        min-height: 2.4rem !important;
      }
      body.pc-home-mobile .visual-store {
        font-size: .78rem !important;
      }
      body.pc-home-mobile .visual-price strong {
        font-size: 1.35rem !important;
      }
      body.pc-home-mobile .visual-product-actions {
        display: grid !important;
        grid-template-columns: 1fr auto !important;
        gap: 6px !important;
      }
      body.pc-home-mobile .visual-product-actions .button {
        min-height: 42px !important;
        font-size: .8rem !important;
      }

      body.pc-home-mobile .basket-plan {
        padding: 20px !important;
        border-radius: 14px !important;
      }
      body.pc-home-mobile .basket-plan h3 {
        font-size: 1.25rem !important;
      }
      body.pc-home-mobile .basket-plan p {
        font-size: .86rem !important;
      }
      body.pc-home-mobile .budget-chips {
        display: grid !important;
        grid-template-columns: repeat(4,1fr) !important;
        gap: 6px !important;
      }
      body.pc-home-mobile .budget-chips a {
        min-width: 0 !important;
        padding: 8px 5px !important;
        text-align: center !important;
        font-size: .74rem !important;
      }

      body.pc-home-mobile .price-table-card {
        padding: 3px !important;
        border-radius: 14px !important;
      }
      body.pc-home-mobile .price-row {
        grid-template-columns: minmax(0,1fr) auto !important;
        gap: 6px 10px !important;
        margin: 6px !important;
        padding: 11px !important;
        border-radius: 11px !important;
      }
      body.pc-home-mobile .price-row .product-cell {
        min-width: 0 !important;
      }
      body.pc-home-mobile .price-row .product-cell img {
        width: 42px !important;
        height: 42px !important;
      }
      body.pc-home-mobile .price-row .market-cell,
      body.pc-home-mobile .price-row > div:nth-child(4) {
        grid-column: 1 / -1 !important;
      }
      body.pc-home-mobile .price-row .row-actions {
        align-self: center !important;
      }
      body.pc-home-mobile .table-footer {
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 5px !important;
        padding: 12px !important;
        font-size: .76rem !important;
      }

      body.pc-home-mobile .store-grid {
        display: flex !important;
        gap: 10px !important;
        overflow-x: auto !important;
        scroll-snap-type: x mandatory !important;
        margin-right: -16px !important;
        padding-right: 16px !important;
        scrollbar-width: none !important;
      }
      body.pc-home-mobile .store-grid::-webkit-scrollbar { display:none !important; }
      body.pc-home-mobile .store-card {
        flex: 0 0 235px !important;
        min-width: 235px !important;
        min-height: 68px !important;
        padding: 10px 12px !important;
        scroll-snap-align: start !important;
      }

      body.pc-home-mobile .steps-grid {
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 4px !important;
      }
      body.pc-home-mobile .step-card {
        display: grid !important;
        grid-template-columns: 38px minmax(0,1fr) !important;
        column-gap: 10px !important;
        padding: 10px 0 !important;
      }
      body.pc-home-mobile .step-card .step-number {
        grid-row: 1 / 3 !important;
        align-self: start !important;
      }
      body.pc-home-mobile .step-card h3,
      body.pc-home-mobile .step-card p {
        margin: 0 !important;
      }
      body.pc-home-mobile .step-card p {
        margin-top: 3px !important;
        font-size: .82rem !important;
      }

      body.pc-home-mobile .final-cta {
        margin: 16px !important;
        padding: 24px 20px !important;
        border-radius: 16px !important;
      }
      body.pc-home-mobile .final-cta h2 {
        font-size: 1.7rem !important;
      }
      body.pc-home-mobile .final-cta p {
        font-size: .86rem !important;
      }
      body.pc-home-mobile .final-cta .button {
        width: 100% !important;
        justify-content: center !important;
        min-height: 46px !important;
      }

      body.pc-home-mobile .professional {
        padding-top: 30px !important;
        padding-bottom: 30px !important;
      }
      body.pc-home-mobile .professional .section-heading .button {
        width: 100% !important;
        justify-content: center !important;
        margin-top: 12px !important;
      }

      body.pc-home-mobile .site-footer {
        padding: 22px 0 calc(78px + env(safe-area-inset-bottom)) !important;
      }
      body.pc-home-mobile .footer-grid {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 18px 20px !important;
        padding-bottom: 16px !important;
      }
      body.pc-home-mobile .footer-grid > div:first-child {
        grid-column: 1 / -1 !important;
      }
      body.pc-home-mobile .footer-grid > div:first-child p {
        display: none !important;
      }
      body.pc-home-mobile .footer-place {
        margin-top: 7px !important;
        font-size: .75rem !important;
      }
      body.pc-home-mobile .footer-grid h3 {
        margin-bottom: 7px !important;
        font-size: .8rem !important;
      }
      body.pc-home-mobile .footer-grid a {
        display: block !important;
        padding: 4px 0 !important;
        font-size: .76rem !important;
        line-height: 1.25 !important;
      }
      body.pc-home-mobile .footer-bottom {
        display: block !important;
        padding-top: 10px !important;
        font-size: .68rem !important;
        line-height: 1.35 !important;
      }
      body.pc-home-mobile .footer-bottom span:first-child {
        display: none !important;
      }

      body.pc-home-mobile .mobile-bar {
        min-height: 62px !important;
        padding-bottom: env(safe-area-inset-bottom) !important;
      }
      body.pc-home-mobile .mobile-bar a {
        min-width: 0 !important;
        font-size: .64rem !important;
      }
      body.pc-home-mobile .mobile-bar svg {
        width: 20px !important;
        height: 20px !important;
      }
    }

    @media (max-width: 360px) {
      body.pc-home-mobile .hero-content { padding-top: 78px !important; }
      body.pc-home-mobile .hero h1 { font-size: 2.05rem !important; }
      body.pc-home-mobile .search-combo__button { min-width: 86px !important; padding-inline: 9px !important; }
      body.pc-home-mobile .search-combo__button-text { font-size: .78rem !important; }
      body.pc-home-mobile .hero-trust { grid-template-columns: 1fr !important; }
      body.pc-home-mobile .hero-trust span { font-size: .7rem !important; }
      body.pc-home-mobile .budget-chips { grid-template-columns: repeat(2,1fr) !important; }
      body.pc-home-mobile .visual-product-card { flex-basis: 84vw !important; min-width: 84vw !important; }
      body.pc-home-mobile .footer-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
      body.pc-home-mobile .footer-grid > div:first-child { grid-column: auto !important; }
    }
  `;
  document.head.appendChild(style);
}

export function HomeMobilePolish() {
  const { pathname } = useLocation();

  useEffect(() => {
    installMobileStyles();
    if (pathname === "/") document.body.classList.add("pc-home-mobile");
    else document.body.classList.remove("pc-home-mobile");

    return () => document.body.classList.remove("pc-home-mobile");
  }, [pathname]);

  return null;
}
