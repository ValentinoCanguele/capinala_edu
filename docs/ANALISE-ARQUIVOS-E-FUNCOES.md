# Análise — Arquivos e Funções do Módulo Escola

## Backend (server/)

### lib/db.ts
- `getDb()` — Pool Postgres (DATABASE_URL).
- `AuthUser` — userId, pessoaId, escolaId, papel.

### lib/auth.ts
- `getAuthUser(req)` — Extrai e valida JWT; retorna AuthUser ou null.
- `requireAuth(req, res, handler)` — Chama handler com user ou responde 401.
- `signToken(payload)` — Emite JWT (sub, pessoaId, escolaId, papel).

### lib/apiWrapper.ts
- `jsonSuccess(res, data, status)` — Resposta JSON de sucesso.
- `jsonError(res, message, status)` — Resposta JSON de erro.

### lib/escola/schemas/
- **pessoa.ts** — pessoaCreateSchema, pessoaUpdateSchema.
- **aluno.ts** — alunoCreateSchema, alunoUpdateSchema.
- **turma.ts** — turmaCreateSchema, turmaUpdateSchema.
- **disciplina.ts** — disciplinaCreateSchema, disciplinaUpdateSchema.
- **anoLetivo.ts** — anoLetivoCreateSchema, anoLetivoUpdateSchema.
- **matricula.ts** — matriculaCreateSchema.
- **nota.ts** — notaSchema, notaBatchSchema.
- **horario.ts** — horarioCreateSchema, horarioUpdateSchema.
- **comunicado.ts** — comunicadoCreateSchema, comunicadoUpdateSchema.

### lib/escola/regras/
- **medias.ts** — `calcularMedia(notas)`, `mediaAprovacao(media, minima)`.

### lib/escola/services/
- **alunos.ts** — listAlunos, createAluno, getAluno, updateAluno, deleteAluno.
- **anosLetivos.ts** — listAnosLetivos, createAnoLetivo, getAnoLetivo, updateAnoLetivo.
- **disciplinas.ts** — listDisciplinas, createDisciplina, getDisciplina, updateDisciplina, deleteDisciplina.
- **turmas.ts** — listTurmas, createTurma, getTurma, updateTurma, deleteTurma.
- **matriculas.ts** — listMatriculasByTurma, createMatricula, deleteMatricula.
- **periodos.ts** — listPeriodosByAnoLetivo, getOrCreatePeriodosForAno.
- **notas.ts** — upsertNota, saveNotasBatch, getNotasByTurmaPeriodo.
- **boletins.ts** — getBoletim(alunoId, anoLetivoId?).
- **aulas.ts** — listAulasByTurmaAndDate, getOrCreateAula.
- **frequencia.ts** — getFrequenciaByAula, saveFrequenciaBatch.
- **horarios.ts** — listHorarios, createHorario, updateHorario, deleteHorario; listSalas, createSala, getSala, updateSala, deleteSala; listHorariosProfessor.
- **comunicados.ts** — listComunicados, getComunicado, createComunicado, updateComunicado, deleteComunicado.

### lib/escola/permissoes.ts
- canDeleteAluno, canDeleteTurma, canManageDisciplinas, canLancarNotas, canVerBoletim.

### pages/api/auth/login.ts
- POST — body: email, password; resposta: { token, papel, userId }.

