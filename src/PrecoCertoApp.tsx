
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, Bell, Camera, Check, CheckCircle2,
  ChevronDown, ChevronRight, CircleDollarSign, Clock3, Database, Download, Edit, Flag,
  Heart, Home, LayoutDashboard, LineChart, ListChecks, MapPin, Menu, Moon, PackageSearch,
  Plus, Receipt, Search, Settings, Share2, ShieldCheck, ShoppingBasket,
  SlidersHorizontal, Sparkles, Store, Sun, Trash2, TrendingDown, TrendingUp, Upload, UserRound, Users, X,
} from "lucide-react";

import { FormEvent, ReactNode, useEffect, useMemo, useState, useRef, type ChangeEvent } from "react";
import { useLocation } from "react-router-dom";
import { buildCatalog, verifiedDatasetMetrics, type PlatformMetrics, type Product, type StoreRow } from "./data/catalog";
import { fetchCatalog } from "./data/remoteCatalog";
import { supabase } from "./lib/supabase";
import { isEnabled } from "./config/features";
import { freshnessLabels, priceFreshness, unitPrice, type FreshnessState } from "./lib/pricing";
import { priceReportReasons, submitPriceReport } from "./data/priceReports";
import { loadSessionProfile, requestPasswordReset, signIn, signOut, type SessionProfile } from "./lib/roles";

const initialCatalog = buildCatalog();
const initialProducts: Product[] = initialCatalog.products;

const initialStores: StoreRow[] = initialCatalog.stores;

const adminRouteNames: Record<string, string> = {
  "/admin": "Visão geral", 
  "/admin/gestao": "Licenças e assinaturas", 
  "/admin/acessos-temporarios": "Acessos temporários",
  "/admin/analytics": "Analytics", 
  "/admin/auditoria": "Auditoria geral", 
  "/admin/auditoria-acessos": "Auditoria de acessos",
  "/admin/auditoria-numeros": "Consistência de números", 
  "/admin/cadastro-foto": "Cadastro por foto",
  "/admin/catalogo": "Catálogo de produtos", 
  "/admin/fotos-pendentes": "Fotos Pendentes",
  "/admin/categorizacao": "Categorização inteligente", 
  "/admin/cesta": "Cesta básica",
  "/admin/cesta-auditoria": "Auditoria da cesta", 
  "/admin/clientes": "Contas e clientes", 
  "/admin/cobertura": "Cobertura por loja",
  "/admin/consistencia": "Consistência operacional", 
  "/admin/contas": "Contas e segurança", 
  "/admin/conversoes": "Conversões",
  "/admin/cupom": "Leitura de cupom", 
  "/admin/cupom-lote": "Cupons em lote", 
  "/admin/historico-precos": "Histórico de preços",
  "/admin/ia": "Inteligência artificial", 
  "/admin/icones-categoria": "Ícones de categoria", 
  "/admin/image-jobs": "Fila de imagens",
  "/admin/importacoes": "Importações", 
  "/admin/lote-inserir": "Inserção em lote", 
  "/admin/metricas": "Métricas",
  "/admin/operacao": "Operação", 
  "/admin/preco-rapido": "Preço rápido", 
  "/admin/precos": "Gestão de preços",
  "/admin/promocoes": "Promoções", 
  "/admin/promocoes-codigos": "Códigos promocionais", 
  "/admin/rank-check": "Validação de ranking",
  "/admin/reports": "Denúncias de preço", 
  "/admin/sinonimos": "Sinônimos de busca", 
  "/admin/vitrine": "Vitrine pública", 
  "/admin/webhooks": "Webhooks",
};

function money(value: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value); }
function count(value: number) { return new Intl.NumberFormat("pt-BR").format(value); }

/**
 * Registra uma entrada no log de auditoria persistente.
 */
function addAuditLog(action: string, type: "success" | "warning" | "error" = "success", user: string = "Franc D’Nis") {
  try {
    const key = "precocerto:admin_logs";
    const logs = JSON.parse(localStorage.getItem(key) ?? "[]");
    const newLog = { action, type, user, at: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify([newLog, ...logs].slice(0, 100)));
  } catch (err) {
    console.error("Erro ao salvar log de auditoria:", err);
  }
}


import ypeNeutroAsset from "./assets/ype-neutro.png.asset.json";
import frangoSearaAsset from "./assets/frango-seara.png.asset.json";

import pinhoSolFloralAsset from "./assets/pinho-sol-floral.png.asset.json";
import alpesLavandaAsset from "./assets/alpes-lavanda.png.asset.json";
import alpesLimaoAsset from "./assets/alpes-limao.png.asset.json";
import alpesMacaAsset from "./assets/alpes-maca.png.asset.json";
import minuanoMarinhaAsset from "./assets/minuano-marinha.png.asset.json";
import ypeLimaoAsset from "./assets/ype-limao.png.asset.json";

import alcatraAsset from "./assets/alcatra.jpg.asset.json";
import alhoAsset from "./assets/alho-_kg_.jpg.asset.json";
import arrozTioUrbano5kgAsset from "./assets/arroz-tio-urbano-branco-5kg.jpg.asset.json";
import biscoitoAtrevidosAsset from "./assets/biscoito-atrevidos-sabores-90g.jpg.asset.json";
import cebolaAsset from "./assets/cebola-_kg_.jpg.asset.json";
import frangoSadiaAsset from "./assets/caixa-de-frango-sadia.jpg.asset.json";
import frangoSearaPackAsset from "./assets/caixa-de-frango-seara.jpg.asset.json";
import escureto35gAsset from "./assets/biscoito_escureto_35g.png.asset.json";
import esponjaBrilhusAsset from "./assets/esponja_brilhus.png.asset.json";
import paoCestaAsset from "./assets/pao_cesta.png.asset.json";
import nissinCarneAsset from "./assets/nissin_lamen_carne.png.asset.json";

import itamaratyMorangoAsset from "./assets/biscoito_itamaraty_morango.png.asset.json";

const productImages: Record<string, string> = {
  // Pack 2 Mappings
  "844d8729-b2a0-4a60-9c23-a074c9e0979a": "/products/rabo.jpg",
  "294e5690-ed74-4898-a079-263f6060c2b5": "/products/biscoito-wafer-bauducco-sabores-70g.jpg",
  "7a2666ab-25f7-4e0a-bf35-cf916fab9396": "/products/biscoito-cookies-bauducco-chocolate-60g.jpg",
  "47444638-2e10-4f56-9723-52bad766b205": "/products/carne-bovina-em-conserva-anglo-320g.jpg",
  "9a971a21-3377-431a-a1b8-48034499c194": "/products/carne-bovina-em-conserva-bertin-320g.jpg",
  "b6744248-6d22-4a38-975a-7a92ec4a90fa": "/products/molho-de-tomate-tarantella-tradicional-300g.jpg",
  "29c90c81-d06d-45e1-a64a-8867de7ab896": "/products/arroz-branco-bernardo-1kg.jpg",
  "5d272a4b-0409-4e04-ab01-8e8c4114c484": "/products/leite-condensado-piracanjuba-semidesnatado-395g.jpg",
  "29a5e459-5c1b-4cbf-86cf-e258de75b47d": "/products/patinho.jpg",
  "27f126f7-dfb3-42e4-bd1b-ef0d34d80731": "/products/lava-roupas-minuano-concentrado-1,6kg.jpg",
  "itamaraty-morango": itamaratyMorangoAsset.url,
  "escureto-35g": escureto35gAsset.url,
  "esponja-brilhus": esponjaBrilhusAsset.url,
  "pao-cesta": paoCestaAsset.url,
  "nissin-carne": nissinCarneAsset.url,
  "alcatra": alcatraAsset.url,
  "alho-kg": alhoAsset.url,
  "arroz-tio-urbano-5kg": arrozTioUrbano5kgAsset.url,
  "biscoito-atrevidos": biscoitoAtrevidosAsset.url,
  "cebola-kg": cebolaAsset.url,
  "frango-sadia-caixa": frangoSadiaAsset.url,
  "frango-seara-caixa": frangoSearaPackAsset.url,
  "4b5508ae-5214-4bb0-9857-38eee60743bb": "/products/biscoito-itamarati-recheado.jpg",
  "2b13198e-2499-437c-ae9f-baeabec7b783": "/products/biscoito-brandini-salt-plus-360g.jpg",
  "639fa99b-96ea-4488-922f-f22f091f5da1": "/products/biscoito-vitarella-cream-cracker-330g.jpg",
  "927e73ff-e6a8-4fe5-ad2a-1f331a77ec41": "/products/biscoito-galo-cream-cracker.jpg",
  "88d74a86-11ae-44e7-9ddc-4a42c38894e2": "/products/coco-ralado-sococo-100g.jpg",
  "ab9ed77b-3b80-4f43-ad09-7c119a566e11": "/products/salsicha-bordon-180g.jpg",
  "d63f2de8-957c-4894-aed6-98c1934e6bf9": "/products/carne-bovina-pampeano-320g.jpg",
  "8b3c4919-7562-421d-8a15-3339cb3d5ad3": "/products/aveia-quaker-flocos-finos-450g.jpg",
  "e1d650e2-b0ed-47f7-81b9-9317ebfc5cc7": "/products/shampoo-clear-men-queda-control-200ml.jpg",

  // Mapeamento manual para o catálogo local (seed)
  "arroz-tio-joao-5kg": "/products/arroz-tio-joao-5kg.png",
  "cafe-3-coracoes-500g": "/products/cafe-3-coracoes-500g.jpg",
  "leite-italac-1l": "/products/leite-italac-1l.jpg",
  "feijao-kicaldo-1kg": "/products/feijao-kicaldo-1kg.jpg",
  "oleo-liza-900ml": "/products/oleo-liza-900ml.jpg",
  "oleo-soja-liza-900ml": "/products/oleo-liza-900ml.jpg",
  "acucar-uniao-1kg": "/products/acucar-uniao-1kg.jpg",
  "detergente-ype-500ml": ypeNeutroAsset.url,

  // Mapeamento por UUID para dados do Supabase (conforme auditoria)
  "c1d78817-20b9-40b2-b12d-a9bc73152d47": ypeNeutroAsset.url,
  "8519fc88-a26f-433d-a992-6cad775efc83": "/products/neston-3-cereais-nestle-360g.jpg",
  "0ce0efbf-2c25-4b0a-a80f-c5402bc128d1": "/products/biscoito-spantoo-80g.jpg",
  "c309be5b-38cf-4447-b361-e7ce38934f29": "/products/biscoito-spantoo-chocolate-30g.jpg",
  "7f0013fe-c0b4-4226-8df3-1cf90500aa7a": "/products/agua-sanitaria-ype-2l.jpg",
  "28237267-da30-46f7-b87c-9c92efa870eb": "/products/agua-sanitaria-ype-1l.jpg",
  "7b21cc10-79a7-42a5-9c8b-71efea6942f3": "/products/cenoura.jpg",
  "4c142243-a950-4b89-9a09-a022f39153fb": "/products/leite-uht-integral-piracanjuba-1l.jpg",
  "e0398ca5-3dcd-44f5-ab76-f87eb161d885": "/products/papel-higienico-cotton-deluxe-folha-dupla-4-unidades.jpg",
  "6d2f0fc9-22d0-47a4-bcfa-b4bb1c19a893": "/products/papel-higienico-deluxe-cotton-folha-dupla-leve-12-pague-11.jpg",
  "1c56c1c7-35c5-45e5-8be6-5e0da6cb2759": "/products/vinagre-de-maca-toscano-750ml.jpg",
  "ce2c94b7-0814-40b5-8092-a20e0c48fd04": "/products/vinagre-de-alcool-toscano-aromas-750ml.jpg",
  "7e9904bf-cd6a-418a-af72-eb9533d55f2d": "/products/vinagre-de-alcool-castelo-750ml.jpg",
  "5271abc6-2ba0-451b-bf94-f19700072b7a": "/products/sabao-em-po-tixan-ype-maciez-400g.jpg",
  "6aedd90a-c64b-480d-a193-dbadda7b93e2": "/products/sabao-em-po-tixan-ype-primavera-400g.jpg",
  "fbb25f65-4bd5-4d63-8549-3af2a077378d": "/products/detergente-vida-limao-500ml.jpg",
  "0cb7a39c-9f06-4b18-9472-b3ed904ae7b1": "/products/agua-sanitaria-cristal-1l.jpg",
  "a974921f-7c92-4d2d-8944-1a856fb41a53": "/products/cereal-matinal-moca-flakes-120g.jpg",
  "b9facf19-aa5d-4891-9fdf-b3ef94c142ba": "/products/cereal-matinal-nescau-120g.jpg",
  "d2a41d39-9395-4928-b5a2-39509415c609": "/products/cereal-matinal-snow-flakes-120g.jpg",
  "9f56dec0-c98a-400a-aae5-a2ea6088411a": "/products/leite-em-po-ninho-integral-instantaneo-380g.jpg",
  "6fd81e2d-c147-4059-a383-38bd6972acc9": "/products/limpador-urca-multiuso-2l.jpg",
  "e206b8a7-fb93-447e-93cf-2a2d2751783f": "/products/salsicha-ao-molho-bordon-300g.jpg",
  "28026257-183e-4e4b-b957-ea8cb545169f": "/products/almondegas-de-carne-bovina-pampeano-320g.jpg",
  "3de65489-fb83-4c00-b4fd-759fd248e99c": "/products/carne-bovina-em-conserva-target-320g.jpg",
  "9714fa33-34ea-48f9-a61b-38ec83502e60": "/products/milho-verde-em-conserva-ole-200g.jpg",
  "9ed0f34c-9ff1-49cc-b354-eca072e3fd89": "/products/biscoito-cream-cracker-vivale-300g.jpg",
  "5f642e0b-4586-4c08-a44b-b3624300dde4": "/products/batata-inglesa.jpg",
  "66ed0c4d-6cb6-4474-a5c5-9edc98225cf4": "/products/inseticida-raid-base-agua-300ml.jpg",
  "0e3d3cfc-3a67-41ed-a9e1-c23c37176644": "/products/inseticida-mat-inset-multi-300ml.jpg",
  "849adcfe-0deb-473d-9aa8-000a1ee03dfd": "/products/inseticida-baygon-acao-total-360ml.jpg",
  "2c6ca30f-393d-4e20-82ad-62083d65c973": "/products/biscoito-salgado-mirim-300g.jpg",
  "143bcb52-bd86-4027-8e81-665d0ba063c9": "/products/biscoito-agua-e-sal-dallas-300g.jpg",
  "36facb08-a950-4a91-8e3a-22742a3c9661": "/products/kit-dabelle-liso-arrasador-(shampoo-250ml-+-condicionador-175ml).jpg",
  "3e7852ff-61aa-4a6c-86a7-986a4a8f9a50": "/products/bisteca.jpg",
  "cb2200d1-9e1b-4db1-b140-f4fd9c359f4e": "/products/kit-dabelle-abacate-nutritivo-(shampoo-+-condicionador).jpg",
  "09ab7d64-54f1-43ee-8c20-cbb2e0c03705": "/products/macarrao-espaguete-miragina-500g.jpg",
  "12c777b0-3c5a-4b36-89d0-89a52031605c": "/products/margarina-delicia-com-creme-de-leite-1kg.jpg",
  "818e1399-ccc3-4b93-9fae-5b14926b94dd": "/products/macarrao-instantaneo-nissin-lamen-galinha-85g.jpg",
  "b6f5b793-2f80-4132-97e1-db427206d2e5": "/products/macarrao-instantaneo-nissin-lamen-frango-assado-com-limao-85g.jpg",
  "b4926d43-5005-4471-970b-9905e0636ead": "/products/massa-para-lasanha-dona-benta-500g.jpg",
  "a9e5ce2c-5099-440a-97d1-ce4ef6da5ff8": "/products/lava-roupas-em-po-tixan-ype-primavera-2.4kg.jpg",
  "7e5a5851-b545-4ebe-a731-611d74543ce0": "/products/lava-roupas-em-po-tixan-ype-primavera-4kg.jpg",
  "2248bfe3-b8c8-49bb-bee0-c00b8ad7ab96": "/products/limpador-multiuso-casa-&-perfume-500ml.jpg",
  "b36a8f23-3441-475e-9053-9a970646953d": "/products/leite-de-coco-bom-coco-200ml.jpg",
  "ea19f422-4c32-4f17-98a6-b6510e356e4c": "/products/cup-noodles-nissin-bolonhesa-70g.jpg",
  "8c2a31b4-774f-49f5-aec6-592104283209": "/products/cup-noodles-nissin-galinha-caipira-picante-70g.jpg",
  "159e9aa1-7848-4b39-b101-291e21f8b217": "/products/cup-noodles-nissin-costela-70g.jpg",
  "72a3291b-4f84-433c-9ba3-e445935fe0d9": "/products/seleta-de-legumes-em-conserva-ole-200g.jpg",
  "054fdaa5-99b2-45a8-909e-30981c8b7625": "/products/feijao-carioca-bernardo-1kg.jpg",
  "pinho-sol-floral-500ml": pinhoSolFloralAsset.url,
  "alpes-lavanda-500ml": alpesLavandaAsset.url,
  "alpes-limao-500ml": alpesLimaoAsset.url,
  "alpes-maca-500ml": alpesMacaAsset.url,
  "minuano-marinha-500ml": minuanoMarinhaAsset.url,
  "ype-limao-500ml": ypeLimaoAsset.url,
};

