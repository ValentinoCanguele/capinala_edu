import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAlunos, useAnosLetivos, useBoletim } from '@/data/escola/queries'
import PageHeader from '@/components/PageHeader'

export default function Boletim() {
  const [searchParams] = useSearchParams()
  const alunoIdFromUrl = searchParams.get('alunoId') ?? ''
  const [alunoId, setAlunoId] = useState('')
  const [anoLetivoId, setAnoLetivoId] = useState('')

  useEffect(() => {
    if (alunoIdFromUrl) setAlunoId(alunoIdFromUrl)
  }, [alunoIdFromUrl])

  const { data: alunos = [] } = useAlunos()
  const { data: anosLetivos = [] } = useAnosLetivos()
  const { data: boletim, isLoading, error } = useBoletim(
    alunoId || null,
    anoLetivoId || undefined
  )

  return (
    <div>
      <PageHeader
        title="Boletim"
        subtitle="Consultar notas e médias por aluno e ano letivo."
      />

      <div className="flex flex-wrap gap-6 mb-6">
        <div>
          <label className="label">Aluno</label>
          <select
            value={alunoId}
            onChange={(e) => setAlunoId(e.target.value)}
            className="input min-w-[200px]"
          >
            <option value="">Selecionar aluno</option>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
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

      <div className="card">
        {!alunoId ? (
          <div className="p-8 text-center text-studio-foreground-lighter">
            Selecione um aluno.
          </div>
        ) : isLoading ? (
          <div className="p-8 text-center text-studio-foreground-lighter">A carregar...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            {(error as Error).message}
          </div>
        ) : !boletim ? (
          <div className="p-8 text-center text-studio-foreground-lighter">
            Sem dados de boletim.
          </div>
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
                    Média: {d.media != null ? d.media.toFixed(2) : '-'}
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
