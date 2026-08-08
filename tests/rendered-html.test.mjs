import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

let workerPromise;

async function render(pathname = "/") {
  workerPromise ??= import(new URL("../dist/server/index.js", import.meta.url).href).then(module => module.default);
  const worker = await workerPromise;
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the PreçoCerto home with its critical journey", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /lang="pt-BR"/);
  assert.match(html, /Compre melhor\./);
  assert.match(html, /Gaste menos\./);
  assert.match(html, /Busque arroz, café, carne, leite/);
  assert.match(html, /Cestas otimizadas/i);
  assert.match(html, /Preços em tempo real/i);
  assert.match(html, /Criar minha conta gratuita/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("serves catch-all product routes without an accidental 404", async () => {
  const response = await render("/estabelecimentos");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /PreçoCerto/);
  assert.match(html, /Estabelecimentos monitorados|Comércio local/i);
});

test("keeps the required route inventory reachable", async () => {
  const routes = [
    "/buscar", "/precos", "/precos/legacy", "/precos-por-categoria", "/melhores-precos", "/comparador", "/comparador-ao-vivo", "/onde-comprar", "/onde-comprar/arroz", "/categoria/mercearia", "/catalogo/mercearia", "/produto/1", "/produto/arroz-tio-joao-5kg", "/produto-publico/arroz-tio-joao-5kg", "/estabelecimentos", "/estabelecimento/central-super", "/estabelecimento/central-super/categoria/mercearia", "/loja/1", "/loja/1/produto/arroz-tio-joao-5kg", "/mapa", "/farmacias", "/cesta", "/cesta-basica", "/lista", "/lista/nova", "/lista/pronta", "/favoritos", "/alertas", "/notificacoes", "/financas", "/tendencias", "/fale-conosco", "/privacidade", "/colaborar", "/lojista",
    "/login", "/cadastro", "/onboarding", "/auth", "/registrar", "/resgatar", "/planos", "/comprar-licenca", "/checkout/mensal", "/assinar", "/assinatura", "/comprovante/1", "/meus-pedidos", "/minhas-licencas", "/minha-ia", "/perfil", "/sem-permissao",
    "/app", "/app/produtos", "/app/estabelecimentos", "/app/loja/1", "/app/produto/1/arroz", "/app/comparacoes", "/app/insights", "/app/notas", "/historico", "/historico/scans", "/historico/produtos", "/historico/1",
    "/c/publica", "/share/token", "/cotacao/1",
    "/admin-login", "/admin", "/admin/gestao", "/admin/acessos-temporarios", "/admin/analytics", "/admin/auditoria", "/admin/auditoria-acessos", "/admin/auditoria-numeros", "/admin/cadastro-foto", "/admin/catalogo", "/admin/categorizacao", "/admin/cesta", "/admin/cesta-auditoria", "/admin/clientes", "/admin/cobertura", "/admin/cobertura/1", "/admin/consistencia", "/admin/contas", "/admin/conversoes", "/admin/cupom", "/admin/cupom-lote", "/admin/historico-precos", "/admin/ia", "/admin/icones-categoria", "/admin/image-jobs", "/admin/importacoes", "/admin/lote-inserir", "/admin/metricas", "/admin/operacao", "/admin/preco-rapido", "/admin/precos", "/admin/promocoes", "/admin/promocoes-codigos", "/admin/rank-check", "/admin/reports", "/admin/sinonimos", "/admin/vitrine", "/admin/webhooks",
  ];
  for (const route of routes) {
    const response = await render(route);
    assert.equal(response.status, 200, `${route} returned ${response.status}`);
  }
});

test("ships persistent catalog, brand metadata and social assets", async () => {
  const [hosting, schema, layout, packageJson] = await Promise.all([
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(schema, /sqliteTable\("products"/);
  assert.match(schema, /sqliteTable\("prices"/);
  assert.match(layout, /PreçoCerto — Economia Real em Feijó/);
  assert.match(layout, /\/og\.png/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await access(new URL("../public/og.png", import.meta.url));
  await access(new URL("../public/favicon.png", import.meta.url));
  await access(new URL("../drizzle/0000_precocerto_catalog.sql", import.meta.url));
});
