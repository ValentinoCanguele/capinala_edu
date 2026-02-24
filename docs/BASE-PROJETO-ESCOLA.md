# Base do Projeto — Módulo Escola

## Contrato e imutabilidade

A base do sistema escolar é **imutável** em espírito: o projeto é construído sobre esta base. Pode-se **avançar em lógica e funções**, mas o **frontend permanece alinhado ao paradigma do Supabase Studio** (componentes, formulários com react-hook-form + zod, PageLayout/Sheets/Cards quando aplicável).

## Camadas

1. **lib/escola/** — Lógica, schemas Zod, regras, serviços, helpers. Sem lógica HTTP.
2. **pages/api/escola/** — Rotas HTTP (Next.js ou equivalente). Padrão: requireAuth, parse body com Zod, chamada a serviços.
3. **data/escola/** (frontend) — React Query (queries/mutations) que consomem as APIs.
4. **components/interfaces/Escola/** (frontend) — UI: listas, formulários, relatórios.

## Nomenclatura e convenções

- Schemas Zod em `lib/escola/schemas/`.
- Respostas API: sucesso = payload JSON; erro = `{ error: { message: string } }`.
- Autenticação: JWT no header `Authorization: Bearer <token>`.
- Papéis: admin, direcao, professor, responsavel, aluno.

## O que pode evoluir

- Novas funções em lib/escola (regras, validação, serviços, schemas).
- Novas rotas em pages/api/escola.
- Novos hooks em data/escola e novas páginas/componentes no frontend, mantendo o mesmo sistema de UI.

## Referência

- Índice de ficheiros e funções: `docs/ANALISE-ARQUIVOS-E-FUNCOES.md`.
