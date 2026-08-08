
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, Bell, Camera, Check, CheckCircle2,
  ChevronDown, ChevronRight, CircleDollarSign, Clock3, Database, Download,
  Heart, Home, LayoutDashboard, LineChart, ListChecks, MapPin, Menu, PackageSearch,
  Plus, Receipt, Search, Settings, Share2, ShieldCheck, ShoppingBasket,
  SlidersHorizontal, Sparkles, Store, TrendingDown, UserRound, Users, X,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { buildCatalog, verifiedDatasetMetrics, type PlatformMetrics, type Product, type StoreRow } from "./data/catalog";
import { fetchCatalog } from "./data/remoteCatalog";

const initialCatalog = buildCatalog();
const initialProducts: Product[] = initialCatalog.products;

const initialStores: StoreRow[] = initialCatalog.stores;

const adminRouteNames: Record<string, string> = {
  "/admin": "Visão geral", "/admin/gestao": "Licenças e assinaturas", "/admin/acessos-temporarios": "Acessos temporários",
  "/admin/analytics": "Analytics", "/admin/auditoria": "Auditoria geral", "/admin/auditoria-acessos": "Auditoria de acessos",
  "/admin/auditoria-numeros": "Consistência de números", "/admin/cadastro-foto": "Cadastro por foto",
  "/admin/catalogo": "Catálogo de produtos", "/admin/categorizacao": "Categorização inteligente", "/admin/cesta": "Cesta básica",
  "/admin/cesta-auditoria": "Auditoria da cesta", "/admin/clientes": "Contas e clientes", "/admin/cobertura": "Cobertura por loja",
  "/admin/consistencia": "Consistência operacional", "/admin/contas": "Contas e segurança", "/admin/conversoes": "Conversões",
  "/admin/cupom": "Leitura de cupom", "/admin/cupom-lote": "Cupons em lote", "/admin/historico-precos": "Histórico de preços",
  "/admin/ia": "Inteligência artificial", "/admin/icones-categoria": "Ícones de categoria", "/admin/image-jobs": "Fila de imagens",
  "/admin/importacoes": "Importações", "/admin/lote-inserir": "Inserção em lote", "/admin/metricas": "Métricas",
  "/admin/operacao": "Operação", "/admin/preco-rapido": "Preço rápido", "/admin/precos": "Gestão de preços",
  "/admin/promocoes": "Promoções", "/admin/promocoes-codigos": "Códigos promocionais", "/admin/rank-check": "Validação de ranking",
  "/admin/reports": "Denúncias de preço", "/admin/sinonimos": "Sinônimos de busca", "/admin/vitrine": "Vitrine pública", "/admin/webhooks": "Webhooks",
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
  "arroz-tio-joao-5kg": "/products/arroz-tio-joao-5kg.png",
  "cafe-3-coracoes-500g": "/products/cafe-3-coracoes-500g.jpg",
  "leite-italac-1l": "/products/leite-italac-1l.jpg",
  "feijao-kicaldo-1kg": "/products/feijao-kicaldo-1kg.jpg",
  "oleo-soja-liza-900ml": "/products/oleo-liza-900ml.jpg",
  "acucar-uniao-1kg": "/products/acucar-uniao-1kg.jpg",
};

function ProductImage({ product, size = "default", eager = false }: { product: Product; size?: "compact" | "default" | "hero" | "basket"; eager?: boolean }) {
  return <span className={`product-photo product-photo--${size}`}><img src={productImages[product.slug] ?? "/products/arroz-tio-joao-5kg.png"} alt={`Embalagem de ${product.name}`} loading={eager ? "eager" : "lazy"} /><i aria-hidden="true" /></span>;
}

function Brand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return <a className={`brand ${inverse ? "brand--inverse" : ""} ${compact ? "brand--compact" : ""}`} href="/" aria-label="PreçoCerto — página inicial">
    <img className={`brand__logo ${compact ? "brand__logo--compact" : ""}`} src={compact ? "/logo-precocerto-emblema.png" : "/logo-precocerto-wordmark.png"} alt="PreçoCerto" width={1152} height={576} />
  </a>;
}

