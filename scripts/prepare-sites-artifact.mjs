import { copyFile, mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await mkdir("dist/social", { recursive: true });
await copyFile(".openai/hosting.json", "dist/.openai/hosting.json");

const escapeXml = (value = "") => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;");

function socialCard({ eyebrow, title, subtitle, footer, bgA, bgB, accent, motif }) {
  const safeTitle = escapeXml(title);
  const safeSubtitle = escapeXml(subtitle);
  const safeEyebrow = escapeXml(eyebrow);
  const safeFooter = escapeXml(footer);
  const motifSvg = motif === "books"
    ? `<g opacity=".82" fill="none" stroke="${accent}" stroke-width="4"><rect x="915" y="255" width="54" height="220" rx="8"/><rect x="984" y="215" width="58" height="260" rx="8"/><rect x="1057" y="280" width="50" height="195" rx="8"/><path d="M900 486h230"/></g>`
    : motif === "music"
      ? `<g fill="${accent}" opacity=".86">${[30,52,84,118,72,44,98,132,82,48,104,64,36].map((h,i)=>`<rect x="${900+i*18}" y="${345-h/2}" width="9" height="${h}" rx="4.5"/>`).join("")}</g>`
      : motif === "stores"
        ? `<g fill="none" stroke="${accent}" stroke-width="4" opacity=".82"><rect x="900" y="245" width="135" height="145" rx="18"/><path d="M925 285h85M927 320h40M990 320h20"/><rect x="1048" y="285" width="92" height="120" rx="16"/><path d="M1068 320h52M1068 350h32"/></g>`
        : `<g opacity=".9"><rect x="865" y="255" width="282" height="82" rx="41" fill="#fff"/><circle cx="905" cy="296" r="14" fill="none" stroke="#174535" stroke-width="5"/><path d="m915 307 17 17" stroke="#174535" stroke-width="5" stroke-linecap="round"/><text x="952" y="307" fill="#52625c" font-family="Arial,Helvetica,sans-serif" font-size="24">buscar preços</text></g>`;

  return `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${bgA}"/><stop offset="1" stop-color="${bgB}"/></linearGradient>
      <radialGradient id="glow" cx="82%" cy="22%" r="52%"><stop stop-color="${accent}" stop-opacity=".22"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="12" stdDeviation="18" flood-opacity=".18"/></filter>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect width="1200" height="630" fill="url(#glow)"/>
    <circle cx="1090" cy="565" r="220" fill="none" stroke="#fff" stroke-opacity=".045" stroke-width="2"/>
    <circle cx="1090" cy="565" r="165" fill="none" stroke="#fff" stroke-opacity=".045" stroke-width="2"/>
    <circle cx="1090" cy="565" r="110" fill="none" stroke="#fff" stroke-opacity=".045" stroke-width="2"/>
    <g filter="url(#shadow)">
      <rect x="64" y="54" width="192" height="52" rx="16" fill="#fff" fill-opacity=".08" stroke="#fff" stroke-opacity=".10"/>
      <text x="85" y="88" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="26" font-weight="700">PreçoCerto</text>
    </g>
    <rect x="1060" y="58" width="76" height="8" rx="4" fill="${accent}"/>
    <text x="64" y="176" fill="${accent}" font-family="Arial,Helvetica,sans-serif" font-size="20" font-weight="700" letter-spacing="2.5">${safeEyebrow}</text>
    <text x="64" y="274" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="68" font-weight="700" letter-spacing="-2.2">${safeTitle}</text>
    <text x="64" y="334" fill="#dce4e1" font-family="Arial,Helvetica,sans-serif" font-size="28">${safeSubtitle}</text>
    ${motifSvg}
    <line x1="64" y1="532" x2="1136" y2="532" stroke="#fff" stroke-opacity=".13"/>
    <text x="64" y="574" fill="#aebbb6" font-family="Arial,Helvetica,sans-serif" font-size="20">${safeFooter}</text>
  </svg>`;
}

const socialCards = [
  {
    file: "preco-certo.png",
    eyebrow: "MARKETPLACE LOCAL",
    title: "PreçoCerto",
    subtitle: "Compare, escolha e compre perto de você.",
    footer: "PreçoCerto · Feijó, Acre",
    bgA: "#071d2b", bgB: "#12382d", accent: "#35cf75", motif: "search",
  },
  {
    file: "estabelecimentos.png",
    eyebrow: "COMÉRCIO LOCAL",
    title: "Estabelecimentos",
    subtitle: "Explore vitrines, catálogos e opções de compra.",
    footer: "PreçoCerto · Marketplace Local",
    bgA: "#091e2a", bgB: "#174536", accent: "#55c98a", motif: "stores",
  },
  {
    file: "dorinha-barroso.png",
    eyebrow: "LIVROS & AUTORA",
    title: "Dorinha Barroso",
    subtitle: "Obras, história e compra direta com a autora.",
    footer: "Espaço da autora · Feijó, Acre",
    bgA: "#1a1028", bgB: "#4a2944", accent: "#e4c58b", motif: "books",
  },
  {
    file: "fremix-producoes.png",
    eyebrow: "CULTURA & MÚSICA LOCAL",
    title: "FreMix Produções",
    subtitle: "Produção, lançamentos e conteúdo audiovisual.",
    footer: "Cultura & Criadores · PreçoCerto",
    bgA: "#120c1b", bgB: "#3f174d", accent: "#ef5a9a", motif: "music",
  },
];

for (const card of socialCards) {
  await sharp(Buffer.from(socialCard(card)))
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .resize(1200, 630)
    .toFile(`dist/social/${card.file}`);
}

const routeMeta = {
  "/": {
    title: "PreçoCerto | Marketplace Local",
    description: "Compare, escolha e compre perto de você. Descubra preços, estabelecimentos e vendas online no comércio local.",
    image: "/social/preco-certo.png",
  },
  "/estabelecimentos": {
    title: "Estabelecimentos | PreçoCerto",
    description: "Descubra o comércio local, entre nos estabelecimentos e explore catálogos, preços e opções de compra.",
    image: "/social/estabelecimentos.png",
  },
  "/dorinha-barroso": {
    title: "Dorinha Barroso · Livros & Autora | PreçoCerto",
    description: "Conheça as obras de Dorinha Barroso, sua trajetória literária e as opções de compra direta com a autora.",
    image: "/social/dorinha-barroso.png",
  },
  "/autora/dorinha-barroso": {
    title: "Dorinha Barroso · Livros & Autora | PreçoCerto",
    description: "Conheça as obras de Dorinha Barroso, sua trajetória literária e as opções de compra direta com a autora.",
    image: "/social/dorinha-barroso.png",
  },
  "/fremix-producoes": {
    title: "FreMix Produções · Cultura & Música Local | PreçoCerto",
    description: "Conheça a FreMix Produções, assista a uma seleção do canal e encontre informações para autorização de reprodução.",
    image: "/social/fremix-producoes.png",
  },
  "/cultura/fremix-producoes": {
    title: "FreMix Produções · Cultura & Música Local | PreçoCerto",
    description: "Conheça a FreMix Produções, assista a uma seleção do canal e encontre informações para autorização de reprodução.",
    image: "/social/fremix-producoes.png",
  },
};

const worker = `const routeMeta = ${JSON.stringify(routeMeta)};

function metaFor(pathname) {
  if (routeMeta[pathname]) return routeMeta[pathname];
  if (pathname.startsWith("/estabelecimento/")) return routeMeta["/estabelecimentos"];
  if (pathname.startsWith("/loja/")) return routeMeta["/"];
  return null;
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

function withMeta(html, requestUrl, meta) {
  const url = new URL(requestUrl);
  const canonical = url.origin + url.pathname;
  const image = url.origin + meta.image;
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const block = [
    "<title>" + title + "</title>",
    '<meta name="description" content="' + description + '" />',
    '<link rel="canonical" href="' + canonical + '" />',
    '<meta property="og:type" content="website" />',
    '<meta property="og:locale" content="pt_BR" />',
    '<meta property="og:site_name" content="PreçoCerto" />',
    '<meta property="og:title" content="' + title + '" />',
    '<meta property="og:description" content="' + description + '" />',
    '<meta property="og:url" content="' + canonical + '" />',
    '<meta property="og:image" content="' + image + '" />',
    '<meta property="og:image:secure_url" content="' + image + '" />',
    '<meta property="og:image:type" content="image/png" />',
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta property="og:image:alt" content="' + title + '" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    '<meta name="twitter:title" content="' + title + '" />',
    '<meta name="twitter:description" content="' + description + '" />',
    '<meta name="twitter:image" content="' + image + '" />'
  ].join("\\n    ");

  html = html.replace(/<title>[\\s\\S]*?<\\/title>/i, "")
    .replace(/<meta\\s+name=[\"']description[\"'][^>]*>/gi, "")
    .replace(/<link\\s+rel=[\"']canonical[\"'][^>]*>/gi, "")
    .replace(/<meta\\s+property=[\"']og:[^\"']+[\"'][^>]*>/gi, "")
    .replace(/<meta\\s+name=[\"']twitter:[^\"']+[\"'][^>]*>/gi, "");
  return html.replace("</head>", "    " + block + "\\n  </head>");
}

const app = {
  async fetch(request, env) {
    if (!env?.ASSETS?.fetch) return new Response("PreçoCerto", { status: 200 });

    const response = await env.ASSETS.fetch(request);
    if (request.method !== "GET") return response;

    const acceptsHtml = request.headers.get("accept")?.includes("text/html");
    if (!acceptsHtml) return response;

    const url = new URL(request.url);
    const meta = metaFor(url.pathname);

    if (meta) {
      let base = response;
      if (response.status === 404) {
        const indexUrl = new URL(request.url);
        indexUrl.pathname = "/index.html";
        base = await env.ASSETS.fetch(new Request(indexUrl, request));
      }
      const html = await base.text();
      return new Response(withMeta(html, request.url, meta), {
        status: 200,
        headers: { ...Object.fromEntries(base.headers), "content-type": "text/html; charset=UTF-8", "cache-control": "public, max-age=300" },
      });
    }

    if (response.status !== 404) return response;
    const indexUrl = new URL(request.url);
    indexUrl.pathname = "/index.html";
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};

export default app;
`;

await writeFile("dist/server/index.js", worker, "utf8");
