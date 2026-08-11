// Validações puras compartilhadas pelas funções de pagamento Mercado Pago.
// Mantidas sem dependências de runtime para permitir testes automatizados.

export type CheckoutEnv = {
  publicKey?: string | null;
  encryptionKey?: string | null;
};

export type ValidationResult = { ok: true } | { ok: false; status: number; error: string };

export function validateCheckoutEnv(env: CheckoutEnv): ValidationResult {
  if (!env.publicKey || !String(env.publicKey).trim()) {
    return { ok: false, status: 503, error: "A public key do Mercado Pago não está configurada no ambiente." };
  }
  if (!/^(APP_USR|TEST)-/.test(String(env.publicKey).trim())) {
    return { ok: false, status: 503, error: "A public key do Mercado Pago é inválida. Verifique a credencial cadastrada." };
  }
  if (!env.encryptionKey) {
    return { ok: false, status: 503, error: "Integração Mercado Pago não configurada" };
  }
  return { ok: true };
}

export function validateCheckoutBody(body: unknown): ValidationResult {
  const orderId = (body as { orderId?: unknown } | null)?.orderId;
  if (typeof orderId !== "string" || !orderId.trim()) {
    return { ok: false, status: 400, error: "orderId obrigatório" };
  }
  return { ok: true };
}

export function mapPaymentStatus(status?: string | null) {
  switch (status) {
    case "approved":
      return "approved";
    case "refunded":
      return "refunded";
    case "cancelled":
      return "cancelled";
    case "rejected":
      return "rejected";
    default:
      return "pending";
  }
}

// Traduz respostas de erro da API do Mercado Pago em mensagens exibíveis ao usuário.
export function describeMercadoPagoError(status: number, payload: unknown): string {
  const data = (payload ?? {}) as Record<string, any>;
  const detail = data.message || data.error || data.status_detail;
  if (status === 401 || status === 403) return "A conta Mercado Pago do estabelecimento precisa ser reconectada.";
  if (status === 429) return "O Mercado Pago está limitando as solicitações. Tente novamente em instantes.";
  if (status >= 500) return "O Mercado Pago está indisponível no momento. Tente novamente em instantes.";
  return detail ? `Não foi possível iniciar o pagamento: ${detail}` : "Não foi possível iniciar o pagamento.";
}
