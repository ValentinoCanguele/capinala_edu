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

### lib/core/ (serviços internos — expansão)
- **health.ts** — runHealthCheck() — verifica DB e estado do serviço; usado por /api/health.
- **config.ts** — getConfig() — carrega e valida env (Zod); AppConfig tipado.
- **env.ts** — validateEnv(), assertEnv() — validar variáveis obrigatórias ao arranque.
- **featureFlags.ts** — isEnabled(flag, escolaId?) — flags por env (FF_*).
- **rateLimit.ts** — checkRateLimit(key, options), pruneRateLimitStore() — limite por chave em memória.
- **cache.ts** — cacheGet, cacheSet, cacheDelete, cacheDeleteByPrefix — cache em memória com TTL.
- **retry.ts** — withRetry(fn, options) — retry exponencial.
- **metrics.ts** — incrementCounter, getCounter, getSnapshot — contadores em memória.
- **errorReporter.ts** — reportError(error, context) — log de erros.
- **dataSanitizer.ts** — trimString, normalizeDateISO — sanitização complementar ao Zod.
- **tokenRefresh.ts** — refreshTokenFromPayload(payload) — emitir novo JWT.
- **tokenBlacklist.ts** — blacklistAdd, blacklistHas, blacklistRemove — tokens invalidados (memória).
- **requestLogger.ts** — logRequest, createRequestLogger — log estruturado por request.
- **pagination.ts** — getPaginationFromRequest, buildPaginationMeta — page/limit/offset e metadados.
- **escolaContext.ts** — getEscolaIdOrThrow, getEscolaId, hasEscola — contexto escola a partir de AuthUser.
- **dates/dateService.ts** — hojeISO, inicioDoMes, fimDoMes, parseDateISO.
- **notifications/inbox.ts** — createNotification, listNotificationsByUser, markAsRead (em memória).
- **jobs/scheduler.ts** — registerJob, startScheduler, stopScheduler, getRegisteredJobs.
- **jobs/runner.ts** — runJob(name, fn) — executar job com log e captura de erros.
- **jobs/parcelasAtrasadas.ts** — runParcelasAtrasadasJob() — placeholder para atualizar parcelas atrasadas.
- **export/pipeline.ts** — formatRowAsCsv, csvHeader — helpers para export CSV.
- **events/bus.ts** — emit, on, eventNames — event bus interno.
- **i18n/i18n.ts** — t(key, locale?) — mensagens backend.
- **import/pipeline.ts** — runImportPipeline(lines, options) — parse/validar/persistir em lote.
- **quotas.ts** — checkQuotaAlunos(escolaId), checkQuotaTurmas(escolaId) — limites por escola.
- **tracing.ts** — getTraceId(req), traceIdHeader() — traceId por request.
- **circuitBreaker.ts** — getCircuitBreakerState, recordSuccess, recordFailure, canAttempt — circuito aberto após N falhas.
- **sortFilter.ts** — getSortFromRequest, buildOrderByClause — sort/order seguros (allowed fields).
- **idempotency.ts** — getIdempotencyResult, setIdempotencyResult, getIdempotencyKeyFromRequest — X-Idempotency-Key.
- **escolaSettings.ts** — getEscolaSetting, setEscolaSetting, getAllEscolaSettings — config por escola (memória).
- **integrations/health.ts** — checkIntegrations() — estado de serviços externos.
- **webhooks/dispatcher.ts** — registerWebhook, unregisterWebhook, dispatchWebhook, attachWebhooksToEventBus.
- **notifications/dispatcher.ts** — dispatchNotification(options) — in-app/email/push.
- **jobs/boletinsBatch.ts** — runBoletinsBatchJob().
- **jobs/cacheWarmup.ts** — runCacheWarmupJob().

### lib/escola/services/ (eventos)
- **alunos.ts** — após createAluno emite evento `aluno.criado` (payload: aluno, escolaId, userId).
- **turmas.ts** — após createTurma emite evento `turma.criada` (payload: turma, escolaId, userId).

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
- **financas/categoriaFinanceira.ts** — categoriaFinanceiraCreateSchema, categoriaFinanceiraUpdateSchema, tipoCategoriaSchema.
- **financas/configuracaoFinanceira.ts** — configuracaoFinanceiraUpdateSchema.
- **financas/lancamento.ts** — lancamentoCreateSchema, lancamentoUpdateSchema.
- **financas/parcela.ts** — parcelaCreateSchema, pagamentoCreateSchema, gerarParcelasLoteSchema.

### lib/escola/regras/
- **medias.ts** — `calcularMedia(notas)`, `mediaAprovacao(media, minima)`.
- **financas.ts** — `calcularValorComMultaEJuros(valor, vencimento, config)`, `parcelaEstaAtrasada(parcela, config?)`, `hojeISO()`.

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
- **financas/categorias.ts** — listCategoriasFinanceiras, createCategoriaFinanceira, getCategoriaFinanceira, updateCategoriaFinanceira, deleteCategoriaFinanceira.
- **financas/configuracao.ts** — getConfiguracaoFinanceira, updateConfiguracaoFinanceira.
- **financas/lancamentos.ts** — listLancamentos, createLancamento, getLancamento, updateLancamento, deleteLancamento.
- **financas/relatorios.ts** — getFluxoCaixa, getDRESimplificado, getInadimplencia, getDashboardFinancas.
- **financas/exportCsv.ts** — exportLancamentosCsv, exportParcelasCsv, exportInadimplenciaCsv.
- **financas/importCsv.ts** — importLancamentosCsv(user, csvText) → { importados, erros[] }.
- **financas/parcelas.ts** — atualizarParcelasAtrasadas, listParcelas, createParcela, getParcela, listPagamentosByParcela, registrarPagamento, gerarParcelasLote.

