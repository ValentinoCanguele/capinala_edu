import { useState, useRef, useEffect } from 'react'
import {
    QrCode,
    ArrowLeft,
    ShieldCheck,
    History,
    UserCheck,
    AlertCircle,
    X,
    Check,
    Volume2,
    Maximize2,
    Zap,
    AlertTriangle,
    ShieldAlert,
    Info
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useProcessarAcessoQR } from '@/data/escola/mutations'
import { useAccessLogs, type AccessLogRow } from '@/data/escola/queries'

export interface ProcessarAcessoResult {
  riskLevel?: string
  studentName?: string
  aulaMarcada?: boolean
}
import PageHeader from '@/components/PageHeader'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Badge } from '@/components/shared/Badge'
import { Avatar } from '@/components/shared/Avatar'

export default function ScannerFrequencia() {
    const [identifier, setIdentifier] = useState('')
    const [sentido, setSentido] = useState<'entrada' | 'saida'>('entrada')
    const [lastScan, setLastScan] = useState<ProcessarAcessoResult | null>(null)
    const [fullScreen, setFullScreen] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const processScan = useProcessarAcessoQR()
    const { data: logs = [], refetch: refetchLogs } = useAccessLogs(15)

    const playSound = (_kind: 'success' | 'error' | 'warning') => {
        // Placeholder para lógica de som se necessário no futuro
    }

    const handleScan = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!identifier) return

        processScan.mutate({ identifier, sentido }, {
            onSuccess: (data: unknown) => {
                const res = data as ProcessarAcessoResult
                setLastScan(res)
                setIdentifier('')
                refetchLogs()
                if (res.riskLevel === 'CRÍTICO') {
                    playSound('warning')
                    toast.error(`ALERTA: Aluno com alto absentismo!`, { duration: 5000 })
                } else {
                    playSound('success')
                    toast.success(`Acesso autorizado: ${res.studentName ?? ''}`)
                }
            },
            onError: (err) => {
                playSound('error')
                toast.error(`ACESSO NEGADO: ${err.message}`, { icon: <ShieldAlert className="text-red-500" /> })
                setIdentifier('')
            }
        })
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (!identifier) inputRef.current?.focus()
        }, 1000)
        return () => clearInterval(interval)
    }, [identifier])

    return (
        <div className={`space-y-6 animate-fade-in ${fullScreen ? 'fixed inset-0 z-50 bg-studio-bg p-8 overflow-y-auto' : 'max-w-6xl mx-auto pb-20'}`}>
            <PageHeader
                title="Painel de Portaria & Acesso Biométrico"
                subtitle="Interface de alta disponibilidade para controle institucional de fluxo."
                actions={
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setFullScreen(!fullScreen)}>
                            <Maximize2 className="w-4 h-4 mr-2" /> {fullScreen ? 'Sair Fullscreen' : 'Modo Guarita'}
                        </Button>
                        {!fullScreen && (
                            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                            </Button>
                        )}
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lado Esquerdo/Centro: Scanner UI */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className={`text-center transition-all duration-500 overflow-hidden relative ${lastScan?.riskLevel === 'CRÍTICO' ? 'ring-4 ring-red-500/50' : 'border-studio-border/60 shadow-2xl'}`}>
                        {lastScan?.riskLevel === 'CRÍTICO' && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
                        )}

                        <div className="p-12 mb-6 flex flex-col items-center">
                            <div className={`w-48 h-48 rounded-[3rem] ${lastScan?.riskLevel === 'CRÍTICO' ? 'bg-red-500/10' : 'bg-studio-brand/5'} flex items-center justify-center mb-6 relative group border-4 border-dashed border-studio-border/40`}>
                                <QrCode className={`w-24 h-24 ${lastScan?.riskLevel === 'CRÍTICO' ? 'text-red-500' : 'text-studio-brand'} group-hover:scale-110 transition-transform duration-500`} />
                                <div className={`absolute inset-0 bg-gradient-to-t ${lastScan?.riskLevel === 'CRÍTICO' ? 'from-red-500/20' : 'from-studio-brand/10'} to-transparent animate-scan-line rounded-[2.8rem]`} />
                                <div className="absolute -top-3 -right-3">
                                    <Badge variant="brand" pulse className="px-3 py-1 font-black uppercase text-[10px]">Ativo</Badge>
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-studio-foreground uppercase tracking-widest leading-none mb-2">Aguardando Digitalização</h3>
                            <p className="text-xs text-studio-foreground-lighter uppercase tracking-widest font-bold">Posicione o Smart-Card ou BI no leitor ótico</p>
                        </div>

                        <div className="px-12 pb-12">
                            <form onSubmit={handleScan} className="space-y-6 max-w-md mx-auto">
                                <div className="flex p-1.5 bg-studio-muted/20 rounded-2xl border border-studio-border/50 shadow-inner">
                                    <button
                                        type="button"
                                        onClick={() => setSentido('entrada')}
                                        className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2 ${sentido === 'entrada' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-studio-foreground-lighter hover:text-studio-foreground'}`}
                                    >
                                        <Zap className="w-4 h-4" /> Fluxo Entrada
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSentido('saida')}
                                        className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2 ${sentido === 'saida' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'text-studio-foreground-lighter hover:text-studio-foreground'}`}
                                    >
                                        <History className="w-4 h-4" /> Fluxo Saída
                                    </button>
                                </div>

                                <div className="relative group">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder="AGUARDANDO INPUT..."
                                        className="w-full h-20 px-8 bg-studio-bg border-4 border-studio-border rounded-3xl text-center font-black text-3xl focus:ring-8 focus:ring-studio-brand/10 focus:border-studio-brand outline-none transition-all placeholder:text-studio-muted/40 uppercase tracking-tighter"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        autoComplete="off"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                        <Volume2 className="w-6 h-6 text-studio-brand/30 hover:text-studio-brand cursor-pointer" />
                                    </div>
                                </div>

                                <p className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest flex items-center justify-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Sistema de Segurança Auditado
                                </p>
                            </form>
                        </div>
                    </Card>

                    {lastScan && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-8 duration-500">
                            <Card className={`p-6 border-l-8 ${lastScan.riskLevel === 'CRÍTICO' ? 'border-l-red-500 bg-red-500/[0.03]' : 'border-l-emerald-500 bg-emerald-500/[0.03]'}`}>
                                <div className="flex items-center gap-5">
                                    <Avatar name={lastScan.studentName} size="lg" className="border-2 border-white shadow-md" />
                                    <div className="flex-1">
                                        <h4 className="text-lg font-black text-studio-foreground leading-tight">{lastScan.studentName}</h4>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <Badge variant={lastScan.riskLevel === 'CRÍTICO' ? 'danger' : 'success'} className="font-black text-[9px] uppercase px-2">
                                                {lastScan.riskLevel === 'CRÍTICO' ? 'ALERTA DE RETENÇÃO' : 'ACESSO AUTORIZADO'}
                                            </Badge>
                                            {lastScan.aulaMarcada && (
                                                <Badge variant="brand" className="text-[9px] font-black uppercase">
                                                    <Check className="w-3 h-3 mr-1" /> Presença Automática
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6 flex flex-col justify-center bg-studio-muted/10">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest">Índice de Assiduidade</span>
                                    <span className={`text-xl font-black ${lastScan.riskLevel === 'CRÍTICO' ? 'text-red-500' : 'text-studio-brand'}`}>
                                        {100 - lastScan.absenceRate}%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-studio-muted rounded-full overflow-hidden border border-studio-border/30">
                                    <div
                                        className={`h-full transition-all duration-1000 ${lastScan.riskLevel === 'CRÍTICO' ? 'bg-red-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${100 - lastScan.absenceRate}%` }}
                                    />
                                </div>
                                <p className={`text-[9px] font-black uppercase tracking-tight mt-3 flex items-center gap-1.5 ${lastScan.riskLevel === 'CRÍTICO' ? 'text-red-600' : 'text-studio-foreground-lighter'}`}>
                                    {lastScan.riskLevel === 'CRÍTICO' ? <AlertTriangle className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                                    {lastScan.riskLevel === 'CRÍTICO' ? 'BLOQUEIO ADM.: REQUER REGULARIZAÇÃO' : 'FLUXO REGULAR SEM ALERTAS'}
                                </p>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Lado Direito: Histórico Residencial/Logs */}
                <div className="space-y-6">
                    <Card noPadding className="border-studio-border/60 shadow-lg h-[calc(100vh-250px)] flex flex-col">
                        <div className="p-4 border-b border-studio-border bg-studio-muted/10 flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-studio-foreground uppercase tracking-widest flex items-center gap-2">
                                <History className="w-4 h-4 text-studio-brand" />
                                Logs de Passagem
                            </h3>
                            <span className="animate-pulse bg-emerald-500 w-2 h-2 rounded-full" />
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {logs.length === 0 ? (
                                <div className="p-12 text-center text-studio-muted">
                                    <UserCheck className="w-12 h-12 mx-auto opacity-10 mb-3" />
                                    <p className="text-[9px] italic uppercase font-black tracking-widest">Sem tráfego registado</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-studio-border/30">
                                    {logs.map((log: AccessLogRow) => (
                                        <div
                                            key={log.id}
                                            className="p-4 flex items-center gap-4 hover:bg-studio-brand/[0.03] transition-all group"
                                        >
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs border ${log.sentido === 'entrada' ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/5 text-amber-600 border-amber-500/20'}`}>
                                                {log.sentido === 'entrada' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black text-studio-foreground uppercase truncate tracking-tight">{log.studentName}</p>
                                                <p className="text-[9px] font-bold text-studio-foreground-lighter flex items-center gap-1.5 uppercase">
                                                    <Zap className="w-2.5 h-2.5" /> {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </p>
                                            </div>
                                            <Badge variant="neutral" className={`text-[8px] font-black ${log.sentido === 'entrada' ? 'text-emerald-600' : 'text-amber-600'} bg-transparent border-studio-border/40`}>
                                                {log.sentido.toUpperCase()}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-studio-muted/5 border-t border-studio-border select-none">
                            <p className="text-[10px] text-studio-foreground-lighter leading-relaxed font-bold uppercase tracking-tighter flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-studio-brand" /> Horário Oficial: {new Date().toLocaleDateString('pt-AO')}
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
