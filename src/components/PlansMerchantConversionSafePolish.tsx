import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_ID = "pc-plans-merchant-conversion-safe-polish";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    body.pc-plans-merchant-safe :where(.plans-grid,.pricing-grid,.merchant-plans,.plan-grid) {
      gap: 18px !important;
    }
    body.pc-plans-merchant-safe :where(.plan-card,.pricing-card,.merchant-plan-card,.subscription-card) {
      border-radius: 18px !important;
      border: 1px solid var(--border) !important;
      box-shadow: 0 10px 30px rgba(15,23,42,.06) !important;
      overflow: hidden;
    }
    body.pc-plans-merchant-safe :where(.plan-card,.pricing-card,.merchant-plan-card,.subscription-card):hover {
      transform: translateY(-3px);
      box-shadow: 0 16px 38px rgba(15,23,42,.09) !important;
    }
    body.pc-plans-merchant-safe :where(.plan-card h3,.pricing-card h3,.merchant-plan-card h3) {
      font-size: clamp(1.2rem,2vw,1.5rem) !important;
      line-height: 1.2 !important;
      text-wrap: balance;
    }
    body.pc-plans-merchant-safe :where(.plan-price,.pricing-price,.price-amount,.merchant-price) {
      font-variant-numeric: tabular-nums;
      font-size: clamp(1.8rem,4vw,2.5rem) !important;
      font-weight: 900 !important;
      letter-spacing: -.03em;
    }
    body.pc-plans-merchant-safe :where(.plan-features,.pricing-features,.merchant-features) li {
      line-height: 1.5 !important;
      margin-block: 8px !important;
    }
    body.pc-plans-merchant-safe :where(.plan-card button,.plan-card a,.pricing-card button,.pricing-card a,.merchant-plan-card button,.merchant-plan-card a,.merchant-cta a,.merchant-cta button) {
      min-height: 46px;
      font-weight: 800 !important;
      border-radius: 12px !important;
    }
    body.pc-plans-merchant-safe :where(.recommended,.featured-plan,[data-featured="true"]) {
      box-shadow: 0 18px 46px rgba(16,185,129,.16) !important;
    }
    body.pc-plans-merchant-safe :where(.merchant-hero,.pricing-hero,.plans-hero) h1 {
      font-size: clamp(2rem,5vw,3.6rem) !important;
      line-height: 1.02 !important;
      letter-spacing: -.04em !important;
      text-wrap: balance;
    }
    body.pc-plans-merchant-safe :where(.merchant-hero,.pricing-hero,.plans-hero) p {
      max-width: 720px;
      font-size: clamp(1rem,1.5vw,1.15rem) !important;
      line-height: 1.6 !important;
      text-wrap: pretty;
    }
    body.pc-plans-merchant-safe :where(.merchant-benefits,.merchant-feature-grid,.pricing-benefits) {
      gap: 16px !important;
    }
    body.pc-plans-merchant-safe :where(.merchant-benefit,.merchant-feature,.pricing-benefit) {
      border-radius: 16px !important;
      border: 1px solid var(--border) !important;
    }
    @media (max-width: 760px) {
      body.pc-plans-merchant-safe :where(.plans-grid,.pricing-grid,.merchant-plans,.plan-grid,.merchant-benefits,.merchant-feature-grid,.pricing-benefits) {
        grid-template-columns: 1fr !important;
      }
      body.pc-plans-merchant-safe :where(.plan-card,.pricing-card,.merchant-plan-card,.subscription-card) {
        padding: 20px !important;
      }
      body.pc-plans-merchant-safe :where(.plan-card button,.plan-card a,.pricing-card button,.pricing-card a,.merchant-plan-card button,.merchant-plan-card a,.merchant-cta a,.merchant-cta button) {
        width: 100% !important;
        justify-content: center !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export function PlansMerchantConversionSafePolish() {
  const { pathname } = useLocation();

  useEffect(() => {
    installStyles();
    const relevant = pathname === "/lojista" || pathname.includes("plano") || pathname.includes("assinatura");
    document.body.classList.toggle("pc-plans-merchant-safe", relevant);
    return () => document.body.classList.remove("pc-plans-merchant-safe");
  }, [pathname]);

  return null;
}
