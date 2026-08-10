import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function injectStyles() {
  if (document.getElementById("pc-home-search-focus-ux")) return;
  const style = document.createElement("style");
  style.id = "pc-home-search-focus-ux";
  style.textContent = `
    body.pc-home-search-focus .hero-actions {
      position: relative !important;
      z-index: 120 !important;
    }

    body.pc-home-search-focus .hero-actions .search-combo {
      position: relative !important;
      z-index: 130 !important;
    }

    body.pc-home-search-focus .hero-actions .search-results-dynamic {
      position: absolute !important;
      top: calc(100% + 14px) !important;
      left: 0 !important;
      right: auto !important;
      width: min(760px, calc(100vw - 32px)) !important;
      max-height: min(520px, calc(100vh - 180px)) !important;
      overflow-y: auto !important;
      overscroll-behavior: contain !important;
      z-index: 5000 !important;
      margin: 0 !important;
      padding: 0 !important;
      background: rgba(255,255,255,.985) !important;
      color: #0f172a !important;
      border: 1px solid rgba(148,163,184,.28) !important;
      border-radius: 20px !important;
      box-shadow: 0 28px 80px rgba(2,6,23,.30), 0 6px 24px rgba(2,6,23,.14) !important;
      backdrop-filter: blur(18px) saturate(135%);
      isolation: isolate;
    }

    [data-theme='dark'] body.pc-home-search-focus .hero-actions .search-results-dynamic,
    body.pc-home-search-focus[data-theme='dark'] .hero-actions .search-results-dynamic {
      background: rgba(15,23,42,.985) !important;
      color: #f8fafc !important;
      border-color: rgba(148,163,184,.22) !important;
    }

    body.pc-home-search-focus .hero-actions .search-results-dynamic .suggestions-label {
      position: sticky !important;
      top: 0 !important;
      z-index: 2 !important;
      padding: 14px 18px !important;
      background: inherit !important;
      border-bottom: 1px solid rgba(148,163,184,.18) !important;
      font-size: .72rem !important;
      font-weight: 800 !important;
      letter-spacing: .08em !important;
    }

    body.pc-home-search-focus .hero-actions .search-result-item {
      min-height: 78px !important;
      padding: 12px 16px !important;
      display: grid !important;
      grid-template-columns: 58px minmax(0,1fr) auto !important;
      gap: 14px !important;
      align-items: center !important;
      background: transparent !important;
      border-bottom: 1px solid rgba(148,163,184,.14) !important;
      text-decoration: none !important;
      transition: background .18s ease, transform .18s ease !important;
    }

    body.pc-home-search-focus .hero-actions .search-result-item:last-child {
      border-bottom: 0 !important;
    }

    body.pc-home-search-focus .hero-actions .search-result-item:hover,
    body.pc-home-search-focus .hero-actions .search-result-item:focus-visible {
      background: rgba(37,99,235,.075) !important;
      transform: none !important;
    }

    body.pc-home-search-focus .hero-actions .search-result-item .product-photo,
    body.pc-home-search-focus .hero-actions .search-result-item img {
      max-width: 54px !important;
      max-height: 54px !important;
      object-fit: contain !important;
    }

    body.pc-home-search-focus .hero-actions .search-result-item strong {
      display: block !important;
      font-size: .94rem !important;
      line-height: 1.25 !important;
      color: var(--text-main) !important;
      margin-bottom: 4px !important;
    }

    body.pc-home-search-focus .hero-actions .search-result-item small {
      color: var(--muted) !important;
      line-height: 1.25 !important;
    }

    body.pc-home-search-focus .hero-actions .search-result-item b {
      font-size: 1rem !important;
    }

    body.pc-home-search-focus::before {
      content: '';
      position: fixed;
      inset: 0;
      z-index: 95;
      background: rgba(2,6,23,.26);
      backdrop-filter: blur(2px);
      opacity: 0;
      pointer-events: none;
      transition: opacity .18s ease;
    }

    body.pc-home-search-focus.pc-search-active::before {
      opacity: 1;
    }

    body.pc-home-search-focus.pc-search-active .hero-actions {
      z-index: 5200 !important;
    }

    @media (max-width: 820px) {
      body.pc-home-search-focus .hero-actions .search-results-dynamic {
        width: calc(100vw - 24px) !important;
        left: 50% !important;
        right: auto !important;
        transform: translateX(-50%) !important;
        max-height: min(62vh, 520px) !important;
        border-radius: 18px !important;
      }
      body.pc-home-search-focus .hero-actions .search-result-item {
        grid-template-columns: 52px minmax(0,1fr) auto !important;
        min-height: 72px !important;
        gap: 10px !important;
        padding: 10px 12px !important;
      }
      body.pc-home-search-focus .hero-actions .search-result-item > div:last-child {
        max-width: 98px;
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
  const desiredTop = headerHeight + 18;
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

      const hasText = input.value.trim().length > 0;
      document.body.classList.toggle("pc-search-active", hasText);
      if (!hasText) return;

      if (focusTimer) window.clearTimeout(focusTimer);
      focusTimer = window.setTimeout(() => focusSearch(input), 80);
    };

    const onFocus = (event: FocusEvent) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.id !== "hero-search") return;
      if (input.value.trim()) document.body.classList.add("pc-search-active");
    };

    const onBlur = (event: FocusEvent) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.id !== "hero-search") return;
      window.setTimeout(() => {
        const active = document.activeElement;
        const combo = input.closest(".search-combo");
        if (!combo?.contains(active)) document.body.classList.remove("pc-search-active");
      }, 220);
    };

    document.addEventListener("input", onInput, true);
    document.addEventListener("focusin", onFocus, true);
    document.addEventListener("focusout", onBlur, true);

    return () => {
      if (focusTimer) window.clearTimeout(focusTimer);
      document.body.classList.remove("pc-home-search-focus", "pc-search-active");
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("focusin", onFocus, true);
      document.removeEventListener("focusout", onBlur, true);
    };
  }, [pathname]);

  return null;
}
