import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useConfiguracaoFinancas } from '@/data/escola/queries'
import { useUpdateConfiguracaoFinancas } from '@/data/escola/mutations'
import type { ConfiguracaoFinancasInput } from '@/data/escola/mutations'
import PageHeader from '@/components/PageHeader'
import { TableSkeleton } from '@/components/PageSkeleton'

export default function FinancasConfiguracao() {
  const { data: config, isLoading, error } = useConfiguracaoFinancas()
  const updateConfig = useUpdateConfiguracaoFinancas()

  const [multaPercentual, setMultaPercentual] = useState('')
  const [jurosMensalPercentual, setJurosMensalPercentual] = useState('')
  const [parcelasParaBloqueio, setParcelasParaBloqueio] = useState('')

  useEffect(() => {
    if (config) {
      setMultaPercentual(String(config.multaPercentual))
      setJurosMensalPercentual(String(config.jurosMensalPercentual))
      setParcelasParaBloqueio(String(config.parcelasParaBloqueio))
    }
  }, [config])

  const hasValidInputs =
    multaPercentual !== '' &&
    jurosMensalPercentual !== '' &&
    parcelasParaBloqueio !== ''
  const isDirty =
    config !== undefined &&
    hasValidInputs &&
    (String(config.multaPercentual) !== multaPercentual ||
      String(config.jurosMensalPercentual) !== jurosMensalPercentual ||
      String(config.parcelasParaBloqueio) !== parcelasParaBloqueio)

  const handleCancel = () => {
    if (config) {
      setMultaPercentual(String(config.multaPercentual))
      setJurosMensalPercentual(String(config.jurosMensalPercentual))
      setParcelasParaBloqueio(String(config.parcelasParaBloqueio))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const multa = parseFloat(multaPercentual.replace(',', '.'))
    const juros = parseFloat(jurosMensalPercentual.replace(',', '.'))
    const parcelas = parseInt(parcelasParaBloqueio, 10)
    if (Number.isNaN(multa) || multa < 0 || multa > 100) {
      toast.error('Multa deve ser entre 0 e 100')
      return
    }
    if (Number.isNaN(juros) || juros < 0 || juros > 100) {
      toast.error('Juros mensais devem ser entre 0 e 100')
      return
    }
    if (Number.isNaN(parcelas) || parcelas < 0) {
      toast.error('Parcelas para bloqueio deve ser um número ≥ 0')
      return
    }
    const body: ConfiguracaoFinancasInput = {
      multaPercentual: multa,
      jurosMensalPercentual: juros,
      parcelasParaBloqueio: parcelas,
    }
    updateConfig.mutate(body, {
      onSuccess: () => toast.success('Configuração guardada.'),
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <div>
      <PageHeader
        title="Configuração financeira"
        subtitle="Multas, juros e regras de bloqueio por parcelas em atraso."
      />

      <div className="card max-w-xl">
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : error ? (
          <div className="p-8 text-center text-red-600" role="alert">
            Erro: {(error as Error).message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-sm text-studio-foreground-light mb-2">
              Defina multas e juros (em percentual) aplicados aos valores em atraso (valores em Kz) e quantas parcelas em atraso disparam o bloqueio do aluno.
            </p>
            <div>
              <label htmlFor="cfg-multa" className="label">
                Multa por atraso (%)
              </label>
              <input
                id="cfg-multa"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={multaPercentual}
                onChange={(e) => setMultaPercentual(e.target.value)}
                className="input w-full max-w-[120px]"
                placeholder="Ex: 2"
              />
              <p className="text-xs text-studio-foreground-lighter mt-1">
                Percentual aplicado sobre o valor em atraso (0–100%).
              </p>
            </div>
            <div>
              <label htmlFor="cfg-juros" className="label">
                Juros mensais (%)
              </label>
              <input
                id="cfg-juros"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={jurosMensalPercentual}
                onChange={(e) => setJurosMensalPercentual(e.target.value)}
                className="input w-full max-w-[120px]"
                placeholder="Ex: 1"
              />
              <p className="text-xs text-studio-foreground-lighter mt-1">
                Juros mensais em percentual sobre o valor em atraso (0–100%).
              </p>
            </div>
            <div>
              <label htmlFor="cfg-bloqueio" className="label">
                Parcelas em atraso para bloqueio
              </label>
              <input
                id="cfg-bloqueio"
                type="number"
                min={0}
                value={parcelasParaBloqueio}
                onChange={(e) => setParcelasParaBloqueio(e.target.value)}
                className="input w-full max-w-[120px]"
                placeholder="Ex: 2"
              />
              <p className="text-xs text-studio-foreground-lighter mt-1">
                Número de parcelas em atraso a partir do qual o aluno pode ser bloqueado (ex.: acesso a boletim).
              </p>
            </div>
            <div className="flex gap-2 pt-2 border-t border-studio-border pt-4">
              {isDirty && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 disabled:opacity-50"
                disabled={!isDirty || updateConfig.isPending}
              >
                {updateConfig.isPending ? 'A guardar...' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
