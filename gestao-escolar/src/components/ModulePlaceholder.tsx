import { Construction } from 'lucide-react'
import PageHeader from '@/components/PageHeader'

interface ModulePlaceholderProps {
  title: string
  description?: string
}

export default function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  return (
    <div>
      <PageHeader title={title} subtitle={description ?? 'Este módulo está em construção.'} />
      <div
        className="card flex flex-col items-center justify-center py-12 px-6 text-center"
        role="status"
        aria-label={`${title} — em construção`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-studio-muted text-studio-foreground-lighter">
          <Construction className="h-7 w-7" />
        </div>
        <p className="mt-4 text-sm font-medium text-studio-foreground">
          Funcionalidade em desenvolvimento
        </p>
        <p className="mt-1 text-sm text-studio-foreground-light max-w-sm">
          Em breve disponível.
        </p>
      </div>
    </div>
  )
}
