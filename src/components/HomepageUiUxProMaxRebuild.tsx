import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_ID = "pc-homepage-uipro-rebuild";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    body.pc-home-uipro {
      --uipro-navy-950: #061725;
      --uipro-navy-900: #0a2236;
      --uipro-navy-800: #10324a;
      --uipro-slate-950: #0f172a;
      --uipro-slate-700: #334155;
      --uipro-slate-600: #475569;
      --uipro-slate-500: #64748b;
      --uipro-slate-300: #cbd5e1;
      --uipro-slate-200: #e2e8f0;
      --uipro-slate-100: #f1f5f9;
      --uipro-slate-50: #f8fafc;
      --uipro-green-700: #15803d;
      --uipro-green-600: #16a34a;
      --uipro-green-500: #22c55e;
      --uipro-green-400: #4ade80;
      --uipro-gold-500: #f59e0b;
      --uipro-radius-sm: 12px;
      --uipro-radius-md: 18px;
      --uipro-radius-lg: 24px;
      --uipro-shadow-sm: 0 8px 24px rgba(15, 23, 42, .07);
      --uipro-shadow-md: 0 18px 48px rgba(15, 23, 42, .11);
      --uipro-shadow-lg: 0 30px 90px rgba(2, 8, 23, .28);
      --uipro-shell: 1240px;
      overflow-x: hidden;
      background: #ffffff;
      color: var(--text-main);
    }

    body.pc-home-uipro .shell {
      width: min(var(--uipro-shell), calc(100% - 48px));
      margin-inline: auto;
    }

    body.pc-home-uipro :is(button, a, input, select, textarea, [role="button"]):focus-visible {
      outline: 3px solid color-mix(in srgb, var(--uipro-green-500) 70%, white);
      outline-offset: 3px;
    }

    body.pc-home-uipro :is(.button, button, [role="button"]) {
      touch-action: manipulation;
    }

    /* Header */
    body.pc-home-uipro .site-header {
      min-height: 72px !important;
      height: 72px !important;
      background: color-mix(in srgb, #ffffff 94%, transparent) !important;
      border-bottom: 1px solid rgba(148, 163, 184, .22) !important;
      box-shadow: 0 8px 30px rgba(15, 23, 42, .05) !important;
      backdrop-filter: blur(18px) saturate(140%) !important;
    }
    body.pc-home-uipro .site-header--scrolled { height: 66px !important; min-height: 66px !important; }
    body.pc-home-uipro .header-inner { min-height: inherit !important; gap: 20px !important; }
    body.pc-home-uipro .brand__logo-img,
    body.pc-home-uipro .brand img { max-height: 48px !important; width: auto !important; }
    body.pc-home-uipro .desktop-nav { gap: 4px !important; }
    body.pc-home-uipro .desktop-nav a {
      min-height: 44px !important;
      display: inline-flex !important;
      align-items: center !important;
      padding: 0 12px !important;
      border-radius: 12px !important;
      color: var(--uipro-slate-700) !important;
      font-size: .92rem !important;
      font-weight: 720 !important;
      transition: background-color 180ms ease, color 180ms ease !important;
    }
    body.pc-home-uipro .desktop-nav a:hover {
      background: var(--uipro-slate-100) !important;
      color: var(--uipro-slate-950) !important;
      transform: none !important;
    }
    body.pc-home-uipro .header-actions { gap: 8px !important; }
    body.pc-home-uipro .header-signup-button {
      min-height: 44px !important;
      border-radius: 12px !important;
      background: var(--uipro-green-600) !important;
      color: #fff !important;
      box-shadow: none !important;
      font-weight: 800 !important;
    }

    /* Hero: image-led, high contrast, one primary task */
    body.pc-home-uipro .hero {
      position: relative !important;
      min-height: 650px !important;
      margin-top: 0 !important;
      overflow: hidden !important;
      background: var(--uipro-navy-950) !important;
      border-bottom: 1px solid rgba(255,255,255,.08) !important;
    }
    body.pc-home-uipro .hero::after {
      content: "";
      position: absolute;
      inset: auto -12% -46% 42%;
      width: 700px;
      height: 700px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(34,197,94,.18), rgba(34,197,94,0) 68%);
      pointer-events: none;
      z-index: 1;
    }
    body.pc-home-uipro .hero-photo {
      opacity: .52 !important;
      filter: saturate(.88) contrast(1.08) brightness(.84) !important;
      background-position: 64% center !important;
      background-size: cover !important;
      transform: scale(1.015);
    }
    body.pc-home-uipro .hero-wash {
      background:
        linear-gradient(90deg, rgba(6,23,37,.985) 0%, rgba(6,23,37,.96) 39%, rgba(6,23,37,.76) 63%, rgba(6,23,37,.48) 100%),
        linear-gradient(180deg, rgba(6,23,37,.08), rgba(6,23,37,.52)) !important;
    }
    body.pc-home-uipro .hero-content {
      position: relative !important;
      z-index: 3 !important;
      min-height: 650px !important;
      padding-top: 118px !important;
      padding-bottom: 74px !important;
      grid-template-columns: minmax(0, 1.12fr) minmax(340px, .72fr) !important;
      align-items: center !important;
      gap: clamp(42px, 6vw, 82px) !important;
    }
    body.pc-home-uipro .hero-copy { max-width: 720px !important; }
    body.pc-home-uipro .hero-live,
    body.pc-home-uipro .eyebrow--light {
      display: inline-flex !important;
      align-items: center !important;
      min-height: 30px !important;
      padding: 5px 10px !important;
      border: 1px solid rgba(74,222,128,.28) !important;
      border-radius: 999px !important;
      background: rgba(34,197,94,.10) !important;
      color: #bbf7d0 !important;
      font-size: .78rem !important;
      font-weight: 800 !important;
      letter-spacing: .045em !important;
    }
    body.pc-home-uipro .hero h1 {
      max-width: 760px !important;
      margin: 18px 0 20px !important;
      color: #ffffff !important;
      font-size: clamp(3.25rem, 5.4vw, 4.75rem) !important;
      line-height: .98 !important;
      letter-spacing: -.052em !important;
      font-weight: 850 !important;
      text-wrap: balance !important;
    }
    body.pc-home-uipro .hero h1 span { color: var(--uipro-green-400) !important; }
    body.pc-home-uipro .hero-copy > p {
      max-width: 650px !important;
      margin: 0 0 28px !important;
      color: #d8e2ea !important;
      font-size: 1.1rem !important;
      line-height: 1.62 !important;
      text-wrap: pretty !important;
    }
    body.pc-home-uipro .hero-actions {
      position: relative !important;
      z-index: 10000 !important;
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) auto !important;
      gap: 12px !important;
      max-width: 790px !important;
      overflow: visible !important;
    }
    body.pc-home-uipro .search-combo,
    body.pc-home-uipro .search-combo--hero { position: relative !important; overflow: visible !important; }
    body.pc-home-uipro .search-combo__form {
      min-height: 64px !important;
      padding: 6px !important;
      border: 1px solid rgba(255,255,255,.85) !important;
      border-radius: 18px !important;
      background: #fff !important;
      box-shadow: 0 22px 60px rgba(2,8,23,.32) !important;
    }
    body.pc-home-uipro .search-combo__input-wrapper { min-height: 52px !important; }
    body.pc-home-uipro .search-combo__input {
      min-height: 52px !important;
      font-size: 1rem !important;
      color: var(--uipro-slate-950) !important;
    }
    body.pc-home-uipro .search-combo__input::placeholder { color: #6b7b8d !important; opacity: 1 !important; }
    body.pc-home-uipro .search-combo__button {
      min-height: 52px !important;
      padding-inline: 22px !important;
      border-radius: 13px !important;
      background: var(--uipro-green-600) !important;
      color: #ffffff !important;
      font-weight: 850 !important;
      box-shadow: none !important;
      transition: background-color 180ms ease, transform 180ms ease !important;
    }
    body.pc-home-uipro .search-combo__button:hover { background: var(--uipro-green-700) !important; transform: translateY(-1px) !important; }
    body.pc-home-uipro .hero-actions > .button--white {
      min-height: 64px !important;
      padding-inline: 20px !important;
      border-radius: 18px !important;
      border: 1px solid rgba(255,255,255,.20) !important;
      background: rgba(255,255,255,.09) !important;
      color: #ffffff !important;
      box-shadow: none !important;
      backdrop-filter: blur(8px) !important;
      font-weight: 750 !important;
    }
    body.pc-home-uipro .hero-trust {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 18px !important;
      margin-top: 18px !important;
      color: #c6d2dc !important;
      font-size: .84rem !important;
    }
    body.pc-home-uipro .hero-trust span { min-height: 28px !important; }
    body.pc-home-uipro .hero-trust svg { color: var(--uipro-green-400) !important; }

    body.pc-home-uipro .search-results-dynamic {
      position: absolute !important;
      top: calc(100% + 10px) !important;
      left: 0 !important;
      width: min(780px, calc(100vw - 32px)) !important;
      max-height: min(510px, 64vh) !important;
      overflow-y: auto !important;
      z-index: 999999 !important;
      padding: 7px !important;
      border: 1px solid var(--uipro-slate-200) !important;
      border-radius: 18px !important;
      background: #ffffff !important;
      color: var(--uipro-slate-950) !important;
      box-shadow: var(--uipro-shadow-lg) !important;
    }
    body.pc-home-uipro .search-result-item {
      min-height: 74px !important;
      padding: 10px 12px !important;
      border-radius: 12px !important;
      color: var(--uipro-slate-950) !important;
    }
    body.pc-home-uipro .search-result-item:hover,
    body.pc-home-uipro .search-result-item:focus-visible { background: var(--uipro-slate-50) !important; }
    body.pc-home-uipro .search-result-item__name { color: var(--uipro-slate-950) !important; font-size: .96rem !important; }
    body.pc-home-uipro .search-result-item__meta,
    body.pc-home-uipro .search-result-item__store { color: var(--uipro-slate-500) !important; }
    body.pc-home-uipro .search-result-item__price {
      color: var(--uipro-green-700) !important;
      font-size: 1.02rem !important;
      font-weight: 850 !important;
      font-variant-numeric: tabular-nums;
    }

    body.pc-home-uipro .hero-insight {
      position: relative !important;
      overflow: hidden !important;
      max-height: none !important;
      padding: 24px !important;
      border: 1px solid rgba(255,255,255,.16) !important;
      border-radius: 24px !important;
      background: linear-gradient(180deg, rgba(14,43,64,.84), rgba(8,29,46,.93)) !important;
      box-shadow: 0 28px 80px rgba(0,0,0,.28) !important;
      backdrop-filter: blur(16px) !important;
    }
    body.pc-home-uipro .hero-insight::before {
      content: "";
      position: absolute;
      inset: 0 0 auto 0;
      height: 2px;
      background: linear-gradient(90deg, var(--uipro-green-400), transparent 72%);
    }
    body.pc-home-uipro .hero-insight__item {
      min-height: 68px !important;
      border-radius: 14px !important;
      background: rgba(255,255,255,.045) !important;
      border: 1px solid rgba(255,255,255,.06) !important;
    }
    body.pc-home-uipro .hero-insight__item:hover { background: rgba(255,255,255,.075) !important; }

    /* Quick category navigation */
    body.pc-home-uipro .category-rail {
      width: min(var(--uipro-shell), calc(100% - 48px)) !important;
      margin: 0 auto !important;
      padding: 20px 0 !important;
      gap: 10px !important;
      background: transparent !important;
      border: 0 !important;
    }
    body.pc-home-uipro .category-rail > span {
      color: var(--uipro-slate-500) !important;
      font-size: .82rem !important;
      font-weight: 750 !important;
    }
    body.pc-home-uipro .category-rail a {
      min-height: 44px !important;
      padding: 9px 14px !important;
      border: 1px solid var(--uipro-slate-200) !important;
      border-radius: 999px !important;
      background: #fff !important;
      color: var(--uipro-slate-700) !important;
      box-shadow: 0 3px 12px rgba(15,23,42,.035) !important;
      font-size: .86rem !important;
      font-weight: 720 !important;
    }
    body.pc-home-uipro .category-rail a:hover {
      background: #f0fdf4 !important;
      border-color: #bbf7d0 !important;
      color: #166534 !important;
      transform: translateY(-1px) !important;
    }

    /* Section system */
    body.pc-home-uipro :is(.section, .featured-products, .professional) {
      position: relative !important;
      padding-top: 84px !important;
      padding-bottom: 84px !important;
    }
    body.pc-home-uipro .section-heading {
      margin-bottom: 32px !important;
      gap: 18px !important;
    }
    body.pc-home-uipro .section-heading h2 {
      max-width: 760px !important;
      color: var(--uipro-slate-950) !important;
      font-size: clamp(2rem, 3.3vw, 2.75rem) !important;
      line-height: 1.06 !important;
      letter-spacing: -.035em !important;
      font-weight: 820 !important;
      text-wrap: balance !important;
    }
    body.pc-home-uipro .section-heading p {
      max-width: 690px !important;
      color: var(--uipro-slate-600) !important;
      font-size: 1rem !important;
      line-height: 1.65 !important;
      text-wrap: pretty !important;
    }
    body.pc-home-uipro .eyebrow {
      color: var(--uipro-green-700) !important;
      font-size: .76rem !important;
      font-weight: 850 !important;
      letter-spacing: .09em !important;
    }
    body.pc-home-uipro .inline-link {
      min-height: 44px !important;
      display: inline-flex !important;
      align-items: center !important;
      color: var(--uipro-green-700) !important;
      font-weight: 780 !important;
    }

    body.pc-home-uipro .featured-products {
      background:
        radial-gradient(circle at 90% 15%, rgba(34,197,94,.08), transparent 26%),
        #ffffff !important;
    }

    /* Product cards */
    body.pc-home-uipro .visual-product-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      gap: 22px !important;
    }
    body.pc-home-uipro .visual-product-grid > .visual-product-card:nth-child(n+9) { display: none !important; }
    body.pc-home-uipro .visual-product-card {
      position: relative !important;
      overflow: hidden !important;
      padding: 0 !important;
      border: 1px solid var(--uipro-slate-200) !important;
      border-radius: 20px !important;
      background: #ffffff !important;
      box-shadow: var(--uipro-shadow-sm) !important;
      transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease !important;
    }
    body.pc-home-uipro .visual-product-card:hover {
      transform: translateY(-5px) !important;
      border-color: #cbd5e1 !important;
      box-shadow: var(--uipro-shadow-md) !important;
    }
    body.pc-home-uipro .visual-product-image {
      height: 220px !important;
      padding: 22px !important;
      background: linear-gradient(180deg, #fbfdff, #f3f7fa) !important;
      border-bottom: 1px solid #eef2f7 !important;
    }
    body.pc-home-uipro .visual-product-image img {
      width: 100% !important;
      height: 100% !important;
      object-fit: contain !important;
      filter: drop-shadow(0 12px 18px rgba(15,23,42,.10));
    }
    body.pc-home-uipro .visual-product-content { padding: 20px 20px 22px !important; }
    body.pc-home-uipro .visual-product-name {
      min-height: 2.9rem !important;
      color: var(--uipro-slate-950) !important;
      font-size: 1.06rem !important;
      line-height: 1.38 !important;
      font-weight: 780 !important;
      text-wrap: pretty !important;
    }
    body.pc-home-uipro .visual-store {
      margin: 8px 0 12px !important;
      color: var(--uipro-slate-500) !important;
      font-size: .87rem !important;
    }
    body.pc-home-uipro .visual-price {
      display: flex !important;
      align-items: baseline !important;
      gap: 8px !important;
      margin-bottom: 16px !important;
    }
    body.pc-home-uipro .visual-price strong {
      color: var(--uipro-green-700) !important;
      font-size: 1.72rem !important;
      line-height: 1 !important;
      font-weight: 880 !important;
      font-variant-numeric: tabular-nums !important;
      letter-spacing: -.03em !important;
    }
    body.pc-home-uipro .visual-product-actions {
      display: grid !important;
      grid-template-columns: 1fr 48px !important;
      gap: 10px !important;
    }
    body.pc-home-uipro .visual-product-actions .button {
      min-height: 48px !important;
      border-radius: 13px !important;
      font-weight: 800 !important;
    }
    body.pc-home-uipro .visual-product-actions .button--ghost,
    body.pc-home-uipro .visual-product-actions [aria-pressed] {
      width: 48px !important;
      min-width: 48px !important;
      padding: 0 !important;
      border: 1px solid var(--uipro-slate-200) !important;
      background: #fff !important;
    }
    body.pc-home-uipro .visual-product-actions [aria-pressed="true"] {
      color: #dc2626 !important;
      background: #fff1f2 !important;
      border-color: #fecdd3 !important;
    }

    /* Smart basket */
    body.pc-home-uipro .basket-grid {
      grid-template-columns: minmax(0, 1fr) minmax(330px, .72fr) !important;
      gap: 28px !important;
      align-items: stretch !important;
    }
    body.pc-home-uipro .basket-plan,
    body.pc-home-uipro .basket-feature {
      border: 1px solid var(--uipro-slate-200) !important;
      border-radius: 22px !important;
      background: #ffffff !important;
      box-shadow: var(--uipro-shadow-sm) !important;
    }
    body.pc-home-uipro .basket-plan { padding: 30px !important; }
    body.pc-home-uipro .budget-chips { gap: 10px !important; }
    body.pc-home-uipro .budget-chips a {
      min-height: 44px !important;
      border: 1px solid var(--uipro-slate-200) !important;
      border-radius: 12px !important;
      background: var(--uipro-slate-50) !important;
      color: var(--uipro-slate-700) !important;
      font-weight: 740 !important;
    }

    /* Recent prices */
    body.pc-home-uipro .section--soft {
      background:
        linear-gradient(180deg, rgba(248,250,252,.94), rgba(241,245,249,.98)),
        radial-gradient(circle at 10% 20%, rgba(34,197,94,.06), transparent 28%) !important;
      border-block: 1px solid #edf2f7 !important;
    }
    body.pc-home-uipro .price-table-card {
      overflow: hidden !important;
      border: 1px solid var(--uipro-slate-200) !important;
      border-radius: 20px !important;
      background: #fff !important;
      box-shadow: var(--uipro-shadow-sm) !important;
    }
    body.pc-home-uipro .price-table-head {
      background: var(--uipro-slate-50) !important;
      color: var(--uipro-slate-600) !important;
      font-size: .82rem !important;
      font-weight: 800 !important;
      letter-spacing: .025em !important;
    }
    body.pc-home-uipro .price-row {
      min-height: 64px !important;
      border-color: #eef2f7 !important;
      transition: background-color 160ms ease !important;
    }
    body.pc-home-uipro .price-row:hover { background: #fbfefc !important; }
    body.pc-home-uipro .price-row strong {
      color: var(--uipro-green-700) !important;
      font-variant-numeric: tabular-nums !important;
      font-weight: 850 !important;
    }

    /* Store cards */
    body.pc-home-uipro .store-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      gap: 20px !important;
    }
    body.pc-home-uipro .store-card {
      min-height: 210px !important;
      padding: 22px !important;
      border: 1px solid var(--uipro-slate-200) !important;
      border-radius: 20px !important;
      background: #fff !important;
      box-shadow: var(--uipro-shadow-sm) !important;
      transition: transform 200ms ease, box-shadow 200ms ease !important;
    }
    body.pc-home-uipro .store-card:hover { transform: translateY(-4px) !important; box-shadow: var(--uipro-shadow-md) !important; }
    body.pc-home-uipro .store-logo { box-shadow: none !important; }

    /* How it works */
    body.pc-home-uipro #como-funciona {
      background: #fff !important;
    }
    body.pc-home-uipro #como-funciona .steps-grid,
    body.pc-home-uipro #como-funciona .how-grid {
      gap: 20px !important;
    }
    body.pc-home-uipro .step-card {
      position: relative !important;
      min-height: 210px !important;
      padding: 26px !important;
      border: 1px solid var(--uipro-slate-200) !important;
      border-radius: 20px !important;
      background: linear-gradient(180deg, #ffffff, #fbfdff) !important;
      box-shadow: none !important;
    }
    body.pc-home-uipro .step-card h3 { color: var(--uipro-slate-950) !important; font-size: 1.2rem !important; }
    body.pc-home-uipro .step-card p { color: var(--uipro-slate-600) !important; font-size: .96rem !important; line-height: 1.6 !important; }

    /* Merchant section */
    body.pc-home-uipro section.professional {
      overflow: hidden !important;
      background:
        radial-gradient(circle at 82% 20%, rgba(74,222,128,.16), transparent 28%),
        linear-gradient(135deg, var(--uipro-navy-950), var(--uipro-navy-900)) !important;
      color: #fff !important;
    }
    body.pc-home-uipro section.professional .section-heading h2 { color: #fff !important; }
    body.pc-home-uipro section.professional .section-heading p { color: #cbd8e2 !important; }
    body.pc-home-uipro section.professional .eyebrow { color: #86efac !important; }
    body.pc-home-uipro section.professional .inline-link,
    body.pc-home-uipro section.professional .button {
      color: #fff !important;
    }

    /* Final CTA */
    body.pc-home-uipro .final-cta {
      position: relative !important;
      overflow: hidden !important;
      padding: 72px 32px !important;
      border-radius: 28px !important;
      background:
        radial-gradient(circle at 85% 20%, rgba(255,255,255,.17), transparent 24%),
        linear-gradient(135deg, #15803d, #0f5f31) !important;
      color: #fff !important;
      box-shadow: 0 28px 70px rgba(21,128,61,.22) !important;
    }
    body.pc-home-uipro .final-cta h2 {
      color: #fff !important;
      font-size: clamp(2.1rem, 4vw, 3.25rem) !important;
      line-height: 1.02 !important;
      letter-spacing: -.04em !important;
      text-wrap: balance !important;
    }
    body.pc-home-uipro .final-cta p { color: #dcfce7 !important; font-size: 1.02rem !important; }
    body.pc-home-uipro .final-cta .button {
      min-height: 50px !important;
      border-radius: 14px !important;
      background: #fff !important;
      color: #14532d !important;
      font-weight: 850 !important;
    }

    /* Footer */
    body.pc-home-uipro footer,
    body.pc-home-uipro .site-footer {
      border-top: 1px solid var(--uipro-slate-200) !important;
      background: #f8fafc !important;
    }

    /* Dark mode pairing */
    [data-theme="dark"] body.pc-home-uipro {
      background: #07131f !important;
    }
    [data-theme="dark"] body.pc-home-uipro .site-header {
      background: color-mix(in srgb, #07131f 92%, transparent) !important;
      border-bottom-color: rgba(148,163,184,.16) !important;
    }
    [data-theme="dark"] body.pc-home-uipro :is(.featured-products, #como-funciona) { background: #07131f !important; }
    [data-theme="dark"] body.pc-home-uipro :is(.visual-product-card,.store-card,.basket-plan,.basket-feature,.price-table-card,.step-card) {
      background: #0c1d2b !important;
      border-color: rgba(148,163,184,.16) !important;
    }
    [data-theme="dark"] body.pc-home-uipro :is(.section-heading h2,.visual-product-name,.step-card h3) { color: #f8fafc !important; }
    [data-theme="dark"] body.pc-home-uipro :is(.section-heading p,.step-card p,.visual-store) { color: #aebdca !important; }
    [data-theme="dark"] body.pc-home-uipro .visual-product-image { background: #102433 !important; border-bottom-color: rgba(148,163,184,.12) !important; }
    [data-theme="dark"] body.pc-home-uipro .section--soft { background: #091824 !important; border-color: rgba(148,163,184,.12) !important; }
    [data-theme="dark"] body.pc-home-uipro .price-table-head { background: #102433 !important; }
    [data-theme="dark"] body.pc-home-uipro .category-rail a { background: #0c1d2b !important; color: #d7e2ea !important; border-color: rgba(148,163,184,.18) !important; }

    @media (max-width: 1100px) {
      body.pc-home-uipro .visual-product-grid,
      body.pc-home-uipro .store-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
      body.pc-home-uipro .hero-content { grid-template-columns: minmax(0, 1fr) minmax(300px, .7fr) !important; gap: 34px !important; }
    }

    @media (max-width: 820px) {
      body.pc-home-uipro .shell { width: min(100% - 32px, var(--uipro-shell)); }
      body.pc-home-uipro .site-header { height: 64px !important; min-height: 64px !important; }
      body.pc-home-uipro .desktop-nav,
      body.pc-home-uipro .header-location { display: none !important; }
      body.pc-home-uipro .mobile-menu-button { min-width: 44px !important; min-height: 44px !important; border-radius: 12px !important; }

      body.pc-home-uipro .hero { min-height: 0 !important; }
      body.pc-home-uipro .hero-photo { opacity: .34 !important; background-position: 69% center !important; }
      body.pc-home-uipro .hero-wash {
        background: linear-gradient(180deg, rgba(6,23,37,.97), rgba(6,23,37,.90) 72%, rgba(6,23,37,.97)) !important;
      }
      body.pc-home-uipro .hero-content {
        display: block !important;
        min-height: 0 !important;
        padding-top: 96px !important;
        padding-bottom: 46px !important;
      }
      body.pc-home-uipro .hero-copy { max-width: 680px !important; }
      body.pc-home-uipro .hero h1 {
        max-width: 680px !important;
        font-size: clamp(2.65rem, 9vw, 3.75rem) !important;
        line-height: 1.01 !important;
      }
      body.pc-home-uipro .hero-copy > p { font-size: 1rem !important; }
      body.pc-home-uipro .hero-insight { display: none !important; }
      body.pc-home-uipro .visual-product-grid,
      body.pc-home-uipro .store-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
      body.pc-home-uipro .basket-grid { grid-template-columns: 1fr !important; }
      body.pc-home-uipro :is(.section, .featured-products, .professional) { padding-top: 64px !important; padding-bottom: 64px !important; }
    }

    @media (max-width: 560px) {
      body.pc-home-uipro .shell { width: calc(100% - 32px) !important; }
      body.pc-home-uipro .brand__logo-img,
      body.pc-home-uipro .brand img { max-height: 38px !important; }
      body.pc-home-uipro .hero-content { padding-top: 84px !important; padding-bottom: 34px !important; }
      body.pc-home-uipro .hero-live,
      body.pc-home-uipro .eyebrow--light { font-size: .72rem !important; min-height: 28px !important; }
      body.pc-home-uipro .hero h1 {
        font-size: clamp(2.25rem, 11.6vw, 3rem) !important;
        line-height: 1.02 !important;
        margin: 14px 0 14px !important;
      }
      body.pc-home-uipro .hero-copy > p {
        font-size: 1rem !important;
        line-height: 1.58 !important;
        margin-bottom: 20px !important;
      }
      body.pc-home-uipro .hero-actions {
        display: block !important;
        width: 100% !important;
      }
      body.pc-home-uipro .hero-actions > .button--white { display: none !important; }
      body.pc-home-uipro .search-combo__form {
        min-height: 58px !important;
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) auto !important;
        border-radius: 16px !important;
      }
      body.pc-home-uipro .search-combo__input { min-height: 46px !important; font-size: 16px !important; }
      body.pc-home-uipro .search-combo__button {
        min-height: 46px !important;
        min-width: 92px !important;
        padding-inline: 12px !important;
        font-size: .86rem !important;
      }
      body.pc-home-uipro .hero-trust {
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 5px !important;
        font-size: .82rem !important;
      }
      body.pc-home-uipro .category-rail {
        width: 100% !important;
        padding: 14px 16px !important;
        overflow-x: auto !important;
        scrollbar-width: none !important;
      }
      body.pc-home-uipro .category-rail::-webkit-scrollbar { display: none !important; }
      body.pc-home-uipro .category-rail > span { display: none !important; }
      body.pc-home-uipro .category-rail a { flex: 0 0 auto !important; }

      body.pc-home-uipro :is(.section, .featured-products, .professional) { padding-top: 48px !important; padding-bottom: 48px !important; }
      body.pc-home-uipro .section-heading { margin-bottom: 22px !important; }
      body.pc-home-uipro .section-heading h2 {
        font-size: 1.8rem !important;
        line-height: 1.1 !important;
      }
      body.pc-home-uipro .section-heading p { font-size: 1rem !important; line-height: 1.58 !important; }

      body.pc-home-uipro .visual-product-grid,
      body.pc-home-uipro .store-grid {
        grid-template-columns: 1fr !important;
        gap: 16px !important;
      }
      body.pc-home-uipro .visual-product-card,
      body.pc-home-uipro .store-card { border-radius: 18px !important; }
      body.pc-home-uipro .visual-product-image { height: 210px !important; }
      body.pc-home-uipro .visual-product-name { font-size: 1.05rem !important; }
      body.pc-home-uipro .visual-price strong { font-size: 1.65rem !important; }
      body.pc-home-uipro .basket-plan { padding: 22px !important; border-radius: 18px !important; }
      body.pc-home-uipro .price-table-card { border-radius: 16px !important; overflow-x: auto !important; }
      body.pc-home-uipro .final-cta { padding: 46px 22px !important; border-radius: 20px !important; }
      body.pc-home-uipro .final-cta h2 { font-size: 2rem !important; }
    }

    @media (prefers-reduced-motion: reduce) {
      body.pc-home-uipro *,
      body.pc-home-uipro *::before,
      body.pc-home-uipro *::after {
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .01ms !important;
        scroll-behavior: auto !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function text(selector: string, value: string) {
  const node = document.querySelector<HTMLElement>(selector);
  if (node && node.textContent?.trim() !== value) node.textContent = value;
}

function configureHomeCopy() {
  text(".hero-live", "PREÇOS LOCAIS • FEIJÓ-AC");

  const heroTitle = document.querySelector<HTMLElement>(".hero h1");
  if (heroTitle) heroTitle.innerHTML = "Compare preços em Feijó.<br/><span>Compre melhor.</span>";

  text(
    ".hero-copy > p",
    "Pesquise produtos, compare valores entre os comércios locais e encontre onde sua compra custa menos — antes de sair de casa."
  );

  const featured = document.querySelector<HTMLElement>(".featured-products .section-heading");
  if (featured) {
    const eyebrow = featured.querySelector<HTMLElement>(".eyebrow");
    const title = featured.querySelector<HTMLElement>("h2");
    const desc = featured.querySelector<HTMLElement>("p");
    if (eyebrow) eyebrow.textContent = "MELHORES OPORTUNIDADES";
    if (title) title.textContent = "Preços que merecem sua atenção hoje";
    if (desc) desc.textContent = "Produtos com valores competitivos encontrados nos estabelecimentos cadastrados em Feijó.";
  }

  const basketSection = document.querySelector<HTMLElement>(".basket-grid")?.closest<HTMLElement>("section");
  if (basketSection) {
    const eyebrow = basketSection.querySelector<HTMLElement>(".eyebrow");
    const title = basketSection.querySelector<HTMLElement>(".section-heading h2");
    const desc = basketSection.querySelector<HTMLElement>(".section-heading p");
    if (eyebrow) eyebrow.textContent = "CESTA INTELIGENTE";
    if (title) title.textContent = "Transforme seu orçamento em uma compra mais inteligente";
    if (desc) desc.textContent = "Informe quanto pretende gastar e deixe o PreçoCerto ajudar a encontrar uma combinação mais econômica.";
  }

  const recent = document.querySelector<HTMLElement>(".section--soft");
  if (recent) {
    const eyebrow = recent.querySelector<HTMLElement>(".eyebrow");
    const title = recent.querySelector<HTMLElement>("h2");
    const desc = recent.querySelector<HTMLElement>(".section-heading p");
    if (eyebrow) eyebrow.textContent = "ATUALIZAÇÕES";
    if (title) title.textContent = "Preços recentes no comércio local";
    if (desc) desc.textContent = "Acompanhe valores atualizados e compare rapidamente antes de decidir onde comprar.";
  }

  const storeGrid = document.querySelector<HTMLElement>(".store-grid");
  if (storeGrid) {
    const section = storeGrid.closest<HTMLElement>("section");
    const eyebrow = section?.querySelector<HTMLElement>(".eyebrow");
    const title = section?.querySelector<HTMLElement>("h2");
    const desc = section?.querySelector<HTMLElement>(".section-heading p");
    if (eyebrow) eyebrow.textContent = "ONDE COMPRAR";
    if (title) title.textContent = "Comércios e estabelecimentos de Feijó";
    if (desc) desc.textContent = "Explore os estabelecimentos cadastrados e consulte seus produtos e preços disponíveis.";
  }

  const how = document.getElementById("como-funciona");
  if (how) {
    const heading = how.querySelector<HTMLElement>(".section-heading h2");
    const desc = how.querySelector<HTMLElement>(".section-heading p");
    if (heading) heading.textContent = "Economizar começa com três passos simples";
    if (desc) desc.textContent = "O PreçoCerto organiza as informações para você decidir com mais segurança e gastar melhor.";
    const cards = how.querySelectorAll<HTMLElement>(".step-card");
    const copy = [
      ["1. Pesquise", "Digite o produto, marca ou categoria que você precisa."],
      ["2. Compare", "Veja os preços encontrados nos estabelecimentos cadastrados."],
      ["3. Escolha", "Decida onde comprar ou use a cesta inteligente para otimizar seu orçamento."],
    ];
    cards.forEach((card, index) => {
      if (!copy[index]) return;
      const h3 = card.querySelector<HTMLElement>("h3");
      const p = card.querySelector<HTMLElement>("p");
      if (h3) h3.textContent = copy[index][0];
      if (p) p.textContent = copy[index][1];
    });
  }

  const merchant = document.querySelector<HTMLElement>("section.professional");
  if (merchant) {
    const eyebrow = merchant.querySelector<HTMLElement>(".eyebrow");
    const title = merchant.querySelector<HTMLElement>("h2");
    const desc = merchant.querySelector<HTMLElement>(".section-heading p");
    if (eyebrow) eyebrow.textContent = "PARA O COMÉRCIO LOCAL";
    if (title) title.textContent = "Seu comércio também pode estar onde o cliente pesquisa";
    if (desc) desc.textContent = "Mantenha sua vitrine digital atualizada e apareça para consumidores que já estão comparando onde comprar em Feijó.";
  }

  const finalCta = document.querySelector<HTMLElement>(".final-cta");
  if (finalCta) {
    const title = finalCta.querySelector<HTMLElement>("h2");
    const desc = finalCta.querySelector<HTMLElement>("p");
    const action = finalCta.querySelector<HTMLAnchorElement>("a.button");
    if (title) title.innerHTML = "Seu dinheiro pode render mais.<br/>Compare antes de comprar.";
    if (desc) desc.textContent = "Comece pesquisando um produto e descubra as melhores opções disponíveis em Feijó.";
    if (action) action.textContent = "Pesquisar preços";
  }
}

export function HomepageUiUxProMaxRebuild() {
  const { pathname } = useLocation();

  useEffect(() => {
    installStyles();

    if (pathname !== "/") {
      document.body.classList.remove("pc-home-uipro");
      return;
    }

    document.body.classList.add("pc-home-uipro");

    let frame = 0;
    let attempts = 0;
    let observer: MutationObserver | undefined;

    const apply = () => {
      frame = 0;
      attempts += 1;
      configureHomeCopy();
      if (document.querySelector(".featured-products") || attempts > 24) observer?.disconnect();
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply();
    if (!document.querySelector(".featured-products")) {
      observer = new MutationObserver(schedule);
      observer.observe(document.getElementById("root") ?? document.body, { childList: true, subtree: true });
    }

    return () => {
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
      document.body.classList.remove("pc-home-uipro");
    };
  }, [pathname]);

  return null;
}
