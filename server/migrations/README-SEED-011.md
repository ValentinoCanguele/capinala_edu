# Seed completo (011_seed_completo.sql)

Script para popular a base de dados da **Escola Demo** com dados de demonstração.

## Pré-requisitos

- Migrações iniciais já aplicadas (001 a 007 pelo menos), incluindo **002_seed.sql** e **003_add_user_canguele.sql** (escola Demo + admin + canguele).
- `DATABASE_URL` e `JWT_SECRET` definidos em `server/.env`.

## Como executar

```bash
cd server
npm run db:seed
```

Ou aplicar apenas o ficheiro SQL (por exemplo a partir do cliente psql ou Supabase SQL Editor):

```bash
psql "$DATABASE_URL" -f migrations/011_seed_completo.sql
```

## Conteúdo do seed

| # | Entidade | Dados |
|---|----------|--------|
| 1 | **Pessoas** | Maria Direção, João Professor, Ana Professora, Carlos e Sofia (responsáveis), 8 alunos (Luís, Mariana, Pedro, Inês, Tiago, Rita, Miguel, Beatriz) |
| 2 | **Usuários** | direcao@escola.demo, joao.prof@escola.demo, ana.prof@escola.demo, carlos.resp@escola.demo, sofia.resp@escola.demo — **senha: demo123** |
| 3 | **Alunos** | 8 alunos associados às pessoas acima (emails *@aluno.demo) |
| 4 | **Professores** | João e Ana (2 professores) |
| 5 | **Responsáveis** | Carlos e Sofia; vínculos: Carlos → Luís e Mariana, Sofia → Pedro |
| 6 | **Anos letivos** | 2024/2025, 2025/2026 |
| 7 | **Turmas** | 10º A, 10º B, 11º A (ano 2024/2025) |
| 8 | **Disciplinas** | Matemática, Português, Física e Química, História, Inglês |
| 9 | **Turma–Disciplina** | 10ºA e 10ºB com várias disciplinas e professores atribuídos |
| 10 | **Matrículas** | 4 alunos no 10º A (Luís, Mariana, Pedro, Inês), 4 no 10º B (Tiago, Rita, Miguel, Beatriz) |
| 11 | **Períodos** | 4 bimestres para 2024/2025 |
| 12 | **Notas** | Notas de exemplo (1º bimestre) para 10º A em Matemática e Português |
| 13 | **Salas** | Sala 1, Sala 2, Sala 3, Laboratório (com capacidade) |
| 14 | **Horários** | Alguns blocos para 10º A (Segunda e Quarta) em 2024/2025 |
| 15 | **Aulas e Frequência** | Uma aula de Matemática (10º A, 2024-09-02) com presenças registadas |
| 16 | **Comunicados** | 3 comunicados (bem-vindos, reunião de pais, feriado) criados pelo admin |
| 17 | **Audit log** | Algumas entradas de exemplo (se o log estiver vazio) |
| 18 | **Alertas** | Um alerta de frequência para o Luís Silva (não resolvido) |

## Logins de teste após o seed

| Papel | Email | Senha |
|-------|--------|--------|
| Admin | admin@escola.demo | admin123 |
| Admin | canguele@escola.demo | Manga@926445277.com |
| Direção | direcao@escola.demo | demo123 |
| Professor | joao.prof@escola.demo | demo123 |
| Professor | ana.prof@escola.demo | demo123 |
| Responsável | carlos.resp@escola.demo | demo123 |
| Responsável | sofia.resp@escola.demo | demo123 |

**Responsável Carlos** pode ver boletins de **Luís** e **Mariana** (Meus filhos).  
**Responsável Sofia** pode ver boletim de **Pedro**.

O script é idempotente: usa `ON CONFLICT DO NOTHING` ou `WHERE NOT EXISTS` onde faz sentido, para poder ser executado mais do que uma vez sem duplicar dados.
