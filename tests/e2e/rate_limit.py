import asyncio
from playwright.async_api import async_playwright

async def run_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        print("--- Iniciando Teste E2E: Rate Limiting ---")
        try:
            await page.goto("http://localhost:8080/admin-login")

            for i in range(1, 7):
                await page.fill('input[placeholder="usuário"]', "admin")
                await page.fill('input[placeholder="••••••••"]', "senha_errada")
                await page.click('button[type="submit"]')
                content = await page.content()
                if "bloqueado" in content.lower():
                    print(f"Tentativa {i}: Bloqueado OK")
                    break
                print(f"Tentativa {i}: Erro comum OK")

            await page.click('button:has-text("Esqueci minha senha admin")')
            for i in range(1, 5):
                await page.fill('input[placeholder="usuário"]', "inexistente")
                await page.click('button:has-text("Verificar Usuário")')
                content = await page.content()
                if "bloqueado" in content.lower():
                    print(f"Recuperação {i}: Bloqueado OK")
                    break
        except Exception as e:
            print(f"Falha no teste: {e}")
            exit(1)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run_test())
