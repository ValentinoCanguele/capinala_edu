# Expansão do frontend: mais funções, serviços e detalhes

Documento que expande o [plano único frontend](.cursor/plans/plano_único_frontend_completo_9ecb4063.plan.md) com funções adicionais, pequenas utilidades, serviços modernos e detalhes de UX/tecnologia. Mantém a base do projeto (Vite, React, Tailwind, React Query) e adiciona camadas opcionais e ferramentas recentes.

---

## 1. Serviços e utilitários (lib / utils)

| Serviço / ficheiro | Descrição | Estado |
|--------------------|-----------|--------|
| **storage.ts** | `localStorage` / `sessionStorage` com JSON, TTL opcional e prefixo por app. Funções: `getItem`, `setItem`, `removeItem`, `getItemWithExpiry`, `setItemWithExpiry`. | Novo |
| **formatters.ts** | Já existe: `formatKz`, `formatPhone`, `formatRelativeTime`, `formatDateShort`, `formatNIF`, `truncateText`, `formatBytes`. | Existente |
| **print.ts** | Serviço de impressão: `printWindow()`, `printElement(id)` para relatórios; aplica classe `.print-only` e restaura após impressão. | Novo |
| **downloadCsv.ts** | Já existe: download de CSV com auth. | Existente |
| **copyToClipboard.ts** | Já existe: copiar para clipboard com feedback. | Existente |
| **api/retry.ts** | `withRetry(fn, { attempts, delayMs })` — retry exponencial para falhas de rede ou timeouts. Usado em chamadas críticas (ex.: envio de notas em lote). | Novo |

---

## 2. Hooks modernos

| Hook | Descrição | Estado |
|------|-----------|--------|
| **useDebounce** / **useDebouncedState** | Debounce para pesquisa e filtros; evita chamadas excessivas. | Existente |
| **useSaveShortcut** | Atalho Ctrl/Cmd+S para submeter formulário. | Existente |
| **useAutoSave** | Rascunho automático em formulários longos. | Existente |
| **useQueryState** | Sincroniza estado (filtro, ordenação, página) com os query params da URL. Permite partilhar link com filtros e voltar atrás com o browser. | Novo |
| **usePrefetch** | Prefetch de React Query ao hover em links (ex.: sidebar) para reduzir tempo de carregamento percebido. | Opcional |
| **useFocusTrap** | Trap de foco em modais e sheets (acessibilidade). | Opcional (pode usar atributos ou lib leve) |

---

## 3. Camada de API (api/)

| Aspecto | Descrição | Estado |
|---------|-----------|--------|
| **client.ts** | Timeout (20s), 401 → evento `auth:unauthorized`, headers de auth. | Existente |
| **retry.ts** | Função `withRetry(fn, { attempts, delayMs })` para repetir pedidos em falha de rede ou 5xx. | Novo |
| **AbortController** | Já usado no client para cancelar pedidos em timeout. | Existente |
| **Request deduplication** | React Query deduplica por queryKey; não é necessário duplicar na camada fetch. | N/A |

---

## 4. React Query: padrões avançados

| Padrão | Uso no projeto |
|--------|-----------------|
| **Optimistic updates** | Em mutations de alta frequência (ex.: notas em lote): atualizar cache antes da resposta; em caso de erro, reverter e mostrar toast. |
| **Prefetch on hover** | Em `NavLink` da sidebar: `onMouseEnter` com `queryClient.prefetchQuery` para a rota de destino (dados da lista ou dashboard). |
| **Persistência do QueryClient** | Opcional: `@tanstack/react-query-persist-client` + `localStorage` para manter cache entre sessões (útil para listas grandes). |
| **Stale-while-revalidate** | Configuração atual (`staleTime`, `gcTime`) já permite mostrar dados em cache e revalidar em background. |
| **Suspense** | Já usado com `lazy()` e `<Suspense>` por rota; pode adicionar `<Suspense>` por secção em páginas pesadas. |

---

## 5. UX e detalhes de interface

