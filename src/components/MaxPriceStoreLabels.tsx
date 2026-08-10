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
  products.forEach(product => lookup.set(normalize(product.name), product));
  return lookup;
}

function annotateMaxPriceStores(lookup: Map<string, Product>) {
  document.querySelectorAll<HTMLElement>(".professional-result-card").forEach(card => {
    const title = card.querySelector<HTMLElement>("h3")?.textContent?.trim();
    if (!title) return;

    const product = lookup.get(normalize(title));
    const offer = product ? highestOffer(product) : undefined;
    if (!offer) return;

    const priceBlocks = Array.from(card.querySelectorAll<HTMLElement>(".professional-price-analysis > span"));
    const maxPriceBlock = priceBlocks.find(block =>
      block.querySelector("small")?.textContent?.trim() === "Maior preço",
    );
    if (!maxPriceBlock) return;

    const desiredText = `em ${offer.establishment}`;
    const desiredTitle = `Maior preço encontrado em ${offer.establishment}`;
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
      label.textContent = desiredText;
      label.title = desiredTitle;
      label.setAttribute("aria-label", desiredTitle);
      maxPriceBlock.appendChild(label);
      return;
    }

    // Evita escrever no DOM quando nada mudou. Isso impede o MutationObserver
    // de reagir às próprias alterações em um loop contínuo.
    if (label.textContent !== desiredText) label.textContent = desiredText;
    if (label.title !== desiredTitle) label.title = desiredTitle;
    if (label.getAttribute("aria-label") !== desiredTitle) label.setAttribute("aria-label", desiredTitle);
  });
}

export function MaxPriceStoreLabels() {
  useEffect(() => {
    let active = true;
    let observer: MutationObserver | undefined;
    let frame = 0;

    void fetchCatalog().then(catalog => {
      if (!active) return;
      const lookup = buildProductLookup(catalog.products);

      const applyLabels = () => {
        frame = 0;
        annotateMaxPriceStores(lookup);
      };
      const scheduleApply = () => {
        if (frame) return;
        frame = requestAnimationFrame(applyLabels);
      };

      applyLabels();
      const root = document.getElementById("root") ?? document.body;
      observer = new MutationObserver(scheduleApply);
      observer.observe(root, { childList: true, subtree: true });
    }).catch(error => {
      console.warn("Não foi possível identificar o estabelecimento do maior preço.", error);
    });

    return () => {
      active = false;
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
