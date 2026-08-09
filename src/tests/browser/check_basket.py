import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

SCREENSHOTS = Path("/tmp/browser/smart-basket/screenshots")
SCREENSHOTS.mkdir(parents=True, exist_ok=True)

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        await page.goto("http://localhost:8080/cesta", wait_until="domcontentloaded")
        # Esperar um pouco para o catálogo carregar
        await page.wait_for_timeout(2000)
        await page.screenshot(path=str(SCREENSHOTS / "1_basket_step1.png"))
        print("Basket Step 1 (Mode Selection) captured")

        # Clicar em continuar para o passo 2
        await page.click("text=Continuar para escolha de itens")
        await page.wait_for_timeout(500)
        await page.screenshot(path=str(SCREENSHOTS / "2_basket_step2.png"))
        print("Basket Step 2 (Item Selection) captured")

        # Adicionar alguns itens
        quick_pills = await page.query_selector_all(".quick-pill")
        if quick_pills:
            await quick_pills[0].click()
            await quick_pills[1].click()
        
        await page.screenshot(path=str(SCREENSHOTS / "3_items_added.png"))

        # Ver otimização
        await page.click("text=Ver Otimização")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=str(SCREENSHOTS / "4_optimization_results.png"))
        print("Basket Step 3 (Results) captured")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
