import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronRight,
  HeartPulse,
  MapPin,
  Menu,
  Moon,
  PackageSearch,
  Search,
  ShieldCheck,
  ShoppingBasket,
  ShoppingCart,
  Store,
  Sun,
  Tag,
  X,
} from "lucide-react";
import { buildCatalog, type CatalogPayload, type Product } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { resolveProductImage } from "../data/productImageResolver";
import { suggestProducts } from "../lib/productSearch";
import "./HomePremium.css";

const popularSearches = ["Arroz", "Café", "Leite", "Carne"];
const categories = [
  { name: "Mercados", icon: ShoppingBasket, query: "mercado" },
  { name: "Açougue", icon: Tag, query: "carne" },
  { name: "Farmácias", icon: HeartPulse, href: "/farmacias" },
  { name: "Livros", icon: BookOpen, href: "/dorinha-barroso" },
];

type Theme = "light" | "dark";
const initialCatalog = buildCatalog();
const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const readTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

function bestOffer(product: Product) {
  return [...(product.offers ?? [])]
    .filter((offer) => Number.isFinite(offer.value) && offer.value > 0)
    .sort((a, b) => a.value - b.value)[0] ?? {
      establishmentId: product.establishmentId,
      establishmentSlug: product.establishmentSlug,
      establishment: product.establishment,
      neighborhood: product.neighborhood,
      storeColor: product.storeColor,
      value: product.minPrice,
      capturedAt: product.capturedAt,
    };
}

