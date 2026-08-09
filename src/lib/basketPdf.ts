import type { BasketResult, OptimizationMode } from "./smartBasket";

export type PdfOrientation = "portrait" | "landscape";

/** Dimensões A4 em mm. */
export const A4 = { width: 210, height: 297 };

export interface PdfPageGeometry {
  pageWidth: number;
  pageHeight: number;
  marginX: number;
  marginTop: number;
  marginBottom: number;
  contentWidth: number;
  headerHeight: number;
}

/**
 * Geometria A4 com margens calculadas automaticamente.
 * Mantém pelo menos 10mm de margem (área não imprimível de impressoras comuns)
 * e limita a largura útil para evitar cortes nas laterais.
 */
export function pageGeometry(orientation: PdfOrientation): PdfPageGeometry {
  const pageWidth = orientation === "landscape" ? A4.height : A4.width;
  const pageHeight = orientation === "landscape" ? A4.width : A4.height;
  // Margem proporcional, nunca menor que 12mm nem maior que 20mm.
  const marginX = Math.min(20, Math.max(12, Math.round(pageWidth * 0.06)));
  const headerHeight = 22;
  const marginTop = headerHeight + 18;
  const marginBottom = 16;
  return {
    pageWidth,
    pageHeight,
    marginX,
    marginTop,
    marginBottom,
    contentWidth: pageWidth - marginX * 2,
    headerHeight,
  };
}

export type PdfBlock =
  | { type: "storeHeader"; storeName: string; neighborhood?: string; itemCount: number; height: number }
  | { type: "item"; label: string; amount: number; height: number }
  | { type: "storeSubtotal"; total: number; height: number }
  | { type: "travel"; distanceKm: number; travelCost: number; height: number }
  | { type: "divider"; height: number }
  | { type: "summary"; label: string; value: number; emphasis?: boolean; height: number };

export interface PdfPlan {
  geometry: PdfPageGeometry;
  orientation: PdfOrientation;
  modeLabel: string;
  pages: Array<{ blocks: PdfBlock[] }>;
}

const MODE_LABELS: Record<OptimizationMode, string> = {
  cheapest_single: "Loja unica mais barata",
  cheapest_multi: "Mais barata (varias lojas)",
  best_value: "Melhor custo-beneficio",
  within_budget: "Dentro do orcamento",
};

/**
 * Calcula o plano de páginas do PDF: agrupamento por estabelecimento,
 * resumos de deslocamento e quebras de página. Função pura — base dos testes.
 */
export function planBasketPdf(
  result: BasketResult,
  mode: OptimizationMode,
  orientation: PdfOrientation = "portrait",
): PdfPlan {
  const geometry = pageGeometry(orientation);
  const usableHeight = geometry.pageHeight - geometry.marginTop - geometry.marginBottom;

  const pages: Array<{ blocks: PdfBlock[] }> = [{ blocks: [] }];
  let used = 0;

  const push = (blocks: PdfBlock[]) => {
    const needed = blocks.reduce((sum, b) => sum + b.height, 0);
    if (used + needed > usableHeight && used > 0) {
      pages.push({ blocks: [] });
      used = 0;
    }
    pages[pages.length - 1].blocks.push(...blocks);
    used += needed;
  };

  Object.values(result.storeBreakdown).forEach(store => {
    const items = result.items.filter(i => i.establishment === store.storeName);
    const group: PdfBlock[] = [
      {
        type: "storeHeader",
        storeName: store.storeName,
        neighborhood: store.neighborhood,
        itemCount: store.itemCount,
        height: 12,
      },
    ];
    items.forEach(item => {
      group.push({
        type: "item",
        label: `${item.product.name} - ${item.quantity} ${item.product.unit || "un"}`,
        amount: item.subtotal,
        height: 6.5,
      });
    });
    group.push({ type: "storeSubtotal", total: store.total, height: 8 });
    if (mode === "best_value" && store.distanceKm != null) {
      group.push({
        type: "travel",
        distanceKm: store.distanceKm,
        travelCost: store.estimatedTravelCost || 0,
        height: 6,
      });
    }
    group.push({ type: "divider", height: 4 });

    // Cabeçalho + primeiro item nunca ficam órfãos: reservamos o mínimo do grupo.
    const minimum = group.slice(0, 2).reduce((s, b) => s + b.height, 0);
    if (used + minimum > usableHeight && used > 0) {
      pages.push({ blocks: [] });
      used = 0;
    }
    group.forEach(block => push([block]));
  });

  const summary: PdfBlock[] = [
    { type: "divider", height: 6 },
    { type: "summary", label: "Total dos produtos", value: result.total, height: 7 },
  ];
  if (mode === "best_value") {
    summary.push({
      type: "summary",
      label: "Custo de deslocamento estimado",
      value: result.travelCost || 0,
      height: 7,
    });
    summary.push({
      type: "summary",
      label: "Custo final estimado",
      value: result.total + (result.travelCost || 0),
      emphasis: true,
      height: 9,
    });
  } else {
    summary.push({ type: "summary", label: "Economia estimada", value: result.savings, emphasis: true, height: 9 });
  }
  push(summary);

  return { geometry, orientation, modeLabel: MODE_LABELS[mode], pages };
}

/** Verifica se todos os blocos caberiam sem cortes (usado nos testes de regressão). */
export function planFitsWithoutClipping(plan: PdfPlan): boolean {
  const usable = plan.geometry.pageHeight - plan.geometry.marginTop - plan.geometry.marginBottom;
  return plan.pages.every(p => p.blocks.reduce((s, b) => s + b.height, 0) <= usable);
}
