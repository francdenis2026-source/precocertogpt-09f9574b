import { Boxes, Layers3, Rocket, Settings2 } from "lucide-react";
import { useLocation } from "react-router-dom";

export function MerchantBusinessSetupShortcut() {
  const location = useLocation();
  if (location.pathname !== "/painel-lojista") return null;

  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 15px",
    borderRadius: 13,
    color: "white",
    fontWeight: 850,
    fontSize: 13,
    textDecoration: "none",
    boxShadow: "0 14px 35px rgba(15,56,42,.24)",
    border: "1px solid rgba(255,255,255,.16)",
  };

  return (
    <div style={{ position:"fixed", right:20, bottom:20, zIndex:1000, display:"flex", gap:8, flexWrap:"wrap", justifyContent:"flex-end" }}>
      <a href="/painel-lojista/vendas-online" title="Verificar requisitos e publicar vendas online" style={{...base,background:"#7c3aed"}}>
        <Rocket size={17}/> Vendas online
      </a>
      <a href="/painel-lojista/catalogo" title="Gerenciar cardápio, variações e adicionais" style={{...base,background:"#155e75"}}>
        <Layers3 size={17}/> Estúdio de catálogo
      </a>
      <a href="/painel-lojista/gestao" title="Gerenciar catálogo, entrega, financeiro e equipe" style={{...base,background:"#183d2b"}}>
        <Boxes size={17}/> Gestão da loja
      </a>
      <a href="/painel-lojista/configurar-negocio" title="Configurar tipo de negócio" style={{...base,background:"#0f766e"}}>
        <Settings2 size={17}/> Configurar negócio
      </a>
    </div>
  );
}
