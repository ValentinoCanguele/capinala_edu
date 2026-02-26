import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { withRetry } from '@/api/retry'
import { queryKeys } from './queries'

const ESCOLA_API = '/api/escola'

export interface AlunoInput {
  nome: string
  email: string
  dataNascimento: string
}

export interface TurmaInput {
  nome: string
  anoLetivo: string
  alunoIds?: string[]
}

export interface NotaBatchInput {
  turmaId: string
  periodoId?: string
  bimestre?: number
  notas: { alunoId: string; valor: number }[]
}

export function useCreateAluno() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: AlunoInput) => {
      const result = await withRetry(
        () => api.post(`${ESCOLA_API}/alunos`, body),
        { attempts: 3, delayMs: 500 }
      )
      const { data, error } = result
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.alunos }),
  })
}

export function useUpdateAluno() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: AlunoInput & { id: string }) => {
      const result = await withRetry(
        () => api.put(`${ESCOLA_API}/alunos/${id}`, body),
        { attempts: 3, delayMs: 500 }
      )
      const { data, error } = result
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alunos })
      queryClient.invalidateQueries({ queryKey: queryKeys.aluno(id) })
    },
  })
}

export function useDeleteAluno() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.delete(`${ESCOLA_API}/alunos/${id}`)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.alunos }),
  })
}

export function useCreateTurma() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: TurmaInput) => {
      const result = await withRetry(
        () => api.post(`${ESCOLA_API}/turmas`, body),
        { attempts: 3, delayMs: 500 }
      )
      const { data, error } = result
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.turmas }),
  })
}

export function useUpdateTurma() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: TurmaInput & { id: string }) => {
      const result = await withRetry(
        () => api.put(`${ESCOLA_API}/turmas/${id}`, body),
        { attempts: 3, delayMs: 500 }
      )
      const { data, error } = result
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.turmas })
      queryClient.invalidateQueries({ queryKey: queryKeys.turma(id) })
    },
  })
}

export function useDeleteTurma() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.delete(`${ESCOLA_API}/turmas/${id}`)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.turmas }),
  })
}

export function useEnsurePeriodos() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (anoLetivoId: string) => {
      const { data, error } = await api.post<unknown>(
        `${ESCOLA_API}/periodos/ensure`,
        { anoLetivoId }
      )
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, anoLetivoId) => {
      queryClient.invalidateQueries({ queryKey: ['escola', 'periodos', anoLetivoId] })
    },
  })
}

export function useCreateAula() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: {
      turmaId: string
      disciplinaId: string
      dataAula: string
    }) => {
      const { data, error } = await api.post<{ aulaId: string }>(
        `${ESCOLA_API}/aulas/create`,
        body
      )
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escola', 'aulas'] }),
  })
}

export function useSaveFrequencia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      aulaId,
      items,
    }: {
      aulaId: string
      items: { alunoId: string; status: 'presente' | 'falta' | 'justificada' }[]
    }) => {
      const { data, error } = await api.post(`${ESCOLA_API}/frequencia/${aulaId}`, {
        items,
      })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, { aulaId }) => {
      queryClient.invalidateQueries({ queryKey: ['escola', 'frequencia', aulaId] })
      queryClient.invalidateQueries({
        queryKey: ['escola', 'relatorio-frequencia-turma'],
        refetchType: 'active',
      })
    },
  })
}

export function useCreateJustificativa() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const { error } = await api.post(`${ESCOLA_API}/frequencia/justificativas`, data)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escola', 'justificativas'] })
      queryClient.invalidateQueries({ queryKey: ['escola', 'frequencia'] })
    },
  })
}

export function useApproveJustificativa() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, acao }: { id: string; acao: 'deferido' | 'indeferido' }) => {
      const { error } = await api.post(`${ESCOLA_API}/frequencia/justificativas?action=approve&id=${id}`, { acao })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escola', 'justificativas'] })
      queryClient.invalidateQueries({ queryKey: ['escola', 'frequencia'] })
    },
  })
}

export function useSaveNotasBatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: NotaBatchInput) => {
      const result = await withRetry(
        () => api.post<unknown>(`${ESCOLA_API}/notas/batch`, body),
        { attempts: 3, delayMs: 500 }
      )
      const { data, error } = result
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, variables) => {
      if (variables.turmaId && (variables.periodoId || variables.bimestre)) {
        queryClient.invalidateQueries({
          queryKey: ['escola', 'notas', variables.turmaId]
        })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.turmas })
      queryClient.invalidateQueries({ queryKey: ['escola', 'boletim'] })
    },
  })
}

/* ── Horários ── */

