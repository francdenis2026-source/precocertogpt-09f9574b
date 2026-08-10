import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  Copy,
  ExternalLink,
  MapPin,
  MessageCircle,
  PackageCheck,
  Share2,
  Sparkles,
  Truck,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type ExternalStore = { label: string; url: string };
type Book = {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  description: string | null;
  isbn: string | null;
  external_url: string | null;
  price: number;
  promotional_price: number | null;
  price_on_request: boolean;
  available: boolean;
};
type Profile = {
  establishment: { id: string; slug: string; name: string; neighborhood: string | null; brand_color: string | null; verified: boolean };
  merchant: {
    id: string;
    name: string;
    phone: string | null;
    address: any;
    delivery_enabled: boolean;
    pickup_enabled: boolean;
    direct_sales_enabled: boolean;
    whatsapp: string | null;
    hero_title: string | null;
    hero_subtitle: string | null;
    author_name: string | null;
    author_bio: string | null;
    author_birthplace: string | null;
    direct_sale_note: string | null;
    external_stores: ExternalStore[];
    online_checkout_enabled: boolean;
  };
  books: Book[];
};

const coverThemes: Record<string, { bg: string; accent: string; eyebrow: string }> = {
  "mente-perversa": { bg: "linear-gradient(145deg,#170d23,#4c1d3f 62%,#c75b7e)", accent: "#f3c4d3", eyebrow: "ROMANCE · FICÇÃO" },
  "uma-historia-de-superacao": { bg: "linear-gradient(145deg,#1d2d44,#355070 60%,#e09f3e)", accent: "#ffe2ae", eyebrow: "TRAJETÓRIA · SUPERAÇÃO" },
  "uma-viagem-ao-mundo-da-imaginacao": { bg: "linear-gradient(145deg,#12372a,#436850 58%,#adbc9f)", accent: "#e9f5df", eyebrow: "FÁBULAS · IMAGINAÇÃO" },
  "despertar-para-o-mundo-literario": { bg: "linear-gradient(145deg,#231942,#5e548e 58%,#be95c4)", accent: "#f2ddf4", eyebrow: "LEITURA · LITERATURA" },
};

const heroPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='760' height='520' viewBox='0 0 760 520'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='.07' stroke-width='2'%3E%3Cpath d='M70 430h520M110 430V145h58v285M177 430V100h44v330M231 430V178h62v252M304 430V126h50v304M365 430V190h72v240M447 430V82h48v348M508 430V150h68v280'/%3E%3Cpath d='M600 110c42 28 63 75 55 126-8 52-41 91-91 116M624 84c61 39 91 102 79 171-12 68-56 120-123 151'/%3E%3C/g%3E%3C/svg%3E")`;

function cleanPhone(value?: string | null) {
  return (value || "").replace(/\D/g, "");
}

function whatsappUrl(phone: string, book?: string) {
  const msg = book
    ? `Olá, Dorinha! Encontrei o livro “${book}” no PreçoCerto e gostaria de saber o valor, a disponibilidade e como posso comprar diretamente com você.`
    : "Olá, Dorinha! Encontrei sua loja de livros no PreçoCerto e gostaria de informações para comprar diretamente com você.";
  return `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(msg)}`;
}

