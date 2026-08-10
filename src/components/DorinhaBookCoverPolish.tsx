import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BOOK_META: Record<string, string> = {
  "Mente Perversa": "Editora Autografia · 2024",
  "Uma História de Superação": "Biblioteca 24horas · 2025 · 184 páginas",
  "Uma viagem ao mundo da imaginação": "Viseu · 2024 · 164 páginas",
  "O Despertar para o Mundo Literário": "Biblioteca 24horas · 2025 · 222 páginas",
};

export function DorinhaBookCoverPolish() {
  const { pathname } = useLocation();

  useEffect(() => {
    const active = pathname === "/autora/dorinha-barroso" || pathname === "/dorinha-barroso";
    if (!active) return;

    let cancelled = false;
    let observer: MutationObserver | null = null;
    let retryTimer = 0;

    const style = document.createElement("style");
    style.id = "pc-dorinha-real-book-covers";
    style.textContent = `
      .db-book{overflow:hidden!important;border:1px solid #e4ddd5!important;background:#fff!important;box-shadow:0 12px 34px rgba(42,28,30,.07)!important}
      .db-real-cover-shell{position:relative!important;display:grid!important;place-items:center!important;min-height:390px!important;padding:30px 22px 26px!important;overflow:hidden!important;background:linear-gradient(145deg,rgba(24,8,29,.82),rgba(47,19,43,.35) 58%,rgba(226,190,121,.18)),url('/dorinha-hero-art-v2.webp') center/cover no-repeat,#24102b!important;isolation:isolate}
      .db-real-cover-shell:before{content:"";position:absolute;left:11%;right:11%;bottom:18px;height:22px;border-radius:50%;background:rgba(8,3,12,.42);filter:blur(13px);z-index:0}
      .db-real-cover-shell:after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 0 43%,rgba(255,236,198,.14) 49%,transparent 56%);pointer-events:none;opacity:.7}
      .db-cover-placeholder{position:absolute;z-index:1;width:min(70%,210px);height:310px;border:1px solid rgba(245,218,165,.24);border-radius:3px 8px 8px 3px;background:linear-gradient(110deg,rgba(255,255,255,.06) 25%,rgba(255,255,255,.16) 42%,rgba(255,255,255,.06) 60%);background-size:240% 100%;box-shadow:0 20px 35px rgba(8,3,12,.25);animation:db-cover-shimmer 1.35s ease-in-out infinite;display:grid;place-items:end center;padding:18px;color:#f1d9aa;font-size:11px;font-weight:750;letter-spacing:.04em}
      .db-real-cover-shell.is-loaded .db-cover-placeholder{opacity:0;visibility:hidden;transition:opacity .25s ease,visibility .25s ease}
      @keyframes db-cover-shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}
      .db-real-cover-image{position:relative;z-index:2;display:block;width:min(79%,238px);height:330px;object-fit:contain;object-position:center;border-radius:2px 7px 7px 2px;opacity:0;filter:drop-shadow(-7px 9px 0 rgba(16,5,19,.22)) drop-shadow(0 22px 24px rgba(8,3,12,.42));transform:perspective(900px) rotateY(1.2deg);transform-origin:left center;transition:opacity .28s ease,transform .28s ease,filter .28s ease}
      .db-real-cover-shell.is-loaded .db-real-cover-image{opacity:1}
      .db-book:hover .db-real-cover-image{transform:perspective(900px) rotateY(-2deg) translateY(-6px) scale(1.015);filter:drop-shadow(-8px 10px 0 rgba(54,37,34,.11)) drop-shadow(0 29px 30px rgba(45,28,28,.24))}
      .db-real-cover-badge{position:absolute;z-index:4;top:15px;left:15px;display:inline-flex;align-items:center;gap:5px;padding:6px 8px;border:1px solid rgba(245,218,165,.3);border-radius:999px;background:rgba(28,11,33,.78);backdrop-filter:blur(9px);box-shadow:0 5px 15px rgba(8,3,12,.16);color:#f7dfad;font-size:10px;font-weight:800;letter-spacing:.08em}
      .db-real-cover-badge:before{content:"";width:6px;height:6px;border-radius:50%;background:#e2bd73;box-shadow:0 0 0 3px rgba(226,189,115,.13)}
      .db-editorial-meta{display:flex;align-items:center;min-height:28px;margin:1px 0 9px;padding-bottom:9px;border-bottom:1px solid #eee8e2;color:#766a62;font-size:10.5px;font-weight:700;line-height:1.45;letter-spacing:.01em}
      .db-book [style*="Venda direta"]{letter-spacing:.01em}
      @media(max-width:640px){.db-real-cover-shell{min-height:360px!important;padding:25px 18px 22px!important}.db-real-cover-image{width:min(74%,225px);height:305px}.db-real-cover-badge{top:13px;left:13px}}
    `;
    document.getElementById(style.id)?.remove();
    document.head.appendChild(style);

    const install = () => {
        if (cancelled) return;
        const cards = document.querySelectorAll<HTMLElement>(".db-book");
        if (!cards.length) return;

        cards.forEach((card) => {
          const title = card.querySelector("h3")?.textContent?.trim();
          if (!title) return;

          const body = card.children.item(1) as HTMLElement | null;
          if (body && !body.querySelector(".db-editorial-meta")) {
            const metadata = document.createElement("div");
            metadata.className = "db-editorial-meta";
            metadata.textContent = BOOK_META[title] || "Obra de Dorinha Barroso";
            const description = body.querySelector("p");
            if (description) body.insertBefore(metadata, description);
            else body.appendChild(metadata);
          }
        });
      };

    install();
    observer = new MutationObserver(install);
    observer.observe(document.body, { childList: true, subtree: true });
    retryTimer = window.setTimeout(install, 400);

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.clearTimeout(retryTimer);
      document.getElementById("pc-dorinha-real-book-covers")?.remove();
    };
  }, [pathname]);

  return null;
}
