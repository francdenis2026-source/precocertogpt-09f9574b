import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Heart, PackageSearch, Search, ShoppingBasket, Store, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { buildCatalog, type Product } from "../../data/catalog";
import { fetchCatalog } from "../../data/remoteCatalog";
import { resolveProductImage } from "../../data/productImageResolver";
import { useFavorites } from "./FavoritesProvider";
import "./favorites.css";

const money = (value:number) => new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format(value);

export function SavedFavoritesPage() {
  const { favoriteIds, userId, loading, toggleFavorite } = useFavorites();
  const [products, setProducts] = useState<Product[]>(buildCatalog().products);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    fetchCatalog().then(result => { if (active) setProducts(result.products); });
    return () => { active = false; };
  }, []);

  const favorites = useMemo(() => products.filter(product => favoriteIds.includes(String(product.id))), [products, favoriteIds]);
  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    if (!term) return favorites;
    return favorites.filter(product => [product.name, product.brand, product.category, product.establishment].some(value => String(value || "").toLocaleLowerCase("pt-BR").includes(term)));
  }, [favorites, query]);

  if (loading) return <main className="fav-page fav-state"><Heart/><h1>Carregando seus favoritos…</h1></main>;

  if (!userId) return <main className="fav-page fav-state">
    <div className="fav-state__icon"><Heart/></div>
    <span className="fav-kicker">LISTA PESSOAL</span>
    <h1>Entre para salvar seus produtos favoritos.</h1>
    <p>Você pode tocar no coração em qualquer produto. Para guardar e acessar a lista em outros dispositivos, é necessário ter uma conta no PreçoCerto.</p>
    <div className="fav-state__actions"><a className="fav-primary" href="/login?redirect=%2Ffavoritos">Entrar na minha conta</a><a className="fav-secondary" href="/cadastro?redirect=%2Ffavoritos">Criar conta</a></div>
  </main>;

  return <main className="fav-page">
    <header className="fav-header">
      <div><Link to="/" className="fav-back"><ArrowLeft/> Voltar</Link><span className="fav-kicker">SUA LISTA PESSOAL</span><h1>Produtos favoritos</h1><p>Favoritos são uma lista pessoal. Eles não entram na cesta inteligente nem no carrinho de uma loja.</p></div>
      <div className="fav-count"><Heart/><strong>{favorites.length}</strong><span>{favorites.length === 1 ? "produto salvo" : "produtos salvos"}</span></div>
    </header>

    <section className="fav-toolbar" aria-label="Ferramentas dos favoritos"><Search/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar nos meus favoritos" aria-label="Buscar nos favoritos"/><Link to="/buscar">Encontrar produtos</Link></section>

    {visible.length ? <section className="fav-grid">{visible.map(product => {
      const image = resolveProductImage(product);
      return <article className="fav-card" key={String(product.id)}>
        <Link className="fav-card__media" to={`/produto/${product.slug || product.id}`}>{image ? <img src={image} alt={product.name}/> : <PackageSearch/>}</Link>
        <div className="fav-card__body"><span>{[product.brand, product.size].filter(Boolean).join(" · ")}</span><Link to={`/produto/${product.slug || product.id}`}><h2>{product.name}</h2></Link><div className="fav-card__store"><Store/><span><strong>{product.establishment}</strong><small>{product.neighborhood || "Feijó, AC"}</small></span></div><div className="fav-card__price"><small>Menor preço encontrado</small><strong>{money(product.minPrice)}</strong></div><div className="fav-card__actions"><Link to={`/produto/${product.slug || product.id}`}>Comparar preços</Link><button type="button" onClick={() => void toggleFavorite(product.id, "/favoritos")}><Trash2/> Remover</button></div></div>
      </article>;
    })}</section> : <section className="fav-empty"><div><ShoppingBasket/></div><h2>{query ? "Nenhum favorito corresponde à busca" : "Sua lista de favoritos está vazia"}</h2><p>{query ? "Tente outro nome, marca ou estabelecimento." : "Use o coração nos produtos que deseja acompanhar. A cesta inteligente e o carrinho de compra continuam separados."}</p><Link to="/buscar">Explorar produtos</Link></section>}
  </main>;
}
