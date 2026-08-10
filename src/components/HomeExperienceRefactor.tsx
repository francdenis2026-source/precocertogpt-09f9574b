import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_ID = "pc-home-experience-v3";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    body.pc-home-v3 {
      --pc-bg: #071a29;
      --pc-surface-1: #0b2133;
      --pc-surface-2: #102a40;
      --pc-surface-elevated: #143149;
      --pc-surface-hover: #173a55;
      --pc-text: #f7fafc;
      --pc-text-2: #c8d4df;
      --pc-text-3: #8fa2b4;
      --pc-border: rgba(148,163,184,.16);
      --pc-brand: #22c55e;
      --pc-brand-hover: #16a34a;
      --pc-shadow: 0 18px 48px rgba(0,0,0,.18);
      background: var(--pc-bg);
    }

    body.pc-home-v3 .site-header {
      height: 72px !important;
      background: color-mix(in srgb, var(--bg) 88%, transparent) !important;
      border-bottom: 1px solid var(--border) !important;
      box-shadow: none !important;
    }
    body.pc-home-v3 .site-header--scrolled { height: 64px !important; }
    body.pc-home-v3 .desktop-nav { gap: 4px !important; }
    body.pc-home-v3 .desktop-nav a { padding: 8px 10px !important; font-size: .88rem !important; }
    body.pc-home-v3 .header-actions { gap: 6px !important; }
    body.pc-home-v3 .header-signup-button { border-radius: 10px !important; box-shadow: none !important; }

    body.pc-home-v3 .hero {
      margin-top: 0 !important;
      min-height: 620px !important;
      background: #071a29 !important;
      overflow: visible !important;
    }
    body.pc-home-v3 .hero-photo {
      opacity: .30 !important;
      filter: saturate(.78) contrast(1.04);
      background-position: center !important;
    }
    body.pc-home-v3 .hero-wash {
      background:
        radial-gradient(circle at 75% 42%, rgba(34,197,94,.08), transparent 30%),
        linear-gradient(90deg, rgba(7,26,41,.98) 0%, rgba(7,26,41,.94) 43%, rgba(7,26,41,.76) 70%, rgba(7,26,41,.70) 100%) !important;
    }
    body.pc-home-v3 .hero-content {
      min-height: 620px;
      padding-top: 106px !important;
      padding-bottom: 62px !important;
      grid-template-columns: minmax(0, 1.12fr) minmax(330px, .78fr) !important;
      gap: clamp(34px, 5vw, 74px) !important;
    }
    body.pc-home-v3 .hero-copy { max-width: 720px !important; }
    body.pc-home-v3 .hero-live,
    body.pc-home-v3 .eyebrow--light { font-size: 12px !important; letter-spacing: .055em; }
    body.pc-home-v3 .hero h1 {
      max-width: 700px !important;
      font-size: clamp(3.25rem, 5.25vw, 4rem) !important;
      line-height: 1.02 !important;
      letter-spacing: -.045em !important;
      margin: 16px 0 18px !important;
      color: #f8fafc !important;
    }
    body.pc-home-v3 .hero h1 span { color: var(--pc-brand) !important; }
    body.pc-home-v3 .hero-copy > p {
      max-width: 650px !important;
      color: #cbd5e1 !important;
      font-size: 1.03rem !important;
      line-height: 1.62 !important;
      margin-bottom: 24px !important;
    }

    body.pc-home-v3 .hero-actions {
      max-width: 760px !important;
      grid-template-columns: minmax(0,1fr) auto !important;
      gap: 10px !important;
      position: relative !important;
      z-index: 10000 !important;
      overflow: visible !important;
    }
    body.pc-home-v3 .search-combo,
    body.pc-home-v3 .search-combo--hero { position: relative !important; overflow: visible !important; }
    body.pc-home-v3 .search-combo__form {
      min-height: 62px !important;
      padding: 5px !important;
      border-radius: 16px !important;
      background: #fff !important;
      border: 1px solid rgba(255,255,255,.78) !important;
      box-shadow: 0 18px 50px rgba(0,0,0,.24) !important;
    }
    body.pc-home-v3 .search-combo__input-wrapper { min-height: 50px !important; }
    body.pc-home-v3 .search-combo__input {
      min-height: 50px !important;
      color: #0f172a !important;
      font-size: 1rem !important;
      padding-right: 38px !important;
    }
    body.pc-home-v3 .search-combo__input::placeholder { color: #7c8b9b !important; }
    body.pc-home-v3 .search-combo__icon { color: #64748b !important; }
    body.pc-home-v3 .search-combo__button {
      min-height: 50px !important;
      padding-inline: 19px !important;
      border-radius: 12px !important;
      background: var(--pc-brand) !important;
      color: #052e16 !important;
      box-shadow: none !important;
      font-weight: 800 !important;
    }
    body.pc-home-v3 .search-combo__button:hover { background: #4ade80 !important; transform: none !important; }
    body.pc-home-v3 .hero-actions > .button--white {
      min-height: 62px !important;
      border-radius: 16px !important;
      background: rgba(255,255,255,.10) !important;
      border: 1px solid rgba(255,255,255,.18) !important;
      color: #f8fafc !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
    }
    body.pc-home-v3 .hero-trust {
      margin-top: 16px !important;
      gap: 18px !important;
      color: #aebdca !important;
      font-size: .79rem !important;
    }
    body.pc-home-v3 .hero-trust svg { color: var(--pc-brand) !important; width: 15px; }

    body.pc-home-v3 .search-results-dynamic {
      position: absolute !important;
      top: calc(100% + 10px) !important;
      left: 0 !important;
      width: min(760px, calc(100vw - 32px)) !important;
      max-height: min(500px, 62vh) !important;
      overflow-y: auto !important;
      z-index: 999999 !important;
      background: #ffffff !important;
      color: #0f172a !important;
      border: 1px solid #dbe3ec !important;
      border-radius: 16px !important;
      box-shadow: 0 30px 75px rgba(2,6,23,.34) !important;
      padding: 6px !important;
      isolation: isolate;
    }
    body.pc-home-v3 .suggestions-header {
      padding: 10px 12px !important;
      color: #64748b !important;
      font-size: 12px !important;
      border-bottom: 1px solid #eef2f7 !important;
    }
    body.pc-home-v3 .search-result-item {
      min-height: 72px !important;
      padding: 10px 12px !important;
      border-radius: 10px !important;
      border-bottom: 0 !important;
      color: #0f172a !important;
    }
    body.pc-home-v3 .search-result-item:hover,
    body.pc-home-v3 .search-result-item:focus-visible { background: #f4f8fb !important; }
    body.pc-home-v3 .search-result-item__name { color: #0f172a !important; font-size: .94rem !important; }
    body.pc-home-v3 .search-result-item__meta,
    body.pc-home-v3 .search-result-item__store { color: #64748b !important; }
    body.pc-home-v3 .search-result-item__price { color: #15803d !important; }
    body.pc-home-v3 .suggestions-footer { background: #f8fafc !important; border-radius: 10px; }

    body.pc-home-v3 .hero-insight {
      background: linear-gradient(180deg, rgba(16,42,64,.88), rgba(11,33,51,.92)) !important;
      border: 1px solid rgba(148,163,184,.18) !important;
      box-shadow: 0 26px 70px rgba(0,0,0,.24) !important;
      border-radius: 18px !important;
      padding: 20px !important;
      backdrop-filter: none !important;
      max-height: 390px !important;
    }
    body.pc-home-v3 .hero-insight__summary { background: transparent !important; }
    body.pc-home-v3 .hero-insight__list { max-height: 205px !important; }
    body.pc-home-v3 .hero-insight__item {
      border-radius: 12px !important;
      background: rgba(255,255,255,.035) !important;
      border: 1px solid transparent !important;
    }
    body.pc-home-v3 .hero-insight__item:hover { background: rgba(255,255,255,.07) !important; }
    body.pc-home-v3 .hero-insight__footer { display: none !important; }

    /* Remove prova social e blocos redundantes logo após o hero. */
    body.pc-home-v3 .benefits-section,
    body.pc-home-v3 .metrics-float { display: none !important; }

    body.pc-home-v3 .category-rail {
      max-width: 1280px !important;
      margin: 0 auto !important;
      padding: 18px 32px !important;
      gap: 10px !important;
      background: var(--surface) !important;
      border-bottom: 1px solid var(--border) !important;
    }
    body.pc-home-v3 .category-rail > span { color: var(--muted) !important; font-size: .78rem !important; }
    body.pc-home-v3 .category-rail a {
      min-height: 42px !important;
      background: var(--surface-2) !important;
      color: var(--text-main) !important;
      border: 1px solid transparent !important;
      border-radius: 12px !important;
      box-shadow: none !important;
    }
    body.pc-home-v3 .category-rail a:hover { background: var(--surface-3) !important; border-color: var(--border) !important; transform: translateY(-1px); }

    body.pc-home-v3 .section,
    body.pc-home-v3 .featured-products,
    body.pc-home-v3 .professional { padding-top: 72px !important; padding-bottom: 72px !important; }
    body.pc-home-v3 .section-heading { margin-bottom: 28px !important; }
    body.pc-home-v3 .section-heading h2 {
      font-size: clamp(1.9rem, 3vw, 2.25rem) !important;
      line-height: 1.08 !important;
      letter-spacing: -.03em !important;
      color: var(--text-main) !important;
    }
    body.pc-home-v3 .section-heading p { max-width: 690px !important; font-size: .95rem !important; color: var(--muted) !important; }
    body.pc-home-v3 .eyebrow { font-size: .72rem !important; letter-spacing: .09em !important; }

    body.pc-home-v3 .visual-product-grid {
      grid-template-columns: repeat(4, minmax(0,1fr)) !important;
      gap: 18px !important;
    }
    body.pc-home-v3 .visual-product-grid > .visual-product-card:nth-child(n+5) { display: none !important; }
    body.pc-home-v3 .visual-product-card {
      padding: 0 !important;
      background: var(--surface) !important;
      border: 1px solid var(--border) !important;
      border-radius: 16px !important;
      box-shadow: none !important;
      overflow: hidden !important;
    }
    body.pc-home-v3 .visual-product-card:hover { transform: translateY(-3px) !important; box-shadow: var(--shadow-md) !important; }
    body.pc-home-v3 .visual-product-image { height: 205px !important; background: var(--surface-2) !important; padding: 18px !important; }
    body.pc-home-v3 .position-number,
    body.pc-home-v3 .verified-chip,
    body.pc-home-v3 .mini-trend { display: none !important; }
    body.pc-home-v3 .visual-product-content { padding: 18px 18px 20px !important; }
    body.pc-home-v3 .visual-product-name { height: auto !important; min-height: 2.7rem; font-size: 1.05rem !important; }
    body.pc-home-v3 .visual-store { margin: 6px 0 10px !important; }
    body.pc-home-v3 .visual-price strong { font-size: 1.55rem !important; color: var(--green) !important; }
    body.pc-home-v3 .visual-product-actions { grid-template-columns: 1fr auto !important; }
    body.pc-home-v3 .visual-product-actions .button { min-height: 44px !important; }
    body.pc-home-v3 .visual-product-actions .button--ghost { border: 0 !important; background: transparent !important; padding-inline: 8px !important; }

    body.pc-home-v3 .basket-grid { grid-template-columns: 1fr !important; }
    body.pc-home-v3 .basket-feature { display: none !important; }
    body.pc-home-v3 .basket-plan {
      max-width: 900px;
      padding: 30px !important;
      background: var(--surface) !important;
      border: 1px solid var(--border) !important;
      border-radius: 16px !important;
      box-shadow: none !important;
    }
    body.pc-home-v3 .budget-chips { display: flex !important; flex-wrap: wrap; gap: 8px !important; }
    body.pc-home-v3 .budget-chips a { background: var(--surface-2) !important; border: 1px solid var(--border) !important; color: var(--text-main) !important; }

    body.pc-home-v3 .section--soft { background: var(--surface-2) !important; }
    body.pc-home-v3 .price-table-card {
      background: var(--surface) !important;
      border: 1px solid var(--border) !important;
      border-radius: 16px !important;
      box-shadow: none !important;
    }
    body.pc-home-v3 .price-row:nth-of-type(n+7) { display: none !important; }
    body.pc-home-v3 .price-table-head,
    body.pc-home-v3 .price-row { border-color: var(--border) !important; }

    body.pc-home-v3 .store-grid {
      display: grid !important;
      grid-template-columns: repeat(3, minmax(0,1fr)) !important;
      gap: 12px !important;
    }
    body.pc-home-v3 .store-grid > .store-card:nth-child(n+7) { display: none !important; }
    body.pc-home-v3 .store-card {
      min-height: 78px !important;
      background: var(--surface) !important;
      border: 1px solid var(--border) !important;
      border-radius: 14px !important;
      box-shadow: none !important;
    }

    body.pc-home-v3 .steps-grid { gap: 28px !important; position: relative; }
    body.pc-home-v3 .step-card {
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
      padding: 10px 8px !important;
    }
    body.pc-home-v3 .step-number { color: var(--green) !important; font-size: 1rem !important; }

    body.pc-home-v3 .final-cta {
      min-height: 0 !important;
      margin-top: 32px !important;
      margin-bottom: 32px !important;
      padding: 38px 42px !important;
      border-radius: 18px !important;
      background: linear-gradient(120deg, #0b2133, #102a40) !important;
      border: 1px solid var(--border) !important;
      box-shadow: none !important;
    }
    body.pc-home-v3 .final-cta .cta-stat { display: none !important; }
    body.pc-home-v3 .final-cta .button--gold { background: var(--green) !important; color: #052e16 !important; box-shadow: none !important; }

    body.pc-home-v3 .professional .dashboard-preview { display: none !important; }
    body.pc-home-v3 .professional {
      margin-top: 0 !important;
      background: var(--surface-2) !important;
      border-radius: 0 !important;
    }
    body.pc-home-v3 .professional .section-heading { align-items: center !important; }

    body.pc-home-v3 .site-footer {
      background: #061624 !important;
      border-top: 1px solid rgba(148,163,184,.14) !important;
      padding-top: 40px !important;
      padding-bottom: 16px !important;
    }
    body.pc-home-v3 .footer-grid { gap: 34px !important; padding-bottom: 24px !important; }
    body.pc-home-v3 .footer-bottom { padding-top: 14px !important; }

    body.pc-home-v3 a,
    body.pc-home-v3 button,
    body.pc-home-v3 [role='button'] { cursor: pointer; }

    @media (max-width: 1024px) {
      body.pc-home-v3 .hero-content { grid-template-columns: 1fr 330px !important; gap: 28px !important; }
      body.pc-home-v3 .visual-product-grid { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
      body.pc-home-v3 .store-grid { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
    }

    @media (max-width: 820px) {
      body.pc-home-v3 .hero { min-height: 0 !important; }
      body.pc-home-v3 .hero-content {
        min-height: 0 !important;
        grid-template-columns: 1fr !important;
        padding-top: 96px !important;
        padding-bottom: 44px !important;
        gap: 24px !important;
      }
      body.pc-home-v3 .hero h1 { font-size: clamp(2.35rem, 11vw, 3.2rem) !important; }
      body.pc-home-v3 .hero-actions { grid-template-columns: 1fr !important; }
      body.pc-home-v3 .hero-actions > .button--white { display: none !important; }
      body.pc-home-v3 .hero-insight { display: none !important; }
      body.pc-home-v3 .category-rail {
        overflow-x: auto !important;
        scroll-snap-type: x proximity;
        padding: 14px 16px !important;
        max-width: 100% !important;
      }
      body.pc-home-v3 .category-rail > span { flex: 0 0 100%; }
      body.pc-home-v3 .category-rail a { scroll-snap-align: start; white-space: nowrap; }
      body.pc-home-v3 .section,
      body.pc-home-v3 .featured-products,
      body.pc-home-v3 .professional { padding-top: 56px !important; padding-bottom: 56px !important; }
      body.pc-home-v3 .store-grid { display: flex !important; overflow-x: auto !important; scroll-snap-type: x mandatory; }
      body.pc-home-v3 .store-card { min-width: 270px; scroll-snap-align: start; }
      body.pc-home-v3 .price-table-head { display: none !important; }
      body.pc-home-v3 .price-row {
        display: grid !important;
        grid-template-columns: 1fr auto !important;
        gap: 8px 12px !important;
        padding: 14px !important;
        margin: 8px !important;
        border: 1px solid var(--border) !important;
        border-radius: 12px !important;
      }
      body.pc-home-v3 .price-row > div:nth-child(2),
      body.pc-home-v3 .price-row > div:nth-child(4) { font-size: .8rem !important; }
      body.pc-home-v3 .final-cta { padding: 28px 22px !important; }
      body.pc-home-v3 .professional .section-heading { display: block !important; }
    }

    @media (max-width: 560px) {
      body.pc-home-v3 .visual-product-grid { display: flex !important; overflow-x: auto !important; scroll-snap-type: x mandatory; gap: 12px !important; padding-bottom: 8px; }
      body.pc-home-v3 .visual-product-card { min-width: min(82vw, 310px); scroll-snap-align: start; }
      body.pc-home-v3 .visual-product-image { height: 185px !important; }
      body.pc-home-v3 .search-results-dynamic {
        position: fixed !important;
        left: 12px !important;
        right: 12px !important;
        top: 150px !important;
        width: auto !important;
        max-height: calc(100vh - 174px) !important;
      }
      body.pc-home-v3 .hero-trust { gap: 10px !important; }
      body.pc-home-v3 .hero-trust span { font-size: .72rem !important; }
    }

    @media (prefers-reduced-motion: reduce) {
      body.pc-home-v3 *, body.pc-home-v3 *::before, body.pc-home-v3 *::after {
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .01ms !important;
        scroll-behavior: auto !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function replaceText(selector: string, value: string) {
  const node = document.querySelector<HTMLElement>(selector);
  if (node && node.textContent?.trim() !== value) node.textContent = value;
}

function configureHome() {
  // Navegação principal: manter somente as ações essenciais da Home.
  const allowed = new Set(["/buscar", "/melhores-precos", "/cesta-basica", "/estabelecimentos"]);
  document.querySelectorAll<HTMLAnchorElement>(".desktop-nav a").forEach(link => {
    const href = link.getAttribute("href") ?? "";
    link.style.display = allowed.has(href) ? "" : "none";
  });

  replaceText(".category-rail > span", "Explore rapidamente");

  const featured = document.querySelector<HTMLElement>(".featured-products .section-heading");
  if (featured) {
    const eyebrow = featured.querySelector<HTMLElement>(".eyebrow");
    const title = featured.querySelector<HTMLElement>("h2");
    const desc = featured.querySelector<HTMLElement>("p");
    if (eyebrow) eyebrow.textContent = "DESTAQUES DE HOJE";
    if (title) title.textContent = "Ofertas que valem a pena";
    if (desc) desc.textContent = "Uma seleção enxuta dos melhores preços disponíveis agora em Feijó.";
  }

  // Cesta: remover resumo fictício e concentrar a experiência no orçamento real.
  const basketSection = document.querySelector<HTMLElement>(".basket-grid")?.closest<HTMLElement>("section");
  if (basketSection) {
    const heading = basketSection.querySelector<HTMLElement>(".section-heading h2");
    const desc = basketSection.querySelector<HTMLElement>(".section-heading p");
    if (heading) heading.textContent = "Monte uma cesta e veja quanto pode economizar";
    if (desc) desc.textContent = "Defina seu orçamento e use a cesta inteligente para encontrar a melhor combinação de preços.";
  }

  // Preços recentes: linguagem mais compacta.
  const softSection = document.querySelector<HTMLElement>(".section--soft");
  if (softSection) {
    const h2 = softSection.querySelector<HTMLElement>("h2");
    const p = softSection.querySelector<HTMLElement>(".section-heading p");
    if (h2) h2.textContent = "Preços recentes";
    if (p) p.textContent = "Veja atualizações recentes sem sair da Home.";
  }

  // Estabelecimentos.
  const storeGrid = document.querySelector<HTMLElement>(".store-grid");
  if (storeGrid) {
    const section = storeGrid.closest<HTMLElement>("section");
    const h2 = section?.querySelector<HTMLElement>("h2");
    const p = section?.querySelector<HTMLElement>(".section-heading p");
    if (h2) h2.textContent = "Comércios monitorados em Feijó";
    if (p) p.textContent = "Acesse os estabelecimentos cadastrados e consulte os preços disponíveis.";
  }

  // Como funciona: três passos curtos e universais.
  const how = document.getElementById("como-funciona");
  if (how) {
    const cards = how.querySelectorAll<HTMLElement>(".step-card");
    const copy = [
      ["Busque", "Digite o produto que você precisa."],
      ["Compare", "Veja preços nos comércios cadastrados."],
      ["Economize", "Escolha a melhor opção ou monte sua cesta."],
    ];
    cards.forEach((card, index) => {
      const h3 = card.querySelector<HTMLElement>("h3");
      const p = card.querySelector<HTMLElement>("p");
      if (copy[index] && h3) h3.textContent = copy[index][0];
      if (copy[index] && p) p.textContent = copy[index][1];
    });
  }

  // CTA final sem estatística fictícia.
  const finalCta = document.querySelector<HTMLElement>(".final-cta");
  if (finalCta) {
    const h2 = finalCta.querySelector<HTMLElement>("h2");
    const p = finalCta.querySelector<HTMLElement>("p");
    const a = finalCta.querySelector<HTMLAnchorElement>("a.button");
    if (h2) h2.innerHTML = "Antes de comprar,<br/>descubra onde está mais barato.";
    if (p) p.textContent = "Pesquise, compare e monte sua cesta em poucos segundos.";
    if (a) a.textContent = "Começar agora";
  }

  // Área para comerciantes: sem preview de dashboard administrativo.
  const merchant = document.querySelector<HTMLElement>("section.professional");
  if (merchant) {
    const eyebrow = merchant.querySelector<HTMLElement>(".eyebrow");
    const h2 = merchant.querySelector<HTMLElement>("h2");
    const p = merchant.querySelector<HTMLElement>(".section-heading p");
    const a = merchant.querySelector<HTMLAnchorElement>(".section-heading a");
    if (eyebrow) eyebrow.textContent = "PARA COMERCIANTES";
    if (h2) h2.textContent = "Tem um comércio em Feijó?";
    if (p) p.textContent = "Cadastre seu estabelecimento e mantenha seus preços visíveis para consumidores que já estão procurando onde comprar.";
    if (a) a.textContent = "Quero cadastrar meu comércio";
  }

  document.querySelectorAll<HTMLAnchorElement>(".footer-grid a").forEach(link => {
    if (link.textContent?.trim() === "Comparar preços") link.textContent = "Buscar preços";
  });
}

export function HomeExperienceRefactor() {
  const { pathname } = useLocation();

  useEffect(() => {
    installStyles();
    if (pathname !== "/") {
      document.body.classList.remove("pc-home-v3");
      return;
    }

    document.body.classList.add("pc-home-v3");
    let frame = 0;
    let attempts = 0;
    let observer: MutationObserver | undefined;

    const apply = () => {
      frame = 0;
      attempts += 1;
      configureHome();
      if (document.querySelector(".featured-products") || attempts > 20) {
        observer?.disconnect();
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply();
    if (!document.querySelector(".featured-products")) {
      const root = document.getElementById("root") ?? document.body;
      observer = new MutationObserver(schedule);
      observer.observe(root, { childList: true, subtree: true });
    }

    return () => {
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
      document.body.classList.remove("pc-home-v3");
    };
  }, [pathname]);

  return null;
}
