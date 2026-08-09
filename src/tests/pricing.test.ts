import { describe, expect, it } from "vitest";
import { isComparable, parseMeasure, priceFreshness, unitPrice } from "../lib/pricing";

describe("parseMeasure", () => {
  it("converte gramas para kg", () => {
    expect(parseMeasure("500 g")).toEqual({ quantity: 0.5, base: "kg", label: "kg" });
  });

  it("converte ml para litros", () => {
    expect(parseMeasure("900 ml")).toEqual({ quantity: 0.9, base: "L", label: "L" });
  });

  it("entende quilo sem número", () => {
    expect(parseMeasure("", "quilo")).toEqual({ quantity: 1, base: "kg", label: "kg" });
  });

  it("multiplica embalagens múltiplas", () => {
    expect(parseMeasure("6 x 350 ml")?.quantity).toBeCloseTo(2.1);
  });

  it("retorna null quando não é conversível", () => {
    expect(parseMeasure("cesta especial")).toBeNull();
  });
});

describe("unitPrice", () => {
  it("calcula R$/kg de um pacote de 5 kg", () => {
    expect(unitPrice(29.9, "5 kg")).toEqual({ value: 5.98, base: "kg", label: "kg" });
  });

  it("calcula R$/L de 900 ml", () => {
    expect(unitPrice(9, "900 ml")).toEqual({ value: 10, base: "L", label: "L" });
  });

  it("não calcula quando a embalagem é desconhecida", () => {
    expect(unitPrice(10, "kit variado")).toBeNull();
  });
});

describe("isComparable", () => {
  it("compara apenas bases iguais", () => {
    expect(isComparable({ size: "1 kg" }, { size: "500 g" })).toBe(true);
    expect(isComparable({ size: "1 kg" }, { size: "1 L" })).toBe(false);
  });
});

describe("priceFreshness", () => {
  const now = new Date("2026-08-10T12:00:00Z");

  it("hortifruti expira mais rápido que mercearia", () => {
    const capturedAt = "2026-08-05T12:00:00Z"; // 5 dias
    expect(priceFreshness(capturedAt, "Hortifruti", now).state).toBe("expired");
    expect(priceFreshness(capturedAt, "Mercearia", now).state).toBe("fresh");
  });

  it("usa janela padrão para categoria desconhecida", () => {
    expect(priceFreshness("2026-08-09T12:00:00Z", "Bazar", now).state).toBe("fresh");
    expect(priceFreshness("2026-06-01T12:00:00Z", "Bazar", now).state).toBe("expired");
  });

  it("sem data fica aguardando confirmação", () => {
    expect(priceFreshness(null, "Mercearia", now).state).toBe("pending");
  });
});
