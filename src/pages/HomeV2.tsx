import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  HeartPulse,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Store,
  Tag,
  X,
} from "lucide-react";
import "./HomeV2.css";

const popularSearches = ["Arroz", "Café", "Leite", "Carne", "Material de limpeza"];

const categories = [
  { name: "Mercado", description: "Alimentos e itens do dia a dia", icon: ShoppingBasket, query: "mercado" },
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

export function HomeV2() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const search = (term: string) => {
    const normalized = term.trim();
    navigate(normalized ? `/buscar?q=${encodeURIComponent(normalized)}` : "/buscar");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    search(query);
  };

  return (
    <div className="home-v2">
      <a className="home-v2-skip" href="#conteudo">Ir para o conteúdo</a>

      <header className="home-v2-header">
        <div className="home-v2-header-inner">
          <Link className="home-v2-logo" to="/" aria-label="PreçoCerto - página inicial">
            <img src="/logo-preco-certo.svg" alt="PreçoCerto" />
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
              <span className="home-v2-eyebrow"><MapPin aria-hidden="true" /> Feijó, Acre</span>
              <h1 id="home-v2-title">Compare preços locais. Compre melhor em Feijó.</h1>
              <p className="home-v2-lead">Encontre produtos, compare lojas e planeje sua compra em poucos passos.</p>

              <form className="home-v2-search" onSubmit={handleSubmit} role="search">
                <Search aria-hidden="true" />
                <label className="sr-only" htmlFor="home-product-search">Qual produto você procura?</label>
                <input
                  id="home-product-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Busque arroz, café, carne..."
                  autoComplete="off"
                />
                <button type="submit">Comparar <ArrowRight aria-hidden="true" /></button>
              </form>

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
                <span><strong>Compare antes de sair</strong>Consulte preços e planeje sua compra.</span>
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
            <h2 id="categories-title">Comece pelo que você precisa</h2>
            <p>Pesquise produtos, descubra lojas e compare opções disponíveis na cidade.</p>
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
              <h2 id="featured-title">Itens para comparar agora</h2>
              <p>Atalhos para produtos presentes na rotina das famílias.</p>
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
          <div className="home-v2-local-image"><img src="/supermercado-hero.jpg" alt="Prateleiras de supermercado abastecidas" loading="lazy" /></div>
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
