# Tema — Gestão Escolar

Fonte única do tema visual da aplicação. Mantém a app em harmonia com o sistema de design (baseado no tema Gibbon).

## Estrutura

| Ficheiro | Função |
|----------|--------|
| **index.css** | Entrada do tema. Importar apenas este ficheiro. |
| **variables.css** | Aliases `--gibbon-*` do tema central (`theme/styles/vars.css`). Usadas pelo Tailwind e por `components.css`. |
| **components.css** | Classes de componentes: `.btn-primary`, `.btn-secondary`, `.card`, `.input`, `.label`, `.alert-*`, `.link-action-*`. |

## Uso

- **Tailwind**: em `tailwind.config.js` as cores `brand` e `gibbon` referenciam as variáveis de `variables.css`. Use `bg-brand-3`, `text-gibbon-text-1`, etc.
- **Componentes**: pode usar as classes de `components.css` (ex.: `className="btn-primary"`) ou as equivalentes em Tailwind; ambas ficam consistentes.
- **Alterações**: cores vêm do tema central `theme/styles/vars.css`; aliases e componentes estão em `src/theme/`. Para mudar cores em toda a app e na documentação, editar `theme/styles/vars.css`.

## Tema central (`theme/` na raiz)

A pasta `theme/` é a **fonte única** do tema Gibbon. A app importa `theme/styles/vars.css` em `variables.css` e usa os aliases `--gibbon-*`. Documentação (VitePress) e Gibbon PHP usam os mesmos ficheiros em `theme/styles/`.
