import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useDebounce } from '@/hooks/useDebounce'
import { useQueryState } from '@/hooks/useQueryState'
import { useAuth } from '@/contexts/AuthContext'
import { canGerirUtilizadores } from '@/lib/permissoes'
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
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { User, Search, Shield, Key, Fingerprint, UserPlus, Mail, Phone, Building2, Edit2, ShieldCheck, ShieldAlert } from 'lucide-react'

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
  const [isFormDirty, setIsFormDirty] = useState(false)
  const [permissoesCodigos, setPermissoesCodigos] = useState<string[]>([])
  const [filterFromUrl, setFilterFromUrl] = useQueryState('q')
  const [filterInput, setFilterInput] = useState(() => searchParams.get('q') ?? '')
  const debouncedFilter = useDebounce(filterInput, 400)

  useEffect(() => {
    setFilterInput(filterFromUrl)
  }, [filterFromUrl])

  useEffect(() => {
    setFilterFromUrl(debouncedFilter)
  }, [debouncedFilter, setFilterFromUrl])

  const escolaId = authUser?.escolaId ?? undefined
  const { data: usuarios = [], isLoading } = useUsuarios(escolaId)

  const filteredUsuarios = useMemo(
    () =>
      debouncedFilter
        ? usuarios.filter(
          (u) =>
            (u.nome ?? '').toLowerCase().includes(debouncedFilter.toLowerCase()) ||
            (u.email ?? '').toLowerCase().includes(debouncedFilter.toLowerCase()) ||
            (u.papel ?? '').toLowerCase().includes(debouncedFilter.toLowerCase())
        )
        : usuarios,
    [usuarios, debouncedFilter]
  )
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
    if (isFormDirty && !window.confirm('Existem alterações não guardadas. Deseja sair?')) return
    setFormOpen(false)
    setEditingUserId(null)
    setIsFormDirty(false)
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

  const handleFormChange = (newValues: Partial<typeof form>) => {
    setForm(prev => ({ ...prev, ...newValues }))
    setIsFormDirty(true)
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
        title="Gestão de Identidades"
        subtitle="Administração central de utilizadores, privilégios de acesso e segurança da plataforma."
        actions={
          canGerirUtilizadores(authUser?.papel) ? (
            <Button
              onClick={() => {
                setEditingUserId(null)
                setForm({ nome: '', email: '', papel: 'professor', escolaId: escolaId ?? '', password: '', bi: '', telefone: '' })
                setFormOpen(true)
              }}
              icon={<UserPlus className="w-4 h-4" />}
            >
              Novo Utilizador
            </Button>
          ) : undefined
        }
      />

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-studio-muted/10 p-4 rounded-2xl border border-studio-border/40">
        <div className="flex items-center gap-3 w-full max-w-md">
          <Search className="w-5 h-5 text-studio-foreground-lighter" />
          <input
            type="text"
            placeholder="Pesquisar por nome, email ou cargo..."
            value={filterInput}
            onChange={(e) => setFilterInput(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium text-studio-foreground w-full placeholder:text-studio-foreground-lighter"
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-studio-foreground-lighter" />
            <span className="text-xs font-black uppercase text-studio-foreground-lighter tracking-widest">{usuarios.length} Contas Registadas</span>
          </div>
        </div>
      </div>

      <Card noPadding className="overflow-hidden border-studio-border/60 shadow-xl">
        {isLoading ? (
          <SkeletonTable rows={10} columns={6} />
        ) : filteredUsuarios.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title={filterInput ? 'Nenhum utilizador encontrado' : 'Lista Vazia'}
              description={filterInput ? 'Refine a sua busca ou limpe os filtros para encontrar a conta desejada.' : 'Inicie a gestão de acessos criando o primeiro utilizador da instituição.'}
              onAction={!filterInput && canGerirUtilizadores(authUser?.papel) ? () => setFormOpen(true) : undefined}
              actionLabel="Criar Primeiro Utilizador"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-studio-border/20 text-left" aria-label="Lista de utilizadores">
              <thead className="bg-studio-muted/10">
                <tr>
                  <th scope="col" className="px-6 py-4 text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Utilizador / ID</th>
                  <th scope="col" className="px-6 py-4 text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Cargo / Role</th>
                  <th scope="col" className="px-6 py-4 text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Contacto / Escola</th>
                  <th scope="col" className="px-6 py-4 text-[10px] font-black text-studio-foreground-light uppercase tracking-widest text-center">BI / NIF</th>
                  <th scope="col" className="px-6 py-4 text-right text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Gestão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border/10">
                {filteredUsuarios.map((u) => (
                  <tr key={u.userId} className="group hover:bg-studio-brand/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {u.fotoUrl ? (
                          <img
                            src={`${API_BASE}${u.fotoUrl}`}
                            alt=""
                            className="h-10 w-10 rounded-2xl object-cover ring-2 ring-studio-border group-hover:ring-studio-brand transition-all"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-2xl bg-studio-brand/10 border border-studio-brand/20 flex items-center justify-center group-hover:bg-studio-brand/20 transition-all">
                            <User className="h-5 w-5 text-studio-brand" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-black text-studio-foreground uppercase tracking-tight group-hover:text-studio-brand transition-colors">{u.nome}</p>
                          <span className="text-[10px] font-mono text-studio-foreground-lighter uppercase tracking-widest leading-none">
                            {u.userId.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={u.papel === 'admin' ? 'brand' : u.papel === 'direcao' ? 'success' : 'neutral'}
                        className="text-[9px] font-black uppercase px-2 py-0.5 border-studio-border/40"
                      >
                        {u.papel}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-studio-foreground-light lowercase">
                          <Mail className="w-3 h-3 opacity-40 lowercase" />
                          {u.email}
                        </div>
                        {u.escolaNome && (
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-studio-foreground-lighter uppercase tracking-tighter">
                            <Building2 className="w-3 h-3 opacity-40" />
                            {u.escolaNome}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[11px] font-black text-studio-foreground-lighter tabular-nums">{u.bi ?? '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                          onClick={() => {
                            setEditingUserId(u.userId)
                            setFormOpen(true)
                          }}
                          className="text-[10px] font-black uppercase text-studio-brand"
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          icon={<Key className="w-3.5 h-3.5" />}
                          onClick={() => {
                            setResetUserId(u.userId)
                            setNovaSenha('')
                          }}
                          title="Resetar senha"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          icon={<Fingerprint className="w-3.5 h-3.5" />}
                          onClick={() => setPermissoesUserId(u.userId)}
                          title="Permissões"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={formOpen} onClose={handleCloseForm} title={editingUserId ? 'Editar Credenciais de Acesso' : 'Registo de Nova Identidade'}>
        <form onSubmit={handleSubmitForm} className="space-y-6">
          <Input
            label="Nome Completo do Utilizador"
            value={form.nome}
            onChange={(e) => handleFormChange({ nome: e.target.value })}
            placeholder="Ex: João Silva"
            required
            leftIcon={<User className="w-4 h-4" />}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Endereço de E-mail"
              type="email"
              value={form.email}
              onChange={(e) => handleFormChange({ email: e.target.value })}
              placeholder="exemplo@escola.com"
              autoComplete="email"
              required
              leftIcon={<Mail className="w-4 h-4 text-studio-brand" />}
            />
            <Select
              label="Papel / Cargo"
              value={form.papel}
              onChange={(e) => handleFormChange({ papel: e.target.value })}
              options={[
                { value: 'admin', label: 'Administrador Senior' },
                { value: 'direcao', label: 'Direção Académica' },
                { value: 'professor', label: 'Corpo Docente' },
                { value: 'responsavel', label: 'Responsável (EE)' },
                { value: 'aluno', label: 'Estudante' },
              ]}
              leftIcon={<Shield className="w-4 h-4" />}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="B.I. / NIF"
              value={form.bi}
              onChange={(e) => handleFormChange({ bi: e.target.value })}
              placeholder="Nº Identification"
              leftIcon={<Fingerprint className="w-4 h-4" />}
            />
            <Input
              label="Telefone de Contacto"
              value={form.telefone}
              onChange={(e) => handleFormChange({ telefone: e.target.value })}
              placeholder="+244..."
              leftIcon={<Phone className="w-4 h-4" />}
            />
          </div>
          {!editingUserId && (
            <Input
              label="Senha de Acesso Primária"
              type="password"
              value={form.password}
              onChange={(e) => handleFormChange({ password: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              required
              leftIcon={<Key className="w-4 h-4 text-amber-500" />}
            />
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-studio-border/50">
            <Button variant="ghost" type="button" onClick={handleCloseForm}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={createUser.isPending || updateUser.isPending}>
              {editingUserId ? 'Guardar Alterações' : 'Criar Conta de Acesso'}
            </Button>
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

      <Modal open={!!permissoesUserId} onClose={() => setPermissoesUserId(null)} title="Privilégios de Acesso Especializados" size="md">
        <form onSubmit={handleSavePermissoes} className="space-y-6">
          <div className="p-4 bg-studio-brand/5 border border-studio-brand/20 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-studio-brand mt-1" />
            <div>
              <p className="text-[10px] font-black text-studio-brand uppercase tracking-widest">Escala de Permissões</p>
              <p className="text-[11px] text-studio-foreground-light font-medium leading-relaxed mt-1">
                Atribua privilégios granulares para funcionalidades específicas. Estas permissões sobrepõem-se às restrições base do cargo.
              </p>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {permissoesList.map((p) => (
              <label key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-studio-muted/50 cursor-pointer transition-colors border border-transparent hover:border-studio-border/50 group">
                <input
                  type="checkbox"
                  checked={permissoesCodigos.includes(p.codigo)}
                  onChange={() => togglePermissao(p.codigo)}
                  className="w-4 h-4 rounded border-studio-border text-studio-brand focus:ring-studio-brand"
                />
                <div>
                  <span className="text-xs font-black text-studio-foreground uppercase tracking-tight group-hover:text-studio-brand transition-colors">{p.codigo}</span>
                  {p.descricao && (
                    <p className="text-[10px] text-studio-foreground-lighter font-bold uppercase tracking-tighter mt-0.5">{p.descricao}</p>
                  )}
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-studio-border/50">
            <Button variant="ghost" type="button" onClick={() => setPermissoesUserId(null)}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={setPerms.isPending}>Selar Permissões</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
