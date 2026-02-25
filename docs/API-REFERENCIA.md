# Referência da API

Base URL em desenvolvimento: **http://localhost:8082**. O frontend em `gestao-escolar` faz proxy de `/api` para esta base.

## Autenticação

- **Login:** `POST /api/auth/login`  
  Body: `{ "email": "...", "password": "..." }`  
  Resposta: `{ "token": "...", "papel": "admin"|"direcao"|"professor"|"responsavel"|"aluno", "userId": "..." }`

- **Renovar token:** `POST /api/auth/refresh`  
  Header: `Authorization: Bearer <token>`  
  Resposta: `{ "token": "...", "expiresIn": 86400 }`

- **Rotas protegidas:** enviar header `Authorization: Bearer <token>`. Em 401 a resposta é `{ "error": { "message": "Não autorizado" } }`.

## Formato das respostas

- **Sucesso:** corpo JSON com os dados (por exemplo lista ou objeto).
- **Erro:** `{ "error": { "message": "Texto da mensagem" } }` com status HTTP adequado (400, 401, 403, 404, 500).

## Endpoints gerais

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET | /api/health | Estado do serviço e da base de dados (ok, db, dbLatencyMs, timestamp). 503 se DB falhar. |
| GET | /api/metrics | Snapshot dos contadores em memória (counters, timestamp). |

## Auth

| Método | Caminho | Descrição |
|--------|---------|-----------|
| POST | /api/auth/login | Login (email, password). |
| POST | /api/auth/refresh | Renovar JWT (Bearer). |

## Escola — perfil e filhos

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET | /api/escola/meu-papel | Papel, userId, pessoaId, escolaId (requer Auth). |
| GET | /api/escola/meus-filhos | Lista de filhos (papel responsavel). |

## Escola — alunos, turmas, disciplinas, anos letivos

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET, POST | /api/escola/alunos | Lista / criar aluno. |
| GET, PUT, DELETE | /api/escola/alunos/[id] | Um aluno. |
| GET, POST | /api/escola/turmas | Lista / criar turma. |
| GET, PUT, DELETE | /api/escola/turmas/[id] | Uma turma. |
| GET | /api/escola/turmas/[id]/alunos | Alunos da turma; POST inscrever, DELETE remover. |
| GET, POST | /api/escola/disciplinas | Lista / criar. |
| GET, PUT, DELETE | /api/escola/disciplinas/[id] | Uma disciplina. |
| GET, POST | /api/escola/anos-letivos | Lista / criar. |
| GET, PUT | /api/escola/anos-letivos/[id] | Um ano letivo. |

## Escola — períodos, notas, boletins, aulas, frequência

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET | /api/escola/periodos | Por anoLetivoId. |
| POST | /api/escola/periodos/ensure | Criar 4 bimestres se não existirem. |
| GET, POST | /api/escola/notas | Por turmaId/periodoId; POST uma nota. |
| POST | /api/escola/notas/batch | Lote de notas (turmaId, periodoId ou bimestre, notas[]). |
| GET | /api/escola/boletins/[alunoId] | Boletim do aluno. |
| GET | /api/escola/aulas | Por turmaId e dataAula. |
| POST | /api/escola/aulas/create | Criar aula. |
| GET, POST | /api/escola/frequencia/[aulaId] | Lista / batch (items: alunoId, status). |

## Escola — salas, horários, comunicados

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET, POST | /api/escola/salas | Lista / criar. |
| GET, PUT, DELETE | /api/escola/salas/[id] | Uma sala. |
| GET, POST | /api/escola/horarios | Lista (turmaId, anoLetivoId opcionais) / criar. |
| GET, PUT, DELETE | /api/escola/horarios/[id] | Um horário. |
| GET, POST | /api/escola/comunicados | Lista / criar. |
| GET, PUT, DELETE | /api/escola/comunicados/[id] | Um comunicado. |

## Escola — dashboard, auditoria, alertas

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET | /api/escola/dashboard/stats | Estatísticas (totais, média, presença, alunos por turma). |
| GET | /api/escola/audit | Log de auditoria (query: entidade, limit). |
| GET, PATCH | /api/escola/alertas | Alertas ativos / resolver (body: alertaId). |

## Escola — finanças

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET, POST | /api/escola/financas/categorias | Categorias financeiras. |
| GET, PUT, DELETE | /api/escola/financas/categorias/[id] | Uma categoria. |
| GET, PUT | /api/escola/financas/configuracao | Configuração (multa, juros, bloqueio). |
| GET, POST | /api/escola/financas/lancamentos | Lançamentos (filtros). |
| GET, PUT, DELETE | /api/escola/financas/lancamentos/[id] | Um lançamento. |
| GET, POST | /api/escola/financas/parcelas | Parcelas (filtros) / criar. |
| GET | /api/escola/financas/parcelas/[id] | Uma parcela. |
| GET, POST | /api/escola/financas/parcelas/[id]/pagamentos | Pagamentos da parcela / registar. |
| GET | /api/escola/financas/dashboard | Estatísticas (receitas/despesas, inadimplência). |
| GET | /api/escola/financas/relatorios/fluxo-caixa | dataInicio, dataFim. |
| GET | /api/escola/financas/relatorios/dre | dataInicio, dataFim. |
| GET | /api/escola/financas/relatorios/inadimplencia | anoLetivoId opcional. |
| GET | /api/escola/financas/export/[tipo] | CSV: tipo = lancamentos | parcelas | inadimplencia. |

## Escola — módulos

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET | /api/escola/modulos | Lista de módulos. |
| GET, PUT | /api/escola/modulos/[id] | Um módulo. |
| POST | /api/escola/modulos/instalar | Instalar módulo. |

## Lista detalhada

Para detalhes de parâmetros e body de cada rota, ver [ANALISE-ARQUIVOS-E-FUNCOES.md](ANALISE-ARQUIVOS-E-FUNCOES.md).