| Detalhe | Descrição |
|---------|-----------|
| **Skeleton loaders** | Manter `PageSkeleton` e `SkeletonTable`; usar em todas as listas e detalhes que dependem de API. |
| **Empty states** | `EmptyState` com ilustração ou ícone, título e CTA (ex.: "Nenhum aluno" → "Adicionar aluno"). |
| **Validação inline** | react-hook-form + zod: mensagens por campo e `formState.errors`; focar primeiro campo com erro no submit. |
| **Toasts** | react-hot-toast: sucesso/erro com mensagem clara; duração maior para erros; posição consistente (ex.: bottom-right). |
| **Confirmação destrutiva** | `ConfirmDeleteModal` antes de eliminar; botão primário "Eliminar" em estilo destrutivo. |
| **ARIA live** | Para notificações dinâmicas ou estado "A guardar.../Guardado": `aria-live="polite"` e `role="status"`. |
| **Breadcrumbs** | Já no header; manter microcopy claro (labels em `config/routes.ts`). |
| **Tabelas** | Persistir visibilidade de colunas e ordenação em URL (via `useQueryState`) ou em `storage.ts` por página. |
| **Paginação** | Persistir `pageSize` em localStorage (ex.: chave `gestao-escolar-alunos-pageSize`). |

---

## 6. Tecnologias e ferramentas recentes (recomendações)

| Área | Sugestão | Notas |
|------|----------|--------|
| **Runtime** | Node 20+ / 22 LTS | Para Vite 6 e TypeScript 5.6. |
| **Build** | Vite 6 | Já em uso; HMR rápido e tree-shaking. |
| **Estado servidor** | TanStack Query v5 | Já em uso; manter padrões de invalidação e mutations. |
| **Formulários** | react-hook-form + zod | Já em uso; manter `@hookform/resolvers/zod`. |
| **Estilo** | Tailwind 3.x | Sem novo design system; variáveis `studio-*` e `gibbon-*`. |
| **Ícones** | Lucide React | Leve e consistente; já em uso. |
| **Datas** | Intl (nativo) + formatters.ts | Evitar nova dependência; `formatRelativeTime`, `formatDateShort` já existem. |
| **Virtualização** | @tanstack/react-virtual (opcional) | Para listas muito longas (ex.: >100 linhas); não obrigatório em todas as tabelas. |
| **PWA** | Opcional | Service Worker para cache de assets e fallback offline; `workbox` ou Vite PWA plugin. |
| **i18n** | Opcional | Extrair strings para chaves (ex.: `t('alunos.lista.vazia')`) quando houver requisito multi-idioma. |
| **Testes** | Vitest + React Testing Library | Para hooks e componentes críticos; E2E com Playwright conforme regras do projeto. |

---

## 7. Pequenas funções por módulo (exemplos)

- **Alunos:** Exportar lista filtrada (CSV), impressão da lista, cópia de link "Ver aluno" para clipboard.
- **Turmas:** Exportar turma com alunos (CSV), impressão do horário da turma.
- **Notas / Pautas:** Impressão da pauta, export Excel (se backend ou lib permitir).
- **Finanças:** Impressão de relatório DRE e fluxo de caixa; export CSV já existente.
- **Comunicados:** Marcar como lido (quando backend suportar); tempo relativo na lista (`formatRelativeTime`).
- **Dashboard:** Atualizar dados em intervalo (polling) ou desativar quando tab não está visível (`document.visibilityState`).
- **Global:** Command Palette (⌘K) já existe; atalhos de teclado por página (ex.: N = novo, E = editar) opcional.

---

## 8. Ficheiros novos (resumo)

| Ficheiro | Descrição |
|----------|-----------|
| `gestao-escolar/src/lib/storage.ts` | Helpers de localStorage/sessionStorage com TTL e prefixo. |
| `gestao-escolar/src/hooks/useQueryState.ts` | Hook para estado sincronizado com URL (filtros, sort, page). |
| `gestao-escolar/src/utils/print.ts` | Funções `printWindow()` e `printElement(id)`. |
| `gestao-escolar/src/api/retry.ts` | Wrapper `withRetry` para pedidos com retry exponencial. |
| `docs/FRONTEND-EXPANSAO-SERVICOS-DETALHES.md` | Este documento. |

---

## 9. Referências

- [FRONTEND-NAVEGACAO-PERMISSOES.md](FRONTEND-NAVEGACAO-PERMISSOES.md) — Navegação, sidebar, barra contextual, permissões.
- [BASE-PROJETO-ESCOLA.md](BASE-PROJETO-ESCOLA.md) — Contrato e evolução do módulo escola.
- [INDICE-DOCUMENTACAO.md](INDICE-DOCUMENTACAO.md) — Índice geral.
