

interface SkeletonTableProps {
    columns: number
    rows?: number
    className?: string
}

/**
 * Componente Visual Premium B2B: Skeleton Loader para Tabelas
 * Simula a renderização estrutural das grelhas com o efeito 'shimmer'
 */
export function SkeletonTable({ columns, rows = 5, className = '' }: SkeletonTableProps) {
    const rowArray = Array.from({ length: rows })
    const colArray = Array.from({ length: columns })

    return (
        <div className={`overflow-x-auto w-full border border-studio-border rounded-lg bg-studio-bg shadow-sm animate-fade-in ${className}`}>
            <table className="min-w-full divide-y divide-studio-border/50">
                <thead className="bg-studio-muted/50">
                    <tr>
                        {colArray.map((_, i) => (
                            <th key={i} className="px-5 py-4">
                                <div
                                    className="h-3 w-3/4 rounded-md skeleton-bg"
                                    style={{ opacity: 1 - (i * 0.15) }} // Decaimento subtil
                                />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-studio-border/50">
                    {rowArray.map((_, i) => (
                        <tr key={`row-${i}`} className="hover:bg-studio-muted/20 transition-colors duration-150">
                            {colArray.map((_, j) => (
                                <td key={`cell-${i}-${j}`} className="px-5 py-4 whitespace-nowrap">
                                    {/* Padrões irregulares para simular texto real */}
                                    <div
                                        className={`h-4 rounded-md skeleton-bg ${j === 0 ? 'w-full' :
                                            j === columns - 1 ? 'w-8 ml-auto rounded-md' : // Simula botões de acção alinhados à direita
                                                j % 2 === 0 ? 'w-24' : 'w-16'
                                            }`}
                                        style={{ animationDelay: `${(i * 0.1) + (j * 0.05)}s` }} // Efeito cascata
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
