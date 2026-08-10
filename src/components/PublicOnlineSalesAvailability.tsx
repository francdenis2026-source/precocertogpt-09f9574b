import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Clock3, LockKeyhole, ShoppingCart, Store } from "lucide-react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

type PublicAvailability = {
  establishment_id: string;
  establishment_slug: string;
  establishment_name: string;
  merchant_id: string;
  service_live: boolean;
  online_sales_enabled: boolean;
  sales_message: string;
  delivery_enabled: boolean;
  pickup_enabled: boolean;
  payment_connected: boolean;
  active_product_ids: string[];
  active_merchant_product_ids: string[];
  updated_at: string;
};

type ModalProduct = {
  id: string | number;
  slug?: string;
  name: string;
  brand?: string;
  size?: string;
  minPrice: number;
  establishmentId: string | number;
  establishmentSlug?: string;
  establishment?: string;
  neighborhood?: string;
  [key: string]: unknown;
};

const BANNER_ID = "pc-public-online-sales-banner";
const MODAL_ACTION_ID = "pc-product-online-sales-action";

function normalizeKey(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function isProductLive(row: PublicAvailability | undefined, productId: string | number | undefined) {
  if (!row?.service_live || productId == null) return false;
  return row.active_product_ids.map(String).includes(String(productId));
}

function unavailableButton(button: HTMLButtonElement, label = "Venda online em breve") {
  button.disabled = true;
  button.setAttribute("aria-disabled", "true");
  button.setAttribute("title", "Este produto pode ser comparado, mas a compra online ainda não está disponível neste estabelecimento.");
  button.dataset.pcOnlineSalesState = "unavailable";
  button.innerHTML = `<span aria-hidden="true">◷</span> ${label}`;
  Object.assign(button.style, {
    cursor: "not-allowed",
    opacity: "0.76",
    background: "#eef2f0",
    color: "#5f6c65",
    border: "1px solid #d9e0dc",
    boxShadow: "none",
  });
}

function availableButton(button: HTMLButtonElement) {
  button.disabled = false;
  button.removeAttribute("aria-disabled");
  button.setAttribute("title", "Adicionar este produto à cesta");
  button.dataset.pcOnlineSalesState = "available";
  button.innerHTML = `<span aria-hidden="true">＋</span> Comprar`;
  button.style.removeProperty("opacity");
  button.style.removeProperty("cursor");
  button.style.removeProperty("background");
  button.style.removeProperty("color");
  button.style.removeProperty("border");
  button.style.removeProperty("box-shadow");
}

function StoreUnavailableBanner({ storeName, message }: { storeName: string; message: string }) {
  return (
    <section style={styles.banner} aria-label="Situação das vendas online">
      <div style={styles.bannerVisual}>
        <img src="/online-sales-coming-soon.svg" alt="Venda online em preparação" style={styles.bannerImage} />
      </div>
      <div style={styles.bannerContent}>
        <span style={styles.kicker}><Clock3 size={15} /> VENDA ONLINE EM PREPARAÇÃO</span>
        <h2 style={styles.bannerTitle}>{storeName} ainda não está recebendo pedidos online</h2>
        <p style={styles.bannerText}>{message}</p>
        <div style={styles.bannerPoints}>
          <span><CheckCircle2 size={16} /> Preços continuam disponíveis para consulta e comparação</span>
          <span><LockKeyhole size={16} /> O botão de compra só será liberado quando a operação estiver pronta</span>
        </div>
      </div>
    </section>
  );
}

export function PublicOnlineSalesAvailability() {
  const location = useLocation();
  const [rows, setRows] = useState<PublicAvailability[]>([]);
  const [modalProduct, setModalProduct] = useState<ModalProduct | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!supabase) return;
      const { data } = await supabase.rpc("marketplace_public_availability");
      if (!cancelled) setRows((data ?? []) as PublicAvailability[]);
    })();
    return () => { cancelled = true; };
  }, [location.pathname]);

  const byStore = useMemo(() => {
    const map = new Map<string, PublicAvailability>();
    rows.forEach(row => {
      map.set(normalizeKey(row.establishment_id), row);
      map.set(normalizeKey(row.establishment_slug), row);
    });
    return map;
  }, [rows]);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<ModalProduct>;
      if (custom.detail) setModalProduct(custom.detail);
    };
    window.addEventListener("pc:open-product-details", handler as EventListener);
    return () => window.removeEventListener("pc:open-product-details", handler as EventListener);
  }, []);

  useEffect(() => {
    function patchStorePage() {
      const match = location.pathname.match(/^\/(?:estabelecimento|loja)\/([^/]+)/);
      if (!match) return;
      const storeKey = decodeURIComponent(match[1]);
      const availability = byStore.get(normalizeKey(storeKey));
      const section = document.querySelector<HTMLElement>(".store-catalog-section");
      if (!section) return;

      const existing = document.getElementById(BANNER_ID);
      if (!availability?.service_live) {
        if (!existing) {
          const host = document.createElement("div");
          host.id = BANNER_ID;
          host.style.margin = "0 0 22px";
          const root = document.createElement("div");
          host.appendChild(root);
          section.insertBefore(host, section.firstChild);
          import("react-dom/client").then(({ createRoot }) => {
            createRoot(root).render(
              <StoreUnavailableBanner
                storeName={availability?.establishment_name || document.querySelector(".store-detail-brand h1")?.textContent || "Este estabelecimento"}
                message={availability?.sales_message || "Este estabelecimento ainda não oferece vendas online pelo Preço Certo. Você pode consultar e comparar os preços normalmente."}
              />,
            );
          });
        }
      } else if (existing) {
        existing.remove();
      }

      document.querySelectorAll<HTMLElement>(".store-product-card").forEach(card => {
        const productLink = card.querySelector<HTMLAnchorElement>('a[href*="/produto/"]');
        const primary = card.querySelector<HTMLButtonElement>(".store-product-card__actions .button--primary");
        if (!productLink || !primary) return;
        const productKey = decodeURIComponent(productLink.pathname.split("/produto/")[1]?.split("/")[0] || "");
        if (isProductLive(availability, productKey)) availableButton(primary);
        else unavailableButton(primary);
      });
    }

    function patchModal() {
      const modal = Array.from(document.querySelectorAll<HTMLElement>(".admin-modal-content"))
        .find(node => node.querySelector("#modal-title")?.textContent?.includes("Detalhes do Produto"));
      if (!modal || !modalProduct) return;

      const availability = byStore.get(normalizeKey(modalProduct.establishmentId))
        || byStore.get(normalizeKey(modalProduct.establishmentSlug));
      const live = isProductLive(availability, modalProduct.id);
      const prior = modal.querySelector<HTMLElement>(`#${MODAL_ACTION_ID}`);
      if (prior) prior.remove();

      const host = document.createElement("div");
      host.id = MODAL_ACTION_ID;
      host.style.marginTop = "14px";
      const target = Array.from(modal.querySelectorAll<HTMLAnchorElement>("a.button"))
        .find(anchor => anchor.textContent?.includes("Ir para a loja"));
      if (target?.parentElement) target.parentElement.insertBefore(host, target);
      else modal.appendChild(host);

      const button = document.createElement("button");
      button.type = "button";
      button.style.width = "100%";
      button.style.minHeight = "48px";
      button.style.borderRadius = "12px";
      button.style.fontWeight = "850";
      button.style.display = "inline-flex";
      button.style.alignItems = "center";
      button.style.justifyContent = "center";
      button.style.gap = "8px";

      if (!live) {
        button.disabled = true;
        button.innerHTML = "◷ Venda online ainda indisponível";
        Object.assign(button.style, { border:"1px solid #d9e0dc", background:"#f1f4f2", color:"#657168", cursor:"not-allowed" });
        const hint = document.createElement("p");
        hint.textContent = availability?.sales_message || "Este estabelecimento ainda não ativou a venda online deste produto. O preço continua disponível para comparação.";
        Object.assign(hint.style, { margin:"8px 2px 0", fontSize:"12px", lineHeight:"1.5", color:"#69756e" });
        host.append(button, hint);
        return;
      }

      button.innerHTML = "🛒 Comprar agora";
      Object.assign(button.style, { border:"1px solid #173a29", background:"#183d2b", color:"white", cursor:"pointer", boxShadow:"0 10px 24px rgba(24,61,43,.16)" });
      button.addEventListener("click", async () => {
        if (!supabase) return;
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?returnTo=${returnTo}`;
          return;
        }
        const current = JSON.parse(localStorage.getItem("precocerto:basket") || "[]") as ModalProduct[];
        if (!current.some(item => String(item.id) === String(modalProduct.id) && String(item.establishmentId) === String(modalProduct.establishmentId))) {
          current.push(modalProduct);
          localStorage.setItem("precocerto:basket", JSON.stringify(current));
        }
        window.location.href = "/cesta";
      });
      host.appendChild(button);
    }

    const patch = () => { patchStorePage(); patchModal(); };
    patch();
    observerRef.current?.disconnect();
    const observer = new MutationObserver(patch);
    observer.observe(document.body, { subtree:true, childList:true });
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [location.pathname, byStore, modalProduct]);

  return null;
}

const styles: Record<string, React.CSSProperties> = {
  banner:{display:"grid",gridTemplateColumns:"minmax(220px,34%) 1fr",gap:24,alignItems:"center",background:"linear-gradient(135deg,#f7fcf9 0%,#f7f9fc 100%)",border:"1px solid #dfe8e3",borderRadius:22,padding:"clamp(18px,3vw,30px)",boxShadow:"0 14px 38px rgba(19,48,34,.06)",overflow:"hidden"},
  bannerVisual:{display:"flex",alignItems:"center",justifyContent:"center",minHeight:170},
  bannerImage:{width:"100%",maxWidth:310,height:"auto",display:"block"},
  bannerContent:{minWidth:0},
  kicker:{display:"inline-flex",alignItems:"center",gap:7,fontSize:11,fontWeight:900,letterSpacing:".11em",color:"#0f766e"},
  bannerTitle:{fontSize:"clamp(22px,3vw,32px)",lineHeight:1.08,letterSpacing:"-.035em",margin:"10px 0 10px",color:"#17231c"},
  bannerText:{margin:0,color:"#66736c",lineHeight:1.65,fontSize:14,maxWidth:720},
  bannerPoints:{display:"flex",flexWrap:"wrap",gap:"8px 18px",marginTop:16,color:"#3e5146",fontSize:12,fontWeight:700},
};
