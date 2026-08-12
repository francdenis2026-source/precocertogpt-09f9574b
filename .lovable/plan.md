# Plan: Norte Concurso - Fase 2 (Núcleo de Estudos)

Transformar o projeto atual "PreçoCerto" na plataforma "Norte Concurso", preservando a infraestrutura técnica (Supabase, Auth, RLS) e implementando o ambiente de estudos funcional para o aluno e ferramentas administrativas para gestão de conteúdo.

## User Review Required

> [!IMPORTANT]
> A Fase 2 requer a criação de um novo conjunto de tabelas no Supabase para gerenciar concursos, disciplinas, questões e planos de estudo. Vou adaptar a infraestrutura existente (User Profiles, Roles) sem apagar dados.

- **Navegação**: O menu lateral do aluno deve ser o centro da experiência.
- **Hierarquia de Dados**: O sistema será alimentado seguindo a estrutura: Segmento > Carreira > Órgão > Concurso > Cargo > Edital > Disciplina > Assunto > Subassunto.
- **Banco de Dados Externo**: Como o banco é externo, fornecerei as SQL Migrations para execução manual se o acesso direto falhar.

## Proposed Changes

### 1. Auditoria e Rebranding Técnico
- Renomear referências visuais de "PreçoCerto" para "Norte Concurso" (Logo, Títulos, OG Tags).
- Manter `src/lib/supabase.ts`, `src/lib/roles.ts` e a tabela `user_roles`.
- Adaptar o `AdminDashboard` para gerenciar concursos e questões em vez de mercados e produtos.

### 2. Infraestrutura de Dados (Migrations SQL)
Implementar o esquema relacional completo no Supabase:
- **Catálogo**: `segments`, `careers`, `organizations`, `contests`, `positions`.
- **Conteúdo**: `disciplines`, `subjects`, `subsubjects`, `contest_syllabus_items`.
- **Questões**: `questions`, `question_alternatives`, `question_answers`.
- **Estudos**: `study_plans`, `study_sessions`, `mock_exams`, `error_notebooks`, `review_schedules`.

### 3. Área do Aluno (Frontend)
- **Dashboard Real**: KPIs de tempo estudado, % de acertos e progresso no edital.
- **Catálogo de Concursos**: Listagem profissional com filtros por carreira e estado.
- **Ambiente de Questões**: Interface de resolução com cronômetro, anotações e feedback imediato.
- **Edital Verticalizado**: Acompanhamento granular do progresso por assunto.

### 4. Painel Administrativo
- **Gestor de Questões**: Interface para cadastro manual e importação via CSV.
- **Editor de Concursos**: Vínculo de cargos, editais e pesos de disciplinas.
- **Monitoramento**: Logs de auditoria e métricas de conteúdo (questões por matéria).

### 5. Planejador de Estudos (Fase 2)
- Motor de regras para gerar cronogramas baseados em peso, prioridade e disponibilidade do aluno.
- Sistema de revisões programadas (24h, 7d, 30d).

## Technical Details

- **Store/State**: Migrar do `catalog.ts` (mock local) para chamadas Supabase reais em todas as novas entidades.
- **RLS**: Garantir que `auth.uid()` proteja `study_plans` e `practice_answers`.
- **PDF Export**: Implementar exportação de planos e editais usando `jspdf`.
- **Performance**: Paginação rigorosa no banco de questões (PostgREST).

```text
Evolução da Arquitetura:
[Auth/Profiles] -> Mantido da Fase 1
[Catalog Mock]  -> Substituído por [Supabase DB (Concursos/Questões)]
[Landing Page]  -> Focada em Carreiras Públicas
[Admin Panel]   -> Expandido para Gestão Educacional
```
