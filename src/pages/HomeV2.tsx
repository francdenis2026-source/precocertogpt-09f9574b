import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
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
import { buildCatalog, type Product, type StoreRow } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { resolveProductImage } from "../data/productImageResolver";
import { suggestProducts } from "../lib/productSearch";
import "./HomeV2.css";

const popularSearches = ["Arroz", "Café", "Leite", "Carne", "Limpeza"];

const categories = [
  { name: "Mercados", description: "Itens do dia a dia", icon: ShoppingBasket, query: "mercado" },
  { name: "Açougue", description: "Carnes e cortes", icon: Tag, query: "carne" },
  { name: "Farmácias", description: "Saúde e cuidados", icon: HeartPulse, href: "/farmacias" },
  { name: "Livros", description: "Autores de Feijó", icon: BookOpen, href: "/dorinha-barroso" },
];

const initialCatalog = buildCatalog();
type Theme = "light" | "dark";

const readTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const money = (value: number) => new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
}).format(value);

function bestOffer(product: Product) {
  const offers = [...(product.offers ?? [])]
    .filter((offer) => Number.isFinite(offer.value) && offer.value > 0)
    .sort((a, b) => a.value - b.value);

  return offers[0] ?? {
    establishmentId: product.establishmentId,
    establishmentSlug: product.establishmentSlug,
    establishment: product.establishment,
    neighborhood: product.neighborhood,
    storeColor: product.storeColor,
    value: product.minPrice,
    capturedAt: product.capturedAt,
  };
}

function priceDifference(product: Product) {
  return Math.max(0, product.maxPrice - product.minPrice);
}

