import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_ID = "pc-internal-dashboards-safe-polish";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    body.pc-internal-dashboard main,
    body.pc-internal-dashboard .admin-main,
    body.pc-internal-dashboard .merchant-main {
      max-width: 1440px;
      margin-inline: auto;
    }

    body.pc-internal-dashboard h1,
    body.pc-internal-dashboard h2,
    body.pc-internal-dashboard h3 {
      text-wrap: balance;
    }

    body.pc-internal-dashboard :where(.card, .panel, .metric-card, .stat-card, .admin-card, .merchant-card, .surface-card) {
      border-radius: 16px !important;
      border: 1px solid var(--border) !important;
      background: var(--surface) !important;
      box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
    }

    body.pc-internal-dashboard :where(.metric-card, .stat-card) strong,
    body.pc-internal-dashboard :where(.metric-value, .stat-value, .kpi-value) {
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }

    body.pc-internal-dashboard :where(table, .data-table, .admin-table, .merchant-table) {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    body.pc-internal-dashboard :where(th) {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--muted);
      background: var(--surface-2);
    }

    body.pc-internal-dashboard :where(th, td) {
      padding: 12px 14px !important;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }

    body.pc-internal-dashboard :where(tbody tr:hover) {
      background: color-mix(in srgb, var(--surface-2) 72%, transparent);
    }

    body.pc-internal-dashboard :where(input, select, textarea) {
      min-height: 44px;
      border-radius: 12px !important;
      border: 1px solid var(--border) !important;
      background: var(--surface) !important;
      color: var(--text-main) !important;
    }

    body.pc-internal-dashboard textarea { min-height: 110px; }

    body.pc-internal-dashboard :where(button, .button, a.button) {
      min-height: 44px;
      border-radius: 12px;
      font-weight: 750;
    }

    body.pc-internal-dashboard :where(.sidebar, .admin-sidebar, .merchant-sidebar, nav[aria-label*="admin" i], nav[aria-label*="loj" i]) a {
      min-height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    body.pc-internal-dashboard :where(.sidebar, .admin-sidebar, .merchant-sidebar) {
      border-color: var(--border) !important;
    }

    body.pc-internal-dashboard :where(.toolbar, .filters, .filter-bar, .admin-toolbar, .merchant-toolbar) {
      gap: 10px !important;
      align-items: center;
      flex-wrap: wrap;
    }

    body.pc-internal-dashboard :where(.badge, .status, .chip) {
      min-height: 28px;
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding-inline: 10px;
      font-weight: 700;
    }

    @media (max-width: 900px) {
      body.pc-internal-dashboard :where(.dashboard-grid, .metrics-grid, .stats-grid, .admin-grid, .merchant-grid) {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }

      body.pc-internal-dashboard :where(.table-wrap, .table-container, .admin-table-wrap, .merchant-table-wrap) {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
    }

    @media (max-width: 640px) {
      body.pc-internal-dashboard main,
      body.pc-internal-dashboard .admin-main,
      body.pc-internal-dashboard .merchant-main {
        padding-inline: 14px !important;
      }

      body.pc-internal-dashboard :where(.dashboard-grid, .metrics-grid, .stats-grid, .admin-grid, .merchant-grid) {
        grid-template-columns: 1fr !important;
      }

      body.pc-internal-dashboard :where(.toolbar, .filters, .filter-bar, .admin-toolbar, .merchant-toolbar) > * {
        width: 100%;
      }

      body.pc-internal-dashboard :where(input, select, textarea, button, .button) {
        font-size: 16px;
      }

      body.pc-internal-dashboard :where(th, td) {
        padding: 10px 12px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export function InternalDashboardsSafePolish() {
  const { pathname } = useLocation();

  useEffect(() => {
    installStyles();
    const active = pathname.startsWith("/painel-lojista") || pathname.startsWith("/admin");
    document.body.classList.toggle("pc-internal-dashboard", active);
    return () => document.body.classList.remove("pc-internal-dashboard");
  }, [pathname]);

  return null;
}
