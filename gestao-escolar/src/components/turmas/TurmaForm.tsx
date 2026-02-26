import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { turmaFormSchema, type TurmaFormValues } from '@/schemas/turma'
import { useSaveShortcut } from '@/hooks/useSaveShortcut'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { GraduationCap, Calendar } from 'lucide-react'

interface TurmaFormProps {
  defaultValues?: Partial<TurmaFormValues>
  onSubmit: (data: TurmaFormValues) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function TurmaForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: TurmaFormProps) {
  const form = useForm<TurmaFormValues>({
    resolver: zodResolver(turmaFormSchema),
    defaultValues: defaultValues ?? { nome: '', anoLetivo: '' },
  })

  useSaveShortcut(() => form.handleSubmit(onSubmit)(), true)

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Nome da Turma"
        {...form.register('nome')}
        placeholder="ex: 5º A, 10º B, ..."
        error={form.formState.errors.nome?.message}
        leftIcon={<GraduationCap className="w-4 h-4" />}
      />

      <Input
        label="Ano Letivo"
        {...form.register('anoLetivo')}
        placeholder="ex: 2024/2025"
        error={form.formState.errors.anoLetivo?.message}
        leftIcon={<Calendar className="w-4 h-4" />}
        hint="O formato deve ser AAAA/AAAA."
      />

      <div className="flex gap-3 justify-end pt-4 border-t border-studio-border/50">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          variant="primary"
        >
          {defaultValues?.nome ? 'Guardar Alterações' : 'Criar Turma'}
        </Button>
      </div>
    </form>
  )
}
