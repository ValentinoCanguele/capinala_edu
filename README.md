# Capinala Edu — Gestão Escolar

Sistema de gestão escolar modular: backend API (Next.js) e frontend (Vite + React). Suporta alunos, turmas, notas, frequência, boletins, horários, comunicados, finanças (categorias, lançamentos, parcelas, relatórios), módulos e auditoria.

## Estrutura do repositório

| Pasta / ficheiro | Descrição |
|------------------|------------|
| **server/** | Backend Next.js (porta 8082): API, lib/escola (serviços, regras, schemas), lib/core (health, cache, eventos, jobs, etc.). |
| **gestao-escolar/** | Frontend Vite + React (porta 5173): páginas, React Query, contexto de auth. |
| **docs/** | Documentação: arquitetura, API, base de dados, como rodar, análise de ficheiros. |
| **COMO-RODAR.md** | Guia passo a passo para levantar o sistema (DB, migrações, backend, frontend). |
| **docker-compose.yml** | PostgreSQL local para desenvolvimento. |

## Quick start

1. **Base de dados:** PostgreSQL (Docker, local ou Supabase). Ver [COMO-RODAR.md](COMO-RODAR.md).
2. **Variáveis:** Em `server/` criar `.env` com `DATABASE_URL` e `JWT_SECRET`.
3. **Migrações:** `cd server && npm run db:migrate`
4. **Backend:** `cd server && npm run dev` → http://localhost:8082
5. **Frontend:** `cd gestao-escolar && npm run dev` → http://localhost:5173
6. **Login de teste:** admin@escola.demo / admin123

## Documentação completa

- **[Índice da documentação](docs/INDICE-DOCUMENTACAO.md)** — Lista de todos os documentos.
- **[Como rodar](COMO-RODAR.md)** — Configuração do ambiente e execução.
- **[Arquitetura](docs/ARQUITETURA.md)** — Camadas, core, domínio escola, frontend.
- **[Referência da API](docs/API-REFERENCIA.md)** — Endpoints e autenticação.
- **[Base de dados](docs/BASE-DADOS.md)** — Migrations e nano funções SQL.
- **[Análise de ficheiros e funções](docs/ANALISE-ARQUIVOS-E-FUNCOES.md)** — Índice detalhado do código.
- **[Base do projeto (módulo escola)](docs/BASE-PROJETO-ESCOLA.md)** — Contrato e convenções.
- **[Core modular e extensível](docs/CORE-MODULAR-EXTENSIVEL.md)** — Especificação do core e serviços internos.

## Tecnologias

- **Backend:** Node.js, Next.js (Pages Router), PostgreSQL (pg), Zod, JWT (jose).
- **Frontend:** React, Vite, React Query, React Hook Form, Zod, Tailwind CSS, Lucide.
- **DB:** PostgreSQL; migrações em `server/migrations/`.

## Licença

Projeto privado.
