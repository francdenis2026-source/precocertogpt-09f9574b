import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('--- Iniciando Teste E2E: Rate Limiting ---');
  
  try {
    await page.goto('http://localhost:8080/admin-login');

    // 1. Tentar login errado 5 vezes
    for (let i = 1; i <= 5; i++) {
      await page.fill('input[placeholder="Usuário"]', 'admin');
      await page.fill('input[placeholder="Senha"]', 'senha_errada');
      await page.click('button[type="submit"]');
      const msg = await page.textContent('.auth-form');
      console.log(`Tentativa ${i}:`, msg.includes('Tentativa') || msg.includes('bloqueado') ? 'OK' : 'Falhou');
    }

    // 2. Verificar se bloqueou
    const blockMsg = await page.textContent('.auth-form');
    if (blockMsg.includes('bloqueado')) {
      console.log('Bloqueio de login: SUCESSO');
    } else {
      console.log('Bloqueio de login: FALHOU');
    }

    // 3. Testar Rate Limit na Recuperação
    await page.click('button:has-text("Esqueci minha senha admin")');
    for (let i = 1; i <= 3; i++) {
      await page.fill('input[placeholder="usuário"]', 'inexistente');
      await page.click('button:has-text("Verificar Usuário")');
    }
    const recoveryBlockMsg = await page.textContent('.auth-form');
    if (recoveryBlockMsg.includes('bloqueado')) {
      console.log('Bloqueio de recuperação: SUCESSO');
    } else {
      console.log('Bloqueio de recuperação: FALHOU');
    }

  } catch (e) {
    console.error('Falha no teste:', e);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
