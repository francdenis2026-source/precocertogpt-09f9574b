import { useEffect } from "react";

const STYLE_ID = "pc-scroll-performance-guard";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    html{scroll-behavior:auto!important}
    body{overflow-x:hidden}
    .th-header,.est-header,.pc-theme-toggle,.pc-store-header{will-change:auto;transform:translateZ(0)}
    .th-section,.th-discover,.est-directory,.professional-search-results,.basket-step-view,.pc-store-content,.pc-store-grid,.site-footer,.th-footer,.est-footer{content-visibility:auto;contain-intrinsic-size:1px 700px}
    body.pc-is-scrolling .th-header,
    body.pc-is-scrolling .est-header,
    body.pc-is-scrolling .pc-store-header,
    body.pc-is-scrolling .pc-theme-toggle{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
    body.pc-is-scrolling :where(.th-product,.th-store,.est-card,.professional-result-card,.product-card,.pc-store-card,.card,.panel,.surface-card){box-shadow:none!important;transform:none!important}
    body.pc-is-scrolling :where(.th-button,.est-btn,.button,.btn,button,a,[role="button"]){transition:none!important}
    body.pc-is-scrolling :where(.th-hero__image,.est-hero__image,.pc-store-hero__image){transform:none!important;transition:none!important}
    @media(max-width:900px){
      .th-header,.est-header,.pc-store-header,.pc-theme-toggle{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
      .th-product,.th-store,.est-card,.pc-store-card,.professional-result-card{box-shadow:0 4px 14px rgba(15,23,42,.06)!important}
    }
    @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto!important}}
  `;
  document.head.appendChild(style);
}

export function ScrollPerformanceGuard() {
  useEffect(() => {
    installStyles();
    let timer = 0;
    let ticking = false;

    const markScrolling = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          document.body.classList.add("pc-is-scrolling");
          ticking = false;
        });
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        document.body.classList.remove("pc-is-scrolling");
      }, 120);
    };

    window.addEventListener("scroll", markScrolling, { passive: true });
    window.addEventListener("touchmove", markScrolling, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", markScrolling);
      window.removeEventListener("touchmove", markScrolling);
      document.body.classList.remove("pc-is-scrolling");
    };
  }, []);

  return null;
}
