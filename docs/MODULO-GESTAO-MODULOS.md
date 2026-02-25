# Módulo de Gestão de Módulos (planeado)

## Objetivo

Um módulo onde o **sistema controla todos os módulos** da aplicação: activar/desactivar, visibilidade no menu, permissões por papel e, opcionalmente, configurações por módulo (ex.: Finanças, Auditoria, Horários, etc.).

## Conceitos

- **Módulo**: unidade funcional da aplicação (Alunos, Turmas, Salas, Anos letivos, Disciplinas, Finanças, Auditoria, etc.).
- **Estado**: activo/inactivo (e eventualmente visível/oculto no menu).
- **Controlo central**: uma única área (ex.: Definições ou Admin) onde um perfil com permissão pode listar módulos e alterar o estado.

## Onde pode viver

- **Opção A**: Secção **Definições** no menu lateral (ex.: Definições → Módulos).
- **Opção B**: Área **Admin** dedicada (se existir) com subsecção Módulos.

Recomendação: Definições, para manter um único nível de “configuração da escola”.

## Modelo de dados (sugestão)

- Tabela `modulos` (ou `sistema_modulos`):
  - `id` (PK)
  - `chave` (string única, ex.: `alunos`, `turmas`, `financas`, `auditoria`)
  - `nome` (label para o utilizador)
  - `ativo` (boolean)
  - `ordem` (número para ordenação no menu)
  - `config` (JSON opcional: configurações específicas do módulo)
- A aplicação ao carregar:
  - Lê os módulos activos.
  - Renderiza o menu e as rotas apenas para módulos activos (ou mostra/oculta itens consoante `ativo`).

## API (sugestão)

- `GET /api/escola/modulos` — listar todos os módulos (com estado e ordem).
- `PATCH /api/escola/modulos/:id` ou `PUT /api/escola/modulos/:id` — actualizar `ativo`, `ordem` ou `config`.
- Protecção: apenas perfis com permissão de administração (ex.: admin, direção) podem alterar.

## Frontend (sugestão)

- Página **Definições → Módulos** (ou Admin → Módulos).
- Lista em tabela ou cards: nome do módulo, estado (activar/desactivar), ordem (opcional).
- Usar componentes existentes: PageLayout, Card, Table, FormItemLayout, Switch, conforme `studio-ui.mdc` e `escola-base-imutavel.mdc`.

## Integração com o resto do sistema

- **Menu lateral**: construir `navItems` a partir dos módulos activos (ou mapear chaves → itens de menu).
- **Rotas**: as rotas podem existir sempre e a página redireciona ou mostra “Módulo indisponível” se o módulo estiver inactivo; ou as rotas são registadas dinamicamente consoante módulos activos (mais complexo).
- **Permissões**: o módulo de gestão de módulos deve ser acessível apenas a roles com permissão (ex.: admin).

## Implementado

- **Migração**: `server/migrations/008_sistema_modulos.sql` — tabela `sistema_modulos` (id, chave, nome, descricao, ativo, ordem, config, permissoes) e seed dos módulos (início, alunos, turmas, notas, … financias, auditoria, definicoes).
- **Backend**: `server/lib/escola/services/modulos.ts` (listModulos, getModulo, updateModulo); `server/lib/escola/schemas/modulo.ts` (moduloUpdateSchema); `server/pages/api/escola/modulos/index.ts` (GET), `server/pages/api/escola/modulos/[id].ts` (GET, PATCH). Apenas papel `admin` pode fazer PATCH.
- **Frontend**: Página **Definições → Módulos** (`gestao-escolar/src/pages/Modulos.tsx`): listagem com pesquisa, switch instalar/desinstalar (ativo), editar (nome, descrição, ordem, config JSON, permissões por papel). Rota `/definicoes/modulos`. Acesso à página apenas para `admin`.
- **Menu dinâmico**: O menu lateral em `Layout.tsx` usa `useModulos()` e mostra apenas itens cujo módulo está ativo e cujo utilizador tem papel em `permissoes`.

## Próximos passos (opcional)

- Documentar em `ANALISE-ARQUIVOS-E-FUNCOES.md` os novos ficheiros e funções.
- Ordenação drag-and-drop no menu (atualizar campo `ordem` em lote).
