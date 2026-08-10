import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function injectStyles() {
  if (document.getElementById("pc-homepage-professional-rewrite")) return;
  const style = document.createElement("style");
  style.id = "pc-homepage-professional-rewrite";
  style.textContent = `
    body.pc-home-rewrite {
      --pc-home-radius: 18px;
      --pc-home-shadow: 0 18px 48px rgba(15, 23, 42, .10);
    }

    body.pc-home-rewrite .hero {
      min-height: 590px;
      position: relative;
      overflow: visible !important;
      display: flex;
      align-items: center;
      isolation: isolate;
    }
    body.pc-home-rewrite .hero-photo {
      position: absolute;
      inset: 0;
      z-index: -3;
      background-image: url('/hero-profissional.png') !important;
      background-size: cover !important;
      background-position: center 44% !important;
      background-repeat: no-repeat !important;
      transform: none !important;
    }
    body.pc-home-rewrite .hero-wash {
      position: absolute;
      inset: 0;
      z-index: -2;
      background:
        linear-gradient(90deg, rgba(5, 15, 32, .93) 0%, rgba(9, 28, 55, .86) 39%, rgba(9, 28, 55, .55) 67%, rgba(9, 28, 55, .32) 100%),
        linear-gradient(180deg, rgba(0,0,0,.10), rgba(0,0,0,.34));
    }
    body.pc-home-rewrite .hero-content {
      padding-top: 104px !important;
      padding-bottom: 54px !important;
      display: grid !important;
      grid-template-columns: minmax(0, 1.12fr) minmax(310px, .72fr) !important;
      gap: clamp(28px, 5vw, 72px) !important;
      align-items: center !important;
    }
    body.pc-home-rewrite .hero-copy {
      max-width: 720px;
    }
    body.pc-home-rewrite .hero h1 {
      max-width: 680px;
      margin: 12px 0 14px !important;
      font-size: clamp(2.65rem, 5.2vw, 4.9rem) !important;
      line-height: .98 !important;
      letter-spacing: -.045em !important;
      text-wrap: balance;
    }
    body.pc-home-rewrite .hero-copy > p {
      max-width: 620px;
      margin-bottom: 24px !important;
      font-size: clamp(1rem, 1.35vw, 1.14rem) !important;
      line-height: 1.55 !important;
    }
    body.pc-home-rewrite .hero-actions {
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) auto !important;
      gap: 10px !important;
      align-items: stretch !important;
      max-width: 760px;
      position: relative;
      z-index: 50;
    }
    body.pc-home-rewrite .hero-actions .search-combo {
      min-width: 0;
      width: 100%;
    }
    body.pc-home-rewrite .hero-actions .search-combo form {
      min-height: 58px;
      background: rgba(255,255,255,.98) !important;
      border: 1px solid rgba(255,255,255,.74) !important;
      border-radius: 16px !important;
      box-shadow: 0 18px 45px rgba(0,0,0,.22) !important;
      overflow: hidden;
    }
    body.pc-home-rewrite .hero-actions .search-combo__input {
      min-height: 58px;
      font-size: 1rem !important;
    }
    body.pc-home-rewrite .hero-actions .search-combo__button {
      min-height: 48px;
      margin: 5px;
      border-radius: 12px !important;
      padding-inline: 20px !important;
    }
    body.pc-home-rewrite .hero-actions > .button--white {
      min-height: 58px;
      border-radius: 16px !important;
      padding-inline: 22px !important;
      box-shadow: 0 15px 34px rgba(0,0,0,.16) !important;
    }
    body.pc-home-rewrite .hero-trust {
      margin-top: 16px !important;
      display: flex !important;
      gap: 14px !important;
      flex-wrap: wrap;
      font-size: .82rem !important;
      opacity: .92;
    }

    body.pc-home-rewrite .hero-insight {
      border: 1px solid rgba(255,255,255,.18) !important;
      background: rgba(8, 22, 43, .66) !important;
      backdrop-filter: blur(18px) saturate(140%);
      box-shadow: 0 28px 70px rgba(0,0,0,.28) !important;
      border-radius: 22px !important;
      padding: 18px !important;
      max-height: 410px;
      overflow: hidden;
    }
    body.pc-home-rewrite .hero-insight__summary {
      gap: 10px !important;
      margin-block: 10px !important;
    }
    body.pc-home-rewrite .hero-insight__list {
      max-height: 205px;
      overflow: hidden;
    }
    body.pc-home-rewrite .hero-insight__item {
      padding-block: 8px !important;
    }

    body.pc-home-rewrite .benefits-section {
      padding: 26px 0 14px !important;
      background: var(--surface);
    }
    body.pc-home-rewrite .benefits-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      gap: 12px !important;
    }
    body.pc-home-rewrite .benefit-card {
      min-height: 0 !important;
      padding: 18px !important;
      border-radius: 16px !important;
      box-shadow: none !important;
      transform: none !important;
    }
    body.pc-home-rewrite .benefit-icon {
      width: 42px !important;
      height: 42px !important;
      margin-bottom: 10px !important;
    }
    body.pc-home-rewrite .benefit-card h3 {
      margin: 0 0 5px !important;
      font-size: 1rem !important;
    }
    body.pc-home-rewrite .benefit-card p {
      margin: 0 !important;
      font-size: .84rem !important;
      line-height: 1.45 !important;
    }

    body.pc-home-rewrite .metrics-float {
      transform: none !important;
      margin-top: 12px !important;
      margin-bottom: 18px !important;
      padding: 10px 16px !important;
      min-height: 0 !important;
      border-radius: 14px !important;
      box-shadow: none !important;
      border: 1px solid var(--border);
      background: var(--surface);
    }
    body.pc-home-rewrite .metrics-float > div {
      padding: 6px 14px !important;
    }
    body.pc-home-rewrite .metrics-float strong {
      font-size: 1.2rem !important;
    }
    body.pc-home-rewrite .metrics-float small {
      font-size: .72rem !important;
    }

    body.pc-home-rewrite .category-rail {
      margin-top: 0 !important;
      margin-bottom: 8px !important;
      gap: 8px !important;
      padding-block: 10px !important;
      overflow-x: auto;
      scrollbar-width: none;
    }
    body.pc-home-rewrite .category-rail::-webkit-scrollbar { display: none; }
    body.pc-home-rewrite .category-rail a {
      white-space: nowrap;
      min-height: 42px;
      padding: 8px 12px !important;
      border-radius: 12px !important;
    }

    body.pc-home-rewrite .section {
      padding-top: 42px !important;
      padding-bottom: 42px !important;
    }
    body.pc-home-rewrite .section-heading {
      margin-bottom: 20px !important;
      gap: 18px !important;
    }
    body.pc-home-rewrite .section-heading h2 {
      font-size: clamp(1.65rem, 2.5vw, 2.25rem) !important;
      letter-spacing: -.025em;
      margin-bottom: 5px !important;
    }
    body.pc-home-rewrite .section-heading p {
      max-width: 680px;
      font-size: .94rem !important;
      line-height: 1.5 !important;
    }

    body.pc-home-rewrite .visual-product-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      gap: 14px !important;
    }
    body.pc-home-rewrite .visual-product-card {
      border-radius: 16px !important;
      box-shadow: none !important;
    }
    body.pc-home-rewrite .visual-product-card:hover {
      transform: translateY(-4px) !important;
      box-shadow: var(--pc-home-shadow) !important;
    }
    body.pc-home-rewrite .visual-product-image {
      height: 158px !important;
      padding: 10px !important;
    }
    body.pc-home-rewrite .visual-product-content {
      padding: 12px 14px 14px !important;
    }
    body.pc-home-rewrite .visual-product-name {
      font-size: 1rem !important;
      height: 2.6rem !important;
      margin-bottom: 6px !important;
    }
    body.pc-home-rewrite .visual-price {
      margin-bottom: 8px !important;
    }
    body.pc-home-rewrite .visual-price strong {
      font-size: 1.35rem !important;
    }
    body.pc-home-rewrite .mini-trend {
      padding: 6px 8px !important;
      font-size: .68rem !important;
      gap: 6px !important;
    }
    body.pc-home-rewrite .visual-product-actions {
      margin-top: 8px !important;
    }
    body.pc-home-rewrite .visual-product-actions .button {
      min-height: 40px;
      padding: 8px 11px !important;
      font-size: .82rem !important;
    }

    body.pc-home-rewrite .basket-grid,
    body.pc-home-rewrite .store-grid,
    body.pc-home-rewrite .steps-grid {
      gap: 14px !important;
    }
    body.pc-home-rewrite .basket-feature,
    body.pc-home-rewrite .basket-plan,
    body.pc-home-rewrite .store-card,
    body.pc-home-rewrite .step-card {
      border-radius: 16px !important;
    }
    body.pc-home-rewrite .basket-feature,
    body.pc-home-rewrite .basket-plan {
      padding: 22px !important;
    }
    body.pc-home-rewrite .step-card {
      padding: 18px !important;
      transform: none !important;
      box-shadow: none !important;
    }

    body.pc-home-rewrite .price-table-card {
      border-radius: 16px !important;
      overflow: hidden;
      box-shadow: none !important;
      border: 1px solid var(--border);
    }
    body.pc-home-rewrite .price-row,
    body.pc-home-rewrite .price-table-head {
      min-height: 58px !important;
      padding-top: 9px !important;
      padding-bottom: 9px !important;
    }

    body.pc-home-rewrite .final-cta {
      min-height: 0 !important;
      margin-top: 26px !important;
      margin-bottom: 26px !important;
      padding: 28px 30px !important;
      border-radius: 20px !important;
    }
    body.pc-home-rewrite .final-cta h2 {
      font-size: clamp(1.8rem, 3vw, 2.6rem) !important;
      line-height: 1.05 !important;
    }
    body.pc-home-rewrite .cta-stat {
      transform: scale(.92);
      transform-origin: right center;
    }

    body.pc-home-rewrite .professional {
      padding-top: 30px !important;
      padding-bottom: 38px !important;
    }
    body.pc-home-rewrite .dashboard-preview {
      max-height: 420px;
      overflow: hidden;
      border-radius: 18px !important;
    }

    body.pc-home-rewrite .site-footer {
      padding-top: 34px !important;
      padding-bottom: 14px !important;
    }
    body.pc-home-rewrite .footer-grid {
      gap: 28px !important;
      padding-bottom: 22px !important;
    }
    body.pc-home-rewrite .site-footer p,
    body.pc-home-rewrite .site-footer a,
    body.pc-home-rewrite .site-footer span {
      font-size: .82rem !important;
    }
    body.pc-home-rewrite .footer-bottom {
      padding-top: 12px !important;
      padding-bottom: 10px !important;
    }

    @media (max-width: 1100px) {
      body.pc-home-rewrite .hero-content {
        grid-template-columns: minmax(0, 1fr) 340px !important;
        gap: 28px !important;
      }
      body.pc-home-rewrite .visual-product-grid {
        grid-template-columns: repeat(3, minmax(0,1fr)) !important;
      }
      body.pc-home-rewrite .benefits-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
    }

    @media (max-width: 820px) {
      body.pc-home-rewrite .hero {
        min-height: 0;
      }
      body.pc-home-rewrite .hero-wash {
        background: linear-gradient(180deg, rgba(5,15,32,.90), rgba(9,28,55,.78) 62%, rgba(9,28,55,.72));
      }
      body.pc-home-rewrite .hero-content {
        grid-template-columns: 1fr !important;
        padding-top: 92px !important;
        padding-bottom: 34px !important;
        gap: 22px !important;
        text-align: left !important;
      }
      body.pc-home-rewrite .hero-copy { max-width: none; }
      body.pc-home-rewrite .hero h1 {
        font-size: clamp(2.25rem, 11vw, 3.5rem) !important;
      }
      body.pc-home-rewrite .hero-actions {
        grid-template-columns: 1fr !important;
        gap: 8px !important;
      }
      body.pc-home-rewrite .hero-actions > .button--white {
        min-height: 48px;
      }
      body.pc-home-rewrite .hero-insight {
        max-height: 325px;
        padding: 14px !important;
      }
      body.pc-home-rewrite .visual-product-grid {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0,1fr)) !important;
        gap: 10px !important;
      }
      body.pc-home-rewrite .visual-product-image { height: 135px !important; }
      body.pc-home-rewrite .section {
        padding-top: 30px !important;
        padding-bottom: 30px !important;
      }
      body.pc-home-rewrite .benefits-grid {
        grid-template-columns: 1fr 1fr !important;
      }
      body.pc-home-rewrite .benefit-card { padding: 14px !important; }
      body.pc-home-rewrite .metrics-float {
        display: grid !important;
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 4px !important;
      }
      body.pc-home-rewrite .metrics-float small {
        grid-column: 1 / -1;
        text-align: center;
      }
      body.pc-home-rewrite .dashboard-preview {
        max-height: 320px;
      }
    }

    @media (max-width: 540px) {
      body.pc-home-rewrite .hero-content {
        padding-top: 84px !important;
        padding-bottom: 28px !important;
      }
      body.pc-home-rewrite .hero-copy > p {
        font-size: .96rem !important;
        margin-bottom: 18px !important;
      }
      body.pc-home-rewrite .hero-trust {
        gap: 8px 12px !important;
        font-size: .74rem !important;
      }
      body.pc-home-rewrite .hero-insight { display: none !important; }
      body.pc-home-rewrite .benefits-grid {
        grid-template-columns: 1fr !important;
      }
      body.pc-home-rewrite .benefits-section {
        padding: 18px 0 8px !important;
      }
      body.pc-home-rewrite .visual-product-grid {
        grid-template-columns: 1fr 1fr !important;
      }
      body.pc-home-rewrite .visual-product-content { padding: 10px !important; }
      body.pc-home-rewrite .visual-product-name {
        font-size: .9rem !important;
        height: 2.35rem !important;
      }
      body.pc-home-rewrite .visual-store,
      body.pc-home-rewrite .mini-trend {
        display: none !important;
      }
      body.pc-home-rewrite .visual-price strong { font-size: 1.2rem !important; }
      body.pc-home-rewrite .final-cta {
        padding: 22px 18px !important;
      }
      body.pc-home-rewrite .cta-stat { display: none !important; }
      body.pc-home-rewrite .footer-grid {
        gap: 18px !important;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      body.pc-home-rewrite *,
      body.pc-home-rewrite *::before,
      body.pc-home-rewrite *::after {
        animation-duration: .001ms !important;
        transition-duration: .001ms !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export function HomepageProfessionalRewrite() {
  const { pathname } = useLocation();

  useEffect(() => {
    injectStyles();
    const active = pathname === "/";
    document.body.classList.toggle("pc-home-rewrite", active);
    return () => document.body.classList.remove("pc-home-rewrite");
  }, [pathname]);

  return null;
}
