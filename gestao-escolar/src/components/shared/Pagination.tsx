import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    totalItems?: number
    itemsPerPage?: number
}

/**
 * Paginação Elegante (Vercel/Linear Style)
 * Substitui "Anterior/Seguinte" simples por páginas numeradas (Pílulas),
 * com lógica de colapso de elipse quando existem muitas páginas.
 */
export function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: PaginationProps) {
    if (totalPages <= 1) return null

    // Gera array de páginas a exibir [1, '...', 4, 5, 6, '...', 20]
    const getVisiblePages = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        }

        if (currentPage <= 4) {
            return [1, 2, 3, 4, 5, '...', totalPages]
        }

        if (currentPage >= totalPages - 3) {
            return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
        }

        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
    }

    const pages = getVisiblePages()

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-studio-border bg-studio-bg rounded-b-xl gap-4 sm:gap-0">
            {/* Informação Resumida Esquerda */}
            <div className="hidden sm:flex flex-1">
                {(totalItems && itemsPerPage) ? (
                    <p className="text-sm text-studio-foreground-light">
                        A mostrar <span className="font-medium text-studio-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium text-studio-foreground">{Math.min(currentPage * itemsPerPage, totalItems)}</span> de <span className="font-medium text-studio-foreground">{totalItems}</span> resultados
                    </p>
                ) : (
                    <p className="text-sm text-studio-foreground-light">
                        Página <span className="font-medium text-studio-foreground">{currentPage}</span> de <span className="font-medium text-studio-foreground">{totalPages}</span>
                    </p>
                )}
            </div>

            {/* Controlos de Navegação Direita */}
            <div className="flex items-center justify-end sm:flex-1 gap-1">
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-md border border-transparent text-sm font-medium text-studio-foreground-light hover:bg-studio-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-studio-brand"
                    aria-label="Página anterior"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="hidden sm:flex items-center gap-1 mx-2">
                    {pages.map((page, idx) => (
                        page === '...' ? (
                            <span key={`ellipse-${idx}`} className="px-2 py-1 flex items-center justify-center text-studio-foreground-lighter">
                                <MoreHorizontal className="w-4 h-4" />
                            </span>
                        ) : (
                            <button
                                key={page}
                                type="button"
                                onClick={() => onPageChange(page as number)}
                                className={`relative inline-flex items-center justify-center min-w-[32px] h-8 rounded-md text-sm font-medium transition-all ${currentPage === page
                                        ? 'bg-studio-brand text-white shadow-soft focus:ring-2 focus:ring-offset-2 focus:ring-offset-studio-bg focus:ring-studio-brand'
                                        : 'text-studio-foreground-light hover:bg-studio-muted hover:text-studio-foreground focus:outline-none focus:ring-2 focus:ring-studio-brand'
                                    }`}
                                aria-current={currentPage === page ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        )
                    ))}
                </div>

                {/* Simplificação Mobile */}
                <div className="flex sm:hidden items-center justify-center mx-2 w-16 text-sm font-medium text-studio-foreground">
                    {currentPage} / {totalPages}
                </div>

                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-md border border-transparent text-sm font-medium text-studio-foreground-light hover:bg-studio-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-studio-brand"
                    aria-label="Página seguinte"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}
