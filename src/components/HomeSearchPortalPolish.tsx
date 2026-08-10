import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_ID = "pc-home-search-portal-polish";
const OVERLAY_ID = "pc-home-search-results-overlay";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    body.pc-home-search-portal .hero-actions,
    body.pc-home-search-portal .search-combo,
    body.pc-home-search-portal .search-combo--hero {
      overflow: visible !important;
    }

    body.pc-home-search-portal .hero-actions .search-combo__form {
      display: grid !important;
      grid-template-columns: minmax(0,1fr) auto !important;
      align-items: center !important;
      gap: 6px !important;
      width: 100% !important;
      min-height: 62px !important;
      padding: 6px !important;
      background: #ffffff !important;
      border: 1px solid rgba(203,213,225,.82) !important;
      border-radius: 17px !important;
      box-shadow: 0 18px 48px rgba(2,6,23,.20), 0 2px 8px rgba(2,6,23,.08) !important;
      transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease !important;
      overflow: hidden !important;
    }

    body.pc-home-search-portal .hero-actions .search-combo__form:focus-within {
      border-color: rgba(34,197,94,.72) !important;
      box-shadow: 0 0 0 4px rgba(34,197,94,.12), 0 22px 54px rgba(2,6,23,.24) !important;
      transform: translateY(-1px);
    }

    body.pc-home-search-portal .hero-actions .search-combo__input-wrapper {
      position: relative !important;
      display: flex !important;
      align-items: center !important;
      min-width: 0 !important;
      min-height: 48px !important;
      background: transparent !important;
      border: 0 !important;
    }

    body.pc-home-search-portal .hero-actions .search-combo__icon {
      position: absolute !important;
      left: 14px !important;
      width: 20px !important;
      height: 20px !important;
      color: #64748b !important;
      pointer-events: none !important;
    }

    body.pc-home-search-portal .hero-actions .search-combo__input {
      width: 100% !important;
      min-width: 0 !important;
      min-height: 48px !important;
      padding: 0 42px 0 46px !important;
      border: 0 !important;
      outline: 0 !important;
      background: transparent !important;
      color: #0f172a !important;
      font-size: 1rem !important;
      font-weight: 540 !important;
      line-height: 1 !important;
      box-shadow: none !important;
    }

    body.pc-home-search-portal .hero-actions .search-combo__input::placeholder {
      color: #7b8a9a !important;
      opacity: 1 !important;
    }

    body.pc-home-search-portal .hero-actions .search-combo__clear {
      position: absolute !important;
      right: 4px !important;
      width: 36px !important;
      height: 36px !important;
      display: inline-grid !important;
      place-items: center !important;
      border: 0 !important;
      border-radius: 10px !important;
      background: transparent !important;
      color: #64748b !important;
    }
    body.pc-home-search-portal .hero-actions .search-combo__clear:hover { background: #f1f5f9 !important; color: #0f172a !important; }

    body.pc-home-search-portal .hero-actions .search-combo__button {
      min-height: 48px !important;
      height: 48px !important;
      min-width: 122px !important;
      padding: 0 18px !important;
      border: 0 !important;
      border-radius: 12px !important;
      background: #22c55e !important;
      color: #052e16 !important;
      font-size: .9rem !important;
      font-weight: 800 !important;
      letter-spacing: -.01em !important;
      box-shadow: none !important;
      transition: background .17s ease, transform .17s ease !important;
    }
    body.pc-home-search-portal .hero-actions .search-combo__button:hover { background: #4ade80 !important; }
    body.pc-home-search-portal .hero-actions .search-combo__button:active { transform: scale(.985) !important; }

    body.pc-home-search-portal .hero-actions .search-results-dynamic.pc-search-source-hidden {
      position: absolute !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

    #${OVERLAY_ID} {
      position: fixed;
      z-index: 2147483000;
      display: none;
      overflow: hidden;
      background: #ffffff;
      color: #0f172a;
      border: 1px solid #dce4ec;
      border-radius: 16px;
      box-shadow: 0 32px 90px rgba(2,6,23,.34), 0 8px 28px rgba(2,6,23,.16);
      isolation: isolate;
      transform: translateZ(0);
      contain: layout paint;
    }

    #${OVERLAY_ID}.is-open { display: block; animation: pcSearchPanelIn .14s ease-out; }
    @keyframes pcSearchPanelIn {
      from { opacity: 0; transform: translateY(-5px) translateZ(0); }
      to { opacity: 1; transform: translateY(0) translateZ(0); }
    }

    #${OVERLAY_ID} .search-results-dynamic,
    #${OVERLAY_ID}.search-results-dynamic {
      position: static !important;
      display: block !important;
      width: 100% !important;
      max-width: none !important;
      max-height: min(520px, calc(100vh - 160px)) !important;
      margin: 0 !important;
      padding: 7px !important;
      overflow-y: auto !important;
      overscroll-behavior: contain !important;
      background: #ffffff !important;
      color: #0f172a !important;
      border: 0 !important;
      border-radius: 16px !important;
      box-shadow: none !important;
      scrollbar-gutter: stable;
    }

    #${OVERLAY_ID} .suggestions-header {
      position: sticky !important;
      top: 0 !important;
      z-index: 4 !important;
      display: flex !important;
      align-items: center !important;
      gap: 7px !important;
      min-height: 42px !important;
      padding: 10px 12px !important;
      margin-bottom: 3px !important;
      background: rgba(255,255,255,.98) !important;
      color: #64748b !important;
      border-bottom: 1px solid #eef2f6 !important;
      font-size: .74rem !important;
      font-weight: 750 !important;
      letter-spacing: .02em !important;
    }

    #${OVERLAY_ID} .suggestions-list { display: grid !important; gap: 2px !important; }
    #${OVERLAY_ID} .search-result-item {
      display: grid !important;
      grid-template-columns: 56px minmax(0,1fr) auto !important;
      align-items: center !important;
      gap: 13px !important;
      min-height: 74px !important;
      padding: 10px 12px !important;
      border: 0 !important;
      border-radius: 11px !important;
      background: transparent !important;
      color: #0f172a !important;
      text-decoration: none !important;
      transition: background .15s ease !important;
    }
    #${OVERLAY_ID} .search-result-item:hover,
    #${OVERLAY_ID} .search-result-item:focus-visible { background: #f3f7fa !important; outline: none !important; }

    #${OVERLAY_ID} .search-result-item__image {
      width: 54px !important;
      height: 54px !important;
      display: grid !important;
      place-items: center !important;
      overflow: hidden !important;
      border-radius: 9px !important;
      background: #f8fafc !important;
    }
    #${OVERLAY_ID} .search-result-item__image img,
    #${OVERLAY_ID} .search-result-item__image canvas {
      max-width: 48px !important;
      max-height: 48px !important;
      object-fit: contain !important;
    }

    #${OVERLAY_ID} .search-result-item__info { min-width: 0 !important; }
    #${OVERLAY_ID} .search-result-item__name {
      display: block !important;
      margin: 0 0 4px !important;
      overflow: hidden !important;
      color: #0f172a !important;
      font-size: .94rem !important;
      font-weight: 760 !important;
      line-height: 1.25 !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }
    #${OVERLAY_ID} .search-result-item__meta,
    #${OVERLAY_ID} .search-result-item__store {
      color: #718096 !important;
      font-size: .76rem !important;
      line-height: 1.25 !important;
    }
    #${OVERLAY_ID} .search-result-item__pricing {
      min-width: 94px !important;
      text-align: right !important;
    }
    #${OVERLAY_ID} .search-result-item__price {
      display: block !important;
      color: #15803d !important;
      font-size: 1rem !important;
      font-weight: 850 !important;
      line-height: 1.15 !important;
      white-space: nowrap !important;
    }
    #${OVERLAY_ID} .search-result-item__store {
      display: block !important;
      max-width: 130px !important;
      margin-top: 4px !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }

    #${OVERLAY_ID} .suggestions-footer {
      position: sticky !important;
      bottom: 0 !important;
      padding: 6px !important;
      background: #ffffff !important;
      border-top: 1px solid #eef2f6 !important;
    }
    #${OVERLAY_ID} .suggestions-footer a {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;
      min-height: 44px !important;
      border-radius: 10px !important;
      background: #f1f5f9 !important;
      color: #0f172a !important;
      font-size: .82rem !important;
      font-weight: 750 !important;
      text-decoration: none !important;
    }

    #${OVERLAY_ID} .suggestions-empty {
      padding: 28px 18px !important;
      text-align: center !important;
      color: #64748b !important;
    }

    @media (max-width: 560px) {
      body.pc-home-search-portal .hero-actions .search-combo__form {
        min-height: 58px !important;
        padding: 5px !important;
        border-radius: 15px !important;
        gap: 4px !important;
      }
      body.pc-home-search-portal .hero-actions .search-combo__input-wrapper,
      body.pc-home-search-portal .hero-actions .search-combo__input {
        min-height: 46px !important;
      }
      body.pc-home-search-portal .hero-actions .search-combo__input {
        padding-left: 42px !important;
        padding-right: 34px !important;
        font-size: 16px !important;
      }
      body.pc-home-search-portal .hero-actions .search-combo__icon { left: 13px !important; width: 19px !important; }
      body.pc-home-search-portal .hero-actions .search-combo__button {
        min-width: 54px !important;
        width: 54px !important;
        min-height: 46px !important;
        height: 46px !important;
        padding: 0 !important;
        border-radius: 11px !important;
      }
      body.pc-home-search-portal .hero-actions .search-combo__button-text { display: none !important; }
      body.pc-home-search-portal .hero-actions .search-combo__button svg { width: 18px !important; height: 18px !important; }

      #${OVERLAY_ID} {
        border-radius: 14px !important;
        box-shadow: 0 26px 70px rgba(2,6,23,.42), 0 8px 22px rgba(2,6,23,.20) !important;
      }
      #${OVERLAY_ID} .search-results-dynamic,
      #${OVERLAY_ID}.search-results-dynamic {
        max-height: min(58vh, 440px) !important;
        padding: 5px !important;
        border-radius: 14px !important;
      }
      #${OVERLAY_ID} .search-result-item {
        grid-template-columns: 48px minmax(0,1fr) auto !important;
        min-height: 66px !important;
        gap: 9px !important;
        padding: 8px 9px !important;
        border-radius: 9px !important;
      }
      #${OVERLAY_ID} .search-result-item__image { width: 46px !important; height: 46px !important; }
      #${OVERLAY_ID} .search-result-item__image img,
      #${OVERLAY_ID} .search-result-item__image canvas { max-width: 42px !important; max-height: 42px !important; }
      #${OVERLAY_ID} .search-result-item__name { font-size: .86rem !important; }
      #${OVERLAY_ID} .search-result-item__meta,
      #${OVERLAY_ID} .search-result-item__store { font-size: .68rem !important; }
      #${OVERLAY_ID} .search-result-item__pricing { min-width: 76px !important; }
      #${OVERLAY_ID} .search-result-item__price { font-size: .9rem !important; }
      #${OVERLAY_ID} .search-result-item__store { max-width: 82px !important; }
    }

    @media (prefers-reduced-motion: reduce) {
      #${OVERLAY_ID}.is-open { animation: none !important; }
      body.pc-home-search-portal .hero-actions .search-combo__form { transition: none !important; }
    }
  `;
  document.head.appendChild(style);
}

function getHeroInput() {
  return document.getElementById("hero-search") as HTMLInputElement | null;
}

function getSource(input: HTMLInputElement | null) {
  return input?.closest(".search-combo")?.querySelector<HTMLElement>(".search-results-dynamic") ?? null;
}

function createOverlay() {
  let overlay = document.getElementById(OVERLAY_ID) as HTMLDivElement | null;
  if (overlay) return overlay;
  overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.setAttribute("role", "presentation");
  document.body.appendChild(overlay);
  return overlay;
}

function positionOverlay(overlay: HTMLElement, input: HTMLInputElement) {
  const form = input.closest<HTMLElement>(".search-combo__form") ?? input.closest<HTMLElement>(".search-combo");
  if (!form) return;
  const rect = form.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const mobile = viewportWidth <= 560;
  const side = mobile ? 12 : 16;
  const preferredWidth = mobile ? viewportWidth - side * 2 : Math.min(Math.max(rect.width, 640), 760);
  const width = Math.min(preferredWidth, viewportWidth - side * 2);
  let left = mobile ? side : rect.left;
  if (left + width > viewportWidth - side) left = viewportWidth - side - width;
  left = Math.max(side, left);

  overlay.style.left = `${Math.round(left)}px`;
  overlay.style.top = `${Math.round(rect.bottom + (mobile ? 8 : 10))}px`;
  overlay.style.width = `${Math.round(width)}px`;
}

function syncOverlay(overlay: HTMLElement, input: HTMLInputElement) {
  const source = getSource(input);
  if (!source) {
    overlay.classList.remove("is-open");
    return;
  }

  source.classList.add("pc-search-source-hidden");
  overlay.innerHTML = `<div class="search-results-dynamic">${source.innerHTML}</div>`;
  positionOverlay(overlay, input);
  overlay.classList.add("is-open");
}

export function HomeSearchPortalPolish() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname !== "/") return;
    installStyles();
    document.body.classList.add("pc-home-search-portal");

    const overlay = createOverlay();
    let comboObserver: MutationObserver | null = null;
    let currentInput: HTMLInputElement | null = null;
    let blurTimer: number | undefined;

    const observeCombo = (input: HTMLInputElement) => {
      comboObserver?.disconnect();
      const combo = input.closest<HTMLElement>(".search-combo");
      if (!combo) return;
      comboObserver = new MutationObserver(() => {
        window.requestAnimationFrame(() => syncOverlay(overlay, input));
      });
      comboObserver.observe(combo, { childList: true, subtree: true, characterData: true });
    };

    const activate = (input: HTMLInputElement) => {
      currentInput = input;
      if (blurTimer) window.clearTimeout(blurTimer);
      observeCombo(input);
      window.requestAnimationFrame(() => syncOverlay(overlay, input));
      window.setTimeout(() => syncOverlay(overlay, input), 30);
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.id === "hero-search") activate(target);
    };

    const onInput = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.id === "hero-search") activate(target);
    };

    const onFocusOut = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.id !== "hero-search") return;
      blurTimer = window.setTimeout(() => {
        if (!overlay.matches(":hover")) overlay.classList.remove("is-open");
      }, 240);
    };

    const reposition = () => {
      if (currentInput && overlay.classList.contains("is-open")) positionOverlay(overlay, currentInput);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!overlay.classList.contains("is-open")) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      const input = getHeroInput();
      const combo = input?.closest(".search-combo");
      if (!overlay.contains(target) && !combo?.contains(target)) overlay.classList.remove("is-open");
    };

    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("input", onInput, true);
    document.addEventListener("focusout", onFocusOut, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("resize", reposition, { passive: true });
    window.addEventListener("scroll", reposition, { passive: true });

    return () => {
      if (blurTimer) window.clearTimeout(blurTimer);
      comboObserver?.disconnect();
      getSource(currentInput)?.classList.remove("pc-search-source-hidden");
      overlay.remove();
      document.body.classList.remove("pc-home-search-portal");
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("focusout", onFocusOut, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition);
    };
  }, [pathname]);

  return null;
}
