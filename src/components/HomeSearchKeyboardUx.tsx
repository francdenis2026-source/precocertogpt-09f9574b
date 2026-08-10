import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const OVERLAY_ID = "pc-home-search-results-overlay";
const STYLE_ID = "pc-home-search-keyboard-ux";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${OVERLAY_ID} .search-result-item.pc-keyboard-active {
      background: #ecfdf5 !important;
      box-shadow: inset 3px 0 0 #22c55e !important;
      outline: none !important;
    }
    #${OVERLAY_ID} .search-result-item.pc-keyboard-active .search-result-item__name {
      color: #052e16 !important;
    }
    #${OVERLAY_ID} .search-result-item.pc-keyboard-active .search-result-item__price {
      color: #15803d !important;
    }
    #${OVERLAY_ID}.pc-search-persistent {
      display: block !important;
    }
  `;
  document.head.appendChild(style);
}

function getOverlay() {
  return document.getElementById(OVERLAY_ID) as HTMLElement | null;
}

function getInput() {
  return document.getElementById("hero-search") as HTMLInputElement | null;
}

function getItems(overlay: HTMLElement) {
  return Array.from(overlay.querySelectorAll<HTMLAnchorElement>(".search-result-item"));
}

export function HomeSearchKeyboardUx() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname !== "/") return;
    installStyles();

    let activeIndex = -1;
    let explicitCloseUntil = 0;
    let overlayObserver: MutationObserver | null = null;

    const clearActive = () => {
      const overlay = getOverlay();
      if (!overlay) return;
      getItems(overlay).forEach(item => {
        item.classList.remove("pc-keyboard-active");
        item.setAttribute("aria-selected", "false");
      });
      activeIndex = -1;
    };

    const setActive = (index: number) => {
      const overlay = getOverlay();
      if (!overlay) return;
      const items = getItems(overlay);
      if (!items.length) {
        activeIndex = -1;
        return;
      }

      const next = ((index % items.length) + items.length) % items.length;
      items.forEach((item, itemIndex) => {
        const selected = itemIndex === next;
        item.classList.toggle("pc-keyboard-active", selected);
        item.setAttribute("aria-selected", selected ? "true" : "false");
      });
      activeIndex = next;
      items[next].scrollIntoView({ block: "nearest", behavior: "smooth" });
    };

    const keepOpenWhenAppropriate = () => {
      const overlay = getOverlay();
      const input = getInput();
      if (!overlay || !input) return;
      if (Date.now() < explicitCloseUntil) return;
      if (!input.value.trim()) return;
      if (!overlay.querySelector(".search-result-item, .suggestions-empty")) return;
      overlay.classList.add("is-open", "pc-search-persistent");
    };

    const attachOverlayObserver = () => {
      const overlay = getOverlay();
      if (!overlay || overlayObserver) return;
      overlayObserver = new MutationObserver(() => {
        window.requestAnimationFrame(() => {
          keepOpenWhenAppropriate();
          if (activeIndex >= 0) setActive(activeIndex);
        });
      });
      overlayObserver.observe(overlay, {
        attributes: true,
        attributeFilter: ["class"],
        childList: true,
        subtree: true,
      });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const input = getInput();
      if (!input || event.target !== input) return;
      const overlay = getOverlay();
      if (!overlay) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        keepOpenWhenAppropriate();
        setActive(activeIndex + 1);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        keepOpenWhenAppropriate();
        const items = getItems(overlay);
        setActive(activeIndex < 0 ? items.length - 1 : activeIndex - 1);
        return;
      }

      if (event.key === "Enter" && activeIndex >= 0) {
        const item = getItems(overlay)[activeIndex];
        if (item) {
          event.preventDefault();
          explicitCloseUntil = Date.now() + 1200;
          overlay.classList.remove("pc-search-persistent");
          item.click();
        }
        return;
      }

      if (event.key === "Escape") {
        explicitCloseUntil = Date.now() + 1200;
        overlay.classList.remove("is-open", "pc-search-persistent");
        clearActive();
      }
    };

    const onInput = (event: Event) => {
      const input = getInput();
      if (!input || event.target !== input) return;
      clearActive();
      if (!input.value.trim()) {
        explicitCloseUntil = Date.now() + 600;
        getOverlay()?.classList.remove("is-open", "pc-search-persistent");
        return;
      }
      window.setTimeout(keepOpenWhenAppropriate, 50);
    };

    const onPointerDown = (event: PointerEvent) => {
      const overlay = getOverlay();
      const input = getInput();
      if (!overlay || !input || !overlay.classList.contains("is-open")) return;
      const target = event.target;
      if (!(target instanceof Node)) return;

      const combo = input.closest(".search-combo");
      if (overlay.contains(target)) {
        const result = target instanceof Element ? target.closest(".search-result-item, .suggestions-footer a") : null;
        if (result) {
          explicitCloseUntil = Date.now() + 1200;
          overlay.classList.remove("pc-search-persistent");
        }
        return;
      }

      if (combo?.contains(target)) return;

      // Clique acidental fora da busca não deve fechar os resultados.
      window.setTimeout(keepOpenWhenAppropriate, 270);
    };

    const bootstrapTimer = window.setInterval(() => {
      attachOverlayObserver();
      if (getOverlay()) window.clearInterval(bootstrapTimer);
    }, 50);

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("input", onInput, true);
    document.addEventListener("pointerdown", onPointerDown, true);

    return () => {
      window.clearInterval(bootstrapTimer);
      overlayObserver?.disconnect();
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
      getOverlay()?.classList.remove("pc-search-persistent");
    };
  }, [pathname]);

  return null;
}
