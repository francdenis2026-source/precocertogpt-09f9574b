import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, Clock3, CreditCard, MapPin, PackageCheck, ShoppingBag, Truck } from "lucide-react";
import { supabase } from "../lib/roles";
import { startMercadoPagoCheckout, type MerchantOrder, type OrderStatus } from "../lib/merchantPlatform";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const steps: Array<{ status: OrderStatus; label: string; icon: any }> = [
  { status: "paid", label: "Pagamento confirmado", icon: CheckCircle2 },
  { status: "accepted", label: "Loja confirmou", icon: ShoppingBag },
  { status: "preparing", label: "Separando produtos", icon: Clock3 },
  { status: "ready", label: "Pedido pronto", icon: PackageCheck },
  { status: "out_for_delivery", label: "Saiu para entrega", icon: Truck },
  { status: "delivered", label: "Entregue", icon: CheckCircle2 },
];
const rank: Record<OrderStatus, number> = { pending_payment: 0, paid: 1, accepted: 2, preparing: 3, ready: 4, out_for_delivery: 5, delivered: 6, cancelled: -1 };

export function CustomerOrders() {
  const [orders, setOrders] = useState<MerchantOrder[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    if (!supabase) return;
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user?.id;
    if (!userId) { setLoading(false); return; }
    const { data } = await supabase.from("orders").select("*, order_items(*)").eq("customer_id", userId).order("created_at", { ascending: false }).limit(50);
    const rows = (data ?? []).map((row: any) => ({ ...row, subtotal:Number(row.subtotal||0), delivery_fee:Number(row.delivery_fee||0), discount:Number(row.discount||0), platform_fee:Number(row.platform_fee||0), total:Number(row.total||0), items:(row.order_items ?? []).map((item:any)=>({...item,quantity:Number(item.quantity||0),unit_price:Number(item.unit_price||0),total_price:Number(item.total_price||0)})) })) as MerchantOrder[];
    setOrders(rows);
    setSelected(current => current || rows[0]?.id || null);
    setLoading(false);
  }

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let channel: any;
    void (async () => {
      await load();
      const { data: session } = await supabase!.auth.getSession();
      const userId = session.session?.user?.id;
      if (!userId) return;
      channel = supabase!.channel(`customer-orders-${userId}`).on("postgres_changes", { event:"*", schema:"public", table:"orders", filter:`customer_id=eq.${userId}` }, () => void load()).subscribe();
    })();
    return () => { if (channel && supabase) void supabase.removeChannel(channel); };
  }, []);

  const order = useMemo(() => orders.find(row => row.id === selected) ?? orders[0], [orders, selected]);
  async function pay(orderId:string){setPaying(orderId);setNotice("");const result=await startMercadoPagoCheckout(orderId);if(result.url){window.location.assign(result.url);return}setNotice(result.error||"O pagamento online ainda não está disponível para este pedido.");setPaying("");}

  if (loading) return <main style={s.center}>Carregando seus pedidos…</main>;
  if (!orders.length) return <main style={s.center}><ShoppingBag size={42}/><h1>Seus pedidos</h1><p>Quando você concluir uma compra, o acompanhamento aparecerá aqui.</p><a href="/" style={s.button}>Pesquisar produtos</a></main>;

  return <main style={s.page}>
    <header style={s.header}><a href="/"><img src="/logo-preco-certo.svg" alt="Preço Certo" style={{width:150}}/></a><div><span style={s.kicker}>MINHAS COMPRAS</span><h1 style={s.h1}>Acompanhe seu pedido</h1></div></header>
    {notice&&<div style={s.notice}>{notice}</div>}
    <div style={s.layout}>
      <aside style={s.list}><span style={s.kicker}>PEDIDOS RECENTES</span>{orders.map(item => <button key={item.id} onClick={() => setSelected(item.id)} style={{...s.orderButton,...(item.id===order?.id?s.orderActive:{})}}><span><strong>#{item.order_number}</strong><small>{dateTime.format(new Date(item.created_at))}</small></span><b>{brl.format(item.total)}</b></button>)}</aside>
      {order && <section style={s.detail}>
        <div style={s.detailTop}><div><span style={s.kicker}>PEDIDO #{order.order_number}</span><h2 style={s.h2}>{order.status === "cancelled" ? "Pedido cancelado" : order.status === "delivered" ? "Pedido entregue" : order.status === "pending_payment" ? "Finalize o pagamento" : "Seu pedido está em andamento"}</h2></div><div style={{textAlign:"right"}}><strong style={s.total}>{brl.format(order.total)}</strong>{order.status==="pending_payment"&&<button disabled={paying===order.id} onClick={()=>void pay(order.id)} style={s.payButton}><CreditCard size={16}/>{paying===order.id?"Abrindo pagamento…":"Pagar agora"}</button>}</div></div>
        {order.status !== "cancelled" && <div style={s.timeline}>{steps.map((step,index) => { const done = rank[order.status] >= rank[step.status]; const current = rank[order.status] === rank[step.status]; const Icon = step.icon; return <div key={step.status} style={s.step}><div style={{...s.dot,...(done?s.dotDone:{})}}>{done?<Icon size={16}/>:<Circle size={14}/>}</div><div><strong>{step.label}</strong><small style={s.muted}>{current?"Etapa atual":done?"Concluída":"Aguardando"}</small></div>{index<steps.length-1 && <i style={{...s.line,...(done?s.lineDone:{})}}/>}</div>; })}</div>}
        <div style={s.cards}>
          <article style={s.info}><MapPin size={18}/><div><span style={s.kicker}>ENTREGA</span><strong>{order.delivery_type === "pickup" ? "Retirada no estabelecimento" : order.delivery_address ? `${order.delivery_address.street ?? ""}, ${order.delivery_address.number ?? ""} · ${order.delivery_address.neighborhood ?? ""}` : "Endereço informado no pedido"}</strong><small style={s.muted}>Taxa: {brl.format(order.delivery_fee)}</small></div></article>
          <article style={s.info}><ShoppingBag size={18}/><div><span style={s.kicker}>PAGAMENTO</span><strong>{order.payment_provider || "Pagamento"}</strong><small style={s.muted}>Situação: {order.payment_status}</small></div></article>
        </div>
        <div style={s.items}><div style={s.itemsHead}><strong>Itens da compra</strong><span>{order.items?.length || 0} itens</span></div>{order.items?.map(item => <div key={item.id} style={s.item}><span>{item.quantity}× {item.product_name}</span><strong>{brl.format(Number(item.total_price))}</strong></div>)}</div>
        <div style={s.summary}><span>Produtos <b>{brl.format(order.subtotal)}</b></span><span>Entrega <b>{brl.format(order.delivery_fee)}</b></span>{order.discount>0&&<span>Desconto <b>-{brl.format(order.discount)}</b></span>}<span style={s.grand}>Total <b>{brl.format(order.total)}</b></span></div>
      </section>}
    </div>
  </main>;
}

const s: Record<string, React.CSSProperties> = {
  page:{minHeight:"100vh",background:"#f6f8f6",padding:"26px clamp(16px,4vw,56px)",fontFamily:"Inter,system-ui,sans-serif",color:"#152019"},header:{maxWidth:1200,margin:"0 auto 20px",display:"flex",justifyContent:"space-between",alignItems:"center"},kicker:{display:"block",fontSize:10,fontWeight:900,letterSpacing:".12em",opacity:.55},h1:{fontSize:30,letterSpacing:"-.04em",margin:"5px 0"},h2:{fontSize:25,letterSpacing:"-.03em",margin:"4px 0"},layout:{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"300px minmax(0,1fr)",gap:14},list:{background:"white",border:"1px solid #e1e6e2",borderRadius:16,padding:14,display:"grid",alignContent:"start",gap:7},orderButton:{border:"1px solid #edf0ee",background:"#fafbfa",padding:12,borderRadius:11,display:"flex",justifyContent:"space-between",alignItems:"center",textAlign:"left",cursor:"pointer"},orderActive:{borderColor:"#2b6547",background:"#eff8f2"},detail:{background:"white",border:"1px solid #e1e6e2",borderRadius:17,padding:"clamp(17px,3vw,30px)"},detailTop:{display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-start"},total:{display:"block",fontSize:22},payButton:{marginTop:9,border:0,borderRadius:9,padding:"9px 12px",background:"#183d2b",color:"white",fontWeight:800,display:"inline-flex",gap:6,alignItems:"center",cursor:"pointer"},timeline:{display:"grid",gridTemplateColumns:"repeat(6,minmax(0,1fr))",margin:"30px 0",gap:4},step:{position:"relative",textAlign:"center",fontSize:11,display:"grid",justifyItems:"center",gap:7},dot:{width:34,height:34,borderRadius:99,background:"#edf0ee",display:"grid",placeItems:"center",zIndex:1},dotDone:{background:"#183d2b",color:"white"},line:{position:"absolute",height:2,background:"#e2e6e3",left:"56%",right:"-44%",top:16},lineDone:{background:"#6baa7f"},muted:{display:"block",fontSize:11,color:"#768078",marginTop:3},cards:{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10},info:{border:"1px solid #e5e9e6",borderRadius:13,padding:15,display:"flex",gap:11},items:{marginTop:16,borderTop:"1px solid #edf0ee",paddingTop:16},itemsHead:{display:"flex",justifyContent:"space-between",marginBottom:8},item:{display:"flex",justifyContent:"space-between",padding:"8px 0",fontSize:13,borderBottom:"1px solid #f0f2f1"},summary:{marginLeft:"auto",marginTop:16,maxWidth:310,display:"grid",gap:7,fontSize:13},grand:{borderTop:"1px solid #dfe4e1",paddingTop:10,fontSize:17,display:"flex",justifyContent:"space-between"},button:{background:"#183d2b",color:"white",padding:"10px 14px",borderRadius:10,textDecoration:"none"},notice:{maxWidth:1200,margin:"0 auto 12px",padding:11,borderRadius:10,background:"#fff5e7",color:"#83551f"},center:{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,textAlign:"center",fontFamily:"Inter,system-ui,sans-serif"}
};
