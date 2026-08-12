# Auditoria Taste — header e modal de produto

## Diagnóstico

- O header estava visualmente mais alto do que precisava: 62 px, logo de 168 px e controles de 42 px faziam o chrome competir com o hero.
- O modal de comparação chegava a 850 px de largura e 710 px de altura, com uma área de imagem de pelo menos 390 px. Para uma ação rápida de comparação, isso criava sensação de página interna dentro de um modal.
- O modal tratava imagem, título, preços e ofertas com peso semelhante; faltava um ponto de entrada visual.
- Em telas pequenas, a quantidade de superfície ocupada reduzia a percepção de contexto e tornava o fechamento/retorno mais pesado.

## Direção aplicada

- Header desktop reduzido para 54 px, preservando logo legível e navegação completa.
- Controles e CTA do header reduzem alguns pixels, mantendo área de toque adequada.
- Modal passa para no máximo 760 px de largura e aproximadamente 620 px de altura útil.
- A imagem do produto vira um hero editorial lateral: fotografia contextual de supermercado, overlay profundo, produto centralizado em superfície branca e selo discreto de comparação.
- O cabeçalho textual do produto recebe fundo tonal suave, título menor e mais preciso, seguido por faixa compacta de menor/médio/maior preço.
- Ofertas ficam em região rolável compacta, preservando todas as opções sem alongar o modal.
- No mobile, o modal vira composição próxima a bottom sheet, com hero horizontal de 142 px e conteúdo abaixo.
- Motion permanece curto e funcional e o modo `prefers-reduced-motion` continua respeitado.

## Princípio

O modal deve responder rapidamente: **o que é → qual é o menor preço → onde está → qual ação tomar**, sem parecer uma página inteira sobreposta à homepage.
