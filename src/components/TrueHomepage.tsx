import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight, BarChart3, CheckCircle2, Heart, MapPin, Menu, PackageSearch,
  Search, ShieldCheck, ShoppingBasket, Sparkles, Store, TrendingDown, X,
} from "lucide-react";
import { buildCatalog, type Product, type StoreRow } from "../data/catalog";
import { fetchCatalog } from "../data/remoteCatalog";
import { getStoreLogoUrl } from "../data/storeLogos";
import "./TrueHomepage.css";

const seed = buildCatalog();
const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const number = (value: number) => new Intl.NumberFormat("pt-BR").format(value);

function ProductImage({ product }: { product: Product }) {
  return (
    <div className="th-product__media">
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} loading="lazy" />
      ) : (
        <PackageSearch aria-hidden="true" />
      )}
    </div>
  );
}

export function TrueHomepage() {
  const [products, setProducts] = useState<Product[]>(seed.products);
  const [stores, setStores] = useState<StoreRow[]>(seed.stores);
  const [metrics, setMetrics] = useState(seed.metrics);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetchCatalog().then(result => {
      if (!active) return;
      setProducts(result.products);
      setStores(result.stores);
      setMetrics(result.metrics);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const featured = useMemo(() => {
    return [...products]
      .filter(product => Number.isFinite(product.minPrice) && product.minPrice > 0)
      .sort((a, b) => {
        const aSave = Math.max(0, a.maxPrice - a.minPrice);
        const bSave = Math.max(0, b.maxPrice - b.minPrice);
        return bSave - aSave || a.minPrice - b.minPrice;
      })
      .slice(0, 8);
  }, [products]);

  const topStores = useMemo(() => [...stores].sort((a, b) => b.products - a.products).slice(0, 6), [stores]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    window.location.href = value ? `/buscar?q=${encodeURIComponent(value)}` : "/buscar";
  };

  return (
    <div className="true-home">
      <header className="th-header">
        <div className="th-shell th-header__inner">
          <a className="th-brand" href="/" aria-label="PreçoCerto - início">
            <img src="/logo-preco-certo-inversa.svg" alt="PreçoCerto" />
            <span>Feijó-AC</span>
          </a>

          <nav className="th-nav" aria-label="Navegação principal">
            <a href="/buscar">Buscar preços</a>
            <a href="/melhores-precos">Melhores preços</a>
            <a href="/cesta-basica">Cesta inteligente</a>
            <a href="/estabelecimentos">Estabelecimentos</a>
          </nav>

          <div className="th-header__actions">
            <a className="th-login" href="/login">Entrar</a>
            <a className="th-button th-button--brand th-header__cta" href="/cesta-basica">Montar cesta</a>
            <button className="th-menu" type="button" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><Menu /></button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="th-mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><X /></button>
          <a href="/buscar">Buscar preços</a>
          <a href="/melhores-precos">Melhores preços</a>
          <a href="/cesta-basica">Cesta inteligente</a>
          <a href="/estabelecimentos">Estabelecimentos</a>
          <a href="/lojista">Sou comerciante</a>
          <a href="/login">Entrar</a>
        </div>
      )}

      <main>
        <section className="th-hero">
          <div className="th-hero__image" aria-hidden="true" />
          <div className="th-hero__overlay" aria-hidden="true" />
          <div className="th-shell th-hero__content">
            <div className="th-hero__copy">
              <div className="th-kicker"><MapPin /> Feijó • Acre <span /> preços locais</div>
              <h1>Compare preços antes de <strong>gastar seu dinheiro.</strong></h1>
              <p>Pesquise produtos nos comércios de Feijó, compare valores de forma simples e descubra onde sua compra pode sair mais barata.</p>

              <form className="th-search" onSubmit={submitSearch} role="search">
                <Search aria-hidden="true" />
                <input value={query} onChange={event => setQuery(event.target.value)} placeholder="O que você quer comprar hoje?" aria-label="Buscar produto" />
                <button type="submit">Comparar preços <ArrowRight /></button>
              </form>

              <div className="th-trust">
                <span><CheckCircle2 /> Dados de comércios locais</span>
                <span><ShieldCheck /> Comparação transparente</span>
                <span><TrendingDown /> Foco em economia</span>
              </div>
            </div>

            <aside className="th-hero-card" aria-label="Resumo da plataforma">
              <div className="th-hero-card__label"><Sparkles /> Seu atalho para comprar melhor</div>
              <h2>Veja o preço. Compare. Decida.</h2>
              <p>O PreçoCerto organiza os valores cadastrados em uma experiência simples para você tomar decisões mais rápidas.</p>
              <div className="th-hero-card__stats">
                <div><strong>{number(metrics.products)}</strong><span>itens cadastrados</span></div>
                <div><strong>{number(metrics.stores)}</strong><span>estabelecimentos</span></div>
                <div><strong>{number(metrics.prices)}</strong><span>preços registrados</span></div>
              </div>
              <a href="/melhores-precos">Ver oportunidades <ArrowRight /></a>
            </aside>
          </div>
        </section>

        <section className="th-quick" aria-label="Atalhos">
          <div className="th-shell th-quick__grid">
            <a href="/buscar"><span><Search /></span><div><strong>Buscar produto</strong><small>Encontre o que precisa</small></div><ArrowRight /></a>
            <a href="/melhores-precos"><span><TrendingDown /></span><div><strong>Melhores preços</strong><small>Veja onde está mais barato</small></div><ArrowRight /></a>
            <a href="/cesta-basica"><span><ShoppingBasket /></span><div><strong>Cesta inteligente</strong><small>Planeje dentro do orçamento</small></div><ArrowRight /></a>
            <a href="/estabelecimentos"><span><Store /></span><div><strong>Comércios locais</strong><small>Explore por estabelecimento</small></div><ArrowRight /></a>
          </div>
        </section>

        <section className="th-section th-section--light">
          <div className="th-shell">
            <div className="th-heading">
              <div><span>Oportunidades locais</span><h2>Produtos que merecem sua atenção</h2><p>Uma seleção baseada nas diferenças de preço disponíveis no catálogo atual.</p></div>
              <a href="/melhores-precos">Ver todos <ArrowRight /></a>
            </div>

            <div className="th-products">
              {featured.map(product => {
                const saving = Math.max(0, product.maxPrice - product.minPrice);
                return (
                  <article className="th-product" key={String(product.id)}>
                    <ProductImage product={product} />
                    <div className="th-product__body">
                      <div className="th-product__topline"><span>{product.category || "Produto"}</span><button type="button" aria-label={`Favoritar ${product.name}`}><Heart /></button></div>
                      <h3>{product.name}</h3>
                      <p>{product.establishment}</p>
                      <div className="th-product__price"><strong>{money(product.minPrice)}</strong>{saving > 0 && <span>até {money(saving)} de diferença</span>}</div>
                      <a href={`/produto/${product.slug || product.id}`}>Comparar agora <ArrowRight /></a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="th-section th-how">
          <div className="th-shell th-how__layout">
            <div className="th-how__intro">
              <span className="th-eyebrow">Simples de usar</span>
              <h2>Da pesquisa à decisão em poucos passos.</h2>
              <p>O PreçoCerto foi pensado para reduzir esforço: você informa o que procura e recebe uma visão organizada dos preços cadastrados.</p>
              <a className="th-button th-button--brand" href="/buscar">Começar uma pesquisa <ArrowRight /></a>
            </div>
            <div className="th-how__steps">
              <article><b>01</b><span><Search /></span><h3>Pesquise</h3><p>Digite o nome do produto e encontre opções cadastradas.</p></article>
              <article><b>02</b><span><BarChart3 /></span><h3>Compare</h3><p>Veja menor preço, média local, maior preço e lojas disponíveis.</p></article>
              <article><b>03</b><span><ShoppingBasket /></span><h3>Economize</h3><p>Escolha melhor ou use a cesta para otimizar várias compras.</p></article>
            </div>
          </div>
        </section>

        <section className="th-section th-section--light">
          <div className="th-shell">
            <div className="th-heading">
              <div><span>Feijó em um só lugar</span><h2>Estabelecimentos cadastrados</h2><p>Consulte lojas locais e veja os produtos e preços disponíveis.</p></div>
              <a href="/estabelecimentos">Explorar todos <ArrowRight /></a>
            </div>
            <div className="th-stores">
              {topStores.map(store => {
                const logo = getStoreLogoUrl(store.name);
                return (
                  <a className="th-store" href={`/estabelecimento/${store.slug || store.id}`} key={String(store.id)}>
                    <div className="th-store__logo" style={{ background: store.color || "#e2e8f0" }}>
                      {logo ? <img src={logo} alt={`Logo ${store.name}`} loading="lazy" /> : <Store />}
                    </div>
                    <div><strong>{store.name}</strong><span>{store.neighborhood}</span><small>{number(store.products)} produtos cadastrados</small></div>
                    <ArrowRight />
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <section className="th-section th-basket">
          <div className="th-shell th-basket__card">
            <div className="th-basket__visual"><ShoppingBasket /><span>Cesta inteligente</span></div>
            <div className="th-basket__copy">
              <span className="th-eyebrow">Mais que comparar um item</span>
              <h2>Monte sua lista e deixe o PreçoCerto ajudar a organizar sua compra.</h2>
              <p>Informe seus produtos e orçamento para comparar combinações e enxergar onde sua cesta pode ficar mais econômica.</p>
              <div><a className="th-button th-button--brand" href="/cesta-basica">Montar minha cesta <ArrowRight /></a><a className="th-text-link" href="/como-funciona">Entender como funciona</a></div>
            </div>
          </div>
        </section>

        <section className="th-section th-merchant">
          <div className="th-shell th-merchant__inner">
            <div><span className="th-eyebrow">Para comerciantes</span><h2>Coloque seu comércio diante de quem já está procurando preço.</h2><p>Apresente seu estabelecimento, mantenha seu catálogo visível e participe do ecossistema local do PreçoCerto.</p></div>
            <a className="th-button th-button--light" href="/lojista">Conhecer área do lojista <ArrowRight /></a>
          </div>
        </section>

        <section className="th-final">
          <div className="th-shell th-final__inner">
            <div><span>PreçoCerto • Feijó-AC</span><h2>Antes de comprar, descubra onde vale mais a pena.</h2><p>Comece por um produto, compare os preços e tome uma decisão melhor.</p></div>
            <a className="th-button th-button--brand" href="/buscar">Pesquisar agora <Search /></a>
          </div>
        </section>
      </main>

      <footer className="th-footer">
        <div className="th-shell th-footer__grid">
          <div className="th-footer__brand"><img src="/logo-preco-certo-inversa.svg" alt="PreçoCerto" /><p>Comparação local de preços para consumidores de Feijó, Acre.</p></div>
          <div><strong>Consumidor</strong><a href="/buscar">Buscar preços</a><a href="/melhores-precos">Melhores preços</a><a href="/cesta-basica">Cesta inteligente</a></div>
          <div><strong>Plataforma</strong><a href="/estabelecimentos">Estabelecimentos</a><a href="/lojista">Área do lojista</a><a href="/colaborar">Colaborar</a></div>
          <div><strong>Ajuda</strong><a href="/fale-conosco">Fale conosco</a><a href="/farmacias">Farmácias</a><a href="/login">Entrar</a></div>
        </div>
        <div className="th-shell th-footer__bottom">PreçoCerto • Feijó-AC</div>
      </footer>
    </div>
  );
}