function Header({ basketCount }: { basketCount: number }) {
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <div className="shell header-inner">
      <Brand />
      <span className="header-location"><MapPin size={14} /> Feijó, AC</span>
      <nav className="desktop-nav" aria-label="Navegação principal">
        <a href="/buscar">Comparar preços</a><a href="/cesta-basica">Cesta inteligente</a><a href="/estabelecimentos">Estabelecimentos</a><a href="/melhores-precos">Ofertas</a><a href="/planos">Planos</a>
      </nav>
      <div className="header-actions">
        <a className="icon-button" href="/buscar" aria-label="Buscar"><Search size={20} /></a>
        <a className="icon-button basket-button" href="/cesta" aria-label={`Cesta com ${basketCount} itens`}><ShoppingBasket size={20} />{basketCount > 0 && <span>{basketCount}</span>}</a>
        <a className="text-link" href="/login">Entrar</a>
        <a className="button button--primary button--small" href="/cadastro">Começar grátis <ArrowRight size={16} /></a>
      </div>
      <button className="mobile-menu-button" onClick={() => setOpen(true)} aria-label="Abrir menu" aria-expanded={open}><Menu /></button>
    </div>
    {open && <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Menu principal"><button className="drawer-backdrop" aria-label="Fechar menu" onClick={() => setOpen(false)} /><div className="drawer-panel"><div className="drawer-head"><Brand /><button className="icon-button" onClick={() => setOpen(false)} aria-label="Fechar menu"><X /></button></div><nav><a href="/buscar">Comparar preços</a><a href="/cesta-basica">Cesta inteligente</a><a href="/estabelecimentos">Estabelecimentos</a><a href="/melhores-precos">Ofertas de hoje</a><a href="/planos">Planos</a><a href="/colaborar">Enviar nota fiscal</a><a href="/admin" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #eee', color: '#888', fontSize: '0.9rem' }}>Área Administrativa</a></nav><a className="button button--primary" href="/cadastro">Criar conta gratuita</a><a className="button button--ghost" href="/login">Já tenho uma conta</a></div></div>}
  </header>;
}

function Footer() {
  return <footer className="site-footer"><div className="shell footer-grid"><div><Brand inverse /><p>Compare preços reais no comércio de Feijó e transforme cada compra em economia.</p><span className="footer-place"><MapPin size={15} /> Feijó • Acre • Brasil</span></div><div><h3>Descobrir</h3><a href="/buscar">Comparar preços</a><a href="/cesta-basica">Cesta inteligente</a><a href="/estabelecimentos">Estabelecimentos</a><a href="/farmacias">Farmácias de plantão</a></div><div><h3>PreçoCerto</h3><a href="/#como-funciona">Como funciona</a><a href="/lojista">Para empresas</a><a href="/colaborar">Colaborar</a><a href="/fale-conosco">Fale conosco</a></div><div><h3>Conta</h3><a href="/login">Entrar</a><a href="/cadastro">Criar conta</a><a href="/planos">Planos</a><a href="/admin">Área Administrativa</a></div></div><div className="shell footer-bottom"><span>SKAES NET TECHNOLOGY • FRANC D’NIS</span><span>© 2026 PreçoCerto. Todos os direitos reservados.</span></div></footer>;
}

function MobileBar({ basketCount }: { basketCount: number }) {
  return <nav className="mobile-bar" aria-label="Navegação móvel"><a href="/"><Home /><span>Início</span></a><a href="/buscar"><Search /><span>Buscar</span></a><a href="/lista"><ListChecks /><span>Lista</span></a><a href="/cesta" className="mobile-basket"><ShoppingBasket />{basketCount > 0 && <b>{basketCount}</b>}<span>Cesta</span></a><a href="/app"><UserRound /><span>Painel</span></a></nav>;
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

function HomePage({ products, stores, metrics, query, setQuery, addBasket, saveAction }: PageProps) {
  const [priceMode, setPriceMode] = useState<"recent" | "lowest">("recent");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const rows = [...products].sort((a,b) => priceMode === "lowest" ? a.minPrice - b.minPrice : Date.parse(b.capturedAt) - Date.parse(a.capturedAt)).slice(0, 6);
  const featured = products[featuredIndex] ?? products[0];
  return <>
    <section className="hero">
      <div className="hero-photo" /><div className="hero-wash" />
      <div className="shell hero-content">
        <div className="hero-copy">
          <span className="hero-live"><i /> Inteligência de compra em tempo real</span>
          <span className="eyebrow eyebrow--light"><MapPin size={14} /> Curadoria local • Feijó • Acre</span>
          <h1>Compre melhor.<br/><span>Gaste menos.</span></h1>
          <p>Uma leitura precisa do comércio local para você encontrar a melhor combinação de preço, loja e conveniência.</p>
          <SearchBox value={query} setValue={setQuery} products={products} hero />
          <div className="hero-trust"><span><CheckCircle2 /> Preços verificados</span><span><Clock3 /> Atualização contínua</span><span><ShieldCheck /> Dados protegidos</span></div>
        </div>
        <aside className="hero-radar hero-commerce" aria-label="Comparação interativa em destaque">
          <div className="radar-head"><span><Activity /> Comparação inteligente</span><em>ao vivo</em></div>
          {featured && <><div className="commerce-product"><ProductImage product={featured} size="hero" eager /><div className="commerce-copy"><span>{featured.category} • {featured.size}</span><h2>{featured.name}</h2><small><ShieldCheck /> preço verificado há 8 min</small></div></div><div className="commerce-prices"><div><small>Melhor preço</small><strong>{money(featured.minPrice)}</strong><span>em {featured.establishment}</span></div><div className="commerce-chart"><svg viewBox="0 0 250 72" role="img" aria-label="Tendência de preço em queda"><defs><linearGradient id="priceArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#54d69a" stopOpacity=".42"/><stop offset="1" stopColor="#54d69a" stopOpacity="0"/></linearGradient></defs><path d="M4 14 C28 18 35 30 58 27 S92 18 112 35 S146 50 168 41 S202 28 246 55 L246 70 L4 70 Z" fill="url(#priceArea)"/><path d="M4 14 C28 18 35 30 58 27 S92 18 112 35 S146 50 168 41 S202 28 246 55" fill="none" stroke="#65dfa8" strokeWidth="3" strokeLinecap="round"/><circle cx="246" cy="55" r="5" fill="#65dfa8" stroke="#08243a" strokeWidth="3"/></svg><span><TrendingDown /> caiu {money(Math.max(0,(featured.previousPrice ?? featured.maxPrice)-featured.minPrice))}</span></div></div><div className="commerce-actions"><button className="button button--gold" onClick={()=>addBasket(featured)}><Plus /> Adicionar à cesta</button><a href={`/produto/${featured.slug}`}>Ver comparação <ArrowRight /></a></div></>}
          <div className="commerce-thumbs">{products.slice(0,4).map((product,index)=><button className={featuredIndex===index?"active":""} onClick={()=>setFeaturedIndex(index)} aria-pressed={featuredIndex===index} aria-label={`Destacar ${product.name}`} key={product.id}><ProductImage product={product} size="compact" /><span>{product.brand}<small>{money(product.minPrice)}</small></span></button>)}</div>
        </aside>
      </div>
    </section>
    <div className="shell metrics-float" aria-label="Métricas da plataforma"><div><span className="metric-icon"><Store /></span><strong>{count(metrics.stores)}</strong><span>estabelecimentos cadastrados</span></div><div><span className="metric-icon"><PackageSearch /></span><strong>{count(metrics.products)}</strong><span>itens cadastrados</span></div><div><span className="metric-icon"><Activity /></span><strong>{count(metrics.prices)}</strong><span>preços registrados</span></div><small><span /> Base consolidada até 7 de agosto de 2026</small></div>
    <nav className="shell category-rail" aria-label="Atalhos de compra"><span>Explore por intenção</span><a href="/categoria/mercearia"><PackageSearch /> Mercearia <ArrowRight /></a><a href="/categoria/acougue"><TrendingDown /> Ofertas do dia <ArrowRight /></a><a href="/cesta-basica"><ShoppingBasket /> Cesta essencial <ArrowRight /></a><a href="/estabelecimentos"><Store /> Mercados locais <ArrowRight /></a></nav>
    <section className="section shell featured-products"><div className="section-heading"><div><span className="eyebrow">Mais buscados em Feijó</span><h2>Produtos que valem comparar</h2><p>Embalagens reais, histórico recente e o melhor preço disponível agora.</p></div><a className="inline-link" href="/buscar">Explorar catálogo <ArrowRight /></a></div><div className="visual-product-grid">{products.slice(0,6).map((p,index)=><article className="visual-product-card" key={p.id}><button className="floating-favorite" onClick={()=>saveAction("favorite","product",String(p.id))} aria-label={`Favoritar ${p.name}`}><Heart /></button><a className="visual-product-image" href={`/produto/${p.slug}`}><span className="position-number">0{index+1}</span><ProductImage product={p} /><span className="verified-chip"><ShieldCheck /> Verificado</span></a><div className="visual-product-content"><span className="category-tag">{p.category} • {p.size}</span><a className="visual-product-name" href={`/produto/${p.slug}`}>{p.name}</a><div className="visual-store"><span className="market-dot" style={{background:p.storeColor}}/><span>{p.establishment}<small><MapPin /> {p.neighborhood}</small></span></div><div className="visual-price"><span><small>a partir de</small><strong>{money(p.minPrice)}</strong></span><span><small>média local</small><b>{money(p.avgPrice)}</b></span></div><div className="mini-trend"><svg viewBox="0 0 180 34" aria-hidden="true"><path d={`M2 ${9+index%3*3} C24 ${7+index}, 31 ${22-index}, 54 18 S86 ${8+index}, 108 20 S145 ${27-index},178 ${13+index}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="178" cy={13+index} r="3" fill="currentColor"/></svg><span><TrendingDown /> {Math.max(3,Math.round((1-p.minPrice/p.maxPrice)*100))}% abaixo do maior</span></div><div className="visual-product-actions"><button className="button button--primary" onClick={()=>addBasket(p)}><Plus /> Cesta</button><a href={`/produto/${p.slug}`}>Comparar <ArrowRight /></a></div></div></article>)}</div></section>
    <section className="section shell"><div className="section-heading"><div><span className="eyebrow">Economia pronta para você</span><h2>Cestas otimizadas</h2><p>Combinações que aproveitam o melhor preço de cada mercado de Feijó.</p></div><a className="inline-link" href="/cesta-basica">Ver todas as cestas <ArrowRight /></a></div><div className="basket-grid"><article className="basket-feature"><div className="basket-top"><span className="basket-icon"><ShoppingBasket /></span><PriceBadge product={products[0]} /></div><p>Cesta essencial da semana</p><h3>12 itens em 2 mercados</h3><div className="basket-total"><span>Valor otimizado</span><strong>{money(87.34)}</strong><small>economia estimada de {money(18.62)}</small></div><div className="store-route"><span><b style={{background: stores[0]?.color}}>CS</b> Central Super · 8 itens</span><span><b style={{background: stores[1]?.color}}>MR</b> Rebouças · 4 itens</span></div><a href="/cesta-basica" className="button button--dark">Abrir cesta otimizada <ArrowRight /></a></article><article className="basket-plan"><span className="eyebrow">Planejamento inteligente</span><h3>Quanto você quer gastar?</h3><p>Informe seu orçamento e montamos a melhor cesta possível, explicando cada escolha.</p><div className="budget-chips"><a href="/cesta-basica?orcamento=80">R$ 80</a><a href="/cesta-basica?orcamento=100">R$ 100</a><a href="/cesta-basica?orcamento=150">R$ 150</a><a href="/cesta-basica?orcamento=200">R$ 200</a></div><a href="/cesta-basica" className="inline-link">Montar minha cesta <ArrowRight /></a></article></div></section>
    <section className="section section--soft"><div className="shell"><div className="section-heading"><div><span className="eyebrow">Agora em Feijó</span><h2>Preços em tempo real</h2><p>Compare registros recentes e encontre o menor preço com transparência.</p></div><div className="segmented"><button className={priceMode === "recent" ? "active" : ""} onClick={() => setPriceMode("recent")}>Recentes</button><button className={priceMode === "lowest" ? "active" : ""} onClick={() => setPriceMode("lowest")}>Menor preço</button></div></div><div className="price-table-card"><div className="price-table-head"><span>Produto</span><span>Mercado</span><span>Preço</span><span>Atualizado</span><span>Ação</span></div>{rows.map((p, index) => <div className="price-row" key={p.id}><div className="product-cell"><ProductImage product={p} size="compact" /><span><a href={`/produto/${p.slug}`}>{p.name}</a><small>{p.brand} • {p.size}</small></span></div><div className="market-cell"><span className="market-dot" style={{background:p.storeColor}} /> <span>{p.establishment}<small>{p.neighborhood}</small></span></div><div><strong className="green-price">{money(p.minPrice)}</strong>{index < 3 && <PriceBadge product={p} />}</div><div><span className="freshness"><Clock3 /> há {8 + index * 7} min</span></div><div className="row-actions"><button onClick={() => saveAction("favorite", "product", String(p.id))} aria-label={`Favoritar ${p.name}`}><Heart /></button><button onClick={() => addBasket(p)} aria-label={`Adicionar ${p.name} à cesta`}><Plus /></button></div></div>)}<div className="table-footer"><a href="/buscar">Abrir catálogo completo <ArrowRight /></a><span><ShieldCheck /> Dados auditáveis e verificados</span></div></div></div></section>
    <section className="section shell"><div className="section-heading"><div><span className="eyebrow">Rede local</span><h2>Estabelecimentos monitorados</h2><p>Preço e disponibilidade perto de você, bairro por bairro.</p></div><a className="inline-link" href="/estabelecimentos">Ver diretório <ArrowRight /></a></div><div className="store-grid">{stores.map(store => <a className="store-card" href={`/estabelecimento/${store.slug}`} key={store.id}><span className="store-logo" style={{background:store.color}}>{store.name.split(" ").map(v=>v[0]).join("").slice(0,2)}</span><span><strong>{store.name}</strong><small><MapPin /> {store.neighborhood}</small></span><ChevronRight /></a>)}</div></section>
    <section className="section shell" id="como-funciona"><div className="benefit-grid"><article><span><ShieldCheck /></span><h3>Preços verificados</h3><p>Cada registro mostra mercado, horário e origem para você comprar com confiança.</p><a href="/precos">Entenda os dados <ArrowRight /></a></article><article><span><LineChart /></span><h3>Histórico de preços</h3><p>Veja a tendência e descubra se a promoção de hoje é realmente uma boa escolha.</p><a href="/tendencias">Ver tendências <ArrowRight /></a></article><article><span><ShoppingBasket /></span><h3>Cesta inteligente</h3><p>Compare uma loja só com a melhor combinação de mercados para toda a lista.</p><a href="/cesta-basica">Otimizar cesta <ArrowRight /></a></article></div></section>
    <section className="shell final-cta"><div><span className="eyebrow eyebrow--gold">Economia inteligente todos os dias</span><h2>Antes de comprar,<br/>compare com o PreçoCerto.</h2><p>Crie sua conta gratuita, salve listas e receba alertas quando o preço baixar.</p><a className="button button--gold" href="/cadastro">Criar minha conta gratuita <ArrowRight /></a></div><div className="cta-stat"><span>Economia potencial</span><strong>R$ 186,40</strong><small>média mensal em uma cesta familiar</small><div><TrendingDown /> −14,8% no custo estimado</div></div></section>
    <section className="section shell professional"><div className="section-heading"><div><span className="eyebrow">Para o comércio local</span><h2>Painel de inteligência de mercado</h2><p>Acompanhe cobertura, competitividade e oportunidades sem perder o contexto local.</p></div><a href="/lojista" className="button button--outline">Conhecer painel lojista</a></div><div className="dashboard-preview"><div className="preview-sidebar"><Brand compact /><span className="active"><LayoutDashboard />Visão geral</span><span><Store />Lojas</span><span><PackageSearch />Produtos</span><span><LineChart />Tendências</span><span><Settings />Configurações</span></div><div className="preview-main"><div className="preview-title"><div><small>Monitoramento</small><h3>Estabelecimentos</h3></div><button><Plus /> Adicionar loja</button></div><div className="mini-kpis"><span><small>Lojas ativas</small><b>{stores.length}</b></span><span><small>Produtos cobertos</small><b>82%</b></span><span><small>Atualizações hoje</small><b>214</b></span></div>{stores.slice(0,3).map((s,i)=><div className="sync-row" key={s.id}><span className="store-logo small" style={{background:s.color}}>{s.name.slice(0,2)}</span><span><b>{s.name}</b><small>Última sincronização há {i*9+4} min</small></span><em>Ativo</em><span className="insight">{i===0 ? "12 preços líderes" : i===1 ? "Cobertura em alta" : "3 itens para revisar"}</span><button aria-label={`Abrir ${s.name}`}><ChevronRight /></button></div>)}</div></div></section>
  </>;
}

type PageProps = { products: Product[]; stores: StoreRow[]; metrics: PlatformMetrics; query: string; setQuery: (q:string)=>void; addBasket: (p:Product)=>void; saveAction: (action:string, type:string, id:string)=>void };

function SearchPage({ products, query, setQuery, addBasket, saveAction }: PageProps) {
  const filtered = products.filter(p => !query || `${p.name} ${p.category} ${p.brand}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
  const primary = filtered[0] ?? products[0];
  return <div className="shell page-shell search-page"><aside className="filter-sidebar"><div className="filter-title"><SlidersHorizontal /><strong>Filtros</strong><button>Limpar</button></div><label>Marca<select><option>Todas as marcas</option><option>Tio João</option><option>Italac</option></select></label><label>Mercado<select><option>Todos os mercados</option><option>Central Super</option><option>Mercado Rebouças</option></select></label><label>Distância<select><option>Até 5 km</option><option>Até 2 km</option><option>Todo Feijó</option></select></label><label>Faixa de preço<div className="range"><input type="number" min="0" defaultValue="0" aria-label="Preço mínimo"/><span>—</span><input type="number" min="0" defaultValue="50" aria-label="Preço máximo"/></div></label><label className="check-line"><input type="checkbox" defaultChecked/> Somente preços verificados</label><hr/><h3>Buscas populares</h3><div className="chip-list">{["arroz","café","leite","carne","feijão","óleo"].map(v=><button key={v} onClick={()=>setQuery(v)}>{v}</button>)}</div><hr/><h3>Atalhos de açougue</h3><a href="/categoria/acougue">Carne bovina <ChevronRight/></a><a href="/categoria/acougue">Frango <ChevronRight/></a><a href="/categoria/acougue">Suínos <ChevronRight/></a></aside><main className="search-main"><div className="page-search-sticky"><SearchBox value={query} setValue={setQuery} products={products}/><button className="filter-mobile"><SlidersHorizontal/> Filtros</button></div>{primary ? <><section className="result-hero"><div><span className="eyebrow"><ShieldCheck/> Dados verificados hoje</span><h1>{query ? `Resultados para “${query}”` : "O que você procura hoje?"}</h1><p>{filtered.length} produtos compatíveis • menor preço encontrado no {primary.establishment}</p><div className="result-actions"><button onClick={()=>saveAction("favorite","search",query || "todos")}><Heart/> Favoritar busca</button><button onClick={()=>saveAction("alert","search",query || "todos")}><Bell/> Criar alerta</button><button onClick={()=>navigator.clipboard?.writeText(window.location.href)}><Share2/> Compartilhar</button></div></div><span className="best-choice"><Sparkles/> Melhor escolha hoje</span></section><div className="analytics-grid"><article><span>Menor preço</span><strong>{money(primary.minPrice)}</strong><small>no {primary.establishment}</small></article><article><span>Média local</span><strong>{money(primary.avgPrice)}</strong><small>{primary.storeCount} mercados comparados</small></article><article><span>Economia</span><strong>{Math.round((1-primary.minPrice/primary.maxPrice)*100)}%</strong><small>{money(primary.maxPrice-primary.minPrice)} por unidade</small></article><article className="history-card"><span>Histórico · 30 dias</span><div className="bars" aria-label="Histórico visual de preço">{[42,55,49,65,61,52,45,39,35,29,32,24].map((h,i)=><i style={{height:`${h}%`}} key={i}/>)}</div><small><TrendingDown/> tendência de queda</small></article></div><div className="results-head"><div><h2>Melhores ofertas</h2><p>Embalagens compatíveis, ordenadas pelo menor preço.</p></div><span>{filtered.length} resultados</span></div><div className="result-list">{filtered.map((p,index)=><article className="result-card" key={p.id}><div className="rank">{index+1}</div><div className="product-visual">{p.category.slice(0,1)}</div><div className="result-info"><span className="category-tag">{p.category}</span><a href={`/produto/${p.slug}`}>{p.name}</a><small>{p.brand} • {p.size} • cód. {p.barcode ?? "não informado"}</small><div><span className="verified"><ShieldCheck/> Verificado</span><span>{p.storeCount} mercados</span></div></div><div className="result-market"><span className="store-logo small" style={{background:p.storeColor}}>{p.establishment.split(" ").map(v=>v[0]).join("").slice(0,2)}</span><span><b>{p.establishment}</b><small><MapPin/> {p.neighborhood}</small></span></div><div className="result-price"><small>menor preço</small><strong>{money(p.minPrice)}</strong><PriceBadge product={p}/></div><div className="result-card-actions"><button onClick={()=>saveAction("favorite","product",String(p.id))} aria-label={`Favoritar ${p.name}`}><Heart/></button><button className="button button--primary" onClick={()=>addBasket(p)}><Plus/> Adicionar</button></div></article>)}</div></> : <div className="empty-state"><PackageSearch/><h1>Nenhum resultado para “{query}”</h1><p>Tente buscar por arroz, café, leite ou uma categoria.</p><button className="button button--primary" onClick={()=>setQuery("")}>Ver todos os produtos</button></div>}</main></div>;
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

function AdminPage({ path, onLogout }: { path: string; onLogout: () => void }) {
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

  
  // Filtros de Auditoria
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

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
  return <div className="admin-shell"><aside className="admin-sidebar"><Brand inverse/><nav><span>Operação</span><a href="/admin" className={path==="/admin"?"active":""}><LayoutDashboard/> Visão geral</a><a href="/admin/clientes"><Users/> Clientes</a><a href="/admin/catalogo"><PackageSearch/> Catálogo</a><a href="/admin/precos"><CircleDollarSign/> Preços</a><a href="/admin/importacoes" className={path==="/admin/importacoes"?"active":""}><Database/> Importações</a><span>Inteligência</span><a href="/admin/analytics"><BarChart3/> Analytics</a><a href="/admin/ia"><Sparkles/> IA e cotas</a><a href="/admin/webhooks"><Activity/> Webhooks</a><a href="/admin/auditoria"><ShieldCheck/> Auditoria</a></nav><a className="admin-back" href="/" style={{ marginBottom: '1rem' }}><ArrowRight/> Voltar ao site</a><button className="button button--ghost button--small" onClick={handleLogoutRequest} style={{ color: '#fca5a5', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start', paddingLeft: '1rem' }}><X size={16}/> Deslogar Admin</button></aside><main className="admin-main"><header><div><small>Admin / Operação</small><h1>{title}</h1></div><div>{importMsg && <span className="admin-import-badge" style={{fontSize:"0.75rem",background:"#fef3c7",color:"#92400e",padding:"0.25rem 0.75rem",borderRadius:"1rem",marginRight:"1rem"}}>{importMsg}</span>}<button className="icon-button"><Bell/></button><span className="admin-user">FD</span></div></header>

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
    <article onClick={() => window.location.href = '#admin-auditoria'} style={{ cursor: 'pointer' }}><span>Pendências <AlertTriangle/></span><strong>17</strong><small className="warning">5 com prioridade alta</small></article>
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
      <div><h2>Monitoramento operacional</h2><p>Dados mais recentes do catálogo local.</p></div>
      <div style={{display:"flex",gap:"0.75rem"}}>
        <button className="button button--outline" onClick={handleImport} disabled={isImporting} title="Disparar importação para o Supabase externo">
          <Database/> {isImporting ? "Importando..." : "Importar 2.838 Preços"}

        </button>
        <button className="button button--outline"><Download/> Exportar</button>
        <button className="button button--primary" onClick={() => setShowAddProduct(true)}><Plus/> Novo produto</button>
        <button className="button button--primary" onClick={() => setShowAddStore(true)} style={{ background: '#10b981' }}><Store/> Nova Loja</button>

      </div>
    </div>
    <div className="admin-filters"><label><Search/><input placeholder="Buscar produto, loja ou código"/></label><button><SlidersHorizontal/> Filtros</button><button><Clock3/> Últimas 24h</button></div>
    <div className="admin-table">
      <div className="admin-tr admin-th"><span>Produto</span><span>Estabelecimento</span><span>Preço</span><span>Status</span><span>Atualizado</span><span /></div>
      {rows.map((r,i)=><div className="admin-tr" key={r[0]}><span><b>{r[0]}</b><small>PC-{1200+i}</small></span><span>{r[1]}</span><span><b>{r[2]}</b></span><span><em className={r[3]==="Verificado"?"ok":"review"}>{r[3]}</em></span><span>há {i*11+4} min</span><span><button aria-label="Abrir registro"><ChevronRight/></button></span></div>)}
    </div>
    <div className="admin-card-foot"><span>Mostrando 4 de 1.247 registros</span><div><button disabled>Anterior</button><button>Próxima</button></div></div>
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
        const { supabase } = await import("./lib/supabase");
        if (!supabase) return;
        const { error } = await supabase.from('establishments').insert({
          name: fd.get('name'),
          neighborhood: fd.get('neighborhood'),
          brand_color: fd.get('color'),
          kind: 'market'
        });
        if (error) alert(error.message);
        else {
          addAuditLog(`Novo estabelecimento cadastrado: ${fd.get('name')}`);
          setShowAddStore(false);
          loadLogs();
        }
      }}>
        <div className="admin-modal-head">
          <h3>Cadastrar Novo Estabelecimento</h3>
          <button type="button" className="icon-button" onClick={() => setShowAddStore(false)}><X/></button>
        </div>
        <div className="admin-modal-body" style={{ display: 'grid', gap: '0.5rem' }}>
          <label>Nome do Estabelecimento <input name="name" required placeholder="Ex: Mercado do Povo" /></label>
          <label>Bairro <input name="neighborhood" required placeholder="Ex: Centro" /></label>
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
        const { supabase } = await import("./lib/supabase");
        if (!supabase) return;
        const { error } = await supabase.from('products').insert({
          name: fd.get('name'),
          brand: fd.get('brand'),
          category: fd.get('category'),
          size: fd.get('size'),
          barcode: fd.get('barcode')
        });
        if (error) alert(error.message);
        else {
          addAuditLog(`Novo produto cadastrado: ${fd.get('name')}`);
          setShowAddProduct(false);
          loadLogs();
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
            <input type="file" accept="image/*" style={{ opacity: 0, position: 'absolute', width: '100px', cursor: 'pointer' }} onChange={() => alert('Simulação: Upload de imagem processado com sucesso.')} />
          </div>
          <label>Nome do Produto <input name="name" required placeholder="Ex: Arroz 5kg" /></label>
          <label>Marca <input name="brand" required placeholder="Ex: Tio João" /></label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label>Categoria <input name="category" placeholder="Ex: Mercearia" /></label>
            <label>Tamanho <input name="size" placeholder="Ex: 5kg" /></label>
          </div>
          <label>Código de Barras <input name="barcode" placeholder="Opcional" /></label>
          <button type="submit" className="button button--primary" style={{ marginTop: '1rem' }}>Salvar Produto</button>
        </div>
      </form>
    </div>
  )}
</main></div>;

}

function GenericPage({ path, products, stores, addBasket, saveAction }: PageProps & { path:string }) {
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
    "/alertas":["O preço caiu, você fica sabendo","Alertas de preço",<Bell key="i"/>],
    "/lista":["Compra organizada","Minhas listas",<ListChecks key="i"/>],
    "/app":["Seu resumo dos últimos 90 dias","Painel de economia",<LayoutDashboard key="i"/>],
  };
  const defaultInfo:[string,string,ReactNode] = ["PreçoCerto em Feijó","Economia inteligente para sua próxima compra",<Sparkles key="i"/>];
  const info = isStore ? ["Estabelecimento verificado", stores[0]?.name ?? "Comércio local", <Store key="s"/>] as [string,string,ReactNode] : isProduct ? ["Produto monitorado", products[0]?.name ?? "Produto local", <PackageSearch key="p"/>] as [string,string,ReactNode] : (routeInfo[path] ?? defaultInfo);
  return <div className="shell page-shell generic-page"><section className="generic-hero"><span className="generic-icon">{info[2]}</span><div><span className="eyebrow">{info[0]}</span><h1>{info[1]}</h1><p>Informação clara, preços comparáveis e decisões melhores para quem compra e vende em Feijó.</p></div><a className="button button--primary" href="/buscar">Comparar agora <ArrowRight/></a></section><div className="generic-grid"><section className="generic-main"><div className="section-heading compact"><div><h2>{isStore?"Ofertas em destaque":isProduct?"Onde está mais barato":"Destaques de hoje"}</h2><p>Registros compatíveis e verificados recentemente.</p></div></div>{products.slice(0,4).map(p=><article className="compact-product" key={p.id}><span className="product-visual">{p.category.slice(0,1)}</span><div><a href={`/produto/${p.slug}`}>{p.name}</a><small>{p.brand} • {p.size} • {p.establishment}</small><span><ShieldCheck/> Verificado há poucos minutos</span></div><strong>{money(p.minPrice)}</strong><button onClick={()=>saveAction("favorite","product",String(p.id))} aria-label="Favoritar"><Heart/></button><button className="button button--primary" onClick={()=>addBasket(p)}><Plus/> Cesta</button></article>)}</section><aside className="generic-aside"><span className="eyebrow">Visão local</span><h2>Feijó economiza junto</h2><div className="aside-stat"><span>Produtos acompanhados</span><strong>1.247</strong></div><div className="aside-stat"><span>Atualizações hoje</span><strong>214</strong></div><div className="aside-stat"><span>Economia potencial</span><strong>14,8%</strong></div><a href="/cesta-basica" className="button button--dark button--full">Montar cesta inteligente</a></aside></div></div>;
}

function AuthPage({ path, onAdminAuth }: { path: string; onAdminAuth: (success: boolean) => void }) {
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
      window.location.href = "/app";
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


export default function PrecoCertoApp() {
  const pathname = useLocation().pathname || "/";
  const [products,setProducts]=useState<Product[]>(initialProducts); const [stores,setStores]=useState<StoreRow[]>(initialStores); const [metrics,setMetrics]=useState<PlatformMetrics>(verifiedDatasetMetrics); const [query,setQuery]=useState(""); const [cart,setCart]=useState<Product[]>([]); const [toast,setToast]=useState("");
  const [adminAuth, setAdminAuth] = useState(() => localStorage.getItem("precocerto:admin_authenticated") === "true");
  const isAdmin = pathname.startsWith("/admin") && pathname !== "/admin-login"; 
  const isAuth = ["/login","/cadastro","/registrar","/admin-login"].includes(pathname);
  useEffect(()=>{ let alive=true; const q=new URLSearchParams(window.location.search).get("q")??""; if(q) setQuery(q);
    // Fonte primária: Supabase do usuário. Fallback automático para o catálogo local.
    fetchCatalog(q).then(data=>{ if(!alive)return; if(data.products.length)setProducts(data.products); if(data.stores.length)setStores(data.stores); setMetrics(data.metrics); if(data.source==="local"&&data.error) console.warn("[PreçoCerto] catálogo local em uso:",data.error); }).catch(err=>console.error("[PreçoCerto] falha ao carregar catálogo:",err));
    return()=>{alive=false;}; },[]);
  useEffect(()=>{ if(!toast)return; const t=setTimeout(()=>setToast(""),2800); return()=>clearTimeout(t); },[toast]);
  function addBasket(p:Product){setCart(current=>current.some(i=>i.id===p.id)?current:[...current,p]);setToast(`${p.name} foi adicionado à cesta.`);}
  function removeBasket(id:number){setCart(current=>current.filter(i=>i.id!==id));setToast("Item removido da cesta.");}
  function saveAction(action:string,entityType:string,entityId:string){setToast(action==="alert"?"Alerta ativado com sucesso.":"Salvo nos seus favoritos.");try{const key="precocerto:actions";const saved=JSON.parse(localStorage.getItem(key)??"[]") as unknown[];localStorage.setItem(key,JSON.stringify([...saved,{action,entityType,entityId,at:new Date().toISOString()}].slice(-200)));}catch{setToast("A ação ficou salva nesta sessão.");}}
  const props = useMemo(()=>({products,stores,metrics,query,setQuery,addBasket,saveAction}),[products,stores,metrics,query]);
  const handleAdminAuth = (success: boolean) => {
    if (success) {
      setAdminAuth(true);
      localStorage.setItem("precocerto:admin_authenticated", "true");
      addAuditLog("Login administrativo realizado");
    }
  };


  const handleAdminLogout = () => {
    setAdminAuth(false);
    localStorage.removeItem("precocerto:admin_authenticated");
  };

  // Redirecionamento forçado se tentar acessar admin sem estar logado
  if (isAdmin && !adminAuth) {
    window.location.href = "/admin-login";
    return null;
  }

  if(isAdmin) return <><AdminPage path={pathname} onLogout={handleAdminLogout}/>{toast&&<div className="toast"><CheckCircle2/>{toast}</div>}</>;
  if(isAuth) return <AuthPage path={pathname} onAdminAuth={handleAdminAuth}/>;

  let page:ReactNode;
  if(pathname==="/oi") page=<div style={{padding:"4rem",textAlign:"center",fontSize:"2rem",fontFamily:"sans-serif"}}>oi</div>;
  else if(pathname==="/") page=<HomePage {...props}/>;
  else if(pathname==="/buscar") page=<SearchPage {...props}/>;
  else if(pathname==="/cesta-basica"||pathname==="/cesta") page=<BasketPage {...props} cart={cart} removeBasket={removeBasket}/>;
  else if(pathname==="/planos"||pathname.startsWith("/checkout/")) page=<PlansPage/>;
  else page=<GenericPage {...props} path={pathname}/>;
  return <div className="app"><Header basketCount={cart.length}/><div className="market-pulse"><div className="shell"><span><i /> Rede PreçoCerto operacional</span><span>Feijó, Acre</span><span>Última leitura: agora</span><a href="/colaborar">Contribua com um preço <ArrowRight /></a></div></div><main>{page}</main><Footer/><MobileBar basketCount={cart.length}/>{toast&&<div className="toast" role="status" aria-live="polite"><CheckCircle2/>{toast}</div>}</div>;
}
