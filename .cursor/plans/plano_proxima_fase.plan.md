---
name: Plano próxima fase
overview: "Próximos passos após conclusão do plano frontend: testes E2E, documentação ANALISE, e opcionais (acessibilidade, APIs justificativas)."
todos: []
isProject: false
---

# Plano: próxima fase (pós frontend completo)

Este plano define opções para continuar o desenvolvimento após a conclusão do [plano único frontend completo](plano_único_frontend_completo_9ecb4063.plan.md) (sidebar, permissões UI + backend, documentação).

---

## Opção 1 — Testes E2E (recomendado)

- **Objetivo:** Garantir que fluxos críticos e permissões não regridem.
- **Onde:** Regras em `e2e-testing.mdc`; testes em pasta de E2E do projeto (se existir) ou criar com Playwright.
- **Exemplos de cenários:**
- Login como admin vs professor; verificar que botões "Novo aluno", "Nova turma" aparecem só para admin/direção onde aplicável.
- Página Módulos: utilizador não-admin vê "Acesso reservado".
- API: request POST para criar ata com papel professor devolve 403.
- **Entregáveis:** Pelo menos 1–2 testes de smoke (login + uma página por papel) ou testes de API de permissões.

---

## Opção 2 — Atualizar documentação ANALISE

- **Objetivo:** Manter [docs/ANALISE-ARQUIVOS-E-FUNCOES.md](../docs/ANALISE-ARQUIVOS-E-FUNCOES.md) alinhado com as alterações.
- **Incluir:**
- Novas funções em `gestao-escolar/src/lib/permissoes.ts` (canManageAtas, canManageOcorrencias, etc.).
- Novas funções em `server/lib/escola/permissoes.ts` (canManageAtas, canManageOcorrencias, PAPEIS_GESTAO export).
- Referência às rotas API que aplicam assertPermissao (atas, ocorrencias, exames).
- Menção a FRONTEND-NAVEGACAO-PERMISSOES.md como registo de permissões na UI.

---

## Opção 3 — Backend: justificativas de frequência

- **Objetivo:** Se existir API de justificativas (criar / aprovar-rejeitar), aplicar permissões no backend em paridade com o frontend.
- **Frontend já faz:** "Registar Justificação" com canRegistarFrequencia; "Deferir/Indeferir" com isAdmin.
- **Verificar:** Endpoints de justificativas em `server/pages/api/escola/` ou em `server/lib/escola/services/frequencia.ts`; adicionar assertPermissao para criar (PAPEIS_GESTAO) e para aprovar/rejeitar (PAPEIS_ADMIN).

---

## Opção 4 — Pequenas melhorias (opcional)

- **Acessibilidade:** Revisar tabelas (scope="col", aria-label) e foco em teclado nas páginas alteradas.
- **Consistência:** Garantir que todas as páginas de Finanças (dashboard, categorias, etc.) têm título e breadcrumb corretos.
- **Empty states:** Verificar mensagens quando listas vazias e permissões (ex.: "Não pode criar" quando !canCreate).

---

## Ordem sugerida

1. **Opção 2** (ANALISE) — rápido e útil para quem mantém o projeto.
2. **Opção 3** (justificativas API) — se a API existir, reforça segurança.
3. **Opção 1** (E2E) — quando houver tempo para configurar e manter testes.
4. **Opção 4** — conforme necessidade.

---

## O que não mudar

- Backend [permissoes.ts](server/lib/escola/permissoes.ts) como autoridade para APIs.
- Contrato e regras em [BASE-PROJETO-ESCOLA.md](../docs/BASE-PROJETO-ESCOLA.md) e [e2e-testing.mdc](../.cursor/rules/e2e-testing.mdc) quando aplicável.