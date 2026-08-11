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
  Play,
  Share2,
  Sparkles,
  Truck,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import imagimacaoAsset from "../assets/uma-viagem-ao-mundo-da-imaginacao.png.asset.json";
import mentePerversaAsset from "../assets/mente-perversa.png.asset.json";
import superacaoAsset from "../assets/uma-historia-de-superacao.png.asset.json";
import despertarAsset from "../assets/o-despertar-para-o-mundo-literario.png.asset.json";

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

const heroPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='760' height='520' viewBox='0 0 760 520'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='.07' stroke-width='2'%3E%3Cpath d='M70 430h520M110 430V145h58v285M177 430V100h44v330M231 430V178h62v252M304 430V126h50v304M365 430V190h72v240M447 430V82h48v348M508 430V150h68v280'/%3E%3Cpath d='M600 110c42 28 63 75 55 126-8 52-41 91-91 116M624 84c61 39 91 102 79 171-12 68-56 120-123 151'/%3E%3C/g%3E%3C/svg%3E")`;
const heroPlaceholder="url('data:image/webp;base64,UklGRpoAAABXRUJQVlA4II4AAACwBQCdASowACAAPsFKnUynq6KiOrzIAXAYCWMAyrRu4o5HIXyuAJIgs/OYdswYQSgqvCIg/3AA/vZ7frHfIZ4qW/PgOEW5IdNqlT7HZ4b9mFYeQN7SHSgdkgiL6UF9o4kBuax0ikW0AmknuWr2oZwhMSRaDJLaekuudLgorcj/r33f+bfEJCchpeLqkAAA')";

function cleanPhone(value?: string | null) {
  return (value || "").replace(/\D/g, "");
}

