# Plan: Melhores na Comparação Prática

Melhorar a seção de "Comparação Prática" na homepage com destaque nos produtos, rotação aleatória de itens e melhorias de contraste e UI.

## User Review Required

> [!IMPORTANT]
> A melhoria será aplicada na seção "Comparação Prática" (disponível na `HomePremium.tsx`). Confirme se esta é a seção desejada, pois o projeto possui múltiplas versões de homepage.

## Proposed Changes

### 1. Destaque do Produto e UI (CSS)
- Aumentar o tamanho do container de imagem do produto na seção de comparação.
- Melhorar o contraste dos painéis (glassmorphism mais nítido ou bordas mais definidas).
- Aplicar efeitos de "glow" sutil nos produtos em destaque.
- Ajustar tipografia para maior legibilidade em fundos escuros.

### 2. Rotação Aleatória de Produtos (React)
- Implementar um `useEffect` para selecionar periodicamente um produto aleatório do catálogo que possua múltiplas ofertas.
- Garantir que a troca de produto ocorra com uma transição suave (fade).
- Manter a lógica de "melhor oferta" para o produto selecionado.

### 3. Melhoria de Visualização
- Adicionar badges de destaque nos produtos da propaganda.
- Melhorar os micro-cards de ofertas comparativas (maior contraste entre o preço líder e os demais).

## Technical Details

- **Arquivos afetados:**
    - `src/pages/HomePremium.tsx`: Lógica de seleção aleatória.
    - `src/pages/HomePremium.css`: Estilização e animações.
- **Lógica de Seleção:**
    - Filtrar produtos com `storeCount > 1`.
    - Usar um `setInterval` ou disparar a troca em eventos específicos.
- **Design:** Manter a consistência com o sistema de design "Taste" já implantado.
