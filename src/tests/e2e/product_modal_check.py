import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

SCREENSHOTS = Path("/tmp/browser/product_modal/screenshots")
SCREENSHOTS.mkdir(parents=True, exist_ok=True)

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        # Teste 1: Abrir modal na Home
        print("Teste 1: Abrindo modal na Home...")
        await page.goto("http://localhost:8080/", wait_until="networkidle")
        await page.wait_for_selector(".professional-result-card")
        
        product_card = page.locator(".professional-result-card").first
        product_name = await product_card.locator("h3").inner_text()
        print(f"Clicando no produto: {product_name}")
        
        await product_card.locator(".professional-result-card__visual").click()
        await page.wait_for_selector('[role="dialog"]')
        
        modal_title = await page.locator("#modal-title").inner_text()
        modal_product_name = await page.locator('[role="dialog"] h2').inner_text()
        print(f"Modal aberto: {modal_title} - {modal_product_name}")
        
        await page.screenshot(path=str(SCREENSHOTS / "1_modal_home.png"))
        
        # Teste 2: Deep Link
        print("\nTeste 2: Deep Link para produto 1 (Arroz Tio João)...")
        await page.goto("http://localhost:8080/?product_id=1", wait_until="networkidle")
        await page.wait_for_selector('[role="dialog"]')
        
        deep_link_product = await page.locator('[role="dialog"] h2').inner_text()
        print(f"Produto via deep link: {deep_link_product}")
        await page.screenshot(path=str(SCREENSHOTS / "2_deep_link.png"))
        
        url = page.url
        print(f"URL final (deve estar limpa): {url}")
        
        # Teste 3: Compartilhar
        print("\nTeste 3: Verificando botão compartilhar no modal...")
        share_btn = page.locator('button[title="Compartilhar este produto"]')
        await expect_visible = share_btn.is_visible()
        print(f"Botão compartilhar visível: {expect_visible}")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
