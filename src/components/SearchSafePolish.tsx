import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_ID = "pc-search-safe-polish";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    body.pc-search-polish .search-command {
      max-width: 1180px !important;
      margin-inline: auto !important;
      padding-inline: 24px !important;
    }

    body.pc-search-polish .search-command__intro {
      max-width: 760px !important;
      margin-bottom: 24px !important;
    }

    body.pc-search-polish .search-command__intro h1 {
      font-size: clamp(2rem, 4vw, 3rem) !important;
      line-height: 1.06 !important;
      letter-spacing: -.035em !important;
      margin-bottom: 12px !important;
      text-wrap: balance;
    }

    body.pc-search-polish .search-command__intro p {
      max-width: 680px !important;
      color: var(--muted) !important;
      font-size: 1rem !important;
      line-height: 1.6 !important;
    }

    body.pc-search-polish .search-ux-guide {
      margin-top: 16px !important;
      padding: 14px 16px !important;
      border-radius: 14px !important;
      border: 1px solid var(--border) !important;
      background: var(--surface-2) !important;
      font-size: .9rem !important;
    }

    body.pc-search-polish .professional-search-results,
    body.pc-search-polish .search-results-section {
      max-width: 1180px !important;
      margin-inline: auto !important;
    }

    body.pc-search-polish .professional-search-results .professional-results-grid {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 16px !important;
      max-height: none !important;
      overflow: visible !important;
      padding-right: 0 !important;
    }

    body.pc-search-polish .professional-result-card {
      border: 1px solid var(--border) !important;
      border-radius: 18px !important;
      background: var(--surface) !important;
      box-shadow: 0 8px 28px rgba(15,23,42,.05) !important;
      overflow: hidden !important;
      transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease !important;
    }

    body.pc-search-polish .professional-result-card:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 16px 36px rgba(15,23,42,.08) !important;
      border-color: color-mix(in srgb, var(--green) 35%, var(--border)) !important;
    }

    body.pc-search-polish .professional-result-card h3 {
      font-size: 1.02rem !important;
      line-height: 1.35 !important;
      text-wrap: pretty;
    }

    body.pc-search-polish .professional-result-card__visual img {
      object-fit: contain !important;
      max-width: 100% !important;
      max-height: 100% !important;
    }

    body.pc-search-polish .professional-result-price,
    body.pc-search-polish .professional-result-card [class*="price"] strong {
      font-variant-numeric: tabular-nums;
      font-weight: 900 !important;
    }

    body.pc-search-polish .professional-result-card .button,
    body.pc-search-polish .professional-compare-button {
      min-height: 44px !important;
      border-radius: 12px !important;
      font-weight: 800 !important;
    }

    body.pc-search-polish .professional-compare-button[aria-pressed="true"],
    body.pc-search-polish .professional-compare-button.is-selected {
      background: color-mix(in srgb, var(--green) 14%, var(--surface)) !important;
      border-color: color-mix(in srgb, var(--green) 48%, var(--border)) !important;
      color: var(--text-main) !important;
    }

    body.pc-search-polish .search-filters,
    body.pc-search-polish .filters-row,
    body.pc-search-polish .professional-filters,
    body.pc-search-polish .search-toolbar {
      gap: 10px !important;
      margin-bottom: 20px !important;
    }

    body.pc-search-polish .search-filters :is(input,select,button),
    body.pc-search-polish .filters-row :is(input,select,button),
    body.pc-search-polish .professional-filters :is(input,select,button),
    body.pc-search-polish .search-toolbar :is(input,select,button) {
      min-height: 46px !important;
      border-radius: 12px !important;
      border-color: var(--border) !important;
      font-size: .95rem !important;
    }

    body.pc-search-polish .search-results-dynamic {
      border-radius: 16px !important;
      padding: 6px !important;
    }

    body.pc-search-polish .search-result-item {
      min-height: 76px !important;
      border-radius: 10px !important;
      padding: 10px 12px !important;
    }

    body.pc-search-polish .search-result-item__name {
      font-size: .98rem !important;
      line-height: 1.35 !important;
    }

    body.pc-search-polish .search-result-item__meta,
    body.pc-search-polish .search-result-item__store {
      font-size: .84rem !important;
      line-height: 1.4 !important;
    }

    body.pc-search-polish .search-result-item__price {
      font-size: 1.02rem !important;
      font-weight: 900 !important;
      font-variant-numeric: tabular-nums;
    }

    @media (max-width: 820px) {
      body.pc-search-polish .search-command {
        padding-inline: 16px !important;
      }

      body.pc-search-polish .professional-search-results .professional-results-grid {
        grid-template-columns: 1fr !important;
        gap: 12px !important;
      }

      body.pc-search-polish .search-command__intro h1 {
        font-size: clamp(1.8rem, 8vw, 2.4rem) !important;
      }

      body.pc-search-polish .search-command__intro p {
        font-size: .95rem !important;
      }

      body.pc-search-polish .search-filters,
      body.pc-search-polish .filters-row,
      body.pc-search-polish .professional-filters,
      body.pc-search-polish .search-toolbar {
        display: grid !important;
        grid-template-columns: 1fr !important;
      }

      body.pc-search-polish .search-filters :is(input,select,button),
      body.pc-search-polish .filters-row :is(input,select,button),
      body.pc-search-polish .professional-filters :is(input,select,button),
      body.pc-search-polish .search-toolbar :is(input,select,button) {
        width: 100% !important;
        font-size: 16px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export function SearchSafePolish() {
  const { pathname } = useLocation();

  useEffect(() => {
    installStyles();
    const active = pathname === "/buscar" || pathname === "/melhores-precos" || pathname.startsWith("/produto/");
    document.body.classList.toggle("pc-search-polish", active);
    return () => document.body.classList.remove("pc-search-polish");
  }, [pathname]);

  return null;
}
