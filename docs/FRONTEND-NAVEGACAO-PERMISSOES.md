# Navegação e permissões no frontend

Registo único da estrutura de navegação (sidebar, barra contextual, header), filtro por papel e camada de permissões no frontend. A autoridade para as APIs continua a ser o backend (`server/lib/escola/permissoes.ts`).

---

## Papéis

| Papel        | Descrição                          |
|-------------|-------------------------------------|
| `admin`     | Administrador (acesso total, incluindo Definições/Módulos) |
| `direcao`   | Direção (tudo exceto Módulos)      |
| `professor` | Professor (pedagógico + comunicados) |
| `responsavel` | Responsável (meus filhos, comunicados) |
| `aluno`     | Aluno (início, meu perfil, meu boletim, aulas de hoje, horário, comunicados) |

Estrutura preparada para papéis futuros: `financeiro`, `secretario`.

---

## Sidebar principal (agrupada e colapsável)

- **Ficheiro:** `gestao-escolar/src/layout/sidebarConfig.ts`
- **Função:** `getSidebarGroupsForRole(papel)` — devolve apenas grupos com itens visíveis para o papel; em cada grupo só aparecem itens cujo `roles` inclua o papel (ou sem `roles` = todos).

### Grupos

| Grupo      | Conteúdo (resumo) |
|-----------|--------------------|
| Principal | Início |
| Pedagógico | Turmas, Notas, Recuperação, Pautas, Atas, Frequência, Configurações, Boletim, Horários, Comunicados, Ocorrências, Disciplinas, Matrizes |
| Cadastros | Alunos, Anos letivos, Salas |
| Finanças  | Finanças |
| Sistema   | Auditoria, Módulos, Perfil, Meu perfil, Meu boletim, Aulas de hoje, Presenças, Meus filhos, Arquivos, Utilizadores |

### Visibilidade por papel (resumo)

| Papel       | Sidebar |
|------------|---------|
| Admin      | Tudo (Principal, Pedagógico, Cadastros, Finanças, Sistema, incluindo Definições/Módulos) |
| Direção    | Idem sem Módulos |
| Professor  | Início, Turmas, Notas, Frequência, Boletim, Horários, Comunicados, Disciplinas (e outros pedagógicos), Perfil, Arquivos |
| Aluno      | Início, Horários, Comunicados; Perfil → Meu perfil, Meu boletim, Aulas de hoje, Presenças |
| Responsável | Início, Comunicados; Meus filhos |

- **Colapsada:** só ícones; títulos de grupo ocultos; expansão no hover (transição + sombra); estado em `localStorage` (`gestao-escolar-sidebar-collapsed`).
- **Zona inferior:** papel do utilizador, botão Sair, botão Expandir (quando colapsada).

---

## Barra contextual (segunda barra à esquerda)

- **Ficheiro:** `gestao-escolar/src/layout/contextBarConfig.ts`
- **Função:** `getContextBarItems(pathname, papel)` — devolve links verticais (ícone + label) para o contexto atual. A barra só é renderizada quando há itens.

### Quando aparece

- **Alunos** (admin, direcao, professor): Ver lista, Adicionar aluno, Ver boletim, Ver perfil.
- **Início para aluno:** Meu perfil, Meu boletim, Trabalhos académicos, Aulas de hoje, Horário, Comunicados.
- **Início para responsável:** Meus filhos, Boletim do filho, Comunicados.
- **Finanças** (admin, direcao): Visão geral, Categorias, Lançamentos, Parcelas, Relatórios, Configuração.

Posição: entre a sidebar principal e o `<main>`; largura fixa (ex.: 11rem). Item ativo por `pathname` + `search`.

---

## Header

- **Esquerda:** logo (link para `/`) + separador + breadcrumbs (derivados de `location.pathname` + `SEGMENT_LABELS` em `config/routes.ts`).
- **Direita:** notificações | ajuda | tema (claro/escuro) | menu utilizador (papel + dropdown «Terminar sessão»).
- Altura fixa (`h-14`), dropdowns fecham com Escape e clique fora. Focus visível: `focus-visible:ring-2 focus-visible:ring-studio-brand`.

---

## Second bar (tabs contextuais)

- **Ficheiro:** `gestao-escolar/src/config/routes.ts` (e re-export em `layout/secondBarConfig.ts`).
- Tabs horizontais por rota (ex.: /alunos → Lista | Adicionar). Alinhamento com o header.

---

## Camada de permissões no frontend

- **Ficheiro:** `gestao-escolar/src/lib/permissoes.ts`
- Funções por papel (ex.: `canViewAlunos(papel)`, `canLancarNotas(papel)`) alinhadas a `server/lib/escola/permissoes.ts`, para **esconder na UI** o que o backend recusaria (botões, links, secções). Não substitui a verificação no backend.

Exemplos: `canCreateAluno`, `canCreateTurma`, `canCreateComunicado`, `canManageHorarios`, `canManageDisciplinas`, `canManageSalas`, `canManageAtas`, `canManageOcorrencias`, `canGerirFinancas`, `canGerirUtilizadores`, `canManageModulos`, `isAdmin`, `isAluno`, `isResponsavel`.

