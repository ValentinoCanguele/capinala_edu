# Catálogo de Refinamento Front-End Premium (150+ Funções)

Estado atual do projeto Gestão Escolar face ao catálogo Premium B2B.  
Legenda: ✅ Feito | 🟡 Parcial | ⬜ A fazer

---

## 1. Micro-Interações e Animações (20)

| # | Função | Estado | Notas |
|---|--------|--------|--------|
| 1 | Efeitos de Hover suaves em todas as linhas de tabelas | ✅ | `table tbody tr` com transition + hover em theme/components.css |
| 2 | Estados ativos (Scale down) em botões principais | ✅ | `button:active:not(:disabled) { transform: scale(0.97); }` em components.css |
| 3 | Loading spinners dentro de botões ao submeter forms | ✅ | `Button` tem prop `loading` com spinner |
| 4 | Skeleton loaders para todos os widgets do Dashboard | ✅ | StatCardSkeleton, TableSkeleton, PageSkeleton, SkeletonTable |
| 5 | Toast notifications com barra de progresso de tempo | 🟡 | Keyframe `toast-progress` em tailwind; toast custom por implementar |
| 6 | Transições suaves (Fade + Slide up) na abertura de modais | ✅ | Modal: overlay animate-fade-in, content animate-slide-up |
| 7 | Animação de Fade in no carregamento inicial das páginas | ✅ | Layout: área do Outlet com animate-fade-in |
| 8 | Animação de Pulse (Pulsar) em badges de estado crítico | ✅ | Badge tem prop `pulse`; usar `pulse` em variante danger |
| 9 | Tooltips nativos flutuantes em textos truncados/cortados | 🟡 | Tooltip no ID aluno (AlunosList); title em emails truncados |
| 10 | Tooltips explicativos em ícones sem label de texto | ✅ | Tooltip no chip ID; aria-label em botões Editar/Mais opções (Alunos, Turmas) |
| 11 | Focus rings (Aros azuis) perfeitos em todos os inputs | ✅ | Input com focus-visible:ring-2 focus-visible:ring-offset-2 |
| 12 | Empty States com ilustrações animadas/elegantes | 🟡 | EmptyState com ícone e hover; sem ilustrações SVG |
| 13 | Micro-animação de Sucesso (check mark desenhado) após gravar | ⬜ | Toast só ícone; opcional checkmark animado |
| 14 | Animação de erro (Shake) em login/forms falhados | ✅ | Toaster error className: animate-shake |
| 15 | Destaque temporário (flash) numa linha de tabela recém-adicionada | ⬜ | Não implementado |
| 16 | Accordions com expansão/recolhimento animados | 🟡 | Accordion existe; verificar CSS transition |
| 17 | Scroll suave (Smooth Scroll) em páginas longas | ✅ | html { scroll-behavior: smooth } em index.css; desativado com prefers-reduced-motion |
| 18 | Efeitos de Skeleton em imagens/avatares enquanto carregam | ⬜ | Sem componente Avatar com skeleton |
| 19 | Checkboxes personalizados com animação de preenchimento | 🟡 | Checkbox.tsx; verificar animação |
| 20 | Radio buttons com micro-animação no ponto central | ⬜ | Auditar se há radios; adicionar animação |

---

## 2. Acessibilidade e Atalhos de Teclado (20)

