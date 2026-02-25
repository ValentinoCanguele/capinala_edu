# Registo de módulos e extensão do core

## Padrão de um módulo

Cada módulo segue um padrão no sistema:

- **Título** (`nome`): nome exibido no menu e nos cards.
- **Descrição** (`descricao`): texto curto que descreve o módulo.
- **Imagem** (`imagem`): URL opcional de uma imagem (card e lista).
- **Ícone** (`icone`): nome do ícone (ex: `Banknote`, `Users`) usado no menu e nos cards. O frontend mapeia estes nomes para componentes Lucide em `gestao-escolar/src/lib/moduloIcons.tsx`.
- **Estado**:
  - **Não instalado**: existe apenas no catálogo; mostra-se ícone/botão "Instalar".
  - **Instalado**: existe na tabela `sistema_modulos`; mostra-se ícone de **Configuração** e switch activo/inactivo.

## Catálogo e instalação

- **Catálogo**: definido em `server/lib/escola/modulosCatalogo.ts` (`MODULOS_CATALOGO`). Cada entrada tem: `chave`, `nome`, `descricao`, `imagem?`, `icone`, `ordemDefault`, `permissoesDefault`.
- **Instalação**: o admin em Definições → Módulos vê duas secções — "Módulos instalados" e "Disponíveis para instalar". Ao clicar "Instalar módulo" é chamada a API `POST /api/escola/modulos/instalar` com `{ chave }`. O servidor insere um novo registo em `sistema_modulos` a partir do catálogo.
- O sistema fica preparado para aceitar novos módulos: basta adicionar uma entrada ao `MODULOS_CATALOGO` e (opcionalmente) registar rota e menu no frontend (ver abaixo). Não é obrigatório ter rota/menu para aparecer no catálogo; pode ser um módulo só de backend.

## Como adicionar um novo módulo ao sistema

Para que um novo módulo seja instalável e visível no core:

### 1. Backend — Catálogo

Em `server/lib/escola/modulosCatalogo.ts`, adicionar uma entrada a `MODULOS_CATALOGO`:

```ts
{ chave: 'meu-modulo', nome: 'Meu Módulo', descricao: '...', icone: 'Package', ordemDefault: 130, permissoesDefault: ['admin', 'direcao'] }
```

Se o ícone não existir em `moduloIcons.tsx`, adicioná-lo ao mapa.

### 2. Frontend — Rota

Em `gestao-escolar/src/App.tsx`, registar a rota (ex.: `/meu-modulo`):

```tsx
<Route path="meu-modulo" element={<MeuModuloPage />} />
```

### 3. Frontend — Menu (core)

Em `gestao-escolar/src/pages/Layout.tsx`, em `navItems`, adicionar o item com **chave** igual à do catálogo (o primeiro segmento do path):

```tsx
{ to: '/meu-modulo', label: 'Meu Módulo', icon: Package }
```

O menu lateral usa `useModulos()` e filtra por `ativo` e `permissoes`; o item só aparece se o módulo estiver instalado, activo e o utilizador tiver um dos papéis em `permissoes`.

### 4. Frontend — Second bar (opcional)

Em `gestao-escolar/src/layout/secondBarConfig.ts`, adicionar as tabs para `/meu-modulo` se o módulo tiver sub-secções.

### 5. Frontend — Breadcrumbs (opcional)

Em `gestao-escolar/src/pages/Layout.tsx`, em `SEGMENT_LABELS`, adicionar o segmento para o path (ex.: `'meu-modulo': 'Meu Módulo'`).

## Como um módulo pode alterar o core

O core (Layout, App, secondBarConfig, breadcrumbs) está preparado para:

1. **Menu dinâmico**: o menu é construído a partir de `useModulos()`; cada item está associado a uma `chave` de módulo. Activar/desactivar ou alterar permissões em Definições → Módulos altera o que cada utilizador vê no menu.
2. **Rotas**: as rotas são registadas estaticamente em `App.tsx`. Um "novo módulo" implica adicionar uma nova rota e, se quiser, uma nova entrada no catálogo. Não há carregamento dinâmico de rotas por configuração (evita complexidade e riscos de segurança).
3. **Config por módulo**: o campo `config` (JSONB) em `sistema_modulos` pode ser usado pelo próprio módulo (ex.: página de configuração do módulo lê e grava via API). O core não interpreta `config`; cada módulo define a sua estrutura.
4. **Permissões**: o core usa o array `permissoes` do módulo para mostrar ou esconder o item do menu consoante o papel do utilizador. Pode ainda usar-se `canManageModulos` e regras em `server/lib/escola/permissoes.ts` para outras restrições.

Assim, cada módulo "altera o core" ao: (a) registar-se no catálogo, (b) registar rota e item de menu no código do core (Layout/App), e (c) opcionalmente usar `config` e lógica de permissões. O core permanece único; a extensão é feita por adição de código e dados (catálogo + menu + rota), não por plugins dinâmicos em runtime.

## Migrações

- `008_sistema_modulos.sql`: tabela e seed iniciais.
- `009_modulos_imagem_icone.sql`: colunas `imagem` e `icone` e preenchimento de `icone` por chave.

Executar as migrações para que a API e a UI de módulos funcionem com o padrão completo (título, descrição, imagem, ícone, instalar/config).
