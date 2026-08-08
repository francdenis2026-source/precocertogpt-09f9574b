import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('--- Iniciando Teste E2E: Redefinição de Senha ---');
  
  try {
    // 1. Acessar página de login admin
    await page.goto('http://localhost:8080/admin-login');
    console.log('Acessou /admin-login');

    // 2. Clicar em esqueci minha senha
    await page.click('button:has-text("Esqueci minha senha admin")');
    console.log('Clicou em "Esqueci minha senha"');

    // 3. Tentar usuário inexistente
    await page.fill('input[placeholder="Seu usuário admin"]', 'usuario_errado');
    await page.click('button:has-text("Verificar usuário")');
    // Esperar mensagem de erro (no código atual deve falhar se não for 'admin')
    const errorMsg = await page.textContent('.alert-error');
    console.log('Erro usuário inválido:', errorMsg);

    // 4. Fluxo correto
    await page.fill('input[placeholder="Seu usuário admin"]', 'admin');
    await page.click('button:has-text("Verificar usuário")');
    console.log('Usuário "admin" verificado');

    // 5. Definir nova senha
    await page.fill('input[placeholder="Nova senha personalizada"]', 'nova_senha_2026');
    await page.click('button:has-text("Salvar Nova Senha")');
    console.log('Senha alterada com sucesso');

    // 6. Tentar logar com a nova senha
    await page.click('button:has-text("Voltar para o login")');
    await page.fill('input[placeholder="Usuário"]', 'admin');
    await page.fill('input[placeholder="Senha"]', 'nova_senha_2026');
    await page.click('button[type="submit"]');
    
    // Verificar se entrou no /admin
    await page.waitForURL('**/admin');
    console.log('Login com nova senha: SUCESSO');

  } catch (e) {
    console.error('Falha no teste:', e);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
