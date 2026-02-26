import { Link } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { CalendarCheck, Clock } from 'lucide-react'

export default function AulasHoje() {
  return (
    <div>
      <PageHeader
        title="Aulas de hoje"
        subtitle="Resumo das aulas do dia."
        actions={
          <Link
            to="/horarios"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-studio-foreground-light hover:text-studio-foreground bg-studio-muted/50 hover:bg-studio-muted rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
          >
            <Clock className="w-4 h-4" />
            Ver horário completo
          </Link>
        }
      />
      <EmptyState
        icon={<CalendarCheck className="w-10 h-10 text-studio-foreground-lighter" />}
        title="Aulas do dia"
        description="Consulte o seu horário completo para ver as aulas de hoje. Esta vista será enriquecida em breve com a lista de aulas do dia."
        action={
          <Link
            to="/horarios"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-studio-brand text-white hover:bg-studio-brand-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
          >
            Abrir horário
          </Link>
        }
      />
    </div>
  )
}
