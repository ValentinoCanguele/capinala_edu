# Dependências e atualizações

## Visão geral

- **server**: Next.js 14, Node 18+, PostgreSQL (`pg`), JWT (`jose`), validação (`zod`).
- **gestao-escolar**: Vite 6, React 18, React Query, React Router, Tailwind CSS.

Os `package.json` usam intervalos semver (ex.: `^14.2.0`). O `npm install` instala a versão mais recente **compatível** com esse intervalo.

## Atualizar dentro do intervalo atual

Para obter as últimas versões **dentro** do que já está definido (patch/minor):

```bash
# No server ou gestao-escolar
npm update
```

Isto atualiza o `package-lock.json` sem alterar os intervalos no `package.json`.

## Atualizações major (cuidado)

Algumas dependências têm versões major mais recentes. Atualizar pode exigir alterações de código:

| Pacote        | Atual (ex.) | Major mais recente | Notas                          |
|---------------|-------------|--------------------|---------------------------------|
| next          | 14.x        | 16.x               | Migração App Router, etc.       |
| react         | 18.x        | 19.x               | Novo compilador, tipos          |
| zod           | 3.x         | 4.x                | API e tipos podem mudar         |
| vite          | 6.x         | 7.x                | Ver release notes               |
| tailwindcss   | 3.x         | 4.x                | Config e classes diferentes     |

Recomendação: manter as major atuais até haver tempo para testar. Para segurança, preferir `npm audit` e atualizar apenas o que for necessário.

## Verificar desatualizados

```bash
cd server
npm outdated

cd ../gestao-escolar
npm outdated
```

- **Current**: versão instalada.
- **Wanted**: versão máxima dentro do intervalo do `package.json`.
- **Latest**: última versão publicada (pode ser outra major).

## Auditoria de segurança

```bash
npm audit
npm audit fix   # aplica correções automáticas quando possível
```

Executar em `server` e em `gestao-escolar` com periodicidade.

**Nota:** Em `server`, `npm audit` pode reportar vulnerabilidades em `next` (ex.: DoS em Image Optimizer / RSC) e em `vitest`/`vite`/`esbuild` (ambiente de desenvolvimento). A correção automática (`npm audit fix --force`) propõe atualizações major (ex.: next 16, vitest 4), que podem exigir alterações no código. Avaliar se a atualização é prioritária ou se o contexto de uso (ex.: next sem Image Optimizer exposto, vitest só em dev) reduz o risco.
