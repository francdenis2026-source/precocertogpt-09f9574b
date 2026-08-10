import { Settings2 } from "lucide-react";
import { useLocation } from "react-router-dom";

export function MerchantBusinessSetupShortcut() {
  const location = useLocation();
  if (location.pathname !== "/painel-lojista") return null;

  return (
    <a
      href="/painel-lojista/configurar-negocio"
      title="Configurar tipo de negócio"
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 1000,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 16px",
        borderRadius: 14,
        background: "#0f766e",
        color: "white",
        fontWeight: 850,
        fontSize: 13,
        textDecoration: "none",
        boxShadow: "0 14px 35px rgba(15,118,110,.28)",
        border: "1px solid rgba(255,255,255,.16)",
      }}
    >
      <Settings2 size={17} />
      Configurar meu negócio
    </a>
  );
}
