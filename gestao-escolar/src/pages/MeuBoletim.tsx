import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useMeuAluno, useMeusFilhos, useAnosLetivos, useBoletim } from '@/data/escola/queries'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { TableSkeleton } from '@/components/PageSkeleton'

export default function MeuBoletim() {
  const { user } = useAuth()
  const { data: meuAluno } = useMeuAluno()
  const { data: filhos = [] } = useMeusFilhos()
  const { data: anosLetivos = [] } = useAnosLetivos()
  const [alunoId, setAlunoId] = useState('')
  const [anoLetivoId, setAnoLetivoId] = useState('')

  const effectiveAlunoId = user?.papel === 'aluno' ? meuAluno?.alunoId ?? '' : alunoId
  useEffect(() => {
    if (user?.papel === 'aluno' && meuAluno?.alunoId) setAlunoId(meuAluno.alunoId)
  }, [user?.papel, meuAluno?.alunoId])

  const { data: boletim, isLoading, error } = useBoletim(
    effectiveAlunoId || null,
    anoLetivoId || undefined
  )

  const isAluno = user?.papel === 'aluno'
  const isResponsavel = user?.papel === 'responsavel'
  const canView = isAluno || isResponsavel

  if (!canView) {
    return (
      <div>
        <PageHeader title="Meu boletim" subtitle="Consultar o seu boletim ou dos seus filhos." />
        <EmptyState
          title="Acesso restrito"
          description="Esta página é para alunos e responsáveis. Selecione Boletim no menu para consultar por aluno."
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Meu boletim"
        subtitle="Consultar o seu boletim ou dos seus filhos."
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
              <option value="">Todos / atual</option>
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
        <div className="flex flex-wrap gap-6 mb-6">
          <div>
            <label className="label">Ano letivo (opcional)</label>
            <select
              value={anoLetivoId}
              onChange={(e) => setAnoLetivoId(e.target.value)}
              className="input min-w-[160px]"
            >
              <option value="">Todos / atual</option>
              {anosLetivos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="card">
        {!effectiveAlunoId && isResponsavel ? (
          <EmptyState
            title="Selecione um filho"
            description="Escolha um filho na lista para ver o boletim."
          />
        ) : !effectiveAlunoId && isAluno ? (
          <EmptyState
            title="Sem dados de aluno"
            description="Não foi encontrada matrícula de aluno associada à sua conta."
          />
        ) : isLoading ? (
          <TableSkeleton rows={6} />
        ) : error ? (
          <div className="p-8 text-center text-studio-destructive">
            {(error as Error).message}
          </div>
        ) : !boletim ? (
          <EmptyState
            title="Sem dados de boletim"
            description="Não há notas lançadas para o ano letivo selecionado."
          />
        ) : (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-studio-foreground mb-4">
              {boletim.alunoNome}
            </h3>
            {!boletim.disciplinas?.length ? (
              <p className="text-studio-foreground-light text-sm">
                Nenhuma disciplina com notas no ano letivo selecionado.
              </p>
            ) : (
              <div className="space-y-4">
                {boletim.disciplinas.map((d) => (
                  <div
                    key={d.disciplinaId}
                    className="flex items-center justify-between py-2 border-b border-studio-border last:border-0"
                  >
                    <span className="text-studio-foreground">{d.nome}</span>
                    <span className="text-studio-foreground-light">
                      Média: {d.mediaFinal != null ? d.mediaFinal.toFixed(2) : '-'}
                      {d.aprovado != null && (
                        <span className={d.aprovado ? ' text-green-600' : ' text-red-600'}>
                          {d.aprovado ? ' (Aprovado)' : ' (Reprovado)'}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
