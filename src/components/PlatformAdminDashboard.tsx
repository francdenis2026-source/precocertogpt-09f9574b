import { useEffect, useState } from "react";
import { BadgeDollarSign, Building2, CircleDollarSign, RefreshCcw, ShieldCheck, ShoppingCart, TrendingUp, XCircle } from "lucide-react";
import { loadSessionProfile } from "../lib/roles";
import { loadPlatformSummary, type PlatformSummary } from "../lib/merchantPlatform";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const empty: PlatformSummary = {
  gmvToday: 0,
  platformRevenueToday: 0,
  subscriptionRevenueMonth: 0,
  commissionRevenueToday: 0,
  activeMerchants: 0,
  ordersToday: 0,
  cancelledToday: 0,
  averageTicket: 0,
};

function Card({ label, value, helper, icon: Icon }: { label: string; value: string; helper: string; icon: any }) {
  return <article style={s.card}><div style={s.icon}><Icon size={18} /></div><span style={s.label}>{label}</span><strong style={s.value}>{value}</strong><small style={s.helper}>{helper}</small></article>;
}

export function PlatformAdminDashboard() {
  const [summary, setSummary] = useState(empty);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  async function refresh() { setSummary(await loadPlatformSummary()); }

  useEffect(() => {
    void (async () => {
      const profile = await loadSessionProfile();
      setAuthorized(Boolean(profile?.isAdmin));
      if (profile?.isAdmin) await refresh();
    })();
  }, []);

  if (authorized === null) return <main style={s.center}><RefreshCcw /> Verificando acesso…</main>;
  if (!authorized) return <main style={s.center}><ShieldCheck size={40} /><h1>Acesso administrativo restrito</h1><p>Esta visão é exclusiva da administração do Preço Certo.</p><a href="/" style={s.button}>Voltar</a></main>;

  return <main style={s.page}>
    <header style={s.header}>
      <div><span style={s.kicker}>PREÇO CERTO · ADMINISTRAÇÃO</span><h1 style={s.h1}>Saúde da plataforma</h1><p style={s.helper}>Indicadores agregados. Este painel não dá acesso à operação interna dos estabelecimentos.</p></div>
      <button style={s.secondary} onClick={() => void refresh()}><RefreshCcw size={16} /> Atualizar</button>
    </header>

    <section style={s.banner}><ShieldCheck size={21} /><div><strong>Separação de responsabilidades ativa</strong><p>O administrador acompanha GMV, receita, assinaturas, comissões, estabelecimentos e qualidade operacional sem entrar no painel privado do lojista.</p></div></section>

    <section style={s.grid}>
      <Card label="GMV HOJE" value={brl.format(summary.gmvToday)} helper="volume vendido pela plataforma" icon={TrendingUp} />
      <Card label="COMISSÕES HOJE" value={brl.format(summary.commissionRevenueToday)} helper="receita transacional" icon={CircleDollarSign} />
      <Card label="ASSINATURAS NO MÊS" value={brl.format(summary.subscriptionRevenueMonth)} helper="planos pagos no período" icon={BadgeDollarSign} />
      <Card label="LOJAS ATIVAS" value={String(summary.activeMerchants)} helper="estabelecimentos habilitados" icon={Building2} />
      <Card label="PEDIDOS HOJE" value={String(summary.ordersToday)} helper={`ticket médio ${brl.format(summary.averageTicket)}`} icon={ShoppingCart} />
      <Card label="CANCELADOS HOJE" value={String(summary.cancelledToday)} helper="monitoramento de qualidade" icon={XCircle} />
    </section>

    <section style={s.section}>
      <div><span style={s.kicker}>GOVERNANÇA</span><h2 style={s.h2}>O que a administração controla</h2></div>
      <div style={s.rules}>
        <article><strong>Estabelecimentos</strong><p>Aprovar, suspender, verificar cadastro, acompanhar plano e situação da integração financeira.</p></article>
        <article><strong>Receita da plataforma</strong><p>Assinaturas, comissões e histórico diário, mensal e anual separados do GMV das lojas.</p></article>
        <article><strong>Risco e auditoria</strong><p>Cancelamentos, falhas de pagamento, status operacional, trilhas de auditoria e incidentes.</p></article>
        <article><strong>Sem invasão operacional</strong><p>Preço, estoque, aceite de pedido, equipe e caixa continuam sob controle exclusivo do estabelecimento.</p></article>
      </div>
    </section>
  </main>;
}

const s: Record<string, React.CSSProperties> = {
  page:{minHeight:"100vh",background:"#f5f7f6",padding:"32px clamp(18px,4vw,64px)",fontFamily:"Inter,system-ui,sans-serif",color:"#142019"},header:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:18,maxWidth:1300,margin:"0 auto 20px"},kicker:{fontSize:10,fontWeight:900,letterSpacing:".14em",opacity:.55},h1:{fontSize:"clamp(30px,4vw,48px)",letterSpacing:"-.05em",margin:"6px 0"},h2:{fontSize:26,letterSpacing:"-.03em",margin:"4px 0 18px"},helper:{fontSize:13,color:"#69746d",margin:0},secondary:{background:"white",border:"1px solid #dce2de",borderRadius:11,padding:"10px 14px",display:"flex",gap:7,alignItems:"center",fontWeight:750,cursor:"pointer"},banner:{maxWidth:1300,margin:"0 auto 14px",padding:"16px 18px",borderRadius:15,background:"#edf7f0",border:"1px solid #cfe3d6",display:"flex",gap:12,alignItems:"flex-start"},grid:{maxWidth:1300,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:12},card:{background:"white",border:"1px solid #e0e5e2",borderRadius:16,padding:20,boxShadow:"0 7px 26px rgba(20,50,34,.04)"},icon:{width:38,height:38,borderRadius:12,background:"#eef3ef",display:"grid",placeItems:"center",color:"#173d2b",marginBottom:18},label:{display:"block",fontSize:10,fontWeight:900,letterSpacing:".11em",opacity:.55},value:{display:"block",fontSize:28,letterSpacing:"-.04em",margin:"5px 0"},section:{maxWidth:1300,margin:"14px auto 0",background:"white",border:"1px solid #e0e5e2",borderRadius:17,padding:24},rules:{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10},button:{background:"#183d2b",color:"white",textDecoration:"none",padding:"10px 14px",borderRadius:10},center:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10,textAlign:"center",fontFamily:"Inter,system-ui,sans-serif"}
};
