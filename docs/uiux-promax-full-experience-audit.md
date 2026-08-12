# Auditoria UI/UX Pro Max — PreçoCerto

## Escopo

Auditoria transversal da experiência pública e operacional do PreçoCerto: homepage, header, footer, hero, busca/autocomplete, resultados, filtros, cards, estabelecimentos, cesta, formulários, login, cadastro, modais, drawers e painéis.

## Regra de segurança

Nenhuma rotina de Supabase foi alterada. Permanecem intactos cliente, autenticação, consultas, RPCs, mutações, realtime, catálogo remoto, checkout e regras de negócio. O trabalho limita-se à fundação visual e comportamental já existente em `UiUxProMaxFoundation.tsx`.

## Diagnóstico

1. A homepage premium atual já possui hierarquia própria mais madura; ela não deve ser descaracterizada por regras globais antigas.
2. As telas internas ainda herdavam uma escala antiga com muitos textos de 8–12px em resultados, filtros, tabelas, cards, footer e painéis.
3. Login e cadastro tinham boa estrutura em duas áreas, mas labels, ajuda, links e itens institucionais estavam pequenos para leitura confortável.
4. A página de resultados priorizava densidade em vez de decisão: nome, estabelecimento, preço, filtros e metadados tinham pesos muito próximos ou pequenos.
5. Headers e footers internos possuíam navegação e informações importantes menores do que a escala adotada na homepage atual.
6. Autocomplete e sugestões precisam sempre existir em camada superior às seções seguintes e limitar rolagem ao próprio popover.
7. Modais devem limitar a rolagem ao conteúdo interno e impedir overscroll no plano de fundo.
8. Painéis administrativos precisam permanecer densos, porém com mínimo legível e alvos de interação adequados, sem transformar toda a interface em cards grandes.
9. Dark mode possui muitas regras históricas com overrides; a fundação deve corrigir contraste sem criar outra folha concorrente.
10. Há grande quantidade de CSS histórico em `index.css`, inclusive regras antigas com `!important`. Por isso, esta intervenção não adiciona nova folha global: consolida os ajustes no componente de fundação UI UX Pro Max já carregado pelo app.

## Ajustes aplicados

- Escala tipográfica mínima elevada em navegação, filtros, resultados, cards, estabelecimentos, cesta, footer e painéis.
- Contraste reforçado para textos auxiliares em light e dark mode.
- Nomes de estabelecimentos passam a receber cor de decisão nas superfícies de resultado.
- Inputs/selects/textareas mantêm 16px no mobile para evitar zoom automático e ganhar legibilidade.
- Touch targets essenciais passam a respeitar aproximadamente 44px.
- Busca/autocomplete recebe camada elevada, viewport-safe height e overscroll interno.
- Resultados priorizam nome do produto, estabelecimento e preço antes dos metadados.
- Login/cadastro recebem labels, ajuda, links, campos e CTA em escala mais confortável sem alterar handlers ou autenticação.
- Heros internos e chamadas recebem proporção mais consistente.
- Footer interno recebe links e texto institucional legíveis.
- Painéis ganham densidade mais humana: menus, KPIs, filtros e linhas deixam de usar microtipografia excessiva.
- Modais recebem limite de altura e rolagem interna, mantendo o fundo bloqueado quando o overlay está presente.
- `prefers-reduced-motion` permanece respeitado.

## Critério de validação

Revisar desktop, tablet e mobile; conferir foco por teclado, contraste, ausência de overflow lateral, dropdowns sobrepostos, modais sem rolagem de fundo, estados de inputs, leitura de resultados e consistência entre light/dark mode.