### pages/api/escola/
- **meu-papel.ts** — GET — papel, userId, pessoaId, escolaId.
- **meus-filhos.ts** — GET — lista de filhos (papel responsavel).
- **alunos/index.ts** — GET lista, POST criar.
- **alunos/[id].ts** — GET, PUT, DELETE.
- **turmas/index.ts** — GET lista, POST criar.
- **turmas/[id].ts** — GET, PUT, DELETE.
- **turmas/[id]/alunos.ts** — GET alunos da turma; POST body { alunoId } inscrever; DELETE ?alunoId= remover matrícula.
- **disciplinas/index.ts** — GET lista, POST criar.
- **disciplinas/[id].ts** — GET, PUT, DELETE.
- **anos-letivos/index.ts** — GET lista, POST criar.
- **anos-letivos/[id].ts** — GET um, PUT atualizar.
- **periodos/index.ts** — GET por anoLetivoId.
- **periodos/ensure.ts** — POST — cria 4 bimestres se não existirem.
- **notas/index.ts** — GET por turmaId/periodoId, POST uma nota.
- **notas/batch.ts** — POST — turmaId, periodoId ou bimestre, notas[].
- **boletins/[alunoId].ts** — GET boletim.
- **aulas/index.ts** — GET por turmaId e dataAula.
- **aulas/create.ts** — POST — turmaId, disciplinaId, dataAula; retorna aulaId.
- **frequencia/[aulaId].ts** — GET lista, POST batch (items: alunoId, status).
- **salas/index.ts** — GET lista, POST criar.
- **salas/[id].ts** — GET um, PUT atualizar, DELETE.
- **horarios/index.ts** — GET lista (turmaId, anoLetivoId opcionais), POST criar.
- **horarios/[id].ts** — GET um, PUT atualizar, DELETE.
- **comunicados/index.ts** — GET lista, POST criar.
- **comunicados/[id].ts** — GET um, PUT atualizar, DELETE.
- **dashboard/stats.ts** — GET estatísticas (totais, média, presença, alunos por turma).
- **audit/index.ts** — GET log de auditoria (query: entidade, limit).
- **alertas/index.ts** — GET alertas ativos, PATCH resolver (body: alertaId).

## Frontend (gestao-escolar/)

### api/client.ts
- request, api.get/post/put/delete; envia Authorization Bearer (lib/auth).

### lib/auth.ts
- getToken, setToken, clearToken, getAuthHeader.

### contexts/AuthContext.tsx
- AuthProvider, useAuth — user, login, logout, setToken.

### data/escola/queries.ts
- useAlunos, useTurmaAlunos, useTurmas, useDisciplinas, useDisciplina(id), useAnosLetivos, useAnoLetivo(id), usePeriodos, useNotas, useBoletim, useFrequencia, useHorarios, useSalas, useComunicados, useComunicado(id), useDashboardStats, useAuditLog(entidade?, limit), useAlertas.

### data/escola/mutations.ts
- useCreateAluno, useUpdateAluno, useDeleteAluno; useCreateTurma, useUpdateTurma, useDeleteTurma; useEnsurePeriodos, useSaveNotasBatch; useCreateAula, useSaveFrequencia; useCreateHorario, useUpdateHorario, useDeleteHorario; useCreateSala, useUpdateSala, useDeleteSala; useCreateComunicado, useUpdateComunicado, useDeleteComunicado; useCreateDisciplina, useUpdateDisciplina, useDeleteDisciplina; useCreateAnoLetivo, useUpdateAnoLetivo; useAddMatricula, useRemoveMatricula; useResolveAlerta.

### schemas/
- aluno.ts — alunoFormSchema.
- turma.ts — turmaFormSchema.
- disciplina.ts — disciplinaFormSchema.
- anoLetivo.ts — anoLetivoFormSchema.
- sala.ts — salaFormSchema.

### pages/
- Login, Layout, Dashboard, Alunos, Turmas, Notas, Frequencia, Boletim, Horarios, Comunicados, Disciplinas, AnosLetivos, Salas, Auditoria.

### components/
- AlunoForm, TurmaForm — react-hook-form + zod; Modal — diálogo reutilizável; PageSkeleton, TableSkeleton, StatCardSkeleton — estados de carregamento; EmptyState — estado vazio; PageHeader — título e ações de página.

## Base de dados (migrations/)

- **001_initial.sql** — escolas, pessoas, usuarios, alunos, responsaveis, professores, vinculo_responsavel_aluno, anos_letivos, turmas, disciplinas, turma_disciplina, matriculas, periodos, notas, aulas, frequencia.
- **002_seed.sql** — Escola Demo, Admin Demo (admin@escola.demo / admin123).
