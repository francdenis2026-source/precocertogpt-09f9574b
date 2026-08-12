# Auditoria visual da homepage — direção Taste

Esta auditoria acompanha o refinamento da homepage sem alterar sua lógica funcional.

## Diagnóstico

- O hero tinha dois conjuntos concorrentes de benefícios: cartões laterais e a faixa de três atalhos logo abaixo. Isso enfraquecia o foco principal da página: a busca.
- A imagem de fundo fixa da homepage estava visível demais nas superfícies claras, criando ruído atrás de seções que deveriam ser calmas.
- A faixa de atalhos tinha sombra e volume próximos aos do hero, competindo com ele por atenção.
- Categorias, produtos e estabelecimentos usavam elevação semelhante; faltava uma hierarquia mais editorial entre conteúdo primário e apoio.
- Os cards de produto estavam compactos, mas ainda podiam priorizar melhor nome, preço e loja, com menos decoração.
- As faixas de Cesta e Comerciante estavam visualmente fortes, porém próximas de banners promocionais altos. O objetivo é mantê-las comerciais, mas mais proporcionais.
- O footer precisava conservar a marca ampliada solicitada, porém com uma hierarquia mais tranquila entre logo, descrição, navegação e faixa inferior.

## Direção aplicada

- Busca passa a ser o único ponto focal do hero; cartões laterais são retirados da composição visual.
- Hero mais baixo e mais largo no conteúdo, preservando título, descrição, busca e atalhos rápidos.
- Background global reduzido para textura ambiental, não conteúdo concorrente.
- Faixa de atalhos mais discreta, com menor elevação, radius e altura.
- Categorias e lojas mais planas, compactas e escaneáveis.
- Cards de produto com canvas consistente, imagem centralizada, hierarquia mais forte para preço e hover de apenas 2px.
- Seção de comparação preserva contraste escuro, mas reduz efeito de painel/glass.
- Cesta e comercial ficam mais baixos e editoriais, mantendo imagens profissionais.
- Logos do header e footer permanecem grandes e legíveis.
- Transições ficam restritas a controles e elementos interativos, com 160–210ms e suporte a `prefers-reduced-motion`.

## Princípio visual

A homepage deve comunicar em uma leitura curta: **pesquisar → comparar → escolher → economizar**, com uma única ação dominante por região e sem aparência de dashboard ou template genérico.
