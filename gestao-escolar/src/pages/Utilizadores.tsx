import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import {
  useUsuarios,
  useUsuario,
  usePermissoes,
  useUsuarioPermissoes,
} from '@/data/escola/queries'
import {
  useCreateUsuario,
  useUpdateUsuario,
  useResetPassword,
  useSetUsuarioPermissoes,
} from '@/data/escola/mutations'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import Modal from '@/components/Modal'
import { TableSkeleton } from '@/components/PageSkeleton'
import { User } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export default function Utilizadores() {
  const { user: authUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [formOpen, setFormOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [permissoesUserId, setPermissoesUserId] = useState<string | null>(null)
  const [resetUserId, setResetUserId] = useState<string | null>(null)
  const [novaSenha, setNovaSenha] = useState('')
  const [form, setForm] = useState({
    nome: '',
    email: '',
    papel: 'professor' as string,
    escolaId: '',
    password: '',
    bi: '',
    telefone: '',
  })
  const [permissoesCodigos, setPermissoesCodigos] = useState<string[]>([])

  const escolaId = authUser?.escolaId ?? undefined
  const { data: usuarios = [], isLoading } = useUsuarios(escolaId)
  const { data: usuarioEdit } = useUsuario(editingUserId)
  const { data: permissoesList = [] } = usePermissoes()
  const { data: usuarioPerms } = useUsuarioPermissoes(permissoesUserId)
  const createUser = useCreateUsuario()
  const updateUser = useUpdateUsuario()
  const resetPw = useResetPassword()
  const setPerms = useSetUsuarioPermissoes()

  useEffect(() => {
    if (searchParams.get('acao') === 'novo') {
      setEditingUserId(null)
      setForm({ nome: '', email: '', papel: 'professor', escolaId: escolaId ?? '', password: '', bi: '', telefone: '' })
      setFormOpen(true)
    }
  }, [searchParams, escolaId])

  useEffect(() => {
    if (usuarioEdit) {
      setForm({
        nome: usuarioEdit.nome,
        email: usuarioEdit.email,
        papel: usuarioEdit.papel,
        escolaId: usuarioEdit.escolaId ?? '',
        password: '',
        bi: usuarioEdit.bi ?? '',
        telefone: usuarioEdit.telefone ?? '',
      })
    }
  }, [usuarioEdit])

  useEffect(() => {
    if (usuarioPerms) setPermissoesCodigos(usuarioPerms.codigos)
  }, [usuarioPerms])

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditingUserId(null)
    if (searchParams.get('acao') === 'novo') setSearchParams({})
  }

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingUserId) {
      updateUser.mutate(
        {
          id: editingUserId,
          nome: form.nome,
          email: form.email,
          papel: form.papel,
          escolaId: form.escolaId || null,
          bi: form.bi || undefined,
          telefone: form.telefone || undefined,
        },
        {
          onSuccess: () => {
            toast.success('Utilizador atualizado.')
            handleCloseForm()
          },
          onError: (err) => toast.error(err.message),
        }
      )
    } else {
      if (!form.password || form.password.length < 6) {
        toast.error('Senha deve ter pelo menos 6 caracteres')
        return
      }
      createUser.mutate(
        {
          nome: form.nome,
          email: form.email,
          papel: form.papel,
          escolaId: form.escolaId || undefined,
          password: form.password,
          bi: form.bi || undefined,
          telefone: form.telefone || undefined,
        },
        {
          onSuccess: () => {
            toast.success('Utilizador criado.')
            handleCloseForm()
          },
          onError: (err) => toast.error(err.message),
        }
      )
    }
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetUserId || novaSenha.length < 6) {
      toast.error('Nova senha deve ter pelo menos 6 caracteres')
      return
    }
    resetPw.mutate(
      { userId: resetUserId, novaSenha },
      {
        onSuccess: () => {
          toast.success('Senha alterada.')
          setResetUserId(null)
          setNovaSenha('')
        },
        onError: (err) => toast.error(err.message),
      }
    )
  }

  const handleSavePermissoes = (e: React.FormEvent) => {
    e.preventDefault()
    if (!permissoesUserId) return
    setPerms.mutate(
      { userId: permissoesUserId, codigos: permissoesCodigos },
      {
        onSuccess: () => {
          toast.success('Permissões guardadas.')
          setPermissoesUserId(null)
        },
        onError: (err) => toast.error(err.message),
      }
    )
  }

  const togglePermissao = (codigo: string) => {
    setPermissoesCodigos((prev) =>
      prev.includes(codigo) ? prev.filter((c) => c !== codigo) : [...prev, codigo]
    )
  }

  if (authUser?.papel !== 'admin' && authUser?.papel !== 'direcao') {
    return (
      <div>
        <PageHeader title="Utilizadores" subtitle="Gestão de utilizadores (admin)." />
        <EmptyState title="Acesso restrito" description="Apenas administradores podem gerir utilizadores." />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Utilizadores"
        subtitle="Gestão de utilizadores e permissões."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditingUserId(null)
              setForm({ nome: '', email: '', papel: 'professor', escolaId: escolaId ?? '', password: '', bi: '', telefone: '' })
              setFormOpen(true)
            }}
            className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
          >
            Novo utilizador
          </button>
        }
      />

      <div className="card overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : usuarios.length === 0 ? (
          <EmptyState
            title="Nenhum utilizador"
            description="Crie o primeiro utilizador."
            action={
              <button
                type="button"
                onClick={() => setFormOpen(true)}
                className="btn-primary"
              >
                Novo utilizador
              </button>
            }
          />
        ) : (
          <table className="min-w-full divide-y divide-studio-border">
            <thead className="bg-studio-muted/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">ID / Foto</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">Nome</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">Papel</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">Escola</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">BI</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-studio-foreground-lighter uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-studio-border">
              {usuarios.map((u) => (
                <tr key={u.userId} className="hover:bg-studio-muted/30">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {u.fotoUrl ? (
                        <img
                          src={`${API_BASE}${u.fotoUrl}`}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-studio-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-studio-foreground-lighter" />
                        </div>
                      )}
                      <span className="text-xs font-mono text-studio-foreground-lighter truncate max-w-[80px]" title={u.userId}>
                        {u.userId.slice(0, 8)}…
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-studio-foreground">{u.nome}</td>
                  <td className="px-4 py-2 text-studio-foreground-light">{u.email}</td>
                  <td className="px-4 py-2 text-studio-foreground-light">{u.papel}</td>
                  <td className="px-4 py-2 text-studio-foreground-light">{u.escolaNome ?? '—'}</td>
                  <td className="px-4 py-2 text-studio-foreground-light">{u.bi ?? '—'}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      className="link-action link-action-primary mr-2"
                      onClick={() => {
                        setEditingUserId(u.userId)
                        setFormOpen(true)
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="link-action link-action-primary mr-2"
                      onClick={() => {
                        setResetUserId(u.userId)
                        setNovaSenha('')
                      }}
                    >
                      Resetar senha
                    </button>
                    <button
                      type="button"
                      className="link-action link-action-primary"
                      onClick={() => setPermissoesUserId(u.userId)}
                    >
                      Permissões
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={formOpen} onClose={handleCloseForm} title={editingUserId ? 'Editar utilizador' : 'Novo utilizador'}>
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="label">Nome *</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="label">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="label">Papel *</label>
            <select
              value={form.papel}
              onChange={(e) => setForm((f) => ({ ...f, papel: e.target.value }))}
              className="input w-full"
            >
              <option value="admin">Admin</option>
              <option value="direcao">Direção</option>
              <option value="professor">Professor</option>
              <option value="responsavel">Responsável</option>
              <option value="aluno">Aluno</option>
            </select>
          </div>
          <div>
            <label className="label">BI</label>
            <input
              type="text"
              value={form.bi}
              onChange={(e) => setForm((f) => ({ ...f, bi: e.target.value }))}
              className="input w-full"
            />
          </div>
          <div>
            <label className="label">Telefone</label>
            <input
              type="text"
              value={form.telefone}
              onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
              className="input w-full"
            />
          </div>
          {!editingUserId && (
            <div>
              <label className="label">Senha *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="input w-full"
                minLength={6}
                required={!editingUserId}
              />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={handleCloseForm} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={createUser.isPending || updateUser.isPending}>
              {editingUserId ? (updateUser.isPending ? 'A guardar...' : 'Guardar') : createUser.isPending ? 'A criar...' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!resetUserId} onClose={() => setResetUserId(null)} title="Resetar senha">
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="label">Nova senha *</label>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="input w-full"
              minLength={6}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setResetUserId(null)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={resetPw.isPending || novaSenha.length < 6}>
              {resetPw.isPending ? 'A guardar...' : 'Alterar senha'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!permissoesUserId} onClose={() => setPermissoesUserId(null)} title="Permissões">
        <form onSubmit={handleSavePermissoes} className="space-y-4">
          <p className="text-sm text-studio-foreground-light">
            Atribua permissões extras ao utilizador (o papel já define o acesso base).
          </p>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {permissoesList.map((p) => (
              <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissoesCodigos.includes(p.codigo)}
                  onChange={() => togglePermissao(p.codigo)}
                  className="rounded border-studio-border"
                />
                <span className="text-sm text-studio-foreground">{p.codigo}</span>
                {p.descricao && (
                  <span className="text-xs text-studio-foreground-lighter">— {p.descricao}</span>
                )}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setPermissoesUserId(null)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={setPerms.isPending}>
              {setPerms.isPending ? 'A guardar...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