export function DorinhaAuthorStore() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Dorinha Barroso · Livros | PreçoCerto Marketplace Local";
    void (async () => {
      if (!supabase) { setLoading(false); return; }
      const { data } = await supabase.rpc("author_store_public_profile", { _slug: "dorinha-barroso-livros" });
      setProfile((data || null) as Profile | null);
      setLoading(false);
    })();
  }, []);

  const whatsapp = profile?.merchant.whatsapp || "5568999564762";
  const address = useMemo(() => {
    const a = profile?.merchant.address || {};
    return [a.street, a.number && `nº ${a.number}`, a.neighborhood, a.city && `${a.city}-${a.state}`, a.postal_code && `CEP ${a.postal_code}`].filter(Boolean).join(", ");
  }, [profile]);

  async function sharePage() {
    const shareUrl = window.location.origin + window.location.pathname;
    const data = { 
      title: "Dorinha Barroso · Livros", 
      text: "Conheça os livros de Dorinha Barroso e compre diretamente com a autora pelo PreçoCerto.", 
      url: shareUrl 
    };
    if (navigator.share) { try { await navigator.share(data); return; } catch { /* cancelado */ } }
    await navigator.clipboard?.writeText(shareUrl);
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  }

  if (loading) return <main style={s.loading}><BookOpen size={36}/><strong>Preparando a biblioteca da autora…</strong></main>;
  if (!profile) return <main style={s.loading}><BookOpen size={36}/><h1>Loja da autora indisponível</h1><a href="/estabelecimentos">Voltar aos estabelecimentos</a></main>;

  const external = profile.merchant.external_stores || [];

  return <main style={s.page} className="db-author-page">
    <style>{`
      .db-author-page{padding-top:0!important}
      .db-hero-grid{display:grid;grid-template-columns:minmax(0,.94fr) minmax(400px,1.06fr);gap:clamp(24px,4vw,54px);align-items:center}
      .db-hero-copy{position:relative;padding-left:22px}
      .db-hero-copy:before{content:"";position:absolute;left:0;top:4px;width:2px;height:88px;border-radius:9px;background:linear-gradient(#f4dba9,rgba(244,219,169,0));box-shadow:0 0 24px rgba(231,199,141,.28)}
      .db-hero-title{font-size:clamp(2.85rem,5vw,4.45rem);line-height:.9;letter-spacing:-.06em;margin:11px 0 14px;max-width:680px;text-shadow:0 15px 44px rgba(0,0,0,.25)}
      .db-hero-title em{font-style:normal;color:#e7c78d}
      .db-hero-art{position:relative;min-height:350px;display:grid;place-items:center;isolation:isolate}
      .db-cover-stage{position:relative;width:min(100%,550px);height:335px;perspective:1000px}
      .db-hero-cover{position:absolute;display:block;width:150px;height:228px;object-fit:contain;border-radius:3px 9px 9px 3px;filter:drop-shadow(0 22px 22px rgba(18,6,22,.52));transform-origin:50% 100%;transition:transform .45s cubic-bezier(0.34, 1.56, 0.64, 1),filter .45s ease}
      .db-hero-cover:nth-child(1){left:5%;bottom:24px;transform:rotateY(-25deg) rotateX(5deg) rotateZ(-13deg) translateY(15px);z-index:1}
      .db-hero-cover:nth-child(2){left:29%;bottom:49px;transform:rotateY(-15deg) rotateX(5deg) rotateZ(-4deg);z-index:3}
      .db-hero-cover:nth-child(3){right:24%;bottom:44px;transform:rotateY(15deg) rotateX(5deg) rotateZ(5deg);z-index:4}
      .db-hero-cover:nth-child(4){right:0;bottom:19px;transform:rotateY(25deg) rotateX(5deg) rotateZ(13deg) translateY(18px);z-index:2}
      .db-cover-stage:hover .db-hero-cover:nth-child(1){transform:rotateY(-30deg) rotateZ(-15deg) translate(-10px,5px) scale(1.05)}
      .db-cover-stage:hover .db-hero-cover:nth-child(2){transform:rotateY(-18deg) rotateZ(-5deg) translateY(-15px) scale(1.08)}
      .db-cover-stage:hover .db-hero-cover:nth-child(3){transform:rotateY(18deg) rotateZ(6deg) translateY(-18px) scale(1.08)}
      .db-cover-stage:hover .db-hero-cover:nth-child(4){transform:rotateY(30deg) rotateZ(15deg) translate(10px,7px) scale(1.05)}
      .db-stage-glow{position:absolute;left:8%;right:5%;bottom:2%;height:35%;border-radius:50%;background:radial-gradient(ellipse,rgba(238,202,128,.42),transparent 69%);filter:blur(22px);z-index:-1}
      .db-stage-note{position:absolute;right:2%;top:10px;max-width:178px;padding:11px 13px;border:1px solid rgba(255,255,255,.25);border-radius:14px;background:rgba(36,17,42,.68);backdrop-filter:blur(16px);color:#f2e8ef;font-size:10px;line-height:1.45;box-shadow:0 14px 36px rgba(0,0,0,.24)}
      .db-stage-note b{display:block;color:#f0d398;font-size:11px;margin-bottom:3px}
      .db-top-label a{color:inherit;text-decoration:none;transition:color .18s ease}
      .db-top-label a:hover{color:#35233f}
      .db-book-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
      .db-about-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(290px,.65fr);gap:22px}
      .db-author-portrait-card{position:relative;min-height:420px;overflow:hidden;border-radius:18px;background:#36213f;box-shadow:0 24px 55px rgba(9,4,13,.28)}
      .db-author-portrait-card img{width:100%;height:100%;position:absolute;inset:0;object-fit:cover;object-position:center 25%}
      .db-author-portrait-card figcaption{position:absolute;left:14px;right:14px;bottom:14px;padding:12px 14px;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:rgba(25,13,30,.76);backdrop-filter:blur(12px);display:grid;color:white}
      .db-author-portrait-card figcaption strong{font-family:Georgia,serif;font-size:17px}
      .db-author-portrait-card figcaption span{margin-top:2px;color:#e6c889;font-size:9px;font-weight:850;letter-spacing:.11em}
      .db-contact-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:18px}
      #contato .db-contact-grid{padding-top:32px;padding-bottom:32px;align-items:center}
      #contato .db-contact-grid h2{font-size:clamp(1.75rem,3.2vw,2.45rem);max-width:620px}
      .db-external-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      .db-action:hover{transform:translateY(-2px)}
      .db-book:hover{transform:translateY(-8px);box-shadow:0 30px 60px rgba(29,18,44,0.18);border-color:rgba(180,120,200,0.3)}
      .db-book:hover .db-cover-title{transform: scale(1.02); text-shadow: 0 4px 12px rgba(0,0,0,0.3)}
      .db-book .db-cover{transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)}
      .db-book:hover .db-cover{transform: scale(1.02)}

      @media(max-width:1050px){.db-hero-grid{grid-template-columns:minmax(0,1fr) minmax(330px,.82fr);gap:18px}.db-cover-stage{transform:scale(.85)}.db-book-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.db-about-grid,.db-contact-grid{grid-template-columns:1fr}.db-author-portrait-card{min-height:470px}.db-external-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:790px){.db-hero-grid{grid-template-columns:1fr}.db-hero-art{min-height:320px;margin-top:-24px}.db-cover-stage{height:330px;transform:scale(.78)}.db-stage-note{display:none}.db-hero-copy{text-align:center;padding-left:0}.db-hero-copy:before{display:none}.db-hero-copy .db-hero-actions,.db-hero-copy [data-hero-badges],.db-hero-copy [data-hero-foot]{justify-content:center}}
      @media(max-width:640px){.db-book-grid,.db-external-grid{grid-template-columns:1fr}.db-hero-title{font-size:clamp(2.55rem,14vw,3.65rem)}.db-top-label,.db-icon-label{display:none}.db-hero-actions{display:grid!important}.db-hero-actions>*{width:100%;justify-content:center}.db-section{padding-left:18px!important;padding-right:18px!important}.db-contact-actions{display:grid!important}.db-contact-actions>*{width:100%;justify-content:center}.db-hero-art{min-height:245px;margin-top:-36px}.db-cover-stage{height:275px;transform:scale(.62)}.db-about-facts{grid-template-columns:1fr!important}.db-author-portrait-card{min-height:390px}.db-section-head{align-items:flex-start!important}.db-catalog-count{display:none!important}}
    `}</style>

    <header style={s.topbar}>
      <a href="/" style={s.brand}><span style={s.brandMark}>P</span><span><b>PreçoCerto</b><small>Marketplace Local</small></span></a>
      <nav className="db-top-label" style={s.topNav} aria-label="Navegação da autora"><a href="#livros">Livros</a><a href="#autora">A autora</a><a href="#contato">Contato</a></nav>
      <div style={s.topActions}>
        <button onClick={sharePage} style={s.iconButton} aria-label="Compartilhar página">{copied?<Check size={17}/>:<Share2 size={17}/>}<span className="db-icon-label">{copied?"Link copiado":"Compartilhar"}</span></button>
        <a href={whatsappUrl(whatsapp)} target="_blank" rel="noreferrer" style={s.topWhats}><MessageCircle size={17}/> Falar com a autora</a>
      </div>
    </header>

    <section style={{...s.hero,backgroundImage:`linear-gradient(90deg,rgba(15,7,20,.76) 0%,rgba(28,10,29,.28) 48%,rgba(35,13,31,.08) 100%),url('/dorinha-hero-art-v2.webp'),${heroPattern}`}}>
      <div style={s.heroGlow}/>
      <div style={s.heroInner} className="db-section db-hero-grid">
        <div className="db-hero-copy">
          <div style={s.heroBadges} data-hero-badges>
            {profile.establishment.verified&&<span style={s.verified}><BadgeCheck size={14}/> Autora verificada</span>}
            <span style={s.directBadge}><Sparkles size={14}/> Literatura acreana</span>
          </div>
          <h1 className="db-hero-title">Dorinha<br/><em>Barroso</em></h1>
          <p style={s.heroLead}>{profile.merchant.hero_title || "Histórias que nascem no Acre e encontram leitores em todo o Brasil."}</p>
          <p style={s.heroText}>Escritora, professora e educadora de Feijó. Conheça suas obras e compre diretamente com a autora.</p>
          <div style={s.heroActions} className="db-hero-actions">
            <a href="#livros" style={s.heroPrimary} className="db-action"><BookOpen size={18}/> Explorar as obras <ArrowRight size={17}/></a>
            <a href={whatsappUrl(whatsapp)} target="_blank" rel="noreferrer" style={s.heroSecondary} className="db-action"><MessageCircle size={18}/> Falar com Dorinha</a>
          </div>
          <div style={s.heroFoot} data-hero-foot>
            <span><MapPin size={15}/> Feijó · Acre</span>
            <span><PackageCheck size={15}/> Compra direta e segura</span>
          </div>
        </div>
        <div className="db-hero-art" aria-label="Coleção de livros de Dorinha Barroso">
          <div className="db-cover-stage">
            <div className="db-stage-glow"/>
            {profile.books.slice(0,4).map(book=>book.image_url?<img key={book.id} className="db-hero-cover" src={book.image_url} alt={`Capa de ${book.name}`}/>:null)}
            <div className="db-stage-note"><b>COLEÇÃO DA AUTORA</b>{profile.books.length} obras disponíveis para leitores de todo o Brasil.</div>
          </div>
        </div>
      </div>
    </section>

    <section id="livros" style={s.section} className="db-section">
      <div style={s.sectionHead} className="db-section-head">
        <div><span style={s.eyebrow}>OBRAS DE DORINHA BARROSO</span><h2 style={s.h2}>Uma autora. Diferentes caminhos de leitura.</h2><p style={s.sectionText}>Escolha uma obra para falar diretamente com Dorinha. Como os valores e a disponibilidade dos exemplares físicos podem mudar, o preço é confirmado no atendimento antes da compra.</p></div>
        <div style={s.catalogCount} className="db-catalog-count"><strong>{profile.books.length}</strong><span>títulos no catálogo</span></div>
      </div>
      <div className="db-book-grid">
        {profile.books.map((book,index)=>{const theme=coverThemes[book.slug]||coverThemes["despertar-para-o-mundo-literario"];return <article key={book.id} className="db-book" style={s.bookCard}>
          <div style={{...s.cover,background:theme.bg, position: 'relative', overflow: 'hidden'}}>
            <div style={{...s.coverGlow, position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)', pointerEvents: 'none'}} />
            <div style={{...s.coverTexture, position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`, pointerEvents: 'none'}} />
            <span style={{...s.coverEyebrow,color:theme.accent}}>{theme.eyebrow}</span>
            <div style={s.coverRule}/>
            <strong style={s.coverTitle}>{book.name}</strong>
            <span style={s.coverAuthor}>DORINHA BARROSO</span>
            <span style={s.coverIndex}>0{index+1}</span>
          </div>
          <div style={s.bookBody}>
            <div style={s.bookTop}><span style={s.bookType}>LIVRO</span>{book.available&&<span style={s.available}>Disponível para consulta</span>}</div>
            <h3 style={s.bookTitle}>{book.name}</h3>
            <p style={s.bookDescription}>{book.description}</p>
            {book.isbn&&<small style={s.isbn}>ISBN {book.isbn}</small>}
            <div style={s.bookPrice}><span>Venda direta</span><strong>{book.price_on_request?"Valor sob consulta":new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(book.promotional_price??book.price)}</strong></div>
            <div style={s.bookActions}>
              <a href={whatsappUrl(whatsapp,book.name)} target="_blank" rel="noreferrer" style={s.buyDirect}><MessageCircle size={16}/> Comprar direto</a>
              {book.external_url&&<a href={book.external_url} target="_blank" rel="noreferrer" style={s.externalBtn} title="Ver na Amazon"><ExternalLink size={16}/></a>}
            </div>
          </div>
        </article>})}
      </div>
    </section>

    <section id="autora" style={s.aboutWrap}>
      <div style={s.section} className="db-section db-about-grid">
        <article style={s.aboutMain}>
          <span style={s.eyebrowGold}>A AUTORA</span>
          <h2 style={{...s.h2,color:"white",maxWidth:760}}>Da infância em Feijó a uma vida dedicada à leitura, à educação e à escrita.</h2>
          <p style={s.aboutText}>Maria das Dores Fernandes Barroso, conhecida como <strong>Dorinha Barroso</strong>, nasceu em Feijó, no Acre. Alfabetizada ainda criança por sua irmã, desenvolveu muito cedo uma relação intensa com os livros. Formou-se em História pela Universidade Federal do Acre (UFAC), licenciou-se em Pedagogia e realizou pós-graduação em Psicopedagogia e Gestão Pública.</p>
          <p style={s.aboutText}>Como professora das redes municipal e estadual, levou para a sala de aula o gosto pela leitura e pela produção de textos, poesias, contos e peças. Essa ligação entre educação, memória, imaginação e experiência de vida atravessa sua presença como escritora.</p>
          <div style={s.aboutFacts} className="db-about-facts"><span><b>Feijó</b><small>raízes acreanas</small></span><span><b>Educação</b><small>professora e pedagoga</small></span><span><b>Literatura</b><small>obras publicadas</small></span></div>
        </article>
        <figure className="db-author-portrait-card">
          <img src="/dorinha-author-portrait-v2.webp" alt="Dorinha Barroso segurando dois de seus livros"/>
          <figcaption><strong>Dorinha Barroso</strong><span>ESCRITORA · EDUCADORA · ACREANA</span></figcaption>
        </figure>
      </div>
    </section>

    <section style={s.section} className="db-section">
      <div style={s.sectionHead}><div><span style={s.eyebrow}>TAMBÉM DISPONÍVEL ONLINE</span><h2 style={s.h2}>Prefere comprar em outra plataforma?</h2><p style={s.sectionText}>Sem problema. O PreçoCerto também ajuda você a encontrar os canais digitais onde a obra da autora está disponível.</p></div></div>
      <div className="db-external-grid">
        {external.map((store)=><a key={store.url} href={store.url} target="_blank" rel="noreferrer" style={s.externalCard} className="db-action"><span><ExternalLink size={17}/></span><div><strong>{store.label}</strong><small>Abrir loja externa</small></div><ArrowRight size={16}/></a>)}
      </div>
      <p style={s.sourceNote}>A disponibilidade, o formato e os valores praticados em lojas externas são definidos pelas próprias plataformas e podem mudar sem aviso.</p>
    </section>

    <section id="contato" style={s.contactWrap}>
      <div style={s.section} className="db-section db-contact-grid">
        <div>
          <span style={s.eyebrowGold}>COMPRA DIRETA</span><h2 style={{...s.h2,color:"white"}}>Quer um exemplar? Fale diretamente com Dorinha.</h2><p style={s.contactText}>A venda direta aproxima o leitor da autora. Confirme edição, disponibilidade, valor, retirada ou forma de entrega antes de concluir o pedido.</p>
          <div style={s.contactActions} className="db-contact-actions"><a href={whatsappUrl(whatsapp)} target="_blank" rel="noreferrer" style={s.contactPrimary}><MessageCircle size={19}/> Iniciar conversa no WhatsApp</a><button onClick={sharePage} style={s.contactSecondary}>{copied?<Check size={18}/>:<Copy size={18}/>} {copied?"Link copiado":"Compartilhar loja"}</button></div>
        </div>
        <aside style={s.contactCard}>
          <span style={s.contactLabel}>ATENDIMENTO DA AUTORA</span><strong style={s.phone}>{profile.merchant.phone}</strong>
          <div style={s.contactLine}><MapPin size={18}/><span><b>Endereço para referência</b><small>{address}</small></span></div>
          <div style={s.contactLine}><Truck size={18}/><span><b>Entrega e retirada</b><small>Condições combinadas diretamente no atendimento.</small></span></div>
          <div style={s.secureNote}><BadgeCheck size={16}/><span>Perfil verificado no PreçoCerto Marketplace Local.</span></div>
        </aside>
      </div>
    </section>

    <footer style={s.footer}><div><a href="/" style={s.footerBrand}>PreçoCerto</a><span>Marketplace Local</span></div><div><a href="/estabelecimentos">Estabelecimentos</a><a href="/">Comparar preços</a><a href="/lojista">Para negócios locais</a></div><small>© 2026 PreçoCerto · Espaço literário de Dorinha Barroso.</small></footer>
  </main>;
}

const s: Record<string, React.CSSProperties> = {
  page:{minHeight:"100vh",background:"#f6f3ee",color:"#201b28",fontFamily:"Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"},
  loading:{minHeight:"100vh",display:"grid",placeItems:"center",alignContent:"center",gap:12,background:"#f6f3ee",color:"#322642"},
  topbar:{height:58,padding:"0 clamp(14px,4vw,58px)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:18,background:"rgba(250,248,244,.96)",backdropFilter:"blur(18px)",borderBottom:"1px solid rgba(64,44,77,.10)",position:"sticky",top:0,zIndex:30,boxShadow:"0 8px 30px rgba(31,18,41,.04)"},
  brand:{display:"flex",alignItems:"center",gap:8,textDecoration:"none",color:"#261b30"},brandMark:{width:30,height:30,borderRadius:9,display:"grid",placeItems:"center",background:"linear-gradient(145deg,#3e2750,#23162d)",color:"#f1d6a6",fontWeight:950},topNav:{display:"flex",alignItems:"center",gap:25,fontSize:11,fontWeight:800,color:"#716577"},topActions:{display:"flex",alignItems:"center",gap:7},iconButton:{height:36,border:"1px solid #ddd4df",background:"white",borderRadius:9,padding:"0 11px",display:"inline-flex",alignItems:"center",gap:6,cursor:"pointer",fontWeight:750,color:"#3d3242"},topWhats:{height:36,borderRadius:9,padding:"0 12px",display:"inline-flex",alignItems:"center",gap:6,background:"#2e1b38",color:"white",textDecoration:"none",fontWeight:800,fontSize:11},
  hero:{minHeight:440,position:"relative",backgroundSize:"cover,cover,760px 520px",backgroundPosition:"center,center,right 4% center",backgroundRepeat:"no-repeat",overflow:"hidden",color:"white",borderBottom:"1px solid rgba(231,199,141,.18)"},heroGlow:{position:"absolute",width:440,height:440,borderRadius:"50%",background:"rgba(218,173,103,.14)",filter:"blur(90px)",right:"4%",top:"-5%"},heroInner:{position:"relative",zIndex:2,maxWidth:1180,margin:"0 auto",padding:"27px 24px 25px"},heroBadges:{display:"flex",flexWrap:"wrap",gap:7},verified:{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 8px",borderRadius:999,background:"rgba(137,192,255,.12)",border:"1px solid rgba(159,205,255,.22)",color:"#cce5ff",fontSize:9,fontWeight:850},directBadge:{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 8px",borderRadius:999,background:"rgba(231,199,141,.12)",border:"1px solid rgba(231,199,141,.28)",color:"#f4dba9",fontSize:9,fontWeight:850},localBadge:{padding:"7px 9px",borderRadius:999,border:"1px solid rgba(255,255,255,.14)",color:"#c9bfcd",fontSize:11,fontWeight:750},heroLead:{maxWidth:580,fontFamily:"Georgia,serif",fontSize:"clamp(1.05rem,1.7vw,1.4rem)",lineHeight:1.32,color:"#f1e5d1",margin:"0 0 8px"},heroText:{maxWidth:540,color:"#cabfd0",fontSize:12,lineHeight:1.55},heroActions:{display:"flex",flexWrap:"wrap",gap:8,marginTop:17},heroPrimary:{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:9,background:"linear-gradient(135deg,#efd59e,#d9b873)",color:"#281b30",fontWeight:900,textDecoration:"none",transition:".2s ease",boxShadow:"0 12px 28px rgba(0,0,0,.2)"},heroSecondary:{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:9,background:"rgba(255,255,255,.96)",color:"#2c2034",fontWeight:850,textDecoration:"none",transition:".2s ease"},heroGhost:{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 15px",borderRadius:10,border:"1px solid rgba(255,255,255,.18)",background:"rgba(255,255,255,.04)",color:"white",fontWeight:800,cursor:"pointer",transition:".2s ease"},heroFoot:{display:"flex",flexWrap:"wrap",gap:16,marginTop:17,color:"#b8abbf",fontSize:10},
  section:{maxWidth:1180,margin:"0 auto",padding:"50px 24px"},sectionHead:{display:"flex",justifyContent:"space-between",alignItems:"end",gap:24,marginBottom:22},eyebrow:{display:"block",color:"#725481",fontSize:9,fontWeight:950,letterSpacing:".16em",marginBottom:7},eyebrowGold:{display:"block",color:"#e6c889",fontSize:9,fontWeight:950,letterSpacing:".16em",marginBottom:7},h2:{fontFamily:"Georgia,serif",fontSize:"clamp(1.75rem,3.5vw,2.7rem)",lineHeight:1.06,letterSpacing:"-.035em",margin:"0 0 11px",fontWeight:700},sectionText:{maxWidth:720,color:"#756b79",fontSize:13,lineHeight:1.65},catalogCount:{minWidth:112,padding:12,border:"1px solid #e3dce2",borderRadius:12,background:"#fff",display:"grid",textAlign:"center",boxShadow:"0 10px 28px rgba(44,26,49,.05)"},
  bookCard:{background:"white",border:"1px solid #e8e0e6",borderRadius:15,overflow:"hidden",transition:".25s ease",display:"flex",flexDirection:"column"},cover:{height:250,position:"relative",padding:"22px 19px",display:"flex",flexDirection:"column",overflow:"hidden",color:"white"},coverEyebrow:{fontSize:8,fontWeight:950,letterSpacing:".16em"},coverRule:{height:1,width:44,background:"rgba(255,255,255,.42)",margin:"14px 0 auto"},coverTitle:{fontFamily:"Georgia,serif",fontSize:"clamp(1.45rem,2.2vw,2.05rem)",lineHeight:1.03,letterSpacing:"-.03em",maxWidth:200},coverAuthor:{marginTop:13,fontSize:8,fontWeight:900,letterSpacing:".18em",opacity:.78},coverIndex:{position:"absolute",right:15,bottom:9,fontSize:46,fontWeight:950,opacity:.07},bookBody:{padding:15,display:"flex",flexDirection:"column",flex:1},bookTop:{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center"},bookType:{fontSize:8,fontWeight:950,letterSpacing:".14em",color:"#87778c"},available:{fontSize:8,fontWeight:800,color:"#39704d",background:"#edf8f0",borderRadius:999,padding:"4px 6px"},bookTitle:{fontFamily:"Georgia,serif",fontSize:18,lineHeight:1.15,margin:"10px 0 7px"},bookDescription:{fontSize:11,color:"#756b78",lineHeight:1.55,minHeight:66},isbn:{color:"#9b919d",fontSize:9},bookPrice:{marginTop:"auto",padding:"13px 0 11px",display:"grid",gap:2,borderTop:"1px solid #eee8ed"},bookActions:{display:"grid",gridTemplateColumns:"1fr 38px",gap:6},buyDirect:{minHeight:38,borderRadius:9,background:"#34203f",color:"white",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontWeight:850,fontSize:11},externalBtn:{minHeight:38,borderRadius:9,border:"1px solid #dfd7df",display:"grid",placeItems:"center",color:"#493c4e"},
  aboutWrap:{background:"#201629"},aboutMain:{padding:"8px 0"},aboutText:{color:"#cbbfd0",fontSize:14,lineHeight:1.85,maxWidth:780},aboutFacts:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:27},quoteCard:{background:"#f0d8aa",color:"#2a1b30",borderRadius:20,padding:"32px 28px",position:"relative",alignSelf:"stretch",display:"flex",flexDirection:"column",justifyContent:"center"},quoteMark:{fontFamily:"Georgia,serif",fontSize:70,lineHeight:.6,opacity:.3,marginTop:28},
  externalCard:{background:"white",border:"1px solid #e5dde4",borderRadius:13,padding:15,display:"grid",gridTemplateColumns:"40px 1fr auto",gap:10,alignItems:"center",color:"#36283c",textDecoration:"none",transition:".2s ease"},sourceNote:{fontSize:10,color:"#9b919d",marginTop:16},
  contactWrap:{background:"linear-gradient(135deg,#382544,#25182f)"},contactText:{color:"#c9bdcc",fontSize:13,lineHeight:1.6,maxWidth:620},contactActions:{display:"flex",gap:8,marginTop:17},contactPrimary:{display:"inline-flex",alignItems:"center",gap:7,padding:"11px 14px",borderRadius:9,background:"#e6c889",color:"#281b30",fontWeight:900,textDecoration:"none",fontSize:12},contactSecondary:{display:"inline-flex",alignItems:"center",gap:7,padding:"11px 14px",borderRadius:9,border:"1px solid rgba(255,255,255,.17)",background:"transparent",color:"white",fontWeight:850,cursor:"pointer",fontSize:12},contactCard:{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",borderRadius:15,padding:"17px 20px",color:"white"},contactLabel:{fontSize:8,fontWeight:950,letterSpacing:".14em",color:"#d8c9dd"},phone:{display:"block",fontFamily:"Georgia,serif",fontSize:23,margin:"5px 0 14px"},contactLine:{display:"flex",gap:9,padding:"10px 0",borderTop:"1px solid rgba(255,255,255,.09)",fontSize:12},secureNote:{display:"flex",gap:7,alignItems:"center",marginTop:9,padding:9,borderRadius:9,background:"rgba(231,199,141,.10)",color:"#edd6a9",fontSize:9},
  footer:{padding:"30px clamp(18px,4vw,58px)",display:"grid",gridTemplateColumns:"1fr auto auto",gap:25,alignItems:"center",background:"#17121c",color:"#a99eae",fontSize:11},footerBrand:{fontSize:18,fontWeight:950,color:"white",textDecoration:"none"},
};
