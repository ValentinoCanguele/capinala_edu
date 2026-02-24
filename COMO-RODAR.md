# Como rodar o sistema de Gestão Escolar

## 1. Base de dados (PostgreSQL)

Precisas de um PostgreSQL. Três opções:

### Opção 1 — Supabase (nuvem, sem instalar nada)

1. Cria uma conta em [supabase.com](https://supabase.com) (grátis).
2. **New project** → escolhe nome, password da base de dados (guarda-a) e região.
3. Quando o projeto estiver pronto: **Project Settings** (ícone engrenagem) → **Database**.
4. Em **Connection string** escolhe **URI** e copia. Vai parecer:
   ```text
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
5. Substitui `[YOUR-PASSWORD]` pela password que definiste no passo 2.
6. Coloca essa URL no `server/.env` (ver secção 2 abaixo) em `DATABASE_URL`.
7. Depois corre as migrações (secção 3).

Não precisas de instalar PostgreSQL nem Docker.

### Opção A — Docker

Se tiveres Docker instalado:

```bash
docker compose up -d
```

Isto sobe o Postgres na porta 5432 com:
- Utilizador: `gestao`
- Password: `gestao`
- Base: `gestao_escolar`

### Opção B — PostgreSQL instalado na máquina

Cria uma base de dados (por exemplo `gestao_escolar`) e anota o utilizador e a password.

---

## 2. Variáveis de ambiente do backend

Na pasta `server`, cria ou edita o ficheiro `.env`:

```env
# Opção 1 (Supabase): cola aqui a Connection string URI (com a password substituída)
# DATABASE_URL=postgresql://postgres.[REF]:TUA_PASSWORD@aws-0-xx.pooler.supabase.com:6543/postgres

# Opção A (Docker):
# DATABASE_URL=postgresql://gestao:gestao@localhost:5432/gestao_escolar

# Opção B (Postgres local): ajusta user, password e nome da base
# DATABASE_URL=postgresql://TEU_USER:TEU_PASSWORD@localhost:5432/gestao_escolar

DATABASE_URL=postgresql://gestao:gestao@localhost:5432/gestao_escolar
JWT_SECRET=um-segredo-forte-com-pelo-menos-32-caracteres
```

Descomenta a linha `DATABASE_URL` que corresponda à opção que usaste e apaga ou comenta as outras. Para **Opção 1 (Supabase)**, deixa só uma linha `DATABASE_URL=...` com o teu URI do Supabase.

---

## 3. Migrações

Com o Postgres a correr e o `DATABASE_URL` correto no `.env`:

```bash
cd server
npm run db:migrate
```

Isto cria as tabelas e insere o utilizador de teste.

---

## 4. Backend (API)

```bash
cd server
npm install   # só na primeira vez
npm run dev
```

A API fica em **http://localhost:8082**.

---

## 5. Frontend

Noutro terminal:

```bash
cd gestao-escolar
npm install   # só na primeira vez
npm run dev
```

O frontend fica em **http://localhost:5173** (ou outra porta se esta estiver ocupada). O Vite faz proxy de `/api` para o backend na porta 8082.

---

## 6. Login de teste

Após as migrações, podes entrar com:

- **Email:** admin@escola.demo  
- **Senha:** admin123  

---

## Resumo rápido (com Docker)

```bash
# 1. Subir Postgres
docker compose up -d

# 2. Configurar .env em server/ (DATABASE_URL=postgresql://gestao:gestao@localhost:5432/gestao_escolar)

# 3. Migrações
cd server && npm run db:migrate

# 4. Backend (terminal 1)
cd server && npm run dev

# 5. Frontend (terminal 2)
cd gestao-escolar && npm run dev
```

Abre o browser em http://localhost:5173 e faz login com admin@escola.demo / admin123.

---

## Resumo rápido (Opção 1 — Supabase)

1. [supabase.com](https://supabase.com) → New project → anota a password da base.
2. **Project Settings** → **Database** → **Connection string** (URI) → copia e substitui `[YOUR-PASSWORD]`.
3. Em `server/.env` coloca:  
   `DATABASE_URL=` + esse URI  
   e `JWT_SECRET=um-segredo-com-pelo-menos-32-caracteres`.
4. `cd server && npm run db:migrate`
5. `cd server && npm run dev` (e noutro terminal: `cd gestao-escolar && npm run dev`).
6. Browser em http://localhost:5173 → login **admin@escola.demo** / **admin123** ou **canguele@escola.demo** / **Manga@926445277.com**.
