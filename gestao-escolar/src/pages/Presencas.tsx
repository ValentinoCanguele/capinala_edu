import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  useMeuAluno,
  useMeusFilhos,
  useAnosLetivos,
  useResumoFrequenciaAluno,
} from '@/data/escola/queries'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { TableSkeleton } from '@/components/PageSkeleton'

export default function Presencas() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { data: meuAluno } = useMeuAluno()
  const { data: filhos = [] } = useMeusFilhos()
  const { data: anosLetivos = [] } = useAnosLetivos()
  const [alunoId, setAlunoId] = useState(searchParams.get('alunoId') ?? '')
  const [anoLetivoId, setAnoLetivoId] = useState('')

  const effectiveAlunoId = user?.papel === 'aluno' ? meuAluno?.alunoId ?? '' : alunoId
  useEffect(() => {
    if (user?.papel === 'aluno' && meuAluno?.alunoId) setAlunoId(meuAluno.alunoId)
  }, [user?.papel, meuAluno?.alunoId])
  useEffect(() => {
    const fromUrl = searchParams.get('alunoId')
    if (fromUrl && user?.papel === 'responsavel') setAlunoId(fromUrl)
  }, [searchParams, user?.papel])

  const { data: resumo, isLoading, error } = useResumoFrequenciaAluno(
    effectiveAlunoId || null,
    anoLetivoId || undefined
  )

  const isAluno = user?.papel === 'aluno'
  const isResponsavel = user?.papel === 'responsavel'
  const canView = isAluno || isResponsavel

  if (!canView) {
    return (
      <div>
        <PageHeader title="Presenças" subtitle="Registo de presenças e faltas." />
        <EmptyState
          title="Acesso restrito"
          description="Esta página é para alunos e responsáveis. Use Frequência no menu para registar chamada."
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Presenças"
        subtitle="Registo de presenças e faltas. Resumo por turma."
        actions={
          <Link
            to="/frequencia"
            className="text-sm text-studio-brand hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 rounded px-2 py-1"
          >
            Registo de chamada →
          </Link>
        }
      />

      {isResponsavel && (
        <div className="flex flex-wrap gap-6 mb-6">
          <div>
            <label className="label">Filho</label>
            <select
              value={alunoId}
              onChange={(e) => setAlunoId(e.target.value)}
              className="input min-w-[200px]"
            >
              <option value="">Selecionar filho</option>
              {filhos.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Ano letivo (opcional)</label>
            <select
              value={anoLetivoId}
              onChange={(e) => setAnoLetivoId(e.target.value)}
              className="input min-w-[160px]"
            >
              <option value="">Todos</option>
              {anosLetivos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      {isAluno && (
        <div className="mb-6">
          <label className="label">Ano letivo (opcional)</label>
          <select
            value={anoLetivoId}
            onChange={(e) => setAnoLetivoId(e.target.value)}
            className="input min-w-[160px]"
          >
            <option value="">Todos</option>
            {anosLetivos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="card">
        {!effectiveAlunoId && isResponsavel ? (
          <EmptyState title="Selecione um filho" description="Escolha um filho para ver o resumo de presenças." />
        ) : !effectiveAlunoId && isAluno ? (
          <EmptyState title="Sem dados de aluno" description="Não foi encontrada matrícula associada à sua conta." />
        ) : isLoading ? (
          <TableSkeleton rows={5} />
        ) : error ? (
          <div className="p-8 text-center text-studio-destructive">{(error as Error).message}</div>
        ) : !resumo ? (
          <EmptyState title="Sem dados" description="Nenhum registo de frequência encontrado." />
        ) : (
          <div className="p-6 space-y-6">
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs text-studio-foreground-lighter">Total de aulas</p>
                <p className="text-xl font-semibold text-studio-foreground">{resumo.totais.totalAulas}</p>
              </div>
              <div>
                <p className="text-xs text-studio-foreground-lighter">Presenças</p>
                <p className="text-xl font-semibold text-green-600">{resumo.totais.presencas}</p>
              </div>
              <div>
                <p className="text-xs text-studio-foreground-lighter">Faltas</p>
                <p className="text-xl font-semibold text-studio-destructive">{resumo.totais.faltas}</p>
              </div>
              <div>
                <p className="text-xs text-studio-foreground-lighter">Justificadas</p>
                <p className="text-xl font-semibold text-studio-foreground">{resumo.totais.justificadas}</p>
              </div>
              <div>
                <p className="text-xs text-studio-foreground-lighter">% Presença</p>
                <p className={`text-xl font-semibold ${resumo.totais.emRisco ? 'text-studio-destructive' : 'text-studio-foreground'}`}>
                  {resumo.totais.percentagemPresenca}%
                </p>
              </div>
            </div>
            {resumo.porTurma.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-studio-foreground mb-3">Por turma</h3>
                <table className="min-w-full divide-y divide-studio-border">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">Turma</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-studio-foreground-lighter uppercase">Aulas</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-studio-foreground-lighter uppercase">Presenças</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-studio-foreground-lighter uppercase">Faltas</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-studio-foreground-lighter uppercase">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-studio-border">
                    {resumo.porTurma.map((t) => (
                      <tr key={t.turmaId}>
                        <td className="px-4 py-2 text-studio-foreground">{t.turmaNome}</td>
                        <td className="px-4 py-2 text-right text-studio-foreground-light">{t.totalAulas}</td>
                        <td className="px-4 py-2 text-right text-studio-foreground-light">{t.presencas}</td>
                        <td className="px-4 py-2 text-right text-studio-foreground-light">{t.faltas}</td>
                        <td className="px-4 py-2 text-right">{t.percentagemPresenca}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
