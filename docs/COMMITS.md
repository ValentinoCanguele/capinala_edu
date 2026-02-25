# Convenção de commits

Este projeto usa **Conventional Commits** para mensagens claras e consistentes. Assim o histórico fica legível e permite gerar changelogs automáticos.

## Formato

```
<tipo>(<âmbito>): <descrição curta>

[corpo opcional]

[rodapé opcional]
```

- **Tipo**: o que mudou (feat, fix, refactor, etc.).
- **Âmbito**: módulo ou área (ex.: financas, modulos, escola).
- **Descrição**: frase no imperativo, sem ponto final, ~50 caracteres.

## Tipos

| Tipo       | Uso |
|-----------|-----|
| `feat`    | Nova funcionalidade |
| `fix`     | Correção de bug |
| `refactor`| Alteração de código sem mudar comportamento visível |
| `docs`    | Apenas documentação |
| `style`   | Formatação, espaços, aspas (não altera lógica) |
| `test`    | Testes |
| `chore`   | Tarefas de manutenção (deps, config, scripts) |
| `perf`    | Melhoria de desempenho |

## Âmbitos comuns

- `escola` – módulo escola / gestão escolar
- `financas` – módulo finanças
- `modulos` – gestão de módulos
- `auth` – autenticação
- `ui` – componentes e páginas genéricas
- `api` – rotas e serviços backend

## Exemplos de commits bonitos

```bash
feat(financas): adicionar exportação CSV de inadimplentes
fix(escola): corrigir cálculo de média no boletim
refactor(modulos): usar EmptyState na lista de módulos instalados
docs(escola): descrever fluxo de instalação de módulos em MODULOS-REGISTO-E-CORE.md
style(ui): aplicar scope="col" nas tabelas para acessibilidade
chore(deps): atualizar react-router-dom para 6.22
perf(financas): memoizar filtros em FinancasRelatorios
```

## Regras rápidas

1. **Imperativo**: "adicionar" e não "adicionado" ou "adiciona".
2. **Sem ponto final** na descrição.
3. **Descrição curta** na primeira linha; detalhes no corpo se precisar.
4. **Âmbito** em minúsculas; pode ser omitido em mudanças muito gerais.
5. **Corpo** (opcional): explicar o porquê, não o quê; quebras de linha entre parágrafos.

## Exemplo com corpo

```
feat(financas): permitir multa e juros configuráveis em percentual

- Substituir valores fixos em Kz por percentuais na configuração.
- Manter compatibilidade com dados já guardados (migração 007).
```

## Referência

- [Conventional Commits](https://www.conventionalcommits.org/)
- Histórico do repositório: `git log --oneline` para ver o estilo em uso.
