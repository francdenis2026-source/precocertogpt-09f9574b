import { describe, it, expect } from "vitest";
import { describePaymentNotification } from "../lib/paymentNotifications";

const base = { id: "o1", order_number: 1234, customer_email: "a@b.com", total: 150.5 };

describe("Notificações de pagamento PIX", () => {
  it("descreve aprovação com número do pedido e valor formatado", () => {
    const info = describePaymentNotification({ ...base, payment_status: "approved" })!;
    expect(info.type).toBe("success");
    expect(info.message).toContain("#1234");
    expect(info.message).toMatch(/R\$\s?150,50/);
  });

  it("descreve falha e recusa", () => {
    expect(describePaymentNotification({ ...base, payment_status: "rejected" })!.type).toBe("error");
    expect(describePaymentNotification({ ...base, payment_status: "cancelled" })!.type).toBe("error");
    expect(describePaymentNotification({ ...base, payment_status: "refunded" })!.type).toBe("warning");
  });

  it("ignora status pendentes", () => {
    expect(describePaymentNotification({ ...base, payment_status: "pending" })).toBeNull();
    expect(describePaymentNotification({ ...base, payment_status: null })).toBeNull();
  });
});
