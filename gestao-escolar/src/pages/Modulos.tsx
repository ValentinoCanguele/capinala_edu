import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { canManageModulos } from '@/lib/permissoes'
import { useModulosComDisponiveis } from '@/data/escola/queries'
import { useInstallModulo } from '@/data/escola/mutations'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { TableSkeleton } from '@/components/PageSkeleton'

export default function Modulos() {
  const { user } = useAuth()
  const { data, isLoading, error } = useModulosComDisponiveis()
  const installModulo = useInstallModulo()

  const handleInstall = (chave: string) => {
    installModulo.mutate(chave, {
      onSuccess: () => toast.success('Módulo instalado.'),
      onError: (err) => toast.error(err.message),
    })
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Módulos" subtitle="Instalar e configurar módulos do sistema." />
        <TableSkeleton rows={6} cols={3} />
      </div>
    )
  }

  if (!canManageModulos(user?.papel)) {
    return (
      <div>
        <PageHeader title="Módulos" subtitle="Gestão de módulos do sistema." />
        <EmptyState
          title="Acesso reservado"
          description="A instalação e configuração de módulos está reservada a utilizadores com perfil de administrador."
          actionLabel="Voltar ao início"
          onAction={() => window.location.assign('/')}
        />
      </div>
    )
  }

  const instalados = data?.instalados ?? []
  const disponiveis = data?.disponiveis ?? []

  return (
    <div>
      <PageHeader
        title="Módulos"
        subtitle="Módulos instalados e disponíveis para instalação."
      />
      {error && (
        <p className="text-studio-foreground-light mb-4">{error.message}</p>
      )}

      <section className="mb-8">
        <h3 className="text-lg font-medium text-studio-foreground mb-3">
          Instalados
        </h3>
        {instalados.length === 0 ? (
          <p className="text-studio-foreground-light text-sm">
            Nenhum módulo instalado.
          </p>
        ) : (
          <div className="rounded-xl border border-studio-border bg-studio-bg/50 backdrop-blur-sm shadow-soft overflow-hidden">
            <table className="w-full text-sm" aria-label="Módulos instalados">
              <thead>
                <tr className="bg-studio-muted/50 border-b border-studio-border">
                  <th scope="col" className="text-left px-4 py-3 font-medium">Nome</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium">Chave</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {instalados.map((m) => (
                  <tr key={m.id} className="border-b border-studio-border last:border-0">
                    <td className="px-4 py-3 text-studio-foreground">{m.nome}</td>
                    <td className="px-4 py-3 text-studio-foreground-light">{m.chave}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          m.ativo
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-studio-foreground-lighter'
                        }
                      >
                        {m.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-medium text-studio-foreground mb-3">
          Disponíveis para instalação
        </h3>
        {disponiveis.length === 0 ? (
          <EmptyState
            title="Nenhum módulo disponível"
            description="Todos os módulos do catálogo estão já instalados."
          />
        ) : (
          <div className="rounded-xl border border-studio-border bg-studio-bg/50 backdrop-blur-sm shadow-soft overflow-hidden">
            <table className="w-full text-sm" aria-label="Módulos disponíveis para instalação">
              <thead>
                <tr className="bg-studio-muted/50 border-b border-studio-border">
                  <th scope="col" className="text-left px-4 py-3 font-medium">Nome</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium">Descrição</th>
                  {canManageModulos(user?.papel) && (
                  <th scope="col" className="w-28" aria-label="Ações" />
                  )}
                </tr>
              </thead>
              <tbody>
                {disponiveis.map((m) => (
                  <tr key={m.chave} className="border-b border-studio-border last:border-0">
                    <td className="px-4 py-3 text-studio-foreground">{m.nome}</td>
                    <td className="px-4 py-3 text-studio-foreground-light">
                      {m.descricao}
                    </td>
                    {canManageModulos(user?.papel) && (
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleInstall(m.chave)}
                        disabled={installModulo.isPending}
                        className="btn-primary text-sm disabled:opacity-50"
                      >
                        {installModulo.isPending ? 'A instalar...' : 'Instalar'}
                      </button>
                    </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
