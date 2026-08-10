import { useEffect } from "react";
import { fetchCatalog, normalize } from "../data/remoteCatalog";
import type { Product } from "../data/catalog";

function buildLookup(products: Product[]) {
  const byName = new Map<string, Product>();
  const bySlug = new Map<string, Product>();
  products.forEach(product => {
    byName.set(normalize(product.name), product);
    bySlug.set(String(product.slug), product);
    bySlug.set(String(product.id), product);
  });
  return { byName, bySlug };
}

function productFromElement(target: Element, lookup: ReturnType<typeof buildLookup>) {
  const anchor = target.closest<HTMLAnchorElement>('a[href^="/produto/"]');
  if (anchor) {
    const slug = anchor.getAttribute("href")?.split("/produto/")[1]?.split(/[?#]/)[0];
    if (slug && lookup.bySlug.has(slug)) return lookup.bySlug.get(slug);
  }

  const suggestion = target.closest<HTMLElement>(".search-result-item");
  if (suggestion) {
    const name = suggestion.querySelector("strong")?.textContent?.trim();
    if (name) return lookup.byName.get(normalize(name));
  }

  const card = target.closest<HTMLElement>(".professional-result-card, .visual-product-card, .butcher-product-grid article");
  if (card) {
    const name = card.querySelector("h3, .visual-product-name")?.textContent?.trim();
    if (name) return lookup.byName.get(normalize(name));
  }

  return undefined;
}

function injectStyles() {
  if (document.getElementById("pc-product-interaction-ux")) return;
  const style = document.createElement("style");
  style.id = "pc-product-interaction-ux";
  style.textContent = `
    .search-combo {
      position: relative;
      z-index: 80;
      isolation: isolate;
    }

    .search-combo > form {
      position: relative;
      z-index: 2;
    }

    .search-results-dynamic {
      position: absolute !important;
      top: calc(100% + 10px) !important;
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
      z-index: 120 !important;
      max-height: min(430px, calc(100vh - 190px));
      overflow-y: auto !important;
      overscroll-behavior: contain;
      scrollbar-gutter: stable;
      background: var(--surface) !important;
      color: var(--text-main) !important;
      border: 1px solid var(--border) !important;
      border-radius: 16px !important;
      box-shadow: 0 22px 55px rgba(15, 23, 42, .24), 0 4px 14px rgba(15, 23, 42, .10) !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      overflow-x: hidden;
    }

    .search-results-dynamic::before {
      content: "";
      position: sticky;
      top: 0;
      display: block;
      height: 0;
      background: var(--surface);
      z-index: -1;
    }

    .search-results-dynamic .suggestions-label {
      position: sticky;
      top: 0;
      z-index: 3;
      background: var(--surface-2) !important;
      border-bottom: 1px solid var(--border);
    }

    .search-results-dynamic .search-result-item {
      cursor: pointer;
      background: var(--surface) !important;
      border-bottom: 1px solid var(--border) !important;
      position: relative;
      z-index: 1;
    }

    .search-results-dynamic .search-result-item:last-child {
      border-bottom: 0 !important;
    }

    .search-results-dynamic .search-result-item:hover,
    .search-results-dynamic .search-result-item:focus-visible {
      background: var(--surface-2) !important;
    }

    .hero,
    .hero-content,
    .hero-copy,
    .hero-actions {
      overflow: visible !important;
    }

    .hero-actions {
      position: relative;
      z-index: 70;
    }

    .hero-insight {
      position: relative;
      z-index: 1;
    }

    .professional-search-results .professional-results-grid {
      max-height: min(720px, calc(100vh - 190px));
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-gutter: stable;
      padding-right: 6px;
    }

    .professional-search-results .professional-results-grid::-webkit-scrollbar,
    .search-results-dynamic::-webkit-scrollbar { width: 8px; }

    .professional-search-results .professional-results-grid::-webkit-scrollbar-thumb,
    .search-results-dynamic::-webkit-scrollbar-thumb {
      background: color-mix(in srgb, var(--muted) 38%, transparent);
      border-radius: 999px;
    }

    @media (max-width: 760px) {
      .search-combo {
        z-index: 150;
      }

      .search-results-dynamic {
        top: calc(100% + 8px) !important;
        max-height: min(52vh, 390px);
        border-radius: 14px !important;
        box-shadow: 0 18px 42px rgba(15, 23, 42, .28) !important;
      }

      .professional-search-results .professional-results-grid {
        max-height: 64vh;
      }
    }
  `;
  document.head.appendChild(style);
}

export function ProductInteractionUx() {
  useEffect(() => {
    let active = true;
    let clickHandler: ((event: MouseEvent) => void) | undefined;
    injectStyles();

    void fetchCatalog().then(catalog => {
      if (!active) return;
      const lookup = buildLookup(catalog.products);

      clickHandler = (event: MouseEvent) => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        if (target.closest("button, .professional-compare-button, .professional-result-store, a[href^='/estabelecimento/'], .visual-product-actions .button--primary")) return;

        const isProductIntent = Boolean(
          target.closest(".search-result-item, a[href^='/produto/'], .professional-result-card__visual, .professional-result-card h3, .visual-product-image, .visual-product-name, .butcher-product-image, .butcher-product-body h3")
        );
        if (!isProductIntent) return;

        const product = productFromElement(target, lookup);
        if (!product) return;

        event.preventDefault();
        event.stopPropagation();
        window.dispatchEvent(new CustomEvent("pc:open-product-details", { detail: product }));
      };

      document.addEventListener("click", clickHandler, true);
    }).catch(error => {
      console.warn("Falha ao ativar interação inteligente dos produtos.", error);
    });

    return () => {
      active = false;
      if (clickHandler) document.removeEventListener("click", clickHandler, true);
    };
  }, []);

  return null;
}
