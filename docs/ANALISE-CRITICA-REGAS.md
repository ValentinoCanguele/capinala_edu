# Análise crítica — Regras, lógica e nano funções

## Objetivo

Rever as funções existentes no módulo escola, eliminar duplicação, introduzir regras reutilizáveis e nano funções para maior clareza e manutenção.

---

## Problemas identificados

### 1. Duplicação de `getEscolaId`

- **Problema:** A função `getEscolaId(user)` estava repetida em mais de 20 ficheiros em `lib/escola/services/`.
- **Risco:** Alteração da mensagem de erro ou da lógica exigia tocar em muitos sítios.
- **Solução:** Módulo central `lib/escola/core/authContext.ts` com `getEscolaId`, `getEscolaIdOrNull` e `temEscola`.

### 2. Validações de contexto espalhadas

- **Problema:** Em `notas.ts`, a validação “turma na escola + aluno matriculado + período do ano” estava inline e não reutilizável.
- **Risco:** Outros fluxos (ex.: pautas, boletins) poderiam repetir a mesma lógica ou esquecer alguma verificação.
- **Solução:** Ficheiro `lib/escola/regras/validacoes.ts` com nano funções:
  - `validarTurmaPertenceEscola`
  - `validarAlunoMatriculadoTurma`
  - `validarPeriodoDoAnoLetivo`
  - `validarDisciplinaNaTurma`
  - `validarAlunoPertenceEscola`
  - `validarContextoNota` (composição das anteriores)

### 3. Regras de aluno e matrícula pouco explícitas

- **Problema:** Eliminar aluno sem verificar matrículas; inscrever aluno na mesma turma duas vezes dava erro de BD em vez de mensagem clara.
- **Solução:**
  - `lib/escola/regras/aluno_rules.ts`: `podeEliminarAluno`, `contarMatriculasAluno`.
  - `lib/escola/regras/matricula_rules.ts`: `alunoJaMatriculadoNaTurma`, `validarPodeMatricular`.

### 4. Poucas nano funções em médias e permissões

- **Problema:** Cálculos e checagens de permissão poderiam ser mais granulares e reutilizáveis.
- **Solução:**
  - Em `regras/medias.ts`: `arredondarEscala`, `mediaSimples`, `menorNota`, `maiorNota`, `contarAbaixoMinimo`.
  - Em `permissoes.ts`: `canEditComunicado`, `canAcederAuditoria`, `canGerirUtilizadores`, `canGerirFinancas`, `canVerRelatorioFrequencia`.

---

## O que foi implementado

| Área | Ficheiro(s) | Alteração |
|------|-------------|-----------|
| Contexto de auth | `core/authContext.ts`, `core/index.ts` | `getEscolaId`, `getEscolaIdOrNull`, `temEscola` |
| Validações de contexto | `regras/validacoes.ts` | Validadores de turma, aluno, período, disciplina e `validarContextoNota` |
| Regras de aluno | `regras/aluno_rules.ts` | `podeEliminarAluno`, `contarMatriculasAluno` |
| Regras de matrícula | `regras/matricula_rules.ts` | `alunoJaMatriculadoNaTurma`, `validarPodeMatricular` |
| Notas | `services/notas.ts` | Usa `core/authContext` e `regras/validacoes.validarContextoNota` |
| Alunos | `services/alunos.ts` | Usa `core/authContext` e `regras/aluno_rules.podeEliminarAluno` em `deleteAluno` |
| Matrículas | `services/matriculas.ts` | Usa `core/authContext` e `regras/matricula_rules.validarPodeMatricular` em `createMatricula` |
| Turmas / Frequência | `services/turmas.ts`, `services/frequencia.ts` | Passam a usar `getEscolaId` de `core/authContext` |
| Médias | `regras/medias.ts` | Novas nano: `arredondarEscala`, `mediaSimples`, `menorNota`, `maiorNota`, `contarAbaixoMinimo` |
| Permissões | `permissoes.ts` | Novas nano: `canEditComunicado`, `canAcederAuditoria`, `canGerirUtilizadores`, `canGerirFinancas`, `canVerRelatorioFrequencia` |

---

## Recomendações futuras

1. **Migrar os restantes serviços** para importar `getEscolaId` de `lib/escola/core/authContext` em vez de definir a função localmente.
2. **Professor só nas suas turmas:** Introduzir em `permissoes.ts` (ou regras) uma função do tipo `canProfessorLancarNotaNestaTurma(user, turmaId, db)` que consulte `turma_disciplina`/horários e use nos endpoints de notas e frequência.
3. **Schemas Zod:** Onde fizer sentido, usar `.refine()` para regras que dependem de dois campos (ex.: data fim > data início no ano letivo).
4. **Testes:** Alargar testes em `regras/validacoes`, `aluno_rules` e `matricula_rules` (ex.: `medias.test.ts`, `frequencia_rules.test.ts`).
5. **Auditoria:** Manter uso de `registarAudit` nos serviços que alteram dados; considerar extrair “antes/depois” para funções comuns (ex.: update genérico).

---

## Índice rápido das novas funções

- **core:** `getEscolaId`, `getEscolaIdOrNull`, `temEscola`
- **regras/validacoes:** `validarTurmaPertenceEscola`, `validarAlunoMatriculadoTurma`, `validarPeriodoDoAnoLetivo`, `validarDisciplinaNaTurma`, `validarContextoNota`, `validarAlunoPertenceEscola`
- **regras/aluno_rules:** `podeEliminarAluno`, `contarMatriculasAluno`
- **regras/matricula_rules:** `alunoJaMatriculadoNaTurma`, `validarPodeMatricular`
- **regras/medias (novas):** `arredondarEscala`, `mediaSimples`, `menorNota`, `maiorNota`, `contarAbaixoMinimo`
- **permissoes (novas):** `canEditComunicado`, `canAcederAuditoria`, `canGerirUtilizadores`, `canGerirFinancas`, `canVerRelatorioFrequencia`
