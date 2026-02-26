import { useState } from 'react'
import { Search, ChevronDown, CheckCircle2, AlertCircle, Clock, Hash, FileSpreadsheet, FileText } from 'lucide-react'
import type { AlunoFinanceiro } from '@/data/escola/queries'
import EmptyState from '@/components/shared/EmptyState'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Card } from '@/components/shared/Card'
import { Input } from '@/components/shared/Input'
import { Avatar } from '@/components/shared/Avatar'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { Select } from '@/components/shared/Select'

interface AlunosFinanceiroListProps {
    alunos: AlunoFinanceiro[]
    filter: string
    onFilterChange: (value: string) => void
    isLoading: boolean
    error: Error | null
    onExportExcel?: () => void
    onExportPDF?: () => void
}

export default function AlunosFinanceiroList({
    alunos,
    filter,
    onFilterChange,
    isLoading,
    error,
    onExportExcel,
    onExportPDF
}: AlunosFinanceiroListProps) {
    const [statusFilter, setStatusFilter] = useState<string>('')

    const hasFilter = filter.length > 0 || statusFilter !== ''

    const filteredAlunos = alunos.filter(a => {
        const matchesText = a.nome.toLowerCase().includes(filter.toLowerCase()) ||
            a.turma.toLowerCase().includes(filter.toLowerCase())
        const matchesStatus = statusFilter === '' || a.statusFinanceiro === statusFilter
        return matchesText && matchesStatus
    })

    // Formatador Kwanza 🇦🇴
    const formatKz = (valor: number) => {
        return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(valor)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Regularizado':
                return <Badge variant="success" className="font-extrabold uppercase text-[9px]"><CheckCircle2 className="w-3 h-3 mr-1" /> Regular</Badge>
            case 'Em Dívida':
                return <Badge variant="danger" className="font-extrabold uppercase text-[9px]"><AlertCircle className="w-3 h-3 mr-1" /> Dívida</Badge>
            case 'Pendente':
                return <Badge variant="warning" className="font-extrabold uppercase text-[9px]"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>
            default:
                return <Badge variant="neutral">{status}</Badge>
        }
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
                <div className="flex gap-4 w-full sm:w-auto">
                    <Input
                        placeholder="Pesquisar por nome ou turma..."
                        value={filter}
                        onChange={(e) => onFilterChange(e.target.value)}
                        leftIcon={<Search className="h-4 w-4" />}
                        className="w-full sm:w-80 shadow-sm"
                    />
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-48 shadow-sm"
                        options={[
                            { value: '', label: 'Todos os Status' },
                            { value: 'Regularizado', label: 'Regularizados' },
                            { value: 'Em Dívida', label: 'Em Dívida' },
                            { value: 'Pendente', label: 'Pendentes' }
                        ]}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={onExportExcel} icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}>
                        Exportar XLS
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onExportPDF} icon={<FileText className="w-4 h-4 text-red-500" />}>
                        Imprimir PDF
                    </Button>
                </div>
            </div>

            <Card noPadding className="border-studio-border/60 shadow-xl overflow-hidden animate-in fade-in duration-500">
                {isLoading ? (
                    <SkeletonTable rows={8} columns={5} />
                ) : error ? (
                    <div className="p-8 text-center text-red-600 bg-red-50/50" role="alert">
                        <p className="font-semibold">Erro ao carregar dados financeiros</p>
                        <p className="text-sm mt-1">{error.message}</p>
                    </div>
                ) : filteredAlunos.length === 0 ? (
                    <EmptyState
                        title={hasFilter ? 'Nenhum registo financeiro encontrado' : 'Painel Financeiro Vazio'}
                        description="Tente outro termo de pesquisa ou altere o status selecionado."
                        icon={<AlertCircle className="h-12 w-12 opacity-20" />}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-studio-border/30">
                            <thead className="bg-studio-muted/10 border-b border-studio-border">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest">
                                        Estudante & Turma
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest">
                                        Global (Propinas)
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest border-x border-studio-border/30">
                                        Liquidado
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest bg-red-500/5">
                                        Em Dívida (Kz)
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-studio-border/20 bg-studio-bg">
                                {filteredAlunos.map((a) => (
                                    <tr key={a.id} className="group hover:bg-studio-muted/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <Avatar name={a.nome} size="md" shape="square" className="border border-studio-border/50 shadow-sm" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-studio-foreground group-hover:text-studio-brand transition-colors">
                                                        {a.nome}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-0.5 text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest">
                                                        <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {a.turma || 'S/ Turma'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-semibold text-studio-foreground-light tabular-nums">
                                                {formatKz(a.valorPropina)}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-right border-x border-studio-border/30 bg-studio-muted/[0.02]">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                                    {formatKz(a.valorPago)}
                                                </span>
                                                <div className="w-full bg-studio-border/50 rounded-full h-1.5 mt-2 max-w-[80px]">
                                                    <div
                                                        className="bg-emerald-500 h-1.5 rounded-full"
                                                        style={{ width: `${Math.min(100, Math.max(0, a.percentualPago))}%` }}
                                                    />
                                                </div>
                                                <span className="text-[9px] font-black text-studio-foreground-lighter mt-1">{a.percentualPago}% Pago</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-right bg-red-500/[0.02]">
                                            <span className={`text-sm font-black tabular-nums ${a.valorDivida > 0 ? 'text-red-500' : 'text-studio-foreground-lighter'}`}>
                                                {formatKz(a.valorDivida)}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {getStatusBadge(a.statusFinanceiro)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card >
        </>
    )
}
