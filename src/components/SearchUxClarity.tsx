import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function replaceOwnText(element: Element, from: string, to: string) {
  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.includes(from)) {
      node.textContent = node.textContent.replace(from, to);
    }
  }
}

function ensureSearchHelp() {
  const command = document.querySelector<HTMLElement>(".search-command");
  if (!command || document.querySelector(".search-ux-guide")) return;

  const guide = document.createElement("div");
  guide.className = "search-ux-guide";
  guide.setAttribute("role", "note");
  Object.assign(guide.style, {
    marginTop: "12px",
    padding: "12px 14px",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    background: "var(--surface-2)",
    color: "var(--muted)",
    fontSize: "0.84rem",
    lineHeight: "1.45",
  });
  guide.innerHTML = "<strong style=\"color:var(--text-main)\">Como usar:</strong> pesquise o produto pelo nome. Nos resultados, veja o menor preço e as lojas. Use <strong style=\"color:var(--text-main)\">Selecionar para comparar</strong> somente quando quiser colocar itens lado a lado.";
  command.appendChild(guide);
}

function applySearchUx(pathname: string) {
  // /buscar é a área de pesquisa. Não deve ser apresentada como se fosse o comparador.
  document.querySelectorAll<HTMLAnchorElement>('a[href="/buscar"]').forEach(link => {
    const text = link.textContent?.trim();
    if (text === "Comparar preços") link.textContent = "Buscar produtos";
  });

  document.querySelectorAll<HTMLElement>(".search-combo__button-text").forEach(label => {
    if (label.textContent?.trim() === "Comparar preços") label.textContent = "Pesquisar";
  });

  document.querySelectorAll<HTMLAnchorElement>(".header-search-button").forEach(link => {
    link.setAttribute("aria-label", "Pesquisar produtos");
    link.setAttribute("title", "Pesquisar produtos");
  });

  // A ação secundária do hero é descoberta de ofertas, não outra entrada para a mesma busca.
  const heroOffer = document.querySelector<HTMLAnchorElement>('.hero-actions > a.button--white[href="/buscar"]');
  if (heroOffer) {
    heroOffer.href = "/melhores-precos";
    replaceOwnText(heroOffer, "Explorar ofertas", "Ver ofertas de hoje");
  }

  // Em cards, abrir um produto serve para ver preços por loja; "Comparar" sozinho é ambíguo.
  document.querySelectorAll<HTMLAnchorElement>('.visual-product-actions a[href^="/produto/"]').forEach(link => {
    if (link.textContent?.trim() === "Comparar") link.textContent = "Ver preços";
  });

  document.querySelectorAll<HTMLButtonElement>(".professional-compare-button").forEach(button => {
    const text = button.textContent?.trim();
    if (text === "Comparar") {
      for (const node of Array.from(button.childNodes)) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent?.includes("Comparar")) {
          node.textContent = node.textContent.replace("Comparar", "Selecionar para comparar");
        }
      }
      button.setAttribute("aria-label", "Selecionar este produto para comparação");
    }
  });

  if (pathname === "/buscar") {
    const title = document.querySelector<HTMLElement>(".search-command__intro h1");
    if (title?.textContent?.trim() === "Compare antes de comprar") {
      title.textContent = "Encontre o produto que você procura";
    }

    const intro = document.querySelector<HTMLElement>(".search-command__intro p");
    if (intro) {
      intro.textContent = "Digite o nome do produto, encontre rapidamente os preços disponíveis em Feijó e veja onde está mais barato.";
    }

    ensureSearchHelp();
  }
}

/**
 * Uniformiza a linguagem de busca e comparação sem alterar os cálculos ou os
 * dados. A pesquisa é a ação primária; comparar passa a ser uma ação explícita
 * realizada depois que o usuário encontra produtos.
 */
export function SearchUxClarity() {
  const { pathname } = useLocation();

  useEffect(() => {
    const apply = () => applySearchUx(pathname);
    apply();

    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
