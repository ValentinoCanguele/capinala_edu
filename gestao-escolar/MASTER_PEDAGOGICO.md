# 🏛️ Master Academic Blueprint: Rigor de 1000+ Funções (ERP Elite)
Este documento é a especificação técnica de ultra-alta densidade para o módulo académico. Cada item representa uma micro-funcionalidade de precisão para garantir conformidade normativa, segurança de dados e experiência premium.

---

## 🏗️ Fase 1: Infraestrutura Académica & Espaços (Total Precision)

### M1.0: Máquina de Matrizes Curriculares (50+ Funções)
- [x] **Core**: Criação de planos de estudo e cargas horárias (Teórica/Prática).
- [x] **M1.0.1: Herança de Matriz**: Clonar estrutura de um ano letivo para o outro com 1 clique, mantendo histórico de versões.
- [x] **M1.0.2: Grupos de Disciplinas**: Categorização em "Ciências", "Humanidades", "Técnicas" para cálculos de média por área.
- [x] **M1.0.3: Regras de Precedência**: Bloqueio de matrícula em "Matemática II" se o aluno não tiver aprovação em "Matemática I".
- [ ] **M1.0.4: Máquina de Equivalências**: Motor de "De/Para" para validação automática de notas vindas de outras instituições/matrizes.
- [ ] **M1.0.5: Suporte Multi-Regime**: Gestão simultânea de regimes Semestrais, Trimestrais e Anuais na mesma escola.
- [x] **M1.0.6: Editor de Fórmulas Académicas**: UI para definir como a média da disciplina é calculada (ex: `(MAC * 0.4) + (NPP * 0.6)`).

### M1.1: Otimização de Espaços & Recursos (40+ Funções)
- [x] **Core**: Mapeamento de salas por lotação, tipo e área m2.
- [x] **Audit**: Relatórios de ocupação semanal e eficiência de uso.
- [x] **M1.1.1: Inventário Técnico de Sala**: Listagem exata de hardware (ex: 20 PCs i7, 1 Projetor Epson 4K) com estado de conservação.
- [x] **M1.1.2: Motor de Conflitos**: Bloqueio em tempo real de reservas duplicadas por dia/hora/minuto.
- [x] **M1.1.3: Manutenção de Espaços**: Registo de avarias e logs de reparação integrados no dashboard da direção.
- [x] **M1.1.4: Otimizador Inteligente**: Sugestão automática de salas com base no número de alunos inscritos na turma (evitar sala grande para 5 alunos).

---

## 📊 Fase 2: Motor de Avaliação & Performance (Grading Engine)

### A2.0: Cálculo de Médias & Rigor Normativo (60+ Funções)
- [x] **Core**: Pesos por trimestre e cálculo automático de médias anuais.
- [x] **A2.0.1: Arredondamento Parametrizável**: Configuração por nível de ensino (ex: 9.5 -> 10 ou 9.5 -> 9 conforme lei local).
- [x] **A2.0.2: Gestão de Bónus de Atitude**: Atribuição de pontos extras (0.5 a 2.0) baseados em participação e comportamento.
- [x] **A2.0.3: Bloqueio de Notas Pós-Prazo**: Tranca automática de edição de notas após X dias do fim do trimestre (exige token de Diretor para abrir).
- [ ] **A2.0.4: Fluxo de Revisão de Prova**: Pedido formal do encarregado, troca de status da nota para "Em Auditoria" e registo de nova nota.
- [ ] **A2.0.5: Notas de Exame Especial**: Diferenciação clara entre Exame Corrente, Recurso e Época Especial (Militares/Atletas).

