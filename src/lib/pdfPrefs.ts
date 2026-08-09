import type { PdfOrientation } from "./basketPdf";

const KEY = "precocerto:pdf_orientation";

/** Chave por usuário (email/id) — visitantes anônimos usam um espaço próprio. */
function keyFor(userKey?: string | null) {
  return `${KEY}:${userKey || "anon"}`;
}

export function getPdfOrientation(userKey?: string | null): PdfOrientation {
  try {
    const saved = localStorage.getItem(keyFor(userKey));
    return saved === "landscape" ? "landscape" : "portrait";
  } catch {
    return "portrait";
  }
}

export function setPdfOrientation(orientation: PdfOrientation, userKey?: string | null) {
  try {
    localStorage.setItem(keyFor(userKey), orientation);
  } catch {
    /* armazenamento indisponível: mantém apenas em memória */
  }
}
