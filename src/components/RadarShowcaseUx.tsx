import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { fetchCatalog } from "../data/remoteCatalog";
import type { Product } from "../data/catalog";

const STYLE_ID = "pc-radar-showcase-ux";
const ROTATION_MS = 30 * 60 * 1000;

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    body.pc-radar-showcase .hero-insight__item {
      grid-template-columns: 26px 72px minmax(0,1fr) auto !important;
      min-height: 86px !important;
      gap: 12px !important;
      padding: 10px 12px !important;
      align-items: center !important;
    }
    body.pc-radar-showcase .hero-insight__item > img,
    body.pc-radar-showcase .hero-insight__item .product-image,
    body.pc-radar-showcase .hero-insight__item .product-image img,
    body.pc-radar-showcase .pc-radar-product-image {
      width: 68px !important;
      height: 68px !important;
      min-width: 68px !important;
      max-width: 68px !important;
      max-height: 68px !important;
      object-fit: contain !important;
      border-radius: 12px !important;
      background: rgba(255,255,255,.96) !important;
      padding: 6px !important;
    }
    body.pc-radar-showcase .hero-insight__product b {
      display: -webkit-box !important;
      -webkit-line-clamp: 2 !important;
      -webkit-box-orient: vertical !important;
      overflow: hidden !important;
      font-size: .9rem !important;
      line-height: 1.2 !important;
    }
    body.pc-radar-showcase .hero-insight__product small {
      margin-top: 5px !important;
      font-size: .74rem !important;
    }
    body.pc-radar-showcase .hero-insight__price b { font-size: .98rem !important; }
    body.pc-radar-showcase .hero-insight__head em { white-space: nowrap; }
    @media (max-width: 1100px) {
      body.pc-radar-showcase .hero-insight__item {
        grid-template-columns: 22px 60px minmax(0,1fr) auto !important;
      }
      body.pc-radar-showcase .hero-insight__item > img,
      body.pc-radar-showcase .hero-insight__item .product-image,
      body.pc-radar-showcase .hero-insight__item .product-image img,
      body.pc-radar-showcase .pc-radar-product-image {
        width: 56px !important;
        height: 56px !important;
        min-width: 56px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function shuffled<T>(items: T[]) {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function pickShowcase(products: Product[], count = 3) {
  const valid = products.filter(product => product.minPrice > 0 && product.name && product.establishment);
  const pool = shuffled(valid);
  const selected: Product[] = [];
  const usedStores = new Set<string>();

  for (const product of pool) {
    const storeKey = String(product.establishmentId ?? product.establishment);
    if (usedStores.has(storeKey)) continue;
    selected.push(product);
    usedStores.add(storeKey);
    if (selected.length >= count) return selected;
  }

  for (const product of pool) {
    if (selected.some(item => item.id === product.id)) continue;
    selected.push(product);
    if (selected.length >= count) break;
  }
  return selected;
}

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function productImage(product: Product) {
  return product.image_url || "/products/product-placeholder.png";
}

function renderRadar(products: Product[]) {
  const list = document.querySelector<HTMLElement>(".hero-insight__list");
  if (!list) return false;

  const showcase = pickShowcase(products, 3);
  if (!showcase.length) return true;

  list.querySelectorAll(".hero-insight__item").forEach(node => node.remove());
  const titleRow = list.querySelector("p");

  showcase.forEach((product, index) => {
    const link = document.createElement("a");
    link.className = "hero-insight__item pc-radar-showcase-item";
    link.href = `/produto/${product.slug}`;
    link.setAttribute("data-product-id", String(product.id));

    const rank = document.createElement("span");
    rank.className = "hero-insight__rank";
    rank.textContent = `0${index + 1}`;

    const image = document.createElement("img");
    image.className = "pc-radar-product-image";
    image.src = productImage(product);
    image.alt = product.name;
    image.loading = "lazy";
    image.onerror = () => { image.style.visibility = "hidden"; };

    const info = document.createElement("span");
    info.className = "hero-insight__product";
    const name = document.createElement("b");
    name.textContent = product.name;
    const store = document.createElement("small");
    store.textContent = product.establishment;
    info.append(name, store);

    const price = document.createElement("span");
    price.className = "hero-insight__price";
    const value = document.createElement("b");
    value.textContent = money(product.minPrice);
    const label = document.createElement("small");
    label.textContent = "melhor preço";
    price.append(value, label);

    link.append(rank, image, info, price);
    link.addEventListener("click", event => {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent("pc:open-product-details", { detail: product }));
    });
    list.appendChild(link);
  });

  if (titleRow) {
    const label = titleRow.querySelector("span");
    if (label) label.textContent = "Vitrine da vez";
  }

  const status = document.querySelector<HTMLElement>(".hero-insight__head em");
  if (status) status.innerHTML = "<i></i> troca em 30 min";
  return true;
}

export function RadarShowcaseUx() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname !== "/") return;
    installStyles();
    document.body.classList.add("pc-radar-showcase");
    let active = true;
    let rotationTimer: number | undefined;
    let mountTimer: number | undefined;

    void fetchCatalog().then(catalog => {
      if (!active) return;
      const refresh = () => {
        if (!active) return;
        if (!renderRadar(catalog.products)) {
          mountTimer = window.setTimeout(refresh, 150);
        }
      };
      refresh();
      rotationTimer = window.setInterval(() => renderRadar(catalog.products), ROTATION_MS);
    }).catch(error => console.warn("Falha ao montar vitrine do Radar de Economia.", error));

    return () => {
      active = false;
      if (rotationTimer) window.clearInterval(rotationTimer);
      if (mountTimer) window.clearTimeout(mountTimer);
      document.body.classList.remove("pc-radar-showcase");
    };
  }, [pathname]);

  return null;
}
