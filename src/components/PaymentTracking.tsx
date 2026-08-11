import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, Clock, Copy, ExternalLink, Loader2, QrCode, RotateCcw, XCircle, AlertTriangle } from "lucide-react";
import { supabase } from "../lib/roles";

interface PaymentTrackingProps {
  orderId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PaymentTracking({ orderId, onClose, onSuccess }: PaymentTrackingProps) {
  const [status, setStatus] = useState<"loading" | "pending" | "approved" | "rejected" | "expired">("loading");
  const [pixData, setPixData] = useState<{ qrCode?: string; copyPaste?: string; ticketUrl?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const fetchPaymentInfo = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("status, payment_status, pix_qr_code, pix_copy_paste, payment_payload")
        .eq("id", orderId)
        .maybeSingle();

      if (orderError) throw orderError;
      if (!order) {
        setError("Pedido não encontrado.");
        return;
      }

      if (order.payment_status === "approved" || order.status === "paid") {
        setStatus("approved");
        onSuccess?.();
        return;
      }

      if (order.payment_status === "rejected") {
        setStatus("rejected");
        return;
      }

      const payload = order.payment_payload as any;
      if (order.pix_qr_code || payload?.point_of_interaction?.transaction_data?.qr_code_base64) {
        setPixData({
          qrCode: order.pix_qr_code || payload?.point_of_interaction?.transaction_data?.qr_code_base64,
          copyPaste: order.pix_copy_paste || payload?.point_of_interaction?.transaction_data?.qr_code,
          ticketUrl: payload?.point_of_interaction?.transaction_data?.ticket_url
        });
        setStatus("pending");
      } else if (attempts < 5) {
        // Se ainda não tem PIX, talvez a Edge Function ainda esteja processando
        setTimeout(() => setAttempts(a => a + 1), 2000);
      } else {
        setError("Pagamento PIX não disponível para este pedido. Tente novamente.");
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [orderId, attempts, onSuccess]);

  useEffect(() => {
    fetchPaymentInfo();
    const interval = setInterval(fetchPaymentInfo, 5000);
    return () => clearInterval(interval);
  }, [fetchPaymentInfo]);

  const copyToClipboard = () => {
    if (pixData?.copyPaste) {
      navigator.clipboard.writeText(pixData.copyPaste);
      alert("Código PIX Copia e Cola copiado!");
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <header style={s.header}>
          <h2>Pagamento via PIX</h2>
          <button onClick={onClose} style={s.closeBtn}><XCircle size={20}/></button>
        </header>

        <div style={s.body}>
          {status === "loading" && (
            <div style={s.status}>
              <Loader2 className="animate-spin" size={32} color="var(--blue)" />
              <p>Preparando seu pagamento...</p>
            </div>
          )}

          {status === "pending" && pixData && (
            <div style={s.pixContainer}>
              <div style={s.qrBox}>
                {pixData.qrCode ? (
                  <img src={`data:image/png;base64,${pixData.qrCode}`} alt="QR Code PIX" style={s.qrImage} />
                ) : (
                  <QrCode size={120} color="#cbd5e1" />
                )}
              </div>
              
              <div style={s.info}>
                <div style={s.badge}><Clock size={14}/><span>Aguardando pagamento</span></div>
                <p style={s.hint}>Escaneie o QR Code acima ou use o código Copia e Cola abaixo.</p>
              </div>

              <div style={s.actions}>
                <button onClick={copyToClipboard} style={s.copyBtn}>
                  <Copy size={16}/> Copiar Código PIX
                </button>
                {pixData.ticketUrl && (
                  <a href={pixData.ticketUrl} target="_blank" rel="noopener noreferrer" style={s.linkBtn}>
                    <ExternalLink size={16}/> Abrir no Mercado Pago
                  </a>
                )}
              </div>
            </div>
          )}

          {status === "approved" && (
            <div style={s.status}>
              <CheckCircle2 size={48} color="var(--green)" />
              <h3>Pagamento Aprovado!</h3>
              <p>Seu pedido foi confirmado e está sendo processado.</p>
              <button onClick={onClose} style={s.primaryBtn}>Concluir</button>
            </div>
          )}

          {status === "rejected" && (
            <div style={s.status}>
              <XCircle size={48} color="var(--red)" />
              <h3>Pagamento Recusado</h3>
              <p>Ocorreu um problema com a transação.</p>
              <button onClick={() => setAttempts(0)} style={s.secondaryBtn}><RotateCcw size={16}/> Tentar Novamente</button>
            </div>
          )}

          {error && (
            <div style={s.errorBox}>
              <AlertTriangle size={20} />
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100000, display: "grid", placeItems: "center", padding: 20 },
  modal: { background: "white", borderRadius: 20, width: "min(440px, 100%)", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", overflow: "hidden" },
  header: { padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" },
  closeBtn: { background: "none", border: "none", color: "#94a3b8", cursor: "pointer" },
  body: { padding: 24, textAlign: "center" },
  status: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "20px 0" },
  pixContainer: { display: "flex", flexDirection: "column", gap: 20 },
  qrBox: { background: "#f8fafc", padding: 16, borderRadius: 16, border: "1px solid #e2e8f0", margin: "0 auto", width: "fit-content" },
  qrImage: { width: 200, height: 200, display: "block" },
  info: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  badge: { display: "flex", alignItems: "center", gap: 6, background: "#fef3c7", color: "#92400e", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600 },
  hint: { fontSize: 14, color: "#64748b", lineHeight: 1.5 },
  actions: { display: "flex", flexDirection: "column", gap: 10 },
  copyBtn: { background: "#1e293b", color: "white", border: "none", padding: "12px", borderRadius: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  linkBtn: { background: "#f1f5f9", color: "#475569", textDecoration: "none", padding: "12px", borderRadius: 12, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryBtn: { background: "var(--green)", color: "white", border: "none", padding: "12px 24px", borderRadius: 12, fontWeight: 700, cursor: "pointer", marginTop: 10 },
  secondaryBtn: { background: "white", color: "#1e293b", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: 10, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, margin: "0 auto" },
  errorBox: { background: "#fef2f2", color: "#991b1b", padding: 16, borderRadius: 12, display: "flex", alignItems: "center", gap: 12, fontSize: 14, marginTop: 20 }
};