### A2.1: Pautas, Atas & Documentação Oficial (50+ Funções)
- [x] **Core**: Geração de Broadsheets (Pautas Gerais) e Atas de Conselho.
- [ ] **A2.1.1: Pautas Estilizadas (Templates)**: Exportação em formatos oficiais do Ministério com logotipos e cabeçalhos normatizados.
- [ ] **A2.1.2: QR Code de Autenticidade**: Cada documento exportado leva um código único de validação online (Anti-Fraude).
- [ ] **A2.1.3: Estatísticas de Reprovação**: Gráficos de barra integrados na pauta mostrando % de sucesso por disciplina/professor.
- [ ] **A2.1.4: Assinatura Digital em Lote**: Assinar 50 atas de uma vez usando certificado digital ou assinatura manuscrita digitalizada.

---

## 🕒 Fase 3: Assiduidade & Biometria (Attendance Precision)

### T3.0: Registo & Controle de Fluxo (40+ Funções)
- [x] **Core**: Registo QR/Manual e Scanner de Frequência.
- [x] **T3.0.1: Tolerância de Atraso**: Configuração de janela (ex: 15 min). Atraso > 15 min = Falta; Atraso < 15 min = "Late Arrival".
- [x] **T3.0.2: Gestão de Justificações Médico-Legais**: Upload de atestado médico com data de início/fim e limpeza automática de faltas no período.
- [ ] **T3.0.3: Sensor de Geofencing**: Marcação de presença pelo professor válida apenas se estiver dentro do raio GPS da escola.
- [x] **T3.0.4: Faltas Coletivas**: Lançamento rápido de falta/presença para toda a turma em eventos específicos (greves, feriados pontuais).

### T3.1: Alertas & Prevenção de Abandono (30+ Funções)
- [x] **Core**: Alerta de limite de 25% de faltas críticas.
- [ ] **T3.1.1: Notificação Push/SMS Automática**: Envio imediato ao encarregado no momento exato em que a falta é registada.
- [x] **T3.1.2: Relatório de Recorrência**: Identificar alunos que faltam sistematicamente às sextas-feiras ou segundas-feiras.
- [ ] **T3.1.3: Plano de Recuperação de Faltas**: Atribuição de trabalhos compensatórios para anular efeitos administrativos das faltas.

---

## 👨‍👩‍👧‍👦 Fase 4: Comportamento & Psicopedagogia (Behavioral)

### C4.1: Sistema Disciplinar de Alta Densidade (40+ Funções)
- [x] **Core**: Registo de Advertências e Ocorrências Disciplinares.
- [ ] **C4.1.1: Score Comportamental**: Cada aluno começa com 100 pontos. Faltas graves retiram pontos; elogios adicionam.
- [ ] **C4.1.2: Workflow de Sanções**: Advertência -> Suspensão 3 dias -> Processo de Expulsão (com aprovação de conselho).
- [ ] **C4.1.3: Notas Psicotécnicas Privadas**: Diário de bordo oculto para psicólogos/orientadores, inacessível a professores comuns.
- [ ] **C4.1.4: Atas de Audiência**: Registo da defesa do aluno e testemunhos durante processos disciplinares graves.

---

## 🛡️ Fase 5: Auditoria, Compliance & Segurança (Audit Trail)

### S5.0: Rastreabilidade Total (30+ Funções)
- [x] **Core**: Log de alterações básico (Quem/Quando).
- [ ] **S5.0.1: Deep Audit (Diff)**: Registo de "De -> Para" em alterações de nota. (Ex: "João Silva mudou nota de Matemática de 08 para 12 em 25/05").
- [ ] **S5.0.2: Monitor de Saúde de Dados**: Verificação automática de inconsistências (ex: aluno com nota 18 mas média final 10).
- [ ] **S5.0.3: Arquivo Histórico (Immutable)**: Selagem de dados de anos letivos passados para garantir que nada seja alterado retroativamente.
- [ ] **S5.0.4: Backup Diário encriptado**: Exportação automatizada da base de dados académica para S3/Cold Storage.

---
*Estado Atual: **Fases 1-4 Operacionais (MVP)***
*Próximo Passo: Refinamento de **Micro-Regras Normativas (Arredondamento/Precedência)** e **Sistema de Equivalências**.*
