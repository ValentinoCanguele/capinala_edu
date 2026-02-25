import type { AuthUser } from '@/lib/db'
import * as lancamentosService from './lancamentos'
import * as parcelasService from './parcelas'
import * as relatoriosService from './relatorios'

function escapeCsv(val: string | number): string {
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

export async function exportLancamentosCsv(
  user: AuthUser,
  dataInicio: string,
  dataFim: string
): Promise<string> {
  const list = await lancamentosService.listLancamentos(user, {
    dataInicio,
    dataFim,
  })
  const header = [
    'Data',
    'Tipo',
    'Categoria',
    'Valor',
    'Descrição',
    'Forma pagamento',
    'Referência',
  ]
  const rows = list.map((l) => [
    l.data,
    l.tipo,
    l.categoriaNome,
    l.valor.toFixed(2),
    l.descricao,
    l.formaPagamento,
    l.referencia,
  ])
  return [header.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\r\n')
}

export async function exportParcelasCsv(
  user: AuthUser,
  filtros: { anoLetivoId?: string; status?: string; dataInicio?: string; dataFim?: string }
): Promise<string> {
  const list = await parcelasService.listParcelas(user, filtros)
  const header = [
    'Aluno',
    'Categoria',
    'Vencimento',
    'Valor original',
    'Valor atualizado',
    'Status',
    'Descrição',
  ]
  const rows = list.map((p) => [
    p.alunoNome,
    p.categoriaNome,
    p.vencimento,
    p.valorOriginal.toFixed(2),
    p.valorAtualizado.toFixed(2),
    p.status,
    p.descricao,
  ])
  return [header.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\r\n')
}

export async function exportInadimplenciaCsv(
  user: AuthUser,
  anoLetivoId?: string
): Promise<string> {
  const list = await relatoriosService.getInadimplencia(user, anoLetivoId)
  const header = [
    'Aluno',
    'Parcelas em atraso',
    'Valor total em aberto',
    'Dias em atraso',
  ]
  const rows = list.map((r) => [
    r.alunoNome,
    r.parcelasAtrasadas,
    r.valorTotalAberto.toFixed(2),
    r.diasAtraso,
  ])
  return [header.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\r\n')
}