**Onde é usada:**
- **Second bar:** `layout/secondBarPermissions.ts` filtra as tabs (ex.: "Adicionar" em Alunos só aparece se `canCreateAluno(papel)`).
- **Barra contextual:** o item "Adicionar aluno" só aparece se `canCreateAluno(papel)`.
- **Páginas:** Alunos, Comunicados, Turmas, Utilizadores, Disciplinas, Anos letivos, Salas, Horários, Matrizes, Atas, Ocorrências e Finanças (Categorias) escondem o botão de criação quando o utilizador não tem a permissão correspondente.
- **Listas:** Em Alunos e Turmas, as ações Editar e Eliminar (e Gerir Estudantes em Turmas) são escondidas quando o utilizador não tem permissão. Em Comunicados, Editar e Eliminar por linha dependem de `canEditComunicado` e `canDeleteComunicado` (admin ou autor). Em Disciplinas, a coluna Ações (Editar/Eliminar) só aparece com `canManageDisciplinas`. Em Anos letivos, a coluna Ações (Editar) só aparece com `isAdmin`. Em Horários, a coluna Ações (Eliminar) e o botão "Novo horário" só aparecem com `canManageHorarios`. Em Atas, o botão Nova Ata, o empty state "Criar Ata" e os botões Editar/Eliminar por card só aparecem com `canManageAtas` (admin/direção). Em Ocorrências, o botão Nova Ocorrência e as ações Marcar Resolvido/Reabrir e Eliminar por card só aparecem com `canManageOcorrencias` (admin/direção/professor). Em Finanças: Categorias, Lançamentos e Parcelas — a coluna Ações (Editar/Eliminar ou Liquidar) e os botões de criação (Nova Categoria, Novo Lançamento, Gerar Lote de Propinas) só aparecem com `canGerirFinancas` (admin/direção). Em Configuração, o botão "Aplicar Configurações" só aparece com `canGerirFinancas`. Em Relatórios, o botão "Exportar PDF" só aparece com `canGerirFinancas`.
- **Módulos (Definições):** a página inteira está reservada a admin (`canManageModulos`); utilizadores sem permissão veem a mensagem "Acesso reservado" e um link para voltar ao início. A coluna Ações (Instalar) na lista de módulos disponíveis só aparece para admin.
- **Presenças:** o link "Registo de chamada →" no header só aparece com `canRegistarFrequencia` (admin/direção/professor).
- **Notas:** os campos MAC/NPP são só leitura e os botões Reverter/Confirmar e Publicar só aparecem com `canLancarNotas` (admin/direção/professor).
- **Frequência (relatório):** o botão "Registar Chamada" no header do relatório só aparece com `canRegistarFrequencia`.
- **Configuração Académica:** o botão "Validar & Salvar Configurações" só aparece com `isAdmin` (admin/direção).
- **Pautas:** os botões Imprimir e Exportar Excel só aparecem com `canViewNotas`.
- **Justificativas de Frequência:** o botão "Registar Justificação" só aparece com `canRegistarFrequencia`; os botões Deferir/Indeferir por pedido pendente só aparecem com `isAdmin` (admin/direção).
- **Recuperação (exames):** o botão Eliminar por registo e o campo nota + botão Lançar por candidato só aparecem com `canLancarNotas`; o campo nota fica só leitura quando o utilizador não pode lançar notas.
- **Command Palette (⌘K):** as ações "Registar Novo Aluno", "Criar Nova Turma" e "Marcar Presenças" são filtradas por permissão.
- **Menu Ajuda:** o item "Documentação" abre a navegação e permissões no repositório.

---

## Rotas aluno e responsável

- `/meu-perfil` — mesmo componente que `/perfil` (dados do utilizador).
- `/meu-boletim` — boletim do aluno/responsável.
- `/aulas-hoje` — página «Aulas de hoje» (aluno); link para horário completo.
- `/meus-filhos` — lista de filhos (responsável).

Definidas em `App.tsx`; labels e second bar em `config/routes.ts`.

---

## Como adicionar um novo papel

1. **Backend:** em `server/lib/escola/permissoes.ts` usar o novo papel nas listas `PAPEIS_*` e nas funções que o devem incluir.
2. **Frontend:** em `gestao-escolar/src/lib/permissoes.ts` adicionar o tipo `Papel` e as funções que o considerem.
3. **Sidebar:** em `sidebarConfig.ts` adicionar `roles` nos itens que o novo papel deve ver.
4. **Barra contextual:** em `contextBarConfig.ts` adicionar `roles` nas entradas onde o novo papel tenha contexto.

---

## Referências

- Backend permissões: `server/lib/escola/permissoes.ts`
- Base do projeto: [BASE-PROJETO-ESCOLA.md](BASE-PROJETO-ESCOLA.md)
- Análise de ficheiros: [ANALISE-ARQUIVOS-E-FUNCOES.md](ANALISE-ARQUIVOS-E-FUNCOES.md)
