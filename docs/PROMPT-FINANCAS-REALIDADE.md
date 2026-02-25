# Prompt — Finanças escolares na realidade (visão profissional)

Este documento descreve como as finanças funcionam **na prática** numa escola que usa sistema de gestão, na ótica de um responsável financeiro ou contador. Serve de base de domínio para o módulo de finanças (sem detalhes de implementação).

---

## Quem escreve e para quê

- Perspectiva: **responsável financeiro** ou **contador** de uma escola (pública ou privada) que usa sistema de gestão no dia a dia.
- Objetivo: descrever **como as finanças funcionam na realidade**, não a implementação técnica.
- Tom: direto, baseado em rotinas reais (receber, pagar, cobrar, fechar mês, prestar contas).

---

## Receitas — na prática

- **Mensalidades**: valor por aluno (ou por turma/ano), recorrente; vínculo a ano letivo; eventual desconto por irmãos ou pagamento antecipado; datas de vencimento (ex.: dia 10 de cada mês).
- **Taxa de matrícula**: valor único no início do ano; pode ser parcelado (ex.: 2x); ligada ao ano letivo e ao aluno.
- **Atividades extras**: oficinas, excursões, material específico; valor por evento ou por pacote; pode ser opcional por aluno.
- **Outras receitas**: doações, eventos (festas, feiras), venda de material, convénios; sempre com data, valor, descrição e, se possível, categoria.
- **Registo**: toda entrada tem data de recebimento, valor, forma de pagamento (dinheiro, transferência, PIX, cartão), e referência (ex.: “Mensalidade João – mar/2025”). Em muitos casos há “previsão” (parcelas geradas) e “realizado” (pagamento efetivo).

---

## Despesas — na prática

- **Folha e encargos**: salários, férias, 13º, encargos sociais; muitas vezes por centro de custo (administrativo, pedagógico).
- **Estrutura**: aluguel, condomínio, água, luz, internet, telefone; normalmente fixas por mês.
- **Material e consumo**: material de escritório, limpeza, material didático; podem ser por departamento ou projeto.
- **Serviços**: limpeza, segurança, manutenção, contabilidade, jurídico; com data de vencimento e valor.
- **Registo**: data do pagamento (ou da obrigação), valor, fornecedor/beneficiário, categoria, centro de custo (se houver), e documento (nota fiscal, recibo).

---

## Fluxo de caixa e conciliação

- **Fluxo de caixa**: lista de entradas e saídas por período (dia, mês, ano); saldo inicial + entradas - saídas = saldo final; permite ver “quanto entrou” e “quanto saiu” e se há risco de falta de caixa.
- **Conciliação**: comparar “o que deveria ter entrado” (parcelas previstas) com “o que entrou” (pagamentos); inadimplência = diferença; relatórios de “a receber” e “recebido” por período.
- **Previsão**: com base em mensalidades e parcelas geradas, dá para estimar receita do mês/trimestre; despesas fixas ajudam a ver necessidade de caixa.

---

## Cobrança, parcelas e inadimplência

- **Parcelas**: cada mensalidade ou taxa pode ser uma “parcela” com vencimento, valor, status (aberta, paga, atrasada, cancelada). Geração em lote no início do ano ou do mês.
- **Multa e juros**: atraso gera multa (ex.: % fixo) e juros (ex.: % ao mês); valor atualizado para o responsável e para relatórios.
- **Inadimplência**: aluno/responsável com parcelas vencidas e não pagas; lista por período, turma ou escola; total em valor e em quantidade de parcelas.
- **Bloqueios**: política da escola (ex.: mais de 2 parcelas em atraso → bloqueio de emissão de documentos ou acesso ao boletim); o sistema deve permitir saber “está bloqueado?” por aluno/responsável.
- **Comunicação**: lembretes de vencimento, avisos de atraso; podem ser manuais (lista para enviar) ou integrados a mensagens (futuro).

---

## Papéis e quem faz o quê

- **Direção / Admin**: visão global; relatórios de receita, despesa, inadimplência, fluxo de caixa; aprovação de despesas grandes (se aplicável).
- **Secretaria / Financeiro**: emite cobranças, regista pagamentos, lança despesas e outras receitas; consulta inadimplentes e parcelas; não altera configurações globais (ex.: plano de contas).
- **Responsável**: vê apenas suas próprias parcelas (vencidas e a vencer), pagamentos realizados e valor total em atraso; pode imprimir segunda via; não vê dados de outros nem relatórios da escola.
- **Professor / Pedagógico**: em geral não acessa finanças; exceção se a escola definir “coordenador vê inadimplência da turma” para acompanhamento.

---

## Ano letivo e períodos

- **Ano letivo**: receitas e despesas são “do” ano (ex.: 2025); mensalidades e parcelas atreladas ao ano; relatórios filtrados por ano.
- **Períodos**: uso dos bimestres/trimestres já existentes (periodos) para agrupar lançamentos ou parcelas (ex.: “receita do 1º bimestre”); opcional mas útil para relatórios pedagógico-financeiros.

---

## Relatórios mínimos na realidade

- **Resumo mensal**: total de entradas, total de saídas, saldo do mês; opcionalmente por categoria.
- **Inadimplência**: lista de alunos/responsáveis com parcelas em atraso; valor total em aberto; quantidade de parcelas; filtro por turma e período.
- **Previsão vs. realizado**: receita prevista (soma das parcelas do mês) vs. receita realizada (pagamentos efetivos); diferença = inadimplência do período.
- **Fluxo de caixa**: entradas e saídas dia a dia ou por semana/mês; saldo acumulado.
- **Por aluno/turma**: receita por turma (mensalidades) ou por aluno (opcional); útil para direção.
