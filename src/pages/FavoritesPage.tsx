import { useState, useMemo } from "react";
import { Heart, Trash2, ShoppingBasket, ArrowLeft, Plus, Search, PackageSearch, Sparkles } from "lucide-react";
import { Product } from "../data/catalog";
import { money } from "../lib/pricing";

interface FavoritesPageProps {
  favorites: string[];
  products: Product[];
  onToggleFavorite: (productId: string) => void;
  onAddToBasket: (product: Product) => void;
}

export function FavoritesPage({ favorites, products, onToggleFavorite, onAddToBasket }: FavoritesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const favoriteProducts = useMemo(() => {
    const favSet = new Set(favorites);
    return products.filter(p => favSet.has(String(p.id)));
  }, [favorites, products]);

  const filteredFavorites = useMemo(() => {
    if (!searchQuery.trim()) return favoriteProducts;
    const q = searchQuery.toLowerCase();
    return favoriteProducts.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }, [favoriteProducts, searchQuery]);

  return (
    <main className="favorites-page shell py-12">
      <header className="mb-10">
        <div className="flex items-center gap-2 text-muted mb-4">
          <a href="/" className="hover:text-main flex items-center gap-1 transition-colors">
            <ArrowLeft size={16} /> Voltar ao início
          </a>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
              <Heart className="text-red-500 fill-current" size={32} />
              Meus Favoritos
            </h1>
            <p className="text-lg text-muted">
              {favoriteProducts.length === 0 
                ? "Você ainda não salvou nenhum produto." 
                : `Você tem ${favoriteProducts.length} ${favoriteProducts.length === 1 ? 'produto salvo' : 'produtos salvos'} para acompanhar.`}
            </p>
          </div>

          {favoriteProducts.length > 0 && (
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input 
                type="text"
                placeholder="Filtrar favoritos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface focus:border-green outline-none transition-all"
              />
            </div>
          )}
        </div>
      </header>

      {favoriteProducts.length === 0 ? (
        <div className="favorites-empty flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed border-border rounded-3xl bg-surface/50">
          <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center mb-6 text-muted">
            <Heart size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-center">Sua lista está vazia</h2>
          <p className="text-muted text-center max-w-md mb-8">
            Adicione produtos aos seus favoritos para acompanhar variações de preço e encontrá-los rapidamente quando precisar montar sua cesta.
          </p>
          <a href="/buscar" className="button button--primary px-8">
            Explorar produtos <Sparkles size={18} className="ml-2" />
          </a>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="py-20 text-center bg-surface rounded-2xl border border-border">
          <PackageSearch size={48} className="mx-auto text-muted mb-4 opacity-20" />
          <p className="text-lg font-medium text-muted">Nenhum favorito encontrado para "{searchQuery}"</p>
          <button onClick={() => setSearchQuery("")} className="text-green font-bold mt-2 hover:underline">
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="favorites-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map(product => (
            <div key={product.id} className="favorite-card group relative overflow-hidden flex flex-col p-5 bg-surface border border-border rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex gap-4 mb-4">
                <div className="w-24 h-24 bg-surface-2 rounded-xl overflow-hidden flex-shrink-0 border border-border/50 group-hover:scale-105 transition-transform">
                  <img 
                    src={product.image_url || "/placeholder-product.png"} 
                    alt={product.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted opacity-80">{product.brand}</span>
                    <button 
                      onClick={() => onToggleFavorite(String(product.id))}
                      className="text-red-500/30 hover:text-red-500 transition-colors p-1"
                      title="Remover dos favoritos"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-1 truncate group-hover:text-green transition-colors">{product.name}</h3>
                  <p className="text-sm text-muted mb-2">{product.size} • {product.category}</p>
                  
                  <div className="flex items-baseline gap-2">
                    <strong className="text-2xl font-black text-main">{money(product.minPrice)}</strong>
                    <span className="text-xs text-muted">em {product.establishment}</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 flex gap-3 border-t border-border/50">
                <button 
                  onClick={() => onAddToBasket(product)}
                  className="flex-1 button button--primary py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm"
                >
                  <Plus size={16} /> Adicionar à cesta
                </button>
                <a 
                  href={`/buscar?q=${encodeURIComponent(product.name)}`}
                  className="button button--ghost py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm px-4"
                >
                  Comparar
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {favoriteProducts.length > 0 && (
        <section className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-green/5 to-blue/5 border border-green/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <ShoppingBasket className="text-green" />
              Pronto para economizar?
            </h3>
            <p className="text-muted max-w-md">
              Use seus produtos favoritos para criar uma cesta inteligente e encontrar o menor preço total no comércio de Feijó.
            </p>
          </div>
          <a href="/cesta-basica" className="button button--primary px-10 py-4 text-lg shadow-lg shadow-green/20">
            Ir para Cesta Inteligente
          </a>
        </section>
      )}
    </main>
  );
}
