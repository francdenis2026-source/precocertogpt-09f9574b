import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('--- Iniciando Teste E2E: Rate Limiting ---');
  
  try {
    await page.goto('http://localhost:8080/admin-login');

    for (let i = 1; i <= 6; i++) {
      await page.fill('input[placeholder="usuário"]', 'admin');
      await page.fill('input[placeholder="••••••••"]', 'senha_errada');
      await page.click('button[type="submit"]');
      const msg = await page.textContent('.auth-form');
      if (msg.includes('bloqueado')) {
        console.log(`Tentativa ${i}: Bloqueado OK`);
        break;
      }
      console.log(`Tentativa ${i}: Erro comum OK`);
    }

    await page.click('button:has-text("Esqueci minha senha admin")');
    for (let i = 1; i <= 4; i++) {
      await page.fill('input[placeholder="usuário"]', 'inexistente');
      await page.click('button:has-text("Verificar Usuário")');
      const msg = await page.textContent('.auth-form');
      if (msg.includes('bloqueado')) {
        console.log(`Recuperação ${i}: Bloqueado OK`);
        break;
      }
    }

  } catch (e) {
    console.error('Falha no teste:', e);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
