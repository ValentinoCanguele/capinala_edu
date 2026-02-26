import { useState, useEffect } from 'react'
import {
    Save,
    RefreshCw,
    Settings2,
    Percent,
    GraduationCap,
    ShieldCheck,
    AlertTriangle,
    Calculator,
    Zap,
    Hash,
    Binary,
    Clock,
    UserX
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAnosLetivos, usePedagogicalConfig } from '@/data/escola/queries'
import { useUpdatePedagogicalConfig } from '@/data/escola/mutations'
import PageHeader from '@/components/PageHeader'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { Select } from '@/components/shared/Select'
import { Badge } from '@/components/shared/Badge'

export default function ConfiguracoesAcademico() {
    const { data: anosLetivos = [] } = useAnosLetivos()
    const [selectedAnoId, setSelectedAnoId] = useState('')

    useEffect(() => {
        if (anosLetivos.length > 0 && !selectedAnoId) {
            setSelectedAnoId(anosLetivos[0].id)
        }
    }, [anosLetivos, selectedAnoId])

    const { data: config } = usePedagogicalConfig(selectedAnoId || null)
    const updateConfig = useUpdatePedagogicalConfig()

    const [form, setForm] = useState({
        pesoT1: 1,
        pesoT2: 1,
        pesoT3: 1,
        minimaAprovacaoDireta: 10,
        minimaAcessoExame: 7,
        pesoMfaNoExame: 0.4,
        pesoExameFinal: 0.6,
        tipoArredondamento: 'aritmetico',
        casasDecimais: 1,
        formulaNotaTrimestral: '(MAC * 0.4) + (NPP * 0.6)',
        formulaMfa: '(T1 * pesoT1 + T2 * pesoT2 + T3 * pesoT3) / (pesoT1 + pesoT2 + pesoT3)',
        toleranciaAtrasoMinutos: 15,
        limiteFaltasPercentagem: 25
    })

    useEffect(() => {
        if (config) {
            setForm({
                pesoT1: Number(config.pesoT1),
                pesoT2: Number(config.pesoT2),
                pesoT3: Number(config.pesoT3),
                minimaAprovacaoDireta: Number(config.minimaAprovacaoDireta),
                minimaAcessoExame: Number(config.minimaAcessoExame),
                pesoMfaNoExame: Number(config.pesoMfaNoExame),
                pesoExameFinal: Number(config.pesoExameFinal),
                tipoArredondamento: config.tipoArredondamento || 'aritmetico',
                casasDecimais: config.casasDecimais || 1,
                formulaNotaTrimestral: config.formulaNotaTrimestral || '(MAC * 0.4) + (NPP * 0.6)',
                formulaMfa: config.formulaMfa || '(T1 * pesoT1 + T2 * pesoT2 + T3 * pesoT3) / (pesoT1 + pesoT2 + pesoT3)',
                toleranciaAtrasoMinutos: config.toleranciaAtrasoMinutos || 15,
                limiteFaltasPercentagem: config.limiteFaltasPercentagem || 25
            })
        }
    }, [config])

    const handleSave = () => {
        if (!selectedAnoId) return
        updateConfig.mutate({ anoLetivoId: selectedAnoId, ...form }, {
            onSuccess: () => toast.success('Arquitetura pedagógica consolidada.'),
            onError: (err: any) => toast.error(err.message)
        })
    }

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <PageHeader
                title="Centro de Rigor Pedagógico"
                subtitle="Configuração técnica do motor de cálculo, pesos institucionais e regras normativas."
                actions={
                    <Button
                        variant="primary"
                        icon={<Save className="w-4 h-4" />}
                        onClick={handleSave}
                        loading={updateConfig.isPending}
                        disabled={!selectedAnoId}
                    >
                        Validar & Salvar Configurações
                    </Button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lado Esquerdo: Contexto & Regras */}
                <div className="space-y-6">
                    <Card className="p-5 space-y-4 border-studio-border/60 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className="w-5 h-5 text-studio-brand" />
                            <h3 className="text-xs font-black text-studio-foreground uppercase tracking-widest">Âmbito de Aplicação</h3>
                        </div>
                        <Select
                            label="Ciclo / Ano Letivo"
                            value={selectedAnoId}
                            onChange={(e) => setSelectedAnoId(e.target.value)}
                            options={anosLetivos.map(al => ({ value: al.id, label: al.nome }))}
                        />
                        <div className="p-4 rounded-2xl bg-studio-brand/5 border border-studio-brand/10 space-y-2">
                            <p className="text-[10px] text-studio-brand font-black uppercase tracking-tighter">Impacto Sistémico</p>
                            <p className="text-[11px] text-studio-foreground-light leading-relaxed font-medium">
                                Estas definições regem o cálculo de pautas, boletins e a validade jurídica das aprovações.
                            </p>
                        </div>
                    </Card>

                    <Card className="p-5 border-l-4 border-l-amber-500 bg-amber-500/5 shadow-md space-y-4">
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <Clock className="w-5 h-5" />
                            <h3 className="text-xs font-black uppercase tracking-widest">Controle de Assiduidade</h3>
                        </div>
                        <div className="space-y-4">
                            <Input
                                label="Tolerância de Atraso (minutos)"
                                type="number"
                                value={form.toleranciaAtrasoMinutos}
                                onChange={(e) => setForm({ ...form, toleranciaAtrasoMinutos: Number(e.target.value) })}
                                leftIcon={<Zap className="w-4 h-4 text-amber-500" />}
                            />
                            <Input
                                label="Limite de Faltas (%)"
                                type="number"
                                value={form.limiteFaltasPercentagem}
                                onChange={(e) => setForm({ ...form, limiteFaltasPercentagem: Number(e.target.value) })}
                                leftIcon={<UserX className="w-4 h-4 text-red-500" />}
                                subtitle="Percentual de ausências que gera reprovação automática."
                            />
                        </div>
                    </Card>
                </div>

                {/* Lado Direito: Motor de Cálculo */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Pesos e Arredondamento */}
                    <Card className="overflow-hidden border-studio-border/60 shadow-xl">
                        <div className="p-4 border-b border-studio-border bg-studio-muted/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Percent className="w-4 h-4 text-studio-brand" />
                                <h3 className="text-sm font-black text-studio-foreground uppercase tracking-wider">Configuração de Pesos & Precisão</h3>
                            </div>
                            <Badge variant="brand" className="text-[9px] font-black uppercase tracking-widest px-2">Motor v2.1</Badge>
                        </div>

                        <div className="p-6 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Input label="Peso 1º Trim" type="number" step="0.1" value={form.pesoT1} onChange={(e) => setForm({ ...form, pesoT1: Number(e.target.value) })} />
                                <Input label="Peso 2º Trim" type="number" step="0.1" value={form.pesoT2} onChange={(e) => setForm({ ...form, pesoT2: Number(e.target.value) })} />
                                <Input label="Peso 3º Trim" type="number" step="0.1" value={form.pesoT3} onChange={(e) => setForm({ ...form, pesoT3: Number(e.target.value) })} />
                            </div>

                            <div className="pt-6 border-t border-studio-border/30 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select
                                    label="Regime de Arredondamento"
                                    value={form.tipoArredondamento}
                                    onChange={(e) => setForm({ ...form, tipoArredondamento: e.target.value })}
                                    options={[
                                        { value: 'aritmetico', label: 'Aritmético Padrão (Round)' },
                                        { value: 'truncado', label: 'Truncado (Corte Seco)' },
                                        { value: 'normativo_angola', label: 'Normativo Angola (9.5 -> 10)' }
                                    ]}
                                    leftIcon={<RefreshCw className="w-4 h-4 text-studio-brand" />}
                                />
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-studio-foreground-lighter uppercase tracking-widest px-1 flex items-center gap-2">
                                        <Binary className="w-3 h-3" /> Diferencial Decimal
                                    </label>
                                    <div className="flex gap-2 p-1 bg-studio-muted/10 rounded-xl border border-studio-border/50">
                                        {[0, 1, 2].map(n => (
                                            <button
                                                key={n}
                                                onClick={() => setForm({ ...form, casasDecimais: n })}
                                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${form.casasDecimais === n ? 'bg-studio-brand text-white shadow-md' : 'hover:bg-studio-muted/20 text-studio-foreground-lighter'}`}
                                            >
                                                {n === 0 ? 'INTEIROS' : `${n} CASA${n > 1 ? 'S' : ''}`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Fórmulas Dinâmicas */}
                    <Card className="overflow-hidden border-studio-border/60 shadow-xl">
                        <div className="p-4 border-b border-studio-border bg-studio-muted/10 flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-studio-brand" />
                            <h3 className="text-sm font-black text-studio-foreground uppercase tracking-wider">Infraestrutura de Fórmulas</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest px-1">Cálculo de Nota Periódica</label>
                                    <Badge variant="neutral" className="text-[8px] font-black opacity-50 uppercase tracking-tighter">MAC, NPP, NE</Badge>
                                </div>
                                <Input
                                    value={form.formulaNotaTrimestral}
                                    onChange={(e) => setForm({ ...form, formulaNotaTrimestral: e.target.value })}
                                    className="font-mono text-studio-brand font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest px-1">Cálculo de Média Final Anual (MFA)</label>
                                    <Badge variant="neutral" className="text-[8px] font-black opacity-50 uppercase tracking-tighter">T1, T2, T3</Badge>
                                </div>
                                <Input
                                    value={form.formulaMfa}
                                    onChange={(e) => setForm({ ...form, formulaMfa: e.target.value })}
                                    className="font-mono text-studio-brand font-bold"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Aprovação e Exame */}
                    <Card className="overflow-hidden border-studio-border/60 shadow-xl">
                        <div className="p-4 border-b border-studio-border bg-studio-muted/10 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-studio-brand" />
                            <h3 className="text-sm font-black text-studio-foreground uppercase tracking-wider">Pritama de Provas & Exames</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest border-b border-studio-border/40 pb-2 flex items-center gap-2">
                                    <Settings2 className="w-3 h-3" /> Limiares de Aprovação
                                </h4>
                                <Input label="Aprovação Direta" type="number" step="0.5" value={form.minimaAprovacaoDireta} onChange={(e) => setForm({ ...form, minimaAprovacaoDireta: Number(e.target.value) })} />
                                <Input label="Acesso a Exame (Piso)" type="number" step="0.5" value={form.minimaAcessoExame} onChange={(e) => setForm({ ...form, minimaAcessoExame: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest border-b border-studio-border/40 pb-2 flex items-center gap-2">
                                    <Hash className="w-3 h-3" /> Pesos de Exame
                                </h4>
                                <Input label="Peso MFA no Exame" type="number" step="0.05" value={form.pesoMfaNoExame} onChange={(e) => setForm({ ...form, pesoMfaNoExame: Number(e.target.value) })} />
                                <Input label="Peso Prova Final" type="number" step="0.05" value={form.pesoExameFinal} onChange={(e) => setForm({ ...form, pesoExameFinal: Number(e.target.value) })} />
                                <p className="text-[9px] text-studio-foreground-lighter font-bold italic uppercase tracking-tighter">
                                    Nota Final = (MFA × {form.pesoMfaNoExame}) + (Exame × {form.pesoExameFinal})
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
