import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  Copy,
  ExternalLink,
  Heart,
  MapPin,
  MessageCircle,
  PackageCheck,
  Share2,
  ShoppingBag,
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

  return <main style={s.page}>
    <style>{`
      .db-hero-title{font-size:clamp(3rem,7vw,6.5rem);line-height:.91;letter-spacing:-.065em;margin:18px 0 22px;max-width:970px}
      .db-hero-title em{font-style:normal;color:#e7c78d}
      .db-book-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
      .db-about-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(330px,.8fr);gap:20px}
      .db-contact-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:18px}
      .db-external-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      .db-action:hover{transform:translateY(-2px)}
      .db-book:hover{transform:translateY(-5px);box-shadow:0 22px 60px rgba(29,18,44,.12)}
      @media(max-width:980px){.db-book-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.db-about-grid,.db-contact-grid{grid-template-columns:1fr}.db-external-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:640px){.db-book-grid,.db-external-grid{grid-template-columns:1fr}.db-hero-title{font-size:clamp(2.65rem,15vw,4.5rem)}.db-top-label{display:none}.db-hero-actions{display:grid!important}.db-hero-actions>*{width:100%;justify-content:center}.db-section{padding-left:18px!important;padding-right:18px!important}.db-contact-actions{display:grid!important}.db-contact-actions>*{width:100%;justify-content:center}}
    `}</style>

    <header style={s.topbar}>
      <a href="/" style={s.brand}><span style={s.brandMark}>P</span><span><b>PreçoCerto</b><small>Marketplace Local</small></span></a>
      <span className="db-top-label" style={s.topLabel}>ESPAÇO DA AUTORA · FEIJÓ, ACRE</span>
      <div style={s.topActions}>
        <button onClick={sharePage} style={s.iconButton} aria-label="Compartilhar página">{copied?<Check size={17}/>:<Share2 size={17}/>}<span>{copied?"Link copiado":"Compartilhar"}</span></button>
        <a href={whatsappUrl(whatsapp)} target="_blank" rel="noreferrer" style={s.topWhats}><MessageCircle size={17}/> Falar com a autora</a>
      </div>
    </header>

    <section style={{...s.hero,backgroundImage:`linear-gradient(112deg,rgba(15,10,29,.98) 0%,rgba(31,20,53,.94) 48%,rgba(68,38,65,.78) 100%),${heroPattern}`}}>
      <div style={s.heroGlow}/>
      <div style={s.heroInner} className="db-section">
        <div style={s.heroBadges}>
          {profile.establishment.verified&&<span style={s.verified}><BadgeCheck size={14}/> Autora verificada</span>}
          <span style={s.directBadge}><Sparkles size={14}/> Venda direta ativa</span>
          <span style={s.localBadge}>PreçoCerto · Marketplace Local</span>
        </div>
        <h1 className="db-hero-title">Dorinha<br/><em>Barroso</em></h1>
        <p style={s.heroLead}>{profile.merchant.hero_title || "Histórias que nascem no Acre e encontram leitores em todo o Brasil."}</p>
        <p style={s.heroText}>Escritora de Feijó, professora e educadora, Dorinha construiu uma trajetória marcada pela leitura, pela escola pública e pela criação literária. Este é seu espaço oficial dentro do PreçoCerto para apresentar suas obras e aproximar autora e leitores.</p>
        <div style={s.heroActions} className="db-hero-actions">
          <a href="#livros" style={s.heroPrimary} className="db-action"><ShoppingBag size={18}/> Conhecer os livros <ArrowRight size={17}/></a>
          <a href={whatsappUrl(whatsapp)} target="_blank" rel="noreferrer" style={s.heroSecondary} className="db-action"><MessageCircle size={18}/> Comprar diretamente</a>
          <button onClick={sharePage} style={s.heroGhost} className="db-action"><Share2 size={18}/> Compartilhar página</button>
        </div>
        <div style={s.heroFoot}>
          <span><MapPin size={15}/> Feijó · Acre</span>
          <span><PackageCheck size={15}/> Retirada ou entrega combinada</span>
          <span><Heart size={15}/> Compra próxima da autora</span>
        </div>
      </div>
    </section>

    <section id="livros" style={s.section} className="db-section">
      <div style={s.sectionHead}>
        <div><span style={s.eyebrow}>OBRAS DE DORINHA BARROSO</span><h2 style={s.h2}>Uma autora. Diferentes caminhos de leitura.</h2><p style={s.sectionText}>Escolha uma obra para falar diretamente com Dorinha. Como os valores e a disponibilidade dos exemplares físicos podem mudar, o preço é confirmado no atendimento antes da compra.</p></div>
        <div style={s.catalogCount}><strong>{profile.books.length}</strong><span>títulos no catálogo</span></div>
      </div>
      <div className="db-book-grid">
        {profile.books.map((book,index)=>{const theme=coverThemes[book.slug]||coverThemes["despertar-para-o-mundo-literario"];return <article key={book.id} className="db-book" style={s.bookCard}>
          <div style={{...s.cover,background:theme.bg}}>
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

    <section style={s.aboutWrap}>
      <div style={s.section} className="db-section db-about-grid">
        <article style={s.aboutMain}>
          <span style={s.eyebrowGold}>A AUTORA</span>
          <h2 style={{...s.h2,color:"white",maxWidth:760}}>Da infância em Feijó a uma vida dedicada à leitura, à educação e à escrita.</h2>
          <p style={s.aboutText}>Maria das Dores Fernandes Barroso, conhecida como <strong>Dorinha Barroso</strong>, nasceu em Feijó, no Acre. Alfabetizada ainda criança por sua irmã, desenvolveu muito cedo uma relação intensa com os livros. Formou-se em História pela Universidade Federal do Acre (UFAC), licenciou-se em Pedagogia e realizou pós-graduação em Psicopedagogia e Gestão Pública.</p>
          <p style={s.aboutText}>Como professora das redes municipal e estadual, levou para a sala de aula o gosto pela leitura e pela produção de textos, poesias, contos e peças. Essa ligação entre educação, memória, imaginação e experiência de vida atravessa sua presença como escritora.</p>
          <div style={s.aboutFacts}><span><b>Feijó</b><small>raízes acreanas</small></span><span><b>Educação</b><small>professora e pedagoga</small></span><span><b>Literatura</b><small>obras publicadas</small></span></div>
        </article>
        <aside style={s.quoteCard}>
          <BookOpen size={32}/><span style={s.quoteMark}>“</span><p>Uma trajetória em que leitura, educação e imaginação se encontram — agora mais perto dos leitores através do marketplace local.</p><small>ESPAÇO LITERÁRIO · PREÇOCERTO</small>
        </aside>
      </div>
    </section>

    <section style={s.section} className="db-section">
      <div style={s.sectionHead}><div><span style={s.eyebrow}>TAMBÉM DISPONÍVEL ONLINE</span><h2 style={s.h2}>Prefere comprar em outra plataforma?</h2><p style={s.sectionText}>Sem problema. O PreçoCerto também ajuda você a encontrar os canais digitais onde a obra da autora está disponível.</p></div></div>
      <div className="db-external-grid">
        {external.map((store)=><a key={store.url} href={store.url} target="_blank" rel="noreferrer" style={s.externalCard} className="db-action"><span><ExternalLink size={17}/></span><div><strong>{store.label}</strong><small>Abrir loja externa</small></div><ArrowRight size={16}/></a>)}
      </div>
      <p style={s.sourceNote}>A disponibilidade, o formato e os valores praticados em lojas externas são definidos pelas próprias plataformas e podem mudar sem aviso.</p>
    </section>

    <section style={s.contactWrap}>
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
  topbar:{height:70,padding:"0 clamp(16px,4vw,58px)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:18,background:"rgba(250,248,244,.94)",backdropFilter:"blur(14px)",borderBottom:"1px solid rgba(64,44,77,.10)",position:"sticky",top:0,zIndex:30},
  brand:{display:"flex",alignItems:"center",gap:9,textDecoration:"none",color:"#261b30"},brandMark:{width:34,height:34,borderRadius:10,display:"grid",placeItems:"center",background:"#34203f",color:"#f1d6a6",fontWeight:950},topLabel:{fontSize:10,fontWeight:900,letterSpacing:".15em",color:"#817589"},topActions:{display:"flex",alignItems:"center",gap:8},iconButton:{height:39,border:"1px solid #ddd4df",background:"white",borderRadius:10,padding:"0 12px",display:"inline-flex",alignItems:"center",gap:6,cursor:"pointer",fontWeight:750,color:"#3d3242"},topWhats:{height:39,borderRadius:10,padding:"0 13px",display:"inline-flex",alignItems:"center",gap:6,background:"#2e1b38",color:"white",textDecoration:"none",fontWeight:800,fontSize:12},
  hero:{minHeight:690,position:"relative",backgroundSize:"cover,760px 520px",backgroundPosition:"center,right 4% center",backgroundRepeat:"no-repeat",overflow:"hidden",color:"white"},heroGlow:{position:"absolute",width:520,height:520,borderRadius:"50%",background:"rgba(218,173,103,.13)",filter:"blur(90px)",right:"3%",top:"10%"},heroInner:{position:"relative",zIndex:2,maxWidth:1240,margin:"0 auto",padding:"96px 24px 70px"},heroBadges:{display:"flex",flexWrap:"wrap",gap:8},verified:{display:"inline-flex",alignItems:"center",gap:5,padding:"7px 9px",borderRadius:999,background:"rgba(137,192,255,.12)",border:"1px solid rgba(159,205,255,.22)",color:"#cce5ff",fontSize:11,fontWeight:850},directBadge:{display:"inline-flex",alignItems:"center",gap:5,padding:"7px 9px",borderRadius:999,background:"rgba(231,199,141,.12)",border:"1px solid rgba(231,199,141,.28)",color:"#f4dba9",fontSize:11,fontWeight:850},localBadge:{padding:"7px 9px",borderRadius:999,border:"1px solid rgba(255,255,255,.14)",color:"#c9bfcd",fontSize:11,fontWeight:750},heroLead:{maxWidth:720,fontFamily:"Georgia,serif",fontSize:"clamp(1.35rem,2.3vw,2rem)",lineHeight:1.35,color:"#f1e5d1",margin:"0 0 16px"},heroText:{maxWidth:760,color:"#cabfd0",fontSize:15,lineHeight:1.75},heroActions:{display:"flex",flexWrap:"wrap",gap:9,marginTop:30},heroPrimary:{display:"inline-flex",alignItems:"center",gap:8,padding:"14px 17px",borderRadius:11,background:"#e7c78d",color:"#281b30",fontWeight:900,textDecoration:"none",transition:".2s ease"},heroSecondary:{display:"inline-flex",alignItems:"center",gap:8,padding:"14px 17px",borderRadius:11,background:"#fff",color:"#2c2034",fontWeight:850,textDecoration:"none",transition:".2s ease"},heroGhost:{display:"inline-flex",alignItems:"center",gap:8,padding:"14px 17px",borderRadius:11,border:"1px solid rgba(255,255,255,.18)",background:"rgba(255,255,255,.04)",color:"white",fontWeight:800,cursor:"pointer",transition:".2s ease"},heroFoot:{display:"flex",flexWrap:"wrap",gap:22,marginTop:56,color:"#b8abbf",fontSize:12},
  section:{maxWidth:1240,margin:"0 auto",padding:"82px 24px"},sectionHead:{display:"flex",justifyContent:"space-between",alignItems:"end",gap:30,marginBottom:32},eyebrow:{display:"block",color:"#725481",fontSize:10,fontWeight:950,letterSpacing:".16em",marginBottom:9},eyebrowGold:{display:"block",color:"#e6c889",fontSize:10,fontWeight:950,letterSpacing:".16em",marginBottom:9},h2:{fontFamily:"Georgia,serif",fontSize:"clamp(2rem,4vw,3.45rem)",lineHeight:1.04,letterSpacing:"-.035em",margin:"0 0 13px",fontWeight:700},sectionText:{maxWidth:760,color:"#756b79",fontSize:14,lineHeight:1.7},catalogCount:{minWidth:126,padding:15,border:"1px solid #e3dce2",borderRadius:14,background:"#fff",display:"grid",textAlign:"center"},
  bookCard:{background:"white",border:"1px solid #e8e0e6",borderRadius:18,overflow:"hidden",transition:".25s ease",display:"flex",flexDirection:"column"},cover:{height:310,position:"relative",padding:"28px 23px",display:"flex",flexDirection:"column",overflow:"hidden",color:"white"},coverEyebrow:{fontSize:9,fontWeight:950,letterSpacing:".16em"},coverRule:{height:1,width:50,background:"rgba(255,255,255,.42)",margin:"18px 0 auto"},coverTitle:{fontFamily:"Georgia,serif",fontSize:"clamp(1.7rem,2.6vw,2.5rem)",lineHeight:1.02,letterSpacing:"-.03em",maxWidth:220},coverAuthor:{marginTop:17,fontSize:9,fontWeight:900,letterSpacing:".18em",opacity:.78},coverIndex:{position:"absolute",right:18,bottom:12,fontSize:56,fontWeight:950,opacity:.07},bookBody:{padding:18,display:"flex",flexDirection:"column",flex:1},bookTop:{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center"},bookType:{fontSize:9,fontWeight:950,letterSpacing:".14em",color:"#87778c"},available:{fontSize:9,fontWeight:800,color:"#39704d",background:"#edf8f0",borderRadius:999,padding:"5px 7px"},bookTitle:{fontFamily:"Georgia,serif",fontSize:20,lineHeight:1.15,margin:"13px 0 9px"},bookDescription:{fontSize:12,color:"#756b78",lineHeight:1.6,minHeight:76},isbn:{color:"#9b919d",fontSize:10},bookPrice:{marginTop:"auto",padding:"16px 0 13px",display:"grid",gap:3,borderTop:"1px solid #eee8ed"},bookActions:{display:"grid",gridTemplateColumns:"1fr 42px",gap:7},buyDirect:{minHeight:42,borderRadius:10,background:"#34203f",color:"white",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:7,fontWeight:850,fontSize:12},externalBtn:{minHeight:42,borderRadius:10,border:"1px solid #dfd7df",display:"grid",placeItems:"center",color:"#493c4e"},
  aboutWrap:{background:"#201629"},aboutMain:{padding:"8px 0"},aboutText:{color:"#cbbfd0",fontSize:14,lineHeight:1.85,maxWidth:780},aboutFacts:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:27},quoteCard:{background:"#f0d8aa",color:"#2a1b30",borderRadius:20,padding:"32px 28px",position:"relative",alignSelf:"stretch",display:"flex",flexDirection:"column",justifyContent:"center"},quoteMark:{fontFamily:"Georgia,serif",fontSize:70,lineHeight:.6,opacity:.3,marginTop:28},
  externalCard:{background:"white",border:"1px solid #e5dde4",borderRadius:13,padding:15,display:"grid",gridTemplateColumns:"40px 1fr auto",gap:10,alignItems:"center",color:"#36283c",textDecoration:"none",transition:".2s ease"},sourceNote:{fontSize:10,color:"#9b919d",marginTop:16},
  contactWrap:{background:"linear-gradient(135deg,#382544,#25182f)"},contactText:{color:"#c9bdcc",lineHeight:1.75,maxWidth:680},contactActions:{display:"flex",gap:8,marginTop:24},contactPrimary:{display:"inline-flex",alignItems:"center",gap:7,padding:"14px 17px",borderRadius:11,background:"#e6c889",color:"#281b30",fontWeight:900,textDecoration:"none"},contactSecondary:{display:"inline-flex",alignItems:"center",gap:7,padding:"14px 17px",borderRadius:11,border:"1px solid rgba(255,255,255,.17)",background:"transparent",color:"white",fontWeight:850,cursor:"pointer"},contactCard:{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",borderRadius:18,padding:25,color:"white"},contactLabel:{fontSize:9,fontWeight:950,letterSpacing:".14em",color:"#d8c9dd"},phone:{display:"block",fontFamily:"Georgia,serif",fontSize:28,margin:"8px 0 22px"},contactLine:{display:"flex",gap:10,padding:"14px 0",borderTop:"1px solid rgba(255,255,255,.09)"},secureNote:{display:"flex",gap:7,alignItems:"center",marginTop:14,padding:11,borderRadius:10,background:"rgba(231,199,141,.10)",color:"#edd6a9",fontSize:11},
  footer:{padding:"30px clamp(18px,4vw,58px)",display:"grid",gridTemplateColumns:"1fr auto auto",gap:25,alignItems:"center",background:"#17121c",color:"#a99eae",fontSize:11},footerBrand:{fontSize:18,fontWeight:950,color:"white",textDecoration:"none"},
};
