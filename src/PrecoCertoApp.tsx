
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, Bell, Camera, Check, CheckCircle2,
  ChevronDown, ChevronRight, CircleDollarSign, Clock3, Database, Download, Edit,
  Heart, Home, LayoutDashboard, LineChart, ListChecks, MapPin, Menu, PackageSearch,
  Plus, Receipt, Search, Settings, Share2, ShieldCheck, ShoppingBasket,
  SlidersHorizontal, Sparkles, Store, Trash2, TrendingDown, Upload, UserRound, Users, X,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { buildCatalog, verifiedDatasetMetrics, type PlatformMetrics, type Product, type StoreRow } from "./data/catalog";
import { fetchCatalog } from "./data/remoteCatalog";
import { supabase } from "./lib/supabase";

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


const productImages: Record<string, string> = {
  // Mapeamento manual para o catálogo local (seed)
  "arroz-tio-joao-5kg": "/products/arroz-tio-joao-5kg.png",
  "cafe-3-coracoes-500g": "/products/cafe-3-coracoes-500g.jpg",
  "leite-italac-1l": "/products/leite-italac-1l.jpg",
  "feijao-kicaldo-1kg": "/products/feijao-kicaldo-1kg.jpg",
  "oleo-soja-liza-900ml": "/products/oleo-liza-900ml.jpg",
  "acucar-uniao-1kg": "/products/acucar-uniao-1kg.jpg",
  "detergente-ype-500ml": "/products/detergente-vida-neutro-500ml.jpg",

  // Mapeamento por UUID para dados do Supabase (conforme auditoria)
  "c1d78817-20b9-40b2-b12d-a9bc73152d47": "/products/detergente-vida-neutro-500ml.jpg",
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
  "feijao-kicaldo-1kg": "/products/feijao-kicaldo-1kg.jpg",
  "feijao-carioca-bernardo-1kg": "/products/feijao-carioca-bernardo-1kg.jpg",
  "oleo-liza-900ml": "/products/oleo-liza-900ml.jpg",
  "oleo-soja-liza-900ml": "/products/oleo-liza-900ml.jpg",
};

function ProductImage({ product, size = "default", eager = false }: { product: Product | any; size?: "compact" | "default" | "hero" | "basket"; eager?: boolean }) {
  const fallback = "/products/arroz-tio-joao-5kg.png";
  
  // Identificamos se o produto é um detergente pelo nome ou categoria para evitar o fallback de arroz
  const isDetergent = product.name?.toLowerCase().includes("detergente") || product.category?.toLowerCase().includes("limpeza");
  const detergentFallback = "/products/detergente-vida-neutro-500ml.jpg";

  const src = product.image_url || 
              productImages[product.slug] || 
              productImages[String(product.id)] || 
              (isDetergent ? detergentFallback : fallback);
  
  return <span className={`product-photo product-photo--${size}`}><img src={src} alt={`Embalagem de ${product.name}`} loading={eager ? "eager" : "lazy"} onError={(e) => {
    const target = e.target as HTMLImageElement;
    const currentFallback = isDetergent ? detergentFallback : fallback;
    if (target.src !== currentFallback) {
      target.src = currentFallback;
    }
  }} /><i aria-hidden="true" /></span>;
}

import logoAsset from "./assets/logo-clean.png.asset.json";

function Brand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <a 
      className={`brand ${inverse ? "brand--inverse" : ""} ${compact ? "brand--compact" : ""}`} 
      href="/" 
      aria-label="PreçoCerto — página inicial"
    >
      <img 
        className="brand__logo-img"
        src={logoAsset.url} 
        alt="PreçoCerto" 
      />
    </a>
  );
}



