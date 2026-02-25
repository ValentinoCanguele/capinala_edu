import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuditLog, useAlertas, useMeuPapel } from '@/data/escola/queries'
import { useResolveAlerta } from '@/data/escola/mutations'
import PageHeader from '@/components/PageHeader'
import { TableSkeleton } from '@/components/PageSkeleton'
import EmptyState from '@/components/EmptyState'

const ENTIDADES = [
  { value: '', label: 'Todas' },
  { value: 'aluno', label: 'Alunos' },
  { value: 'turma', label: 'Turmas' },
  { value: 'disciplina', label: 'Disciplinas' },
  { value: 'nota', label: 'Notas' },
  { value: 'frequencia', label: 'Frequência' },
  { value: 'comunicado', label: 'Comunicados' },
]

const ACAO_LABELS: Record<string, string> = {
  criar: 'Criar',
  atualizar: 'Atualizar',
  eliminar: 'Eliminar',
  lancar_nota: 'Lançar nota',
  registar_frequencia: 'Registar frequência',
  publicar_comunicado: 'Publicar comunicado',
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

const ROLES_AUDITORIA: ('admin' | 'direcao')[] = ['admin', 'direcao']

export default function Auditoria() {
  const [entidade, setEntidade] = useState('')
  const { data: meuPapel, isLoading: papelLoading } = useMeuPapel()
  const canViewAuditoria =
    meuPapel?.papel && ROLES_AUDITORIA.includes(meuPapel.papel as 'admin' | 'direcao')

  const { data: log = [], isLoading: logLoading, error: logError } = useAuditLog(
    entidade || undefined,
    80,
    !!canViewAuditoria
  )
  const { data: alertas = [], isLoading: alertasLoading } = useAlertas(!!canViewAuditoria)
  const resolveAlerta = useResolveAlerta()

  if (!papelLoading && !canViewAuditoria) {
    return (
      <div>
        <PageHeader title="Auditoria" subtitle="Log de ações e alertas." />
        <div className="card p-8 text-center">
          <p className="text-studio-foreground-light mb-4">
            Não tem permissão para aceder a esta página. A auditoria está disponível apenas para administradores e direção.
          </p>
          <Link to="/" className="text-studio-brand hover:underline">
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  const handleResolve = (id: string) => {
    resolveAlerta.mutate(id, {
      onSuccess: () => toast.success('Alerta marcado como resolvido.'),
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <div>
      <PageHeader
        title="Auditoria"
        subtitle="Log de ações e alertas ativos da escola."
      />

      {/* Alertas ativos */}
      {alertas.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-studio-foreground mb-3">
            Alertas ativos
          </h3>
          <div className="card overflow-hidden">
            <ul className="divide-y divide-studio-border">
              {alertasLoading ? (
                <li className="px-4 py-3 text-studio-foreground-lighter text-sm" role="status" aria-live="polite">
                  A carregar...
                </li>
              ) : (
                alertas.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-studio-muted/30"
                  >
                    <div className="min-w-0 flex-1">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium mr-2 ${
                          a.severidade === 'critico'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : a.severidade === 'atencao'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}
                      >
                        {a.severidade === 'critico' ? 'Crítico' : a.severidade === 'atencao' ? 'Atenção' : 'Info'}
                      </span>
                      <span className="text-sm font-medium text-studio-foreground">
                        {a.titulo}
                      </span>
                      {a.descricao && (
                        <p className="text-xs text-studio-foreground-light mt-0.5">
                          {a.descricao}
                        </p>
                      )}
                      <p className="text-xs text-studio-foreground-lighter mt-0.5">
                        {formatDate(a.criadoEm)}
                        {a.alunoNome && ` · ${a.alunoNome}`}
                        {a.turmaNome && ` · ${a.turmaNome}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleResolve(a.id)}
                      disabled={resolveAlerta.isPending}
                      className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-md bg-studio-brand text-white hover:bg-studio-brand-hover disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-1"
                    >
                      Resolver
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Filtro e tabela do log */}
      <div className="mb-4">
        <label htmlFor="audit-entidade" className="label">
          Filtrar por entidade
        </label>
        <select
          id="audit-entidade"
          value={entidade}
          onChange={(e) => setEntidade(e.target.value)}
          className="input w-full max-w-[200px]"
        >
          {ENTIDADES.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        {logLoading ? (
          <TableSkeleton rows={10} />
        ) : logError ? (
          <div className="p-8 text-center text-red-600 dark:text-red-400" role="alert">
            {(logError as Error).message}
          </div>
        ) : log.length === 0 ? (
          <EmptyState
            title="Nenhuma entrada no log"
            description="O log de auditoria mostra as ações realizadas na escola. Ainda não há registos para os filtros selecionados."
          />
        ) : (
          <div className="overflow-x-auto">
            <table
              className="min-w-full divide-y divide-studio-border"
              aria-label="Log de auditoria"
            >
              <caption className="sr-only">
                Entradas do log com data, ação, entidade e utilizador
              </caption>
              <thead className="bg-studio-muted">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                    Data
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                    Ação
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                    Entidade
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                    Utilizador
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border">
                {log.map((entry) => (
                  <tr key={entry.id} className="hover:bg-studio-muted/50">
                    <td className="px-4 py-2 text-sm text-studio-foreground-light whitespace-nowrap">
                      {formatDate(entry.criadoEm)}
                    </td>
                    <td className="px-4 py-2 text-sm text-studio-foreground">
                      {ACAO_LABELS[entry.acao] ?? entry.acao}
                    </td>
                    <td className="px-4 py-2 text-sm text-studio-foreground-light">
                      {entry.entidade}
                      {entry.entidadeId && (
                        <span className="text-studio-foreground-lighter ml-1">
                          ({entry.entidadeId.slice(0, 8)}…)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-studio-foreground-light">
                      {entry.usuarioNome ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