function responsiveCoverSrcSet(url:string){
  const marker="/storage/v1/object/public/";
  if(!url.includes(marker))return undefined;
  const renderUrl=url.replace(marker,"/storage/v1/render/image/public/");
  return [320,480,640].map(width=>`${renderUrl}${renderUrl.includes("?")?"&":"?"}width=${width}&quality=82 ${width}w`).join(", ");
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
  const [loadedCovers,setLoadedCovers]=useState<Set<string>>(()=>new Set());

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

  const external = useMemo(() => {
    return (profile.merchant.external_stores || [])
      .filter(s => s.label !== 'Apple Books')
      .sort((a, b) => {
        // Prioritize Amazon, but could be expanded if availability data existed
        if (a.label.toLowerCase().includes('amazon')) return -1;
        if (b.label.toLowerCase().includes('amazon')) return 1;
        return a.label.localeCompare(b.label);
      });
  }, [profile.merchant.external_stores]);

  return <main style={s.page} className="db-author-page">
    <style>{`
      .db-author-page{--db-display:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;--db-body:"Inter Variable",Inter,system-ui,-apple-system,"Segoe UI",sans-serif;padding-top:0!important;font-family:var(--db-body);font-size:16px;line-height:1.65;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}
      .db-author-page h1,.db-author-page h2,.db-author-page h3{font-family:var(--db-display);font-weight:700;text-wrap:balance}
      .db-author-page p{letter-spacing:0}
      .db-author-page a,.db-author-page button{letter-spacing:0}
      .db-hero-grid{display:grid;grid-template-columns:minmax(0,.94fr) minmax(400px,1.06fr);gap:clamp(24px,4vw,54px);align-items:center}
      .db-hero-copy{position:relative;padding-left:22px}
      .db-hero-copy:before{content:"";position:absolute;left:0;top:4px;width:2px;height:88px;border-radius:9px;background:linear-gradient(#f4dba9,rgba(244,219,169,0));box-shadow:0 0 24px rgba(231,199,141,.28)}
      .db-hero-title{font-family:var(--db-display)!important;font-size:clamp(3rem,5vw,4.5rem);font-weight:700!important;line-height:.93;letter-spacing:-.042em;margin:12px 0 16px;max-width:680px;text-shadow:0 4px 28px rgba(0,0,0,.42)}
      .db-hero-title em{font-style:normal;color:#f3d79d}
      .db-hero-art{position:relative;min-height:350px;display:grid;place-items:center;isolation:isolate}
      .db-cover-stage{position:relative;width:min(100%,550px);height:335px}
      .db-hero-cover{position:absolute;display:block;width:150px;height:228px;object-fit:contain;border-radius:3px 9px 9px 3px;filter:drop-shadow(0 22px 22px rgba(18,6,22,.52));transform-origin:50% 100%;transition:transform .35s ease,filter .35s ease}
      .db-hero-cover:nth-child(1){left:5%;bottom:24px;transform:rotate(-13deg) translateY(15px);z-index:1}
      .db-hero-cover:nth-child(2){left:29%;bottom:49px;transform:rotate(-4deg);z-index:3}
      .db-hero-cover:nth-child(3){right:24%;bottom:44px;transform:rotate(5deg);z-index:4}
      .db-hero-cover:nth-child(4){right:0;bottom:19px;transform:rotate(13deg) translateY(18px);z-index:2}
      .db-cover-stage:hover .db-hero-cover:nth-child(1){transform:rotate(-15deg) translate(-6px,5px)}
      .db-cover-stage:hover .db-hero-cover:nth-child(2){transform:rotate(-5deg) translateY(-10px)}
      .db-cover-stage:hover .db-hero-cover:nth-child(3){transform:rotate(6deg) translateY(-12px)}
      .db-cover-stage:hover .db-hero-cover:nth-child(4){transform:rotate(15deg) translate(6px,7px)}
      .db-stage-glow{position:absolute;left:8%;right:5%;bottom:2%;height:35%;border-radius:50%;background:radial-gradient(ellipse,rgba(238,202,128,.42),transparent 69%);filter:blur(22px);z-index:-1}
      .db-stage-note{position:absolute;right:2%;top:10px;max-width:190px;padding:12px 14px;border:1px solid rgba(255,255,255,.28);border-radius:14px;background:rgba(29,12,34,.82);backdrop-filter:blur(16px);color:#fff7fb;font-size:12px;line-height:1.5;box-shadow:0 14px 36px rgba(0,0,0,.28)}
      .db-stage-note b{display:block;color:#f5d99f;font-size:11px;letter-spacing:.08em;margin-bottom:4px}
      .db-top-label a{color:inherit;text-decoration:none;transition:color .18s ease}
      .db-top-label a:hover{color:#35233f}
      .db-book-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;align-items:stretch}
      .db-real-cover-shell{position:relative;height:210px;display:grid;place-items:center;overflow:hidden;padding:14px;background:linear-gradient(145deg,#24102b 0%,#3a1d40 52%,#6c4a52 100%);isolation:isolate}
      .db-real-cover-shell:before{content:"";position:absolute;inset:auto -18% -50% 12%;height:88%;border-radius:50%;background:radial-gradient(ellipse,rgba(238,202,128,.34),transparent 68%);filter:blur(18px);z-index:-1}
      .db-real-cover-image{display:block;width:auto;max-width:82%;height:182px;object-fit:contain;border-radius:3px 7px 7px 3px;filter:drop-shadow(0 13px 13px rgba(12,5,16,.42));opacity:0;transition:opacity .25s ease,transform .3s ease}
      .db-real-cover-shell.is-loaded .db-real-cover-image{opacity:1}.db-real-cover-shell.is-loaded .db-cover-placeholder{display:none}
      .db-cover-placeholder{position:absolute;color:rgba(255,255,255,.72);font-size:11px}.db-real-cover-badge{position:absolute;right:9px;bottom:8px;padding:4px 6px;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:rgba(31,15,37,.72);color:#f6dfae;font-size:8px;font-weight:800;letter-spacing:.08em}
      .db-about-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(290px,.65fr);gap:22px}
      .db-about-facts span{display:grid;padding:12px 13px;border:1px solid rgba(255,255,255,.14);border-radius:11px;background:rgba(255,255,255,.06)}
      .db-about-facts b{color:#fff;font-family:var(--db-display);font-size:18px;font-weight:700}
      .db-about-facts small{margin-top:2px;color:#d9cedd;font-size:12px;line-height:1.4}
      .db-author-portrait-card{position:relative;min-height:420px;overflow:hidden;border-radius:18px;background:#36213f;box-shadow:0 24px 55px rgba(9,4,13,.28)}
      .db-author-portrait-card img{width:100%;height:100%;position:absolute;inset:0;object-fit:cover;object-position:center 25%}
      .db-author-portrait-card figcaption{position:absolute;left:14px;right:14px;bottom:14px;padding:12px 14px;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:rgba(25,13,30,.76);backdrop-filter:blur(12px);display:grid;color:white}
      .db-author-portrait-card figcaption strong{font-family:var(--db-display);font-size:20px}
      .db-author-portrait-card figcaption span{margin-top:3px;color:#f1d28f;font-size:11px;font-weight:750;letter-spacing:.09em}
      .db-video-grid{display:grid;grid-template-columns:minmax(240px,.62fr) minmax(0,1.38fr);gap:24px;align-items:center}
      .db-video-copy p{max-width:430px;margin:0;color:#665b69;font-size:15px;line-height:1.7}
      .db-video-frame{position:relative;aspect-ratio:16/9;overflow:hidden;border:1px solid #d8cbd8;border-radius:16px;background:linear-gradient(145deg,#211028,#3b1c42);box-shadow:0 20px 48px rgba(35,17,41,.16)}
      .db-video-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
      .db-video-link{display:inline-flex;align-items:center;gap:7px;margin-top:16px;padding:10px 13px;border:1px solid #d6cad7;border-radius:9px;background:#fff;color:#35243d;text-decoration:none;font-size:13px;font-weight:750}
      .db-contact-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:18px}
      #contato .db-contact-grid{padding-top:32px;padding-bottom:32px;align-items:center}
      #contato .db-contact-grid h2{font-size:clamp(1.75rem,3.2vw,2.45rem);max-width:620px}
      #contato .db-contact-grid h2{color:#fffafc}
      #contato .db-contact-grid small{color:#f0e8f2;font-size:12px;line-height:1.55}
      .db-external-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;width:100%}
      .db-external-empty{padding:48px 24px;border:2px dashed rgba(64,44,77,.2);border-radius:18px;text-align:center;background:rgba(255,255,255,.42);backdrop-filter:blur(8px);grid-column:1/-1}
      .db-external-empty h3{font-family:var(--db-display);font-size:22px;color:#35243d;margin-bottom:8px}
      .db-external-empty p{color:#6a5f6e;font-size:15px;max-width:440px;margin:0 auto 18px}
      .db-external-empty-cta{display:inline-flex;align-items:center;gap:8px;padding:12px 18px;background:#35243d;color:white;text-decoration:none;border-radius:9px;font-weight:750;font-size:14px;transition:transform .2s ease}
      .db-external-empty-cta:hover{transform:translateY(-2px)}
      .db-external-grid strong{font-size:14px}.db-external-grid small{font-size:12px;color:#6a5f6e}
      .db-book p{hyphens:auto}.db-book h3,.db-book p{overflow-wrap:anywhere}
      .db-book-description{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden}
      .db-book-price strong{font-variant-numeric:tabular-nums}
      .db-action:hover{transform:translateY(-2px)}
      .db-book:hover{transform:translateY(-5px);box-shadow:0 22px 60px rgba(29,18,44,.12)}
      @media(max-width:1050px){.db-hero-grid{grid-template-columns:minmax(0,1fr) minmax(330px,.82fr);gap:18px}.db-cover-stage{transform:scale(.85)}.db-book-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.db-about-grid,.db-contact-grid{grid-template-columns:1fr}.db-author-portrait-card{min-height:470px}.db-external-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:760px){.db-video-grid{grid-template-columns:1fr;gap:18px}.db-video-copy p{max-width:none}.db-video-link{width:100%;justify-content:center;box-sizing:border-box}}
      @media(max-width:790px){.db-hero-grid{grid-template-columns:1fr}.db-hero-art{min-height:320px;margin-top:-24px}.db-cover-stage{height:330px;transform:scale(.78)}.db-stage-note{display:none}.db-hero-copy{text-align:center;padding-left:0}.db-hero-copy:before{display:none}.db-hero-copy .db-hero-actions,.db-hero-copy [data-hero-badges],.db-hero-copy [data-hero-foot]{justify-content:center}}
      @media(max-width:640px){.db-author-page{font-size:16px}.db-book-grid,.db-external-grid{grid-template-columns:1fr}.db-real-cover-shell{height:188px}.db-real-cover-image{height:162px;max-width:72%}.db-hero-title{font-size:clamp(2.75rem,14vw,3.75rem);line-height:.96}.db-top-label,.db-icon-label{display:none}.db-hero-actions{display:grid!important}.db-hero-actions>*{width:100%;justify-content:center}.db-section{padding-left:18px!important;padding-right:18px!important}.db-contact-actions{display:grid!important}.db-contact-actions>*{width:100%;justify-content:center}.db-hero-art{min-height:245px;margin-top:-36px}.db-cover-stage{height:275px;transform:scale(.62)}.db-about-facts{grid-template-columns:1fr!important}.db-author-portrait-card{min-height:390px}.db-section-head{align-items:flex-start!important}.db-catalog-count{display:none!important}}
    `}</style>

    <header style={s.topbar}>
      <a href="/" style={s.brand}><span style={s.brandMark}>P</span><span><b>PreçoCerto</b><small>Marketplace Local</small></span></a>
      <nav className="db-top-label" style={s.topNav} aria-label="Navegação da autora"><a href="#livros">Livros</a><a href="#autora">A autora</a><a href="#contato">Contato</a></nav>
      <div style={s.topActions}>
        <button onClick={sharePage} style={s.iconButton} aria-label="Compartilhar página">{copied?<Check size={17}/>:<Share2 size={17}/>}<span className="db-icon-label">{copied?"Link copiado":"Compartilhar"}</span></button>
        <a href={whatsappUrl(whatsapp)} target="_blank" rel="noreferrer" style={s.topWhats}><MessageCircle size={17}/> Falar com a autora</a>
      </div>
    </header>

    <section style={{...s.hero,backgroundImage:`linear-gradient(90deg,rgba(15,7,20,.78) 0%,rgba(28,10,29,.3) 48%,rgba(35,13,31,.1) 100%),url('/dorinha-hero-art-v2.webp'),${heroPlaceholder},${heroPattern}`}}>
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
            {profile.books.slice(0,4).map((book,index)=>{
              let src = book.image_url;
              if (book.slug === 'uma-viagem-ao-mundo-da-imaginacao') src = imagimacaoAsset.url;
              if (book.slug === 'mente-perversa') src = mentePerversaAsset.url;
              if (book.slug === 'uma-historia-de-superacao') src = superacaoAsset.url;
              if (book.slug === 'o-despertar-para-o-mundo-literario') src = despertarAsset.url;
              
              return src ? (
                <img 
                  key={book.id} 
                  className="db-hero-cover" 
                  src={src} 
                  alt={`Capa de ${book.name}`}
                  style={['uma-viagem-ao-mundo-da-imaginacao', 'mente-perversa', 'uma-historia-de-superacao', 'o-despertar-para-o-mundo-literario'].includes(book.slug) ? { objectFit: 'cover' } : {}}
                />
              ) : null;
            })}
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
        {profile.books.map(book=>{
          let src = book.image_url;
          if (book.slug === 'uma-viagem-ao-mundo-da-imaginacao') src = imagimacaoAsset.url;
          if (book.slug === 'mente-perversa') src = mentePerversaAsset.url;
          if (book.slug === 'uma-historia-de-superacao') src = superacaoAsset.url;
          if (book.slug === 'o-despertar-para-o-mundo-literario') src = despertarAsset.url;
          
          return <article key={book.id} className="db-book" style={s.bookCard}>
          <div className={`db-real-cover-shell ${loadedCovers.has(book.id)?"is-loaded":""}`} data-real-cover="1">
            <span className="db-cover-placeholder" aria-hidden="true">Preparando a capa…</span>
            {src?<img className="db-real-cover-image" src={src} sizes="(max-width: 640px) 68vw, (max-width: 1050px) 34vw, 238px" width={480} height={720} loading="lazy" fetchPriority="low" decoding="async" onLoad={()=>setLoadedCovers(current=>{if(current.has(book.id))return current;const next=new Set(current);next.add(book.id);return next})} alt={`Capa do livro ${book.name}, de Dorinha Barroso`} style={['uma-viagem-ao-mundo-da-imaginacao', 'mente-perversa', 'uma-historia-de-superacao', 'o-despertar-para-o-mundo-literario'].includes(book.slug) ? { objectFit: 'cover' } : {}}/>:null}
          </div>
          <div style={s.bookBody}>
            <div style={s.bookTop}><span style={s.bookType}>LIVRO</span>{book.available&&<span style={s.available}>Disponível para consulta</span>}</div>
            <h3 style={s.bookTitle}>{book.name}</h3>
            <p style={s.bookDescription} className="db-book-description">{book.description}</p>
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
          <img src="/dorinha-author-portrait-v2.webp" width={1024} height={1536} loading="lazy" decoding="async" sizes="(max-width: 640px) calc(100vw - 36px), (max-width: 1050px) calc(100vw - 48px), 360px" alt="Dorinha Barroso segurando dois de seus livros"/>
          <figcaption><strong>Dorinha Barroso</strong><span>ESCRITORA · EDUCADORA · ACREANA</span></figcaption>
        </figure>
      </div>
    </section>

    <section style={s.videoWrap}>
      <div style={s.videoSection} className="db-section db-video-grid">
        <div className="db-video-copy">
          <span style={s.eyebrow}>DORINHA EM VÍDEO</span>
          <h2 style={s.videoTitle}>Conheça a escritora mais de perto.</h2>
          <p>Assista a este registro de Dorinha Barroso e descubra mais sobre sua presença, sua voz e sua relação com a literatura.</p>
          <a className="db-video-link" href="https://youtu.be/PPXQcNOlmMU?si=Ok8iyN-OSfRSd9yO" target="_blank" rel="noreferrer"><Play size={16}/> Assistir diretamente no YouTube</a>
        </div>
        <div className="db-video-frame">
          <iframe src="https://www.youtube-nocookie.com/embed/PPXQcNOlmMU?rel=0&modestbranding=1" title="Vídeo da escritora Dorinha Barroso" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/>
        </div>
      </div>
    </section>

    <section style={s.section} className="db-section">
      <div style={s.sectionHead}><div><span style={s.eyebrow}>TAMBÉM DISPONÍVEL ONLINE</span><h2 style={s.h2}>Prefere comprar em outra plataforma?</h2><p style={s.sectionText}>Sem problema. O PreçoCerto também ajuda você a encontrar os canais digitais onde a obra da autora está disponível.</p></div></div>
      <div className="db-external-grid">
        {external.length > 0 ? (
          external.map((store) => (
            <a key={store.url} href={store.url} target="_blank" rel="noreferrer" style={s.externalCard} className="db-action">
              <span><ExternalLink size={17}/></span>
              <div><strong>{store.label}</strong><small>Abrir loja externa</small></div>
              <ArrowRight size={16}/>
            </a>
          ))
        ) : (
          <div className="db-external-empty">
            <h3>Disponível em breve nas plataformas</h3>
            <p>No momento, as obras estão disponíveis para aquisição imediata via venda direta com a autora.</p>
            <a href={whatsappUrl(whatsapp)} target="_blank" rel="noreferrer" className="db-external-empty-cta">
              <MessageCircle size={18} /> Falar com Dorinha no WhatsApp
            </a>
          </div>
        )}
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
  page:{minHeight:"100vh",background:"#f7f4ef",color:"#211b27",fontFamily:"'Inter Variable',Inter,system-ui,-apple-system,'Segoe UI',sans-serif"},
  loading:{minHeight:"100vh",display:"grid",placeItems:"center",alignContent:"center",gap:12,background:"#f6f3ee",color:"#322642"},
  topbar:{height:58,padding:"0 clamp(14px,4vw,58px)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:18,background:"rgba(250,248,244,.96)",backdropFilter:"blur(18px)",borderBottom:"1px solid rgba(64,44,77,.10)",position:"sticky",top:0,zIndex:30,boxShadow:"0 8px 30px rgba(31,18,41,.04)"},
  brand:{display:"flex",alignItems:"center",gap:8,textDecoration:"none",color:"#261b30"},brandMark:{width:30,height:30,borderRadius:9,display:"grid",placeItems:"center",background:"linear-gradient(145deg,#3e2750,#23162d)",color:"#f1d6a6",fontWeight:900},topNav:{display:"flex",alignItems:"center",gap:25,fontSize:13,fontWeight:700,color:"#594d60"},topActions:{display:"flex",alignItems:"center",gap:7},iconButton:{height:36,border:"1px solid #d7cdd9",background:"white",borderRadius:9,padding:"0 11px",display:"inline-flex",alignItems:"center",gap:6,cursor:"pointer",fontWeight:700,fontSize:13,color:"#372b3c"},topWhats:{height:36,borderRadius:9,padding:"0 12px",display:"inline-flex",alignItems:"center",gap:6,background:"#2e1b38",color:"white",textDecoration:"none",fontWeight:750,fontSize:13},
  hero:{minHeight:440,position:"relative",backgroundColor:"#24102b",backgroundSize:"cover,cover,cover,760px 520px",backgroundPosition:"center,center,center,right 4% center",backgroundRepeat:"no-repeat",overflow:"hidden",color:"white",borderBottom:"1px solid rgba(231,199,141,.22)"},heroGlow:{position:"absolute",width:440,height:440,borderRadius:"50%",background:"rgba(218,173,103,.14)",filter:"blur(90px)",right:"4%",top:"-5%"},heroInner:{position:"relative",zIndex:2,maxWidth:1180,margin:"0 auto",padding:"27px 24px 25px"},heroBadges:{display:"flex",flexWrap:"wrap",gap:7},verified:{display:"inline-flex",alignItems:"center",gap:5,padding:"6px 9px",borderRadius:999,background:"rgba(137,192,255,.16)",border:"1px solid rgba(173,214,255,.32)",color:"#e6f3ff",fontSize:11,fontWeight:750},directBadge:{display:"inline-flex",alignItems:"center",gap:5,padding:"6px 9px",borderRadius:999,background:"rgba(231,199,141,.16)",border:"1px solid rgba(245,218,165,.34)",color:"#ffe8b9",fontSize:11,fontWeight:750},localBadge:{padding:"7px 9px",borderRadius:999,border:"1px solid rgba(255,255,255,.18)",color:"#eee6f0",fontSize:12,fontWeight:650},heroLead:{maxWidth:600,fontFamily:"Iowan Old Style,Palatino Linotype,Palatino,Georgia,serif",fontSize:"clamp(1.25rem,1.9vw,1.6rem)",lineHeight:1.4,color:"#fff4df",margin:"0 0 9px"},heroText:{maxWidth:560,color:"#eee5f0",fontSize:15,lineHeight:1.65},heroActions:{display:"flex",flexWrap:"wrap",gap:8,marginTop:18},heroPrimary:{display:"inline-flex",alignItems:"center",gap:8,padding:"11px 15px",borderRadius:9,background:"linear-gradient(135deg,#f3dba8,#dcb96e)",color:"#24162c",fontWeight:800,fontSize:13,textDecoration:"none",transition:".2s ease",boxShadow:"0 12px 28px rgba(0,0,0,.2)"},heroSecondary:{display:"inline-flex",alignItems:"center",gap:8,padding:"11px 15px",borderRadius:9,background:"#fff",color:"#2c2034",fontWeight:750,fontSize:13,textDecoration:"none",transition:".2s ease"},heroGhost:{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 15px",borderRadius:10,border:"1px solid rgba(255,255,255,.22)",background:"rgba(255,255,255,.06)",color:"white",fontWeight:750,cursor:"pointer",transition:".2s ease"},heroFoot:{display:"flex",flexWrap:"wrap",gap:16,marginTop:18,color:"#e4d9e6",fontSize:12},
  section:{maxWidth:1180,margin:"0 auto",padding:"50px 24px"},sectionHead:{display:"flex",justifyContent:"space-between",alignItems:"end",gap:24,marginBottom:22},eyebrow:{display:"block",color:"#5e3d6b",fontSize:11,fontWeight:800,letterSpacing:".12em",marginBottom:8},eyebrowGold:{display:"block",color:"#f0d28f",fontSize:11,fontWeight:800,letterSpacing:".12em",marginBottom:8},h2:{fontFamily:"Iowan Old Style,Palatino Linotype,Palatino,Georgia,serif",fontSize:"clamp(2rem,3.5vw,2.85rem)",lineHeight:1.12,letterSpacing:"-.025em",margin:"0 0 12px",fontWeight:700},sectionText:{maxWidth:740,color:"#5f5564",fontSize:16,lineHeight:1.75},catalogCount:{minWidth:112,padding:12,border:"1px solid #d9cfd9",borderRadius:12,background:"#fff",display:"grid",textAlign:"center",boxShadow:"0 10px 28px rgba(44,26,49,.05)"},
  bookCard:{background:"white",border:"1px solid #ded5dd",borderRadius:14,overflow:"hidden",transition:".25s ease",display:"flex",flexDirection:"column",height:"100%"},cover:{height:250,position:"relative",padding:"22px 19px",display:"flex",flexDirection:"column",overflow:"hidden",color:"white"},coverEyebrow:{fontSize:10,fontWeight:800,letterSpacing:".12em"},coverRule:{height:1,width:44,background:"rgba(255,255,255,.52)",margin:"14px 0 auto"},coverTitle:{fontFamily:"Iowan Old Style,Palatino Linotype,Palatino,Georgia,serif",fontSize:"clamp(1.55rem,2.2vw,2.1rem)",lineHeight:1.08,letterSpacing:"-.02em",maxWidth:210},coverAuthor:{marginTop:13,fontSize:10,fontWeight:750,letterSpacing:".12em",opacity:.92},coverIndex:{position:"absolute",right:15,bottom:9,fontSize:46,fontWeight:850,opacity:.09},bookBody:{padding:14,display:"flex",flexDirection:"column",flex:1},bookTop:{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center"},bookType:{fontSize:10,fontWeight:800,letterSpacing:".11em",color:"#695b6e"},available:{fontSize:10,fontWeight:750,color:"#28643f",background:"#e6f5eb",borderRadius:999,padding:"5px 7px"},bookTitle:{fontFamily:"Iowan Old Style,Palatino Linotype,Palatino,Georgia,serif",fontSize:19,lineHeight:1.2,margin:"9px 0 6px"},bookDescription:{fontSize:13,color:"#5f5563",lineHeight:1.55,margin:"0 0 9px"},isbn:{color:"#746a77",fontSize:11},bookPrice:{marginTop:"auto",padding:"10px 0",display:"grid",gap:2,borderTop:"1px solid #e9e1e7",fontSize:12},bookActions:{display:"grid",gridTemplateColumns:"1fr 40px",gap:7},buyDirect:{minHeight:41,borderRadius:9,background:"#34203f",color:"white",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontWeight:750,fontSize:13},externalBtn:{minHeight:41,borderRadius:9,border:"1px solid #d8ced8",display:"grid",placeItems:"center",color:"#493c4e"},
  aboutWrap:{background:"#211629"},aboutMain:{padding:"8px 0"},aboutText:{color:"#eee5f0",fontSize:16,lineHeight:1.78,maxWidth:760},aboutFacts:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:25},quoteCard:{background:"#f0d8aa",color:"#2a1b30",borderRadius:20,padding:"32px 28px",position:"relative",alignSelf:"stretch",display:"flex",flexDirection:"column",justifyContent:"center"},quoteMark:{fontFamily:"Iowan Old Style,Palatino Linotype,Palatino,Georgia,serif",fontSize:70,lineHeight:.6,opacity:.3,marginTop:28},
  videoWrap:{background:"linear-gradient(180deg,#f7f4ef,#eee8ef)"},videoSection:{maxWidth:1180,margin:"0 auto",padding:"42px 24px"},videoTitle:{fontFamily:"Iowan Old Style,Palatino Linotype,Palatino,Georgia,serif",fontSize:"clamp(1.8rem,3vw,2.55rem)",lineHeight:1.12,letterSpacing:"-.025em",margin:"0 0 12px",fontWeight:700,color:"#271d2c"},
  externalCard:{background:"white",border:"1px solid #ddd3dc",borderRadius:13,padding:15,display:"grid",gridTemplateColumns:"40px 1fr auto",gap:10,alignItems:"center",color:"#302536",textDecoration:"none",transition:".2s ease"},sourceNote:{fontSize:12,color:"#6e6471",lineHeight:1.55,marginTop:16},
  contactWrap:{background:"linear-gradient(135deg,#382544,#25182f)"},contactText:{color:"#eee4f0",fontSize:15,lineHeight:1.7,maxWidth:620},contactActions:{display:"flex",gap:8,marginTop:17},contactPrimary:{display:"inline-flex",alignItems:"center",gap:7,padding:"11px 14px",borderRadius:9,background:"#f0ce83",color:"#211429",fontWeight:800,textDecoration:"none",fontSize:13},contactSecondary:{display:"inline-flex",alignItems:"center",gap:7,padding:"11px 14px",borderRadius:9,border:"1px solid rgba(255,255,255,.3)",background:"rgba(255,255,255,.04)",color:"white",fontWeight:750,cursor:"pointer",fontSize:13},contactCard:{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:15,padding:"18px 20px",color:"white"},contactLabel:{fontSize:10,fontWeight:800,letterSpacing:".11em",color:"#eee3f0"},phone:{display:"block",fontFamily:"Iowan Old Style,Palatino Linotype,Palatino,Georgia,serif",fontSize:26,margin:"6px 0 14px"},contactLine:{display:"flex",gap:9,padding:"11px 0",borderTop:"1px solid rgba(255,255,255,.15)",fontSize:14,lineHeight:1.55},secureNote:{display:"flex",gap:7,alignItems:"center",marginTop:9,padding:10,borderRadius:9,background:"rgba(231,199,141,.14)",color:"#ffe7b5",fontSize:11},
  footer:{padding:"18px clamp(18px,4vw,58px)",display:"grid",gridTemplateColumns:"1fr auto auto",gap:22,alignItems:"center",background:"#17121c",color:"#d4cad6",fontSize:12},footerBrand:{fontSize:18,fontWeight:850,color:"white",textDecoration:"none"},
};
