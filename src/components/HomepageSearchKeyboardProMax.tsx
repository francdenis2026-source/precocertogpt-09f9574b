import { useEffect } from "react";
import { X } from "lucide-react";
import { createRoot, Root } from "react-dom/client";
import "./HomepageSearchKeyboardProMax.css";

const nativeValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;

type ClearMount = { root: Root; node: HTMLSpanElement };

export function HomepageSearchKeyboardProMax() {
  useEffect(() => {
    let activeIndex = -1;
    let clearMount: ClearMount | null = null;

    const getWrap = () => document.querySelector<HTMLElement>(".true-home .th-search-wrap");
    const getInput = () => document.querySelector<HTMLInputElement>(".true-home .th-search input");
    const getResults = () => document.querySelector<HTMLElement>(".true-home .th-search-results");
    const getOptions = () => Array.from(document.querySelectorAll<HTMLAnchorElement>(".true-home .th-search-result"));

    const resetActive = () => {
      activeIndex = -1;
      getOptions().forEach((option) => option.classList.remove("is-keyboard-active"));
      getInput()?.removeAttribute("aria-activedescendant");
    };

    const syncA11y = () => {
      const wrap = getWrap();
      const input = getInput();
      const results = getResults();
      if (!wrap || !input) return;
      const hasValue = input.value.trim().length > 0;
      const expanded = Boolean(results) && wrap.dataset.searchClosed !== "true";
      wrap.dataset.hasValue = hasValue ? "true" : "false";
      input.setAttribute("role", "combobox");
      input.setAttribute("aria-autocomplete", "list");
      input.setAttribute("aria-expanded", expanded ? "true" : "false");
      input.setAttribute("aria-controls", "th-home-search-results");
      if (results) results.id = "th-home-search-results";
      getOptions().forEach((option, index) => {
        option.id = `th-home-search-option-${index}`;
        option.setAttribute("aria-selected", index === activeIndex ? "true" : "false");
      });
    };

    const setActive = (nextIndex: number) => {
      const options = getOptions();
      if (!options.length) return;
      activeIndex = (nextIndex + options.length) % options.length;
      options.forEach((option, index) => {
        const active = index === activeIndex;
        option.classList.toggle("is-keyboard-active", active);
        option.setAttribute("aria-selected", active ? "true" : "false");
      });
      const active = options[activeIndex];
      getInput()?.setAttribute("aria-activedescendant", active.id);
      active.scrollIntoView({ block: "nearest" });
    };

    const clearSearch = () => {
      const input = getInput();
      const wrap = getWrap();
      if (!input) return;
      nativeValueSetter?.call(input, "");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      wrap?.removeAttribute("data-search-closed");
      resetActive();
      input.focus();
      syncA11y();
    };

    const ensureClearButton = () => {
      const form = document.querySelector<HTMLElement>(".true-home .th-search");
      const input = getInput();
      if (!form || !input) return;
      if (!clearMount || !document.contains(clearMount.node)) {
        const mount = document.createElement("span");
        mount.className = "th-search-clear-mount";
        input.insertAdjacentElement("afterend", mount);
        const root = createRoot(mount);
        root.render(<button type="button" className="th-search-clear" aria-label="Limpar pesquisa" title="Limpar pesquisa" onClick={clearSearch}><X aria-hidden="true" /></button>);
        clearMount = { root, node: mount };
      }
      syncA11y();
    };

    const onInput = (event: Event) => {
      const input = event.target as HTMLElement;
      if (!input.matches?.(".true-home .th-search input")) return;
      getWrap()?.removeAttribute("data-search-closed");
      resetActive();
      queueMicrotask(syncA11y);
    };

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const input = event.target as HTMLElement;
      if (!input.matches?.(".true-home .th-search input")) return;
      const wrap = getWrap();
      const options = getOptions();

      if (event.key === "Escape") {
        event.preventDefault();
        wrap?.setAttribute("data-search-closed", "true");
        resetActive();
        syncA11y();
        return;
      }

      if (!options.length || wrap?.dataset.searchClosed === "true") return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive(activeIndex + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive(activeIndex <= 0 ? options.length - 1 : activeIndex - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        setActive(0);
      } else if (event.key === "End") {
        event.preventDefault();
        setActive(options.length - 1);
      } else if (event.key === "Enter" && activeIndex >= 0) {
        event.preventDefault();
        options[activeIndex]?.click();
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target.matches?.(".true-home .th-search input") && (target as HTMLInputElement).value.trim().length >= 2) {
        getWrap()?.removeAttribute("data-search-closed");
        queueMicrotask(syncA11y);
      }
    };

    const observer = new MutationObserver(() => ensureClearButton());
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("input", onInput, true);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("focusin", onFocusIn, true);
    ensureClearButton();

    return () => {
      observer.disconnect();
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("focusin", onFocusIn, true);
      clearMount?.root.unmount();
      clearMount?.node.remove();
    };
  }, []);

  return null;
}
