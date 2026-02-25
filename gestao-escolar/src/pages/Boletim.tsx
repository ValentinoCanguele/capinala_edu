import { useState } from 'react'
import { useAlunos, useAnosLetivos, useBoletim } from '@/data/escola/queries'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'

export default function Boletim() {
  const [alunoId, setAlunoId] = useState('')
  const [anoLetivoId, setAnoLetivoId] = useState('')
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
          <label htmlFor="bol-aluno" className="label">Aluno</label>
          <select
            id="bol-aluno"
            value={alunoId}
            onChange={(e) => setAlunoId(e.target.value)}
            className="input min-w-[200px]"
            aria-label="Selecionar aluno para boletim"
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
          <label htmlFor="bol-ano" className="label">Ano letivo (opcional)</label>
          <select
            id="bol-ano"
            value={anoLetivoId}
            onChange={(e) => setAnoLetivoId(e.target.value)}
            className="input min-w-[160px]"
            aria-label="Selecionar ano letivo"
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
          <div className="p-8 text-center text-studio-foreground-lighter" role="status" aria-live="polite">A carregar...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600" role="alert">
            {(error as Error).message}
          </div>
        ) : !boletim ? (
          <EmptyState
            title="Sem dados de boletim"
            description="Não existem notas ou médias para o aluno e ano letivo selecionados."
          />
        ) : (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-studio-foreground mb-4">
              {boletim.alunoNome}
            </h3>
            <div className="space-y-4">
              {boletim.disciplinas?.map((d) => (
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
          </div>
        )}
      </div>
    </div>
  )
}