function Header({ basketCount, user, onLogout }: { basketCount: number; user: any; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  return <header className={`site-header ${window.location.pathname === "/" ? "site-header--absolute" : ""}`}>
    <div className="shell header-inner">
      {/* Logo removida do header a pedido do usuário */}
      <span className="header-location"><MapPin size={14} /> Feijó, AC</span>
      <nav className="desktop-nav" aria-label="Navegação principal">
        <a href="/buscar">Comparar preços</a><a href="/melhores-precos">Ofertas</a><a href="/cesta-basica">Cesta inteligente</a><a href="/estabelecimentos">Estabelecimentos</a><a href="/planos">Planos</a>
      </nav>
      <div className="header-actions">
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
    {open && <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Menu principal"><button className="drawer-backdrop" aria-label="Fechar menu" onClick={() => setOpen(false)} /><div className="drawer-panel"><div className="drawer-head">{/* Logo removida do drawer a pedido do usuário */}<button className="icon-button" onClick={() => setOpen(false)} aria-label="Fechar menu"><X /></button></div><nav><a href="/buscar">Comparar preços</a><a href="/cesta-basica">Cesta inteligente</a><a href="/estabelecimentos">Estabelecimentos</a><a href="/melhores-precos">Ofertas de hoje</a><a href="/planos">Planos</a><a href="/colaborar">Enviar nota fiscal</a><a href="/admin" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #eee', color: '#888', fontSize: '0.9rem' }}>Área Administrativa</a></nav><a className="button button--primary" href="/cadastro">Criar conta gratuita</a><a className="button button--ghost" href="/login">Já tenho uma conta</a></div></div>}
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
  const suggestions = products.filter(p => !value || `${p.name} ${p.category} ${p.brand}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))).slice(0, 6);
  function submit(event: FormEvent) { event.preventDefault(); const q = value.trim(); window.location.href = q ? `/buscar?q=${encodeURIComponent(q)}` : "/buscar"; }
  return <div className={`search-combo ${hero ? "search-combo--hero" : ""}`}>
    <form onSubmit={submit} role="search"><Search aria-hidden="true" /><label className="sr-only" htmlFor={hero ? "hero-search" : "page-search"}>Buscar produto</label><input id={hero ? "hero-search" : "page-search"} role="combobox" value={value} onChange={e => setValue(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 120)} placeholder="Busque arroz, café, carne, leite..." autoComplete="off" aria-expanded={focused} aria-controls={hero ? "hero-suggestions" : "page-suggestions"} aria-autocomplete="list" /><button className="button button--primary" type="submit">Comparar preços <ArrowRight size={18} /></button></form>
    {focused && <div className="suggestions" id={hero ? "hero-suggestions" : "page-suggestions"} role="listbox"><div className="suggestions-label">{value ? "Sugestões encontradas" : "Buscas populares em Feijó"}</div>{suggestions.map(p => <a role="option" aria-selected="false" href={`/buscar?q=${encodeURIComponent(p.name)}`} key={p.id}><span className="suggestion-icon"><PackageSearch size={18} /></span><span><strong>{p.name}</strong><small>{p.brand} • {p.size}</small></span><span className="suggestion-price"><small>a partir de</small><b>{money(p.minPrice)}</b><em>{p.establishment}</em></span></a>)}</div>}
  </div>;
}

function PriceBadge({ product }: { product: Product }) {
  const saving = product.previousPrice ? Math.max(0, ((product.previousPrice - product.minPrice) / product.previousPrice) * 100) : 0;
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
                <span><strong>{p.establishment}</strong><small><MapPin /> {p.neighborhood}</small></span>
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
    <section className="section section--soft"><div className="shell"><div className="section-heading"><div><span className="eyebrow">Agora em Feijó</span><h2>Preços em tempo real</h2><p>Compare registros recentes e encontre o menor preço com transparência.</p></div><div className="segmented"><button className={priceMode === "recent" ? "active" : ""} onClick={() => setPriceMode("recent")}>Recentes</button><button className={priceMode === "lowest" ? "active" : ""} onClick={() => setPriceMode("lowest")}>Menor preço</button></div></div><div className="price-table-card"><div className="price-table-head"><span>Produto</span><span>Mercado</span><span>Preço</span><span>Atualizado</span><span>Ação</span></div>{rows.map((p, index) => <div className="price-row" key={p.id}><div className="product-cell"><ProductImage product={p} size="compact" /><span><a href={`/produto/${p.slug}`}>{p.name}</a><small>{p.brand} • {p.size}</small></span></div><div className="market-cell"><span className="market-dot" style={{background:p.storeColor}} /> <span>{p.establishment}<small>{p.neighborhood}</small></span></div><div><strong className="green-price">{money(p.minPrice)}</strong>{index < 3 && <PriceBadge product={p} />}</div><div><span className="freshness"><Clock3 /> há {8 + index * 7} min</span></div><div className="row-actions"><button onClick={() => saveAction("favorite", "product", String(p.id))} aria-label={`Favoritar ${p.name}`}><Heart /></button><button onClick={() => addBasket(p)} aria-label={`Adicionar ${p.name} à cesta`}><Plus /></button></div></div>)}<div className="table-footer"><a href="/buscar">Abrir catálogo completo <ArrowRight /></a><span><ShieldCheck /> Dados auditáveis e verificados</span></div></div></div></section>
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, productId: string) => {
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
  return <div className="admin-shell"><aside className="admin-sidebar"><Brand inverse/><nav><span>Operação</span><a href="/admin" className={path==="/admin"?"active":""}><LayoutDashboard/> Visão geral</a><a href="/admin/clientes"><Users/> Clientes</a><a href="/admin/catalogo" className={path==="/admin/catalogo" || path==="/admin/fotos-pendentes" ?"active":""}><PackageSearch/> Catálogo</a><a href="/admin/precos"><CircleDollarSign/> Preços</a><a href="/admin/importacoes" className={path==="/admin/importacoes"?"active":""}><Database/> Importações</a><span>Inteligência</span><a href="/admin/analytics"><BarChart3/> Analytics</a><a href="/admin/ia"><Sparkles/> IA e cotas</a><a href="/admin/webhooks"><Activity/> Webhooks</a><a href="/admin/auditoria"><ShieldCheck/> Auditoria</a></nav><a className="admin-back" href="/" style={{ marginBottom: '1rem' }}><ArrowRight/> Voltar ao site</a><button className="button button--ghost button--small" onClick={handleLogoutRequest} style={{ color: '#fca5a5', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start', paddingLeft: '1rem' }}><X size={16}/> Deslogar Admin</button></aside><main className="admin-main"><header><div><small>Admin / Operação</small><h1>{title}</h1></div><div>{importMsg && <span className="admin-import-badge" style={{fontSize:"0.75rem",background:"#fef3c7",color:"#92400e",padding:"0.25rem 0.75rem",borderRadius:"1rem",marginRight:"1rem"}}>{importMsg}</span>}<button className="icon-button"><Bell/></button><span className="admin-user">FD</span></div></header>

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

  
  <div className="admin-kpis">
    <article onClick={() => setActiveKpiDetail({ title: "Preços Ativos", data: rows })} style={{ cursor: 'pointer' }}><span>Preços ativos <Activity/></span><strong>8.932</strong><small className="positive">+12,4% nesta semana</small></article>
    <article onClick={() => setActiveKpiDetail({ title: "Produtos Cobertos", data: initialProducts.slice(0, 10) })} style={{ cursor: 'pointer' }}><span>Produtos cobertos <PackageSearch/></span><strong>1.247</strong><small>82% da cesta base</small></article>
    <article onClick={() => window.location.href = '/admin/fotos-pendentes'} style={{ cursor: 'pointer', border: '1px solid #f59e0b', background: '#fffbeb' }}><span>Fotos Pendentes <Camera color="#d97706"/></span><strong>{allProducts.filter(p => !p.image_url).length}</strong><small className="warning" style={{ color: '#d97706' }}>Itens sem imagem real</small></article>
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
                <small style={{display: "block", marginTop: "0.75rem", color: "#b91c1c", fontSize: "0.75rem"}}>
                  Verifique a conexão com o banco ou permissões de RLS.
                </small>
              </div>
            ) : (
              <>
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: "0.5rem"}}>
                  <span style={{fontSize: "0.85rem"}}>Novos preços inseridos:</span>
                  <strong style={{color: "#16a34a"}}>+{importLog.count}</strong>
                </div>
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: "0.5rem"}}>
                  <span style={{fontSize: "0.85rem"}}>Duplicados ignorados:</span>
                  <span style={{color: "#6b7280"}}>{importLog.duplicates}</span>
                </div>
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: "0.5rem"}}>
                  <span style={{fontSize: "0.85rem"}}>Total processado:</span>
                  <strong>{importLog.count + importLog.duplicates}</strong>
                </div>
                <div style={{borderTop: "1px solid #e5e7eb", marginTop: "0.5rem", paddingTop: "0.5rem", display: "flex", justifyContent: "space-between"}}>
                  <small style={{color: "#6b7280"}}>Execução: {(importLog.duration / 1000).toFixed(2)}s</small>
                  <small style={{color: "#6b7280"}}>{importLog.stores} lojas | {importLog.products} produtos</small>
                </div>
                <div style={{marginTop: '0.75rem', padding: '0.5rem', background: '#f0fdf4', color: '#166534', borderRadius: '0.25rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <Check size={14}/> Sincronização concluída com sucesso.
                </div>
                {importLog.errorReport && importLog.errorReport.length > 0 && (
                  <div style={{marginTop: '1rem', border: '1px solid #fecaca', borderRadius: '0.5rem', overflow: 'hidden'}}>
                    <div style={{background: '#fee2e2', padding: '0.5rem 1rem', fontSize: '0.8rem', borderBottom: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between'}}>
                      <b>Relatório de Inconsistências</b>
                      <span>{importLog.errorReport.length} falhas</span>
                    </div>
                    <div style={{maxHeight: '150px', overflowY: 'auto', background: 'white', padding: '0.5rem'}}>
                      {importLog.errorReport.map((err: any, idx: number) => (
                        <div key={idx} style={{fontSize: '0.75rem', padding: '0.25rem 0', borderBottom: idx < importLog.errorReport.length - 1 ? '1px solid #f1f5f9' : 'none'}}>
                          <span style={{color: '#dc2626'}}>[{err.entity.toUpperCase()}]</span> {err.message}
                          <pre style={{background: '#f8fafc', padding: '0.25rem', marginTop: '0.1rem', fontSize: '0.7rem', color: '#64748b'}}>
                            {JSON.stringify(err.data, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div style={{padding: "1rem", textAlign: "center", color: "#6b7280"}}><small>Aguardando início do processo de carga.</small></div>
        )}
      </div>
    </section>

  </div>

  <section className="admin-card">
    <div className="admin-card-head">
      <div>
        <h2>{path === "/admin/fotos-pendentes" ? "Fotos Pendentes" : "Gestão de Catálogo"}</h2>
        <p>{path === "/admin/fotos-pendentes" ? "Produtos aguardando imagem real para melhor visualização." : "Produtos e estabelecimentos registrados no sistema."}</p>
      </div>
      <div style={{display:"flex",gap:"0.75rem"}}>
        <button className="button button--outline" onClick={handleImport} disabled={isImporting} title="Disparar importação para o Supabase externo">
          <Database/> {isImporting ? "Importando..." : "Importar Dados Excel"}
        </button>
        <button className="button button--primary" onClick={() => setShowAddProduct(true)}><Plus/> Novo produto</button>
        <button className="button button--primary" onClick={() => setShowAddStore(true)} style={{ background: '#10b981' }}><Store/> Nova Loja</button>
      </div>
    </div>
    
    {path !== "/admin/fotos-pendentes" && (
      <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', padding: '0 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <button 
          onClick={() => setAdminActiveTab("products")}
          style={{ padding: '0.75rem 1rem', borderBottom: adminActiveTab === 'products' ? '2px solid #1473e6' : 'none', color: adminActiveTab === 'products' ? '#1473e6' : '#64748b', fontWeight: adminActiveTab === 'products' ? '600' : '400', background: 'none' }}
        >
          Produtos ({filteredProducts.length})
        </button>
        <button 
          onClick={() => setAdminActiveTab("stores")}
          style={{ padding: '0.75rem 1rem', borderBottom: adminActiveTab === 'stores' ? '2px solid #1473e6' : 'none', color: adminActiveTab === 'stores' ? '#1473e6' : '#64748b', fontWeight: adminActiveTab === 'stores' ? '600' : '400', background: 'none' }}
        >
          Lojas ({filteredStores.length})
        </button>
      </div>
    )}

    <div className="admin-filters">
      <label style={{ flex: 1 }}>
        <Search/>
        <input 
          placeholder={adminActiveTab === 'products' ? "Buscar por nome ou código de barras..." : "Buscar loja pelo nome..."} 
          value={adminSearch}
          onChange={e => setAdminSearch(e.target.value)}
        />
      </label>
      {adminActiveTab === 'products' && (
        <select 
          value={adminFilterStore} 
          onChange={e => setAdminFilterStore(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
        >
          <option value="all">Todos os Mercados</option>
          {allStores.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      )}
      <button className="button button--outline" onClick={() => { setAdminSearch(""); setAdminFilterStore("all"); }}><SlidersHorizontal/> Limpar</button>
    </div>

    <div className="admin-table">
      {adminActiveTab === 'products' ? (
        <>
          <div className="admin-tr admin-th">
            <span onClick={() => requestSort('name')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Produto {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </span>
            <span onClick={() => requestSort('brand')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Marca / Cat. {sortConfig?.key === 'brand' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </span>
            <span onClick={() => requestSort('establishment')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Mercado Base {sortConfig?.key === 'establishment' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </span>
            <span onClick={() => requestSort('minPrice')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Preço Min. {sortConfig?.key === 'minPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </span>
            <span style={{ textAlign: 'right' }}>Ações</span>
          </div>
          {paginatedProducts.map((p: any) => (
            <div className="admin-tr" key={p.id}>
              <span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div 
                    onClick={() => setPhotoViewer({ url: p.image_url || "/products/arroz-tio-joao-5kg.png", name: p.name })}
                    style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <ProductImage product={p} size="compact" />
                  </div>
                  <div>
                    <b>{p.name}</b>
                    <small style={{ display: 'block' }}>{p.barcode || 'Sem código'}</small>
                  </div>
                </div>
              </span>
              <span>{p.brand}<br/><small>{p.category}</small></span>
              <span>{p.establishment}</span>
              <span><b>{money(p.minPrice)}</b></span>
              <span style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                <button className="icon-button" onClick={() => setEditingItem({ type: 'product', data: p })} title="Editar"><Edit size={16}/></button>
                <button className="icon-button" onClick={() => setConfirmDelete({ type: 'product', id: String(p.id), name: p.name })} style={{ color: '#dc2626' }} title="Excluir"><Trash2 size={16}/></button>
              </span>
            </div>
          ))}
        </>
      ) : (
        <>
          <div className="admin-tr admin-th">
            <span onClick={() => requestSort('name')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Estabelecimento {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </span>
            <span onClick={() => requestSort('neighborhood')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Bairro {sortConfig?.key === 'neighborhood' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </span>
            <span>Tipo</span>
            <span style={{ textAlign: 'right' }}>Ações</span>
          </div>
          {paginatedStores.map((s: any) => (
            <div className="admin-tr" key={s.id}>
              <span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                  <b>{s.name}</b>
                </div>
              </span>
              <span>{s.neighborhood}</span>
              <span>{s.kind === 'market' ? 'Supermercado' : s.kind}</span>
              <span style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                <button className="icon-button" onClick={() => setEditingItem({ type: 'store', data: s })} title="Editar"><Edit size={16}/></button>
                <button className="icon-button" onClick={() => setConfirmDelete({ type: 'store', id: String(s.id), name: s.name })} style={{ color: '#dc2626' }} title="Excluir"><Trash2 size={16}/></button>
              </span>
            </div>
          ))}
        </>
      )}

    </div>
    <div className="admin-card-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>Mostrando {adminActiveTab === 'products' ? paginatedProducts.length : paginatedStores.length} de {adminActiveTab === 'products' ? filteredProducts.length : filteredStores.length} registros</span>
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button 
            className="button button--outline button--small" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >Anterior</button>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
            Página {currentPage} de {totalPages}
          </div>
          <button 
            className="button button--outline button--small" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >Próxima</button>
        </div>
      )}
    </div>

  </section>

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
        const { error } = await supabase.from('products').insert({
          name, brand, category, size, barcode
        });
        if (error) alert("Erro ao salvar: " + error.message);
        else {
          addAuditLog(`Novo produto cadastrado: ${name}`);
          setShowAddProduct(false);
          loadLogs();
          window.location.reload();
        }
      }}>
        <div className="admin-modal-head">
          <h3>Cadastrar Novo Produto</h3>
          <button type="button" className="icon-button" onClick={() => setShowAddProduct(false)}><X/></button>
        </div>
        <div className="admin-modal-body" style={{ display: 'grid', gap: '0.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', background: '#f8fafc', borderRadius: '0.5rem', border: '2px dashed #cbd5e1', marginBottom: '1rem' }}>
            <Camera size={32} color="#64748b" />
            <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#64748b' }}>Clique para subir foto</div>
            <input type="file" accept="image/*" style={{ opacity: 0, position: 'absolute', width: '100px', cursor: 'pointer' }} onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && !file.type.startsWith('image/')) {
                alert("Apenas arquivos de imagem são permitidos.");
                e.target.value = "";
              } else if (file) {
                alert('Foto selecionada: ' + file.name + ' (O upload real ocorre na edição do produto)');
              }
            }} />
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
                    <small>{p.brand} • {p.size} • {p.establishment}</small>
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
            <div className="aside-stat">
              <span>Notificar queda de preço</span>
              <strong style={{ fontSize: '1rem', color: 'var(--blue)' }}>Ativado</strong>
            </div>
            <div className="aside-stat">
              <span>Alerta de dado expirado (7 dias)</span>
              <strong style={{ fontSize: '1rem', color: 'var(--blue)' }}>Ativado</strong>
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
                <small>{p.brand} • {p.size} • <strong>{p.establishment}</strong></small>
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

  function submit(e: FormEvent) {
    e.preventDefault();
    if (blockedUntil && Date.now() < blockedUntil) {
      const remaining = Math.ceil((blockedUntil - Date.now()) / 1000);
      setError(`Acesso bloqueado por segurança. Tente novamente em ${remaining}s.`);
      return;
    }

    if (isAdminLogin) {
      const savedPass = localStorage.getItem("precocerto:admin_password") || "feijo2026";
      if (user === "admin" && pass === savedPass) {
        onAdminAuth(true);
        setAttempts(0);
        localStorage.removeItem("precocerto:admin_blocked_until");
        window.location.href = "/admin";
      } else {
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

    if (recoveryStep === 1) {
      if (recoveryUser === "admin") {
        setIsSendingEmail(true);
        setError("");
        try {
          const { sendAdminResetEmail } = await import("./data/importer");
          const res = await sendAdminResetEmail("admin@precocerto.com.br", "admin");
          if (res.success) {
            setRecoveryStep(2);
            addAuditLog("Solicitação de redefinição de senha admin (E-mail enviado)");
          } else {
            setError(res.error || "Erro ao enviar e-mail.");
          }
        } catch (err) {
          setError("Erro técnico ao processar envio.");
        } finally {
          setIsSendingEmail(false);
        }
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 3) {
          const until = Date.now() + 300000; // 5 min
          setBlockedUntil(until);
          localStorage.setItem("precocerto:admin_blocked_until", until.toString());
          setError("Muitas tentativas de recuperação. Bloqueado por 5 minutos.");
          addAuditLog("Bloqueio de recuperação por tentativas inválidas", "error");
        } else {
          setError(`Usuário não encontrado. Tentativa ${newAttempts} de 3.`);
        }
      }
    } else {
      if (newPass.length < 6) {
        setError("A nova senha deve ter pelo menos 6 caracteres.");
        return;
      }
      localStorage.setItem("precocerto:admin_password", newPass);
      addAuditLog("Senha administrativa redefinida via fluxo de recuperação", "warning");
      setShowForgot(false);
      setRecoveryStep(1);
      setError("");
      alert("Senha administrativa alterada com sucesso!");
    }
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
                <label>Confirme o Usuário Administrador<input required value={recoveryUser} onChange={e=>setRecoveryUser(e.target.value)} placeholder="usuário"/></label>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '0.25rem' }}>
                  <ShieldCheck size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }}/>
                  Um link de segurança será simulado para o email do administrador.
                </div>
              </>
            ) : (
              <>
                <label>Nova Senha Administrativa<input required type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="mínimo 6 caracteres"/></label>
                <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '0.5rem' }}>
                  <Clock3 size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }}/>
                  Esta sessão de redefinição expira em 10 minutos.
                </div>
              </>
            )

          ) : (
            <>
              <label>Usuário Administrador<input required value={user} onChange={e=>setUser(e.target.value)} placeholder="usuário"/></label>
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

        <button className="button button--primary button--full" type="submit" disabled={isAdminLogin ? (showForgot ? (recoveryStep === 1 ? (!recoveryUser || isSendingEmail) : !newPass) : (!user || !pass)) : (pin.length!==6||cpf.length!==11)}>
          {isAdminLogin ? (showForgot ? (recoveryStep === 1 ? (isSendingEmail ? "Enviando..." : "Enviar E-mail de Recuperação") : "Salvar Nova Senha") : "Autenticar Acesso") : register?"Criar minha conta":"Entrar com segurança"}
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


function SearchPage({ products, stores, metrics, query, setQuery, addBasket, saveAction }: PageProps) {
  const pathname = useLocation().pathname;
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeStore, setActiveStore] = useState("all");
  const [activeBrand, setActiveBrand] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [updateRecency, setUpdateRecency] = useState("all"); // 'all', '7d', '24h'
  const [sortBy, setSortBy] = useState<"price" | "date" | "variation">(pathname === "/melhores-precos" ? "variation" : "price");
  const [chartPeriod, setChartPeriod] = useState("30d");
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 400);
      return () => clearTimeout(timer);
    }
  }, [query, activeCategory, activeStore, activeBrand]);

  const categories = useMemo(() => ["all", ...new Set(products.map(p => p.category))], [products]);
  const allBrands = useMemo(() => ["all", ...new Set(products.map(p => p.brand))], [products]);
  const allStores = useMemo(() => ["all", ...new Set(stores.map(s => s.name))], [stores]);

  const filtered = useMemo(() => {
    let result = products.filter(p => {
      const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const matchesQuery = !query || `${p.name} ${p.brand} ${p.category}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q);
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
  }, [products, query, activeCategory, activeStore, activeBrand, sortBy]);

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
      <section className="search-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>{pathname === "/melhores-precos" ? "Melhores Ofertas de Feijó" : "Comparador de Preços"}</h1>
          <p>{pathname === "/melhores-precos" ? "Veja os produtos com maior queda de preço e economize agora." : `Encontre o melhor preço entre ${stores.length} estabelecimentos em Feijó.`}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="button button--outline" onClick={() => handleShare()}>
            <Share2 size={16} /> Compartilhar busca
          </button>
          <div className="sort-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-2)', padding: '0.25rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <SlidersHorizontal size={14} color="var(--tertiary)" />
            <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: '600' }}>
              <option value="price">Menor preço</option>
              <option value="date">Mais recentes</option>
              <option value="variation">Maior queda</option>
            </select>
          </div>
        </div>
        <div style={{ width: '100%', maxWidth: '600px', marginTop: '1.5rem' }}>
          <SearchBox value={query} setValue={setQuery} products={products} />
        </div>
      </section>

      <div className="search-layout">
        <aside className="search-sidebar">
          <div className="filter-group">
            <div className="filter-header">
              <h3>Categorias</h3>
            </div>
            <div className="filter-list">
              {categories.map(c => (
                <button key={c} className={activeCategory === c ? "active" : ""} onClick={() => setActiveCategory(c)}>
                  {c === "all" ? "Todas" : c}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <div className="filter-header">
              <h3>Marcas</h3>
            </div>
            <div className="filter-list">
              {allBrands.map(b => (
                <button key={b} className={activeBrand === b ? "active" : ""} onClick={() => setActiveBrand(b)}>
                  {b === "all" ? "Todas" : b}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <div className="filter-header">
              <h3>Estabelecimentos</h3>
            </div>
            <div className="filter-list">
              {allStores.map(s => (
                <button key={s} className={activeStore === s ? "active" : ""} onClick={() => setActiveStore(s)}>
                  {s === "all" ? "Todos" : s}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <div className="filter-header">
              <h3>Faixa de Preço</h3>
            </div>
            <div style={{ padding: '0 0.5rem' }}>
              <input 
                type="range" 
                min="0" 
                max="500" 
                value={priceRange[1]} 
                onChange={e => setPriceRange([0, Number(e.target.value)])}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                <span>R$ 0</span>
                <span>Até {money(priceRange[1])}</span>
              </div>
            </div>
          </div>
          <div className="filter-group">
            <div className="filter-header">
              <h3>Recência</h3>
            </div>
            <div className="filter-list">
              <button className={updateRecency === "all" ? "active" : ""} onClick={() => setUpdateRecency("all")}>Todos</button>
              <button className={updateRecency === "24h" ? "active" : ""} onClick={() => setUpdateRecency("24h")}>Hoje</button>
              <button className={updateRecency === "7d" ? "active" : ""} onClick={() => setUpdateRecency("7d")}>Última semana</button>
            </div>
          </div>
        </aside>

        <main className="search-results">
          {isLoading ? (
            <div className="search-loading">
              <div className="spinner" />
              <p>Otimizando busca para Feijó...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="results-grid">
              {filtered.map(p => {
                const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(p.capturedAt).getTime()) / (1000 * 60 * 60 * 24));
                const isOutdated = daysSinceUpdate >= 7;

                return (
                  <article className="result-card" key={p.id}>
                    <button className={`floating-favorite ${favorites.includes(String(p.id)) ? "active" : ""}`} onClick={() => handleFavorite(String(p.id))}>
                      <Heart fill={favorites.includes(String(p.id)) ? "currentColor" : "none"} />
                    </button>
                    <div className="result-image"><ProductImage product={p} /></div>
                    <div className="result-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="category-tag">{p.category}</span>
                        {isOutdated && (
                          <span className="outdated-badge" title="Este preço pode ter mudado">
                            <Clock3 size={10} /> {daysSinceUpdate} dias sem verificar
                          </span>
                        )}
                      </div>
                      <h3 style={{ cursor: 'pointer' }} onClick={() => setSelectedProduct(p)}>{p.name}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <small>{p.brand} • {p.size}</small>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {p.establishment}
                        </span>
                      </div>
                      <div className="verified-details">
                        <div className="detail-item" title="Local de coleta">
                          <MapPin size={12} />
                          <span>{p.establishment}</span>
                        </div>
                        <div className="detail-item" title="Data da última atualização">
                          <Clock3 size={12} />
                          <span>{new Date(p.capturedAt).toLocaleDateString('pt-BR')} às {new Date(p.capturedAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="detail-item" title="Origem do dado">
                          <ShieldCheck size={12} />
                          <span>Origem: {p.source || "Coleta Direta"}</span>
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

                      <div className="price-row" style={{ marginTop: '1.5rem' }}>
                        <div className="main-price"><small>Melhor preço</small><strong>{money(p.minPrice)}</strong></div>
                        <div className="avg-price"><small>Média local</small><b>{money(p.avgPrice)}</b></div>
                      </div>
                      <div className="result-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="button button--primary" style={{ flex: 1 }} onClick={() => addBasket(p)}><Plus /> Cesta</button>
                        <button className="button button--outline" title="Ativar alerta de preço e atualização" onClick={() => saveAction("alert", "product", String(p.id))}><Bell size={16} /></button>
                        <button className="button button--outline" title="Compartilhar produto" onClick={() => handleShare(p)}><Share2 size={16} /></button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="no-results">
              <PackageSearch size={48} />
              <h2>Nenhum produto encontrado</h2>
              <p>Tente outros filtros ou limpe sua busca.</p>
              <button className="button button--outline" onClick={() => { setQuery(""); setActiveCategory("all"); setActiveStore("all"); setActiveBrand("all"); }}>Limpar tudo</button>
            </div>
          )}
        </main>
      </div>

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
                  <span className="category-tag">{selectedProduct.category}</span>
                  <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>{selectedProduct.name}</h2>
                  <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>{selectedProduct.brand} • {selectedProduct.size}</p>
                  
                  <div className="visual-price" style={{ marginBottom: '1.5rem' }}>
                    <strong>{money(selectedProduct.minPrice)}</strong>
                    {selectedProduct.previousPrice && selectedProduct.previousPrice > selectedProduct.minPrice && (
                      <span className="old-price">era <s>{money(selectedProduct.previousPrice)}</s></span>
                    )}
                  </div>

                  <div className="verified-details" style={{ background: 'none', padding: 0 }}>
                    <div className="detail-item">
                      <Store size={14} />
                      <span>{selectedProduct.establishment}</span>
                    </div>
                    <div className="detail-item">
                      <Clock3 size={14} />
                      <span>Atualizado em: {new Date(selectedProduct.capturedAt).toLocaleString('pt-BR')}</span>
                    </div>
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
                <button className="button button--primary" style={{ flex: 1 }} onClick={() => { addBasket(selectedProduct); setSelectedProduct(null); }}>
                  Adicionar à Cesta
                </button>
                <button className="button button--outline" onClick={() => { saveAction("alert", "product", String(selectedProduct.id)); setSelectedProduct(null); }}>
                  <Bell size={18} /> Alertar
                </button>
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
  const [user, setUser] = useState<{name: string} | null>(() => {
    const saved = localStorage.getItem("precocerto:user");
    return saved ? JSON.parse(saved) : null;
  });
  const [adminAuth, setAdminAuth] = useState(() => localStorage.getItem("precocerto:admin_authenticated") === "true");
  
  const isAdmin = pathname.startsWith("/admin") && pathname !== "/admin-login"; 
  const isAuth = ["/login","/cadastro","/registrar","/admin-login"].includes(pathname);

  useEffect(()=>{
    let alive=true;
    const q=new URLSearchParams(window.location.search).get("q")??"";
    if(q) setQuery(q);
    fetchCatalog(q).then(data=>{
      if(!alive)return;
      if(data.products.length) setProducts(data.products);
      if(data.stores.length) setStores(data.stores);
      setMetrics(data.metrics);
    }).catch(err=>console.error(err));
    return()=>{alive=false;};
  },[]);

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

  const props = useMemo(()=>({products,stores,metrics,query,setQuery,addBasket,saveAction}),[products,stores,metrics,query]);

  const handleAdminAuth = (success: boolean) => {
    if (success) {
      setAdminAuth(true);
      localStorage.setItem("precocerto:admin_authenticated", "true");
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
    localStorage.removeItem("precocerto:admin_authenticated");
    window.location.href = "/";
  };

  const handleAdminLogout = () => {
    setAdminAuth(false);
    localStorage.removeItem("precocerto:admin_authenticated");
    window.location.href = "/login";
  };

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
