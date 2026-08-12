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
  PackageSearch,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Store,
  Tag,
  X,
} from "lucide-react";
import { buildCatalog, type Product } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { resolveProductImage } from "../data/productImageResolver";
import { suggestProducts } from "../lib/productSearch";
import "./HomeV2.css";

const popularSearches = ["Arroz", "Café", "Leite", "Carne", "Material de limpeza"];

const categories = [
  { name: "Mercados", description: "Alimentos e itens do dia a dia", icon: ShoppingBasket, query: "mercado" },
  { name: "Açougue", description: "Carnes e cortes em lojas locais", icon: Tag, query: "carne" },
  { name: "Farmácias", description: "Saúde, higiene e cuidados", icon: HeartPulse, href: "/farmacias" },
  { name: "Livros", description: "Autores e cultura de Feijó", icon: BookOpen, href: "/dorinha-barroso" },
];

const featuredProducts = [
  { name: "Arroz branco", detail: "Pacotes e marcas locais", image: "/products/arroz-branco-bernardo-1kg.jpg", query: "arroz" },
  { name: "Café", detail: "Compare tamanhos e marcas", image: "/products/cafe-3-coracoes-500g.jpg", query: "cafe" },
  { name: "Leite", detail: "Encontre opções perto de você", image: "/products/leite-italac-1l.jpg", query: "leite" },
  { name: "Feijão", detail: "Veja os preços disponíveis", image: "/products/feijao-carioca-bernardo-1kg.jpg", query: "feijao" },
];

const initialCatalog = buildCatalog();
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

