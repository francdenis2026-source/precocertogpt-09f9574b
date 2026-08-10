import { supabase } from "./roles";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "accepted"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "approved" | "rejected" | "refunded" | "cancelled";

export type MerchantOrder = {
  id: string;
  order_number: string;
  merchant_id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  delivery_address: Record<string, string> | null;
  delivery_type: "delivery" | "pickup";
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_provider: string | null;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  platform_fee: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: MerchantOrderItem[];
};

export type MerchantOrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url: string | null;
};

export type MerchantSummary = {
  merchantId: string;
  merchantName: string;
  todayGross: number;
  todayOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  deliveryOrders: number;
  averageTicket: number;
  lowStock: number;
};

export type PlatformSummary = {
  gmvToday: number;
  platformRevenueToday: number;
  subscriptionRevenueMonth: number;
  commissionRevenueToday: number;
  activeMerchants: number;
  ordersToday: number;
  cancelledToday: number;
  averageTicket: number;
};

const money = (value: unknown) => Number(value ?? 0);

export async function loadMerchantMembership() {
  if (!supabase) return null;
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from("merchant_members")
    .select("merchant_id, role, merchants(id,name,status,plan_code)")
    .eq("user_id", userId)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function loadMerchantOrders(merchantId: string, limit = 80): Promise<MerchantOrder[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row: any) => ({
    ...row,
    subtotal: money(row.subtotal),
    delivery_fee: money(row.delivery_fee),
    discount: money(row.discount),
    platform_fee: money(row.platform_fee),
    total: money(row.total),
    items: (row.order_items ?? []).map((item: any) => ({
      ...item,
      quantity: money(item.quantity),
      unit_price: money(item.unit_price),
      total_price: money(item.total_price),
    })),
  })) as MerchantOrder[];
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  if (!supabase) return { error: "Supabase indisponível" };
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  return { error: error?.message ?? null };
}

export function subscribeMerchantOrders(merchantId: string, onChange: () => void) {
  if (!supabase) return () => undefined;
  const channel = supabase
    .channel(`merchant-orders-${merchantId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders", filter: `merchant_id=eq.${merchantId}` },
      onChange,
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function loadMerchantSummary(merchantId: string, merchantName = "Meu estabelecimento"): Promise<MerchantSummary> {
  const orders = await loadMerchantOrders(merchantId, 200);
  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter(order => order.created_at.slice(0, 10) === today);
  const completed = todayOrders.filter(order => !["cancelled", "pending_payment"].includes(order.status));
  const todayGross = completed.reduce((sum, order) => sum + order.total, 0);

  let lowStock = 0;
  if (supabase) {
    const { count } = await supabase
      .from("merchant_products")
      .select("id", { count: "exact", head: true })
      .eq("merchant_id", merchantId)
      .eq("active", true)
      .lte("stock_quantity", 5);
    lowStock = count ?? 0;
  }

  return {
    merchantId,
    merchantName,
    todayGross,
    todayOrders: todayOrders.length,
    pendingOrders: orders.filter(order => ["paid", "accepted"].includes(order.status)).length,
    preparingOrders: orders.filter(order => order.status === "preparing").length,
    deliveryOrders: orders.filter(order => order.status === "out_for_delivery").length,
    averageTicket: completed.length ? todayGross / completed.length : 0,
    lowStock,
  };
}

export async function loadPlatformSummary(): Promise<PlatformSummary> {
  if (!supabase) {
    return { gmvToday: 0, platformRevenueToday: 0, subscriptionRevenueMonth: 0, commissionRevenueToday: 0, activeMerchants: 0, ordersToday: 0, cancelledToday: 0, averageTicket: 0 };
  }

  const today = new Date();
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  const [{ data: orders }, { count: activeMerchants }, { data: subscriptions }] = await Promise.all([
    supabase.from("orders").select("total, platform_fee, status").gte("created_at", dayStart),
    supabase.from("merchants").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("merchant_subscriptions").select("amount,status,paid_at").eq("status", "paid").gte("paid_at", monthStart),
  ]);

  const rows = orders ?? [];
  const valid = rows.filter((order: any) => order.status !== "cancelled");
  const gmvToday = valid.reduce((sum: number, order: any) => sum + money(order.total), 0);
  const commissionRevenueToday = valid.reduce((sum: number, order: any) => sum + money(order.platform_fee), 0);
  const subscriptionRevenueMonth = (subscriptions ?? []).reduce((sum: number, row: any) => sum + money(row.amount), 0);

  return {
    gmvToday,
    platformRevenueToday: commissionRevenueToday,
    subscriptionRevenueMonth,
    commissionRevenueToday,
    activeMerchants: activeMerchants ?? 0,
    ordersToday: rows.length,
    cancelledToday: rows.filter((order: any) => order.status === "cancelled").length,
    averageTicket: valid.length ? gmvToday / valid.length : 0,
  };
}

export async function getMercadoPagoConnectUrl(merchantId: string) {
  if (!supabase) return { url: null, error: "Supabase indisponível" };
  const { data, error } = await supabase.functions.invoke("mercadopago-oauth", {
    body: { action: "authorize", merchantId },
  });
  return { url: data?.url ?? null, error: error?.message ?? null };
}
