import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_ID = "pc-visual-regression-guard";

function installGuardStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    html[data-pc-route-scope="home"] body { overflow-x: hidden; }
    html[data-pc-route-scope="search"] .hero,
    html[data-pc-route-scope="product"] .hero,
    html[data-pc-route-scope="establishments"] .hero,
    html[data-pc-route-scope="internal"] .hero { min-height: auto; }

    html[data-pc-route-scope="internal"] .site-header,
    html[data-pc-route-scope="internal"] .hero-header-safe-polish { position: relative; }

    html[data-pc-route-scope="search"] :is(.visual-product-card,.store-card),
    html[data-pc-route-scope="product"] :is(.search-result-item,.search-command),
    html[data-pc-route-scope="establishments"] :is(.search-command,.price-table-card) {
      transform: none;
    }

    html[data-pc-route-scope="internal"] :is(.visual-product-card,.store-card,.hero-panel,.hero-art),
    html[data-pc-route-scope="plans"] :is(.admin-card,.merchant-card,.dashboard-card) {
      box-shadow: none;
    }

    html[data-pc-route-scope="internal"] :is(input,select,textarea,button),
    html[data-pc-route-scope="plans"] :is(input,select,textarea,button) {
      max-width: 100%;
    }

    @media (max-width: 760px) {
      html[data-pc-route-scope] body { overflow-x: hidden; }
      html[data-pc-route-scope] main { min-width: 0; }
      html[data-pc-route-scope] :is(table,.table-wrap,.data-table,.price-table-card) { max-width: 100%; }
      html[data-pc-route-scope] :is(.grid,.cards-grid,.visual-product-grid,.store-grid) { min-width: 0; }
    }
  `;
  document.head.appendChild(style);
}

function routeScope(pathname: string) {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/buscar") || pathname.startsWith("/melhores-precos")) return "search";
  if (pathname.startsWith("/produto/")) return "product";
  if (pathname.startsWith("/estabelecimentos") || pathname.startsWith("/estabelecimento/")) return "establishments";
  if (pathname.startsWith("/planos") || pathname.startsWith("/lojista")) return "plans";
  if (pathname.startsWith("/painel-lojista") || pathname.startsWith("/admin")) return "internal";
  return "public";
}

export function VisualRegressionGuard() {
  const { pathname } = useLocation();

  useEffect(() => {
    installGuardStyles();
    document.documentElement.dataset.pcRouteScope = routeScope(pathname);
    return () => {
      delete document.documentElement.dataset.pcRouteScope;
    };
  }, [pathname]);

  return null;
}