export function HomeV2() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialCatalog.products);
  const [stores, setStores] = useState<StoreRow[]>(initialCatalog.stores);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeResult, setActiveResult] = useState(-1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const searchAreaRef = useRef<HTMLDivElement>(null);
  const modalCloseRef = useRef<HTMLButtonElement>(null);
  const modalDialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const suggestions = useMemo(() => {
    if (query.trim().length < 2) return [];
    return suggestProducts(products, query, 5).filter((product) => product.minPrice > 0);
  }, [products, query]);

  const opportunityProducts = useMemo(() => products
    .filter((product) => product.minPrice > 0)
    .sort((a, b) => priceDifference(b) - priceDifference(a) || a.minPrice - b.minPrice)
    .slice(0, 4), [products]);

  const featuredStores = useMemo(() => stores
    .filter((store) => store.products > 0)
    .sort((a, b) => b.products - a.products || a.name.localeCompare(b.name, "pt-BR"))
    .slice(0, 4), [stores]);

  const comparisonProduct = opportunityProducts[0] ?? products.find((product) => product.minPrice > 0) ?? null;

  useEffect(() => {
    let active = true;
    fetchCatalog()
      .then((result) => {
        if (!active) return;
        setProducts(result.products);
        setStores(result.stores);
      })
      .finally(() => {
        if (active) setCatalogLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalCloseRef.current?.focus();
    const handleModalKeys = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedProduct(null);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...(modalDialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? [])];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleModalKeys);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleModalKeys);
    };
  }, [selectedProduct]);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!searchAreaRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
        setActiveResult(-1);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  const search = (term: string) => {
    const normalized = term.trim();
    navigate(normalized ? `/buscar?q=${encodeURIComponent(normalized)}` : "/buscar");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selected = activeResult >= 0 ? suggestions[activeResult] : suggestions[0];
    if (selected) {
      setSearchOpen(false);
      setSelectedProduct(selected);
      return;
    }
    search(query);
  };

  const openProduct = (product: Product) => {
    setSearchOpen(false);
    setSelectedProduct(product);
  };

  const handleSearchKeys = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setSearchOpen(false);
      setActiveResult(-1);
      return;
    }
    if (!searchOpen || !suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveResult((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveResult((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveResult(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveResult(suggestions.length - 1);
    } else if (event.key === "Enter" && activeResult >= 0) {
      event.preventDefault();
      openProduct(suggestions[activeResult]);
    }
  };

  return (
    <div className="home-v2">
      <a className="home-v2-skip" href="#conteudo">Ir para o conteúdo</a>

      <header className="home-v2-header">
        <div className="home-v2-header-inner">
          <Link className="home-v2-logo" to="/" aria-label="PreçoCerto - página inicial">
            <img className="home-v2-logo-light" src="/logo-preco-certo.svg" alt="PreçoCerto" />
            <img className="home-v2-logo-dark" src="/logo-preco-certo-inversa.svg" alt="" aria-hidden="true" />
          </Link>

          <nav className="home-v2-nav" aria-label="Navegação principal">
            <Link to="/buscar">Comparar</Link>
            <a href="#categorias">Categorias</a>
            <a href="#oportunidades">Oportunidades</a>
            <Link to="/estabelecimentos">Estabelecimentos</Link>
          </nav>

          <div className="home-v2-header-actions">
            <button className="home-v2-theme" type="button" onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}>
              {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </button>
            <Link className="home-v2-merchant-link" to="/lojista">Sou comerciante <ArrowRight aria-hidden="true" /></Link>
          </div>

          <button className="home-v2-menu-button" type="button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} aria-controls="home-v2-mobile-nav" onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>

        {menuOpen && (
          <nav id="home-v2-mobile-nav" className="home-v2-mobile-nav" aria-label="Navegação para celular">
            <Link to="/buscar" onClick={() => setMenuOpen(false)}>Comparar preços</Link>
            <a href="#categorias" onClick={() => setMenuOpen(false)}>Categorias</a>
            <a href="#oportunidades" onClick={() => setMenuOpen(false)}>Oportunidades</a>
            <Link to="/estabelecimentos" onClick={() => setMenuOpen(false)}>Estabelecimentos</Link>
            <Link to="/cesta-basica" onClick={() => setMenuOpen(false)}>Cesta inteligente</Link>
            <Link to="/lojista" onClick={() => setMenuOpen(false)}>Sou comerciante</Link>
          </nav>
        )}
      </header>

      <main id="conteudo">
        <section className="home-v2-hero" aria-labelledby="home-v2-title">
          <div className="home-v2-hero-inner">
            <div className="home-v2-copy">
              <span className="home-v2-local-label"><MapPin aria-hidden="true" /> Feijó, Acre</span>
              <h1 id="home-v2-title">Pesquise. Compare. <em>Economize melhor.</em></h1>
              <p className="home-v2-lead">Encontre o menor preço entre estabelecimentos locais antes de sair para comprar.</p>

              <div className="home-v2-search-area" ref={searchAreaRef}>
                <form className="home-v2-search" onSubmit={handleSubmit} role="search">
                  <Search aria-hidden="true" />
                  <label className="sr-only" htmlFor="home-product-search">Qual produto você procura?</label>
                  <input
                    id="home-product-search"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setSearchOpen(true);
                      setActiveResult(-1);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    onKeyDown={handleSearchKeys}
                    placeholder="Busque arroz, café, carne..."
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={searchOpen && query.trim().length >= 2}
                    aria-controls="home-product-results"
                    aria-activedescendant={activeResult >= 0 ? `home-product-result-${activeResult}` : undefined}
                  />
                  <button type="submit">Buscar <ArrowRight aria-hidden="true" /></button>
                </form>

                {searchOpen && query.trim().length >= 2 && (
                  <div className="home-v2-results" id="home-product-results" role="listbox" aria-label="Produtos encontrados">
                    <div className="home-v2-results-head"><span>Resultados</span>{suggestions.length > 0 && <small>{suggestions.length} encontrados</small>}</div>
                    {catalogLoading && !suggestions.length ? (
                      <div className="home-v2-results-state" role="status"><PackageSearch aria-hidden="true" /><span><strong>Buscando produtos…</strong><small>Consultando preços disponíveis.</small></span></div>
                    ) : suggestions.length > 0 ? (
                      <div className="home-v2-results-list">
                        {suggestions.map((product, index) => {
                          const offer = bestOffer(product);
                          const image = resolveProductImage(product);
                          return (
                            <button id={`home-product-result-${index}`} key={String(product.id)} className={`home-v2-result${activeResult === index ? " is-active" : ""}`} type="button" role="option" aria-selected={activeResult === index} onMouseEnter={() => setActiveResult(index)} onClick={() => openProduct(product)}>
                              <span className="home-v2-result-image">{image ? <img src={image} alt="" /> : <PackageSearch aria-hidden="true" />}</span>
                              <span className="home-v2-result-copy"><strong>{product.name}</strong><small>{[product.brand, product.size].filter(Boolean).join(" · ")}</small><span className="home-v2-result-store"><Store aria-hidden="true" /> {offer.establishment}</span></span>
                              <span className="home-v2-result-price"><small>Menor preço</small><strong>{money(offer.value)}</strong></span>
                              <ChevronRight aria-hidden="true" />
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="home-v2-results-state" role="status"><PackageSearch aria-hidden="true" /><span><strong>Nenhum produto encontrado</strong><small>Tente outro nome, marca ou categoria.</small></span></div>
                    )}
                  </div>
                )}
              </div>

              <div className="home-v2-popular" aria-label="Buscas rápidas">
                <span>Buscas rápidas</span>
                {popularSearches.map((item) => <button key={item} type="button" onClick={() => search(item)}>{item}</button>)}
              </div>
            </div>
          </div>
        </section>

        <section id="categorias" className="home-v2-section home-v2-categories" aria-labelledby="categories-title">
          <div className="home-v2-section-heading home-v2-heading-row">
            <div><h2 id="categories-title">Comece pelo que você precisa</h2><p>Navegue pelas áreas mais úteis sem perder tempo.</p></div>
            <Link className="home-v2-inline-link" to="/buscar">Ver tudo <ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="home-v2-category-grid">
            {categories.map(({ name, description, icon: Icon, href, query: categoryQuery }) => {
              const content = <><span className="home-v2-category-icon"><Icon aria-hidden="true" /></span><span><strong>{name}</strong><small>{description}</small></span><ChevronRight aria-hidden="true" /></>;
              return href ? <Link key={name} to={href} className="home-v2-category">{content}</Link> : <button key={name} type="button" className="home-v2-category" onClick={() => search(categoryQuery ?? name)}>{content}</button>;
            })}
          </div>
        </section>

        <section id="oportunidades" className="home-v2-opportunities" aria-labelledby="opportunities-title">
          <div className="home-v2-section home-v2-opportunities-inner">
            <div className="home-v2-section-heading home-v2-heading-row">
              <div><h2 id="opportunities-title">Preços que valem comparar agora</h2><p>Produtos reais do catálogo, ordenados pela diferença encontrada entre estabelecimentos.</p></div>
              <Link className="home-v2-inline-link" to="/buscar">Pesquisar outro produto <ArrowRight aria-hidden="true" /></Link>
            </div>
            <div className="home-v2-product-grid">
              {opportunityProducts.map((product) => {
                const offer = bestOffer(product);
                const image = resolveProductImage(product);
                const difference = priceDifference(product);
                return (
                  <button key={String(product.id)} type="button" className="home-v2-product-card" onClick={() => openProduct(product)} aria-haspopup="dialog">
                    <span className="home-v2-product-media">{image ? <img src={image} alt="" loading="lazy" /> : <PackageSearch aria-hidden="true" />}</span>
                    <span className="home-v2-product-body">
                      <small>{[product.category, product.size].filter(Boolean).join(" · ")}</small>
                      <strong className="home-v2-product-name">{product.name}</strong>
                      <span className="home-v2-store-line"><Store aria-hidden="true" /> {offer.establishment}{offer.neighborhood ? ` · ${offer.neighborhood}` : ""}</span>
                      <span className="home-v2-product-bottom"><span><small>Menor preço</small><b>{money(offer.value)}</b></span>{difference > 0 && <em>Diferença de até {money(difference)}</em>}</span>
                      <span className="home-v2-card-action">Comparar preços <ArrowRight aria-hidden="true" /></span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {comparisonProduct && (
          <section className="home-v2-section home-v2-compare" aria-labelledby="compare-title">
            <div className="home-v2-compare-copy">
              <h2 id="compare-title">Compare antes de escolher.</h2>
              <p>O PreçoCerto organiza menor preço, média e maior preço para deixar a decisão evidente sem transformar a compra em um painel complicado.</p>
              <button type="button" className="home-v2-primary-button" onClick={() => openProduct(comparisonProduct)}>Ver comparação completa <ArrowRight aria-hidden="true" /></button>
            </div>
            <div className="home-v2-compare-example">
              <div className="home-v2-compare-product"><span>{resolveProductImage(comparisonProduct) ? <img src={resolveProductImage(comparisonProduct)} alt="" loading="lazy" /> : <PackageSearch aria-hidden="true" />}</span><div><small>Exemplo do catálogo</small><strong>{comparisonProduct.name}</strong></div></div>
              <div className="home-v2-price-row"><span><small>Menor</small><strong>{money(comparisonProduct.minPrice)}</strong></span><span><small>Média</small><strong>{money(comparisonProduct.avgPrice)}</strong></span><span><small>Maior</small><strong>{money(comparisonProduct.maxPrice)}</strong></span></div>
              <p><ShieldCheck aria-hidden="true" /> {comparisonProduct.storeCount} {comparisonProduct.storeCount === 1 ? "estabelecimento comparado" : "estabelecimentos comparados"}</p>
            </div>
          </section>
        )}

        <section className="home-v2-section home-v2-stores" aria-labelledby="stores-title">
          <div className="home-v2-section-heading home-v2-heading-row">
            <div><h2 id="stores-title">Estabelecimentos locais</h2><p>Abra o catálogo de cada comércio e confira o que está disponível.</p></div>
            <Link className="home-v2-inline-link" to="/estabelecimentos">Ver todos <ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="home-v2-store-grid">
            {featuredStores.map((store) => (
              <Link key={String(store.id)} className="home-v2-store-card" to={`/estabelecimento/${store.slug}`}>
                <span className="home-v2-store-mark" style={{ backgroundColor: store.color || "#155eef" }}><Store aria-hidden="true" /></span>
                <span><strong>{store.name}</strong><small>{store.neighborhood || "Feijó, AC"}</small></span>
                <span className="home-v2-store-meta">{store.products} {store.products === 1 ? "produto" : "produtos"}</span>
                <ChevronRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <section className="home-v2-section home-v2-basket" aria-labelledby="basket-title">
          <span className="home-v2-basket-icon"><ShoppingCart aria-hidden="true" /></span>
          <div><h2 id="basket-title">Planeje a cesta inteira, não só um item.</h2><p>Reúna o que precisa e compare sua compra com mais clareza.</p></div>
          <Link className="home-v2-primary-link" to="/cesta-basica">Montar minha cesta <ArrowRight aria-hidden="true" /></Link>
        </section>

        <section className="home-v2-section home-v2-how" aria-labelledby="how-title">
          <div className="home-v2-section-heading"><h2 id="how-title">Da busca à economia em três passos</h2><p>Um fluxo direto para decidir melhor antes de comprar.</p></div>
          <ol className="home-v2-steps">
            <li><span>1</span><div><strong>Pesquise</strong><p>Digite o produto que procura.</p></div></li>
            <li><span>2</span><div><strong>Compare</strong><p>Veja preços e estabelecimentos.</p></div></li>
            <li><span>3</span><div><strong>Escolha</strong><p>Vá direto à opção que faz sentido.</p></div></li>
          </ol>
        </section>

        <section className="home-v2-merchant" aria-labelledby="merchant-title">
          <div className="home-v2-merchant-inner"><span className="home-v2-merchant-icon"><Store aria-hidden="true" /></span><div><h2 id="merchant-title">Seu comércio também pode estar no PreçoCerto.</h2><p>Organize seu catálogo e facilite a descoberta dos seus produtos em Feijó.</p></div><Link to="/lojista">Conhecer área do comerciante <ArrowRight aria-hidden="true" /></Link></div>
        </section>
      </main>

      {selectedProduct && (() => {
        const offers = [...(selectedProduct.offers ?? [])].filter((offer) => Number.isFinite(offer.value) && offer.value > 0).sort((a, b) => a.value - b.value);
        const image = resolveProductImage(selectedProduct);
        const updatedAt = new Date(selectedProduct.capturedAt);
        return (
          <div className="home-v2-product-modal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedProduct(null); }}>
            <section ref={modalDialogRef} className="home-v2-product-dialog" role="dialog" aria-modal="true" aria-labelledby="home-v2-modal-title">
              <button ref={modalCloseRef} className="home-v2-modal-close" type="button" aria-label="Fechar detalhes do produto" onClick={() => setSelectedProduct(null)}><X aria-hidden="true" /></button>
              <div className="home-v2-modal-media"><span className="home-v2-modal-badge"><BadgeCheck aria-hidden="true" /> Melhor preço encontrado</span>{image ? <img src={image} alt={selectedProduct.name} /> : <PackageSearch aria-hidden="true" />}</div>
              <div className="home-v2-modal-content">
                <span className="home-v2-modal-category">{selectedProduct.category || "Produto"}</span>
                <h2 id="home-v2-modal-title">{selectedProduct.name}</h2>
                <p className="home-v2-modal-meta">{[selectedProduct.brand, selectedProduct.size].filter(Boolean).join(" · ")}</p>
                <div className="home-v2-modal-prices" aria-label="Resumo dos preços"><div className="is-best"><small>Menor preço</small><strong>{money(selectedProduct.minPrice)}</strong></div><div><small>Média local</small><strong>{money(selectedProduct.avgPrice)}</strong></div><div><small>Maior preço</small><strong>{money(selectedProduct.maxPrice)}</strong></div></div>
                <div className="home-v2-modal-stores"><div className="home-v2-modal-stores-head"><strong>Onde está mais barato</strong><small>{selectedProduct.storeCount} {selectedProduct.storeCount === 1 ? "estabelecimento" : "estabelecimentos"}</small></div>{(offers.length ? offers : [bestOffer(selectedProduct)]).slice(0, 4).map((offer, index) => <div className={`home-v2-modal-store${index === 0 ? " is-cheapest" : ""}`} key={`${offer.establishmentId}-${offer.value}`}><span className="home-v2-modal-store-icon" style={{ backgroundColor: offer.storeColor || "#155eef" }}><Store aria-hidden="true" /></span><span><strong>{offer.establishment}</strong><small>{offer.neighborhood || "Feijó, AC"}</small></span>{index === 0 && <em>Mais barato</em>}<b>{money(offer.value)}</b></div>)}</div>
                <p className="home-v2-modal-update"><ShieldCheck aria-hidden="true" /> Atualizado {Number.isNaN(updatedAt.getTime()) ? "recentemente" : updatedAt.toLocaleDateString("pt-BR")}</p>
                <div className="home-v2-modal-actions"><Link to={`/produto/${selectedProduct.slug || selectedProduct.id}`} onClick={() => setSelectedProduct(null)}>Ver detalhes completos <ArrowRight aria-hidden="true" /></Link><button type="button" onClick={() => search(selectedProduct.name)}>Comparar similares</button></div>
              </div>
            </section>
          </div>
        );
      })()}

      <footer className="home-v2-footer">
        <div className="home-v2-footer-inner"><div className="home-v2-footer-brand"><img src="/logo-preco-certo-inversa.svg" alt="PreçoCerto" /><p>Pesquise, compare e escolha melhor em Feijó.</p></div><div className="home-v2-footer-links"><strong>Explorar</strong><Link to="/buscar">Comparar preços</Link><Link to="/estabelecimentos">Estabelecimentos</Link><Link to="/farmacias">Farmácias</Link></div><div className="home-v2-footer-links"><strong>PreçoCerto</strong><Link to="/colaborar">Colaborar</Link><Link to="/fale-conosco">Fale conosco</Link><Link to="/lojista">Área do comerciante</Link></div></div>
        <div className="home-v2-footer-bottom"><span>PreçoCerto · Feijó, Acre</span><span>Informação local para escolhas melhores.</span></div>
      </footer>
    </div>
  );
}