| # | Função | Estado | Notas |
|---|--------|--------|--------|
| 21 | Atalho Cmd+K / Ctrl+K: Paleta de pesquisa global | ✅ | Layout e CommandPalette: Cmd+K e tecla / abrem a paleta |
| 22 | Atalho Cmd+S / Ctrl+S: Guardar formulários abertos | ✅ | useSaveShortcut; usado em CategoriaForm e AlunoForm |
| 23 | Tecla Esc: Fecha modais, dropdowns e menus | ✅ | Modal usa Escape; ConfirmDeleteModal idem |
| 24 | Teclas Setas: Navegação em tabelas e grelhas | ⬜ | Não implementado |
| 25 | Tecla Enter: Submissão rápida de formulários | 🟡 | Forms nativos submetem com Enter; validar em modais |
| 26 | Tecla /: Foca input de pesquisa da página | ✅ | Layout: abre Command Palette (input com autoFocus); ignora se foco em input/textarea/select |
| 27 | Seleção Múltipla com Shift+Click em checkboxes | ✅ | AlunosList: handleSelect com shiftKey + lastSelectedIndex (intervalo) |
| 28 | ARIA labels dinâmicos para ícones solitários | ✅ | AlunosList: Editar/Mais opções com aria-label por nome; expandir noutras tabelas |
| 29 | Focus Trap dentro de modais abertos | ✅ | Modal: ciclo Tab/Shift+Tab, foco inicial no primeiro focusável, restaura foco ao fechar |
| 30 | Link "Saltar para o conteúdo" | ✅ | .skip-link em index.css |
| 31 | Contraste WCAG em textos cinzentos | 🟡 | Variáveis studio-foreground-light/lighter; validar rácios |
| 32 | Anúncios de Leitores de Ecrã ao carregar dados | ✅ | AlunosList, TurmasList, Utilizadores loading; Forbidden; role="status" aria-live |
| 33 | Menus Dropdown navegáveis com Tab | 🟡 | DropdownSelect; testar teclado |
| 34 | Indicadores de Focus visíveis só com teclado | 🟡 | focus-visible em alguns sítios |
| 35 | Ordem de Tab otimizada em formulários | 🟡 | Ordem natural; auditar forms longos |
| 36 | Toggle Switches com acessibilidade nativa | 🟡 | Switch.tsx; verificar role/aria |
| 37 | Mensagens de erro com aria-describedby no input | ✅ | Input.tsx: aria-describedby + id no <p> de erro |
| 38 | Asteriscos estilizados para campos obrigatórios | ✅ | Input: * vermelho na label quando required |
| 39 | Atalhos Alt+1, Alt+2 para menu lateral | ⬜ | Não implementado |
| 40 | prefers-reduced-motion | ✅ | index.css: second-bar e sidebar-transition |

---

## 3. Apresentação de Dados e Formatação (25)

