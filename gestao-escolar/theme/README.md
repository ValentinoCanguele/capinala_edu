# Gibbon Theme

Tema oficial da documentação Gibbon. Tudo está **centralizado neste diretório**: variáveis, componentes e estilos partilhados entre VitePress e Gibbon (PHP).

## Estrutura (centralizada)

| Ficheiro | Descrição |
|----------|-----------|
| **styles/vars.css** | **Fonte única** de variáveis: cores base, tema (brand/tip/warning/danger), botões, hero, custom block. |
| **styles/options-boxes.css** | Boxes de opções (`.vp-box`, `.vp-box-container`). |
| **styles/custom-block.css** | Blocos tip / warning / danger (`.vp-doc` e `.gibbon-doc`). |
| **styles/timeline.css** | Timeline dos docs (`.vp-doc` e `.gibbon-doc`). |
| **styles/doc-shared.css** | Blockquote, copyright e títulos de grupo de menu (partilhado). |
| **style.css** | Tema VitePress: importa todos os `styles/*.css` e adiciona apenas overrides VitePress (logo, Algolia, menu, código). |
| **gibbon-docs-completo.css** | **Standalone para Gibbon PHP**: importa os mesmos `styles/*.css` e adiciona classes `.gibbon-docs-*` (logo, botão). Uma única folha para o layout PHP. |
| **index.js** | Entrada do tema VitePress (Vue). |

## Uso

- **VitePress**: o tema usa `style.css` (via `index.js`). Todas as variáveis e componentes vêm de `styles/`.
- **Gibbon (PHP)**: incluir no layout apenas `gibbon-docs-completo.css`. As importações relativas (`styles/vars.css`, etc.) devem ser servidas a partir da mesma base que `gibbon-docs-completo.css` (ex.: `/theme/gibbon-docs-completo.css` → `/theme/styles/vars.css`).
- **App Gestão Escolar (React)**: variáveis podem ser referenciadas em `src/theme/gibbon-vars.css` ou no Tailwind; manter consistência com `styles/vars.css`.

## Personalização

- **Cores de marca**: editar `styles/vars.css` (`--vp-c-brand-*`, `--vp-c-purple-*`). O resto do tema herda daí.
- Qualquer alteração em variáveis ou em componentes partilhados (boxes, custom block, timeline, blockquote) faz-se **só em** `styles/`; `style.css` e `gibbon-docs-completo.css` não duplicam essas regras.
