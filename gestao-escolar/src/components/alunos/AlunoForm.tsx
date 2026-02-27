import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { alunoFormSchema, type AlunoFormValues } from '@/schemas/aluno'
import { useSaveShortcut } from '@/hooks/useSaveShortcut'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { User, Mail, Calendar, Phone, CreditCard } from 'lucide-react'

interface AlunoFormProps {
  defaultValues?: Partial<AlunoFormValues>
  isNew?: boolean
  onSubmit: (data: AlunoFormValues) => void
  onCancel: () => void
  isLoading?: boolean
  /** Notifica o parent quando o formulário tem alterações não guardadas. */
  onDirtyChange?: (dirty: boolean) => void
}

export default function AlunoForm({
  defaultValues,
  isNew = true,
  onSubmit,
  onCancel,
  isLoading = false,
  onDirtyChange,
}: AlunoFormProps) {
  const form = useForm<AlunoFormValues>({
    resolver: zodResolver(alunoFormSchema),
    defaultValues: defaultValues ?? {
      nome: '',
      email: '',
      dataNascimento: '',
      telefone: '',
      bi: '',
      biValidoAte: ''
    },
  })

  useEffect(() => {
    onDirtyChange?.(form.formState.isDirty)
  }, [form.formState.isDirty, onDirtyChange])

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

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Email Institucional / Pessoal"
          help="Endereço usado pela escola para comunicados e acesso à plataforma. Opcional."
          type="email"
          autoComplete="email"
          {...form.register('email')}
          placeholder="email@exemplo.com"
          error={form.formState.errors.email?.message}
          leftIcon={<Mail className="w-4 h-4" />}
          hint="Opcional, usado para notificações e acesso ao portal."
        />
        <Input
          label="Telefone de Contacto"
          type="tel"
          {...form.register('telefone')}
          placeholder="+244 9..."
          error={form.formState.errors.telefone?.message}
          leftIcon={<Phone className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Data de Nascimento"
          type="date"
          {...form.register('dataNascimento')}
          error={form.formState.errors.dataNascimento?.message}
          leftIcon={<Calendar className="w-4 h-4" />}
        />
        <div className="flex flex-col gap-4">
          <Input
            label="Bilhete de Identidade (BI)"
            help="Número do documento de identidade angolano. Formato habitual: 9 dígitos + LA + 3 dígitos."
            {...form.register('bi')}
            placeholder="000000000LA000"
            error={form.formState.errors.bi?.message}
            leftIcon={<CreditCard className="w-4 h-4" />}
          />
        </div>
      </div>

      <Input
        label="Validade do BI"
        type="date"
        {...form.register('biValidoAte')}
        error={form.formState.errors.biValidoAte?.message}
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
