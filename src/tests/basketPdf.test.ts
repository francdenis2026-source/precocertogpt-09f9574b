import { describe, it, expect, beforeEach } from "vitest";
import { planBasketPdf, planFitsWithoutClipping, pageGeometry, A4 } from "../lib/basketPdf";
import { getPdfOrientation, setPdfOrientation } from "../lib/pdfPrefs";
import type { BasketResult } from "../lib/smartBasket";

function makeResult(stores: Array<{ name: string; items: number; neighborhood?: string; distanceKm?: number }>): BasketResult {
  const items: BasketResult["items"] = [];
  const storeBreakdown: BasketResult["storeBreakdown"] = {};
  let total = 0;

  stores.forEach(store => {
    for (let i = 0; i < store.items; i++) {
      const subtotal = 10 + i;
      total += subtotal;
      items.push({
        product: { id: `${store.name}-${i}`, name: `Produto ${store.name} ${i}`, unit: "un", minPrice: subtotal, avgPrice: subtotal + 2 } as any,
        quantity: 1,
        subtotal,
        establishment: store.name,
        neighborhood: store.neighborhood || "Centro",
        isOptimizationMatch: true,
      });
    }
    storeBreakdown[store.name] = {
      total: items.filter(i => i.establishment === store.name).reduce((s, i) => s + i.subtotal, 0),
      itemCount: store.items,
      storeName: store.name,
      neighborhood: store.neighborhood || "Centro",
      distanceKm: store.distanceKm ?? 1.5,
      estimatedTravelCost: (store.distanceKm ?? 1.5) * 2,
    };
  });

  return { total, savings: 20, travelCost: stores.length * 3, items, storeBreakdown };
}

describe("geometria A4", () => {
  it("usa A4 retrato e paisagem com margens seguras", () => {
    const p = pageGeometry("portrait");
    const l = pageGeometry("landscape");
    expect([p.pageWidth, p.pageHeight]).toEqual([A4.width, A4.height]);
    expect([l.pageWidth, l.pageHeight]).toEqual([A4.height, A4.width]);
    for (const g of [p, l]) {
      expect(g.marginX).toBeGreaterThanOrEqual(12);
      expect(g.marginX).toBeLessThanOrEqual(20);
      expect(g.contentWidth).toBe(g.pageWidth - g.marginX * 2);
      expect(g.marginBottom).toBeGreaterThanOrEqual(10);
    }
  });
});

describe("plano do PDF da Cesta Inteligente", () => {
  it("agrupa itens por estabelecimento com cabeçalho e subtotal", () => {
    const plan = planBasketPdf(makeResult([{ name: "Mercado A", items: 3 }, { name: "Mercado B", items: 2 }]), "cheapest_multi");
    const blocks = plan.pages.flatMap(p => p.blocks);
    expect(blocks.filter(b => b.type === "storeHeader")).toHaveLength(2);
    expect(blocks.filter(b => b.type === "item")).toHaveLength(5);
    expect(blocks.filter(b => b.type === "storeSubtotal")).toHaveLength(2);
  });

  it("mantém a ordem cabeçalho → itens → subtotal dentro de cada grupo", () => {
    const plan = planBasketPdf(makeResult([{ name: "Mercado A", items: 2 }]), "cheapest_multi");
    const types = plan.pages.flatMap(p => p.blocks).map(b => b.type);
    expect(types.slice(0, 4)).toEqual(["storeHeader", "item", "item", "storeSubtotal"]);
  });

  it("inclui resumo de deslocamento apenas no modo melhor custo-benefício", () => {
    const result = makeResult([{ name: "Mercado A", items: 1, distanceKm: 2.4 }]);
    const bestValue = planBasketPdf(result, "best_value").pages.flatMap(p => p.blocks);
    const cheapest = planBasketPdf(result, "cheapest_multi").pages.flatMap(p => p.blocks);

    const travel = bestValue.find(b => b.type === "travel") as any;
    expect(travel).toBeTruthy();
    expect(travel.distanceKm).toBe(2.4);
    expect(cheapest.some(b => b.type === "travel")).toBe(false);

    const labels = bestValue.filter(b => b.type === "summary").map((b: any) => b.label);
    expect(labels).toContain("Custo de deslocamento estimado");
    expect(labels).toContain("Custo final estimado");
  });

  it("mostra economia estimada nos modos sem deslocamento", () => {
    const labels = planBasketPdf(makeResult([{ name: "Mercado A", items: 1 }]), "cheapest_single")
      .pages.flatMap(p => p.blocks)
      .filter(b => b.type === "summary")
      .map((b: any) => b.label);
    expect(labels).toContain("Economia estimada");
    expect(labels).not.toContain("Custo final estimado");
  });

  it("quebra em várias páginas sem cortar conteúdo", () => {
    const plan = planBasketPdf(makeResult([{ name: "Mercado A", items: 60 }, { name: "Mercado B", items: 40 }]), "best_value");
    expect(plan.pages.length).toBeGreaterThan(1);
    expect(planFitsWithoutClipping(plan)).toBe(true);
  });

  it("nunca deixa o cabeçalho da loja órfão no fim da página", () => {
    const plan = planBasketPdf(makeResult([{ name: "Mercado A", items: 33 }, { name: "Mercado B", items: 5 }]), "cheapest_multi");
    plan.pages.forEach(page => {
      const last = page.blocks[page.blocks.length - 1];
      expect(last.type).not.toBe("storeHeader");
    });
  });

  it("cabe sem cortes tanto em retrato quanto em paisagem", () => {
    const result = makeResult([{ name: "Mercado A", items: 25 }, { name: "Mercado B", items: 25 }]);
    expect(planFitsWithoutClipping(planBasketPdf(result, "best_value", "portrait"))).toBe(true);
    expect(planFitsWithoutClipping(planBasketPdf(result, "best_value", "landscape"))).toBe(true);
  });
});

describe("preferência de orientação por usuário", () => {
  beforeEach(() => localStorage.clear());

  it("usa retrato por padrão", () => {
    expect(getPdfOrientation("cliente@precocerto.com.br")).toBe("portrait");
  });

  it("persiste a escolha por usuário", () => {
    setPdfOrientation("landscape", "cliente@precocerto.com.br");
    expect(getPdfOrientation("cliente@precocerto.com.br")).toBe("landscape");
    expect(getPdfOrientation("outro@precocerto.com.br")).toBe("portrait");
    expect(getPdfOrientation(null)).toBe("portrait");
  });
});
