# Frontend — Resumo do que foi implementado

Resumo das melhorias aplicadas no frontend (gestão escolar) conforme plano e expansão de serviços. Detalhes técnicos em [FRONTEND-EXPANSAO-SERVICOS-DETALHES.md](FRONTEND-EXPANSAO-SERVICOS-DETALHES.md) e [FRONTEND-NAVEGACAO-PERMISSOES.md](FRONTEND-NAVEGACAO-PERMISSOES.md).

---

## 1. Prefetch na sidebar (onMouseEnter)

Ao passar o rato sobre um item da sidebar, os dados da rota são pré-carregados para acelerar a navegação.

**Rotas com prefetch:** Início (dashboard), Alunos, Turmas, Comunicados, Anos letivos, Disciplinas, Salas, Módulos, Utilizadores, Finanças (dashboard), Ocorrências, Atas, Matrizes, Horários.

**Ficheiros:** `gestao-escolar/src/data/escola/queries.ts`, `gestao-escolar/src/data/escola/financasQueries.ts`, `gestao-escolar/src/pages/Layout.tsx`.

---

## 2. Filtro / estado na URL (useQueryState)

O parâmetro de pesquisa ou filtros fica na URL (`?q=...` ou `?turmaId=...&alunoId=...&resolvido=...`), permitindo partilhar links e usar o botão “voltar” do browser.

| Página        | Parâmetros na URL |
|---------------|-------------------|
| Alunos        | `q` (pesquisa)    |
| Turmas        | `q` (pesquisa)    |
| Utilizadores  | `q` (pesquisa)    |
| Disciplinas   | `q` (pesquisa)    |
| Salas         | `q` (pesquisa)    |
| Anos letivos  | `q` (pesquisa)    |
| Atas          | `q` (pesquisa), `turmaId` (filtro por turma) |
| Ocorrências   | `turmaId`, `alunoId`, `resolvido` |

**Hook:** `gestao-escolar/src/hooks/useQueryState.ts` (`useQueryState`, `useQueryStateMulti`, `useQueryStateNumber`).

---

## 3. Retry em mutations críticas (withRetry)

Em falhas de rede ou timeout, as seguintes mutations repetem o pedido até 3 vezes com backoff exponencial:

- **Notas em lote** — `useSaveNotasBatch`
- **Alunos** — `useCreateAluno`, `useUpdateAluno`
- **Turmas** — `useCreateTurma`, `useUpdateTurma`
- **Comunicados** — `useCreateComunicado`, `useUpdateComunicado`
- **Utilizadores** — `useCreateUsuario`
- **Disciplinas** — `useCreateDisciplina`, `useUpdateDisciplina`
- **Anos letivos** — `useCreateAnoLetivo`
- **Salas** — `useCreateSala`

**Ficheiros:** `gestao-escolar/src/api/retry.ts`, `gestao-escolar/src/data/escola/mutations.ts`.

---

## 4. Impressão (printElement)

Impressão apenas da área relevante (sem header/sidebar) nas páginas:

- **Pautas** — área `#pauta-print-area`
- **Boletim** — área `#boletim-print-area`

**Ficheiro:** `gestao-escolar/src/utils/print.ts` (`printWindow`, `printElement`).

---

## 5. Preferência da sidebar (storage.ts)

O estado “sidebar colapsada” é guardado com `storage.ts` (chave `sidebar-collapsed`), com migração automática do valor antigo em `localStorage` para a nova chave.

**Ficheiros:** `gestao-escolar/src/lib/storage.ts`, `gestao-escolar/src/pages/Layout.tsx`.

---

## 6. Ocorrências — filtro “Resolvidos”

Na página Ocorrências, além de “Todos” e “Pendentes”, foi adicionado o botão **Resolvidos** (`resolvido=true`), também refletido no parâmetro `resolvido` da URL.

---

## Refinamentos (acessibilidade e consistência)

- **aria-label** em campos de pesquisa/filtro: Alunos, Turmas, Disciplinas, Atas (pesquisa + select turma), Salas, Anos letivos, Utilizadores (já existia).
- **Atas**: estado inicial do filtro derivado de `filterFromUrl` (removido `useSearchParams` redundante).
- **Retry** também em updates: `useUpdateComunicado`, `useUpdateDisciplina`.

---

## Referência rápida

| Recurso        | Onde está |
|----------------|-----------|
| Prefetch       | `queries.ts` / `financasQueries.ts` — funções `prefetch*`; `Layout.tsx` — `SIDEBAR_PREFETCH` |
| useQueryState  | `hooks/useQueryState.ts`; usado nas páginas de listas acima |
| withRetry      | `api/retry.ts`; usado nas mutations listadas em `mutations.ts` |
| printElement   | `utils/print.ts`; usado em Pautas e Boletim |
| storage        | `lib/storage.ts`; usado para sidebar colapsada em Layout |
