/**
 * Resumo de resultados e limpar pesquisa para listagens.
 * Mostra "X resultado(s)" e botão "Limpar pesquisa" quando há filtro ativo.
 */

interface ListResultSummaryProps {
  /** Número de itens visíveis (após filtro) */
  count: number
  /** Total sem filtro (opcional; se igual a count, não mostra "de N") */
  total?: number
  /** Label no singular (ex: "aluno") — plural será com "s" */
  label: string
  /** Se há filtro ativo (mostra botão Limpar) */
  hasFilter: boolean
  /** Callback para limpar o filtro */
  onClearFilter: () => void
  /** Se está a carregar (pode mostrar "..." ou esconder números) */
  isLoading?: boolean
}

export default function ListResultSummary({
  count,
  total,
  label,
  hasFilter,
  onClearFilter,
  isLoading = false,
}: ListResultSummaryProps) {
  const labelPlural = label + (label.endsWith('s') ? '' : 's')
  const text =
    total !== undefined && total !== count
      ? `Mostrando ${count} de ${total} ${count === 1 ? label : labelPlural}`
      : `${count} ${count === 1 ? label : labelPlural}`

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-studio-foreground-light" role="status" aria-live="polite" aria-label={isLoading ? 'A carregar' : text}>
      {!isLoading && <span>{text}</span>}
      {hasFilter && (
        <button
          type="button"
          onClick={onClearFilter}
          className="btn-secondary text-xs py-1.5 px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-1"
        >
          Limpar pesquisa
        </button>
      )}
    </div>
  )
}