export function HomeV2() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialCatalog.products);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeResult, setActiveResult] = useState(-1);
  const searchAreaRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (query.trim().length < 2) return [];
    return suggestProducts(products, query, 5).filter((product) => product.minPrice > 0);
  }, [products, query]);

  useEffect(() => {
    let active = true;
    fetchCatalog()
      .then((result) => {
        if (active) setProducts(result.products);
      })
      .finally(() => {
        if (active) setCatalogLoading(false);
      });
    return () => { active = false; };
  }, []);

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
    if (activeResult >= 0 && suggestions[activeResult]) {
      navigate(`/produto/${suggestions[activeResult].slug || suggestions[activeResult].id}`);
      return;
    }
    search(query);
  };

  const openProduct = (product: Product) => {
    setSearchOpen(false);
    navigate(`/produto/${product.slug || product.id}`);
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
            <Link to="/buscar">Comparar preços</Link>
            <Link to="/estabelecimentos">Estabelecimentos</Link>
            <Link to="/farmacias">Farmácias</Link>
            <Link to="/colaborar">Colaborar</Link>
          </nav>

          <Link className="home-v2-merchant-link" to="/lojista">
            Sou comerciante <ArrowRight aria-hidden="true" />
          </Link>

          <button
            className="home-v2-menu-button"
            type="button"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>

        {menuOpen && (
          <nav className="home-v2-mobile-nav" aria-label="Navegação para celular">
            <Link to="/buscar" onClick={() => setMenuOpen(false)}>Comparar preços</Link>
            <Link to="/estabelecimentos" onClick={() => setMenuOpen(false)}>Estabelecimentos</Link>
            <Link to="/farmacias" onClick={() => setMenuOpen(false)}>Farmácias</Link>
            <Link to="/colaborar" onClick={() => setMenuOpen(false)}>Colaborar</Link>
            <Link to="/lojista" onClick={() => setMenuOpen(false)}>Sou comerciante</Link>
          </nav>
        )}
      </header>

      <main id="conteudo">
        <section className="home-v2-hero" aria-labelledby="home-v2-title">
          <div className="home-v2-hero-inner">
            <div className="home-v2-copy">
              <span className="home-v2-eyebrow"><MapPin aria-hidden="true" /> Feito para Feijó, Acre</span>
              <h1 id="home-v2-title">Sua compra começa com o <em>preço certo.</em></h1>
              <p className="home-v2-lead">Compare produtos e estabelecimentos locais em segundos. Mais clareza para escolher, mais dinheiro sobrando no fim do mês.</p>

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
                  <button type="submit">Comparar <ArrowRight aria-hidden="true" /></button>
                </form>

                {searchOpen && query.trim().length >= 2 && (
                  <div className="home-v2-results" id="home-product-results" role="listbox" aria-label="Produtos encontrados">
                    <div className="home-v2-results-head">
                      <span>Resultados rápidos</span>
                      {suggestions.length > 0 && <small>{suggestions.length} produtos</small>}
                    </div>

                    {catalogLoading && !suggestions.length ? (
                      <div className="home-v2-results-state" role="status">
                        <PackageSearch aria-hidden="true" />
                        <span><strong>Buscando produtos…</strong><small>Comparando preços nos estabelecimentos.</small></span>
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div className="home-v2-results-list">
                        {suggestions.map((product, index) => {
                          const offer = bestOffer(product);
                          const image = resolveProductImage(product);
                          return (
                            <button
                              id={`home-product-result-${index}`}
                              key={String(product.id)}
                              className={`home-v2-result${activeResult === index ? " is-active" : ""}`}
                              type="button"
                              role="option"
                              aria-selected={activeResult === index}
                              onMouseEnter={() => setActiveResult(index)}
                              onClick={() => openProduct(product)}
                            >
                              <span className="home-v2-result-image">
                                {image ? <img src={image} alt="" /> : <PackageSearch aria-hidden="true" />}
                              </span>
                              <span className="home-v2-result-copy">
                                <strong>{product.name}</strong>
                                <small>{[product.brand, product.size].filter(Boolean).join(" · ")}</small>
                                <span className="home-v2-result-store"><Store aria-hidden="true" /> {offer.establishment}</span>
                              </span>
                              <span className="home-v2-result-price">
                                <small><BadgeCheck aria-hidden="true" /> Menor preço</small>
                                <strong>{money(offer.value)}</strong>
                                <em>{product.storeCount} {product.storeCount === 1 ? "estabelecimento" : "estabelecimentos"}</em>
                              </span>
                              <ChevronRight aria-hidden="true" />
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="home-v2-results-state" role="status">
                        <PackageSearch aria-hidden="true" />
                        <span><strong>Nenhum produto encontrado</strong><small>Tente outro nome, marca ou categoria.</small></span>
                      </div>
                    )}

                    <button className="home-v2-results-all" type="button" onClick={() => search(query)}>
                      Ver comparação completa <ArrowRight aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>

              <div className="home-v2-popular" aria-label="Buscas populares">
                <span>Mais buscados:</span>
                {popularSearches.map((item) => (
                  <button key={item} type="button" onClick={() => search(item)}>{item}</button>
                ))}
              </div>
            </div>

            <div className="home-v2-visual">
              <img src="/supermercado-premium.jpg" alt="Interior de supermercado com corredores organizados" fetchPriority="high" />
              <div className="home-v2-visual-note">
                <span className="home-v2-note-icon"><ShieldCheck aria-hidden="true" /></span>
                <span><strong>Economia começa aqui</strong>Pesquise antes de sair de casa.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="home-v2-trust" aria-label="Vantagens do PreçoCerto">
          <div><Store aria-hidden="true" /><span><strong>Comércio local</strong>Informações de lojas de Feijó</span></div>
          <div><Tag aria-hidden="true" /><span><strong>Comparação simples</strong>Preços organizados em um só lugar</span></div>
          <div><ShieldCheck aria-hidden="true" /><span><strong>Escolha consciente</strong>Decida antes de comprar</span></div>
        </section>

        <section className="home-v2-section home-v2-categories" aria-labelledby="categories-title">
          <div className="home-v2-section-heading">
            <span className="home-v2-section-kicker">Explore por categoria</span>
            <h2 id="categories-title">Tudo o que você procura, mais perto.</h2>
            <p>Encontre produtos, descubra comércios locais e compare as melhores opções disponíveis em Feijó.</p>
          </div>
          <div className="home-v2-category-grid">
            {categories.map(({ name, description, icon: Icon, href, query: categoryQuery }) => {
              const content = <><span className="home-v2-category-icon"><Icon aria-hidden="true" /></span><span><strong>{name}</strong><small>{description}</small></span><ChevronRight aria-hidden="true" /></>;
              return href ? <Link key={name} to={href} className="home-v2-category">{content}</Link> : <button key={name} type="button" className="home-v2-category" onClick={() => search(categoryQuery ?? name)}>{content}</button>;
            })}
          </div>
        </section>

        <section className="home-v2-featured" aria-labelledby="featured-title">
          <div className="home-v2-section home-v2-featured-inner">
            <div className="home-v2-section-heading home-v2-section-heading-light">
              <span className="home-v2-section-kicker">Mais procurados</span>
              <h2 id="featured-title">Produtos que fazem parte da sua rotina.</h2>
              <p>Comece pelos itens essenciais e descubra onde sua compra pode render mais.</p>
            </div>
            <div className="home-v2-products">
              {featuredProducts.map((product) => (
                <button key={product.name} type="button" className="home-v2-product" onClick={() => search(product.query)}>
                  <span className="home-v2-product-image"><img src={product.image} alt="" loading="lazy" /></span>
                  <span className="home-v2-product-copy"><strong>{product.name}</strong><small>{product.detail}</small></span>
                  <ArrowRight aria-hidden="true" />
                </button>
              ))}
            </div>
            <Link className="home-v2-text-link" to="/buscar">Explorar produtos <ArrowRight aria-hidden="true" /></Link>
          </div>
        </section>

        <section className="home-v2-section home-v2-how" aria-labelledby="how-title">
          <div className="home-v2-how-copy">
            <span className="home-v2-eyebrow"><Sparkles aria-hidden="true" /> Compra mais inteligente</span>
            <h2 id="how-title">Da pesquisa à melhor escolha.</h2>
            <p>O PreçoCerto organiza informações para você gastar menos tempo procurando e decidir com mais segurança.</p>
            <Link className="home-v2-primary-link" to="/buscar">Começar comparação <ArrowRight aria-hidden="true" /></Link>
          </div>
          <ol className="home-v2-steps">
            <li><span>1</span><div><strong>Pesquise o produto</strong><p>Digite o nome ou escolha uma categoria.</p></div></li>
            <li><span>2</span><div><strong>Compare as opções</strong><p>Veja produtos e estabelecimentos disponíveis.</p></div></li>
            <li><span>3</span><div><strong>Planeje sua compra</strong><p>Escolha o que faz sentido para seu orçamento.</p></div></li>
          </ol>
        </section>

        <section className="home-v2-section home-v2-ai" aria-labelledby="ai-title">
          <div className="home-v2-ai-icon"><ShoppingBasket aria-hidden="true" /></div>
          <div>
            <h2 id="ai-title">Monte sua cesta com mais inteligência</h2>
            <p>Informe o que precisa e use o comparador para encontrar opções para sua compra.</p>
          </div>
          <Link className="home-v2-ai-link" to="/buscar">Montar minha cesta <ArrowRight aria-hidden="true" /></Link>
        </section>

        <section className="home-v2-local" aria-labelledby="local-title">
          <div className="home-v2-local-image"><img src="/comerciante-local-feijo.webp" alt="Comerciante local organizando produtos frescos em seu estabelecimento" loading="lazy" width="1440" height="960" /></div>
          <div className="home-v2-local-copy">
            <h2 id="local-title">Valorize quem movimenta Feijó.</h2>
            <p>Conheça os estabelecimentos cadastrados, explore seus catálogos e encontre novas opções perto de você.</p>
            <ul>
              <li><Check aria-hidden="true" /> Catálogos organizados por estabelecimento</li>
              <li><Check aria-hidden="true" /> Pesquisa por produtos e categorias</li>
              <li><Check aria-hidden="true" /> Acesso simples pelo celular</li>
            </ul>
            <Link className="home-v2-secondary-link" to="/estabelecimentos">Conhecer estabelecimentos <ArrowRight aria-hidden="true" /></Link>
          </div>
        </section>
      </main>

      <footer className="home-v2-footer">
        <div className="home-v2-footer-inner">
          <div className="home-v2-footer-brand"><img src="/logo-preco-certo-inversa.svg" alt="PreçoCerto" /><p>Compare preços locais e planeje compras melhores em Feijó.</p></div>
          <div className="home-v2-footer-links"><strong>Explore</strong><Link to="/buscar">Comparar preços</Link><Link to="/estabelecimentos">Estabelecimentos</Link><Link to="/farmacias">Farmácias</Link></div>
          <div className="home-v2-footer-links"><strong>PreçoCerto</strong><Link to="/colaborar">Colaborar</Link><Link to="/fale-conosco">Fale conosco</Link><Link to="/lojista">Área do comerciante</Link></div>
        </div>
        <div className="home-v2-footer-bottom"><span>PreçoCerto Feijó-AC</span><span>Informação local para escolhas melhores.</span></div>
      </footer>
    </div>
  );
}
