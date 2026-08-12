import { planBasketPdf, renderPlanToPdf } from "./lib/basketPdf";
import { money } from "./lib/pricing";
import { jsPDF } from "jspdf";

const mockOptimizationResult = {
  total: 100,
  savings: 20,
  items: [
    {
      product: { name: "Arroz 5kg", minPrice: 20, unit: "un", category: "Mercearia", capturedAt: new Date().toISOString() },
      establishment: "Mercado A",
      quantity: 1,
      subtotal: 20
    }
  ],
  storeBreakdown: {
    "Mercado A": { storeName: "Mercado A", itemCount: 1, total: 20, neighborhood: "Centro", distanceKm: 1 }
  }
};

try {
  const plan = planBasketPdf(mockOptimizationResult as any, "cheapest_multi", "portrait");
  const doc = new jsPDF();
  renderPlanToPdf(doc, plan, { dateLabel: "01/01/2026", timeLabel: "12:00", money });
  console.log("PDF logic validated successfully");
} catch (error) {
  console.error("PDF logic validation failed:", error);
  process.exit(1);
}
