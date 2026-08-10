import { useEffect } from "react";
import { fetchCatalog, normalize } from "../data/remoteCatalog";
import type { Product, ProductOffer } from "../data/catalog";

const LABEL_CLASS = "professional-max-price-store";

function highestOffer(product: Product): ProductOffer | undefined {
  return product.offers?.reduce<ProductOffer | undefined>((highest, offer) => {
    if (!highest || offer.value > highest.value) return offer;
    return highest;
  }, undefined);
}

function buildProductLookup(products: Product[]) {
  const lookup = new Map<string, Product>();

  products.forEach(product => {
    lookup.set(normalize(product.name), product);
  });

  return lookup;
}

function annotateMaxPriceStores(lookup: Map<string, Product>) {
  document.querySelectorAll<HTMLElement>(".professional-result-card").forEach(card => {
    const title = card.querySelector<HTMLElement>("h3")?.textContent?.trim();
    if (!title) return;

    const product = lookup.get(normalize(title));
    const offer = product ? highestOffer(product) : undefined;
    if (!offer) return;

    const priceBlocks = Array.from(
      card.querySelectorAll<HTMLElement>(".professional-price-analysis > span"),
    );
    const maxPriceBlock = priceBlocks.find(block =>
      block.querySelector("small")?.textContent?.trim() === "Maior preço",
    );
    if (!maxPriceBlock) return;

    let label = maxPriceBlock.querySelector<HTMLElement>(`.${LABEL_CLASS}`);
    if (!label) {
      label = document.createElement("small");
      label.className = LABEL_CLASS;
      label.style.display = "block";
      label.style.marginTop = "3px";
      label.style.maxWidth = "100%";
      label.style.overflow = "hidden";
      label.style.textOverflow = "ellipsis";
      label.style.whiteSpace = "nowrap";
      label.style.fontSize = "0.7rem";
      label.style.fontWeight = "500";
      label.style.lineHeight = "1.25";
      label.style.color = "var(--muted)";
      label.style.opacity = "0.9";
      maxPriceBlock.appendChild(label);
    }

    label.textContent = `em ${offer.establishment}`;
    label.title = `Maior preço encontrado em ${offer.establishment}`;
    label.setAttribute("aria-label", `Maior preço encontrado em ${offer.establishment}`);
  });
}

/**
 * Acrescenta, de forma visualmente secundária, o estabelecimento associado ao
 * maior preço nos cards da pesquisa. A informação vem da mesma lista de ofertas
 * usada para calcular minPrice/avgPrice/maxPrice; nenhum preço é recalculado aqui.
 */
export function MaxPriceStoreLabels() {
  useEffect(() => {
    let active = true;
    let observer: MutationObserver | undefined;

    void fetchCatalog().then(catalog => {
      if (!active) return;

      const lookup = buildProductLookup(catalog.products);
      const applyLabels = () => annotateMaxPriceStores(lookup);

      applyLabels();
      observer = new MutationObserver(applyLabels);
      observer.observe(document.body, { childList: true, subtree: true });
    }).catch(error => {
      console.warn("Não foi possível identificar o estabelecimento do maior preço.", error);
    });

    return () => {
      active = false;
      observer?.disconnect();
    };
  }, []);

  return null;
}
