import { test, expect } from '@playwright/test';

test.describe('PreçoCerto Search E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/buscar');
  });

  test('should search with debounce', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Buscar produtos ou marcas/i);
    await searchInput.fill('arroz');
    
    // Check loading state or results
    const count = await page.locator('.product-card').count();
    expect(count).toBeGreaterThan(0);
    
    await searchInput.fill('arroz tio joao');
    // Results should update
    await expect(page.getByText('Tio João')).toBeVisible();
  });

  test('should handle pagination', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: /próximo/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await expect(page.url()).toContain('page=2');
    }
  });

  test('should sort products', async ({ page }) => {
    const sortSelect = page.getByLabel(/ordenar/i);
    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption('price-asc');
      // Wait for re-render
      await page.waitForTimeout(500);
      const prices = await page.locator('.price-value').allTextContents();
      const numericPrices = prices.map((p: string) => parseFloat(p.replace(/[^\d,]/g, '').replace(',', '.')));
      expect(numericPrices[0]).toBeLessThanOrEqual(numericPrices[numericPrices.length - 1]);
    }
  });

  test('should show no results message with suggestions', async ({ page }) => {
    await page.getByPlaceholder(/Buscar produtos ou marcas/i).fill('produtoinexistente123');
    await expect(page.getByText(/nenhum resultado/i)).toBeVisible();
    await expect(page.getByText(/sugestões/i)).toBeVisible();
  });

  test('should apply filters', async ({ page }) => {
    const filterButton = page.getByLabel(/filtros/i);
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.getByLabel(/categoria/i).selectOption('Alimentos');
      const count = await page.locator('.product-card').count();
      expect(count).toBeGreaterThan(0);
    }
  });
});
