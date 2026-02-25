import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'

const ESCOLA_API = '/api/escola'

export interface Aluno {
  id: string
  nome: string
  email: string
  dataNascimento: string
}

export interface Turma {
  id: string
  nome: string
  anoLetivo: string
  anoLetivoId?: string
  alunoIds: string[]
}

export interface Disciplina {
  id: string
  nome: string
}

export interface AnoLetivo {
  id: string
  nome: string
  dataInicio: string
  dataFim: string
}

export interface Periodo {
  id: string
  numero: number
  nome: string
  dataInicio: string | null
  dataFim: string | null
}

export interface NotaRow {
  id: string
  alunoId: string
  alunoNome: string
  valor: number
}

const queryKeys = {
  alunos: ['escola', 'alunos'] as const,
  aluno: (id: string) => ['escola', 'aluno', id] as const,
  turmas: ['escola', 'turmas'] as const,
  turma: (id: string) => ['escola', 'turma', id] as const,
  disciplinas: ['escola', 'disciplinas'] as const,
  anosLetivos: ['escola', 'anosLetivos'] as const,
  periodos: (anoLetivoId: string) => ['escola', 'periodos', anoLetivoId] as const,
  notas: (turmaId: string, periodoId: string) =>
    ['escola', 'notas', turmaId, periodoId] as const,
  boletim: (alunoId: string, anoLetivoId?: string) =>
    ['escola', 'boletim', alunoId, anoLetivoId] as const,
  meuPapel: ['escola', 'meu-papel'] as const,
  meusFilhos: ['escola', 'meus-filhos'] as const,
  horarios: (turmaId?: string, anoLetivoId?: string) =>
    ['escola', 'horarios', turmaId, anoLetivoId] as const,
  salas: ['escola', 'salas'] as const,
  comunicados: ['escola', 'comunicados'] as const,
  comunicado: (id: string) => ['escola', 'comunicado', id] as const,
  anoLetivo: (id: string) => ['escola', 'anoLetivo', id] as const,
  dashboardStats: ['escola', 'dashboard-stats'] as const,
  auditLog: (entidade?: string) => ['escola', 'audit', entidade] as const,
  alertas: ['escola', 'alertas'] as const,
  frequenciaResumo: (turmaId: string, disciplinaId?: string) =>
    ['escola', 'frequencia-resumo', turmaId, disciplinaId] as const,
  relatorioFrequenciaTurma: (turmaId: string) =>
    ['escola', 'relatorio-frequencia-turma', turmaId] as const,
  perfil: ['escola', 'perfil'] as const,
  meuAluno: ['escola', 'meu-aluno'] as const,
  resumoFrequenciaAluno: (alunoId: string, anoLetivoId?: string) =>
    ['escola', 'frequencia', 'resumo-aluno', alunoId, anoLetivoId] as const,
  documentos: (pessoaId?: string, alunoId?: string) =>
    ['escola', 'documentos', pessoaId, alunoId] as const,
  usuarios: (escolaId?: string) => ['escola', 'usuarios', escolaId] as const,
  usuario: (id: string) => ['escola', 'usuario', id] as const,
  permissoes: ['escola', 'permissoes'] as const,
  usuarioPermissoes: (userId: string) => ['escola', 'usuarios', userId, 'permissoes'] as const,
}

