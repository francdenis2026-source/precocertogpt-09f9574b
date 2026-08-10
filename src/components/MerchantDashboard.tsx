import { useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  LayoutDashboard,
  MapPin,
  PackageCheck,
  PackageSearch,
  RefreshCcw,
  Settings,
  ShoppingBag,
  Store,
  Truck,
  Users,
  WalletCards,
} from "lucide-react";
import {
  getMercadoPagoConnectUrl,
  loadMerchantMembership,
  loadMerchantOrders,
  loadMerchantSummary,
  subscribeMerchantOrders,
  updateOrderStatus,
  type MerchantOrder,
  type MerchantSummary,
  type OrderStatus,
} from "../lib/merchantPlatform";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateTime = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

const statusLabel: Record<OrderStatus, string> = {
  pending_payment: "Aguardando pagamento",
  paid: "Novo pedido",
  accepted: "Aceito",
  preparing: "Preparando",
  ready: "Pronto",
  out_for_delivery: "Em entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  paid: "accepted",
  accepted: "preparing",
  preparing: "ready",
  ready: "out_for_delivery",
  out_for_delivery: "delivered",
};

const nextLabel: Partial<Record<OrderStatus, string>> = {
  paid: "Aceitar pedido",
  accepted: "Iniciar separação",
  preparing: "Marcar como pronto",
  ready: "Saiu para entrega",
  out_for_delivery: "Confirmar entrega",
};

type Tab = "overview" | "orders" | "catalog" | "finance" | "delivery" | "payments" | "team" | "settings";

const emptySummary: MerchantSummary = {
  merchantId: "",
  merchantName: "Painel do Comerciante",
  todayGross: 0,
  todayOrders: 0,
  pendingOrders: 0,
  preparingOrders: 0,
  deliveryOrders: 0,
  averageTicket: 0,
  lowStock: 0,
};

function Metric({ label, value, helper, icon: Icon }: { label: string; value: string; helper: string; icon: any }) {
  return (
    <article style={styles.metric}>
      <div style={styles.metricIcon}><Icon size={18} /></div>
      <div><span style={styles.eyebrow}>{label}</span><strong style={styles.metricValue}>{value}</strong><small style={styles.muted}>{helper}</small></div>
    </article>
  );
}

function OrderCard({ order, onAdvance }: { order: MerchantOrder; onAdvance: (order: MerchantOrder) => void }) {
  const address = order.delivery_address;
  return (
    <article style={styles.orderCard}>
      <div style={styles.orderTop}>
        <div>
          <span style={styles.orderNumber}>#{order.order_number}</span>
          <h3 style={styles.orderTitle}>{order.customer_name}</h3>
          <small style={styles.muted}>{dateTime.format(new Date(order.created_at))}</small>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={styles.status}>{statusLabel[order.status]}</span>
          <strong style={styles.orderTotal}>{brl.format(order.total)}</strong>
        </div>
      </div>
      <div style={styles.orderInfoGrid}>
        <div><span style={styles.eyebrow}>Contato</span><strong>{order.customer_phone || order.customer_email || "Não informado"}</strong></div>
        <div><span style={styles.eyebrow}>Entrega</span><strong>{order.delivery_type === "pickup" ? "Retirada na loja" : address ? `${address.street ?? ""}, ${address.number ?? ""} · ${address.neighborhood ?? ""}` : "Endereço não informado"}</strong></div>
        <div><span style={styles.eyebrow}>Pagamento</span><strong>{order.payment_provider || "A definir"} · {order.payment_status}</strong></div>
      </div>
      {!!order.items?.length && (
        <div style={styles.itemList}>
          {order.items.slice(0, 4).map(item => <div key={item.id} style={styles.itemRow}><span>{item.quantity}× {item.product_name}</span><strong>{brl.format(item.total_price)}</strong></div>)}
          {order.items.length > 4 && <small style={styles.muted}>+ {order.items.length - 4} itens</small>}
        </div>
      )}
      <div style={styles.orderFooter}>
        <div style={styles.totalBreakdown}><span>Produtos {brl.format(order.subtotal)}</span><span>Entrega {brl.format(order.delivery_fee)}</span></div>
        {nextStatus[order.status] && <button style={styles.primaryButton} onClick={() => onAdvance(order)}>{nextLabel[order.status]} <ChevronRight size={16} /></button>}
      </div>
    </article>
  );
}