export function HomePremium() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [catalog, setCatalog] = useState<CatalogPayload>(initialCatalog);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeResult, setActiveResult] = useState(-1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const searchAreaRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    fetchCatalog()
      .then((result) => { if (active) setCatalog(result); })
      .finally(() => { if (active) setCatalogLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const closeSearch = (event: PointerEvent) => {
      if (!searchAreaRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
        setActiveResult(-1);
      }
    };
    document.addEventListener("pointerdown", closeSearch);
    return () => document.removeEventListener("pointerdown", closeSearch);
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedProduct(null);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? [])];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedProduct]);

  const suggestions = useMemo(() => {
    if (query.trim().length < 2) return [];
    return suggestProducts(catalog.products, query, 5).filter((product) => product.minPrice > 0);
  }, [catalog.products, query]);

  const opportunities = useMemo(() => catalog.products
    .filter((product) => product.minPrice > 0)
    .sort((a, b) => (b.maxPrice - b.minPrice) - (a.maxPrice - a.minPrice))
    .slice(0, 6), [catalog.products]);

  const comparisonProduct = opportunities[0] ?? catalog.products[0];
  const comparisonOffers = useMemo(() => comparisonProduct
    ? [...(comparisonProduct.offers ?? [])].filter((offer) => offer.value > 0).sort((a, b) => a.value - b.value).slice(0, 3)
    : [], [comparisonProduct]);

  const search = (term: string) => {
    const normalized = term.trim();
    navigate(normalized ? `/buscar?q=${encodeURIComponent(normalized)}` : "/buscar");
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selected = activeResult >= 0 ? suggestions[activeResult] : undefined;
    if (selected) {
      setSearchOpen(false);
      setSelectedProduct(selected);
      return;
    }
    search(query);
  };

  const handleSearchKeys = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") { setSearchOpen(false); setActiveResult(-1); return; }
    if (!searchOpen || !suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveResult((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveResult((current) => current <= 0 ? suggestions.length - 1 : current - 1);
    } else if (event.key === "Enter" && activeResult >= 0) {
      event.preventDefault();
      setSelectedProduct(suggestions[activeResult]);
      setSearchOpen(false);
    }
  };

  return (
    <div className="pc-home">
      <a className="pc-skip" href="#pc-content">Ir para o conteúdo</a>
      <header className="pc-header">
        <div className="pc-shell pc-header-inner">
          <Link className="pc-logo" to="/" aria-label="PreçoCerto — início">
            <img src="/logo-preco-certo-inversa.svg" alt="PreçoCerto" />
          </Link>
          <nav className="pc-nav" aria-label="Navegação principal">
            <Link to="/buscar">Buscar</Link>
            <Link to="/estabelecimentos">Estabelecimentos</Link>
            <Link to="/farmacias">Farmácias</Link>
            <Link to="/colaborar">Colaborar</Link>
          </nav>
          <div className="pc-header-actions">
            <button className="pc-icon-button" type="button" onClick={() => setTheme((value) => value === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}>
              {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </button>
            <Link className="pc-merchant" to="/lojista">Para comerciantes <ArrowRight aria-hidden="true" /></Link>
            <button className="pc-menu-button" type="button" aria-expanded={menuOpen} aria-controls="pc-mobile-menu" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuOpen((value) => !value)}>
              {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="pc-mobile-menu" className="pc-mobile-menu" aria-label="Navegação mobile">
            <Link to="/buscar" onClick={() => setMenuOpen(false)}>Buscar preços</Link>
            <Link to="/estabelecimentos" onClick={() => setMenuOpen(false)}>Estabelecimentos</Link>
            <Link to="/farmacias" onClick={() => setMenuOpen(false)}>Farmácias</Link>
            <Link to="/colaborar" onClick={() => setMenuOpen(false)}>Colaborar</Link>
            <Link to="/lojista" onClick={() => setMenuOpen(false)}>Para comerciantes</Link>
          </nav>
        )}
      </header>

      <main id="pc-content">
        <section className="pc-hero" aria-labelledby="pc-title">
          <div className="pc-shell pc-hero-inner">
            <div className="pc-hero-copy">
              <span className="pc-kicker"><MapPin aria-hidden="true" /> Feijó · Acre</span>
              <h1 id="pc-title">Pesquise. Compare. <em>Economize.</em></h1>
              <p>Veja preços de produtos em estabelecimentos locais e escolha melhor antes de sair de casa.</p>
              <div className="pc-search-area" ref={searchAreaRef}>
                <form className="pc-search" role="search" onSubmit={submitSearch}>
                  <Search aria-hidden="true" />
                  <label className="sr-only" htmlFor="pc-home-search">Pesquisar produto</label>
                  <input
                    id="pc-home-search"
                    value={query}
                    placeholder="O que você quer comparar hoje?"
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={searchOpen && query.trim().length >= 2}
                    aria-controls="pc-search-results"
                    aria-activedescendant={activeResult >= 0 ? `pc-result-${activeResult}` : undefined}
                    onFocus={() => setSearchOpen(true)}
                    onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); setActiveResult(-1); }}
                    onKeyDown={handleSearchKeys}
                  />
                  <button type="submit">Comparar preços <ArrowRight aria-hidden="true" /></button>
                </form>
                {searchOpen && query.trim().length >= 2 && (
                  <div className="pc-results" id="pc-search-results" role="listbox" aria-label="Sugestões de produtos">
                    {catalogLoading && !suggestions.length ? (
                      <div className="pc-result-state" role="status"><PackageSearch aria-hidden="true" /><span><strong>Buscando produtos…</strong><small>Consultando o catálogo local.</small></span></div>
                    ) : suggestions.length ? suggestions.map((product, index) => {
                      const offer = bestOffer(product);
                      const image = resolveProductImage(product);
                      return (
                        <button id={`pc-result-${index}`} key={String(product.id)} type="button" role="option" aria-selected={activeResult === index} className={`pc-result${activeResult === index ? " is-active" : ""}`} onMouseEnter={() => setActiveResult(index)} onClick={() => { setSelectedProduct(product); setSearchOpen(false); }}>
                          <span className="pc-result-image">{image ? <img src={image} alt="" /> : <PackageSearch aria-hidden="true" />}</span>
                          <span className="pc-result-copy"><strong>{product.name}</strong><small>{[product.brand, product.size].filter(Boolean).join(" · ")}</small><em><Store aria-hidden="true" /> {offer.establishment}</em></span>
                          <span className="pc-result-price"><small>desde</small><strong>{money(product.minPrice)}</strong></span>
                        </button>
                      );
                    }) : (
                      <div className="pc-result-state" role="status"><PackageSearch aria-hidden="true" /><span><strong>Nenhum resultado</strong><small>Tente nome, marca ou categoria.</small></span></div>
                    )}
                  </div>
                )}
              </div>
              <div className="pc-quick" aria-label="Buscas rápidas"><span>Buscas rápidas</span>{popularSearches.map((item) => <button key={item} type="button" onClick={() => search(item)}>{item}</button>)}</div>
            </div>
          </div>
        </section>

        <section className="pc-section pc-shell pc-categories" aria-labelledby="pc-categories-title">
          <div className="pc-heading"><span>Comece por aqui</span><h2 id="pc-categories-title">Categorias essenciais</h2></div>
          <div className="pc-category-row">
            {categories.map(({ name, icon: Icon, href, query: categoryQuery }) => {
              const content = <><Icon aria-hidden="true" /><span>{name}</span><ChevronRight aria-hidden="true" /></>;
              return href ? <Link key={name} className="pc-category" to={href}>{content}</Link> : <button key={name} className="pc-category" type="button" onClick={() => search(categoryQuery ?? name)}>{content}</button>;
            })}
          </div>
        </section>

        <section className="pc-section pc-shell" aria-labelledby="pc-opportunities-title">
          <div className="pc-heading pc-heading-row"><div><span>Melhores oportunidades</span><h2 id="pc-opportunities-title">Compare onde a diferença importa</h2></div><Link to="/buscar">Ver todos <ArrowRight aria-hidden="true" /></Link></div>
          <div className="pc-product-grid">
            {opportunities.map((product) => {
              const offer = bestOffer(product);
              const image = resolveProductImage(product);
              const saving = Math.max(0, product.maxPrice - product.minPrice);
              return (
                <article className="pc-product-card" key={String(product.id)}>
                  <button className="pc-product-open" type="button" onClick={() => setSelectedProduct(product)} aria-label={`Abrir comparação de ${product.name}`}>
                    <span className="pc-product-media">{image ? <img src={image} alt={product.name} loading="lazy" /> : <PackageSearch aria-hidden="true" />}</span>
                    <span className="pc-product-info"><small>{[product.brand, product.size].filter(Boolean).join(" · ")}</small><strong>{product.name}</strong></span>
                  </button>
                  <div className="pc-price-block"><span><small>Menor preço</small><strong>{money(product.minPrice)}</strong></span>{saving > 0 && <em>até {money(saving)} de diferença</em>}</div>
                  <div className="pc-product-store"><Store aria-hidden="true" /><span><strong>{offer.establishment}</strong><small>{offer.neighborhood || "Feijó, AC"}</small></span></div>
                  <button className="pc-compare-button" type="button" onClick={() => setSelectedProduct(product)}>Comparar ofertas <ArrowRight aria-hidden="true" /></button>
                </article>
              );
            })}
          </div>
        </section>

        {comparisonProduct && (
          <section className="pc-compare-section" aria-labelledby="pc-compare-title">
            <div className="pc-shell pc-compare-layout">
              <div className="pc-compare-copy"><span className="pc-kicker"><BadgeCheck aria-hidden="true" /> Comparação prática</span><h2 id="pc-compare-title">O menor preço fica fácil de enxergar.</h2><p>Para <strong>{comparisonProduct.name}</strong>, organizamos as ofertas do menor para o maior preço. Sem tabela pesada e sem informação repetida.</p><button type="button" onClick={() => setSelectedProduct(comparisonProduct)}>Ver comparação completa <ArrowRight aria-hidden="true" /></button></div>
              <div className="pc-offer-stack" aria-label={`Ofertas de ${comparisonProduct.name}`}>
                {(comparisonOffers.length ? comparisonOffers : [bestOffer(comparisonProduct)]).map((offer, index) => (
                  <div className={`pc-offer${index === 0 ? " is-best" : ""}`} key={`${offer.establishmentId}-${offer.value}`}>
                    <span className="pc-offer-rank">{index + 1}</span><span className="pc-store-mark" style={{ backgroundColor: offer.storeColor || "#15385a" }}><Store aria-hidden="true" /></span><span className="pc-offer-name"><strong>{offer.establishment}</strong><small>{offer.neighborhood || "Feijó, AC"}</small></span>{index === 0 && <em>Melhor preço</em>}<b>{money(offer.value)}</b>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="pc-section pc-shell" aria-labelledby="pc-stores-title">
          <div className="pc-heading pc-heading-row"><div><span>Comércio local</span><h2 id="pc-stores-title">Estabelecimentos de Feijó</h2></div><Link to="/estabelecimentos">Ver estabelecimentos <ArrowRight aria-hidden="true" /></Link></div>
          <div className="pc-store-grid">
            {catalog.stores.slice(0, 6).map((store) => (
              <Link className="pc-store-card" key={String(store.id)} to={`/estabelecimento/${store.slug}`}>
                <span className="pc-store-logo" style={{ backgroundColor: store.color }}><Store aria-hidden="true" /></span><span><strong>{store.name}</strong><small><MapPin aria-hidden="true" /> {store.neighborhood || "Feijó, AC"}</small></span>{store.products > 0 && <em>{store.products} produtos</em>}<ChevronRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <section className="pc-section pc-shell pc-basket" aria-labelledby="pc-basket-title">
          <span className="pc-basket-icon"><ShoppingCart aria-hidden="true" /></span><div><span>Cesta inteligente</span><h2 id="pc-basket-title">Planeje vários itens sem perder tempo.</h2><p>Monte sua lista e use a comparação para decidir onde cada item compensa mais.</p></div><Link to="/cesta-basica">Montar minha cesta <ArrowRight aria-hidden="true" /></Link>
        </section>

        <section className="pc-section pc-shell pc-how" aria-labelledby="pc-how-title">
          <div className="pc-heading"><span>Como funciona</span><h2 id="pc-how-title">Da busca à economia em três passos</h2></div>
          <ol><li><span>01</span><div><strong>Pesquise</strong><p>Digite o produto que você precisa.</p></div></li><li><span>02</span><div><strong>Compare</strong><p>Veja preços e estabelecimentos lado a lado.</p></div></li><li><span>03</span><div><strong>Escolha</strong><p>Decida com clareza e economize na compra.</p></div></li></ol>
        </section>

        <section className="pc-merchant-cta" aria-labelledby="pc-merchant-title">
          <div className="pc-shell pc-merchant-layout"><div><span>Para comerciantes</span><h2 id="pc-merchant-title">Seu catálogo pode estar onde seus clientes pesquisam.</h2><p>Apresente sua loja, organize seus produtos e participe da comparação local do PreçoCerto.</p></div><Link to="/lojista">Conhecer área do comerciante <ArrowRight aria-hidden="true" /></Link></div>
        </section>
      </main>

      {selectedProduct && (() => {
        const offers = [...(selectedProduct.offers ?? [])].filter((offer) => offer.value > 0).sort((a, b) => a.value - b.value);
        const image = resolveProductImage(selectedProduct);
        return (
          <div className="pc-modal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedProduct(null); }}>
            <section className="pc-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="pc-dialog-title">
              <button ref={closeRef} className="pc-dialog-close" type="button" onClick={() => setSelectedProduct(null)} aria-label="Fechar"><X aria-hidden="true" /></button>
              <div className="pc-dialog-media">{image ? <img src={image} alt={selectedProduct.name} /> : <PackageSearch aria-hidden="true" />}</div>
              <div className="pc-dialog-content"><span>{selectedProduct.category || "Produto"}</span><h2 id="pc-dialog-title">{selectedProduct.name}</h2><p>{[selectedProduct.brand, selectedProduct.size].filter(Boolean).join(" · ")}</p><div className="pc-dialog-summary"><div><small>Menor</small><strong>{money(selectedProduct.minPrice)}</strong></div><div><small>Média</small><strong>{money(selectedProduct.avgPrice)}</strong></div><div><small>Maior</small><strong>{money(selectedProduct.maxPrice)}</strong></div></div><div className="pc-dialog-offers">{(offers.length ? offers : [bestOffer(selectedProduct)]).slice(0, 5).map((offer, index) => <div key={`${offer.establishmentId}-${offer.value}`} className={index === 0 ? "is-best" : ""}><span className="pc-store-mark" style={{ backgroundColor: offer.storeColor || "#15385a" }}><Store aria-hidden="true" /></span><span><strong>{offer.establishment}</strong><small>{offer.neighborhood || "Feijó, AC"}</small></span>{index === 0 && <em>Mais barato</em>}<b>{money(offer.value)}</b></div>)}</div><div className="pc-dialog-actions"><Link to={`/produto/${selectedProduct.slug || selectedProduct.id}`} onClick={() => setSelectedProduct(null)}>Detalhes do produto</Link><button type="button" onClick={() => search(selectedProduct.name)}>Comparar similares <ArrowRight aria-hidden="true" /></button></div></div>
            </section>
          </div>
        );
      })()}

      <footer className="pc-footer"><div className="pc-shell pc-footer-inner"><div><img src="/logo-preco-certo-inversa.svg" alt="PreçoCerto" /><p>Pesquise, compare e escolha melhor em Feijó.</p></div><nav aria-label="Links do rodapé"><Link to="/buscar">Buscar</Link><Link to="/estabelecimentos">Estabelecimentos</Link><Link to="/colaborar">Colaborar</Link><Link to="/fale-conosco">Fale conosco</Link></nav></div></footer>
    </div>
  );
}
