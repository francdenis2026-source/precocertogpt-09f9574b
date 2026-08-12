// Normalização de medidas, preço por unidade e frescor do preço.
// Cálculos 100% determinísticos — nenhuma IA participa destas contas.

export type MeasureBase = "kg" | "L" | "un";

export type Measure = {
  /** Quantidade convertida para a base (kg, L ou unidade). */
  quantity: number;
  base: MeasureBase;
  /** Rótulo curto usado na interface: "kg", "L", "un". */
  label: string;
};

const decimal = (raw: string) => Number(raw.replace(",", "."));

/**
 * Converte um texto de embalagem ("5 kg", "900 ml", "500 g", "2 x 1 L", "12 un")
 * para uma medida na base compatível. Retorna `null` quando não é possível
 * converter com segurança — nesse caso a interface NÃO deve exibir preço unitário.
 */
export function parseMeasure(size?: string | null, unit?: string | null): Measure | null {
  const source = `${size ?? ""} ${unit ?? ""}`.toLowerCase().replace(/\s+/g, " ").trim();
  if (!source) return null;

  // Multipacks: "2 x 1 L", "6x350ml"
  let multiplier = 1;
  const pack = source.match(/(\d+(?:[.,]\d+)?)\s*[x×]\s*(?=\d)/);
  if (pack) multiplier = decimal(pack[1]) || 1;

  const match = source.match(
    /(\d+(?:[.,]\d+)?)\s*(kg|quilo|quilos|g|gr|gramas?|mg|l|lt|litros?|ml|un|und|unid|unidades?|pcs?)\b/,
  );

  if (!match) {
    // "quilo", "kg" sem número: 1 kg. "unidade" sem número: 1 un.
    if (/\b(kg|quilo)\b/.test(source)) return { quantity: 1, base: "kg", label: "kg" };
    if (/\b(litro|l)\b/.test(source)) return { quantity: 1, base: "L", label: "L" };
    if (/\b(unidade|un|und)\b/.test(source)) return { quantity: 1, base: "un", label: "un" };
    return null;
  }

  const value = decimal(match[1]) * multiplier;
  if (!Number.isFinite(value) || value <= 0) return null;
  const rawUnit = match[2];

  if (/^(kg|quilo|quilos)$/.test(rawUnit)) return { quantity: value, base: "kg", label: "kg" };
  if (/^(g|gr|grama|gramas)$/.test(rawUnit)) return { quantity: value / 1000, base: "kg", label: "kg" };
  if (/^mg$/.test(rawUnit)) return { quantity: value / 1_000_000, base: "kg", label: "kg" };
  if (/^(l|lt|litro|litros)$/.test(rawUnit)) return { quantity: value, base: "L", label: "L" };
  if (/^ml$/.test(rawUnit)) return { quantity: value / 1000, base: "L", label: "L" };
  return { quantity: value, base: "un", label: "un" };
}

export type UnitPrice = { value: number; base: MeasureBase; label: string };

/** Preço por kg / L / unidade. `null` quando a embalagem não é conversível. */
export function unitPrice(price: number, size?: string | null, unit?: string | null): UnitPrice | null {
  const measure = parseMeasure(size, unit);
  if (!measure || !Number.isFinite(price) || price <= 0) return null;
  return {
    value: Math.round((price / measure.quantity) * 100) / 100,
    base: measure.base,
    label: measure.label,
  };
}

/** Dois produtos só podem ser comparados por preço unitário na MESMA base. */
export function isComparable(a: { size?: string; unit?: string }, b: { size?: string; unit?: string }) {
  const ma = parseMeasure(a.size, a.unit);
  const mb = parseMeasure(b.size, b.unit);
  return Boolean(ma && mb && ma.base === mb.base);
}

// ---------------------------------------------------------------------------
// Frescor do preço — janelas configuráveis por categoria (nunca prazo fixo).
// ---------------------------------------------------------------------------

export type FreshnessState = "fresh" | "aging" | "expired" | "pending";

export type FreshnessWindow = { freshDays: number; expiredDays: number };

export const freshnessWindows: Record<string, FreshnessWindow> = {
  default: { freshDays: 7, expiredDays: 30 },
  Hortifruti: { freshDays: 1, expiredDays: 4 },
  Açougue: { freshDays: 2, expiredDays: 7 },
  Padaria: { freshDays: 1, expiredDays: 4 },
  Laticínios: { freshDays: 3, expiredDays: 10 },
  Combustíveis: { freshDays: 1, expiredDays: 3 },
  Farmácia: { freshDays: 15, expiredDays: 60 },
  Mercearia: { freshDays: 10, expiredDays: 45 },
  Limpeza: { freshDays: 14, expiredDays: 60 },
  Bebidas: { freshDays: 10, expiredDays: 45 },
};

export const windowFor = (category?: string | null): FreshnessWindow =>
  (category && freshnessWindows[category]) || freshnessWindows.default;

export const freshnessLabels: Record<FreshnessState, string> = {
  fresh: "Atualizado",
  aging: "Atualização anterior",
  expired: "Expirado",
  pending: "Aguardando confirmação",
};

export type Freshness = { state: FreshnessState; label: string; days: number };

export function priceFreshness(
  capturedAt?: string | null,
  category?: string | null,
  now: Date = new Date(),
): Freshness {
  if (!capturedAt) return { state: "pending", label: freshnessLabels.pending, days: -1 };
  const captured = new Date(capturedAt).getTime();
  if (!Number.isFinite(captured)) return { state: "pending", label: freshnessLabels.pending, days: -1 };

  const days = Math.max(0, Math.floor((now.getTime() - captured) / 86_400_000));
  const { freshDays, expiredDays } = windowFor(category);
  const state: FreshnessState = days <= freshDays ? "fresh" : days <= expiredDays ? "aging" : "expired";
  return { state, label: freshnessLabels[state], days };
}

/** Formata valor monetário em Real (BRL). */
export function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
