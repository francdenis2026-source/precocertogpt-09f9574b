import { supabase } from "./roles";

import { type OrderStatus } from "./merchantPlatform";

type OrderRow = {
  id: string;
  order_number: string | number | null;
  payment_status: string | null;
  status?: OrderStatus | null;
  customer_email: string | null;
  total: number | null;
};

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const notified = new Set<string>();

const statusLabels: Record<OrderStatus, string> = {
  pending_payment: "Aguardando pagamento",
  pending_review: "Em revisão",
  paid: "Pagamento confirmado",
  accepted: "Pedido aceito pela loja",
  preparing: "Seu pedido está sendo preparado",
  ready: "Seu pedido está pronto para retirada/envio",
  out_for_delivery: "Seu pedido saiu para entrega",
  delivered: "Pedido entregue com sucesso",
  cancelled: "Pedido cancelado"
};

function toast(message: string, type: "success" | "error" | "warning" | "info") {
  const fn = (window as unknown as { setGlobalToast?: (m: string, t: string) => void }).setGlobalToast;
  if (typeof fn === "function") fn(message, type);
  else console.info(`[PIX] ${message}`);
}

export function describePaymentNotification(order: OrderRow) {
  const ref = order.order_number ? `#${order.order_number}` : "";
  const amount = order.total != null ? ` (${brl.format(Number(order.total))})` : "";
  switch (order.payment_status) {
    case "approved":
      return { type: "success" as const, title: "Pagamento PIX aprovado", message: `Pagamento PIX do pedido ${ref} aprovado${amount}. Já avisamos a loja.` };
    case "rejected":
    case "cancelled":
      return { type: "error" as const, title: "Pagamento PIX não concluído", message: `O pagamento PIX do pedido ${ref} não foi concluído. Você pode gerar um novo QR Code.` };
    case "refunded":
      return { type: "warning" as const, title: "Pagamento PIX devolvido", message: `O valor do pedido ${ref} foi devolvido${amount}.` };
    default:
      return null;
  }
}

export function describeStatusNotification(order: OrderRow) {
  if (!order.status || !statusLabels[order.status as OrderStatus]) return null;
  const ref = order.order_number ? `#${order.order_number}` : "";
  const label = statusLabels[order.status as OrderStatus];
  
  let type: "info" | "success" | "warning" | "error" = "info";
  if (["paid", "accepted", "delivered"].includes(order.status)) type = "success";
  if (order.status === "cancelled") type = "error";

  return {
    type,
    title: `Pedido ${ref}: ${label}`,
    message: `O status do seu pedido ${ref} mudou para: ${label}.`
  };
}

async function sendEmailNotification(order: OrderRow, title: string, message: string) {
  if (!supabase || !order.customer_email) return;
  try {
    // O e-mail só é enviado se o provedor estiver configurado no backend; caso contrário a função ignora silenciosamente.
    await supabase.functions.invoke("payment-notification", {
      body: { orderId: order.id, email: order.customer_email, title, message, status: order.payment_status },
    });
  } catch (error) {
    console.warn("[PIX] Não foi possível enviar o e-mail de notificação", error);
  }
}

export async function notifyPaymentUpdate(order: OrderRow) {
  const info = describePaymentNotification(order);
  if (!info) return;
  const key = `${order.id}:${order.payment_status}`;
  if (notified.has(key)) return;
  notified.add(key);
  toast(info.message, info.type);
  await sendEmailNotification(order, info.title, info.message);
}

export async function notifyStatusUpdate(order: OrderRow) {
  const info = describeStatusNotification(order);
  if (!info) return;
  const key = `${order.id}:status:${order.status}`;
  if (notified.has(key)) return;
  notified.add(key);
  toast(info.message, info.type);
  await sendEmailNotification(order, info.title, info.message);
}

let channel: { unsubscribe: () => void } | null = null;

function subscribe(userId: string) {
  if (!supabase) return;
  channel?.unsubscribe();
  channel = supabase
    .channel(`order-updates-${userId}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "orders", filter: `customer_id=eq.${userId}` },
      (payload: { new: OrderRow; old?: Partial<OrderRow> }) => {
        // Notificar mudança de status de pagamento
        if (payload.old && payload.old.payment_status !== payload.new.payment_status) {
          void notifyPaymentUpdate(payload.new);
        }
        // Notificar mudança de status do pedido
        if (payload.old && payload.old.status !== payload.new.status) {
          void notifyStatusUpdate(payload.new);
        }
      },
    )
    .subscribe();
}

export function startPaymentNotifications() {
  if (!supabase) return;
  void supabase.auth.getSession().then(({ data }) => {
    const userId = data.session?.user?.id;
    if (userId) subscribe(userId);
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user?.id) subscribe(session.user.id);
    else {
      channel?.unsubscribe();
      channel = null;
    }
  });
}
