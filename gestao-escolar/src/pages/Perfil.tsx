import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import { usePerfil } from '@/data/escola/queries'
import {
  useUpdatePerfil,
  useAlterarSenha,
  useUploadFotoPerfil,
  useRemoveFotoPerfil,
} from '@/data/escola/mutations'
import PageHeader from '@/components/PageHeader'
import { PageSkeleton } from '@/components/PageSkeleton'
import { User } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export default function Perfil() {
  const { data: perfil, isLoading } = usePerfil()
  const updatePerfil = useUpdatePerfil()
  const alterarSenha = useAlterarSenha()
  const uploadFoto = useUploadFotoPerfil()
  const removeFoto = useRemoveFotoPerfil()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    nome: '',
    email: '',
    dataNascimento: '',
    telefone: '',
    bi: '',
    biEmitidoEm: '',
    biValidoAte: '',
  })
  const [senha, setSenha] = useState({ senhaAtual: '', senhaNova: '', confirmar: '' })

  useEffect(() => {
    if (perfil?.nome) {
      setForm({
        nome: perfil.nome,
        email: perfil.email,
        dataNascimento: perfil.dataNascimento ?? '',
        telefone: perfil.telefone ?? '',
        bi: perfil.bi ?? '',
        biEmitidoEm: perfil.biEmitidoEm ?? '',
        biValidoAte: perfil.biValidoAte ?? '',
      })
    }
  }, [perfil?.id])

  const handleSaveDados = (e: React.FormEvent) => {
    e.preventDefault()
    updatePerfil.mutate(form, {
      onSuccess: () => toast.success('Dados guardados.'),
      onError: (err) => toast.error(err.message),
    })
  }

  const handleAlterarSenha = (e: React.FormEvent) => {
    e.preventDefault()
    if (senha.senhaNova !== senha.confirmar) {
      toast.error('A nova senha e a confirmação não coincidem.')
      return
    }
    alterarSenha.mutate(
      { senhaAtual: senha.senhaAtual, senhaNova: senha.senhaNova },
      {
        onSuccess: () => {
          toast.success('Senha alterada.')
          setSenha({ senhaAtual: '', senhaNova: '', confirmar: '' })
        },
        onError: (err) => toast.error(err.message),
      }
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      uploadFoto.mutate(dataUrl, {
        onSuccess: () => toast.success('Foto atualizada.'),
        onError: (err) => toast.error(err.message),
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  if (isLoading || !perfil) {
    return (
      <div>
        <PageHeader title="Perfil" subtitle="Os seus dados e preferências." />
        <PageSkeleton />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Perfil" subtitle="Os seus dados e preferências." />

      <div className="grid gap-6">
        <div className="card p-6">
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col items-center gap-2">
              {perfil.fotoUrl ? (
                <img
                  src={`${API_BASE}${perfil.fotoUrl}`}
                  alt="Foto de perfil"
                  className="h-24 w-24 rounded-full object-cover border border-studio-border"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-studio-muted flex items-center justify-center">
                  <User className="h-12 w-12 text-studio-foreground-lighter" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-secondary text-sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadFoto.isPending}
                >
                  Alterar foto
                </button>
                {perfil.fotoUrl && (
                  <button
                    type="button"
                    className="btn-secondary text-sm text-studio-destructive"
                    onClick={() =>
                      removeFoto.mutate(undefined, {
                        onSuccess: () => toast.success('Foto removida.'),
                        onError: (err) => toast.error(err.message),
                      })
                    }
                    disabled={removeFoto.isPending}
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-studio-foreground-lighter mb-1">ID</p>
              <p className="text-sm font-mono text-studio-foreground break-all">{perfil.id}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveDados} className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-studio-foreground">Dados pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nome</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                className="input w-full"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="input w-full"
              />
            </div>
            <div>
              <label className="label">Data de nascimento</label>
              <input
                type="date"
                value={form.dataNascimento}
                onChange={(e) => setForm((f) => ({ ...f, dataNascimento: e.target.value }))}
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
            <div>
              <label className="label">Bilhete de identidade</label>
              <input
                type="text"
                value={form.bi}
                onChange={(e) => setForm((f) => ({ ...f, bi: e.target.value }))}
                className="input w-full"
                placeholder="Número do BI"
              />
            </div>
            <div>
              <label className="label">BI emitido em</label>
              <input
                type="date"
                value={form.biEmitidoEm}
                onChange={(e) => setForm((f) => ({ ...f, biEmitidoEm: e.target.value }))}
                className="input w-full"
              />
            </div>
            <div>
              <label className="label">BI válido até</label>
              <input
                type="date"
                value={form.biValidoAte}
                onChange={(e) => setForm((f) => ({ ...f, biValidoAte: e.target.value }))}
                className="input w-full"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={updatePerfil.isPending}>
              {updatePerfil.isPending ? 'A guardar...' : 'Guardar'}
            </button>
          </div>
        </form>

        <form onSubmit={handleAlterarSenha} className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-studio-foreground">Alterar senha</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Senha atual</label>
              <input
                type="password"
                value={senha.senhaAtual}
                onChange={(e) => setSenha((s) => ({ ...s, senhaAtual: e.target.value }))}
                className="input w-full"
                autoComplete="current-password"
              />
            </div>
            <div />
            <div>
              <label className="label">Nova senha</label>
              <input
                type="password"
                value={senha.senhaNova}
                onChange={(e) => setSenha((s) => ({ ...s, senhaNova: e.target.value }))}
                className="input w-full"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="label">Confirmar nova senha</label>
              <input
                type="password"
                value={senha.confirmar}
                onChange={(e) => setSenha((s) => ({ ...s, confirmar: e.target.value }))}
                className="input w-full"
                autoComplete="new-password"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={alterarSenha.isPending}>
              {alterarSenha.isPending ? 'A alterar...' : 'Alterar senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
