/**
 * Catálogo de módulos disponíveis para instalação.
 * Ao adicionar um novo módulo ao sistema: (1) registar aqui, (2) adicionar rota/nav no frontend.
 * O core usa este catálogo para listar "disponíveis" (não instalados) e para instalar.
 */

export interface EntradaCatalogo {
  chave: string
  nome: string
  descricao: string
  imagem?: string | null
  icone: string
  ordemDefault: number
  permissoesDefault: string[]
}

export const MODULOS_CATALOGO: EntradaCatalogo[] = [
  { chave: 'inicio', nome: 'Início', descricao: 'Dashboard e resumo', icone: 'Home', ordemDefault: 0, permissoesDefault: ['admin', 'direcao', 'professor', 'responsavel'] },
  { chave: 'alunos', nome: 'Alunos', descricao: 'Listagem e cadastro de alunos', icone: 'Users', ordemDefault: 10, permissoesDefault: ['admin', 'direcao', 'professor'] },
  { chave: 'turmas', nome: 'Turmas', descricao: 'Turmas e matrículas', icone: 'BookOpen', ordemDefault: 20, permissoesDefault: ['admin', 'direcao', 'professor'] },
  { chave: 'notas', nome: 'Notas', descricao: 'Lançamento de notas', icone: 'ClipboardList', ordemDefault: 30, permissoesDefault: ['admin', 'direcao', 'professor'] },
  { chave: 'frequencia', nome: 'Frequência', descricao: 'Registo de presenças', icone: 'CalendarCheck', ordemDefault: 40, permissoesDefault: ['admin', 'direcao', 'professor'] },
  { chave: 'boletim', nome: 'Boletim', descricao: 'Consultar boletins', icone: 'FileText', ordemDefault: 50, permissoesDefault: ['admin', 'direcao', 'professor', 'responsavel'] },
  { chave: 'horarios', nome: 'Horários', descricao: 'Horários de turmas', icone: 'Clock', ordemDefault: 60, permissoesDefault: ['admin', 'direcao', 'professor', 'responsavel'] },
  { chave: 'comunicados', nome: 'Comunicados', descricao: 'Comunicados da escola', icone: 'Megaphone', ordemDefault: 70, permissoesDefault: ['admin', 'direcao', 'professor', 'responsavel'] },
  { chave: 'disciplinas', nome: 'Disciplinas', descricao: 'Gerir disciplinas', icone: 'BookMarked', ordemDefault: 80, permissoesDefault: ['admin', 'direcao'] },
  { chave: 'anos-letivos', nome: 'Anos letivos', descricao: 'Gerir anos letivos', icone: 'Calendar', ordemDefault: 90, permissoesDefault: ['admin', 'direcao'] },
  { chave: 'salas', nome: 'Salas', descricao: 'Gerir salas e capacidade', icone: 'DoorOpen', ordemDefault: 100, permissoesDefault: ['admin', 'direcao'] },
  { chave: 'financas', nome: 'Finanças', descricao: 'Receitas, despesas e parcelas (Kz)', icone: 'Banknote', ordemDefault: 110, permissoesDefault: ['admin', 'direcao'] },
  { chave: 'auditoria', nome: 'Auditoria', descricao: 'Log de alterações', icone: 'History', ordemDefault: 120, permissoesDefault: ['admin'] },
  { chave: 'definicoes', nome: 'Definições', descricao: 'Módulos e configurações do sistema', icone: 'Settings', ordemDefault: 200, permissoesDefault: ['admin'] },
]

export function getEntradaCatalogo(chave: string): EntradaCatalogo | null {
  return MODULOS_CATALOGO.find((e) => e.chave === chave) ?? null
}

export function getChavesDisponiveis(instaladosChaves: string[]): string[] {
  const set = new Set(instaladosChaves)
  return MODULOS_CATALOGO.filter((e) => !set.has(e.chave)).map((e) => e.chave)
}
