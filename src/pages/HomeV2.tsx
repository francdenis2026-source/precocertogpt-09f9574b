import "./HomeV2.css";

export function HomeV2() {
  return (
    <main className="home-v2">
      <section className="home-v2-hero">
        <div className="home-v2-copy">
          <span className="home-v2-badge">PreçoCerto IA</span>
          <h1>Compare preços. Economize em cada compra.</h1>
          <p>
            Encontre os melhores preços dos comércios da sua cidade e monte
            compras mais inteligentes.
          </p>

          <div className="home-v2-search">
            🔎 Digite um produto ou monte sua cesta
          </div>

          <div className="home-v2-actions">
            <button>Comparar preços</button>
            <button className="secondary">Criar cesta com IA</button>
          </div>

          <div className="home-v2-stats">
            <span>2.262 produtos</span>
            <span>Lojas locais</span>
            <span>Economia inteligente</span>
          </div>
        </div>

        <div className="home-v2-visual">
          <div className="home-v2-image-placeholder">
            Supermercado inteligente
          </div>
        </div>
      </section>

      <section className="home-v2-ai">
        <h2>Seu assistente de economia</h2>
        <p>Informe seu orçamento e encontre a melhor combinação de produtos.</p>
      </section>
    </main>
  );
}
