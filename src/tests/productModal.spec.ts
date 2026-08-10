import { test, expect } from '@playwright/test';

test.describe('Modal de Detalhes do Produto', () => {
  test.beforeEach(async ({ page }) => {
    // Aumenta o timeout padrão para o ambiente de sandbox
    test.setTimeout(60000);
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  });

  test('deve abrir o modal ao clicar em um produto na Home', async ({ page }) => {
    // Espera os produtos aparecerem no DOM
    await page.waitForSelector('.professional-result-card', { timeout: 15000 });
    
    const firstProduct = page.locator('.professional-result-card').first();
    const productName = await firstProduct.locator('h3').textContent();
    
    // Clica na imagem (trigger do modal)
    await firstProduct.locator('.professional-result-card__visual').click();
    
    // Verifica visibilidade e conteúdo
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    if (productName) {
      await expect(modal.locator('h2')).toContainText(productName.trim());
    }
    
    // Fecha o modal
    await modal.getByLabel('Fechar detalhes').click();
    await expect(modal).not.toBeVisible();
  });

  test('deve suportar deep link para produto específico', async ({ page }) => {
    // Seed 1 no catálogo local é "Arroz Tio João"
    await page.goto('http://localhost:8080/?product_id=1', { waitUntil: 'networkidle' });
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 15000 });
    await expect(modal.locator('h2')).toContainText('Arroz Tio João');
    
    // O parâmetro deve ter sido removido via history.replaceState
    const url = page.url();
    expect(url).not.toContain('product_id=1');
  });
});