export function useAlunos() {
  return useQuery({
    queryKey: queryKeys.alunos,
    queryFn: async (): Promise<Aluno[]> => {
      const { data, error } = await api.get<Aluno[]>(`${ESCOLA_API}/alunos`)
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export function useTurmas() {
  return useQuery({
    queryKey: queryKeys.turmas,
    queryFn: async (): Promise<Turma[]> => {
      const { data, error } = await api.get<Turma[]>(`${ESCOLA_API}/turmas`)
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export function useDisciplinas() {
  return useQuery({
    queryKey: queryKeys.disciplinas,
    queryFn: async (): Promise<Disciplina[]> => {
      const { data, error } = await api.get<Disciplina[]>(`${ESCOLA_API}/disciplinas`)
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export function useDisciplina(id: string | null) {
  return useQuery({
    queryKey: ['escola', 'disciplina', id] as const,
    queryFn: async (): Promise<Disciplina | null> => {
      if (!id) return null
      const { data, error } = await api.get<Disciplina>(`${ESCOLA_API}/disciplinas/${id}`)
      if (error) throw new Error(error.message)
      return data ?? null
    },
    enabled: !!id,
  })
}

export function useAnosLetivos() {
  return useQuery({
    queryKey: queryKeys.anosLetivos,
    queryFn: async (): Promise<AnoLetivo[]> => {
      const { data, error } = await api.get<AnoLetivo[]>(`${ESCOLA_API}/anos-letivos`)
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export function useAnoLetivo(id: string | null) {
  return useQuery({
    queryKey: queryKeys.anoLetivo(id ?? ''),
    queryFn: async (): Promise<AnoLetivo | null> => {
      if (!id) return null
      const { data, error } = await api.get<AnoLetivo>(`${ESCOLA_API}/anos-letivos/${id}`)
      if (error) throw new Error(error.message)
      return data ?? null
    },
    enabled: !!id,
  })
}

export function usePeriodos(anoLetivoId: string | null) {
  return useQuery({
    queryKey: queryKeys.periodos(anoLetivoId ?? ''),
    queryFn: async (): Promise<Periodo[]> => {
      if (!anoLetivoId) return []
      const { data, error } = await api.get<Periodo[]>(
        `${ESCOLA_API}/periodos?anoLetivoId=${encodeURIComponent(anoLetivoId)}`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
    enabled: !!anoLetivoId,
  })
}

/* ── Meu papel / Meus filhos ── */

export type Papel = 'admin' | 'direcao' | 'professor' | 'responsavel' | 'aluno'

export interface MeuPapelResult {
  papel: Papel
  userId: string
  pessoaId: string
  escolaId: string | null
}

export function useMeuPapel() {
  return useQuery({
    queryKey: queryKeys.meuPapel,
    queryFn: async (): Promise<MeuPapelResult> => {
      const { data, error } = await api.get<MeuPapelResult>(`${ESCOLA_API}/meu-papel`)
      if (error) throw new Error(error.message)
      if (!data) throw new Error('Sem dados do utilizador')
      return data
    },
  })
}

export interface MeusFilhosRow {
  id: string
  nome: string
  email: string
  dataNascimento: string
}

export interface PerfilResult {
  id: string
  nome: string
  email: string
  dataNascimento: string | null
  telefone: string | null
  bi: string | null
  biEmitidoEm: string | null
  biValidoAte: string | null
  fotoUrl: string | null
}

export function usePerfil() {
  return useQuery({
    queryKey: queryKeys.perfil,
    queryFn: async (): Promise<PerfilResult | null> => {
      const { data, error } = await api.get<PerfilResult>(`${ESCOLA_API}/perfil`)
      if (error) throw new Error(error.message)
      return data ?? null
    },
  })
}

export function useMeuAluno() {
  return useQuery({
    queryKey: queryKeys.meuAluno,
    queryFn: async (): Promise<{ alunoId: string | null }> => {
      const { data, error } = await api.get<{ alunoId: string | null }>(`${ESCOLA_API}/meu-aluno`)
      if (error) throw new Error(error.message)
      return data ?? { alunoId: null }
    },
  })
}

export interface ResumoFrequenciaAlunoResult {
  alunoId: string
  alunoNome: string
  totais: ResumoFrequenciaRow
  porTurma: (ResumoFrequenciaRow & { turmaId: string; turmaNome: string })[]
}

export function useResumoFrequenciaAluno(alunoId: string | null, anoLetivoId?: string) {
  return useQuery({
    queryKey: queryKeys.resumoFrequenciaAluno(alunoId ?? '', anoLetivoId),
    queryFn: async (): Promise<ResumoFrequenciaAlunoResult | null> => {
      if (!alunoId) return null
      const params = new URLSearchParams({ alunoId })
      if (anoLetivoId) params.set('anoLetivoId', anoLetivoId)
      const { data, error } = await api.get<ResumoFrequenciaAlunoResult>(
        `${ESCOLA_API}/frequencia/resumo-aluno?${params}`
      )
      if (error) throw new Error(error.message)
      return data ?? null
    },
    enabled: !!alunoId,
  })
}

export interface DocumentoRow {
  id: string
  titulo: string
  nomeFicheiro: string
  tipoMime: string | null
  tamanho: number | null
  createdAt: string
  pessoaId: string | null
  alunoId: string | null
}

export function useDocumentos(filters: { pessoaId?: string; alunoId?: string }) {
  const { pessoaId, alunoId } = filters
  return useQuery({
    queryKey: queryKeys.documentos(pessoaId, alunoId),
    queryFn: async (): Promise<DocumentoRow[]> => {
      const params = new URLSearchParams()
      if (pessoaId) params.set('pessoaId', pessoaId)
      if (alunoId) params.set('alunoId', alunoId)
      const { data, error } = await api.get<DocumentoRow[]>(
        `${ESCOLA_API}/documentos?${params}`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export interface UsuarioListItem {
  id: string
  userId: string
  pessoaId: string
  nome: string
  email: string
  papel: string
  escolaId: string | null
  escolaNome: string | null
  bi: string | null
  fotoUrl: string | null
}

export function useUsuarios(escolaId?: string | null) {
  return useQuery({
    queryKey: queryKeys.usuarios(escolaId ?? ''),
    queryFn: async (): Promise<UsuarioListItem[]> => {
      const params = escolaId ? `?escolaId=${encodeURIComponent(escolaId)}` : ''
      const { data, error } = await api.get<UsuarioListItem[]>(`${ESCOLA_API}/usuarios${params}`)
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export function useUsuario(id: string | null) {
  return useQuery({
    queryKey: queryKeys.usuario(id ?? ''),
    queryFn: async (): Promise<(UsuarioListItem & { dataNascimento: string | null; telefone: string | null }) | null> => {
      if (!id) return null
      const { data, error } = await api.get<UsuarioListItem & { dataNascimento: string | null; telefone: string | null }>(`${ESCOLA_API}/usuarios/${id}`)
      if (error) throw new Error(error.message)
      return data ?? null
    },
    enabled: !!id,
  })
}

export interface PermissaoItem {
  id: string
  codigo: string
  descricao: string | null
}

export function usePermissoes() {
  return useQuery({
    queryKey: queryKeys.permissoes,
    queryFn: async (): Promise<PermissaoItem[]> => {
      const { data, error } = await api.get<PermissaoItem[]>(`${ESCOLA_API}/permissoes`)
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export function useUsuarioPermissoes(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.usuarioPermissoes(userId ?? ''),
    queryFn: async (): Promise<{ codigos: string[] }> => {
      if (!userId) return { codigos: [] }
      const { data, error } = await api.get<{ codigos: string[] }>(`${ESCOLA_API}/usuarios/${userId}/permissoes`)
      if (error) throw new Error(error.message)
      return data ?? { codigos: [] }
    },
    enabled: !!userId,
  })
}

export function useMeusFilhos() {
  return useQuery({
    queryKey: queryKeys.meusFilhos,
    queryFn: async (): Promise<MeusFilhosRow[]> => {
      const { data, error } = await api.get<MeusFilhosRow[]>(`${ESCOLA_API}/meus-filhos`)
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export interface TurmaAlunoRow {
  id: string
  alunoId: string
  turmaId: string
  alunoNome: string
}

export function useTurmaAlunos(turmaId: string | null) {
  return useQuery({
    queryKey: ['escola', 'turma-alunos', turmaId] as const,
    queryFn: async (): Promise<TurmaAlunoRow[]> => {
      if (!turmaId) return []
      const { data, error } = await api.get<TurmaAlunoRow[]>(
        `${ESCOLA_API}/turmas/${turmaId}/alunos`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
    enabled: !!turmaId,
  })
}

export function useNotas(turmaId: string | null, periodoId: string | null) {
  return useQuery({
    queryKey: queryKeys.notas(turmaId ?? '', periodoId ?? ''),
    queryFn: async (): Promise<NotaRow[]> => {
      if (!turmaId || !periodoId) return []
      const { data, error } = await api.get<NotaRow[]>(
        `${ESCOLA_API}/notas?turmaId=${encodeURIComponent(turmaId)}&periodoId=${encodeURIComponent(periodoId)}`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
    enabled: !!turmaId && !!periodoId,
  })
}

export function useBoletim(alunoId: string | null, anoLetivoId?: string) {
  return useQuery({
    queryKey: queryKeys.boletim(alunoId ?? '', anoLetivoId),
    queryFn: async () => {
      if (!alunoId) return null
      const params = new URLSearchParams({ alunoId })
      if (anoLetivoId) params.set('anoLetivoId', anoLetivoId)
      const { data, error } = await api.get(`${ESCOLA_API}/boletins/${alunoId}?${params}`)
      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!alunoId,
  })
}

export interface FrequenciaRow {
  id: string
  aulaId: string
  alunoId: string
  alunoNome: string
  status: 'presente' | 'falta' | 'justificada'
}

export function useFrequencia(aulaId: string | null) {
  return useQuery({
    queryKey: ['escola', 'frequencia', aulaId] as const,
    queryFn: async (): Promise<FrequenciaRow[]> => {
      if (!aulaId) return []
      const { data, error } = await api.get<FrequenciaRow[]>(
        `${ESCOLA_API}/frequencia/${aulaId}`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
    enabled: !!aulaId,
  })
}

/* ── Resumo / Relatório de frequência ── */

export interface ResumoFrequenciaRow {
  alunoId: string
  alunoNome?: string
  totalAulas: number
  presencas: number
  faltas: number
  justificadas: number
  percentagemPresenca: number
  emRisco: boolean
}

export function useFrequenciaResumo(
  turmaId: string | null,
  disciplinaId?: string | null
) {
  return useQuery({
    queryKey: queryKeys.frequenciaResumo(turmaId ?? '', disciplinaId ?? undefined),
    queryFn: async (): Promise<ResumoFrequenciaRow[]> => {
      if (!turmaId) return []
      const params = new URLSearchParams({ turmaId })
      if (disciplinaId) params.set('disciplinaId', disciplinaId)
      const { data, error } = await api.get<ResumoFrequenciaRow[]>(
        `${ESCOLA_API}/frequencia/resumo?${params}`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
    enabled: !!turmaId,
  })
}

export interface RelatorioFrequenciaTurma {
  turmaId: string
  turmaNome: string
  resumos: (ResumoFrequenciaRow & { alunoNome: string })[]
  mediaPresenca: number
  totalEmRisco: number
}

export function useRelatorioFrequenciaTurma(turmaId: string | null) {
  return useQuery({
    queryKey: queryKeys.relatorioFrequenciaTurma(turmaId ?? ''),
    queryFn: async (): Promise<RelatorioFrequenciaTurma | null> => {
      if (!turmaId) return null
      const params = new URLSearchParams({ turmaId, tipo: 'relatorio' })
      const { data, error } = await api.get<RelatorioFrequenciaTurma>(
        `${ESCOLA_API}/frequencia/resumo?${params}`
      )
      if (error) throw new Error(error.message)
      return data ?? null
    },
    enabled: !!turmaId,
  })
}

/* ── Horários ── */

export interface HorarioRow {
  id: string
  turmaId: string
  turmaNome: string
  disciplinaId: string
  disciplinaNome: string
  professorId: string | null
  professorNome: string | null
  salaId: string | null
  salaNome: string | null
  diaSemana: number
  horaInicio: string
  horaFim: string
  anoLetivoId: string
  anoLetivo: string
}

export function useHorarios(turmaId?: string, anoLetivoId?: string) {
  return useQuery({
    queryKey: queryKeys.horarios(turmaId, anoLetivoId),
    queryFn: async (): Promise<HorarioRow[]> => {
      const params = new URLSearchParams()
      if (turmaId) params.set('turmaId', turmaId)
      if (anoLetivoId) params.set('anoLetivoId', anoLetivoId)
      const qs = params.toString()
      const { data, error } = await api.get<HorarioRow[]>(
        `${ESCOLA_API}/horarios${qs ? `?${qs}` : ''}`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export interface SalaRow {
  id: string
  nome: string
  capacidade: number | null
}

export function useSalas() {
  return useQuery({
    queryKey: queryKeys.salas,
    queryFn: async (): Promise<SalaRow[]> => {
      const { data, error } = await api.get<SalaRow[]>(`${ESCOLA_API}/salas`)
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

/* ── Comunicados ── */

export interface ComunicadoRow {
  id: string
  titulo: string
  conteudo: string
  destinatarioTipo: string
  turmaId: string | null
  turmaNome: string | null
  criadoPor: string
  autorNome: string
  publicadoEm: string
}

export function useComunicados() {
  return useQuery({
    queryKey: queryKeys.comunicados,
    queryFn: async (): Promise<ComunicadoRow[]> => {
      const { data, error } = await api.get<ComunicadoRow[]>(`${ESCOLA_API}/comunicados`)
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export function useComunicado(id: string | null) {
  return useQuery({
    queryKey: queryKeys.comunicado(id ?? ''),
    queryFn: async (): Promise<ComunicadoRow | null> => {
      if (!id) return null
      const { data, error } = await api.get<ComunicadoRow>(`${ESCOLA_API}/comunicados/${id}`)
      if (error) throw new Error(error.message)
      return data ?? null
    },
    enabled: !!id,
  })
}

/* ── Dashboard Stats ── */

export interface DashboardStats {
  totalAlunos: number
  totalTurmas: number
  totalProfessores: number
  totalDisciplinas: number
  mediaGeral: number | null
  taxaPresenca: number | null
  alunosPorTurma: { turmaNome: string; total: number }[]
}

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: async (): Promise<DashboardStats> => {
      const { data, error } = await api.get<DashboardStats>(`${ESCOLA_API}/dashboard/stats`)
      if (error) throw new Error(error.message)
      return data ?? { totalAlunos: 0, totalTurmas: 0, totalProfessores: 0, totalDisciplinas: 0, mediaGeral: null, taxaPresenca: null, alunosPorTurma: [] }
    },
  })
}

/* ── Audit Log ── */

export interface AuditLogEntry {
  id: string
  acao: string
  entidade: string
  entidadeId: string | null
  dadosAntes: Record<string, unknown> | null
  dadosDepois: Record<string, unknown> | null
  criadoEm: string
  usuarioNome: string | null
}

export function useAuditLog(entidade?: string, limit = 50, enabled = true) {
  return useQuery({
    queryKey: queryKeys.auditLog(entidade),
    queryFn: async (): Promise<AuditLogEntry[]> => {
      const params = new URLSearchParams()
      if (entidade) params.set('entidade', entidade)
      params.set('limit', String(limit))
      const { data, error } = await api.get<AuditLogEntry[]>(
        `${ESCOLA_API}/audit?${params}`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
    enabled,
  })
}

/* ── Alertas ── */

export interface AlertaRow {
  id: string
  tipo: string
  severidade: 'info' | 'atencao' | 'critico'
  titulo: string
  descricao: string | null
  alunoId: string | null
  alunoNome: string | null
  turmaId: string | null
  turmaNome: string | null
  criadoEm: string
}

export function useAlertas(enabled = true) {
  return useQuery({
    queryKey: queryKeys.alertas,
    queryFn: async (): Promise<AlertaRow[]> => {
      const { data, error } = await api.get<AlertaRow[]>(`${ESCOLA_API}/alertas`)
      if (error) throw new Error(error.message)
      return data ?? []
    },
    enabled,
  })
}

export { queryKeys }
