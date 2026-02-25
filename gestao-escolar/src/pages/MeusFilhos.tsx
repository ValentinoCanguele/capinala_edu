import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useMeusFilhos } from '@/data/escola/queries'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { TableSkeleton } from '@/components/PageSkeleton'
import { Users, FileText, CalendarCheck } from 'lucide-react'

export default function MeusFilhos() {
  const { user } = useAuth()
  const { data: filhos = [], isLoading, error } = useMeusFilhos()

  if (user?.papel !== 'responsavel') {
    return (
      <div>
        <PageHeader title="Meus filhos" subtitle="Lista dos seus educandos." />
        <EmptyState
          title="Acesso restrito"
          description="Esta página é apenas para o perfil de responsável."
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Meus filhos" subtitle="Lista dos seus educandos. Aceda ao boletim e presenças de cada um." />

      <div className="card">
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : error ? (
          <div className="p-8 text-center text-studio-destructive">{(error as Error).message}</div>
        ) : filhos.length === 0 ? (
          <EmptyState
            title="Nenhum filho associado"
            description="Os seus educandos aparecerão aqui quando estiverem vinculados à sua conta."
          />
        ) : (
          <ul className="divide-y divide-studio-border">
            {filhos.map((f) => (
              <li
                key={f.id}
                className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 hover:bg-studio-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-studio-muted">
                    <Users className="h-5 w-5 text-studio-foreground-lighter" />
                  </div>
                  <div>
                    <p className="font-medium text-studio-foreground">{f.nome}</p>
                    <p className="text-sm text-studio-foreground-light">{f.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/boletim?alunoId=${f.id}`}
                    className="inline-flex items-center gap-1.5 text-sm text-studio-brand hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 rounded px-2 py-1"
                  >
                    <FileText className="h-4 w-4" />
                    Ver boletim
                  </Link>
                  <Link
                    to={`/presencas?alunoId=${f.id}`}
                    className="inline-flex items-center gap-1.5 text-sm text-studio-brand hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 rounded px-2 py-1"
                  >
                    <CalendarCheck className="h-4 w-4" />
                    Presenças
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