function ProductImage({ product, size = "default", eager = false }: { product: Product | any; size?: "compact" | "default" | "hero" | "basket"; eager?: boolean }) {
  const fallback = "/products/arroz-tio-joao-5kg.png";
  
  const lowerName = product.name?.toLowerCase() || "";
  const isDetergent = lowerName.includes("detergente") || product.category?.toLowerCase().includes("limpeza");
  const isBean = lowerName.includes("feijao");
  const isOil = lowerName.includes("oleo");
  const isChicken = lowerName.includes("frango");
  const isBiscuit = lowerName.includes("biscoito") || lowerName.includes("bolacha");
  const isPasta = lowerName.includes("macarrão") || lowerName.includes("macarrao") || lowerName.includes("nissin") || lowerName.includes("lámen") || lowerName.includes("lamen");
  const isBread = lowerName.includes("pão") || lowerName.includes("pao");
  const isSponge = lowerName.includes("esponja");
  
  // Specific fallbacks based on brand/scent/type
  let detergentFallback = ypeNeutroAsset.url;
  if (lowerName.includes("pinho sol")) detergentFallback = pinhoSolFloralAsset.url;
  else if (lowerName.includes("alpes")) {
    if (lowerName.includes("lavanda")) detergentFallback = alpesLavandaAsset.url;
    else if (lowerName.includes("limão") || lowerName.includes("limao")) detergentFallback = alpesLimaoAsset.url;
    else if (lowerName.includes("maçã") || lowerName.includes("maca")) detergentFallback = alpesMacaAsset.url;
  }
  else if (lowerName.includes("minuano")) detergentFallback = minuanoMarinhaAsset.url;
  else if (lowerName.includes("ypê") || lowerName.includes("ype")) {
    if (lowerName.includes("limão") || lowerName.includes("limao")) detergentFallback = ypeLimaoAsset.url;
  }

  let biscuitFallback = "/products/biscoito-wafer-bauducco-sabores-70g.jpg";
  if (lowerName.includes("itamaraty") && lowerName.includes("morango")) biscuitFallback = itamaratyMorangoAsset.url;
  else if (lowerName.includes("escureto")) biscuitFallback = escureto35gAsset.url;

  let pastaFallback = "/products/molho-de-tomate-tarantella-tradicional-300g.jpg"; // Generic fallback
  if (isPasta && (lowerName.includes("carne") || lowerName.includes("nissin"))) pastaFallback = nissinCarneAsset.url;

  const spongeFallback = esponjaBrilhusAsset.url;
  const breadFallback = paoCestaAsset.url;
  const beanFallback = "/products/feijao-kicaldo-1kg.jpg";
  const oilFallback = "/products/oleo-liza-900ml.jpg";
  const chickenFallback = frangoSearaAsset.url;

  let selectedFallback = fallback;
  if (isDetergent) selectedFallback = detergentFallback;
  else if (isBean) selectedFallback = beanFallback;
  else if (isOil) selectedFallback = oilFallback;
  else if (isChicken) selectedFallback = chickenFallback;
  else if (isBiscuit) selectedFallback = biscuitFallback;
  else if (isPasta) selectedFallback = pastaFallback;
  else if (isBread) selectedFallback = breadFallback;
  else if (isSponge) selectedFallback = spongeFallback;

  const src = product.image_url || 
              productImages[product.slug] || 
              productImages[String(product.id)] || 
              selectedFallback;
  
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;
    
    // Skip local assets that are already "clean" enough or if it's already a blob
    if (src.startsWith('data:') || src.startsWith('blob:')) {
      setProcessedSrc(src);
      return;
    }

    const removeBackground = async (imageSrc: string) => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageSrc;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return imageSrc;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Simple flood-fill / corner color detection for background removal
        // We look at the 4 corners to guess the background color
        const corners = [
          [0, 0], [canvas.width - 1, 0], 
          [0, canvas.height - 1], [canvas.width - 1, canvas.height - 1]
        ].map(([x, y]) => {
          const idx = (y * canvas.width + x) * 4;
          return [data[idx], data[idx + 1], data[idx + 2]];
        });

        // Average corner color
        const bgR = corners.reduce((sum, c) => sum + c[0], 0) / 4;
        const bgG = corners.reduce((sum, c) => sum + c[1], 0) / 4;
        const bgB = corners.reduce((sum, c) => sum + c[2], 0) / 4;

        const threshold = 45; // Sensitivity

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          const diff = Math.sqrt(
            Math.pow(r - bgR, 2) + 
            Math.pow(g - bgG, 2) + 
            Math.pow(b - bgB, 2)
          );

          if (diff < threshold) {
            // Check if it's likely a background pixel (near the edges or matches corner color)
            // To preserve center details even if they match background color
            data[i + 3] = 0; 
          } else if (diff < threshold + 20) {
            // Soft edges
            data[i + 3] = ((diff - threshold) / 20) * 255;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL('image/png');
      } catch (err) {
        console.warn("Background removal failed:", err);
        return imageSrc;
      }
    };

    removeBackground(src).then(setProcessedSrc);
  }, [src]);

  return (
    <div className={`product-photo product-photo--${size}`}>
      <img 
        src={processedSrc || src} 
        alt={`Embalagem de ${product.name}`} 
        loading={eager ? "eager" : "lazy"} 
        crossOrigin="anonymous"
        className={processedSrc ? "is-processed" : ""}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== selectedFallback) {
            target.src = selectedFallback;
          }
        }} 
      />
      <div className="product-photo-overlay" aria-hidden="true" />
    </div>
  );
}

import logoAsset from "./assets/logo-clean.png.asset.json";

function Brand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <div 
      className={`brand ${inverse ? "brand--inverse" : ""} ${compact ? "brand--compact" : ""}`} 
      onClick={() => window.location.href = "/"}
      style={{ cursor: 'pointer' }}
      role="link"
      tabIndex={0}
      aria-label="PreçoCerto — página inicial"
      onKeyDown={(e) => e.key === 'Enter' && (window.location.href = "/")}
    >
      <img 
        className="brand__logo-img"
        src={logoAsset.url} 
        alt="PreçoCerto" 
      />
    </div>
  );
}




function Header({ basketCount, user, onLogout }: { basketCount: number; user: any; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = window.location.pathname === "/";
  const headerClass = `site-header ${isHome ? "site-header--absolute" : ""} ${scrolled ? "site-header--scrolled" : ""}`;

  return <header className={headerClass}>
    <div className="shell header-inner">
      <span className="header-location" onClick={() => window.location.href = "/estabelecimentos"} style={{ cursor: 'pointer' }}><MapPin size={14} /> Feijó, AC</span>
      <nav className="desktop-nav" aria-label="Navegação principal">
        <a href="/buscar">Comparar preços</a><a href="/melhores-precos">Ofertas</a><a href="/cesta-basica">Cesta inteligente</a><a href="/estabelecimentos">Estabelecimentos</a><a href="/planos">Planos</a>

      </nav>
      <div className="header-actions">
        <button 
          className="icon-button" 
          onClick={toggleTheme} 
          aria-label={theme === 'light' ? "Mudar para modo escuro" : "Mudar para modo claro"}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <a className="icon-button" href="/buscar" aria-label="Buscar"><Search size={20} /></a>
        <a className="icon-button basket-button" href="/cesta" aria-label={`Cesta com ${basketCount} itens`}><ShoppingBasket size={20} />{basketCount > 0 && <span>{basketCount}</span>}</a>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="/perfil" style={{ fontSize: '0.9rem', color: 'var(--muted)', textDecoration: 'none' }}>Olá, <strong>{user.name.split(' ')[0]}</strong></a>
            <button className="text-link" onClick={onLogout}>Sair</button>
          </div>
        ) : (
          <>
            <a className="text-link" href="/login">Entrar</a>
            <a className="button button--primary button--small" href="/cadastro">Começar grátis <ArrowRight size={16} /></a>
          </>
        )}
      </div>
      <button className="mobile-menu-button" onClick={() => setOpen(true)} aria-label="Abrir menu" aria-expanded={open}><Menu /></button>
    </div>
    {open && <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Menu principal"><button className="drawer-backdrop" aria-label="Fechar menu" onClick={() => setOpen(false)} /><div className="drawer-panel"><div className="drawer-head"><button className="icon-button" onClick={() => setOpen(false)} aria-label="Fechar menu"><X /></button></div><nav><a href="/buscar">Comparar preços</a><a href="/cesta-basica">Cesta inteligente</a><a href="/estabelecimentos">Estabelecimentos</a><a href="/melhores-precos">Ofertas de hoje</a><a href="/planos">Planos</a><a href="/colaborar">Enviar nota fiscal</a><a href="/admin" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #eee', color: '#888', fontSize: '0.9rem' }}>Área Administrativa</a></nav><a className="button button--primary" href="/cadastro">Criar conta gratuita</a><a className="button button--ghost" href="/login">Já tenho uma conta</a></div></div>}
  </header>;
}

function Footer() {
  return <footer className="site-footer"><div className="shell footer-grid"><div><Brand inverse /><p>Compare preços reais no comércio de Feijó e transforme cada compra em economia.</p><span className="footer-place"><MapPin size={15} /> Feijó • Acre • Brasil</span></div><div><h3>Descobrir</h3><a href="/buscar">Comparar preços</a><a href="/cesta-basica">Cesta inteligente</a><a href="/estabelecimentos">Estabelecimentos</a><a href="/farmacias">Farmácias de plantão</a></div><div><h3>PreçoCerto</h3><a href="/#como-funciona">Como funciona</a><a href="/lojista">Para empresas</a><a href="/colaborar">Colaborar</a><a href="/fale-conosco">Fale conosco</a></div><div><h3>Conta</h3><a href="/login">Entrar</a><a href="/cadastro">Criar conta</a><a href="/planos">Planos</a><a href="/admin">Área Administrativa</a></div></div><div className="shell footer-bottom"><span>SKAES NET TECHNOLOGY • FRANC D’NIS</span><span>© 2026 PreçoCerto. Todos os direitos reservados.</span></div></footer>;
}

function MobileBar({ basketCount }: { basketCount: number }) {
  return <nav className="mobile-bar" aria-label="Navegação móvel"><a href="/"><Home /><span>Início</span></a><a href="/buscar"><Search /><span>Buscar</span></a><a href="/alertas"><Bell /><span>Alertas</span></a><a href="/cesta" className="mobile-basket"><ShoppingBasket />{basketCount > 0 && <b>{basketCount}</b>}<span>Cesta</span></a><a href="/app"><UserRound /><span>Painel</span></a></nav>;
}

function SearchBox({ value, setValue, products, hero = false }: { value: string; setValue: (v: string) => void; products: Product[]; hero?: boolean }) {
  const [focused, setFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const debounceTimer = useRef<any>(null);

  // Debounce para evitar consultas excessivas ao digitar
  useEffect(() => {
    if (localValue === value) return;
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setValue(localValue);
    }, 400);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [localValue, setValue, value]);

  // Sincroniza valor local se o pai mudar (ex: limpar filtros)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const normalize = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const q = normalize(localValue);
  
  const suggestions = useMemo(() => {
    if (!localValue) return products.slice(0, 6);
    return products.filter(p => 
      normalize(p.name).includes(q) || 
      normalize(p.category).includes(q) || 
      normalize(p.brand).includes(q) ||
      (p.barcode && p.barcode.includes(localValue))
    ).slice(0, 6);
  }, [localValue, products, q]);

  function submit(event: FormEvent) { 
    event.preventDefault(); 
    const queryStr = localValue.trim(); 
    setValue(queryStr); // Aplica imediatamente no submit
    window.location.href = queryStr ? `/buscar?q=${encodeURIComponent(queryStr)}` : "/buscar"; 
  }

  return <div className={`search-combo ${hero ? "search-combo--hero" : ""}`}>
    <form onSubmit={submit} role="search">
      <Search size={20} className="search-combo__icon" aria-hidden="true" />
      <label className="sr-only" htmlFor={hero ? "hero-search" : "page-search"}>Buscar produto</label>
      <input 
        id={hero ? "hero-search" : "page-search"} 
        className="search-combo__input"
        role="combobox" 
        value={localValue} 
        onChange={e => setLocalValue(e.target.value)} 
        onFocus={() => setFocused(true)} 
        onBlur={() => setTimeout(() => setFocused(false), 200)} 
        placeholder="Busque arroz, café, carne, leite..." 
        autoComplete="off" 
        aria-expanded={focused} 
        aria-controls={hero ? "hero-suggestions" : "page-suggestions"} 
        aria-autocomplete="list" 
      />
      <button className="button button--primary search-combo__button" type="submit">
        <span className="search-combo__button-text">Comparar preços</span>
        <ArrowRight size={18} />
      </button>
    </form>

    {focused && (
      <div className="suggestions" id={hero ? "hero-suggestions" : "page-suggestions"} role="listbox">
        <div className="suggestions-label">{value ? "Sugestões encontradas" : "Buscas populares em Feijó"}</div>
        {suggestions.length > 0 ? (
          suggestions.map(p => (
            <a role="option" aria-selected="false" href={`/buscar?q=${encodeURIComponent(p.name)}`} key={p.id}>
              <span className="suggestion-icon"><PackageSearch size={18} /></span>
              <span><strong>{p.name}</strong><small>{p.brand} • {p.size}</small></span>
              <span className="suggestion-price"><small>a partir de</small><b>{money(p.minPrice)}</b><a href={`/estabelecimento/${p.establishmentSlug}`} style={{ color: 'inherit', fontWeight: 'normal', fontStyle: 'normal' }} onClick={(e) => e.stopPropagation()}>{p.establishment}</a></span>
            </a>
          ))
        ) : value.length > 2 ? (
          <div className="no-suggestions-prompt">
             <small>Nenhuma sugestão para "{value}"</small>
             <button onClick={() => setValue(value.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))} className="text-link">
               Tentar sem acentos?
             </button>
          </div>
        ) : null}
      </div>
    )}
  </div>;
}


function PriceBadge({ product }: { product: Product }) {
  if (!product) return null;
  const saving = product.previousPrice ? Math.max(0, ((product.previousPrice - product.minPrice) / product.previousPrice) * 100) : 0;
  if (saving <= 0) return null;
  return <span className="price-badge"><TrendingDown size={13} /> {saving.toFixed(0)}% menor</span>;
}

function useRandomFeatured(products: Product[]) {
  const [randomFeatured, setRandomFeatured] = useState<Product[]>([]);

  useEffect(() => {
    const pickRandom = () => {
      const attractive = [...products].sort((a, b) => {
        const aSaving = a.previousPrice ? (a.previousPrice - a.minPrice) / a.previousPrice : 0;
        const bSaving = b.previousPrice ? (b.previousPrice - b.minPrice) / b.previousPrice : 0;
        return bSaving - aSaving;
      });

      const selected: Product[] = [];
      const usedStores = new Set();
      
      for (const p of attractive) {
        if (!usedStores.has(p.establishmentId)) {
          selected.push(p);
          usedStores.add(p.establishmentId);
        }
        if (selected.length >= 6) break;
      }
      
      if (selected.length < 6) {
        for (const p of attractive) {
          if (!selected.find(s => s.id === p.id)) {
            selected.push(p);
          }
          if (selected.length >= 6) break;
        }
      }

      setRandomFeatured(selected.sort(() => Math.random() - 0.5));
    };

    pickRandom();
    const interval = setInterval(pickRandom, 3600000); // 60 minutes
    return () => clearInterval(interval);
  }, [products]);

  return randomFeatured;
}

