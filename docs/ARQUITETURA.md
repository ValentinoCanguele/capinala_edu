# Arquitetura do projeto

## Visão geral

O sistema divide-se em:

1. **Backend (server/)** — API Next.js na porta 8082.
2. **Frontend (gestao-escolar/)** — App Vite + React na porta 5173; proxy de `/api` para o backend.
3. **Base de dados** — PostgreSQL; schema e funções via migrations em `server/migrations/`.

## Camadas do backend

```
Request → pages/api (rotas) → lib/escola/services (orquestração) → lib/escola/regras + DB
                ↓
           lib/core (health, cache, auth, eventos, jobs, etc.)
```

- **pages/api/** — Rotas HTTP. Fazem `requireAuth`, validam body com Zod, chamam um serviço, devolvem JSON.
- **lib/escola/services/** — Serviços de domínio (alunos, turmas, notas, finanças, etc.). Acedem ao DB e às regras.
- **lib/escola/regras/** — Regras de negócio puras (médias, finanças, frequência). Sem acesso direto ao DB.
- **lib/escola/schemas/** — Schemas Zod para validação de entrada.
- **lib/core/** — Serviços internos: health, config, cache, rateLimit, tokenRefresh, eventBus, jobs, quotas, pagination, etc. Expansão sem alterar o domínio escola.

## Camadas do frontend

```
UI (pages/components) → data/escola (React Query) → api/client (fetch + Bearer) → Backend
```

- **pages/** — Páginas e rotas (Login, Layout, Dashboard, Alunos, Turmas, Finanças, etc.).
- **data/escola/** — Hooks React Query (queries e mutations) que chamam a API.
- **api/client.ts** — Cliente HTTP; envia `Authorization: Bearer <token>`.
- **contexts/** — AuthContext, ThemeContext.

## Base de dados

- **Migrations** — Ficheiros SQL em `server/migrations/` (001_initial até 010_nano_funcoes).
- **Nano funções** — Funções PostgreSQL pequenas e reutilizáveis (ex.: `fn_hoje_iso()`, `fn_financeiro_valor_com_multa_juros`, `fn_media_aprovacao`). Ver [BASE-DADOS.md](BASE-DADOS.md).

## Autenticação

- Login: `POST /api/auth/login` (email, password) → devolve `{ token, papel, userId }`.
- Renovação: `POST /api/auth/refresh` com header `Authorization: Bearer <token>` → novo token.
- Rotas protegidas: header `Authorization: Bearer <token>`; em 401 o frontend redireciona para login.

## Eventos internos

O backend emite eventos (EventBus em `lib/core/events/bus.ts`) para desacoplar serviços, por exemplo:

- `aluno.criado` — após criar aluno (payload: aluno, escolaId, userId).
- `turma.criada` — após criar turma.

Podem ser usados para notificações, webhooks ou jobs.

## Referências

- Índice de ficheiros e funções: [ANALISE-ARQUIVOS-E-FUNCOES.md](ANALISE-ARQUIVOS-E-FUNCOES.md).
- Core e serviços internos: [CORE-MODULAR-EXTENSIVEL.md](CORE-MODULAR-EXTENSIVEL.md).
