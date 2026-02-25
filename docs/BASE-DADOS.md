# Base de dados

PostgreSQL. Conexão via variável `DATABASE_URL` no `server/.env`.

## Migrations

Ficheiros em **server/migrations/** executados por ordem (nome alfabético). Comando:

```bash
cd server
npm run db:migrate
```

Para executar apenas a migration 010 (nano funções), quando o resto do schema já existir:

```bash
npm run db:migrate:010
```

### Lista das migrations

| Ficheiro | Conteúdo |
|----------|----------|
| 001_initial.sql | escolas, pessoas, usuarios, alunos, responsaveis, professores, vinculo_responsavel_aluno, anos_letivos, turmas, disciplinas, turma_disciplina, matriculas, periodos, notas, aulas, frequencia. |
| 002_seed.sql | Escola Demo, utilizador admin@escola.demo (admin123). |
| 003_*.sql | Utilizadores adicionais; finanças (tipo_categoria_financeira, categorias_financeiras, configuracao_financeira). |
| 004_*.sql | Horários; finanças parcelas e lançamentos. |
| 005_comunicados.sql | Comunicados. |
| 006_dashboard_views.sql | Views do dashboard. |
| 007_audit.sql | Tabela audit_log. |
| 008_sistema_modulos.sql | Sistema de módulos. |
| 009_modulos_imagem_icone.sql | Imagem e ícone dos módulos. |
| 010_nano_funcoes.sql | Nano funções SQL (datas, finanças, notas). |

## Nano funções (010_nano_funcoes.sql)

Funções PostgreSQL pequenas e reutilizáveis. Convenção de nome: `fn_<domínio>_<nome>`.

| Função | Descrição |
|--------|-----------|
| `fn_hoje_iso()` | Retorna a data de hoje (current_date). |
| `fn_financeiro_valor_com_multa_juros(valor_original, vencimento, ref, multa_pct, juros_pct)` | Calcula valor com multa (uma vez) e juros mensais. Parâmetros em DATE e NUMERIC; multa_pct e juros_pct em percentagem. |
| `fn_financeiro_parcela_esta_atrasada(vencimento, status, ref)` | Retorna true se a parcela está atrasada (vencimento &lt; ref e status não é paga/cancelada). |
| `fn_media_aprovacao(media, minima)` | Retorna true se media >= minima (default 5). |

Uso nos serviços: por exemplo `SELECT fn_hoje_iso();` ou `SELECT fn_financeiro_valor_com_multa_juros(100, '2025-01-01'::date, current_date, 2, 1);`.

## Papéis (enum papel_enum)

- admin  
- direcao  
- professor  
- responsavel  
- aluno  

## Documentação adicional

- Índice de funções do backend (incluindo serviços que usam o DB): [ANALISE-ARQUIVOS-E-FUNCOES.md](ANALISE-ARQUIVOS-E-FUNCOES.md).
- Especificação do core e nano funções: [CORE-MODULAR-EXTENSIVEL.md](CORE-MODULAR-EXTENSIVEL.md).
