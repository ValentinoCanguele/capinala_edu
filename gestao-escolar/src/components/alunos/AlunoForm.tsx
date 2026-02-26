import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { alunoFormSchema, type AlunoFormValues } from '@/schemas/aluno'
import { useSaveShortcut } from '@/hooks/useSaveShortcut'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { User, Mail, Calendar } from 'lucide-react'

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

  useSaveShortcut(() => form.handleSubmit(onSubmit)(), true)

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Nome Completo"
        {...form.register('nome')}
        placeholder="ex: Valentino Canguele"
        error={form.formState.errors.nome?.message}
        leftIcon={<User className="w-4 h-4" />}
      />

      <Input
        label="Email Institucional / Pessoal"
        type="email"
        {...form.register('email')}
        placeholder="email@exemplo.com"
        error={form.formState.errors.email?.message}
        leftIcon={<Mail className="w-4 h-4" />}
        hint="Opcional, usado para notificações e acesso ao portal."
      />

      <Input
        label="Data de Nascimento"
        type="date"
        {...form.register('dataNascimento')}
        error={form.formState.errors.dataNascimento?.message}
        leftIcon={<Calendar className="w-4 h-4" />}
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
          {isNew ? 'Criar Aluno' : 'Guardar Alterações'}
        </Button>
      </div>
    </form>
  )
}
