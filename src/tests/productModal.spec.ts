import { test, expect } from '@playwright/test';

test.describe('Modal de Detalhes do Produto', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/');
  });

  test('deve abrir o modal ao clicar em um produto na Home', async ({ page }) => {
    // Espera os produtos carregarem
    await page.waitForSelector('.professional-result-card');
    
    const firstProduct = page.locator('.professional-result-card').first();
    const productName = await firstProduct.locator('h3').textContent();
    
    // Clica na imagem
    await firstProduct.locator('.professional-result-card__visual').click();
    
    // Verifica se o modal abriu
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal.locator('h2')).toHaveText(productName || '');
    
    // Fecha o modal
    await modal.getByLabel('Fechar detalhes').click();
    await expect(modal).not.toBeVisible();
  });

  test('deve abrir o modal a partir da Busca', async ({ page }) => {
    await page.goto('http://localhost:8080/buscar');
    await page.waitForSelector('.professional-result-card');
    
    const product = page.locator('.professional-result-card').first();
    await product.locator('h3').click();
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('deve suportar deep link para produto específico', async ({ page }) => {
    // Primeiro pegamos um ID de produto real do catálogo (ou usamos o seed 1: Arroz Tio João)
    await page.goto('http://localhost:8080/?product_id=1');
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal.locator('h2')).toContainText('Arroz Tio João');
    
    // Verifica se o parâmetro foi limpo da URL (conforme implementação do replaceState)
    const url = page.url();
    expect(url).not.toContain('product_id=1');
  });
});
