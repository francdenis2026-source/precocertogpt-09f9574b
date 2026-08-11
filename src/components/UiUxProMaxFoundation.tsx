import { useEffect } from "react";

const STYLE_ID = "pc-ui-ux-pro-max-foundation";

function installFoundationStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root {
      --pc-color-bg: var(--bg);
      --pc-color-surface: var(--surface);
      --pc-color-surface-subtle: var(--surface-2);
      --pc-color-text: var(--text-main);
      --pc-color-text-muted: var(--muted);
      --pc-color-border: var(--border);
      --pc-color-primary: var(--green);
      --pc-radius-control: 12px;
      --pc-radius-card: 16px;
      --pc-space-1: 4px;
      --pc-space-2: 8px;
      --pc-space-3: 12px;
      --pc-space-4: 16px;
      --pc-space-5: 24px;
      --pc-space-6: 32px;
      --pc-motion-fast: 180ms ease;
      --pc-motion-standard: 240ms ease;
    }

    html {
      scroll-behavior: smooth;
      text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }

    body {
      min-width: 320px;
      font-size: 16px;
      line-height: 1.55;
      text-rendering: optimizeLegibility;
    }

    :where(button, a, input, select, textarea, [role="button"]):focus-visible {
      outline: 3px solid color-mix(in srgb, var(--green) 65%, white);
      outline-offset: 3px;
    }

    :where(button, [role="button"], .button, .icon-button, .mobile-menu-button) {
      touch-action: manipulation;
    }

    :where(.button, .icon-button, .mobile-menu-button, .search-combo__clear) {
      min-height: 44px;
    }

    .visual-product-card,
    .store-card,
    .price-table-card,
    .basket-plan {
      border-radius: var(--pc-radius-card);
    }

    .visual-product-name {
      line-height: 1.35;
      text-wrap: pretty;
    }

    .visual-price strong,
    .search-result-item__price,
    .price-row strong {
      font-variant-numeric: tabular-nums;
    }

    .search-combo__input {
      font-size: 1rem;
    }

    .search-result-item,
    .visual-product-card,
    .store-card,
    .button,
    .icon-button {
      transition-duration: 180ms;
    }

    /* Safe polish: improve hierarchy without replacing page geometry. */
    .section-heading h2,
    .hero h1 {
      text-wrap: balance;
    }

    .section-heading p,
    .hero-copy > p {
      text-wrap: pretty;
    }

    .visual-product-card,
    .store-card,
    .price-table-card {
      overflow: clip;
    }

    .visual-product-image img {
      object-fit: contain;
      max-width: 100%;
    }

    .visual-product-actions .button,
    .hero-actions .button,
    .search-combo__button {
      font-weight: 800;
    }

    @media (max-width: 820px) {
      .section-heading h2 {
        line-height: 1.12;
      }

      .search-combo__input,
      input,
      select,
      textarea {
        font-size: 16px;
      }
    }

    @media (max-width: 560px) {
      body.pc-home-mobile .hero-live,
      body.pc-home-mobile .eyebrow--light {
        font-size: 12px !important;
      }

      body.pc-home-mobile .hero-copy > p,
      body.pc-home-mobile .section-heading p,
      body.pc-home-mobile .basket-plan p,
      body.pc-home-mobile .final-cta p {
        font-size: 0.95rem !important;
        line-height: 1.55 !important;
      }

      body.pc-home-mobile .search-result-item__name,
      body.pc-home-mobile .visual-product-name {
        font-size: 1rem !important;
        line-height: 1.4 !important;
      }

      body.pc-home-mobile .search-result-item__meta,
      body.pc-home-mobile .search-result-item__store,
      body.pc-home-mobile .hero-trust span,
      body.pc-home-mobile .category-rail a,
      body.pc-home-mobile .visual-store,
      body.pc-home-mobile .table-footer,
      body.pc-home-mobile .budget-chips a,
      body.pc-home-mobile .step-card p {
        font-size: 0.875rem !important;
        line-height: 1.45 !important;
      }

      body.pc-home-mobile .search-result-item__price {
        font-size: 1.05rem !important;
        font-weight: 850 !important;
      }

      body.pc-home-mobile .visual-price strong {
        font-size: 1.55rem !important;
        line-height: 1.1 !important;
      }

      body.pc-home-mobile .visual-product-actions .button,
      body.pc-home-mobile .suggestions-footer a,
      body.pc-home-mobile .section-heading .inline-link {
        font-size: 0.9rem !important;
      }

      body.pc-home-mobile .category-rail a,
      body.pc-home-mobile .visual-product-actions .button,
      body.pc-home-mobile .suggestions-footer a,
      body.pc-home-mobile .budget-chips a {
        min-height: 44px !important;
      }

      body.pc-home-mobile .visual-product-grid,
      body.pc-home-mobile .store-grid,
      body.pc-home-mobile .category-rail {
        overscroll-behavior-inline: contain;
        scrollbar-width: none;
      }

      body.pc-home-mobile .visual-product-grid::-webkit-scrollbar,
      body.pc-home-mobile .store-grid::-webkit-scrollbar,
      body.pc-home-mobile .category-rail::-webkit-scrollbar {
        display: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;

  document.head.appendChild(style);
}

export function UiUxProMaxFoundation() {
  useEffect(() => {
    installFoundationStyles();
  }, []);

  return null;
}
