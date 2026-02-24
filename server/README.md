# API Gestão Escolar

Backend Next.js (porta 8082) para o módulo escola. O frontend em `gestao-escolar` faz proxy de `/api` para esta app em desenvolvimento.

**Guia completo para rodar o sistema:** [COMO-RODAR.md](../COMO-RODAR.md) (na raiz do repositório).

## Requisitos

- Node 18+
- PostgreSQL (variável `DATABASE_URL`)

## Instalação

```bash
cd server
npm install
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

- `DATABASE_URL` — conexão Postgres (ex.: `postgresql://user:pass@localhost:5432/gestao_escolar`)
- `JWT_SECRET` — segredo para assinatura do JWT (produção: mínimo 32 caracteres)

## Base de dados

**PostgreSQL local (Homebrew):** para instalar, iniciar o serviço e correr as migrações de uma vez, no **Terminal** (fora do Cursor):

```bash
cd "caminho/para/supabase-master/server"
bash scripts/setup-postgres.sh
```

(Vai pedir a tua palavra-passe no `sudo`. Se aparecer erro de lock do Homebrew, espera que outro `brew install` termine.)

Criar só as tabelas e seed (com `DATABASE_URL` já definida em `server/.env`):

```bash
npm run db:migrate
```

## Desenvolvimento

```bash
npm run dev
```

Servidor em http://localhost:8082.

## Testes

```bash
npm run test
```

## Rotas da API

- `POST /api/auth/login` — body: `{ email, password }`; retorna `{ token, papel, userId }`
- `GET /api/escola/meu-papel` — requer Auth; retorna `{ papel, userId, pessoaId, escolaId }`
- `GET /api/escola/meus-filhos` — requer Auth (papel responsavel)
- `GET|POST /api/escola/alunos` — lista / criar
- `GET|PUT|DELETE /api/escola/alunos/[id]`
- `GET|POST /api/escola/turmas` — lista / criar
- `GET|PUT|DELETE /api/escola/turmas/[id]`
- `GET /api/escola/turmas/[id]/alunos`
- `GET|POST /api/escola/disciplinas`, `GET|PUT|DELETE /api/escola/disciplinas/[id]`
- `GET|POST /api/escola/anos-letivos`
- `GET /api/escola/periodos?anoLetivoId=`
- `POST /api/escola/periodos/ensure` — body: `{ anoLetivoId }`
- `GET /api/escola/notas?turmaId=&periodoId=`, `POST /api/escola/notas` (uma nota)
- `POST /api/escola/notas/batch` — body: `{ turmaId, periodoId ou bimestre (1-4), notas: [{ alunoId, valor }] }`
- `GET /api/escola/boletins/[alunoId]`
- `GET /api/escola/aulas?turmaId=&dataAula=`
- `POST /api/escola/aulas/create` — body: `{ turmaId, disciplinaId, dataAula }`
- `GET|POST /api/escola/frequencia/[aulaId]` — POST body: `{ items: [{ alunoId, status }] }`

Documentação detalhada: `docs/ANALISE-ARQUIVOS-E-FUNCOES.md` e `docs/BASE-PROJETO-ESCOLA.md`.
