import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { supabase } from "../lib/roles";

export function MercadoPagoCallback() {
  const [state, setState] = useState<"loading"|"success"|"error">("loading");
  const [message, setMessage] = useState("Concluindo conexão com Mercado Pago…");

  useEffect(() => {
    void (async () => {
      if (!supabase) { setState("error"); setMessage("Supabase indisponível."); return; }
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const oauthState = params.get("state");
      const merchantId = sessionStorage.getItem("pc_mp_merchant_id");
      if (!code || !oauthState || !merchantId) { setState("error"); setMessage("Dados da autorização incompletos. Inicie a conexão novamente no painel da loja."); return; }
      const { error } = await supabase.functions.invoke("mercadopago-oauth", { body: { action:"callback", merchantId, code, state:oauthState } });
      if (error) { setState("error"); setMessage(error.message || "Não foi possível concluir a conexão."); return; }
      sessionStorage.removeItem("pc_mp_merchant_id");
      setState("success");
      setMessage("Conta Mercado Pago conectada com sucesso.");
      setTimeout(() => window.location.replace("/painel-lojista"), 1200);
    })();
  }, []);

  return <main style={s.page}>{state==="loading"?<Loader2 size={42}/>:state==="success"?<CheckCircle2 size={48} color="#2f7d4d"/>:<XCircle size={48} color="#a63b3b"/>}<h1>{state==="success"?"Conexão concluída":state==="error"?"Falha na conexão":"Conectando…"}</h1><p>{message}</p>{state==="error"&&<a href="/painel-lojista" style={s.button}>Voltar ao painel</a>}</main>;
}
const s: Record<string, React.CSSProperties> = { page:{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,textAlign:"center",fontFamily:"Inter,system-ui,sans-serif",padding:24}, button:{background:"#183d2b",color:"white",padding:"10px 14px",borderRadius:10,textDecoration:"none"} };
