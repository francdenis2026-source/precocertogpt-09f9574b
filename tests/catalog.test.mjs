import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

// Valida o catálogo (antiga rota /api/catalog) para evitar regressões no CI.
const source = await readFile(new URL("../src/data/catalog.ts", import.meta.url), "utf8");

test("o módulo de catálogo expõe o contrato usado pela interface", () => {
  for (const symbol of ["buildCatalog", "productSeed", "priceSeed", "establishmentSeed", "verifiedDatasetMetrics"]) {
    assert.match(source, new RegExp(`export (const|function) ${symbol}\\b`), `${symbol} ausente`);
  }
});

test("o catálogo entrega produtos, lojas e métricas consistentes", async () => {
  const { buildCatalog, priceSeed, productSeed } = await import("../src/data/catalog.ts");
  const catalog = buildCatalog();

  assert.equal(catalog.products.length, productSeed.length);
  assert.ok(catalog.stores.length >= 5);
  assert.ok(catalog.metrics.products > 0 && catalog.metrics.prices > 0 && catalog.metrics.stores > 0);
  assert.ok(Date.parse(catalog.updatedAt) > 0);

  for (const product of catalog.products) {
    assert.ok(product.minPrice <= product.avgPrice && product.avgPrice <= product.maxPrice, `${product.slug} com faixa de preço inválida`);
    assert.ok(product.establishment && product.neighborhood, `${product.slug} sem estabelecimento`);
    assert.ok(product.storeCount >= 1);
  }

  assert.ok(priceSeed.every(price => price.value > 0));
});

test("a busca filtra por nome, marca e categoria", async () => {
  const { buildCatalog } = await import("../src/data/catalog.ts");
  assert.ok(buildCatalog("arroz").products.length >= 1);
  assert.ok(buildCatalog("mercearia").products.length >= 3);
  assert.equal(buildCatalog("xyz-inexistente").products.length, 0);
});