export interface HorarioInput {
  turmaId: string
  disciplinaId: string
  professorId?: string
  salaId?: string
  diaSemana: number
  horaInicio: string
  horaFim: string
  anoLetivoId: string
}

export function useCreateHorario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: HorarioInput) => {
      const { data, error } = await api.post(`${ESCOLA_API}/horarios`, body)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escola', 'horarios'] }),
  })
}

export function useUpdateHorario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: HorarioInput & { id: string }) => {
      const { data, error } = await api.put(`${ESCOLA_API}/horarios/${id}`, body)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escola', 'horarios'] }),
  })
}

export function useDeleteHorario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.delete(`${ESCOLA_API}/horarios/${id}`)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escola', 'horarios'] }),
  })
}

export function useCreateSala() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { nome: string; capacidade?: number }) => {
      const result = await withRetry(
        () => api.post(`${ESCOLA_API}/salas`, body),
        { attempts: 3, delayMs: 500 }
      )
      const { data, error } = result
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.salas }),
  })
}

/* ── Comunicados ── */

export interface ComunicadoInput {
  titulo: string
  conteudo: string
  destinatarioTipo: 'todos' | 'turma' | 'papel'
  turmaId?: string
}

export function useCreateComunicado() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: ComunicadoInput) => {
      const result = await withRetry(
        () => api.post(`${ESCOLA_API}/comunicados`, body),
        { attempts: 3, delayMs: 500 }
      )
      const { data, error } = result
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.comunicados }),
  })
}

export function useDeleteComunicado() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.delete(`${ESCOLA_API}/comunicados/${id}`)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.comunicados }),
  })
}

export function useUpdateComunicado() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: string
      titulo?: string
      conteudo?: string
      destinatarioTipo?: 'todos' | 'turma' | 'papel'
      turmaId?: string | null
    }) => {
      const result = await withRetry(
        () => api.put(`${ESCOLA_API}/comunicados/${id}`, body),
        { attempts: 3, delayMs: 500 }
      )
      const { data, error } = result
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comunicados })
      queryClient.invalidateQueries({ queryKey: queryKeys.comunicado(id) })
    },
  })
}

/* ── Disciplinas ── */

export interface DisciplinaInput {
  nome: string
}

export function useCreateDisciplina() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: DisciplinaInput) => {
      const result = await withRetry(
        () => api.post(`${ESCOLA_API}/disciplinas`, body),
        { attempts: 3, delayMs: 500 }
      )
      const { data, error } = result
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.disciplinas }),
  })
}

export function useUpdateDisciplina() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: DisciplinaInput & { id: string }) => {
      const result = await withRetry(
        () => api.put(`${ESCOLA_API}/disciplinas/${id}`, body),
        { attempts: 3, delayMs: 500 }
      )
      const { data, error } = result
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.disciplinas })
      queryClient.invalidateQueries({ queryKey: ['escola', 'disciplina', id] })
    },
  })
}

export function useDeleteDisciplina() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.delete(`${ESCOLA_API}/disciplinas/${id}`)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.disciplinas }),
  })
}

/* ── Anos Letivos ── */

export interface AnoLetivoInput {
  nome: string
  dataInicio: string
  dataFim: string
}

export function useCreateAnoLetivo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: AnoLetivoInput) => {
      const result = await withRetry(
        () => api.post(`${ESCOLA_API}/anos-letivos`, body),
        { attempts: 3, delayMs: 500 }
      )
      const { data, error } = result
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.anosLetivos }),
  })
}

export function useUpdateAnoLetivo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<AnoLetivoInput> & { id: string }) => {
      const { data, error } = await api.put(`${ESCOLA_API}/anos-letivos/${id}`, body)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.anosLetivos })
      queryClient.invalidateQueries({ queryKey: queryKeys.anoLetivo(id) })
    },
  })
}

/* ── Salas (update/delete) ── */

export function useUpdateSala() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: { id: string; nome?: string; capacidade?: number }) => {
      const { data, error } = await api.put(`${ESCOLA_API}/salas/${id}`, body)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.salas }),
  })
}

export function useDeleteSala() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.delete(`${ESCOLA_API}/salas/${id}`)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.salas }),
  })
}

/* ── Matrículas (adicionar/remover aluno da turma) ── */

export function useAddMatricula() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ turmaId, alunoId }: { turmaId: string; alunoId: string }) => {
      const { data, error } = await api.post(`${ESCOLA_API}/turmas/${turmaId}/alunos`, {
        alunoId,
      })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, { turmaId }) => {
      queryClient.invalidateQueries({ queryKey: ['escola', 'turma-alunos', turmaId] })
      queryClient.invalidateQueries({ queryKey: queryKeys.turmas })
    },
  })
}

