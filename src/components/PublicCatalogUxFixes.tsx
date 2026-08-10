import { useEffect } from "react";
import type { Product } from "../data/catalog";

const TEST_PRODUCT_NAMES = new Set(["teste product", "teste produto", "test product"]);

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function injectStyles() {
  if (document.getElementById("pc-public-catalog-ux-fixes")) return;
  const style = document.createElement("style");
  style.id = "pc-public-catalog-ux-fixes";
  style.textContent = `
    /* A lista de sugestões fica sobre a Home e não altera a altura do hero ao digitar. */
    .search-combo { position: relative; }
    .search-combo .search-results-dynamic {
      position: absolute !important;
      left: 0;
      right: 0;
      top: calc(100% + 8px);
      width: 100%;
      z-index: 80;
      margin: 0 !important;
      max-height: min(420px, 58vh);
      overflow-y: auto;
      overscroll-behavior: contain;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      box-shadow: 0 20px 55px rgba(15,23,42,.20);
    }

    /* Modal de produto: mais compacto, legível e sem ocupar a tela inteira. */
    .pc-product-modal-polished.admin-modal-content {
      width: min(760px, calc(100vw - 32px)) !important;
      max-width: 760px !important;
      max-height: min(86vh, 760px) !important;
      overflow: hidden !important;
      border-radius: 20px !important;
    }
    .pc-product-modal-polished .admin-modal-head {
      padding: 14px 18px !important;
    }
    .pc-product-modal-polished .admin-modal-body {
      padding: 18px !important;
      max-height: calc(min(86vh, 760px) - 138px);
      overflow-y: auto;
      overscroll-behavior: contain;
    }
    .pc-product-modal-polished .admin-modal-body > div:first-child {
      grid-template-columns: 220px minmax(0, 1fr) !important;
      gap: 18px !important;
      align-items: start !important;
    }
    .pc-product-modal-polished .product-photo {
      min-height: 190px;
      max-height: 220px;
    }
    .pc-product-modal-polished .product-photo img {
      max-height: 190px !important;
      width: 100%;
      object-fit: contain;
    }
    .pc-product-modal-polished h2 {
      font-size: 1.35rem !important;
      line-height: 1.2 !important;
      margin: 6px 0 !important;
    }
    .pc-product-modal-polished .visual-price {
      margin-bottom: 12px !important;
    }
    .pc-product-modal-polished .visual-price strong {
      font-size: 1.8rem !important;
    }
    .pc-product-price-summary {
      display: grid;
      grid-template-columns: repeat(3, minmax(0,1fr));
      gap: 8px;
      margin: 12px 0 14px;
    }
    .pc-product-price-summary > span {
      padding: 10px 11px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 12px;
      min-width: 0;
    }
    .pc-product-price-summary small {
      display: block;
      margin-bottom: 3px;
      color: var(--muted);
      font-size: .68rem;
      line-height: 1.2;
    }
    .pc-product-price-summary b {
      display: block;
      font-size: .98rem;
      color: var(--text-main);
      white-space: nowrap;
    }
    .pc-product-price-summary .is-lowest b { color: var(--green); }
    .pc-product-price-summary .is-highest b { color: var(--text-main); }
    .pc-product-modal-polished .real-price-history > div:nth-child(n+5) { display: none !important; }
    .pc-product-modal-polished .admin-modal-footer {
      padding: 12px 18px !important;
      gap: 10px !important;
    }
    .pc-product-modal-polished .admin-modal-footer .button {
      height: 46px !important;
      font-size: .92rem !important;
    }

    @media (max-width: 680px) {
      .search-combo .search-results-dynamic {
        max-height: min(54vh, 380px);
      }
      .pc-product-modal-polished.admin-modal-content {
        width: calc(100vw - 20px) !important;
        max-height: 88vh !important;
        border-radius: 16px !important;
      }
      .pc-product-modal-polished .admin-modal-body {
        padding: 14px !important;
        max-height: calc(88vh - 126px);
      }
      .pc-product-modal-polished .admin-modal-body > div:first-child {
        grid-template-columns: 132px minmax(0,1fr) !important;
        gap: 12px !important;
      }
      .pc-product-modal-polished .product-photo {
        min-height: 120px;
        max-height: 145px;
      }
      .pc-product-modal-polished .product-photo img {
        max-height: 128px !important;
      }
      .pc-product-modal-polished h2 { font-size: 1.08rem !important; }
      .pc-product-modal-polished .visual-price strong { font-size: 1.45rem !important; }
      .pc-product-price-summary { grid-template-columns: repeat(3, 1fr); gap: 6px; }
      .pc-product-price-summary > span { padding: 8px; }
      .pc-product-price-summary b { font-size: .83rem; }
      .pc-product-price-summary small { font-size: .62rem; }
    }
  `;
  document.head.appendChild(style);
}

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function hideTestProducts() {
  const candidates = document.querySelectorAll<HTMLElement>(
    ".search-result-item, .professional-result-card, .visual-product-card, .butcher-product-grid article"
  );
  candidates.forEach(item => {
    const name = item.querySelector("strong, h3, .visual-product-name")?.textContent?.trim();
    if (name && TEST_PRODUCT_NAMES.has(normalize(name))) item.style.display = "none";
  });
}

function decorateProductModal(product: Product) {
  let attempts = 0;
  const apply = () => {
    attempts += 1;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"] .admin-modal-content');
    const title = document.getElementById("modal-title");
    if (!dialog || !title || title.textContent?.trim() !== "Detalhes do Produto") {
      if (attempts < 10) requestAnimationFrame(apply);
      return;
    }

    dialog.classList.add("pc-product-modal-polished");
    const body = dialog.querySelector<HTMLElement>(".admin-modal-body");
    if (!body || body.querySelector(".pc-product-price-summary")) return;

    const summary = document.createElement("div");
    summary.className = "pc-product-price-summary";
    summary.setAttribute("aria-label", "Resumo de preços do produto");
    summary.innerHTML = `
      <span class="is-lowest"><small>Menor preço</small><b>${money(product.minPrice)}</b></span>
      <span><small>Preço médio</small><b>${money(product.avgPrice)}</b></span>
      <span class="is-highest"><small>Maior preço</small><b>${money(product.maxPrice)}</b></span>
    `;

    const verified = body.querySelector<HTMLElement>(".verified-details");
    if (verified?.parentElement) verified.parentElement.insertBefore(summary, verified);
    else body.prepend(summary);
  };
  requestAnimationFrame(apply);
}

/** Ajustes públicos de catálogo sem observadores globais contínuos. */
export function PublicCatalogUxFixes() {
  useEffect(() => {
    injectStyles();
    hideTestProducts();

    const onInput = () => requestAnimationFrame(hideTestProducts);
    const onProductOpen = (event: Event) => {
      const product = (event as CustomEvent<Product>).detail;
      if (product) decorateProductModal(product);
    };
    const onClick = () => requestAnimationFrame(hideTestProducts);

    document.addEventListener("input", onInput, true);
    document.addEventListener("click", onClick, true);
    window.addEventListener("pc:open-product-details", onProductOpen as EventListener);

    return () => {
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("pc:open-product-details", onProductOpen as EventListener);
    };
  }, []);

  return null;
}
