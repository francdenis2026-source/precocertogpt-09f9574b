import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('--- Iniciando Teste E2E: Redefinição de Senha ---');
  
  try {
    await page.goto('http://localhost:8080/admin-login');
    console.log('Acessou /admin-login');

    await page.click('button:has-text("Esqueci minha senha admin")');
    console.log('Clicou em "Esqueci minha senha"');

    await page.fill('input[placeholder="usuário"]', 'admin');
    await page.click('button:has-text("Verificar Usuário")');
    console.log('Usuário "admin" verificado');

    await page.fill('input[placeholder="mínimo 6 caracteres"]', 'nova_senha_2026');
    await page.click('button:has-text("Salvar Nova Senha")');
    console.log('Senha alterada com sucesso');

    await page.click('button:has-text("Voltar ao login admin")');
    await page.fill('input[placeholder="usuário"]', 'admin');
    await page.fill('input[placeholder="••••••••"]', 'nova_senha_2026');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/admin', { timeout: 10000 });
    console.log('Login com nova senha: SUCESSO');

  } catch (e) {
    console.error('Falha no teste:', e);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