export function useRemoveMatricula() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      turmaId,
      alunoId,
    }: {
      turmaId: string
      alunoId: string
    }) => {
      const { data, error } = await api.delete(
        `${ESCOLA_API}/turmas/${turmaId}/alunos?alunoId=${encodeURIComponent(alunoId)}`
      )
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, { turmaId }) => {
      queryClient.invalidateQueries({ queryKey: ['escola', 'turma-alunos', turmaId] })
      queryClient.invalidateQueries({ queryKey: queryKeys.turmas })
    },
  })
}

/* ── Alertas (resolver) ── */

export function useResolveAlerta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (alertaId: string) => {
      const { data, error } = await api.patch(`${ESCOLA_API}/alertas`, { alertaId })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alertas })
    },
  })
}

/* ── Perfil ── */

export interface PerfilUpdateInput {
  nome?: string
  email?: string
  dataNascimento?: string
  telefone?: string
  bi?: string
  biEmitidoEm?: string
  biValidoAte?: string
}

export function useUpdatePerfil() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: PerfilUpdateInput) => {
      const { data, error } = await api.put(`${ESCOLA_API}/perfil`, body)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.perfil }),
  })
}

export function useAlterarSenha() {
  return useMutation({
    mutationFn: async (body: { senhaAtual: string; senhaNova: string }) => {
      const { data, error } = await api.post(`${ESCOLA_API}/perfil/alterar-senha`, body)
      if (error) throw new Error(error.message)
      return data
    },
  })
}

export function useUploadFotoPerfil() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (image: string) => {
      const { data, error } = await api.post<{ ok: boolean }>(`${ESCOLA_API}/perfil/foto`, { image })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.perfil }),
  })
}

export function useRemoveFotoPerfil() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await api.delete(`${ESCOLA_API}/perfil/foto`)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.perfil }),
  })
}

/* ── Documentos ── */

export function useUploadDocumento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (opts: {
      titulo: string
      pessoaId?: string
      alunoId?: string
      image: string
      fileName?: string
      mimeType?: string
    }) => {
      const { data, error } = await api.post(`${ESCOLA_API}/documentos`, opts)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documentos(vars.pessoaId, vars.alunoId) })
    },
  })
}

export function useDeleteDocumento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.delete(`${ESCOLA_API}/documentos/${id}`)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escola', 'documentos'] }),
  })
}

/* ── Utilizadores (admin) ── */

export interface UsuarioCreateInput {
  nome: string
  email: string
  papel: string
  escolaId?: string | null
  password: string
  bi?: string
  telefone?: string
}

export function useCreateUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UsuarioCreateInput) => {
      const result = await withRetry(
        () => api.post(`${ESCOLA_API}/usuarios`, body),
        { attempts: 3, delayMs: 500 }
      )
      const { data, error } = result
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escola', 'usuarios'] }),
  })
}

export interface UsuarioUpdateInput {
  nome?: string
  email?: string
  papel?: string
  escolaId?: string | null
  bi?: string
  telefone?: string
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: UsuarioUpdateInput & { id: string }) => {
      const { data, error } = await api.put(`${ESCOLA_API}/usuarios/${id}`, body)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['escola', 'usuarios'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.usuario(id) })
    },
  })
}

export function useResetPassword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, novaSenha }: { userId: string; novaSenha: string }) => {
      const { data, error } = await api.post(`${ESCOLA_API}/usuarios/${userId}/reset-password`, {
        novaSenha,
      })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.usuario(userId) })
    },
  })
}

export function useSetUsuarioPermissoes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, codigos }: { userId: string; codigos: string[] }) => {
      const { data, error } = await api.put(`${ESCOLA_API}/usuarios/${userId}/permissoes`, {
        codigos,
      })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.usuarioPermissoes(userId) })
    },
  })
}

/* ── Módulos ── */

export function useInstallModulo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (chave: string) => {
      const { data, error } = await api.post(`${ESCOLA_API}/modulos/instalar`, { chave })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.modulos })
      queryClient.invalidateQueries({ queryKey: queryKeys.modulosCatalogo })
    },
  })
}

export interface ModuloUpdateInput {
  nome?: string
  descricao?: string | null
  ativo?: boolean
  ordem?: number
  config?: Record<string, unknown>
  permissoes?: string[]
  imagem?: string | null
  icone?: string | null
}

export function useUpdateModulo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: ModuloUpdateInput & { id: string }) => {
      const { data, error } = await api.patch(`${ESCOLA_API}/modulos/${id}`, body)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.modulos })
      queryClient.invalidateQueries({ queryKey: queryKeys.modulosCatalogo })
      queryClient.invalidateQueries({ queryKey: queryKeys.modulo(id) })
    },
  })
}

