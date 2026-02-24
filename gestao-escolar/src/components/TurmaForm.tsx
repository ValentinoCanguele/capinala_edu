import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { turmaFormSchema, type TurmaFormValues } from '@/schemas/turma'

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

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="turma-nome" className="label">
          Nome da turma
        </label>
        <input
          id="turma-nome"
          {...form.register('nome')}
          className="input"
          placeholder="ex: 5º A"
        />
        {form.formState.errors.nome && (
          <p className="text-red-600 text-sm mt-0.5">{form.formState.errors.nome.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="turma-ano" className="label">
          Ano letivo
        </label>
        <input
          id="turma-ano"
          {...form.register('anoLetivo')}
          className="input"
          placeholder="ex: 2024/2025"
        />
        {form.formState.errors.anoLetivo && (
          <p className="text-red-600 text-sm mt-0.5">
            {form.formState.errors.anoLetivo.message}
          </p>
        )}
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          Guardar
        </button>
      </div>
    </form>
  )
}