| # | Função | Estado | Notas |
|---|--------|--------|--------|
| 41 | Formatação moeda (Kz / AOA) com Intl.NumberFormat | ✅ | formatCurrency em lib; uso em Finanças |
| 42 | Formatação relativa de tempo ("há 2 horas") | ✅ | formatRelativeTime em utils/formatters; Auditoria; formatDateShort para listas |
| 43 | Máscaras de input para telefones (+244 9XX XXX XXX) | ⬜ | Não implementado |
| 44 | Máscaras e validação NIF, BI, Cédula angolana | ⬜ | Não implementado |
| 45 | Separadores de milhares (1.500.000,00) | 🟡 | formatCurrency; verificar locale |
| 46 | Truncamento com elipses em e-mails (mobile) | 🟡 | AlunosList: email com truncate + title; expandir a outras tabelas |
| 47 | Badges de estado coloridos (Ativo/Pendente/Inativo) | ✅ | Badge, StatusIndicator |
| 48 | Formatação KB/MB em ficheiros anexos | ✅ | formatBytes em utils/formatters; coluna Tamanho em Arquivos |
| 49 | Barras de progresso (ex: Lotação 25/30) | ✅ | TurmasList: LotacaoBar (ProgressBar) current/max 30; variante warning/error |
| 50 | Sparklines na coluna de avaliação | ⬜ | Não implementado |
| 51 | Formatação condicional (negativas a vermelho) | 🟡 | Notas e Finanças já usam classes condicionais |
| 52 | Headers de tabelas ordenáveis (seta subir/descer) | ⬜ | Não implementado |
| 53 | Sticky header em tabelas com scroll | ✅ | AlunosList, Boletim, Notas, Pautas, Frequencia, Utilizadores, TurmasList; Frequencia Relatório |
| 54 | Primeira coluna sticky em tabelas largas | ✅ | AlunosList: checkbox + Estudante sticky; TurmasList: coluna Turma sticky; scroll horizontal |
| 55 | Filtros em "pílulas" no topo das listas | 🟡 | Alguns filtros; não em pills |
| 56 | Itens por página (10, 20, 50) | 🟡 | Pagination existe; verificar opções |
| 57 | Exportar PDF (visual tabular) | ⬜ | Não implementado |
| 58 | Exportar XLSX/CSV | ⬜ | Não implementado |
| 59 | Modo impressão @media print limpo | ✅ | index.css: esconder sidebar, header, nav, BackToTop; fundo branco |
| 60 | Notas com ponto ou vírgula conforme OS | 🟡 | Input numérico; validar locale |
| 61 | Avatares dinâmicos (letras, cores por nome) | ✅ | Avatar.tsx: iniciais + colorPalette por hash do nome |
| 62 | Cores de fundo do avatar por nome | ✅ | Incluído em 61 (Avatar) |
| 63 | IDs em monospace encurtado (#ALN-45B) | ✅ | formatAlunoDisplayId → #A4B2 (chip); formatShortId para outras listas; Tooltip com ID completo |
| 64 | Datas humanizadas (12 Out, 2026) | ✅ | formatDateShort e formatRelativeTime; Auditoria, Comunicados (relativo), FinancasLancamentos (curta) |
| 65 | Turmas por cor (A - Azul, B - Verde) | ⬜ | Não implementado |

---

## 4. Layout e Navegação Avançada (20)

| # | Função | Estado | Notas |
|---|--------|--------|--------|
| 66 | Breadcrumbs estruturados em cada página | ✅ | getBreadcrumbs em config/routes; Layout |
| 67 | Colapso do menu lateral (icon-only) | ✅ | Layout: isSidebarNarrow, PanelLeftClose/PanelLeft, hover expande |
| 68 | Auto-fecho do menu em mobile após clique | ✅ | Layout: sidebar mobile com backdrop; fecha ao navegar (useEffect pathname) e ao clicar no backdrop; botão hamburger em md:hidden |
| 69 | Destacar rotas ativas e rotas-pai no menu | 🟡 | navItemsConfig e active; verificar pai |
| 70 | Botão "Voltar ao Topo" em listas longas | ✅ | BackToTop + useScrollTop; Layout com ref no content |
| 71 | Action Bar flutuante no fundo em forms longos | ⬜ | Não implementado |
| 72 | Context Menus (clique-direito) nas linhas de tabela | 🟡 | ContextMenu.tsx; expandir uso |
| 73 | Bottom Navigation no telemóvel | ⬜ | Não implementado |
| 74 | Swipe-to-Delete em touch | ⬜ | Não implementado |
| 75 | Barra de loading global no topo (estilo Vercel) | ✅ | GlobalLoadingBar em Layout; anima ao mudar pathname |
| 76 | Página 404 personalizada | ✅ | NotFound.tsx |
| 77 | Página 403 (Acesso Negado) | ✅ | Forbidden.tsx; rota /403 |
| 78 | Indicador flutuante modo Offline | ✅ | OfflineIndicator; barra no topo; App.tsx |
| 79 | Pull-to-refresh em tabelas (mobile) | ⬜ | Não implementado |
| 80 | Filtros na URL (?status=pendente&page=2) | 🟡 | Algumas listas; generalizar |
| 81 | Retenção de scroll ao voltar na lista | ⬜ | Não implementado |
| 82 | Grid responsivo 3 colunas → 1 (StatCards) | ✅ | Dashboard e FinancasDashboard grid |
| 83 | Drawers/Slide-overs em vez de modais para forms longos | ⬜ | Só Modal; opcional Drawer |
| 84 | Modo fullscreen para relatórios gráficos | ⬜ | Não implementado |
| 85 | Back handler: avisar se sair sem gravar | ⬜ | Não implementado |

---

## 5. Formulários e Validação (25)

| # | Função | Estado | Notas |
|---|--------|--------|--------|
| 86 | Força de password em tempo real (barra vermelho→verde) | ⬜ | PasswordInput existe; sem barra de força |
| 87 | Alerta Caps Lock no login | ✅ | Login: getModifierState('CapsLock') + mensagem sob o campo senha |
| 88 | Revelar/Ocultar palavra-passe (olho) | ✅ | PasswordInput com toggle |
| 89 | AutoFocus no primeiro input ao abrir modal | ✅ | Modal: foco no primeiro INPUT/TEXTAREA/SELECT se existir, senão primeiro focusável |
| 90 | Validação inline (tick verde ao digitar) | ⬜ | Não implementado |
| 91 | Prevenção de duplo clique (Double Submit) | ✅ | Button loading; AlunoForm e outros com loading/disabled no submit |
| 92 | "Tem alterações não guardadas!" ao fechar | ✅ | AlunoForm/TurmaForm: onDirtyChange; Alunos/Turmas: confirm ao fechar modal |
| 93 | Drag and Drop visual para anexos | ⬜ | Não implementado |
| 94 | Preview de imagem de perfil no client | 🟡 | Perfil; verificar preview imediato |
| 95 | Contador de caracteres regressivo em textarea | ✅ | AutoResizeTextarea: showCharCount/maxLength → "X / max" abaixo |
| 96 | Textareas que crescem (auto-resize) | ✅ | AutoResizeTextarea.tsx |
| 97 | Dropdowns custom (em vez de select nativo) | 🟡 | DropdownSelect; expandir |
| 98 | Multi-select com chips removíveis | ⬜ | Não implementado |
| 99 | Limpar filtro / X no input | ✅ | Input: showClearButton + onClear; Alunos, Utilizadores, Turmas |
| 100 | Formato automático telefone (espaço a cada 3 dígitos) | ⬜ | Incluído em máscaras |
| 101 | Botão Copiar para IBAN, NIF | ⬜ | Não implementado |
| 102 | Debouncing na pesquisa (300–500 ms) | ✅ | useDebounce em hooks; Alunos, Disciplinas, Turmas e Utilizadores (400 ms) |
| 103 | Datepicker com calendário custom | ⬜ | Input date nativo; opcional picker |
| 104 | Feedback se email já existe antes de Guardar | ⬜ | Não implementado |
| 105 | Validação e sugestão de domínio (gmai.com) | ⬜ | Não implementado |
| 106 | autocomplete nos forms (email, etc.) | ✅ | Login: autoComplete email + current-password; expandir noutros forms |
| 107 | "Limpar formulário" com confirmação | ⬜ | Não implementado |
| 108 | Input numérico com botões + e - | ⬜ | Não implementado |
| 109 | Rich Text Editor em comunicados | ⬜ | Não implementado |
| 110 | Seletor de emojis | ⬜ | Não implementado |

---

## 6. Ajuda Contextual e Utilidades (15)

| # | Função | Estado | Notas |
|---|--------|--------|--------|
| 111 | Ícone ? com popover explicativo nas labels | ✅ | LabelWithHelp (ícone HelpCircle + Tooltip); Input com prop help; AlunoForm: Email, Data Nascimento, BI com help |
| 112 | Estado "Bem-vindo pela 1ª vez!" no dashboard | ✅ | Dashboard: banner com localStorage; dismissível; dica ⌘K |
| 113 | Badge "Novo" em módulos recentes na sidebar | ⬜ | Não implementado |
| 114 | Toast com ação "Desfazer" ao eliminar | ✅ | Alunos, Turmas, Disciplinas: toast com Desfazer que restaura via create (refetch) |
| 115 | Componente Reportar Bug/Ajuda no footer | ⬜ | Não implementado |
| 116 | Modal Cheatsheet com atalhos de teclado | ✅ | KeyboardShortcutsModal; Ajuda → Atalhos de teclado no Layout |
| 117 | Indicador servidor saudável (pontinho verde) | ⬜ | Não implementado |
| 118 | Modal "Atualizações Recentes (Changelog)" | ⬜ | Não implementado |
| 119 | Marcador Unread em notificações | ⬜ | Não implementado |
| 120 | Avatares com status Online/Offline | ⬜ | Não implementado |
| 121 | Sessão expirada: "Termina em 5min, manter?" | ⬜ | Não implementado |
| 122 | Dark Mode com Tailwind dark: | ✅ | darkMode: 'class'; variáveis .dark |
| 123 | Local Storage: última aba visitada | ⬜ | Não implementado |
| 124 | Módulos favoritos (pinar na barra) | ⬜ | Não implementado |
| 125 | Botão "Modo Foco" (ocultar não vitais) | ⬜ | Não implementado |

---

## 7. Funções Lógicas B2B (15)

| # | Função | Estado | Notas |
|---|--------|--------|--------|
| 126 | Command Palette (Cmd+K) pesquisa real na BD | ⬜ | Mockup; ligar à API |
| 127 | Ações em massa (Bulk Actions) com checkboxes | ⬜ | Não implementado |
| 128 | Checkbox "Selecionar tudo" na página | ⬜ | Não implementado |
| 129 | Rascunhos guardados no Storage (notas) | ⬜ | Não implementado |
| 130 | Impersonalização "View As..." (Admin vê como Professor) | ⬜ | Não implementado |
| 131 | Visualizador em modal para documentos/imagens | ⬜ | Não implementado |
| 132 | Geração de PDF dos boletins (jspdf/html2canvas) | ⬜ | Não implementado |
| 133 | Cadeado em menus que requerem licença | ⬜ | Não implementado |
| 134 | Timeline de auditoria por aluno | ⬜ | Não implementado |
| 135 | Descarregar múltiplos ficheiros em ZIP | ⬜ | Não implementado |
| 136 | Two-Factor Setup UI | ⬜ | Não implementado |
| 137 | Botão flutuante "Criar Novo..." global | ⬜ | Não implementado |
| 138 | Importação CSV com validação e progresso | ⬜ | Não implementado |
| 139 | Gráficos (Chart.js/Recharts) na dashboard | ⬜ | Não implementado |
| 140 | Copiar seleção da tabela (JSON/Excel) | ⬜ | Não implementado |

---

## 8. Arquitetura e Otimizações (10)

| # | Função | Estado | Notas |
|---|--------|--------|--------|
| 141 | Lazy loading em imagens (avatares) | ⬜ | Não implementado |
| 142 | Virtualized Lists (React Virtuoso) para 3000+ linhas | ⬜ | Não implementado |
| 143 | UX otimista (eliminar no ecrã, rollback se falha) | 🟡 | Mutations invalidate; remoção otimista pontual |
| 144 | Pre-fetching ao passar rato no menu | ✅ | Layout: SIDEBAR_PREFETCH + onMouseEnter no NavLink |
| 145 | Code splitting por módulo | ✅ | React.lazy por rota em App.tsx |
| 146 | Memoization (React.memo) em linhas de tabela | ⬜ | Não implementado |
| 147 | Theme Provider isolado | 🟡 | CSS variables; opcional React context |
| 148 | Colunas redimensionáveis (resizable) | ⬜ | Não implementado |
| 149 | Variáveis CSS para escala total (accent) | 🟡 | theme/variables.css |
| 150 | Strict null checks em todo o JSX | 🟡 | TypeScript; auditar strict |

---

## Ordem de implementação sugerida

1. **Lote 1 (Micro-Interações)**  
   Hover em linhas de tabela, modal com fade+slide, smooth scroll, toast com barra, pulse em badges críticos, focus rings em inputs.

2. **Lote 2 (Acessibilidade)**  
   Focus trap em modais, aria-describedby em erros, atalhos Cmd+S e /.

3. **Lote 3 (Dados)**  
   Datas relativas, formatação ficheiros, sticky header, ordenação de colunas.

4. **Lote 4 (Forms)**  
   AutoFocus em modais, prevenção duplo clique, "alterações não guardadas", debounce pesquisa.

5. **Lotes seguintes**  
   Conforme prioridade do produto (Command Palette, bulk actions, PDF, etc.).

---

*Documento vivo: atualizar estado à medida que as funções forem implementadas.*
