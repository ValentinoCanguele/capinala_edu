# Core modular e extensível — Especificação do sistema

Documento de referência para guiar a reorganização do projeto: core modular, extensível, com nano funções na base de dados, funções internas bem delimitadas e uso de ferramentas modernas. Respeita a base imutável (frontend estilo Studio) definida em [BASE-PROJETO-ESCOLA.md](BASE-PROJETO-ESCOLA.md).

## 1. Objetivos

- **Modularidade**: domínios (alunos, turmas, finanças, etc.) com fronteiras claras; adicionar um novo domínio (ex: biblioteca, cantina) sem alterar o core.
- **Extensibilidade**: novos endpoints, novas regras e novos relatórios via camadas bem definidas (DB → lib → API → data → UI).
- **Lapidação**: código mais organizado, funções pequenas e reutilizáveis, menos duplicação, tipagem forte.
- **Performance**: lógica pesada ou reutilizável no banco (nano funções); cache e invalidação consistentes no frontend.
- **Ferramentas modernas**: TypeScript strict, Zod para validação, React Query no frontend; opcionalmente query builder type-safe (Drizzle/Kysely) no backend.

## 2. Arquitetura

- **Fluxo**: Request → API (requireAuth + parse body) → Service → Regras/Schemas + DB (queries e/ou nano funções) → Response.
- **Frontend**: 4 camadas (lib, api, data, components); data layer consome apenas as APIs.

## 3. Nano funções na base de dados

Funções PostgreSQL pequenas, atómicas e reutilizáveis. Convenção: prefixo por domínio (`fn_financeiro_*`, `fn_escola_*`, `fn_audit_*`). Ver migration `010_nano_funcoes.sql` e [ANALISE-ARQUIVOS-E-FUNCOES.md](ANALISE-ARQUIVOS-E-FUNCOES.md).

## 4. Backend (lib e API)

- **lib/** — db, auth, apiWrapper (core partilhado).
- **lib/escola/** — schemas (Zod), regras (funções puras), services (orquestração), permissoes.
- **lib/core/** — Serviços internos: health, config, rateLimit, cache, tokenRefresh, tokenBlacklist, requestLogger, pagination, dates, notifications, jobs, escolaContext, export pipeline, eventBus, etc. (expansão sem alterar o existente).
- **pages/api/** — Rotas finas: requireAuth, Zod, serviço, jsonSuccess/jsonError.

## 5. Serviços internos do core (índice)

HealthCheck, ConfigLoader, FeatureFlags, EnvValidator | RateLimiter, TokenRefresh, TokenBlacklist, SessionStore, CSRFGuard, PasswordPolicy, IpAllowlist | RequestLogger, AuditService, MetricsCollector, ErrorReporter, Tracing | RetryPolicy, CircuitBreaker, CacheService, QueryThrottle, BatchProcessor | BackupMetadata, ConsistencyChecker, SoftDeleteHelper, DataSanitizer | NotificationInbox, NotificationDispatcher, EmailGateway, EmailTemplates, TemplateRenderer | JobScheduler, JobRunner, ParcelasAtrasadasJob, BoletinsBatchJob, ReportesAgendadosJob, LimpezaAuditLogJob, CacheWarmupJob | EscolaContext, TenancyIsolation, QuotasService, EscolaSettings | DateService, I18nService, ExportPipeline, ImportPipeline, ApiVersioning, Idempotency, PaginationHelper, SortAndFilter | EventBus, WebhookDispatcher, IntegrationHealth.

## 6. Resumo do prompt

- **Modular e extensível**: domínios bem separados; novo domínio = nova pasta em cada camada.
- **Nano funções no banco**: funções SQL pequenas; convenção de nomes por domínio.
- **Funções internas**: serviços como orquestradores; regras em regras/; sem lógica de negócio nas rotas API.
- **Serviços internos (lib/core/)**: expansão apenas; não alterar código existente.
- **Lapidação**: TypeScript strict, Zod em toda a entrada, testes para regras, documentação atualizada.

Este documento serve como prompt de referência para evoluções futuras do sistema.
