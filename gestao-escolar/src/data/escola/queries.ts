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

export function useAuditLog(entidade?: string, limit = 50) {
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

export function useAlertas() {
  return useQuery({
    queryKey: queryKeys.alertas,
    queryFn: async (): Promise<AlertaRow[]> => {
      const { data, error } = await api.get<AlertaRow[]>(`${ESCOLA_API}/alertas`)
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export { queryKeys }
