import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

type CoverRow = {
  product_name: string;
  product_slug: string | null;
  image_url: string | null;
  isbn: string | null;
};

const BOOK_META: Record<string, string> = {
  "Mente Perversa": "Editora Autografia · 2024",
  "Uma História de Superação": "Biblioteca 24horas · 2025 · 184 páginas",
  "Uma viagem ao mundo da imaginação": "Viseu · 2024 · 164 páginas",
  "O Despertar para o Mundo Literário": "Biblioteca 24horas · 2025 · 222 páginas",
};

const TARGET_SLUGS = [
  "mente-perversa",
  "uma-historia-de-superacao",
  "uma-viagem-ao-mundo-da-imaginacao",
  "despertar-para-o-mundo-literario",
];

export function DorinhaBookCoverPolish() {
  const { pathname } = useLocation();

  useEffect(() => {
    const active = pathname === "/autora/dorinha-barroso" || pathname === "/dorinha-barroso";
    if (!active || !supabase) return;

    let cancelled = false;
    let observer: MutationObserver | null = null;
    let retryTimer = 0;

    const style = document.createElement("style");
    style.id = "pc-dorinha-real-book-covers";
    style.textContent = `
      .db-book{overflow:hidden!important;border:1px solid #e4ddd5!important;background:#fff!important;box-shadow:0 12px 34px rgba(42,28,30,.07)!important}
      .db-real-cover-shell{position:relative!important;display:grid!important;place-items:center!important;min-height:390px!important;padding:30px 22px 26px!important;overflow:hidden!important;background:radial-gradient(circle at 50% 12%,rgba(255,255,255,.98),rgba(255,255,255,.22) 33%,transparent 58%),linear-gradient(150deg,#f7f2ec,#ece4dc 64%,#e4d9ce)!important;isolation:isolate}
      .db-real-cover-shell:before{content:"";position:absolute;left:8%;right:8%;bottom:19px;height:18px;border-radius:50%;background:rgba(49,31,28,.14);filter:blur(12px);z-index:0}
      .db-real-cover-shell:after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 0 48%,rgba(255,255,255,.28) 49%,transparent 54%);pointer-events:none;opacity:.38}
      .db-real-cover-image{position:relative;z-index:2;display:block;width:min(79%,238px);height:330px;object-fit:contain;object-position:center;border-radius:2px 7px 7px 2px;filter:drop-shadow(-7px 9px 0 rgba(54,37,34,.10)) drop-shadow(0 22px 24px rgba(45,28,28,.20));transform:perspective(900px) rotateY(1.2deg);transform-origin:left center;transition:transform .28s ease,filter .28s ease}
      .db-book:hover .db-real-cover-image{transform:perspective(900px) rotateY(-2deg) translateY(-6px) scale(1.015);filter:drop-shadow(-8px 10px 0 rgba(54,37,34,.11)) drop-shadow(0 29px 30px rgba(45,28,28,.24))}
      .db-real-cover-badge{position:absolute;z-index:4;top:15px;left:15px;display:inline-flex;align-items:center;gap:5px;padding:6px 8px;border:1px solid rgba(74,56,45,.12);border-radius:999px;background:rgba(255,255,255,.88);backdrop-filter:blur(8px);box-shadow:0 5px 15px rgba(42,28,30,.06);color:#68584c;font-size:9px;font-weight:900;letter-spacing:.09em}
      .db-real-cover-badge:before{content:"";width:6px;height:6px;border-radius:50%;background:#8b6846;box-shadow:0 0 0 3px rgba(139,104,70,.11)}
      .db-editorial-meta{display:flex;align-items:center;min-height:28px;margin:1px 0 9px;padding-bottom:9px;border-bottom:1px solid #eee8e2;color:#766a62;font-size:10.5px;font-weight:700;line-height:1.45;letter-spacing:.01em}
      .db-book [style*="Venda direta"]{letter-spacing:.01em}
      @media(max-width:640px){.db-real-cover-shell{min-height:360px!important;padding:25px 18px 22px!important}.db-real-cover-image{width:min(74%,225px);height:305px}.db-real-cover-badge{top:13px;left:13px}}
    `;
    document.getElementById(style.id)?.remove();
    document.head.appendChild(style);

    void (async () => {
      const { data } = await supabase
        .from("merchant_products")
        .select("product_name,product_slug,image_url,isbn")
        .in("product_slug", TARGET_SLUGS);

      if (cancelled) return;
      const rows = (data ?? []) as CoverRow[];
      const byName = new Map(rows.map((row) => [row.product_name.trim(), row]));

      const install = () => {
        if (cancelled) return;
        const cards = document.querySelectorAll<HTMLElement>(".db-book");
        if (!cards.length) return;

        cards.forEach((card) => {
          const title = card.querySelector("h3")?.textContent?.trim();
          if (!title) return;
          const book = byName.get(title);
          if (!book?.image_url) return;

          const cover = card.firstElementChild as HTMLElement | null;
          if (!cover) return;

          if (cover.dataset.realCover !== "1") {
            cover.dataset.realCover = "1";
            cover.classList.add("db-real-cover-shell");
            cover.replaceChildren();

            const image = document.createElement("img");
            image.src = book.image_url;
            image.alt = `Capa do livro ${title}, de Dorinha Barroso`;
            image.loading = "lazy";
            image.decoding = "async";
            image.className = "db-real-cover-image";

            const badge = document.createElement("span");
            badge.className = "db-real-cover-badge";
            badge.textContent = "CAPA OFICIAL";

            cover.append(image, badge);
          }

          const body = card.children.item(1) as HTMLElement | null;
          if (body && !body.querySelector(".db-editorial-meta")) {
            const metadata = document.createElement("div");
            metadata.className = "db-editorial-meta";
            metadata.textContent = BOOK_META[title] || (book.isbn ? `ISBN ${book.isbn}` : "Obra de Dorinha Barroso");
            const description = body.querySelector("p");
            if (description) body.insertBefore(metadata, description);
            else body.appendChild(metadata);
          }
        });
      };

      install();
      observer = new MutationObserver(install);
      observer.observe(document.body, { childList: true, subtree: true });
      retryTimer = window.setTimeout(install, 650);
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.clearTimeout(retryTimer);
      document.getElementById("pc-dorinha-real-book-covers")?.remove();
    };
  }, [pathname]);

  return null;
}
