# Gestão Escolar (frontend leve)

Frontend em **Vite + React** para o sistema de gestão escolar. Uma pasta, um `package.json`, sem monorepo e sem Turbo. Consome as APIs existentes em `apps/studio/pages/api/escola/*`.

## Requisitos

- Node 18+
- pnpm ou npm

## Instalação

```bash
cd gestao-escolar
pnpm install
# ou: npm install
```

## Desenvolvimento

```bash
pnpm dev
```

Abre em **http://localhost:5173**. O Vite faz proxy de `/api` para **http://127.0.0.1:8082**, então para usar as APIs do Studio você precisa rodar o Studio na porta 8082 (na raiz do repositório):

```bash
# Em outro terminal, na raiz do repo:
pnpm run:studio
```

Assim, as chamadas do frontend para `/api/escola/...` são encaminhadas ao Next.js do Studio.

## Build

```bash
pnpm build
```

Saída em `dist/`. Para produção, sirva com qualquer servidor estático ou use `pnpm preview` para testar.

## Produção e API

- **Só frontend**: build e hospedar em qualquer host estático.
- **Com APIs do Studio**: fazer deploy do Studio (ou só das rotas `/api/escola`) e configurar a variável `VITE_API_BASE` no build com a URL base da API (ex.: `https://seu-dominio.com`), para que as requisições não usem o proxy (que só existe em dev).

## Estrutura

```
gestao-escolar/
├── src/
│   ├── api/client.ts    # Cliente HTTP para /api/escola
│   ├── pages/           # Layout, Dashboard, Alunos, Turmas, Notas
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts       # Proxy /api → :8082
└── README.md
```

## Rotas da API (Studio)

O frontend está preparado para consumir:

- `GET  /api/escola/meu-papel` – teste de conexão
- `GET  /api/escola/meus-filhos` – filhos do responsável
- `POST /api/escola/alunos` – criar aluno
- `POST /api/escola/turmas` – criar turma
- `POST /api/escola/notas` – lançar nota
- `POST /api/escola/notas/batch` – lançamento em massa
- entre outras em `apps/studio/pages/api/escola/`.

Em desenvolvimento, com o proxy ativo, use sempre o path relativo (`/api/escola/...`) para evitar CORS.
