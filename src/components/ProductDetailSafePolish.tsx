import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_ID = "pc-product-detail-safe-polish";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    body.pc-product-detail-route main {
      background: var(--bg);
    }

    body.pc-product-detail-route :where(.product-detail, .product-page, .product-view, .product-details, .product-shell) {
      max-width: 1180px;
      margin-inline: auto;
    }

    body.pc-product-detail-route :where(.product-detail-card, .product-summary, .product-info-card, .price-comparison, .price-history-card, .store-price-card, .product-offer-card) {
      border: 1px solid var(--border) !important;
      border-radius: 18px !important;
      background: var(--surface) !important;
      box-shadow: 0 10px 30px rgba(15, 23, 42, .06) !important;
    }

    body.pc-product-detail-route :where(.product-detail h1, .product-page h1, .product-view h1, .product-details h1) {
      font-size: clamp(1.75rem, 3vw, 2.55rem) !important;
      line-height: 1.08 !important;
      letter-spacing: -.025em;
      text-wrap: balance;
      color: var(--text-main) !important;
    }

    body.pc-product-detail-route :where(.product-detail p, .product-page p, .product-view p, .product-details p) {
      line-height: 1.55;
    }

    body.pc-product-detail-route :where(.product-image, .product-detail-image, .product-hero-image, .product-visual) {
      border-radius: 18px !important;
      background: linear-gradient(180deg, color-mix(in srgb, var(--surface-2) 75%, transparent), var(--surface)) !important;
      overflow: hidden;
    }

    body.pc-product-detail-route :where(.product-image img, .product-detail-image img, .product-hero-image img, .product-visual img) {
      width: 100%;
      max-height: 420px;
      object-fit: contain !important;
      padding: 18px;
    }

    body.pc-product-detail-route :where(.best-price, .lowest-price, .product-best-price, .price-highlight, .price-main) {
      color: var(--green) !important;
      font-size: clamp(1.8rem, 4vw, 2.65rem) !important;
      font-weight: 900 !important;
      line-height: 1 !important;
      font-variant-numeric: tabular-nums;
    }

    body.pc-product-detail-route :where(.price-row, .price-item, .store-price-row, .offer-row) {
      min-height: 64px;
      border-bottom: 1px solid var(--border);
      padding-block: 12px;
      gap: 14px;
    }

    body.pc-product-detail-route :where(.price-row, .price-item, .store-price-row, .offer-row):last-child {
      border-bottom: 0;
    }

    body.pc-product-detail-route :where(.price-row strong, .price-item strong, .store-price-row strong, .offer-row strong) {
      font-size: 1.12rem;
      font-variant-numeric: tabular-nums;
    }

    body.pc-product-detail-route :where(.store-name, .price-store, .offer-store) {
      font-weight: 800 !important;
      color: var(--text-main) !important;
    }

    body.pc-product-detail-route :where(.updated-at, .price-updated, .freshness, .price-date) {
      color: var(--muted) !important;
      font-size: .82rem !important;
      line-height: 1.35;
    }

    body.pc-product-detail-route :where(.price-history, .history-chart, .price-history-card) {
      overflow: hidden;
    }

    body.pc-product-detail-route :where(button, .button, a.button) {
      min-height: 44px;
    }

    @media (max-width: 760px) {
      body.pc-product-detail-route :where(.product-detail, .product-page, .product-view, .product-details, .product-shell) {
        padding-inline: 16px !important;
      }

      body.pc-product-detail-route :where(.product-detail-grid, .product-layout, .product-main-grid, .product-hero-grid) {
        grid-template-columns: 1fr !important;
        gap: 18px !important;
      }

      body.pc-product-detail-route :where(.product-detail-card, .product-summary, .product-info-card, .price-comparison, .price-history-card, .store-price-card, .product-offer-card) {
        border-radius: 15px !important;
      }

      body.pc-product-detail-route :where(.price-row, .price-item, .store-price-row, .offer-row) {
        min-height: 58px;
        align-items: center;
      }

      body.pc-product-detail-route :where(.updated-at, .price-updated, .freshness, .price-date) {
        font-size: .875rem !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export function ProductDetailSafePolish() {
  const { pathname } = useLocation();

  useEffect(() => {
    installStyles();
    const active = pathname.startsWith("/produto/");
    document.body.classList.toggle("pc-product-detail-route", active);
    return () => document.body.classList.remove("pc-product-detail-route");
  }, [pathname]);

  return null;
}
