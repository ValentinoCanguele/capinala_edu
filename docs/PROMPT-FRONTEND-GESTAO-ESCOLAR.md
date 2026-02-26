# Prompt avançado — Frontend Gestão Escolar

Use este texto como referência ou prompt ao adicionar ou melhorar o frontend da aplicação **gestao-escolar**. O objetivo é manter o sistema organizado, profissional e em sincronia com o backend.

---

## Contexto

- **Especialista em sistema de gestão escolar.** O frontend (gestao-escolar) é a interface do Módulo Escola: alunos, turmas, notas, frequência, boletins, horários, comunicados, disciplinas, anos letivos, salas, finanças, módulos, perfil, utilizadores, etc.
- **Alinhado ao backend:** as APIs vivem em `server/pages/api/escola/`. Toda a funcionalidade nova deve existir primeiro no backend (serviços em `server/lib/escola/services/`, rotas em `server/pages/api/escola/`).
- **Base imutável:** respeitar o contrato em `docs/BASE-PROJETO-ESCOLA.md`. O frontend mantém o paradigma de UI do projeto (componentes partilhados, react-hook-form + zod, estilo Studio com variáveis CSS `--studio-*`).

---

## Camadas e organização

1. **Dados** — `gestao-escolar/src/data/escola/`
   - `queries.ts`: hooks de leitura (useAlunos, useTurmas, useFinancasDashboard, useModulos, useProfessores, etc.).
   - `mutations.ts`: hooks de escrita (useCreateAluno, useUpdateTurma, useSaveNotasBatch, etc.).
   - `financasQueries.ts` / `financasMutations.ts`: queries e mutations do módulo Finanças.
   - Tipos e chaves de React Query alinhados aos contratos das APIs.

2. **Páginas** — `gestao-escolar/src/pages/`
   - Uma página por rota; orquestra dados (hooks) e UI (componentes).
   - Não conter lógica de negócio além da orquestração (chamadas a hooks e passagem de callbacks).
   - Páginas longas devem ser divididas: extrair listas, modais e, se útil, hooks de estado (ex.: useAlunosPageState).

3. **Componentes** — `gestao-escolar/src/components/`
   - **shared/** — Modal, EmptyState, PageHeader, PageSkeleton (TableSkeleton, StatCardSkeleton), ErrorBoundary, ListResultSummary, ModulePlaceholder. Reutilizáveis em todo o app.
   - **alunos/** — AlunoForm, AlunosList. Componentes específicos de alunos.
   - **turmas/** — TurmaForm, TurmasList, GerirMatriculasModal. Componentes específicos de turmas.
   - **financas/** — Componentes específicos de finanças (quando extraídos das páginas).
   - Cada pasta expõe um `index.ts` para exportar os componentes; na raiz de `components/` mantêm-se re-exports para não quebrar imports existentes.

4. **Configuração** — `gestao-escolar/src/config/`
   - `routes.ts`: fonte única para rotas, labels de breadcrumb, second bar (tabs). Layout e secondBarConfig derivam daqui.

---

## Regras de implementação

- **Cada elemento no seu lugar:** dados em `data/escola/`, listas/forms em `components/<domínio>/`, UI genérica em `components/shared/`. Evitar páginas monolíticas com centenas de linhas.
- **Formulários:** react-hook-form + zod; schemas em `gestao-escolar/src/schemas/` (ex.: aluno, turma, disciplina). Usar os mesmos padrões de label, input, botões (btn-primary, btn-secondary, input, label).
- **Nomenclatura:** prefixos consistentes: `isLoading`, `hasFilter`, `canEdit`; handlers `handleSubmit`, `handleClose`; callbacks de props `onSave`, `onCancel`.
- **Estados de UI:** loading (skeleton), erro (mensagem clara), vazio (EmptyState com ação opcional), sucesso (conteúdo). Preferir early returns para guard clauses.
- **Rotas e navegação:** rotas aninhadas onde fizer sentido (ex.: Finanças com sub-rotas dashboard, categorias, lançamentos, parcelas, relatórios, configuração). Second bar e breadcrumbs derivados de `config/routes.ts`.
- **Code-splitting:** as páginas são carregadas sob demanda em `App.tsx` com `React.lazy(() => import('./pages/...'))` e `<Suspense fallback={…}>`. Novas páginas devem ser registadas como lazy no `App.tsx` para manter o bundle inicial reduzido.

---

## Sincronização com o backend

- **Ordem recomendada:** 1) API e serviços no backend; 2) hooks em `data/escola/` (queries/mutations); 3) UI (páginas e componentes).
- Ao criar nova funcionalidade, verificar em `server/pages/api/escola/` se a rota existe; em `server/lib/escola/services/` se o serviço existe. Só então adicionar o hook no frontend e a página/componente.
- **Documentar:** ao adicionar ficheiros ou funções relevantes, actualizar `docs/ANALISE-ARQUIVOS-E-FUNCOES.md` no mesmo estilo (lista de ficheiros e funções).

---

## O que evitar

- Páginas com mais de 200–300 linhas sem extração de listas ou modais.
- Lógica de negócio (cálculos, regras de negócio) nas páginas; preferir serviços no backend e hooks que os consumam.
- Duplicação de labels e rotas entre Layout e secondBarConfig; usar a configuração centralizada.
- Novos sistemas de UI ou design systems diferentes do existente (manter Tailwind, classes studio-*, componentes partilhados atuais).

---

## Referências no repositório

- `docs/BASE-PROJETO-ESCOLA.md` — Contrato e imutabilidade.
- `docs/ANALISE-ARQUIVOS-E-FUNCOES.md` — Índice de ficheiros e funções (backend e frontend).
- `gestao-escolar/src/config/routes.ts` — Configuração centralizada de rotas, second bar e breadcrumbs.
- Regras do projeto: `.cursor/rules/studio-ui.mdc`, `studio-best-practices.mdc`, `escola-base-imutavel.mdc`.
