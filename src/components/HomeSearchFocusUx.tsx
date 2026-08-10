import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function injectStyles() {
  if (document.getElementById("pc-home-search-focus-ux")) return;
  const style = document.createElement("style");
  style.id = "pc-home-search-focus-ux";
  style.textContent = `
    body.pc-home-search-focus .hero,
    body.pc-home-search-focus .hero-content,
    body.pc-home-search-focus .hero-copy,
    body.pc-home-search-focus .hero-actions,
    body.pc-home-search-focus .hero-actions .search-combo {
      overflow: visible !important;
    }

    body.pc-home-search-focus .hero-actions {
      position: relative !important;
      z-index: 9000 !important;
    }

    body.pc-home-search-focus .hero-actions .search-combo {
      position: relative !important;
      z-index: 9100 !important;
    }

    body.pc-home-search-focus .hero-actions .search-results-dynamic {
      position: absolute !important;
      top: calc(100% + 12px) !important;
      left: 0 !important;
      right: auto !important;
      width: min(780px, calc(100vw - 32px)) !important;
      max-height: min(520px, calc(100vh - 170px)) !important;
      overflow-y: auto !important;
      overscroll-behavior: contain !important;
      z-index: 99999 !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #0f172a !important;
      border: 1px solid #dbe3ee !important;
      border-radius: 18px !important;
      box-shadow: 0 26px 70px rgba(15, 23, 42, .28), 0 8px 22px rgba(15, 23, 42, .12) !important;
      backdrop-filter: none !important;
      isolation: isolate !important;
    }

    body.pc-home-search-focus[data-theme='dark'] .hero-actions .search-results-dynamic,
    [data-theme='dark'] body.pc-home-search-focus .hero-actions .search-results-dynamic {
      background: #111827 !important;
      color: #f8fafc !important;
      border-color: #334155 !important;
    }

    body.pc-home-search-focus .hero-actions .search-results-dynamic .suggestions-label {
      position: sticky !important;
      top: 0 !important;
      z-index: 3 !important;
      padding: 13px 16px !important;
      background: inherit !important;
      border-bottom: 1px solid rgba(148,163,184,.22) !important;
      font-size: .72rem !important;
      font-weight: 800 !important;
      letter-spacing: .07em !important;
      text-transform: uppercase !important;
    }

    body.pc-home-search-focus .hero-actions .search-result-item {
      min-height: 76px !important;
      padding: 11px 15px !important;
      display: grid !important;
      grid-template-columns: 56px minmax(0,1fr) auto !important;
      gap: 13px !important;
      align-items: center !important;
      background: transparent !important;
      border-bottom: 1px solid rgba(148,163,184,.16) !important;
      text-decoration: none !important;
      color: inherit !important;
      transition: background-color .16s ease !important;
    }

    body.pc-home-search-focus .hero-actions .search-result-item:last-child {
      border-bottom: 0 !important;
    }

    body.pc-home-search-focus .hero-actions .search-result-item:hover,
    body.pc-home-search-focus .hero-actions .search-result-item:focus-visible {
      background: #f3f7ff !important;
      transform: none !important;
    }

    [data-theme='dark'] body.pc-home-search-focus .hero-actions .search-result-item:hover,
    [data-theme='dark'] body.pc-home-search-focus .hero-actions .search-result-item:focus-visible {
      background: #1e293b !important;
    }

    body.pc-home-search-focus .hero-actions .search-result-item .product-photo,
    body.pc-home-search-focus .hero-actions .search-result-item img {
      width: 52px !important;
      height: 52px !important;
      max-width: 52px !important;
      max-height: 52px !important;
      object-fit: contain !important;
    }

    body.pc-home-search-focus .hero-actions .search-result-item strong {
      display: block !important;
      font-size: .95rem !important;
      line-height: 1.28 !important;
      color: #0f172a !important;
      margin-bottom: 3px !important;
    }

    [data-theme='dark'] body.pc-home-search-focus .hero-actions .search-result-item strong {
      color: #f8fafc !important;
    }

    body.pc-home-search-focus .hero-actions .search-result-item small {
      color: #64748b !important;
      line-height: 1.25 !important;
    }

    body.pc-home-search-focus .hero-actions .search-result-item b {
      font-size: .98rem !important;
      white-space: nowrap !important;
    }

    @media (max-width: 820px) {
      body.pc-home-search-focus .hero-actions .search-results-dynamic {
        width: calc(100vw - 24px) !important;
        left: 50% !important;
        right: auto !important;
        transform: translateX(-50%) !important;
        max-height: min(60vh, 500px) !important;
        border-radius: 16px !important;
      }
      body.pc-home-search-focus .hero-actions .search-result-item {
        grid-template-columns: 48px minmax(0,1fr) auto !important;
        min-height: 68px !important;
        gap: 9px !important;
        padding: 9px 11px !important;
      }
      body.pc-home-search-focus .hero-actions .search-result-item .product-photo,
      body.pc-home-search-focus .hero-actions .search-result-item img {
        width: 46px !important;
        height: 46px !important;
        max-width: 46px !important;
        max-height: 46px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function focusSearch(input: HTMLInputElement) {
  const header = document.querySelector<HTMLElement>(".site-header");
  const headerHeight = header?.getBoundingClientRect().height ?? 72;
  const combo = input.closest<HTMLElement>(".search-combo");
  if (!combo) return;

  const rect = combo.getBoundingClientRect();
  const desiredTop = headerHeight + 16;
  const delta = rect.top - desiredTop;

  if (Math.abs(delta) > 8) {
    window.scrollTo({ top: Math.max(0, window.scrollY + delta), behavior: "smooth" });
  }
}

export function HomeSearchFocusUx() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname !== "/") return;
    injectStyles();
    document.body.classList.add("pc-home-search-focus");

    let focusTimer: number | undefined;

    const onInput = (event: Event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.id !== "hero-search") return;
      if (!input.value.trim()) return;

      if (focusTimer) window.clearTimeout(focusTimer);
      focusTimer = window.setTimeout(() => focusSearch(input), 70);
    };

    document.addEventListener("input", onInput, true);

    return () => {
      if (focusTimer) window.clearTimeout(focusTimer);
      document.body.classList.remove("pc-home-search-focus", "pc-search-active");
      document.removeEventListener("input", onInput, true);
    };
  }, [pathname]);

  return null;
}