### lib/escola/permissoes.ts
- canDeleteAluno, canDeleteTurma, canManageDisciplinas, canLancarNotas, canVerBoletim.

### pages/api/
- **health.ts** — GET — runHealthCheck(); retorna ok, service, db, dbLatencyMs, timestamp; 503 se DB falhar.
- **auth/login.ts** — POST — body: email, password; resposta: { token, papel, userId }.
- **auth/refresh.ts** — POST — Authorization Bearer; resposta: { token, expiresIn } (renova JWT).
- **metrics.ts** — GET — getSnapshot() dos contadores; resposta: { counters, timestamp }.

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
- **financas/categorias/index.ts** — GET lista, POST criar (body: nome, tipo, ordem?, ativo?).
- **financas/categorias/[id].ts** — GET um, PUT atualizar, DELETE.
- **financas/configuracao.ts** — GET configuração, PUT atualizar (multa, juros, bloqueio).
- **financas/lancamentos/index.ts** — GET lista (filtros), POST criar.
- **financas/lancamentos/[id].ts** — GET um, PUT atualizar, DELETE.
- **financas/parcelas/index.ts** — GET lista (filtros), POST criar.
- **financas/parcelas/[id].ts** — GET um.
- **financas/parcelas/[id]/pagamentos.ts** — GET lista, POST registar pagamento.
- **financas/dashboard/index.ts** — GET estatísticas (receitas/despesas mês, inadimplência, evolução).
- **financas/relatorios/fluxo-caixa.ts** — GET (dataInicio, dataFim).
- **financas/relatorios/dre.ts** — GET (dataInicio, dataFim).
- **financas/relatorios/inadimplencia.ts** — GET (anoLetivoId opcional).
- **financas/export/[tipo].ts** — GET CSV (tipo: lancamentos, parcelas, inadimplencia).

## Frontend (gestao-escolar/)

### api/client.ts
- request, api.get/post/put/delete; envia Authorization Bearer (lib/auth).

### lib/auth.ts
- getToken, setToken, clearToken, getAuthHeader.

### lib/downloadCsv.ts
- downloadExportCsv(path, filename) — download de CSV com auth.

### contexts/AuthContext.tsx
- AuthProvider, useAuth — user, login, logout, setToken.

### data/escola/queries.ts
- useAlunos, useTurmaAlunos, useTurmas, useDisciplinas, useDisciplina(id), useAnosLetivos, useAnoLetivo(id), usePeriodos, useNotas, useBoletim, useFrequencia, useHorarios, useSalas, useComunicados, useComunicado(id), useDashboardStats, useAuditLog(entidade?, limit), useAlertas, useCategoriasFinancas, useConfiguracaoFinancas, useLancamentos, useParcelas, usePagamentos, useDashboardFinancas, useFluxoCaixa, useDRE, useInadimplencia.

### data/escola/mutations.ts
- useCreateAluno, useUpdateAluno, useDeleteAluno; useCreateTurma, useUpdateTurma, useDeleteTurma; useEnsurePeriodos, useSaveNotasBatch; useCreateAula, useSaveFrequencia; useCreateHorario, useUpdateHorario, useDeleteHorario; useCreateSala, useUpdateSala, useDeleteSala; useCreateComunicado, useUpdateComunicado, useDeleteComunicado; useCreateDisciplina, useUpdateDisciplina, useDeleteDisciplina; useCreateAnoLetivo, useUpdateAnoLetivo; useAddMatricula, useRemoveMatricula; useResolveAlerta; useCreateCategoriaFinanceira, useUpdateCategoriaFinanceira, useDeleteCategoriaFinanceira; useUpdateConfiguracaoFinancas; useCreateLancamento, useUpdateLancamento, useDeleteLancamento, useImportLancamentosCsv; useCreateParcela, useRegistrarPagamento, useGerarParcelasLote.

### schemas/
- aluno.ts — alunoFormSchema.
- turma.ts — turmaFormSchema.
- disciplina.ts — disciplinaFormSchema.
- anoLetivo.ts — anoLetivoFormSchema.
- sala.ts — salaFormSchema.

### pages/
- Login, Layout, Dashboard, Alunos, Turmas, Notas, Frequencia, Boletim, Horarios, Comunicados, Disciplinas, AnosLetivos, Salas, Financas (layout), FinancasDashboard, FinancasCategorias, FinancasLancamentos, FinancasParcelas, FinancasConfiguracao, FinancasRelatorios, Auditoria.

### components/
- AlunoForm, TurmaForm — react-hook-form + zod; Modal — diálogo reutilizável; PageSkeleton, TableSkeleton, StatCardSkeleton — estados de carregamento; EmptyState — estado vazio; PageHeader — título e ações de página.

## Base de dados (migrations/)

- **001_initial.sql** — escolas, pessoas, usuarios, alunos, responsaveis, professores, vinculo_responsavel_aluno, anos_letivos, turmas, disciplinas, turma_disciplina, matriculas, periodos, notas, aulas, frequencia.
- **002_seed.sql** — Escola Demo, Admin Demo (admin@escola.demo / admin123).
- **003_financas.sql** — tipo_categoria_financeira (enum), categorias_financeiras, configuracao_financeira.
- **010_nano_funcoes.sql** — Nano funções SQL: fn_hoje_iso(); fn_financeiro_valor_com_multa_juros(valor_original, vencimento, ref, multa_pct, juros_pct); fn_financeiro_parcela_esta_atrasada(vencimento, status, ref); fn_media_aprovacao(media, minima).