/* ── Atas ── */

export interface AtaInput {
  turmaId: string
  periodoId?: string
  titulo: string
  conteudo: string
  dataReuniao?: string
  participantes?: string[]
  decisoes?: string[]
  assinaturaDigital?: string
}

export function useCreateAta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: AtaInput) => {
      const { data, error } = await api.post(`${ESCOLA_API}/atas`, body)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escola', 'atas'] }),
  })
}

export function useUpdateAta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<AtaInput> & { id: string }) => {
      const { data, error } = await api.patch(`${ESCOLA_API}/atas/${id}`, body)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['escola', 'atas'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.ata(id) })
    },
  })
}

export function useDeleteAta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.delete(`${ESCOLA_API}/atas/${id}`)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escola', 'atas'] }),
  })
}

/* ── Configurações e Exames ── */

export function useUpdatePedagogicalConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: any) => {
      const { data, error } = await api.patch(`${ESCOLA_API}/configuracoes/pedagogica`, body)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pedagogicalConfig(vars.anoLetivoId) })
      queryClient.invalidateQueries({ queryKey: ['escola', 'boletim'] })
    },
  })
}

export function useSaveExame() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: any) => {
      const { data, error } = await api.post(`${ESCOLA_API}/exames`, body)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escola', 'exames'] })
      queryClient.invalidateQueries({ queryKey: ['escola', 'boletim'] })
    },
  })
}

export function useDeleteExame() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.delete(`${ESCOLA_API}/exames?id=${id}`)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escola', 'exames'] })
      queryClient.invalidateQueries({ queryKey: ['escola', 'boletim'] })
    },
  })
}

/* ── T3.0: Biometria e QR Code ── */

export function useProcessarAcessoQR() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ identifier, sentido }: { identifier: string; sentido?: 'entrada' | 'saida' }) => {
      const { data, error } = await api.post(`${ESCOLA_API}/frequencia/scanner`, { identifier, sentido })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['escola', 'access-logs'] })
      if (data?.aulaMarcada) {
        queryClient.invalidateQueries({ queryKey: ['escola', 'frequencia'] })
        queryClient.invalidateQueries({ queryKey: ['escola', 'relatorio-frequencia-turma'] })
      }
    },
  })
}

/* ── Ocorrências Disciplinares ── */

export function useCreateOcorrencia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: any) => {
      const { data, error } = await api.post(`${ESCOLA_API}/ocorrencias`, body)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escola', 'ocorrencias'] }),
  })
}

export function useResolveOcorrencia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, resolvido }: { id: string, resolvido: boolean }) => {
      const { data, error } = await api.patch(`${ESCOLA_API}/ocorrencias`, { id, resolvido })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escola', 'ocorrencias'] }),
  })
}

export function useDeleteOcorrencia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.delete(`${ESCOLA_API}/ocorrencias?id=${id}`)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escola', 'ocorrencias'] }),
  })
}

/* ── Matrizes e Espaços ── */

export function useCreateMatriz() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const { error } = await api.post(`${ESCOLA_API}/matrizes`, data)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escola', 'matrizes'] }),
  })
}

export function useAddDisciplinaMatriz() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const { error } = await api.post(`${ESCOLA_API}/matrizes?action=addDisciplina`, data)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escola', 'matriz'] }),
  })
}

export function useClonarMatriz() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { matrizOrigemId: string; novoNome: string; novoAnoLetivoId?: string }) => {
      const { data: res, error } = await api.post(`${ESCOLA_API}/matrizes?action=clonar`, data)
      if (error) throw new Error(error.message)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escola', 'matrizes'] })
    },
  })
}

export function useAddPrecedencia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const { error } = await api.post(`${ESCOLA_API}/matrizes?action=addPrecedencia`, data)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escola', 'matriz'] }),
  })
}

export function useRemovePrecedencia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.delete(`${ESCOLA_API}/matrizes?action=removePrecedencia&id=${id}`)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escola', 'matriz'] }),
  })
}

export function useSaveSala() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const { error } = await api.post(`${ESCOLA_API}/salas`, data)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escola', 'salas'] }),
  })
}

export function useAddItemInventario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const { error } = await api.post(`${ESCOLA_API}/salas?action=addItemInventario`, data)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escola', 'inventario'] }),
  })
}

export function useRemoveItemInventario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.delete(`${ESCOLA_API}/salas?action=removeItemInventario&id=${id}`)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escola', 'inventario'] }),
  })
}
