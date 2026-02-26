interface PageSkeletonProps {
  lines?: number
  className?: string
}

export default function PageSkeleton({ lines = 5, className = '' }: PageSkeletonProps) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      <div className="h-6 w-1/3 rounded bg-studio-muted" />
      <div className="h-4 w-2/3 rounded bg-studio-muted" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-10 rounded bg-studio-muted"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-studio-border bg-studio-bg/50 shadow-soft">
      <div className="h-10 bg-studio-muted" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 border-t border-studio-border bg-studio-bg"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gap: 8,
            padding: '12px 16px',
          }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 rounded bg-studio-muted" style={{ width: j === cols - 1 ? '60%' : '100%' }} />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Skeleton para cards de estatística (Dashboard KPIs). */
export function StatCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse flex flex-col justify-center rounded-xl border border-studio-border bg-studio-bg/50 backdrop-blur-sm shadow-soft p-5"
        >
          <div className="h-3 w-16 rounded bg-studio-muted" />
          <div className="mt-2 h-8 w-12 rounded bg-studio-muted" />
        </div>
      ))}
    </div>
  )
}
