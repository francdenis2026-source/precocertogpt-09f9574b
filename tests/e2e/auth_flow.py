import asyncio
from playwright.async_api import async_playwright

async def run_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        print("--- Iniciando Teste E2E: Redefinição de Senha ---")
        try:
            await page.goto("http://localhost:8080/admin-login")
            print("Acessou /admin-login")

            await page.click("text=Esqueci minha senha admin")
            print("Clicou em 'Esqueci minha senha'")

            await page.fill('input[placeholder="usuário"]', "admin")
            await page.click("text=Verificar Usuário")
            print("Usuário 'admin' verificado")

            await page.fill('input[placeholder="mínimo 6 caracteres"]', "nova_senha_2026")
            await page.click("text=Salvar Nova Senha")
            print("Senha alterada com sucesso")

            # O link de volta tem o texto "Voltar ao login admin"
            await page.click("text=Voltar ao login admin")
            await page.fill('input[placeholder="usuário"]', "admin")
            await page.fill('input[placeholder="••••••••"]', "nova_senha_2026")
            await page.click('button[type="submit"]')
            
            await page.wait_for_url("**/admin", timeout=10000)
            print("Login com nova senha: SUCESSO")
        except Exception as e:
            print(f"Falha no teste: {e}")
            exit(1)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run_test())