export function MerchantDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [membership, setMembership] = useState<any>(null);
  const [orders, setOrders] = useState<MerchantOrder[]>([]);
  const [summary, setSummary] = useState<MerchantSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const merchantId = membership?.merchant_id ?? "";
  const merchantName = membership?.merchants?.name || "Meu estabelecimento";

  async function refresh() {
    if (!merchantId) return;
    const [orderRows, summaryRow] = await Promise.all([
      loadMerchantOrders(merchantId),
      loadMerchantSummary(merchantId, merchantName),
    ]);
    setOrders(orderRows);
    setSummary(summaryRow);
  }

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    void (async () => {
      setLoading(true);
      const member = await loadMerchantMembership();
      setMembership(member);
      setLoading(false);
      if (!member?.merchant_id) return;
      const merchant = member.merchants as any;
      const [orderRows, summaryRow] = await Promise.all([
        loadMerchantOrders(member.merchant_id),
        loadMerchantSummary(member.merchant_id, merchant?.name || "Meu estabelecimento"),
      ]);
      setOrders(orderRows);
      setSummary(summaryRow);
      cleanup = subscribeMerchantOrders(member.merchant_id, () => {
        refresh();
      });
    })();
    return () => {
      if (cleanup) cleanup();
    };
  }, [merchantId]);

  const grouped = useMemo(() => ({
    new: orders.filter(order => ["paid", "accepted"].includes(order.status)),
    preparing: orders.filter(order => order.status === "preparing"),
    ready: orders.filter(order => order.status === "ready"),
    delivery: orders.filter(order => order.status === "out_for_delivery"),
  }), [orders]);

  async function advance(order: MerchantOrder) {
    const status = nextStatus[order.status];
    if (!status) return;
    const result = await updateOrderStatus(order.id, status);
    setNotice(result.error ? `Não foi possível atualizar: ${result.error}` : `Pedido #${order.order_number} atualizado.`);
    await refresh();
  }

  async function connectMercadoPago() {
    if (!merchantId) return;
    const result = await getMercadoPagoConnectUrl(merchantId);
    if (result.url) window.location.assign(result.url);
    else setNotice(result.error || "Integração ainda não configurada no backend.");
  }

  const nav: Array<[Tab, string, any]> = [
    ["overview", "Visão geral", LayoutDashboard], ["orders", "Pedidos ao vivo", ShoppingBag], ["catalog", "Catálogo e estoque", Boxes],
    ["finance", "Financeiro", CircleDollarSign], ["delivery", "Entregas", Truck], ["payments", "Pagamentos", CreditCard],
    ["team", "Equipe", Users], ["settings", "Configurações", Settings],
  ];

  if (loading) return <main style={styles.center}><RefreshCcw className="spin" /> Carregando painel…</main>;
  if (!membership) return <main style={styles.center}><Store size={42} /><h1>Painel do Comerciante</h1><p>Entre com uma conta vinculada a um estabelecimento para acessar a operação.</p><a href="/lojista" style={styles.primaryButton}>Cadastrar estabelecimento</a></main>;

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <a href="/" style={styles.brand}><img src="/logo-preco-certo-inversa.svg" alt="Preço Certo" style={{ width: 150 }} /></a>
        <div style={styles.storeIdentity}><div style={styles.storeAvatar}><Store size={20} /></div><div><strong>{merchantName}</strong><small style={styles.sidebarMuted}>{membership?.merchants?.plan_code || "Plano ativo"}</small></div></div>
        <nav style={styles.nav}>{nav.map(([key, label, Icon]) => <button key={key} onClick={() => setTab(key)} style={{ ...styles.navButton, ...(tab === key ? styles.navActive : {}) }}><Icon size={18} /> {label}</button>)}</nav>
        <a href="/" style={styles.backLink}>← Voltar ao Preço Certo</a>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}><div><span style={styles.eyebrow}>CENTRAL DO COMERCIANTE</span><h1 style={styles.h1}>{tab === "overview" ? "Operação em tempo real" : nav.find(x => x[0] === tab)?.[1]}</h1><p style={styles.muted}>{merchantName} · dados do seu estabelecimento isolados por permissão.</p></div><button style={styles.secondaryButton} onClick={() => void refresh()}><RefreshCcw size={16} /> Atualizar</button></header>
        {notice && <div style={styles.notice}>{notice}<button onClick={() => setNotice("")} style={styles.close}>×</button></div>}

        {tab === "overview" && <>
          <section style={styles.metrics}>
            <Metric label="VENDAS HOJE" value={brl.format(summary.todayGross)} helper={`${summary.todayOrders} pedidos hoje`} icon={BadgeDollarSign} />
            <Metric label="TICKET MÉDIO" value={brl.format(summary.averageTicket)} helper="pedidos válidos" icon={WalletCards} />
            <Metric label="AGUARDANDO" value={String(summary.pendingOrders)} helper="pedidos para agir" icon={Clock3} />
            <Metric label="EM ENTREGA" value={String(summary.deliveryOrders)} helper={`${summary.lowStock} itens com estoque baixo`} icon={Truck} />
          </section>
          <section style={styles.section}><div style={styles.sectionHead}><div><span style={styles.eyebrow}>LIVE</span><h2 style={styles.h2}>Fila operacional</h2></div><span style={styles.live}><i /> atualizando em tempo real</span></div>
            <div style={styles.kanban}>
              {[ ["Novos", grouped.new, ShoppingBag], ["Preparando", grouped.preparing, PackageSearch], ["Prontos", grouped.ready, PackageCheck], ["Em entrega", grouped.delivery, Truck] ].map(([label, rows, Icon]: any) => <div key={label} style={styles.kanbanCol}><div style={styles.kanbanTitle}><span><Icon size={16} /> {label}</span><b>{rows.length}</b></div>{rows.slice(0, 5).map((order: MerchantOrder) => <button key={order.id} onClick={() => setTab("orders")} style={styles.miniOrder}><span><strong>#{order.order_number}</strong><small>{order.customer_name}</small></span><b>{brl.format(order.total)}</b></button>)}{!rows.length && <div style={styles.empty}>Nenhum pedido</div>}</div>)}
            </div>
          </section>
        </>}

        {tab === "orders" && <section style={styles.section}><div style={styles.sectionHead}><div><span style={styles.eyebrow}>PEDIDOS</span><h2 style={styles.h2}>Compras recebidas</h2></div><strong>{orders.length} recentes</strong></div><div style={styles.orderGrid}>{orders.map(order => <OrderCard key={order.id} order={order} onAdvance={advance} />)}{!orders.length && <div style={styles.emptyLarge}>Os novos pedidos aparecerão aqui assim que forem criados.</div>}</div></section>}

        {tab === "catalog" && <InfoPage icon={Boxes} title="Catálogo e estoque" description="Gestão do catálogo próprio da loja sobre o catálogo mestre do Preço Certo." bullets={["Ativar produtos do catálogo mestre", "Definir preço, promoção e disponibilidade", "Controlar estoque e alerta de estoque baixo", "Acompanhar produtos sem imagem e indisponíveis"]} />}
        {tab === "finance" && <InfoPage icon={CircleDollarSign} title="Financeiro" description="Visão financeira exclusiva do estabelecimento, sem acesso operacional do administrador da plataforma." bullets={["Vendas brutas, líquidas, taxas e comissões", "Diário, semanal, mensal e anual", "Pagamentos, reembolsos e cancelamentos", "Ticket médio e produtos mais vendidos"]} />}
        {tab === "delivery" && <InfoPage icon={MapPin} title="Entregas" description="Regras de entrega calculadas antes do pagamento e compartilhadas com cliente e loja." bullets={["Taxa por bairro ou zona", "Pedido mínimo e entrega grátis por faixa", "Retirada na loja ou entrega própria", "Prazo estimado e linha do tempo da entrega"]} />}
        {tab === "payments" && <section style={styles.section}><div style={styles.paymentHero}><div style={styles.paymentIcon}><CreditCard size={28} /></div><div><span style={styles.eyebrow}>RECEBIMENTOS</span><h2 style={styles.h2}>Conectar conta Mercado Pago</h2><p style={styles.muted}>A conexão usa OAuth. Credenciais secretas do lojista não são digitadas nem armazenadas no navegador.</p></div><button style={styles.primaryButton} onClick={() => void connectMercadoPago()}>Conectar Mercado Pago <ChevronRight size={16} /></button></div><div style={styles.infoGrid}><InfoBox title="Split do marketplace" text="Estrutura pronta para separar a comissão do Preço Certo do valor destinado ao vendedor." /><InfoBox title="Webhooks" text="Mudanças de pagamento alimentam o status do pedido e o painel ao vivo." /><InfoBox title="Conciliação" text="Cada pagamento registra provedor, ID externo, valor, taxas e situação." /></div></section>}
        {tab === "team" && <InfoPage icon={Users} title="Equipe e permissões" description="Funcionários usam contas próprias, sem compartilhar a senha do proprietário." bullets={["Proprietário: acesso completo", "Gerente: operação e estoque", "Pedidos: atendimento e separação", "Estoque: produtos e inventário"]} />}
        {tab === "settings" && <InfoPage icon={Settings} title="Configurações da loja" description="Central para dados comerciais, horários, regras de atendimento e integrações." bullets={["Dados públicos e contato", "Horário de funcionamento", "Política de cancelamento", "Preferências de pedido, estoque e entrega"]} />}
      </main>
    </div>
  );
}

function InfoPage({ icon: Icon, title, description, bullets }: { icon: any; title: string; description: string; bullets: string[] }) {
  return <section style={styles.section}><div style={styles.infoHero}><div style={styles.bigIcon}><Icon size={30} /></div><div><span style={styles.eyebrow}>MÓDULO COMERCIAL</span><h2 style={styles.h2}>{title}</h2><p style={styles.muted}>{description}</p></div></div><div style={styles.infoGrid}>{bullets.map((text, index) => <InfoBox key={text} title={`${String(index + 1).padStart(2, "0")}`} text={text} />)}</div></section>;
}

function InfoBox({ title, text }: { title: string; text: string }) { return <article style={styles.infoBox}><strong>{title}</strong><p>{text}</p><CheckCircle2 size={18} /></article>; }

const styles: Record<string, React.CSSProperties> = {
  shell:{minHeight:"100vh",display:"grid",gridTemplateColumns:"250px minmax(0,1fr)",background:"#f6f7f9",color:"#152019",fontFamily:"Inter,system-ui,sans-serif"},
  sidebar:{background:"#10251b",color:"white",padding:"22px 16px",display:"flex",flexDirection:"column",gap:20,minHeight:"100vh",position:"sticky",top:0,height:"100vh"},brand:{display:"block",padding:"6px 8px"},storeIdentity:{display:"flex",alignItems:"center",gap:10,padding:"14px 10px",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,background:"rgba(255,255,255,.04)"},storeAvatar:{width:38,height:38,borderRadius:12,display:"grid",placeItems:"center",background:"#e8ff66",color:"#10251b"},sidebarMuted:{display:"block",opacity:.62,marginTop:3},nav:{display:"grid",gap:5},navButton:{border:0,background:"transparent",color:"rgba(255,255,255,.75)",borderRadius:10,padding:"11px 12px",display:"flex",alignItems:"center",gap:10,textAlign:"left",cursor:"pointer",fontWeight:650},navActive:{background:"#e8ff66",color:"#10251b"},backLink:{marginTop:"auto",color:"rgba(255,255,255,.72)",textDecoration:"none",padding:10,fontSize:13},main:{padding:"28px clamp(18px,3vw,42px)",minWidth:0},header:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:20,marginBottom:22},h1:{fontSize:"clamp(27px,3vw,40px)",letterSpacing:"-.04em",margin:"5px 0"},h2:{fontSize:"clamp(21px,2vw,28px)",letterSpacing:"-.03em",margin:"4px 0 7px"},eyebrow:{display:"block",fontSize:10,fontWeight:850,letterSpacing:".12em",opacity:.55},muted:{color:"#68736c",fontSize:13},secondaryButton:{border:"1px solid #d8ddda",background:"white",borderRadius:11,padding:"10px 14px",display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontWeight:700},primaryButton:{border:0,background:"#183d2b",color:"white",borderRadius:11,padding:"11px 15px",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,cursor:"pointer",fontWeight:800,textDecoration:"none"},notice:{padding:"12px 14px",background:"#eefbd9",border:"1px solid #cce99a",borderRadius:12,marginBottom:16,display:"flex",justifyContent:"space-between"},close:{border:0,background:"transparent",cursor:"pointer",fontSize:18},metrics:{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:12,marginBottom:16},metric:{background:"white",border:"1px solid #e2e6e3",borderRadius:16,padding:18,display:"flex",gap:13,boxShadow:"0 6px 24px rgba(17,41,29,.04)"},metricIcon:{width:38,height:38,borderRadius:12,display:"grid",placeItems:"center",background:"#eff4f0",color:"#183d2b"},metricValue:{display:"block",fontSize:22,margin:"4px 0 3px",letterSpacing:"-.03em"},section:{background:"white",border:"1px solid #e2e6e3",borderRadius:18,padding:"clamp(16px,2.2vw,26px)",boxShadow:"0 8px 30px rgba(17,41,29,.04)"},sectionHead:{display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,marginBottom:18},live:{display:"flex",alignItems:"center",gap:7,fontSize:12,fontWeight:700,color:"#33714d"},kanban:{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:10},kanbanCol:{padding:10,background:"#f7f9f7",borderRadius:14,minHeight:180},kanbanTitle:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 4px 10px",fontSize:13,fontWeight:800},miniOrder:{width:"100%",border:"1px solid #e1e5e2",background:"white",borderRadius:10,padding:"10px",display:"flex",justifyContent:"space-between",alignItems:"center",textAlign:"left",marginBottom:7,cursor:"pointer"},empty:{padding:22,textAlign:"center",fontSize:12,color:"#8b948f"},orderGrid:{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:14},orderCard:{border:"1px solid #dfe4e1",borderRadius:15,padding:17},orderTop:{display:"flex",justifyContent:"space-between",gap:14},orderNumber:{fontSize:11,fontWeight:850,color:"#357451"},orderTitle:{fontSize:18,margin:"3px 0"},status:{display:"inline-block",fontSize:11,fontWeight:800,background:"#eefbd9",padding:"5px 8px",borderRadius:999},orderTotal:{display:"block",fontSize:18,marginTop:7},orderInfoGrid:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,margin:"15px 0",padding:"12px 0",borderTop:"1px solid #edf0ee",borderBottom:"1px solid #edf0ee",fontSize:12},itemList:{display:"grid",gap:5},itemRow:{display:"flex",justifyContent:"space-between",fontSize:12},orderFooter:{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:12,marginTop:15},totalBreakdown:{display:"grid",gap:3,fontSize:11,color:"#707b74"},emptyLarge:{padding:50,textAlign:"center",color:"#77827b",gridColumn:"1/-1"},infoHero:{display:"flex",alignItems:"center",gap:16,marginBottom:22},bigIcon:{width:58,height:58,borderRadius:18,display:"grid",placeItems:"center",background:"#e8ff66",color:"#173a29"},infoGrid:{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:12},infoBox:{position:"relative",border:"1px solid #e2e6e3",borderRadius:14,padding:17,minHeight:120},paymentHero:{display:"flex",alignItems:"center",gap:16,justifyContent:"space-between",marginBottom:24},paymentIcon:{width:58,height:58,borderRadius:18,display:"grid",placeItems:"center",background:"#eaf3ff",color:"#2367a8"},center:{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,padding:30,textAlign:"center",fontFamily:"Inter,system-ui,sans-serif"}
};