function HomePage({ products, stores, metrics, query, setQuery, addBasket, saveAction }: PageProps) {
  const [priceMode, setPriceMode] = useState<"recent" | "lowest">("recent");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const randomFeatured = useRandomFeatured(products);

  const rows = [...products].sort((a,b) => priceMode === "lowest" ? a.minPrice - b.minPrice : Date.parse(b.capturedAt) - Date.parse(a.capturedAt)).slice(0, 6);
  const featured = randomFeatured[featuredIndex] ?? products[0];
  return <>
    <section className="hero">
      <div className="hero-photo" />
      <div className="hero-wash" />
      <div className="shell hero-content">
        <div className="hero-copy">
          <span className="hero-live"><i /> Inteligência de compra em tempo real</span>
          <span className="eyebrow eyebrow--light"><MapPin size={14} /> Curadoria local • Feijó • Acre</span>
          <h1>Compre melhor.<br/><span>Gaste menos.</span></h1>
          <p>Uma leitura precisa do comércio local para você encontrar a melhor combinação de preço, loja e conveniência.</p>
          <div className="hero-actions">
            <SearchBox value={query} setValue={setQuery} products={products} hero />
            <a href="/buscar" className="button button--white">Explorar ofertas <ArrowRight size={18} /></a>
          </div>
          <div className="hero-trust"><span><CheckCircle2 /> Preços verificados</span><span><Clock3 /> Atualização contínua</span><span><ShieldCheck /> Dados protegidos</span></div>
        </div>
        <aside className="hero-radar hero-commerce" aria-label="Comparação interativa em destaque">
          <div className="radar-head"><span><Activity /> Comparação inteligente</span><em>ao vivo</em></div>
          {featured && <><div className="commerce-product"><ProductImage product={featured} size="hero" eager /><div className="commerce-copy"><span>{featured.category} • {featured.size}</span><h2>{featured.name}</h2><small><ShieldCheck /> preço verificado há 8 min</small></div></div><div className="commerce-prices"><div><small>Melhor preço</small><strong>{money(featured.minPrice)}</strong><span>em {featured.establishment}</span></div><div className="commerce-chart"><svg viewBox="0 0 250 72" role="img" aria-label="Tendência de preço em queda"><defs><linearGradient id="priceArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#54d69a" stopOpacity=".42"/><stop offset="1" stopColor="#54d69a" stopOpacity="0"/></linearGradient></defs><path d="M4 14 C28 18 35 30 58 27 S92 18 112 35 S146 50 168 41 S202 28 246 55 L246 70 L4 70 Z" fill="url(#priceArea)"/><path d="M4 14 C28 18 35 30 58 27 S92 18 112 35 S146 50 168 41 S202 28 246 55" fill="none" stroke="#65dfa8" strokeWidth="3" strokeLinecap="round"/><circle cx="246" cy="55" r="5" fill="#65dfa8" stroke="#08243a" strokeWidth="3"/></svg><span><TrendingDown /> caiu {money(Math.max(0,(featured.previousPrice ?? featured.maxPrice)-featured.minPrice))}</span></div></div><div className="commerce-actions"><button className="button button--gold" onClick={()=>addBasket(featured)}><Plus /> Adicionar à cesta</button><a href={`/produto/${featured.slug}`}>Ver comparação <ArrowRight /></a></div></>}
          <div className="commerce-thumbs">{(randomFeatured.length > 0 ? randomFeatured : products).slice(0, 4).map((product, index) => <button className={featuredIndex === index ? "active" : ""} onClick={() => setFeaturedIndex(index)} aria-pressed={featuredIndex === index} aria-label={`Destacar ${product.name}`} key={product.id}><ProductImage product={product} size="compact" /><span>{product.brand}<small>{money(product.minPrice)}</small></span></button>)}</div>
        </aside>
      </div>
    </section>

    <section className="benefits-section">
      <div className="shell">
        <div className="benefits-grid">
          <div className="benefit-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="benefit-icon"><CircleDollarSign size={24} /></div>
            <h3>Economia Real</h3>
            <p>Compare preços entre mercados e economize até 30% na sua lista mensal.</p>
          </div>
          <div className="benefit-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="benefit-icon"><Clock3 size={24} /></div>
            <h3>Dados Atualizados</h3>
            <p>Nossa equipe verifica os preços diariamente nos principais comércios de Feijó.</p>
          </div>
          <div className="benefit-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="benefit-icon"><LayoutDashboard size={24} /></div>
            <h3>Cestas Inteligentes</h3>
            <p>Monte sua lista e descubra em qual loja ela sai mais barata automaticamente.</p>
          </div>
          <div className="benefit-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="benefit-icon"><ShieldCheck size={24} /></div>
            <h3>Transparência Total</h3>
            <p>Veja o histórico de preços e saiba se a oferta é realmente vantajosa.</p>
          </div>
        </div>
      </div>
    </section>
    <div className="shell metrics-float" style={{ marginTop: '0', transform: 'translateY(-20px)' }} aria-label="Métricas da plataforma"><div><span className="metric-icon"><Store /></span><strong>{count(metrics.stores)}</strong><span>estabelecimentos cadastrados</span></div><div><span className="metric-icon"><PackageSearch /></span><strong>{count(metrics.products)}</strong><span>itens cadastrados</span></div><div><span className="metric-icon"><Activity /></span><strong>{count(metrics.prices)}</strong><span>preços registrados</span></div><small><span /> Base consolidada até 7 de agosto de 2026</small></div>
    <nav className="shell category-rail" aria-label="Atalhos de compra"><span>Explore por intenção</span><a href="/categoria/mercearia"><PackageSearch /> Mercearia <ArrowRight /></a><a href="/categoria/acougue"><TrendingDown /> Ofertas do dia <ArrowRight /></a><a href="/cesta-basica"><ShoppingBasket /> Cesta essencial <ArrowRight /></a><a href="/estabelecimentos"><Store /> Mercados locais <ArrowRight /></a></nav>
    <section className="section shell featured-products">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Destaques de hoje em Feijó</span>
          <h2>Ofertas em Destaque</h2>
          <p>Produtos com preços atrativos, atualizados automaticamente a cada 60 minutos para promover todos os estabelecimentos locais.</p>
        </div>
        <a className="inline-link" href="/melhores-precos">Ver todas as ofertas <ArrowRight /></a>
      </div>
      <div className="visual-product-grid">
        {(randomFeatured.length > 0 ? randomFeatured : products).slice(0, 6).map((p, index) => (
          <article className="visual-product-card" key={p.id}>
            <button className="floating-favorite" onClick={() => saveAction("favorite", "product", String(p.id))} aria-label={`Favoritar ${p.name}`}>
              <Heart />
            </button>
            <a className="visual-product-image" href={`/produto/${p.slug}`}>
              <span className="position-number">0{index + 1}</span>
              <ProductImage product={p} />
              {p.previousPrice && p.previousPrice > p.minPrice && (
                <span className="price-drop-tag"><TrendingDown size={14}/> -{Math.round((1 - p.minPrice / p.previousPrice) * 100)}%</span>
              )}
              <span className="verified-chip"><ShieldCheck /> Verificado</span>
            </a>

            <div className="visual-product-content">
              <span className="category-tag">{p.category} • {p.size}</span>
              <a className="visual-product-name" href={`/produto/${p.slug}`}>{p.name}</a>
              <div className="visual-store">
                <span className="market-dot" style={{ background: p.storeColor }} />
                <a href={`/estabelecimento/${p.establishmentSlug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <span><strong>{p.establishment}</strong><small><MapPin /> {p.neighborhood}</small></span>
                </a>
              </div>

              <div className="visual-price">
                <span><small>a partir de</small><strong>{money(p.minPrice)}</strong></span>
                {p.previousPrice && p.previousPrice > p.minPrice && (
                  <span className="old-price"><small>era</small><s>{money(p.previousPrice)}</s></span>
                )}
              </div>
              <div className="mini-trend">
                <svg viewBox="0 0 180 34" aria-hidden="true">
                  <path d={`M2 ${9 + index % 3 * 3} C24 ${7 + index}, 31 ${22 - index}, 54 18 S86 ${8 + index}, 108 20 S145 ${27 - index}, 178 ${13 + index}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="178" cy={13 + index} r="3" fill="currentColor" />
                </svg>
                <span><TrendingDown /> {Math.max(3, Math.round((1 - p.minPrice / p.maxPrice) * 100))}% abaixo do maior</span>
              </div>
              <div className="visual-product-actions">
                <button className="button button--primary" onClick={() => addBasket(p)}><Plus /> Cesta</button>
                <a href={`/produto/${p.slug}`} className="button button--ghost button--small">Comparar</a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
    <section className="section shell"><div className="section-heading"><div><span className="eyebrow">Economia pronta para você</span><h2>Cestas otimizadas</h2><p>Combinações que aproveitam o melhor preço de cada mercado de Feijó.</p></div><a className="inline-link" href="/cesta-basica">Ver todas as cestas <ArrowRight /></a></div><div className="basket-grid"><article className="basket-feature"><div className="basket-top"><span className="basket-icon"><ShoppingBasket /></span><PriceBadge product={products[0]} /></div><p>Cesta essencial da semana</p><h3>12 itens em 2 mercados</h3><div className="basket-total"><span>Valor otimizado</span><strong>{money(87.34)}</strong><small>economia estimada de {money(18.62)}</small></div><div className="store-route"><span><b style={{background: stores[0]?.color}}>CS</b> Central Super · 8 itens</span><span><b style={{background: stores[1]?.color}}>MR</b> Rebouças · 4 itens</span></div><a href="/cesta-basica" className="button button--dark">Abrir cesta otimizada <ArrowRight /></a></article><article className="basket-plan"><span className="eyebrow">Planejamento inteligente</span><h3>Quanto você quer gastar?</h3><p>Informe seu orçamento e montamos a melhor cesta possível, explicando cada escolha.</p><div className="budget-chips"><a href="/cesta-basica?orcamento=80">R$ 80</a><a href="/cesta-basica?orcamento=100">R$ 100</a><a href="/cesta-basica?orcamento=150">R$ 150</a><a href="/cesta-basica?orcamento=200">R$ 200</a></div><a href="/cesta-basica" className="inline-link">Montar minha cesta <ArrowRight /></a></article></div></section>
    <section className="section section--soft"><div className="shell"><div className="section-heading"><div><span className="eyebrow">Agora em Feijó</span><h2>Preços em tempo real</h2><p>Compare registros recentes e encontre o menor preço com transparência.</p></div><div className="segmented"><button className={priceMode === "recent" ? "active" : ""} onClick={() => setPriceMode("recent")}>Recentes</button><button className={priceMode === "lowest" ? "active" : ""} onClick={() => setPriceMode("lowest")}>Menor preço</button></div></div><div className="price-table-card"><div className="price-table-head"><span>Produto</span><span>Mercado</span><span>Preço</span><span>Atualizado</span><span>Ação</span></div>{rows.map((p, index) => <div className="price-row" key={p.id}><div className="product-cell"><ProductImage product={p} size="compact" /><span><a href={`/produto/${p.slug}`}>{p.name}</a><small>{p.brand} • {p.size}</small></span></div><div className="market-cell"><span className="market-dot" style={{background:p.storeColor}} /> <span><a href={`/estabelecimento/${p.establishmentSlug}`} style={{ color: 'inherit', fontWeight: 'bold' }}>{p.establishment}</a><small>{p.neighborhood}</small></span></div><div><strong className="green-price">{money(p.minPrice)}</strong>{index < 3 && <PriceBadge product={p} />}</div><div><span className="freshness"><Clock3 /> há {8 + index * 7} min</span></div><div className="row-actions"><button onClick={() => saveAction("favorite", "product", String(p.id))} aria-label={`Favoritar ${p.name}`}><Heart /></button><button onClick={() => addBasket(p)} aria-label={`Adicionar ${p.name} à cesta`}><Plus /></button></div></div>)}<div className="table-footer"><a href="/buscar">Abrir catálogo completo <ArrowRight /></a><span><ShieldCheck /> Dados auditáveis e verificados</span></div></div></div></section>
    <section className="section shell"><div className="section-heading"><div><span className="eyebrow">Rede local</span><h2>Estabelecimentos monitorados</h2><p>Preço e disponibilidade perto de você, bairro por bairro.</p></div><a className="inline-link" href="/estabelecimentos">Ver diretório <ArrowRight /></a></div><div className="store-grid">{stores.map(store => <a className="store-card" href={`/estabelecimento/${store.slug}`} key={store.id}><span className="store-logo" style={{background:store.color}}>{store.name.split(" ").map(v=>v[0]).join("").slice(0,2)}</span><span><strong>{store.name}</strong><small><MapPin /> {store.neighborhood}</small></span><ChevronRight /></a>)}</div></section>
    <section className="section shell" id="como-funciona">
      <div className="section-heading center">
        <span className="eyebrow">Simples e direto</span>
        <h2>Como funciona o PreçoCerto</h2>
        <p>Economize em Feijó seguindo estes 3 passos fundamentais.</p>
      </div>
      <div className="steps-grid">
        <div className="step-card">
          <div className="step-number">01</div>
          <h3>Busque Produtos</h3>
          <p>Digite o nome do item que você precisa. Nossa base cobre desde mercearia até limpeza com preços de {metrics.stores} lojas locais.</p>
        </div>
        <div className="step-card">
          <div className="step-number">02</div>
          <h3>Compare Ofertas</h3>
          <p>Veja onde o produto está mais barato hoje. Analise o histórico e a validade do preço verificado por nossa equipe.</p>
        </div>
        <div className="step-card">
          <div className="step-number">03</div>
          <h3>Economize Real</h3>
          <p>Monte sua cesta e escolha o melhor mercado (ou a combinação deles) para finalizar sua compra com o menor custo possível.</p>
        </div>
      </div>
    </section>
    <section className="shell final-cta"><div><span className="eyebrow eyebrow--gold">Economia inteligente todos os dias</span><h2>Antes de comprar,<br/>compare com o PreçoCerto.</h2><p>Crie sua conta gratuita, salve listas e receba alertas quando o preço baixar.</p><a className="button button--gold" href="/cadastro">Criar minha conta gratuita <ArrowRight /></a></div><div className="cta-stat"><span>Economia potencial</span><strong>R$ 186,40</strong><small>média mensal em uma cesta familiar</small><div><TrendingDown /> −14,8% no custo estimado</div></div></section>
    <section className="section shell professional"><div className="section-heading"><div><span className="eyebrow">Para o comércio local</span><h2>Painel de inteligência de mercado</h2><p>Acompanhe cobertura, competitividade e oportunidades sem perder o contexto local.</p></div><a href="/lojista" className="button button--outline">Conhecer painel lojista</a></div><div className="dashboard-preview"><div className="preview-sidebar"><Brand compact /><span className="active"><LayoutDashboard />Visão geral</span><span><Store />Lojas</span><span><PackageSearch />Produtos</span><span><LineChart />Tendências</span><span><Settings />Configurações</span></div><div className="preview-main"><div className="preview-title"><div><small>Monitoramento</small><h3>Estabelecimentos</h3></div><button><Plus /> Adicionar loja</button></div><div className="mini-kpis"><span><small>Lojas ativas</small><b>{stores.length}</b></span><span><small>Produtos cobertos</small><b>82%</b></span><span><small>Atualizações hoje</small><b>214</b></span></div>{stores.slice(0,3).map((s,i)=><div className="sync-row" key={s.id}><span className="store-logo small" style={{background:s.color}}>{s.name.slice(0,2)}</span><span><b>{s.name}</b><small>Última sincronização há {i*9+4} min</small></span><em>Ativo</em><span className="insight">{i===0 ? "12 preços líderes" : i===1 ? "Cobertura em alta" : "3 itens para revisar"}</span><button aria-label={`Abrir ${s.name}`}><ChevronRight /></button></div>)}</div></div></section>
  </>;
}

// Interface compartilhada para as páginas que recebem o catálogo e estados globais
interface PageProps {
  products: Product[];
  stores: StoreRow[];
  metrics: PlatformMetrics;
  query: string;
  setQuery: (v: string) => void;
  addBasket: (p: Product) => void;
  saveAction: (action: string, type: string, id: string) => void;
}

function BasketPage({ products, addBasket }: PageProps & { cart: Product[]; removeBasket:(id:number)=>void }) {
  const [mode, setMode] = useState("budget"); const [budget, setBudget] = useState(150); const [items, setItems] = useState<Product[]>(products.slice(0,5));
  const total = items.reduce((sum,p)=>sum+p.minPrice,0); const singleStoreTotal = total * 1.118;
  function toggle(p:Product){ setItems(current=>current.some(i=>i.id===p.id)?current.filter(i=>i.id!==p.id):[...current,p]); }
  return <div className="shell page-shell basket-page"><div className="page-title"><div><span className="eyebrow">Cesta básica avançada</span><h1>Planeje a compra inteira</h1><p>Compare cobertura, itens ausentes e o impacto de dividir sua compra.</p></div><span className="location-pill"><MapPin/> Feijó, AC <ChevronDown/></span></div><div className="mode-tabs" role="tablist"><button className={mode==="budget"?"active":""} onClick={()=>setMode("budget")}><CircleDollarSign/> Tenho um valor</button><button className={mode==="items"?"active":""} onClick={()=>setMode("items")}><ListChecks/> Quero escolher itens</button><button className={mode==="stores"?"active":""} onClick={()=>setMode("stores")}><Store/> Comparar mercados</button></div><div className="basket-workspace"><section className="basket-builder">{mode==="budget"&&<><div className="builder-head"><div><span className="step-number">1</span><span><h2>Defina seu orçamento</h2><p>Montaremos a melhor combinação sem ultrapassar esse valor.</p></span></div><strong>{money(budget)}</strong></div><input className="budget-slider" type="range" min="50" max="300" step="10" value={budget} onChange={e=>setBudget(Number(e.target.value))}/><div className="budget-presets">{[50,80,100,150,200,300].map(v=><button className={budget===v?"active":""} onClick={()=>setBudget(v)} key={v}>{money(v)}</button>)}</div></>}{mode==="stores"&&<div className="builder-head"><div><span className="step-number">1</span><span><h2>Ranking por cobertura</h2><p>O custo da mesma cesta em cada supermercado.</p></span></div></div>}{mode==="items"&&<div className="builder-head"><div><span className="step-number">1</span><span><h2>Escolha os essenciais</h2><p>Adicione ou remova itens para recalcular em tempo real.</p></span></div></div>}<hr/><div className="builder-head"><div><span className="step-number">2</span><span><h2>Itens da cesta</h2><p>{items.length} selecionados • compatibilidade por tamanho e categoria</p></span></div><button className="text-button"><Plus/> Adicionar avulso</button></div><div className="basket-items">{products.slice(0,6).map(p=><button className={items.some(i=>i.id===p.id)?"selected":""} onClick={()=>toggle(p)} key={p.id}><span>{items.some(i=>i.id===p.id)?<Check/>:<Plus/>}</span><div><b>{p.name}</b><small>{p.size} • a partir de {money(p.minPrice)}</small></div></button>)}</div><div className="ai-helper"><span><Sparkles/></span><div><b>Assistente da cesta</b><p>Posso ajustar o orçamento, trocar itens e explicar de onde vem a economia.</p></div><button>Conversar <ArrowRight/></button></div></section><aside className="basket-summary"><span className="eyebrow">Melhor combinação</span><h2>{items.length} itens em 2 mercados</h2><div className="coverage"><div><span>Cobertura da cesta</span><b>100%</b></div><i><span style={{width:"100%"}}/></i><small><CheckCircle2/> Nenhum item ausente</small></div><div className="route-stop"><span className="store-logo small" style={{background:"#1473E6"}}>CS</span><div><b>Central Super</b><small>{Math.ceil(items.length*.6)} itens • Centro</small></div><strong>{money(total*.61)}</strong></div><div className="route-stop"><span className="store-logo small" style={{background:"#16A36A"}}>MR</span><div><b>Mercado Rebouças</b><small>{Math.floor(items.length*.4)} itens • Esperança</small></div><strong>{money(total*.39)}</strong></div><div className="summary-total"><span>Total otimizado</span><strong>{money(total)}</strong><small>Orçamento restante: {money(Math.max(0,budget-total))}</small></div><div className="saving-box"><TrendingDown/><span><b>Você economiza {money(singleStoreTotal-total)}</b><small>{Math.round((1-total/singleStoreTotal)*100)}% comparado a comprar tudo em uma loja</small></span></div><button className="button button--primary button--full" onClick={()=>items.forEach(addBasket)}>Usar esta cesta <ArrowRight/></button><div className="summary-links"><button><Share2/> Compartilhar</button><button><Download/> Gerar PDF</button><button><Bell/> Criar alerta</button></div></aside></div></div>;
}

function PlansPage() {
  const [shop, setShop] = useState(false); const plans = shop ? [{name:"Parceiro Local",price:29.9,desc:"Presença local e catálogo essencial",features:["Perfil verificado","Gestão de catálogo","Métricas essenciais"]},{name:"Parceiro Pro",price:69.9,desc:"Mais alcance e inteligência",features:["Tudo do Local","Promoções em destaque","Tendências de mercado"],featured:true},{name:"Business",price:149.9,desc:"Operação com múltiplas unidades",features:["Tudo do Pro","Equipe e permissões","Relatórios avançados"]}] : [{name:"Grátis",price:0,desc:"Compare antes de comprar",features:["Busca de preços","1 cesta salva","1 consulta de IA"]},{name:"Mensal",price:24.9,desc:"Economia sem compromisso",features:["Consultas ilimitadas","Alertas de queda","Histórico completo"],featured:true},{name:"Anual",price:179.9,desc:"O melhor custo-benefício",features:["Tudo do Mensal","Exportações","Cota ampliada de IA"]}];
  return <div className="shell page-shell plans-page"><div className="center-heading"><span className="eyebrow">Planos PreçoCerto</span><h1>Economia que se paga na primeira compra</h1><p>Recursos transparentes para consumidores e para o comércio local.</p><div className="segmented large"><button className={!shop?"active":""} onClick={()=>setShop(false)}>Para você</button><button className={shop?"active":""} onClick={()=>setShop(true)}>Para sua loja</button></div></div><div className="plan-grid">{plans.map(plan=><article className={plan.featured?"featured":""} key={plan.name}>{plan.featured&&<span className="recommended">Recomendado</span>}<h2>{plan.name}</h2><p>{plan.desc}</p><div className="plan-price"><strong>{money(plan.price)}</strong><span>/mês</span></div><a className={`button button--full ${plan.featured?"button--primary":"button--outline"}`} href={`/checkout/${plan.name.toLowerCase().replace(" ","-")}`}>{plan.price===0?"Começar grátis":"Escolher plano"}<ArrowRight/></a><ul>{plan.features.map(f=><li key={f}><Check/> {f}</li>)}</ul></article>)}</div><div className="plan-note"><ShieldCheck/><span><b>Pagamento seguro via Pix</b><small>Ativação automática após confirmação. Cancele quando quiser.</small></span></div></div>;
}

function AdminPage({ path, onLogout, products: allProducts, stores: allStores }: { path: string; onLogout: () => void; products: Product[]; stores: StoreRow[] }) {
  const [auditLogs, setAuditLogs] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem("precocerto:admin_logs") ?? "[]"); } catch { return []; }
  });
  const [connStatus, setConnStatus] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const [importProgress, setImportProgress] = useState(0);
  const [importTotal, setImportTotal] = useState(2838);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [importLog, setImportLog] = useState<any>(null);
  const [showAddStore, setShowAddStore] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [activeKpiDetail, setActiveKpiDetail] = useState<{title: string, data: any[]} | null>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Novos Estados Administrativos
  const [adminSearch, setAdminSearch] = useState("");
  const [adminFilterStore, setAdminFilterStore] = useState("all");
  const [adminActiveTab, setAdminActiveTab] = useState<"products" | "stores">("products");
  const [editingItem, setEditingItem] = useState<{ type: 'product' | 'store', data: any } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'product' | 'store', id: string, name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [photoViewer, setPhotoViewer] = useState<{ url: string, name: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [newProductPhoto, setNewProductPhoto] = useState<{ file: File, url: string } | null>(null);
  const [activeAdminView, setActiveAdminView] = useState<"dashboard" | "catalog" | "images">("dashboard");
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadLogs = () => {
    try {
      const logs = JSON.parse(localStorage.getItem("precocerto:admin_logs") ?? "[]");
      setAuditLogs(logs);
    } catch {
      setAuditLogs([]);
    }
  };

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesDate = !dateFilter || log.at.startsWith(dateFilter);
      const matchesType = typeFilter === "all" || log.type === typeFilter;
      return matchesDate && matchesType;
    });
  }, [auditLogs, dateFilter, typeFilter]);

  const sortedProducts = useMemo(() => {
    let items = [...allProducts];
    if (sortConfig && sortConfig.key) {
      items.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [allProducts, sortConfig]);

  const sortedStores = useMemo(() => {
    let items = [...allStores];
    if (sortConfig && sortConfig.key) {
      items.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [allStores, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };


  // Logica de busca, ordenação e paginação
  const filteredProducts = useMemo(() => {
    return sortedProducts.filter(p => {
      const searchMatch = !adminSearch || 
        p.name.toLowerCase().includes(adminSearch.toLowerCase()) || 
        p.barcode?.includes(adminSearch);
      const storeMatch = adminFilterStore === "all" || p.establishment === adminFilterStore;
      const photoMatch = path !== "/admin/fotos-pendentes" || !p.image_url;
      return searchMatch && storeMatch && photoMatch;
    });
  }, [sortedProducts, adminSearch, adminFilterStore]);

  const filteredStores = useMemo(() => {
    return sortedStores.filter(s => {
      const searchMatch = !adminSearch || s.name.toLowerCase().includes(adminSearch.toLowerCase());
      return searchMatch;
    });
  }, [sortedStores, adminSearch]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const paginatedStores = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStores.slice(start, start + itemsPerPage);
  }, [filteredStores, currentPage, itemsPerPage]);

  const totalPages = Math.ceil((adminActiveTab === 'products' ? filteredProducts.length : filteredStores.length) / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [adminSearch, adminFilterStore, adminActiveTab]);


  const handleDelete = async () => {
    if (!confirmDelete || !supabase) return;
    const { type, id, name } = confirmDelete;
    const table = type === 'product' ? 'products' : 'establishments';
    
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      alert(`Erro ao excluir: ${error.message}`);
      addAuditLog(`Falha ao excluir ${type}: ${name}`, 'error');
    } else {
      addAuditLog(`${type === 'product' ? 'Produto' : 'Estabelecimento'} excluído: ${name}`, 'warning');
      setConfirmDelete(null);
      window.location.reload(); 
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, productId: string) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}-${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);

      const { error: updateError } = await supabase.from('products').update({ image_url: publicUrl }).eq('id', productId);
      if (updateError) throw updateError;

      addAuditLog(`Imagem enviada para produto ID: ${productId}`);
      alert("Foto enviada com sucesso!");
    } catch (err: any) {
      alert(`Erro no upload: ${err.message}`);
      addAuditLog(`Erro no upload de foto: ${err.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Data/Hora", "Usuário", "Ação", "Tipo"];
    const rows = filteredLogs.map(log => [
      new Date(log.at).toLocaleString("pt-BR"),
      log.user,
      log.action,
      log.type
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `auditoria_precocerto_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    addAuditLog("Exportação de logs de auditoria realizada");
    loadLogs();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    const { testSupabaseConnection } = await import("./data/importer");
    const result = await testSupabaseConnection();
    setConnStatus(result);
    setIsTesting(false);
    addAuditLog(`Teste de conexão: ${result.success ? "Sucesso" : "Falha"}`, result.success ? "success" : "error");
    loadLogs();
  };

    const handleImport = async () => {
    setIsImporting(true);
    setImportMsg("Iniciando...");
    setImportProgress(0);
    setImportTotal(100);
    setImportLog(null);
    const { runPriceImport } = await import("./data/importer");
    const result = await runPriceImport((msg, current, total) => {
      setImportMsg(msg);
      setImportProgress(current);
      setImportTotal(total || 100);
    });
    setIsImporting(false);
    if (result.success) {
      setImportLog({
        count: result.count,
        duplicates: result.duplicates,
        stores: result.stores,
        products: result.products,
        duration: result.duration || 0,
        errorReport: result.errorReport
      });
      addAuditLog(`Importação concluída: ${result.count} novos registros`, result.errorReport?.length ? "warning" : "success");
    } else {
      setImportLog({ error: result.error, errorReport: result.errorReport });
      addAuditLog(`Falha na importação: ${result.error}`, "error");
    }
    loadLogs();
  };

  const handleLogoutRequest = () => setShowLogoutConfirm(true);
  const confirmLogout = () => {
    addAuditLog("Logout administrativo realizado");
    setShowLogoutConfirm(false);
    onLogout();
  };




  const rows = [
    ["Arroz Tio João 5 kg","Central Super","R$ 29,89","Verificado"],
    ["Café 3 Corações 500 g","Mercado Rebouças","R$ 15,75","Verificado"],
    ["Leite Integral Italac 1 L","Pague Pouco","R$ 5,69","Revisar"],
    ["Feijão Kicaldo 1 kg","Super Feijoense","R$ 7,49","Verificado"],
  ];
  const title = adminRouteNames[path] ?? (path.startsWith("/admin/cobertura/") ? "Detalhe da cobertura" : "Operação administrativa");
  return <div className="admin-shell"><aside className="admin-sidebar"><Brand inverse/><nav><span>Operação</span><button onClick={() => setActiveAdminView("dashboard")} className={activeAdminView==="dashboard"?"active":""} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'inherit', cursor: 'pointer' }}><LayoutDashboard size={18}/> Visão geral</button><button onClick={() => setActiveAdminView("catalog")} className={activeAdminView==="catalog"?"active":""} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'inherit', cursor: 'pointer' }}><PackageSearch size={18}/> Catálogo</button><button onClick={() => setActiveAdminView("images")} className={activeAdminView==="images"?"active":""} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'inherit', cursor: 'pointer' }}><Camera size={18}/> Revisar Fotos</button><a href="/admin/clientes"><Users/> Clientes</a><a href="/admin/precos"><CircleDollarSign/> Preços</a><a href="/admin/importacoes" className={path==="/admin/importacoes"?"active":""}><Database/> Importações</a><span>Inteligência</span><a href="/admin/analytics"><BarChart3/> Analytics</a><a href="/admin/auditoria"><ShieldCheck/> Auditoria</a></nav><a className="admin-back" href="/" style={{ marginBottom: '1rem' }}><ArrowRight/> Voltar ao site</a><button className="button button--ghost button--small" onClick={handleLogoutRequest} style={{ color: '#fca5a5', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start', paddingLeft: '1rem' }}><X size={16}/> Deslogar Admin</button></aside><main className="admin-main"><header><div><small>Admin / Operação</small><h1>{activeAdminView === "images" ? "Revisão de Fotos" : title}</h1></div><div>{importMsg && <span className="admin-import-badge" style={{fontSize:"0.75rem",background:"#fef3c7",color:"#92400e",padding:"0.25rem 0.75rem",borderRadius:"1rem",marginRight:"1rem"}}>{importMsg}</span>}<button className="icon-button"><Bell/></button><span className="admin-user">FD</span></div></header>

  {showLogoutConfirm && (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', maxWidth: '400px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <div style={{ width: '64px', height: '64px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <AlertTriangle color="#dc2626" size={32} />
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Confirmar Logout?</h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Você precisará da senha administrativa para acessar estas ferramentas novamente.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <button className="button button--outline" onClick={() => setShowLogoutConfirm(false)}>Cancelar</button>
          <button className="button button--primary" style={{ background: '#dc2626' }} onClick={confirmLogout}>Sim, Deslogar</button>
        </div>
      </div>
    </div>
  )}

  
  {activeAdminView === "dashboard" && (
    <>
      <div className="admin-kpis">
        <article onClick={() => setActiveKpiDetail({ title: "Preços Ativos", data: rows })} style={{ cursor: 'pointer' }}><span>Preços ativos <Activity/></span><strong>8.932</strong><small className="positive">+12,4% nesta semana</small></article>
        <article onClick={() => setActiveKpiDetail({ title: "Produtos Cobertos", data: initialProducts.slice(0, 10) })} style={{ cursor: 'pointer' }}><span>Produtos cobertos <PackageSearch/></span><strong>1.247</strong><small>82% da cesta base</small></article>
        <article onClick={() => setActiveAdminView("images")} style={{ cursor: 'pointer', border: '1px solid #f59e0b', background: '#fffbeb' }}><span>Fotos Pendentes <Camera color="#d97706"/></span><strong>{allProducts.filter(p => !p.image_url).length}</strong><small className="warning" style={{ color: '#d97706' }}>Itens sem imagem real</small></article>
        <article onClick={() => setActiveKpiDetail({ title: "Estabelecimentos", data: initialStores })} style={{ cursor: 'pointer' }}><span>Estabelecimentos <Store/></span><strong>12</strong><small className="positive">12 sincronizando</small></article>
      </div>

      <div className="admin-lower" style={{gridTemplateColumns: "1fr 1fr", marginBottom: "1.5rem", display: "grid", gap: "1.5rem"}}>
        <section className="admin-card">
          <div className="admin-card-head">
            <div><h2>Status da Conexão</h2><p>Leitura em tempo real do Supabase.</p></div>
            <button className="button button--outline button--small" onClick={handleTestConnection} disabled={isTesting}>
              <Activity size={14}/> {isTesting ? "Testando..." : "Testar Conexão"}
            </button>
          </div>
          {connStatus ? (
            <div className="connection-status-panel" style={{padding: "1rem"}}>
              <div style={{display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem"}}>
                <span className={`status ${connStatus.success ? "ok" : "review"}`} style={{width: 10, height: 10, borderRadius: "50%", display: "inline-block", background: connStatus.success ? "#16a34a" : "#dc2626"}}/>
                <b>{connStatus.success ? "Conectado ao Supabase" : "Erro na Conexão"}</b>
                {connStatus.success && <small style={{marginLeft: "auto", color: "#6b7280"}}>{connStatus.latency}ms latência</small>}
              </div>
              {connStatus.success ? (
                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem"}}>
                  <div style={{background: "#f9fafb", padding: "0.75rem", borderRadius: "0.5rem"}}>
                    <small style={{display: "block", color: "#6b7280", fontSize: "0.7rem"}}>Lojas</small>
                    <strong>{connStatus.tables.establishments}</strong>
                  </div>
                  <div style={{background: "#f9fafb", padding: "0.75rem", borderRadius: "0.5rem"}}>
                    <small style={{display: "block", color: "#6b7280", fontSize: "0.7rem"}}>Produtos</small>
                    <strong>{connStatus.tables.products}</strong>
                  </div>
                  <div style={{background: "#f9fafb", padding: "0.75rem", borderRadius: "0.5rem"}}>
                    <small style={{display: "block", color: "#6b7280", fontSize: "0.7rem"}}>Preços</small>
                    <strong>{connStatus.tables.prices}</strong>
                  </div>
                </div>
              ) : (
                <p style={{color: "#dc2626", fontSize: "0.85rem"}}>{connStatus.error}</p>
              )}
            </div>
          ) : (
            <div style={{padding: "2rem", textAlign: "center", color: "#6b7280"}}><small>Clique em testar para validar as tabelas externas.</small></div>
          )}
        </section>

        <section className="admin-card">
          <div className="admin-card-head">
            <div><h2>Progresso de Importação</h2><p>Processamento de dados em tempo real.</p></div>
          </div>
          <div style={{padding: "1rem"}}>
            {isImporting ? (
              <div className="import-progress-panel">
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.85rem"}}>
                  <span>{importMsg}</span>
                  <b>{Math.round((importProgress / importTotal) * 100)}%</b>
                </div>
                <div style={{height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden", marginBottom: "0.5rem"}}>
                  <div style={{height: "100%", background: "#1473e6", width: `${(importProgress / importTotal) * 100}%`, transition: "width 0.3s ease"}} />
                </div>
                <small style={{color: "#64748b"}}>{importProgress} de {importTotal} registros processados</small>
              </div>
            ) : importLog ? (
              <div style={{padding: "0"}}>
                {importLog.error ? (
                  <div style={{background: "#fee2e2", padding: "1rem", borderRadius: "0.5rem", border: "1px solid #fecaca"}}>
                    <div style={{display: "flex", alignItems: "center", gap: "0.5rem", color: "#b91c1c", marginBottom: "0.5rem"}}>
                      <AlertTriangle size={18} />
                      <strong>Erro Crítico na Importação</strong>
                    </div>
                    <p style={{fontSize: "0.85rem", color: "#991b1b", margin: 0}}>{importLog.error}</p>
                  </div>
                ) : (
                  <>
                    <div style={{display: "flex", justifyContent: "space-between", marginBottom: "0.5rem"}}>
                      <span style={{fontSize: "0.85rem"}}>Novos preços inseridos:</span>
                      <strong style={{color: "#16a34a"}}>+{importLog.count}</strong>
                    </div>
                    <div style={{borderTop: "1px solid #e5e7eb", marginTop: "0.5rem", paddingTop: "0.5rem", display: "flex", justifyContent: "space-between"}}>
                      <small style={{color: "#6b7280"}}>Execução: {(importLog.duration / 1000).toFixed(2)}s</small>
                      <small style={{color: "#6b7280"}}>{importLog.stores} lojas | {importLog.products} produtos</small>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{padding: "1rem", textAlign: "center", color: "#6b7280"}}><small>Aguardando início do processo de carga.</small></div>
            )}
          </div>
        </section>
      </div>
    </>
  )}

  {(activeAdminView === "catalog" || activeAdminView === "images") && (
    <section className="admin-card">
      <div className="admin-card-head">
        <div>
          <h2>{activeAdminView === "images" ? "Revisão Visual de Fotos" : "Gestão de Catálogo"}</h2>
          <p>{activeAdminView === "images" ? "Compare e atualize as imagens dos produtos cadastrados." : "Produtos e estabelecimentos registrados no sistema."}</p>
        </div>
        <div style={{display:"flex",gap:"0.75rem"}}>
          <button className="button button--primary" onClick={() => setShowAddProduct(true)}><Plus/> Novo produto</button>
          {activeAdminView === "catalog" && <button className="button button--primary" onClick={() => setShowAddStore(true)} style={{ background: '#10b981' }}><Store/> Nova Loja</button>}
        </div>
      </div>
      
      {activeAdminView === "catalog" && (
        <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', padding: '0 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <button onClick={() => setAdminActiveTab("products")} style={{ padding: '0.75rem 1rem', borderBottom: adminActiveTab === 'products' ? '2px solid #1473e6' : 'none', color: adminActiveTab === 'products' ? '#1473e6' : '#64748b', fontWeight: adminActiveTab === 'products' ? '600' : '400', background: 'none' }}>
            Produtos ({filteredProducts.length})
          </button>
          <button onClick={() => setAdminActiveTab("stores")} style={{ padding: '0.75rem 1rem', borderBottom: adminActiveTab === 'stores' ? '2px solid #1473e6' : 'none', color: adminActiveTab === 'stores' ? '#1473e6' : '#64748b', fontWeight: adminActiveTab === 'stores' ? '600' : '400', background: 'none' }}>
            Lojas ({filteredStores.length})
          </button>
        </div>
      )}

      <div className="admin-filters">
        <label style={{ flex: 1 }}><Search/><input placeholder="Buscar por nome ou marca..." value={adminSearch} onChange={e => setAdminSearch(e.target.value)} /></label>
        {activeAdminView === "images" && (
          <select value={adminFilterStore} onChange={e => setAdminFilterStore(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
            <option value="all">Status da Foto</option>
            <option value="missing">Sem Foto Real</option>
            <option value="present">Com Foto Real</option>
          </select>
        )}
      </div>

      <div className={activeAdminView === "images" ? "admin-image-grid" : "admin-table"} style={activeAdminView === "images" ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', padding: '1.5rem' } : {}}>
        {activeAdminView === "images" ? (
          filteredProducts.filter(p => adminFilterStore === 'missing' ? !p.image_url : adminFilterStore === 'present' ? !!p.image_url : true).map(p => (
            <div key={p.id} className="admin-card" style={{ padding: '1rem', textAlign: 'center', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setEditingItem({ type: 'product', data: p })}>
                <ProductImage product={p} size="default" />
              </div>
              <div>
                <b style={{ fontSize: '0.9rem', display: 'block' }}>{p.name}</b>
                <small style={{ color: 'var(--muted)' }}>{p.brand} • {p.size}</small>
              </div>
              <button className="button button--outline button--small" style={{ width: '100%' }} onClick={() => setEditingItem({ type: 'product', data: p })}>
                <Camera size={14}/> {p.image_url ? "Trocar Foto" : "Inserir Foto"}
              </button>
            </div>
          ))
        ) : adminActiveTab === 'products' ? (
          <>
            <div className="admin-tr admin-th">
              <span onClick={() => requestSort('name')}>Produto</span>
              <span onClick={() => requestSort('brand')}>Marca / Cat.</span>
              <span onClick={() => requestSort('establishment')}>Mercado Base</span>
              <span onClick={() => requestSort('minPrice')}>Preço Min.</span>
              <span style={{ textAlign: 'right' }}>Ações</span>
            </div>
            {paginatedProducts.map((p: any) => (
              <div className="admin-tr" key={p.id}>
                <span><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div onClick={() => setPhotoViewer({ url: p.image_url || "/products/arroz-tio-joao-5kg.png", name: p.name })} style={{ cursor: 'pointer' }}><ProductImage product={p} size="compact" /></div><div><b>{p.name}</b><small style={{ display: 'block' }}>{p.barcode || 'Sem código'}</small></div></div></span>
                <span>{p.brand}<br/><small>{p.category}</small></span>
                <span>{p.establishment}</span>
                <span><b>{money(p.minPrice)}</b></span>
                <span style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                  <button className="icon-button" onClick={() => setEditingItem({ type: 'product', data: p })}><Edit size={16}/></button>
                  <button className="icon-button" onClick={() => setConfirmDelete({ type: 'product', id: String(p.id), name: p.name })} style={{ color: '#dc2626' }}><Trash2 size={16}/></button>
                </span>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="admin-tr admin-th"><span>Estabelecimento</span><span>Bairro</span><span>Tipo</span><span style={{ textAlign: 'right' }}>Ações</span></div>
            {paginatedStores.map((s: any) => (
              <div className="admin-tr" key={s.id}>
                <span><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} /><b>{s.name}</b></div></span>
                <span>{s.neighborhood}</span>
                <span>{s.kind === 'market' ? 'Supermercado' : s.kind}</span>
                <span style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                  <button className="icon-button" onClick={() => setEditingItem({ type: 'store', data: s })}><Edit size={16}/></button>
                  <button className="icon-button" onClick={() => setConfirmDelete({ type: 'store', id: String(s.id), name: s.name })} style={{ color: '#dc2626' }}><Trash2 size={16}/></button>
                </span>
              </div>
            ))}
          </>
        )}
      </div>
      <div className="admin-card-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Mostrando {activeAdminView === "images" ? filteredProducts.length : (adminActiveTab === 'products' ? paginatedProducts.length : paginatedStores.length)} registros</span>
        {activeAdminView === "catalog" && totalPages > 1 && (
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button className="button button--outline button--small" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>Anterior</button>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontSize: '0.85rem' }}>Página {currentPage} de {totalPages}</div>
            <button className="button button--outline button--small" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Próxima</button>
          </div>
        )}
      </div>
    </section>
  )}

  <div className="admin-lower" style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.5rem"}}>
    <section className="admin-card">
      <div className="admin-card-head"><div><h2>Saúde das integrações</h2><p>Serviços críticos e filas.</p></div></div>
      {[["Banco e Realtime","Operacional","99,99%"],["Mercado Pago","Operacional","100%"],["Fila de IA","Atenção","3 jobs"],["E-mails","Operacional","98,7%"]].map((r,i)=><div className="health-row" key={r[0]}><span className={i===2?"status warning":"status"}/><b>{r[0]}</b><em>{r[1]}</em><strong>{r[2]}</strong></div>)}
    </section>
    <section className="admin-card" id="admin-auditoria" style={{ gridColumn: "span 2" }}>
      <div className="admin-card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h2>Auditoria Completa</h2><p>Logs de segurança e operações sensíveis.</p></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input type="date" value={dateFilter} onChange={e=>setDateFilter(e.target.value)} style={{ padding: '0.25rem', fontSize: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}/>
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} style={{ padding: '0.25rem', fontSize: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}>
            <option value="all">Todos Tipos</option>
            <option value="success">Sucesso</option>
            <option value="warning">Aviso</option>
            <option value="error">Crítico</option>
          </select>
          <button className="button button--small" onClick={exportCSV}><Download size={14}/> Exportar CSV</button>
        </div>
      </div>
      <div style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '1rem' }}>
        {filteredLogs.length > 0 ? filteredLogs.map((log, i) => (
          <div className="audit-row" key={i} style={{ borderBottom: '1px solid #f1f5f9', padding: '0.75rem 0' }}>
            <span style={{ minWidth: '24px' }}>{log.type === "error" ? <AlertTriangle color="#dc2626"/> : log.type === "warning" ? <Bell color="#b45309"/> : <CheckCircle2 color="#16a34a"/>}</span>
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: '0.9rem' }}>{log.action}</b>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {log.user} • {new Date(log.at).toLocaleString("pt-BR")}
              </div>
            </div>
          </div>
        )) : <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Nenhum log encontrado para os filtros selecionados.</div>}
      </div>
    </section>

  </div>
  
  {/* Modais de Gestão Administrativa */}
  {activeKpiDetail && (
    <div className="admin-modal-overlay" onClick={() => setActiveKpiDetail(null)}>
      <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-head">
          <h3>{activeKpiDetail.title}</h3>
          <button className="icon-button" onClick={() => setActiveKpiDetail(null)}><X/></button>
        </div>
        <div className="admin-modal-body">
          <div style={{ maxHeight: '300px', overflowY: 'auto', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.75rem' }}>
            {activeKpiDetail.data.map((item, i) => (
              <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                {JSON.stringify(item)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )}

  {showAddStore && (
    <div className="admin-modal-overlay">
      <form className="admin-modal-content" onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const name = String(fd.get('name')).trim();
        const neighborhood = String(fd.get('neighborhood')).trim();
        const color = String(fd.get('color'));

        if (!name || !neighborhood) {
          alert("Por favor, preencha o nome e o bairro.");
          return;
        }

        const { supabase } = await import("./lib/supabase");
        if (!supabase) return;
        const { error } = await supabase.from('establishments').insert({
          name,
          neighborhood,
          brand_color: color,
          kind: 'market'
        });
        if (error) alert("Erro ao salvar: " + error.message);
        else {
          addAuditLog(`Novo estabelecimento cadastrado: ${name}`);
          setShowAddStore(false);
          loadLogs();
          window.location.reload();
        }
      }}>
        <div className="admin-modal-head">
          <h3>Cadastrar Novo Estabelecimento</h3>
          <button type="button" className="icon-button" onClick={() => setShowAddStore(false)}><X/></button>
        </div>
        <div className="admin-modal-body" style={{ display: 'grid', gap: '0.5rem' }}>
          <label>Nome do Estabelecimento * <input name="name" required placeholder="Ex: Mercado do Povo" /></label>
          <label>Bairro * <input name="neighborhood" required placeholder="Ex: Centro" /></label>
          <label>Cor da Marca <input name="color" type="color" defaultValue="#3b82f6" style={{ height: '40px', padding: '2px' }} /></label>
          <button type="submit" className="button button--primary" style={{ marginTop: '1rem' }}>Salvar Estabelecimento</button>
        </div>
      </form>
    </div>
  )}


  {showAddProduct && (
    <div className="admin-modal-overlay">
      <form className="admin-modal-content" onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const name = String(fd.get('name')).trim();
        const brand = String(fd.get('brand')).trim();
        const category = String(fd.get('category')).trim();
        const size = String(fd.get('size')).trim();
        const barcode = String(fd.get('barcode')).trim();

        if (!name || !brand || !category) {
          alert("Por favor, preencha os campos obrigatórios (Nome, Marca e Categoria).");
          return;
        }

        const { supabase } = await import("./lib/supabase");
        if (!supabase) return;
        const { data: result, error } = await supabase.from('products').insert({
          name, brand, category, size, barcode
        }).select('id').single();

        if (error) alert("Erro ao salvar: " + error.message);
        else {
          if (newProductPhoto && result) {
            await handleFileUpload({ target: { files: [newProductPhoto.file] } } as any, String(result.id));
          }
          addAuditLog(`Novo produto cadastrado: ${name}`);
          setShowAddProduct(false);
          setNewProductPhoto(null);
          loadLogs();
          window.location.reload();
        }
      }}>
        <div className="admin-modal-head">
          <h3>Cadastrar Novo Produto</h3>
          <button type="button" className="icon-button" onClick={() => setShowAddProduct(false)}><X/></button>
        </div>
        <div className="admin-modal-body" style={{ display: 'grid', gap: '0.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', background: '#f8fafc', borderRadius: '0.5rem', border: '2px dashed #cbd5e1', marginBottom: '1rem', position: 'relative' }}>
            {newProductPhoto ? (
              <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src={newProductPhoto.url} style={{ width: '120px', height: '120px', objectFit: 'contain', borderRadius: '8px' }} alt="Preview" />
                <button type="button" className="button button--ghost button--small" style={{ color: '#dc2626', marginTop: '0.5rem' }} onClick={() => setNewProductPhoto(null)}>Remover Foto</button>
              </div>
            ) : (
              <>
                <Camera size={32} color="#64748b" />
                <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#64748b' }}>Clique para subir foto</div>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }} 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (!file.type.startsWith('image/')) {
                  alert("Apenas arquivos de imagem são permitidos.");
                  return;
                }
                setIsUploading(true);
                const reader = new FileReader();
                reader.onload = (ev) => {
                  setNewProductPhoto({ file, url: ev.target?.result as string });
                  setIsUploading(false);
                };
                reader.readAsDataURL(file);
              }} 
            />
          </div>
          <label>Nome do Produto * <input name="name" required placeholder="Ex: Arroz 5kg" /></label>
          <label>Marca * <input name="brand" required placeholder="Ex: Tio João" /></label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label>Categoria * <input name="category" required placeholder="Ex: Mercearia" /></label>
            <label>Tamanho <input name="size" placeholder="Ex: 5kg" /></label>
          </div>
          <label>Código de Barras <input name="barcode" placeholder="Opcional" /></label>
          <button type="submit" className="button button--primary" style={{ marginTop: '1rem' }}>Salvar Produto</button>
        </div>
      </form>
    </div>
  )}

  {/* Modal de Confirmação de Exclusão */}
  {confirmDelete && (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <div className="admin-modal-head">
          <h3>Confirmar Exclusão</h3>
          <button className="icon-button" onClick={() => setConfirmDelete(null)}><X/></button>
        </div>
        <div className="admin-modal-body">
          <AlertTriangle size={48} color="#dc2626" style={{ margin: '0 auto 1rem' }} />
          <p>Tem certeza que deseja excluir o {confirmDelete.type === 'product' ? 'produto' : 'estabelecimento'} <strong>{confirmDelete.name}</strong>?</p>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>Esta ação não pode ser desfeita no banco de dados.</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button className="button button--outline" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>Cancelar</button>
            <button className="button button--primary" style={{ flex: 1, background: '#dc2626' }} onClick={handleDelete}>Excluir Agora</button>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Modal de Edição */}
  {editingItem && (
    <div className="admin-modal-overlay">
      <form className="admin-modal-content" onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (!supabase) return;
        
        const table = editingItem.type === 'product' ? 'products' : 'establishments';
        const payload: any = {};
        fd.forEach((value, key) => { payload[key] = value; });

        const { error } = await supabase.from(table).update(payload).eq('id', editingItem.data.id);
        
        if (error) alert(error.message);
        else {
          addAuditLog(`${editingItem.type === 'product' ? 'Produto' : 'Loja'} atualizado: ${editingItem.data.name || editingItem.data.id}`);
          setEditingItem(null);
          window.location.reload();
        }
      }}>
        <div className="admin-modal-head">
          <h3>Editar {editingItem.type === 'product' ? 'Produto' : 'Estabelecimento'}</h3>
          <button type="button" className="icon-button" onClick={() => setEditingItem(null)}><X/></button>
        </div>
        <div className="admin-modal-body" style={{ display: 'grid', gap: '1rem' }}>
          {editingItem.type === 'product' ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <img 
                  src={editingItem.data.image_url || "/products/arroz-tio-joao-5kg.png"} 
                  style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '4px', marginBottom: '0.5rem' }} 
                  alt="Preview"
                />
                <button type="button" className="button button--small button--outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={14}/> {isUploading ? "Enviando..." : "Mudar Foto Real"}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  hidden 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, String(editingItem.data.id))} 
                />
              </div>
              <label>Nome <input name="name" defaultValue={editingItem.data.name} required /></label>
              <label>Marca <input name="brand" defaultValue={editingItem.data.brand} /></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label>Categoria <input name="category" defaultValue={editingItem.data.category} /></label>
                <label>Tamanho <input name="size" defaultValue={editingItem.data.size} /></label>
              </div>
              <label>Código de Barras <input name="barcode" defaultValue={editingItem.data.barcode} /></label>
            </>
          ) : (
            <>
              <label>Nome da Loja <input name="name" defaultValue={editingItem.data.name} required /></label>
              <label>Bairro <input name="neighborhood" defaultValue={editingItem.data.neighborhood} /></label>
              <label>Cor da Marca <input name="brand_color" type="color" defaultValue={editingItem.data.color || '#3b82f6'} style={{ height: '40px' }} /></label>
            </>
          )}
          <button type="submit" className="button button--primary" style={{ marginTop: '0.5rem' }}>Salvar Alterações</button>
        </div>
      </form>
    </div>
  )}
  {photoViewer && (
    <div className="admin-modal-overlay" onClick={() => setPhotoViewer(null)}>
      <div className="admin-modal-content" style={{ maxWidth: '500px', padding: '0.5rem' }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal-head" style={{ borderBottom: 'none' }}>
          <h3 style={{ fontSize: '0.9rem' }}>{photoViewer.name}</h3>
          <button className="icon-button" onClick={() => setPhotoViewer(null)}><X/></button>
        </div>
        <img 
          src={photoViewer.url} 
          alt={photoViewer.name} 
          style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block' }} 
        />
      </div>
    </div>
  )}
</main></div>;


}

function GenericPage({ path, products, stores, metrics, addBasket, saveAction, user }: PageProps & { path:string, user?: any }) {
  const randomFeatured = useRandomFeatured(products);
  const isStore = path.startsWith("/estabelecimento/") || path.startsWith("/loja/");
  const isProduct = path.startsWith("/produto") || path.includes("/produto/");
  const routeInfo: Record<string,[string,string,ReactNode]> = {
    "/estabelecimentos":["Comércio local, lado a lado","Estabelecimentos monitorados",<Store key="i"/>],
    "/melhores-precos":["Ranking atualizado","Os melhores preços de Feijó",<TrendingDown key="i"/>],
    "/precos":["Inteligência de mercado","Preços reais, contexto local",<LineChart key="i"/>],
    "/precos-por-categoria":["Catálogo organizado","Compare por categoria",<PackageSearch key="i"/>],
    "/comparador":["Duelo de ofertas","Comparador de produtos",<BarChart3 key="i"/>],
    "/comparador-ao-vivo":["Atualização contínua","Comparador ao vivo",<Activity key="i"/>],
    "/onde-comprar":["Decisão rápida","Onde comprar mais barato",<MapPin key="i"/>],
    "/mapa":["Feijó por bairro","Diretório de preços local",<MapPin key="i"/>],
    "/farmacias":["Informação de utilidade pública","Farmácias de plantão",<ShieldCheck key="i"/>],
    "/colaborar":["Comunidade que economiza junta","Envie sua nota fiscal",<Camera key="i"/>],
    "/lojista":["Inteligência para vender melhor","Painel do lojista",<LayoutDashboard key="i"/>],
    "/financas":["Controle com contexto","Minhas finanças",<CircleDollarSign key="i"/>],
    "/favoritos":["Tudo que importa","Seus favoritos",<Heart key="i"/>],
    "/alertas":["Monitoramento de preços e validade","Lista de Acompanhamento",<Bell key="i"/>],
    "/lista":["Compra organizada","Minhas listas",<ListChecks key="i"/>],
    "/perfil":["Gerencie seus dados","Minha conta",<UserRound key="i"/>],
    "/app":["Seu resumo dos últimos 90 dias","Painel de economia",<LayoutDashboard key="i"/>],
  };
  const defaultInfo:[string,string,ReactNode] = ["PreçoCerto em Feijó","Economia inteligente para sua próxima compra",<Sparkles key="i"/>];
  const info = isStore ? ["Estabelecimento verificado", stores[0]?.name ?? "Comércio local", <Store key="s"/>] as [string,string,ReactNode] : isProduct ? ["Produto monitorado", products[0]?.name ?? "Produto local", <PackageSearch key="p"/>] as [string,string,ReactNode] : (routeInfo[path] ?? defaultInfo);
  const alerts = JSON.parse(localStorage.getItem("precocerto:actions") ?? "[]").filter((a: any) => a.action === "alert");
  const alertProducts = products.filter(p => alerts.some((a: any) => String(a.id) === String(p.id)));

  if (path === "/perfil") {
    const favorites = JSON.parse(localStorage.getItem("precocerto:favorites") ?? "[]");
    const favProducts = products.filter(p => favorites.includes(String(p.id)));
    
    return (
      <div className="shell page-shell generic-page">
        <section className="generic-hero">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '80px', height: '80px', background: 'var(--blue-soft)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)' }}>
              <UserRound size={40} />
            </div>
            <div>
              <span className="eyebrow">Minha Conta</span>
              <h1>{user?.name || "Usuário PreçoCerto"}</h1>
              <p>Gerencie seus alertas, favoritos e preferências de economia em Feijó.</p>
            </div>
          </div>
        </section>

        <div className="generic-grid">
          <section className="generic-main">
            <div className="section-heading compact">
              <h2>Ofertas Favoritas ({favProducts.length})</h2>
              <p>Produtos que você marcou com o coração para acesso rápido.</p>
            </div>
            
            {favProducts.length > 0 ? (
              <div className="visual-product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {favProducts.map(p => (
                  <article className="visual-product-card" key={p.id}>
                    <a className="visual-product-image" href={`/produto/${p.slug}`} style={{ height: '120px' }}>
                      <ProductImage product={p} size="compact" />
                    </a>
                    <div className="visual-product-content" style={{ padding: '1rem' }}>
                      <a className="visual-product-name" href={`/produto/${p.slug}`} style={{ fontSize: '0.9rem', height: '2.5rem' }}>{p.name}</a>
                      <div className="visual-price">
                        <strong>{money(p.minPrice)}</strong>
                      </div>
                      <div className="visual-product-actions">
                        <button className="button button--primary button--small" onClick={() => addBasket(p)}><Plus size={14}/> Cesta</button>
                        <button className="button button--ghost button--small" onClick={() => {
                          const newFavs = favorites.filter((id: string) => id !== String(p.id));
                          localStorage.setItem("precocerto:favorites", JSON.stringify(newFavs));
                          window.location.reload();
                        }}><Trash2 size={14}/></button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface-2)', borderRadius: '12px' }}>
                <Heart size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>Nenhuma oferta favoritada ainda.</p>
                <a href="/buscar" className="button button--outline" style={{ marginTop: '1rem' }}>Ver catálogo</a>
              </div>
            )}

            <div className="section-heading compact" style={{ marginTop: '3rem' }}>
              <h2>Histórico de Ações Recentes</h2>
            </div>
            <div className="price-table-card">
              {JSON.parse(localStorage.getItem("precocerto:actions") ?? "[]").slice(0, 5).map((a: any, i: number) => (
                <div key={i} className="price-row" style={{ padding: '0.75rem 1rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                     {a.action === 'favorite' ? <Heart size={14} color="var(--red)"/> : <Bell size={14} color="var(--blue)"/>}
                     <span style={{ fontSize: '0.85rem' }}>
                       {a.action === 'favorite' ? 'Favoritou um produto' : 'Ativou alerta de preço'}
                     </span>
                   </div>
                   <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{new Date(a.at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </section>

          <aside className="generic-aside">
            <span className="eyebrow">Preferências</span>
            <h2>Configurações</h2>
            
            <div className="aside-stat" style={{ cursor: 'pointer' }} onClick={() => window.location.href = "/alertas"}>
              <span>Alertas de Preço</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong>{alerts.length} ativos</strong>
                <ChevronRight size={14} />
              </div>
            </div>

            <div className="aside-stat">
              <span>Notificações WhatsApp</span>
              <strong style={{ color: 'var(--green)' }}>Ativado</strong>
            </div>

            <div className="aside-stat">
              <span>Bairro Preferencial</span>
              <strong>Centro, Feijó</strong>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button className="button button--outline button--full" onClick={() => {
                localStorage.removeItem("precocerto:user");
                window.location.href = "/";
              }}>Sair da Conta</button>
            </div>

            <div style={{ background: 'var(--blue-soft)', padding: '1rem', borderRadius: '12px', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--blue)' }}>
                <ShieldCheck size={16} />
                <strong style={{ fontSize: '0.85rem' }}>Privacidade</strong>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--muted)', lineHeight: '1.4' }}>
                Seus dados de navegação e preferências são armazenados localmente para garantir sua privacidade.
              </p>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (path === "/alertas") {
    return (
      <div className="shell page-shell generic-page">
        <section className="generic-hero">
          <span className="generic-icon"><Bell /></span>
          <div>
            <span className="eyebrow">Monitoramento Ativo</span>
            <h1>Lista de Acompanhamento</h1>
            <p>Receba alertas automáticos quando houver quedas de preço ou quando os dados precisarem de nova verificação em Feijó.</p>
          </div>
        </section>
        <div className="generic-grid">
          <section className="generic-main">
            <div className="section-heading compact" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2>Produtos Monitorados ({alertProducts.length})</h2>
                <p>Alertas configurados para variações de preço e validade da informação.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="button button--outline" onClick={() => {
                  const csv = [
                    ["Produto", "Marca", "Tamanho", "Estabelecimento", "Preco", "Atualizacao"].join(","),
                    ...alertProducts.map(p => [
                      `"${p.name}"`, `"${p.brand}"`, `"${p.size}"`, `"${p.establishment}"`, p.minPrice, new Date(p.capturedAt).toLocaleDateString()
                    ].join(","))
                  ].join("\n");
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.setAttribute("href", url);
                  link.setAttribute("download", `alertas-precocerto-${new Date().toISOString().split('T')[0]}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }} title="Exportar para CSV">
                  <Download size={16} /> CSV
                </button>
                <button className="button button--outline" onClick={() => window.print()} title="Imprimir lista (PDF)">
                  <Receipt size={16} /> PDF
                </button>
              </div>
            </div>
            {alertProducts.length > 0 ? alertProducts.map(p => {
               const days = Math.floor((new Date().getTime() - new Date(p.capturedAt).getTime()) / (1000 * 60 * 60 * 24));
               return (
                <article className="compact-product" key={p.id}>
                  <span className="product-visual">{p.category.slice(0,1)}</span>
                  <div>
                    <a href={`/produto/${p.slug}`}>{p.name}</a>
                    <small>{p.brand} • {p.size} • <a href={`/estabelecimento/${p.establishmentSlug}`} style={{ color: 'inherit', fontWeight: 'bold' }}>{p.establishment}</a></small>
                    <span style={{ color: days >= 7 ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>
                      {days >= 7 ? <AlertTriangle size={12}/> : <CheckCircle2 size={12}/>} 
                      {days === 0 ? "Atualizado hoje" : days === 1 ? "Atualizado ontem" : `Atualizado há ${days} dias`}
                    </span>
                  </div>
                  <strong>{money(p.minPrice)}</strong>
                  <button onClick={() => {
                    const saved = JSON.parse(localStorage.getItem("precocerto:actions") ?? "[]");
                    const filtered = saved.filter((a: any) => !(a.action === "alert" && String(a.id) === String(p.id)));
                    localStorage.setItem("precocerto:actions", JSON.stringify(filtered));
                    window.location.reload();
                  }} aria-label="Remover alerta" title="Remover alerta"><Trash2 size={16}/></button>
                  <button className="button button--primary" onClick={() => addBasket(p)}><Plus/> Cesta</button>
                </article>
               );
            }) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', background: 'var(--surface-2)', borderRadius: '12px' }}>
                <Bell size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>Você ainda não possui alertas configurados.</p>
                <a href="/buscar" className="button button--outline" style={{ marginTop: '1rem' }}>Explorar catálogo</a>
              </div>
            )}
          </section>
          <aside className="generic-aside">
            <span className="eyebrow">Configurações</span>
            <h2>Preferências de Alerta</h2>
            <div className="section-heading compact" style={{ marginTop: '2rem' }}>
              <h3>Central de Notificações</h3>
            </div>
            
            <div className="aside-stat">
              <span>Notificar queda de preço</span>
              <div className="toggle-switch active"></div>
            </div>
            <div className="aside-stat">
              <span>Alerta de dado expirado (7 dias)</span>
              <div className="toggle-switch active"></div>
            </div>
            <div className="aside-stat">
              <span>Alertas via E-mail</span>
              <div className="toggle-switch"></div>
            </div>
            <div className="aside-stat" style={{ background: 'var(--gold-soft)', border: '1px solid var(--gold)', marginTop: '1.5rem', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                <div style={{ background: '#25D366', color: 'white', padding: '6px', borderRadius: '50%' }}><Users size={16} /></div>
                <strong style={{ fontSize: '0.9rem', color: '#128C7E' }}>Alertas via WhatsApp</strong>
              </div>
              <p style={{ fontSize: '0.75rem', lineHeight: '1.3', color: '#444' }}>
                Receba notificações instantâneas de quedas de preço e dados expirados no seu celular.
              </p>
              <button 
                className="button button--small" 
                style={{ background: '#25D366', color: 'white', border: 'none', width: '100%', marginTop: '0.8rem' }}
                onClick={() => window.open(`https://wa.me/5568999999999?text=${encodeURIComponent("Olá! Gostaria de ativar os alertas do PreçoCerto para minha lista de acompanhamento.")}`)}
              >
                Ativar WhatsApp
              </button>
            </div>
            <div style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: '12px', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div className="pulse-dot" style={{ background: 'var(--green)' }} />
                <strong style={{ fontSize: '0.85rem' }}>Notificações em tempo real</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                {alertProducts.length > 0 ? (
                  <p>Monitorando {alertProducts.length} itens. Última variação checada há 4 min.</p>
                ) : (
                  <p>Aguardando itens para monitoramento...</p>
                )}
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '1rem' }}>Os alertas são processados localmente baseados nas últimas coletas realizadas em Feijó.</p>
          </aside>
        </div>
      </div>
    );
  }

  if (path.startsWith("/estabelecimento/")) {
    const slug = path.split("/").pop();
    const store = stores.find(s => s.slug === slug);
    const storeProducts = products.filter(p => String(p.establishmentId) === String(store?.id));

    return (
      <div className="shell page-shell">
        <section className="generic-hero" style={{ background: store?.color || 'var(--navy)', color: 'white' }}>
           <div className="store-hero-content" style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '2rem 0' }}>
             <div className="store-avatar" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', border: '2px solid white', borderRadius: '50%', fontSize: '1.5rem', fontWeight: 'bold' }}>
               {store?.name.split(" ").map(v=>v[0]).join("").slice(0,2)}
             </div>
             <div>
               <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.8)' }}>Estabelecimento em Feijó</span>
               <h1 style={{ color: 'white', margin: '0.5rem 0' }}>{store?.name}</h1>
               <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
                 <MapPin size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }}/> 
                 {store?.neighborhood} • {storeProducts.length} produtos mapeados
               </p>
             </div>
           </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <h2>Produtos em {store?.name}</h2>
              <p>Compare os preços deste mercado com a média da cidade.</p>
            </div>
          </div>
          <div className="visual-product-grid">
            {storeProducts.map(p => (
              <article className="visual-product-card" key={p.id}>
                <a className="visual-product-image" href={`/produto/${p.slug}`}>
                  <ProductImage product={p} />
                  <span className="verified-chip"><ShieldCheck /> Verificado</span>
                </a>
                <div className="visual-product-content">
                  <span className="category-tag">{p.category} • {p.size}</span>
                  <a className="visual-product-name" href={`/produto/${p.slug}`}>{p.name}</a>
                  <div className="visual-store">
                    <span className="market-dot" style={{ background: p.storeColor }} />
                    <a href={`/estabelecimento/${p.establishmentSlug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <strong>{p.establishment}</strong><small><MapPin /> {p.neighborhood}</small>
                    </a>
                  </div>
                  <div className="visual-price">
                    <span><small>preço atual</small><strong>{money(p.minPrice)}</strong></span>
                  </div>

                  <div className="visual-product-actions">
                    <button className="button button--primary" onClick={() => addBasket(p)}><Plus /> Cesta</button>
                    <a href={`/produto/${p.slug}`} className="button button--ghost button--small">Detalhes</a>
                  </div>
                </div>
              </article>
            ))}
            {storeProducts.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: 'var(--surface-2)', borderRadius: '1rem' }}>
                <PackageSearch size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>Nenhum produto encontrado para este estabelecimento no momento.</p>
                <a href="/buscar" className="button button--outline" style={{ marginTop: '1rem' }}>Explorar catálogo</a>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="shell page-shell generic-page">
      <section className="generic-hero">
        <span className="generic-icon">{info[2]}</span>
        <div>
          <span className="eyebrow">{info[0]}</span>
          <h1>{info[1]}</h1>
          <p>Informação clara, preços comparáveis e decisões melhores para quem compra e vende em Feijó.</p>
        </div>
        <a className="button button--primary" href="/buscar">Comparar agora <ArrowRight/></a>
      </section>

      <div className="generic-grid">
        <section className="generic-main">
          <div className="section-heading compact">
            <div>
              <h2>{isStore ? "Ofertas em destaque" : isProduct ? "Onde está mais barato" : "Destaques inteligentes"}</h2>
              <p>Seleção automática de produtos com preços atrativos e curadoria local.</p>
            </div>
          </div>
          {(randomFeatured.length > 0 ? randomFeatured : products.slice(0, 4)).map(p => (
            <article className="compact-product" key={p.id}>
              <span className="product-visual">{p.category.slice(0,1)}</span>
              <div>
                <a href={`/produto/${p.slug}`}>{p.name}</a>
                <small>{p.brand} • {p.size} • <a href={`/estabelecimento/${p.establishmentSlug}`} style={{ color: 'inherit', fontWeight: 'bold' }}>{p.establishment}</a></small>
                <span><ShieldCheck/> Verificado recentemente</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ display: 'block' }}>{money(p.minPrice)}</strong>
                {p.previousPrice && p.previousPrice > p.minPrice && (
                  <small style={{ color: 'var(--green)', fontWeight: 600 }}>
                    <TrendingDown size={10}/> -{Math.round((1 - p.minPrice / p.previousPrice) * 100)}%
                  </small>
                )}
              </div>
              <button onClick={() => saveAction("favorite", "product", String(p.id))} aria-label="Favoritar"><Heart/></button>
              <button className="button button--primary" onClick={() => addBasket(p)}><Plus/> Cesta</button>
            </article>
          ))}
        </section>
        <aside className="generic-aside">
          <span className="eyebrow">Visão local</span>
          <h2>Feijó economiza junto</h2>
          <div className="aside-stat">
            <span>Produtos acompanhados</span>
            <strong>{count(metrics.products)}</strong>
          </div>
          <div className="aside-stat">
            <span>Atualizações hoje</span>
            <strong>214</strong>
          </div>
          <div className="aside-stat">
            <span>Economia potencial</span>
            <strong>14,8%</strong>
          </div>
          <a href="/cesta-basica" className="button button--dark button--full">Montar cesta inteligente</a>
        </aside>
      </div>
    </div>
  );

}

function AuthPage({ path, onAdminAuth, onLogin }: { path: string; onAdminAuth: (success: boolean) => void; onLogin?: () => void }) {
  const register = path === "/cadastro" || path === "/registrar";
  const isAdminLogin = path === "/admin-login";
  const [pin, setPin] = useState("");
  const [cpf, setCpf] = useState("");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [recoveryUser, setRecoveryUser] = useState("");
  const [newPass, setNewPass] = useState("");
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: input user, 2: reset pass
  const [attempts, setAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    const blocked = localStorage.getItem("precocerto:admin_blocked_until");
    if (blocked) {
      const until = parseInt(blocked, 10);
      if (until > Date.now()) setBlockedUntil(until);
    }
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (blockedUntil && Date.now() < blockedUntil) {
      const remaining = Math.ceil((blockedUntil - Date.now()) / 1000);
      setError(`Acesso bloqueado por segurança. Tente novamente em ${remaining}s.`);
      return;
    }

    if (isAdminLogin) {
      // Autenticação real no banco. Nenhuma credencial vive no frontend e o
      // papel administrativo é confirmado pela tabela user_roles (RLS).
      setError("");
      const { error: authError } = await signIn(user.trim(), pass);

      if (!authError) {
        const profile = await loadSessionProfile();
        if (profile?.isAdmin) {
          onAdminAuth(true);
          setAttempts(0);
          localStorage.removeItem("precocerto:admin_blocked_until");
          addAuditLog(`Login administrativo autorizado (${profile.roles.join(", ")})`, "success", profile.email ?? user);
          window.location.href = "/admin";
          return;
        }
        await signOut();
        setError("Sua conta não possui permissão administrativa.");
        addAuditLog("Tentativa de acesso administrativo sem papel autorizado", "error", user || "Desconhecido");
        return;
      }

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        const until = Date.now() + 60000; // 1 minuto
        setBlockedUntil(until);
        localStorage.setItem("precocerto:admin_blocked_until", until.toString());
        setError("Muitas tentativas falhas. Acesso bloqueado por 1 minuto.");
        addAuditLog("Bloqueio de segurança ativado após 5 falhas no login", "error", user || "Desconhecido");
      } else {
        setError(`Credenciais incorretas. Tentativa ${newAttempts} de 5.`);
      }
    } else {
      if (onLogin) onLogin();
      window.location.href = "/";
    }
  }

  async function handleRecovery(e: FormEvent) {
    e.preventDefault();
    if (blockedUntil && Date.now() < blockedUntil) {
      setError("Muitas tentativas. Aguarde o desbloqueio.");
      return;
    }

    // Recuperação real: o link de redefinição é enviado pelo provedor de
    // autenticação. A senha nunca é gravada nem trocada no navegador.
    const email = recoveryUser.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Informe o e-mail cadastrado do administrador.");
      return;
    }

    setIsSendingEmail(true);
    setError("");
    const { error: resetError } = await requestPasswordReset(email);
    setIsSendingEmail(false);

    if (resetError) {
      setError(resetError);
      return;
    }

    addAuditLog("Solicitação de redefinição de senha administrativa enviada", "warning", email);
    setRecoveryStep(2);
  }




  return <div className="auth-page">
    <div className="auth-brand-panel">
      <Brand inverse/>
      <div>
        <span className="eyebrow eyebrow--gold">Antes de comprar, compare</span>
        <h1>{isAdminLogin ? "Painel de Controle Restrito" : register?"Economize desde a primeira lista.":"Que bom ter você de volta."}</h1>
        <p>Preços em tempo real, alertas de queda e cestas inteligentes para comprar melhor em Feijó.</p>
        <ul>
          <li><Check/> {isAdminLogin ? "Gestão de inventário e preços" : "Comparação por mercado e embalagem"}</li>
          <li><Check/> {isAdminLogin ? "Auditoria e logs operacionais" : "Histórico e alertas personalizados"}</li>
          <li><Check/> {isAdminLogin ? "Segurança de dados e backups" : "Bônus por envio de nota fiscal"}</li>
        </ul>
      </div>
      <small>O menor preço, na hora certa.</small>
    </div>
    <main className="auth-form-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <a className="auth-back" href="/" style={{ margin: 0 }}><ArrowRight/> Voltar ao início</a>
        {!register && !isAdminLogin && <a href="/admin" style={{ fontSize: '0.75rem', color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#94a3b8'} onMouseOut={e => e.currentTarget.style.color = '#cbd5e1'}>Acesso Restrito</a>}
      </div>
      <form className="auth-form" onSubmit={showForgot ? handleRecovery : submit}>
        <span className="eyebrow">{isAdminLogin ? (showForgot ? "Recuperação" : "Segurança") : register?"Crie sua conta":"Acesse sua conta"}</span>
        <h2>{isAdminLogin ? (showForgot ? "Redefinir Senha" : "Login Administrativo") : register?"Comece grátis":"Entrar no PreçoCerto"}</h2>
        <p>{isAdminLogin ? (showForgot ? "Siga os passos para recuperar o acesso." : "Insira suas chaves de acesso para continuar.") : register?"Leva menos de dois minutos.":"Use seu CPF e PIN de 6 dígitos."}</p>
        
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={16}/> {error}</div>}

        {isAdminLogin ? (
          showForgot ? (
            recoveryStep === 1 ? (
              <>
                <label>E-mail do Administrador<input required type="email" value={recoveryUser} onChange={e=>setRecoveryUser(e.target.value)} placeholder="admin@seudominio.com"/></label>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '0.25rem' }}>
                  <ShieldCheck size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }}/>
                  Enviaremos um link seguro de redefinição para este e-mail.
                </div>
              </>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#166534', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem', borderRadius: '0.5rem' }}>
                <Check size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }}/>
                Link enviado. Abra o e-mail e defina a nova senha na página segura.
                <div style={{ marginTop: '0.5rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock3 size={12}/> O link expira por segurança.
                </div>
              </div>
            )

          ) : (
            <>
              <label>E-mail Administrador<input required type="email" value={user} onChange={e=>setUser(e.target.value)} placeholder="admin@seudominio.com"/></label>
              <label>Senha Secreta<input required value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="••••••••"/></label>
            </>
          )
        ) : (
          <>
            {register&&<label>Nome completo<input required minLength={3} placeholder="Seu nome e sobrenome"/></label>}
            <label>CPF<input required value={cpf} onChange={e=>setCpf(e.target.value.replace(/\D/g,"").slice(0,11))} inputMode="numeric" placeholder="000.000.000-00"/><small>Usamos seu CPF somente para identificar sua conta.</small></label>
            {register&&<label>Celular<input inputMode="tel" placeholder="(68) 99999-9999"/></label>}
            <label>PIN de 6 dígitos<input required value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" type="password" maxLength={6} placeholder="••••••"/><small>Evite sequências como 123456.</small></label>
          </>
        )}

        <button className="button button--primary button--full" type="submit" disabled={isAdminLogin ? (showForgot ? (recoveryStep === 1 ? (!recoveryUser || isSendingEmail) : true) : (!user || !pass)) : (pin.length!==6||cpf.length!==11)}>
          {isAdminLogin ? (showForgot ? (recoveryStep === 1 ? (isSendingEmail ? "Enviando..." : "Enviar link de redefinição") : "Link enviado") : "Autenticar Acesso") : register?"Criar minha conta":"Entrar com segurança"}
          <ArrowRight/>
        </button>

        
        {isAdminLogin && !showForgot && <button type="button" onClick={() => setShowForgot(true)} className="center-link" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', marginTop: '1rem' }}>Esqueci minha senha admin</button>}
        {isAdminLogin && showForgot && <button type="button" onClick={() => { setShowForgot(false); setRecoveryStep(1); setError(""); }} className="center-link" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', marginTop: '1rem' }}>Voltar ao login admin</button>}
        
        {!register && !isAdminLogin && <a href="/resgatar" className="center-link">Esqueci meu PIN</a>}

        <div className="auth-switch">
          {isAdminLogin ? <a href="/login">Voltar para login comum</a> : (register?"Já possui conta? ":"Ainda não tem conta? ")}
          {!isAdminLogin && <a href={register?"/login":"/cadastro"}>{register?"Entrar":"Começar grátis"}</a>}
        </div>
      </form>
    </main>
  </div>;
}


/** Selo de frescor do preço com janela configurável por categoria. */
function FreshnessBadge({ product }: { product: Product }) {
  const { state, label } = priceFreshness(product.capturedAt, product.category);
  const titles: Record<FreshnessState, string> = {
    fresh: "Preço verificado recentemente para esta categoria.",
    aging: "A janela de confiança desta categoria já passou. Confira na loja.",
    expired: "Preço fora da validade desta categoria. Aguardando nova coleta.",
    pending: "Sem data de verificação registrada.",
  };
  return (
    <span className={`freshness-badge freshness-badge--${state}`} title={titles[state]}>
      <Clock3 size={10} /> {label}
    </span>
  );
}

/** Preço por unidade de medida (R$/kg, R$/L, R$/un). Some quando não é conversível. */
function UnitPriceTag({ product }: { product: Product }) {
  if (!isEnabled("unitPrice")) return null;
  const unit = unitPrice(product.minPrice, product.size, product.unit);
  if (!unit) return null;
  return (
    <span className="unit-price-tag" title="Preço por unidade de medida, calculado sobre o menor preço">
      {money(unit.value)} / {unit.label}
    </span>
  );
}

/** Formulário de denúncia de preço — disponível também para visitantes. */
function PriceReportModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [reason, setReason] = useState(priceReportReasons[0]);
  const [reportedPrice, setReportedPrice] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const parsed = Number(reportedPrice.replace(",", "."));
    const result = await submitPriceReport({
      productId: String(product.id),
      establishmentId: String(product.establishmentId ?? ""),
      reportedPrice: Number.isFinite(parsed) && parsed > 0 ? parsed : null,
      reason,
      comment: comment.trim() || undefined,
    });
    if (result.ok) {
      setStatus("done");
    } else {
      setStatus("error");
      setError(result.error ?? "Não foi possível registrar agora.");
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" style={{ maxWidth: "480px" }} onClick={e => e.stopPropagation()} role="dialog" aria-label="Informar preço incorreto">
        <div className="admin-modal-head">
          <h3>Informar preço incorreto</h3>
          <button className="icon-button" onClick={onClose} aria-label="Fechar"><X /></button>
        </div>
        <div className="admin-modal-body">
          {status === "done" ? (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <CheckCircle2 size={40} color="var(--green)" />
              <h4 style={{ margin: "0.75rem 0 0.25rem" }}>Obrigado!</h4>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                Sua informação vai para a moderação e ajuda a manter os preços de Feijó confiáveis.
              </p>
              <button className="button button--primary" style={{ marginTop: "1rem" }} onClick={onClose}>Fechar</button>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: "grid", gap: "1rem" }}>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--muted)" }}>
                <strong>{product.name}</strong> — {product.establishment} · registrado por {money(product.minPrice)}
              </p>
              <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem", fontWeight: 600 }}>
                Motivo
                <select value={reason} onChange={e => setReason(e.target.value)} className="admin-input">
                  {priceReportReasons.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem", fontWeight: 600 }}>
                Preço encontrado na loja (opcional)
                <input className="admin-input" inputMode="decimal" placeholder="Ex.: 28,90" value={reportedPrice} onChange={e => setReportedPrice(e.target.value)} />
              </label>
              <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem", fontWeight: 600 }}>
                Observação (opcional)
                <textarea className="admin-input" rows={3} value={comment} onChange={e => setComment(e.target.value)} />
              </label>
              {status === "error" && (
                <p style={{ color: "var(--red)", fontSize: "0.85rem", margin: 0 }}>{error}</p>
              )}
              <button className="button button--primary" type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Enviando..." : "Enviar informação"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


function SearchPage({ products, stores, metrics, query, setQuery, addBasket, saveAction, fetchError, syncStatus, user }: PageProps & { fetchError?: string | null, syncStatus?: string, user?: any }) {
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);


  const pathname = useLocation().pathname;
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeStore, setActiveStore] = useState("all");
  const [activeBrand, setActiveBrand] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [updateRecency, setUpdateRecency] = useState("all"); // 'all', '7d', '24h'
  const [sortBy, setSortBy] = useState<"price" | "unit" | "date" | "variation">(pathname === "/melhores-precos" ? "variation" : "price");
  const [chartPeriod, setChartPeriod] = useState("30d");
  const [isSearching, setIsSearching] = useState(false);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reportProduct, setReportProduct] = useState<Product | null>(null);

  const randomFeatured = useRandomFeatured(products);
  
  useEffect(() => {
    const saved = localStorage.getItem("precocerto:favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const handleFavorite = async (productId: string) => {
    const newFavorites = favorites.includes(productId) 
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(newFavorites);
    localStorage.setItem("precocerto:favorites", JSON.stringify(newFavorites));
    saveAction("favorite", "product", productId);
  };

  useEffect(() => {
    if (query || activeCategory !== "all" || activeStore !== "all" || activeBrand !== "all") {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 300);
      return () => clearTimeout(timer);
    }
  }, [query, activeCategory, activeStore, activeBrand]);


  const categories = useMemo(() => ["all", ...new Set(products.map(p => p.category))], [products]);
  const allBrands = useMemo(() => ["all", ...new Set(products.map(p => p.brand))], [products]);
  const allStores = useMemo(() => ["all", ...new Set(stores.map(s => s.name))], [stores]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const normalize = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const filtered = useMemo(() => {
    let result = products.filter(p => {
      const q = normalize(query);
      const matchesQuery = !query || 
        normalize(p.name).includes(q) || 
        normalize(p.category).includes(q) || 
        normalize(p.brand).includes(q) ||
        (p.barcode && p.barcode.includes(query));

      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      const matchesStore = activeStore === "all" || p.establishment === activeStore;
      const matchesBrand = activeBrand === "all" || p.brand === activeBrand;
      const matchesPrice = p.minPrice >= priceRange[0] && p.minPrice <= priceRange[1];
      
      const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(p.capturedAt).getTime()) / (1000 * 60 * 60 * 24));
      const matchesRecency = updateRecency === "all" 
        || (updateRecency === "7d" && daysSinceUpdate <= 7)
        || (updateRecency === "24h" && daysSinceUpdate === 0);

      return matchesQuery && matchesCategory && matchesStore && matchesBrand && matchesPrice && matchesRecency;
    });

    if (sortBy === "price") {
      result.sort((a, b) => a.minPrice - b.minPrice);
    } else if (sortBy === "unit") {
      // Menor preço unitário: itens sem medida conversível vão para o fim.
      result.sort((a, b) => {
        const ua = unitPrice(a.minPrice, a.size, a.unit);
        const ub = unitPrice(b.minPrice, b.size, b.unit);
        if (ua && ub) return ua.base === ub.base ? ua.value - ub.value : ua.base.localeCompare(ub.base);
        if (ua) return -1;
        if (ub) return 1;
        return a.minPrice - b.minPrice;
      });
    } else if (sortBy === "date") {
      result.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
    } else if (sortBy === "variation") {
      result.sort((a, b) => {
        const varA = a.previousPrice ? (a.minPrice - a.previousPrice) / a.previousPrice : 0;
        const varB = b.previousPrice ? (b.minPrice - b.previousPrice) / b.previousPrice : 0;
        return varA - varB;
      });
    }
    return result;
  }, [products, query, activeCategory, activeStore, activeBrand, sortBy, priceRange, updateRecency]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, activeCategory, activeStore, activeBrand, sortBy, priceRange, updateRecency]);


  const handleShare = (p?: Product) => {
    const url = new URL(window.location.origin + window.location.pathname);
    if (p) {
      url.searchParams.set("q", p.name);
    } else {
      if (query) url.searchParams.set("q", query);
      if (activeCategory !== "all") url.searchParams.set("cat", activeCategory);
      if (activeStore !== "all") url.searchParams.set("store", activeStore);
    }
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      alert("Link de compartilhamento copiado para a área de transferência!");
    });
  };

  return (
    <div className="shell page-shell">
      {fetchError && (
        <div className="status-banner status-banner--error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '0.9rem' }}>
          <AlertTriangle size={20} />
          <div>
            <strong>Erro de conexão com o banco de dados:</strong> {fetchError}. 
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem' }}>Exibindo dados locais de contingência enquanto tentamos restabelecer a conexão.</p>
          </div>
        </div>
      )}
      <section className="search-header" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              {pathname === "/melhores-precos" ? "Melhores Ofertas" : "Comparador de Preços"}
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--muted)', maxWidth: '600px' }}>
              {pathname === "/melhores-precos" 
                ? "Economize agora com os produtos que tiveram as maiores quedas de preço em Feijó." 
                : `Encontre o menor valor entre ${stores.length} estabelecimentos locais em tempo real.`}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button className="button button--outline" onClick={() => handleShare()} style={{ height: '48px' }}>
              <Share2 size={18} /> <span className="hide-mobile">Compartilhar</span>
            </button>
            <div className="sort-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--surface)', padding: '0 1rem', height: '48px', borderRadius: '12px', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <SlidersHorizontal size={16} color="var(--tertiary)" />
              <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', color: 'var(--navy)' }}>
                <option value="price">Menor preço</option>
                <option value="unit">Menor preço por unidade</option>
                <option value="date">Mais recentes</option>
                <option value="variation">Maior queda</option>
              </select>
            </div>
          </div>
        </div>

        <div className="search-box-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <SearchBox value={query} setValue={setQuery} products={products} />
        </div>
      </section>

      <div className="search-layout">
        <aside className="search-sidebar">
          <div className="sidebar-sticky">
            <div className="filter-card">
              <div className="filter-section">
                <h3>Categorias</h3>
                <div className="filter-pills">
                  {categories.map(c => (
                    <button key={c} className={activeCategory === c ? "active" : ""} onClick={() => setActiveCategory(c)}>
                      {c === "all" ? "Todas" : c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h3>Estabelecimentos</h3>
                <div className="filter-pills">
                  {allStores.map(s => (
                    <button key={s} className={activeStore === s ? "active" : ""} onClick={() => setActiveStore(s)}>
                      {s === "all" ? "Todos" : s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h3>Marcas</h3>
                <div className="filter-pills">
                  {allBrands.slice(0, 15).map(b => (
                    <button key={b} className={activeBrand === b ? "active" : ""} onClick={() => setActiveBrand(b)}>
                      {b === "all" ? "Todas" : b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="search-results">
          {/* O aviso de erro foi movido para o topo da página para maior visibilidade */}

          {isSearching ? (
            <div className="search-loading">
              <div className="spinner" />
              <p>Otimizando busca para Feijó...</p>
            </div>
          ) : paginated.length > 0 ? (

            <>
              <div className="results-grid">
                {paginated.map(p => {
                  const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(p.capturedAt).getTime()) / (1000 * 60 * 60 * 24));
                  const isOutdated = daysSinceUpdate >= 7;

                  return (
                    <article className="result-card" key={p.id}>
                      <button className={`floating-favorite ${favorites.includes(String(p.id)) ? "active" : ""}`} onClick={() => {
                        if (!user) {
                          alert("Apenas usuários cadastrados podem favoritar produtos.");
                          return;
                        }
                        handleFavorite(String(p.id));
                      }}>
                        <Heart fill={favorites.includes(String(p.id)) ? "currentColor" : "none"} />
                      </button>
                      <div className="result-image" onClick={() => setSelectedProduct(p)} style={{ cursor: 'pointer' }}><ProductImage product={p} size="default" /></div>
                      <div className="result-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }} onClick={() => setSelectedProduct(p)}>
                          <span className="category-tag">{p.category}</span>
                          <FreshnessBadge product={p} />
                        </div>
                        <h3 style={{ cursor: 'pointer' }} onClick={() => setSelectedProduct(p)}>{p.name}</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <small>{p.brand} • {p.size}</small>
                          <UnitPriceTag product={p} />
                          <a href={`/estabelecimento/${p.establishmentSlug}`} className="establishment-link-highlight">
                            <Store size={14} style={{ marginRight: '4px' }} />
                            {p.establishment}
                          </a>

                        </div>
                        <div className="card-metrics">
                          <div className="metric-badge" title="Última verificação">
                            <Clock3 size={12} />
                            <span>{new Date(p.capturedAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="metric-badge" title="Origem dos dados">
                            <ShieldCheck size={12} />
                            <span>{p.source || "Coleta Direta"}</span>
                          </div>
                        </div>
                        
                        <div className="history-chart-container">
                          <div className="chart-header">
                            <h4><LineChart size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Histórico em Feijó</h4>
                            <select className="chart-period-select" value={chartPeriod} onChange={e => setChartPeriod(e.target.value)}>
                              <option value="7d">7 dias</option>
                              <option value="30d">30 dias</option>
                              <option value="90d">90 dias</option>
                            </select>
                          </div>
                          <div className="mini-sparkline">
                            <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                              <path 
                                d={`M 0 20 Q 25 ${15 + (p.id as any % 5)} 50 ${20 - (p.id as any % 8)} T 100 ${10 + (p.id as any % 10)}`} 
                                fill="none" 
                                stroke="var(--blue)" 
                                strokeWidth="2"
                              />
                              <circle cx="100" cy={10 + (p.id as any % 10)} r="2" fill="var(--blue)" />
                            </svg>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                            Variação de {Math.round((1 - p.minPrice / p.maxPrice) * 100)}% no período.
                          </p>
                        </div>

                        <div className="price-row" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div className="price-comparison-bar">
                            <div className="comparison-item min" title={`Encontrado em: ${p.establishment}`}>
                              <small>Mais Barato</small>
                              <strong>{money(p.minPrice)}</strong>
                              <span className="location-tag">{p.establishment}</span>
                            </div>
                            <div className="comparison-item avg">
                              <small>Média Local</small>
                              <b>{money(p.avgPrice)}</b>
                            </div>
                            <div className="comparison-item max">
                              <small>Mais Caro</small>
                              <span>{money(p.maxPrice)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="result-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="button button--primary" style={{ flex: 1 }} onClick={() => addBasket(p)}><Plus /> Cesta</button>
                          <button 
                            className={`button ${compareList.some(i => i.id === p.id) ? "button--primary" : "button--outline"}`} 
                            title="Comparar com outros produtos" 
                            onClick={() => {
                              if (compareList.some(i => i.id === p.id)) {
                                setCompareList(prev => prev.filter(i => i.id !== p.id));
                              } else if (compareList.length < 4) {
                                setCompareList(prev => [...prev, p]);
                              } else {
                                alert("Você pode comparar até 4 produtos por vez.");
                              }
                            }}
                          >
                            <LineChart size={16} />
                          </button>
                          <button className="button button--outline" title="Compartilhar produto" onClick={() => handleShare(p)}><Share2 size={16} /></button>
                          {isEnabled("priceReports") && (
                            <button className="button button--ghost" title="Informar preço incorreto" aria-label="Informar preço incorreto" onClick={() => setReportProduct(p)}><Flag size={16} /></button>
                          )}
                        </div>

                      </div>
                    </article>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="admin-pagination" style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <button className="button button--outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Anterior</button>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button 
                        key={page} 
                        className={`button ${currentPage === page ? 'button--primary' : 'button--ghost'}`}
                        style={{ minWidth: '40px', padding: '0.5rem' }}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button className="button button--outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Próximo</button>
                </div>
              )}
            </>
          ) : (
            <div className="no-results">
              <PackageSearch size={48} />
              <h2>Nenhum produto encontrado</h2>
              <p>Não encontramos "{query}". Tente variações como "{normalize(query)}" ou outros termos.</p>
              <button className="button button--outline" onClick={() => { setQuery(""); setActiveCategory("all"); setActiveStore("all"); setActiveBrand("all"); }}>Limpar tudo</button>
            </div>
          )}
        </main>
      </div>


      {reportProduct && <PriceReportModal product={reportProduct} onClose={() => setReportProduct(null)} />}

      {selectedProduct && (
        <div className="admin-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="admin-modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>Detalhes do Produto</h3>
              <button className="icon-button" onClick={() => setSelectedProduct(null)}><X/></button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ background: 'var(--surface-2)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ProductImage product={selectedProduct} size="default" eager />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="category-tag">{selectedProduct.category}</span>
                    {selectedProduct.previousPrice && selectedProduct.minPrice < selectedProduct.previousPrice && (
                      <div style={{ background: 'var(--green-soft)', color: 'var(--green)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        -{Math.round((1 - selectedProduct.minPrice / selectedProduct.previousPrice) * 100)}% de desconto
                      </div>
                    )}
                  </div>
                  <h2 style={{ fontSize: '1.75rem', margin: '0.5rem 0', fontWeight: 800 }}>{selectedProduct.name}</h2>
                  <p style={{ color: 'var(--muted)', marginBottom: '1rem', fontSize: '1rem' }}>{selectedProduct.brand} • {selectedProduct.size}</p>
                  
                  <div className="visual-price" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                    <strong style={{ fontSize: '2.25rem', color: 'var(--green)' }}>{money(selectedProduct.minPrice)}</strong>
                    {selectedProduct.previousPrice && selectedProduct.previousPrice > selectedProduct.minPrice && (
                      <span className="old-price" style={{ color: 'var(--muted)', textDecoration: 'line-through', fontSize: '1.1rem' }}>{money(selectedProduct.previousPrice)}</span>
                    )}
                  </div>

                  <div className="verified-details" style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: '12px' }}>
                    <div className="detail-item" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Store size={16} color="var(--blue)" />
                      <strong style={{ fontSize: '0.95rem' }}>{selectedProduct.establishment}</strong>
                    </div>
                    <div className="detail-item" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <MapPin size={16} color="var(--muted)" />
                      <span>{selectedProduct.neighborhood}, Feijó</span>
                    </div>
                    <div className="detail-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
                      <Clock3 size={16} />
                      <span>Verificado em: {new Date(selectedProduct.capturedAt).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '1.5rem' }}>
                    <a 
                      href={`/estabelecimento/${selectedProduct.establishmentSlug}`} 
                      className="button button--primary button--full"
                      style={{ textDecoration: 'none' }}
                    >
                      Ir para a loja <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                    </a>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <h4>Histórico de Variação</h4>
                <div style={{ height: '120px', width: '100%', marginTop: '1rem', position: 'relative' }}>
                   <svg viewBox="0 0 500 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                    <path 
                      d="M 0 80 Q 125 40 250 60 T 500 20" 
                      fill="none" 
                      stroke="var(--blue)" 
                      strokeWidth="3"
                    />
                    <circle cx="0" cy="80" r="4" fill="var(--blue)" />
                    <circle cx="250" cy="60" r="4" fill="var(--blue)" />
                    <circle cx="500" cy="20" r="4" fill="var(--blue)" />
                  </svg>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                    <span>Há 30 dias</span>
                    <span>Há 15 dias</span>
                    <span>Hoje</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button className="button button--primary" style={{ flex: 1, height: '54px', fontSize: '1rem' }} onClick={() => { addBasket(selectedProduct); setSelectedProduct(null); }}>
                  Adicionar à Cesta
                </button>
                <button className="button button--outline" style={{ height: '54px' }} onClick={() => { 
                  if (!user) {
                    alert("Acesse sua conta para configurar alertas de preço personalizados.");
                    return;
                  }
                  saveAction("alert", "product", String(selectedProduct.id)); 
                  setSelectedProduct(null); 
                }}>
                  <Bell size={18} /> Alertar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {compareList.length > 0 && (
        <div className="compare-bar" style={{
          position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--surface-1)', border: '2px solid var(--blue)', padding: '1rem',
          borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 100,
          display: 'flex', alignItems: 'center', gap: '1.5rem', maxWidth: '90vw',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', overflow: 'hidden' }}>
            {compareList.map(p => (
              <div key={p.id} style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <ProductImage product={p} size="compact" />
                <button 
                  onClick={() => setCompareList(prev => prev.filter(i => i.id !== p.id))}
                  style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', padding: '2px', cursor: 'pointer', borderRadius: '0 0 0 4px' }}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            {compareList.length} {compareList.length === 1 ? 'produto selecionado' : 'produtos selecionados'}
          </div>
          <button className="button button--primary" onClick={() => setShowCompareModal(true)}>
            Comparar agora <LineChart size={18} />
          </button>
        </div>
      )}

      {showCompareModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCompareModal(false)}>
          <div className="admin-modal-content" style={{ maxWidth: '900px', width: '95vw' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3><LineChart size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Comparativo de Preços e Variação</h3>
              <button className="icon-button" onClick={() => setShowCompareModal(false)}><X/></button>
            </div>
            <div className="admin-modal-body">
              <div className="compare-table-wrapper" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Produto</th>
                      {compareList.map(p => (
                        <th key={p.id} style={{ padding: '1rem', textAlign: 'center', minWidth: '150px' }}>
                          <ProductImage product={p} size="compact" />
                          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{p.name}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>Melhor Preço</td>
                      {compareList.map(p => (
                        <td key={p.id} style={{ padding: '1rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--blue)' }}>{money(p.minPrice)}</div>
                          <small style={{ color: 'var(--tertiary)', fontWeight: 600 }}><a href={`/estabelecimento/${p.establishmentSlug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{p.establishment}</a></small>
                        </td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>Média em Feijó</td>
                      {compareList.map(p => (
                        <td key={p.id} style={{ padding: '1rem', textAlign: 'center' }}>{money(p.avgPrice)}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>Ranking Local</td>
                      {compareList.map(p => {
                        const rank = products.filter(i => i.category === p.category).sort((a,b) => a.minPrice - b.minPrice).findIndex(i => i.id === p.id) + 1;
                        return (
                          <td key={p.id} style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{ background: rank === 1 ? 'var(--blue)' : 'var(--surface-2)', color: rank === 1 ? 'white' : 'inherit', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                              #{rank} na categoria
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>Tendência</td>
                      {compareList.map(p => {
                        const diff = p.previousPrice ? ((p.minPrice - p.previousPrice) / p.previousPrice) * 100 : 0;
                        return (
                          <td key={p.id} style={{ padding: '1rem', textAlign: 'center' }}>
                            {diff !== 0 ? (
                              <div style={{ color: diff < 0 ? 'var(--green)' : 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontWeight: 700 }}>
                                {diff < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                                {Math.abs(Math.round(diff))}%
                              </div>
                            ) : 'Estável'}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                <button className="button button--ghost" onClick={() => setCompareList([])}>Limpar comparação</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



export default function PrecoCertoApp() {
  const pathname = useLocation().pathname || "/";
  const [products,setProducts]=useState<Product[]>(initialProducts);
  const [stores,setStores]=useState<StoreRow[]>(initialStores);
  const [metrics,setMetrics]=useState<PlatformMetrics>(verifiedDatasetMetrics);
  const [query,setQuery]=useState("");
  const [cart,setCart]=useState<Product[]>(() => JSON.parse(localStorage.getItem("precocerto:basket") || "[]"));
  const [toast,setToast]=useState("");
  const [syncStatus, setSyncStatus] = useState<"online" | "syncing" | "error">("online");
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [user, setUser] = useState<{name: string} | null>(() => {
    const saved = localStorage.getItem("precocerto:user");
    return saved ? JSON.parse(saved) : null;
  });
  // O acesso admin nunca é decidido pelo navegador: consultamos a sessão e os
  // papéis no backend em cada carregamento.
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminCheck, setAdminCheck] = useState<"checking" | "done">("checking");
  const [adminProfile, setAdminProfile] = useState<SessionProfile | null>(null);
  
  const isAdmin = pathname.startsWith("/admin") && pathname !== "/admin-login"; 
  const isAuth = ["/login","/cadastro","/registrar","/admin-login"].includes(pathname);

  useEffect(() => {
    let alive = true;
    loadSessionProfile().then(profile => {
      if (!alive) return;
      setAdminProfile(profile);
      setAdminAuth(Boolean(profile?.isAdmin));
      setAdminCheck("done");
    });
    return () => { alive = false; };
  }, []);


  useEffect(() => {
    let alive = true;
    let timer: any;

    const q = new URLSearchParams(window.location.search).get("q") ?? "";
    if (q && !query) setQuery(q);

    const load = async () => {
      if (!alive) return;
      setSyncStatus("syncing");
      
      try {
        const data = await fetchCatalog(query);
        if (!alive) return;
        
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
          setFetchError(null);
        } else if (data.error) {
          setFetchError(data.error);
        }
        
        if (data.stores && data.stores.length > 0) {
          setStores(data.stores);
        }
        
        setMetrics(data.metrics);
        setSyncStatus("online");
      } catch (err) {
        if (!alive) return;
        setSyncStatus("error");
        setFetchError(err instanceof Error ? err.message : "Falha na conexão");
      }
      
      // Auto-refresh: 30s se pesquisando, 2m se inativo
      timer = setTimeout(load, query ? 30000 : 120000);
    };

    load();
    return () => { 
      alive = false; 
      clearTimeout(timer);
    };
  }, [query]);


  useEffect(() => {
    localStorage.setItem("precocerto:basket", JSON.stringify(cart));
  }, [cart]);

  useEffect(()=>{ if(!toast)return; const t=setTimeout(()=>setToast(""),2800); return()=>clearTimeout(t); },[toast]);
  
  function addBasket(p:Product){setCart(current=>current.some(i=>i.id===p.id)?current:[...current,p]);setToast(`${p.name} adicionado.`);}
  function removeBasket(id:number|string){setCart(current=>current.filter(i=>String(i.id)!==String(id)));setToast("Removido.");}
  
  function saveAction(action:string,type:string,id:string){
    const key="precocerto:actions";
    const saved=JSON.parse(localStorage.getItem(key)??"[]");
    const isNew = !saved.some((a: any) => a.action === action && a.type === type && a.id === id);
    
    if (isNew) {
      localStorage.setItem(key,JSON.stringify([...saved,{action,type,id,at:new Date().toISOString()}].slice(-200)));
      setToast(action==="alert"?"Alerta de preço ativado.":"Favoritado.");
    } else if (action === "alert") {
      setToast("Você já está acompanhando este produto.");
    } else {
      setToast("Item já está nos favoritos.");
    }
  }

  const props = useMemo(()=>({products,stores,metrics,query,setQuery,addBasket,saveAction,fetchError,syncStatus,user}),[products,stores,metrics,query,fetchError,syncStatus,user]);

  const handleAdminAuth = (success: boolean) => {
    if (success) {
      setAdminAuth(true);
      setAdminCheck("done");
      addAuditLog("Login administrativo realizado");
    }
  };

  const handleUserLogin = () => {
    const newUser = { name: "Usuário PreçoCerto" };
    setUser(newUser);
    localStorage.setItem("precocerto:user", JSON.stringify(newUser));
    setToast("Bem-vindo ao PreçoCerto!");
  };

  const handleLogout = () => {
    setUser(null);
    setAdminAuth(false);
    localStorage.removeItem("precocerto:user");
    void signOut();
    window.location.href = "/";
  };

  const handleAdminLogout = () => {
    setAdminAuth(false);
    setAdminProfile(null);
    void signOut();
    window.location.href = "/login";
  };

  if (isAdmin && adminCheck === "checking") {
    return <div className="admin-boot-gate" role="status" aria-live="polite">
      <ShieldCheck size={22}/> Validando suas permissões...
    </div>;
  }

  if (isAdmin && !adminAuth) {
    window.location.href = "/admin-login";
    return null;
  }

  let page:ReactNode;
  if(pathname==="/") page=<HomePage {...props}/>;
  else if(pathname==="/buscar"||pathname==="/comparador"||pathname==="/melhores-precos") page=<SearchPage {...props} metrics={metrics}/>;
  else if(pathname==="/alertas"||pathname==="/perfil") page=<GenericPage {...props} metrics={metrics} path={pathname} user={user}/>;
  else if(isAdmin) page=<AdminPage path={pathname} onLogout={handleAdminLogout} products={products} stores={stores}/>;
  else if(isAuth) page=<AuthPage path={pathname} onAdminAuth={handleAdminAuth} onLogin={handleUserLogin}/>;
  else page=<GenericPage {...props} metrics={metrics} path={pathname}/>;

  return <div className="app">
    <Header basketCount={cart.length} user={user} onLogout={handleLogout}/>
    <main>{page}</main>
    <Footer/>
    <MobileBar basketCount={cart.length}/>
    {toast&&<div className="toast"><CheckCircle2/>{toast}</div>}
  </div>;
}
