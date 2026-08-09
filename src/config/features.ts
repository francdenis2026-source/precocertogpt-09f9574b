// Feature flags do PreçoCerto.
// Módulos incompletos NÃO devem aparecer no menu nem ser navegáveis.
// Fonte única: altere aqui (ou via VITE_FEATURE_*) em vez de espalhar condições no código.

const envFlag = (key: string, fallback: boolean) => {
  const raw = (import.meta.env as Record<string, string | undefined>)[key];
  if (raw === undefined) return fallback;
  return raw === "true" || raw === "1";
};

export type FeatureKey =
  | "smartBasket"
  | "consumerPlans"
  | "credits"
  | "merchantArea"
  | "sponsorships"
  | "payments"
  | "priceReports"
  | "unitPrice";

export const features: Record<FeatureKey, boolean> = {
  /** Cesta Inteligente determinística (Fase 2). */
  smartBasket: envFlag("VITE_FEATURE_SMART_BASKET", false),
  /** Catálogo de planos do consumidor (Fase 3). */
  consumerPlans: envFlag("VITE_FEATURE_CONSUMER_PLANS", false),
  /** Carteira de créditos (Fase 3). */
  credits: envFlag("VITE_FEATURE_CREDITS", false),
  /** Área do comerciante (Fase 4). */
  merchantArea: envFlag("VITE_FEATURE_MERCHANT_AREA", false),
  /** Patrocínios e campanhas (Fase 5). */
  sponsorships: envFlag("VITE_FEATURE_SPONSORSHIPS", false),
  /** Mercado Pago (Fase 3). */
  payments: envFlag("VITE_FEATURE_PAYMENTS", false),
  /** Denúncia de preço incorreto (Fase 1). */
  priceReports: envFlag("VITE_FEATURE_PRICE_REPORTS", true),
  /** Preço por unidade de medida (Fase 1). */
  unitPrice: envFlag("VITE_FEATURE_UNIT_PRICE", true),
};

export const isEnabled = (key: FeatureKey) => features[key] === true;
