import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, CircleDollarSign, ExternalLink, MessageCircle, ShoppingBag, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";
import { loadMerchantMembership } from "../lib/merchantPlatform";

export function AuthorMerchantDashboardWelcome() {
  const { pathname } = useLocation();
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [membership, setMembership] = useState<any>(null);

  useEffect(() => {
    if (!pathname.startsWith("/painel-lojista")) { setHost(null); return; }
    let cancelled = false;
    void (async () => {
      const member = await loadMerchantMembership();
      if (cancelled) return;
      const merchant = member?.merchants as any;
      if (!member || (merchant?.business_type !== "books_author" && !merchant?.service_settings?.author_store)) return;
      setMembership(member);
      const install = () => {
        const main = document.querySelector("main");
        if (!main) return false;
        let el = document.getElementById("pc-author-dashboard-welcome") as HTMLElement | null;
        if (!el) {
          el = document.createElement("div");
          el.id = "pc-author-dashboard-welcome";
          const header = main.querySelector("header");
          if (header?.nextSibling) main.insertBefore(el, header.nextSibling); else main.appendChild(el);
        }
        setHost(el);
        return true;
      };
      if (!install()) {
        const timer = window.setInterval(() => { if (install()) window.clearInterval(timer); }, 120);
        window.setTimeout(() => window.clearInterval(timer), 4000);
      }
    })();
    return () => { cancelled = true; document.getElementById("pc-author-dashboard-welcome")?.remove(); };
  }, [pathname]);

  if (!host || !membership) return null;
  const merchant = membership.merchants as any;
  const direct = Boolean(merchant?.service_settings?.direct_sales_enabled);

  return createPortal(
    <section style={s.card}>
      <div style={s.top}>
        <div>
          <span style={s.eyebrow}><Sparkles size={13}/> ESPAÇO PROFISSIONAL DA AUTORA</span>
          <h2 style={s.title}>Dorinha Barroso</h2>
          <p style={s.lead}>Sua central reúne catálogo de obras, pedidos de leitores, venda direta, estoque de exemplares e acompanhamento financeiro em um único ambiente.</p>
        </div>
        <div style={s.status}><i style={{...s.dot,background:direct?"#34d399":"#fbbf24"}}/><span><b>{direct?"Venda direta ativa":"Venda direta em configuração"}</b><small>{merchant?.online_sales_enabled?"Checkout online ativo":"Pagamento online aguardando conexão financeira"}</small></span></div>
      </div>
      <div style={s.bio}>
        <BookOpen size={22}/><p><strong>Perfil editorial:</strong> escritora acreana, historiadora, pedagoga, psicopedagoga e professora. Este painel foi adaptado para uma operação literária, mantendo as ferramentas financeiras e comerciais do PreçoCerto Marketplace Local.</p>
      </div>
      <div style={s.actions}>
        <a href="/painel-lojista/catalogo" style={s.action}><BookOpen size={18}/><span><b>Minhas obras</b><small>Catálogo, estoque e disponibilidade</small></span></a>
        <a href="/painel-lojista" style={s.action}><ShoppingBag size={18}/><span><b>Pedidos de leitores</b><small>Acompanhar novos atendimentos</small></span></a>
        <a href="/painel-lojista/gestao" style={s.action}><CircleDollarSign size={18}/><span><b>Financeiro</b><small>Vendas, recebimentos e indicadores</small></span></a>
        <a href="/autora/dorinha-barroso" target="_blank" rel="noreferrer" style={s.action}><ExternalLink size={18}/><span><b>Minha loja pública</b><small>Ver como os leitores enxergam sua página</small></span></a>
      </div>
      <div style={s.footer}><MessageCircle size={16}/><span>Atendimento direto configurado pelo WhatsApp da autora. Valores dos livros podem ser definidos no catálogo quando desejar habilitar checkout completo.</span></div>
    </section>,
    host,
  );
}

const s:Record<string,React.CSSProperties>={
  card:{marginBottom:16,padding:"22px clamp(18px,2.4vw,28px)",borderRadius:18,background:"linear-gradient(135deg,#261830,#3b2446 68%,#573951)",color:"white",boxShadow:"0 16px 44px rgba(35,22,43,.14)"},
  top:{display:"flex",justifyContent:"space-between",gap:24,alignItems:"flex-start",flexWrap:"wrap"},eyebrow:{display:"inline-flex",alignItems:"center",gap:6,fontSize:10,fontWeight:900,letterSpacing:".13em",color:"#e8ca91"},title:{fontFamily:"Georgia,serif",fontSize:"clamp(27px,3vw,40px)",margin:"7px 0",letterSpacing:"-.035em"},lead:{maxWidth:750,color:"#d4c9d7",fontSize:13,lineHeight:1.65,margin:0},status:{display:"flex",gap:9,alignItems:"center",padding:"11px 13px",border:"1px solid rgba(255,255,255,.13)",borderRadius:12,background:"rgba(255,255,255,.055)"},dot:{width:9,height:9,borderRadius:"50%"},bio:{display:"flex",gap:10,alignItems:"flex-start",padding:"14px 0",marginTop:18,borderTop:"1px solid rgba(255,255,255,.1)",color:"#d9cedc",fontSize:12,lineHeight:1.6},actions:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:8},action:{display:"flex",alignItems:"center",gap:10,padding:13,borderRadius:12,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.08)",color:"white",textDecoration:"none"},footer:{display:"flex",gap:8,alignItems:"center",marginTop:13,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.09)",color:"#bfb1c3",fontSize:11},
};
