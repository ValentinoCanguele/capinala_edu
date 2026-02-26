import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { canGerirFinancas } from '@/lib/permissoes'
import { useFinancasConfiguracao } from '@/data/escola/financasQueries'
import { useUpdateFinancasConfiguracao } from '@/data/escola/financasMutations'
import PageHeader from '@/components/PageHeader'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { Settings, Percent, AlertCircle, Save, ShieldAlert } from 'lucide-react'

export default function FinancasConfiguracao() {
  const { user } = useAuth()
  const { data: config, isLoading, error } = useFinancasConfiguracao()
  const updateConfig = useUpdateFinancasConfiguracao()

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const multa = Number(multaPercentual.replace(/,/, '.'))
    const juros = Number(jurosMensalPercentual.replace(/,/, '.'))
    const bloqueio = Number(parcelasParaBloqueio)
    if (
      Number.isNaN(multa) ||
      multa < 0 ||
      multa > 100 ||
      Number.isNaN(juros) ||
      juros < 0 ||
      juros > 100 ||
      Number.isNaN(bloqueio) ||
      bloqueio < 0
    ) {
      toast.error('Valores inválidos. Percentagens entre 0 e 100.')
      return
    }
    updateConfig.mutate(
      {
        multaPercentual: multa,
        jurosMensalPercentual: juros,
        parcelasParaBloqueio: bloqueio,
      },
      {
        onSuccess: () => toast.success('Configuração guardada.'),
        onError: (err) => toast.error(err.message),
      }
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Configuração Estrutural" subtitle="Carregando parâmetros financeiros..." />
        <SkeletonTable rows={4} columns={2} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Parâmetros Financeiros"
        subtitle="Definição de regras institucionais para multas, moras e políticas de conformidade."
        actions={
          <div className="flex items-center gap-2 text-studio-foreground-lighter text-xs bg-studio-muted/20 px-3 py-1.5 rounded-full border border-studio-border/50">
            <Settings className="w-3.5 h-3.5" />
            <span>Configuração Centralizada</span>
          </div>
        }
      />

      {error && (
        <Card className="border-red-500/20 bg-red-500/5">
          <div className="flex gap-2 text-red-600 items-center">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error.message}</p>
          </div>
        </Card>
      )}

      <div className="max-w-2xl">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-studio-brand font-bold uppercase tracking-widest text-[10px]">
                  <Percent className="w-3 h-3" />
                  <span>Penalidades e Moras</span>
                </div>

                <Input
                  label="Multa Fixa por Atraso (%)"
                  type="text"
                  inputMode="decimal"
                  value={multaPercentual}
                  onChange={(e) => setMultaPercentual(e.target.value)}
                  placeholder="0.00"
                  hint="Percentagem aplicada no primeiro dia de atraso."
                  leftIcon={<Percent className="w-4 h-4" />}
                />

                <Input
                  label="Juros de Mora Mensais (%)"
                  type="text"
                  inputMode="decimal"
                  value={jurosMensalPercentual}
                  onChange={(e) => setJurosMensalPercentual(e.target.value)}
                  placeholder="0.00"
                  hint="Acúmulo percentual por cada mês de incumprimento."
                  leftIcon={<Percent className="w-4 h-4" />}
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest text-[10px]">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Políticas de Bloqueio</span>
                </div>

                <Input
                  label="Limite de Parcelas Vencidas"
                  type="number"
                  min={0}
                  value={parcelasParaBloqueio}
                  onChange={(e) => setParcelasParaBloqueio(e.target.value)}
                  placeholder="0"
                  hint="Quantidade de débitos para restrição automática de serviços."
                  leftIcon={<AlertCircle className="w-4 h-4" />}
                />

                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 text-xs text-orange-600 leading-relaxed italic">
                  Atenção: Estas alterações afetam o cálculo de saldos em tempo real para todos os estudantes.
                </div>
              </div>
            </div>

            {canGerirFinancas(user?.papel) && (
            <div className="flex gap-3 justify-end pt-6 border-t border-studio-border/50">
              <Button
                type="submit"
                loading={updateConfig.isPending}
                variant="primary"
                icon={<Save className="w-4 h-4" />}
              >
                {updateConfig.isPending ? 'Guardando...' : 'Aplicar Configurações'}
              </Button>
            </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  )
}
