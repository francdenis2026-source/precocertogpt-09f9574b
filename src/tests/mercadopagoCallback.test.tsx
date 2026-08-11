// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { MercadoPagoCallback } from "../components/MercadoPagoCallback";

const invoke = vi.fn();

vi.mock("../lib/roles", () => ({
  supabase: { functions: { invoke: (...args: unknown[]) => invoke(...args) } },
}));

function setUrl(search: string) {
  window.history.replaceState({}, "", `/mercadopago/callback${search}`);
}

describe("MercadoPagoCallback", () => {
  beforeEach(() => {
    invoke.mockReset();
    sessionStorage.clear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("mostra erro quando os dados da autorização (incluindo credenciais) estão ausentes", async () => {
    setUrl("");
    render(<MercadoPagoCallback />);
    await waitFor(() => expect(screen.getByText("Falha na conexão")).toBeTruthy());
    expect(screen.getByText(/Dados da autorização incompletos/i)).toBeTruthy();
    expect(invoke).not.toHaveBeenCalled();
  });

  it("mostra erro quando falta o merchant na sessão mesmo com code e state", async () => {
    setUrl("?code=abc&state=xyz");
    render(<MercadoPagoCallback />);
    await waitFor(() => expect(screen.getByText("Falha na conexão")).toBeTruthy());
    expect(invoke).not.toHaveBeenCalled();
  });

  it("exibe a mensagem de erro devolvida pela Edge Function e um ID de suporte", async () => {
    setUrl("?code=abc&state=xyz");
    sessionStorage.setItem("pc_mp_merchant_id", "m-1");
    invoke.mockResolvedValue({ data: { error: "Public key ausente no ambiente" }, error: null });

    render(<MercadoPagoCallback />);
    await waitFor(() => expect(screen.getByText("Public key ausente no ambiente")).toBeTruthy());
    expect(screen.getByText(/ID de suporte:/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Tentar novamente/i })).toBeTruthy();
  });

  it("trata erro de transporte da Edge Function (non-2xx)", async () => {
    setUrl("?code=abc&state=xyz");
    sessionStorage.setItem("pc_mp_merchant_id", "m-1");
    invoke.mockResolvedValue({ data: null, error: { message: "Edge Function returned a non-2xx status code" } });

    render(<MercadoPagoCallback />);
    await waitFor(() =>
      expect(screen.getByText("Edge Function returned a non-2xx status code")).toBeTruthy(),
    );
  });

  it("conclui com sucesso e limpa o merchant da sessão", async () => {
    setUrl("?code=abc&state=xyz");
    sessionStorage.setItem("pc_mp_merchant_id", "m-1");
    invoke.mockResolvedValue({ data: { ok: true }, error: null });

    render(<MercadoPagoCallback />);
    await waitFor(() => expect(screen.getByText("Conexão concluída")).toBeTruthy());
    expect(sessionStorage.getItem("pc_mp_merchant_id")).toBeNull();
    expect(invoke).toHaveBeenCalledWith(
      "mercadopago-oauth",
      expect.objectContaining({ body: expect.objectContaining({ action: "callback", merchantId: "m-1" }) }),
    );
  });
});
