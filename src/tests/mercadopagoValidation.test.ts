import { describe, it, expect } from "vitest";
import {
  describeMercadoPagoError,
  mapPaymentStatus,
  validateCheckoutBody,
  validateCheckoutEnv,
} from "../../supabase/functions/_shared/mercadopagoValidation";

describe("Edge Function de checkout — validações de ambiente", () => {
  it("falha quando a public key está ausente", () => {
    const result = validateCheckoutEnv({ publicKey: "", encryptionKey: "k" });
    expect(result).toEqual({
      ok: false,
      status: 503,
      error: "A public key do Mercado Pago não está configurada no ambiente.",
    });
  });

  it("falha quando a public key tem formato inválido", () => {
    const result = validateCheckoutEnv({ publicKey: "chave-qualquer", encryptionKey: "k" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("inválida");
  });

  it("falha quando a chave de criptografia está ausente", () => {
    const result = validateCheckoutEnv({ publicKey: "APP_USR-abc", encryptionKey: null });
    expect(result).toEqual({ ok: false, status: 503, error: "Integração Mercado Pago não configurada" });
  });

  it("aceita credenciais de produção e de teste", () => {
    expect(validateCheckoutEnv({ publicKey: "APP_USR-abc", encryptionKey: "k" })).toEqual({ ok: true });
    expect(validateCheckoutEnv({ publicKey: "TEST-abc", encryptionKey: "k" })).toEqual({ ok: true });
  });

  it("exige orderId no corpo da requisição", () => {
    expect(validateCheckoutBody({}).ok).toBe(false);
    expect(validateCheckoutBody({ orderId: "   " }).ok).toBe(false);
    expect(validateCheckoutBody({ orderId: "abc" })).toEqual({ ok: true });
  });
});

describe("Edge Function de checkout — respostas de erro da API", () => {
  it("mapeia falha de autorização para pedido de reconexão", () => {
    expect(describeMercadoPagoError(401, {})).toContain("reconectada");
    expect(describeMercadoPagoError(403, {})).toContain("reconectada");
  });

  it("mapeia rate limit e indisponibilidade", () => {
    expect(describeMercadoPagoError(429, {})).toContain("limitando");
    expect(describeMercadoPagoError(503, {})).toContain("indisponível");
  });

  it("propaga a mensagem detalhada do provedor", () => {
    expect(describeMercadoPagoError(400, { message: "invalid items" })).toBe(
      "Não foi possível iniciar o pagamento: invalid items",
    );
    expect(describeMercadoPagoError(400, {})).toBe("Não foi possível iniciar o pagamento.");
  });

  it("normaliza status de pagamento", () => {
    expect(mapPaymentStatus("approved")).toBe("approved");
    expect(mapPaymentStatus("rejected")).toBe("rejected");
    expect(mapPaymentStatus("in_process")).toBe("pending");
    expect(mapPaymentStatus(null)).toBe("pending");
  });
});
