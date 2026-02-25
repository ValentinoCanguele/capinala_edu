import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
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
      const { data, error } = await api.post(`${ESCOLA_API}/alunos`, body)
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
      const { data, error } = await api.put(`${ESCOLA_API}/alunos/${id}`, body)
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
      const { data, error } = await api.post(`${ESCOLA_API}/turmas`, body)
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
      const { data, error } = await api.put(`${ESCOLA_API}/turmas/${id}`, body)
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

export function useSaveNotasBatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: NotaBatchInput) => {
      const { data, error } = await api.post(`${ESCOLA_API}/notas/batch`, body)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, variables) => {
      if (variables.turmaId && variables.periodoId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.notas(variables.turmaId, variables.periodoId),
        })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.turmas })
      queryClient.invalidateQueries({ queryKey: ['escola', 'boletim'], refetchType: 'active' })
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
      const { data, error } = await api.post(`${ESCOLA_API}/salas`, body)
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
      const { data, error } = await api.post(`${ESCOLA_API}/comunicados`, body)
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
      const { data, error } = await api.put(`${ESCOLA_API}/comunicados/${id}`, body)
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
      const { data, error } = await api.post(`${ESCOLA_API}/disciplinas`, body)
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
      const { data, error } = await api.put(`${ESCOLA_API}/disciplinas/${id}`, body)
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
      const { data, error } = await api.post(`${ESCOLA_API}/anos-letivos`, body)
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
      const { data, error } = await api.post(`${ESCOLA_API}/usuarios`, body)
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
