import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { alunoFormSchema, type AlunoFormValues } from '@/schemas/aluno'

interface AlunoFormProps {
  defaultValues?: Partial<AlunoFormValues>
  isNew?: boolean
  onSubmit: (data: AlunoFormValues) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function AlunoForm({
  defaultValues,
  isNew = true,
  onSubmit,
  onCancel,
  isLoading = false,
}: AlunoFormProps) {
  const form = useForm<AlunoFormValues>({
    resolver: zodResolver(alunoFormSchema),
    defaultValues: defaultValues ?? { nome: '', email: '', dataNascimento: '' },
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="aluno-nome" className="label">
          Nome
        </label>
        <input
          id="aluno-nome"
          {...form.register('nome')}
          className="input"
          placeholder="Nome completo"
        />
        {form.formState.errors.nome && (
          <p className="text-red-600 text-sm mt-0.5">{form.formState.errors.nome.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="aluno-email" className="label">
          Email
        </label>
        <input
          id="aluno-email"
          type="email"
          {...form.register('email')}
          className="input"
          placeholder="email@exemplo.com"
        />
        {form.formState.errors.email && (
          <p className="text-red-600 text-sm mt-0.5">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="aluno-data" className="label">
          Data de nascimento
        </label>
        <input
          id="aluno-data"
          type="date"
          {...form.register('dataNascimento')}
          className="input"
        />
        {form.formState.errors.dataNascimento && (
          <p className="text-red-600 text-sm mt-0.5">
            {form.formState.errors.dataNascimento.message}
          </p>
        )}
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2">
          Cancelar
        </button>
        <button type="submit" className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 disabled:opacity-50" disabled={isLoading}>
          {isNew ? 'Criar' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
