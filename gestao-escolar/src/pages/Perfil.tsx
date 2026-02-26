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
import PageSkeleton from '@/components/PageSkeleton'
import { Card, CardHeader, CardFooter } from '@/components/shared/Card'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { Avatar } from '@/components/shared/Avatar'
import { PasswordInput } from '@/components/shared/PasswordInput'

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
        <Card noPadding>
          <div className="p-6">
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex flex-col items-center gap-3">
                <Avatar
                  name={perfil.nome || 'Utilizador'}
                  url={perfil.fotoUrl ? `${API_BASE}${perfil.fotoUrl}` : null}
                  size="xl"
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    loading={uploadFoto.isPending}
                  >
                    Alterar foto
                  </Button>
                  {perfil.fotoUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                      onClick={() =>
                        removeFoto.mutate(undefined, {
                          onSuccess: () => toast.success('Foto removida.'),
                          onError: (err) => toast.error(err.message),
                        })
                      }
                      loading={removeFoto.isPending}
                    >
                      Remover
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-studio-foreground-lighter mb-1 uppercase tracking-wider font-semibold">Conta ID</p>
                <p className="text-sm font-mono text-studio-foreground-light break-all px-3 py-2 bg-studio-muted rounded border border-studio-border inline-block">{perfil.id}</p>
              </div>
            </div>
          </div>
        </Card>

        <form onSubmit={handleSaveDados}>
          <Card noPadding>
            <CardHeader title="Dados pessoais" description="Controle os detalhes cívicos e de contato associados à sua sessão." />
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <Input
                  label="Nome Completo"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                />
                <Input
                  label="Endereço de Email"
                  type="email"
                  value={form.email}
                  disabled
                  hint="O email não pode ser alterado por motivos de segurança."
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
                <Input
                  label="Data de Nascimento"
                  type="date"
                  value={form.dataNascimento}
                  onChange={(e) => setForm((f) => ({ ...f, dataNascimento: e.target.value }))}
                />
                <Input
                  label="Nº de Telefone"
                  type="tel"
                  value={form.telefone}
                  onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                />
                <Input
                  label="Bilhete de Identidade (BI)"
                  value={form.bi}
                  onChange={(e) => setForm((f) => ({ ...f, bi: e.target.value }))}
                  placeholder="Ex: 000000000LA000"
                />
                <div className="hidden md:block" />
                <Input
                  label="BI Emitido em"
                  type="date"
                  value={form.biEmitidoEm}
                  onChange={(e) => setForm((f) => ({ ...f, biEmitidoEm: e.target.value }))}
                />
                <Input
                  label="BI Válido até"
                  type="date"
                  value={form.biValidoAte}
                  onChange={(e) => setForm((f) => ({ ...f, biValidoAte: e.target.value }))}
                />
              </div>
            </div>
            <CardFooter>
              <Button type="submit" loading={updatePerfil.isPending}>
                Guardar Alterações
              </Button>
            </CardFooter>
          </Card>
        </form>

        <form onSubmit={handleAlterarSenha}>
          <Card noPadding>
            <CardHeader title="Alterar Senha de Acesso" description="Gira palavras-passe fortes para proteger os seus dados educacionais." />
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <PasswordInput
                  label="Senha Atual"
                  value={senha.senhaAtual}
                  onChange={(e) => setSenha((s) => ({ ...s, senhaAtual: e.target.value }))}
                  autoComplete="current-password"
                  showStrength={false}
                />
                <div className="hidden md:block" />

                <PasswordInput
                  label="Nova Senha"
                  value={senha.senhaNova}
                  onChange={(e) => setSenha((s) => ({ ...s, senhaNova: e.target.value }))}
                  autoComplete="new-password"
                />

                <PasswordInput
                  label="Confirmar Nova Senha"
                  value={senha.confirmar}
                  onChange={(e) => setSenha((s) => ({ ...s, confirmar: e.target.value }))}
                  autoComplete="new-password"
                  error={senha.senhaNova && senha.confirmar && senha.senhaNova !== senha.confirmar ? 'As senhas não coincidem' : undefined}
                />
              </div>
            </div>
            <CardFooter>
              <Button type="submit" variant="primary" loading={alterarSenha.isPending}>
                Forçar Alteração de Senha
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}
