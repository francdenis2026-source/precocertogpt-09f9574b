import { supabase } from "../lib/supabase";

export type PriceReportInput = {
  productId: string;
  establishmentId?: string | null;
  reportedPrice?: number | null;
  reason: string;
  comment?: string;
};

export const priceReportReasons = [
  "Preço maior na loja",
  "Preço menor na loja",
  "Produto indisponível",
  "Produto não existe nesta loja",
  "Promoção encerrada",
  "Outro motivo",
];

/** Envia uma denúncia de preço. Visitantes também podem enviar (policy anon). */
export async function submitPriceReport(input: PriceReportInput) {
  if (!supabase) return { ok: false, error: "Banco não configurado." };

  const { data: sessionData } = await supabase.auth.getSession();
  const reporterId = sessionData.session?.user?.id ?? null;

  const { error } = await supabase.from("price_reports").insert({
    product_id: String(input.productId),
    establishment_id: input.establishmentId ? String(input.establishmentId) : null,
    reported_price: input.reportedPrice ?? null,
    reason: input.reason,
    comment: input.comment ?? null,
    reporter_id: reporterId,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true, error: null };
}
