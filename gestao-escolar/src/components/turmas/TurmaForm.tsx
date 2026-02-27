import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { turmaFormSchema, type TurmaFormValues } from '@/schemas/turma'
import { useSaveShortcut } from '@/hooks/useSaveShortcut'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { Select } from '@/components/shared/Select'
import { NumberInput } from '@/components/shared/NumberInput'
import { GraduationCap, Calendar, Clock, MapPin, Users } from 'lucide-react'

interface TurmaFormProps {
  defaultValues?: Partial<TurmaFormValues>
  onSubmit: (data: TurmaFormValues) => void
  onCancel: () => void
  isLoading?: boolean
  onDirtyChange?: (dirty: boolean) => void
}

export default function TurmaForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  onDirtyChange,
}: TurmaFormProps) {
  const form = useForm<TurmaFormValues>({
    resolver: zodResolver(turmaFormSchema),
    defaultValues: defaultValues ?? {
      nome: '',
      anoLetivo: '',
      periodo: 'Manhã',
      capacidade: 30
    },
  })

  useEffect(() => {
    onDirtyChange?.(form.formState.isDirty)
  }, [form.formState.isDirty, onDirtyChange])

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

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Ano Letivo"
          {...form.register('anoLetivo')}
          placeholder="ex: 2024/2025"
          error={form.formState.errors.anoLetivo?.message}
          leftIcon={<Calendar className="w-4 h-4" />}
          hint="AAAA/AAAA"
        />
        <Controller
          name="periodo"
          control={form.control}
          render={({ field }) => (
            <Select
              label="Período / Turno"
              value={field.value}
              onChange={field.onChange}
              leftIcon={<Clock className="w-4 h-4" />}
              options={[
                { label: 'Manhã', value: 'Manhã' },
                { label: 'Tarde', value: 'Tarde' },
                { label: 'Noite', value: 'Noite' },
                { label: 'Integral', value: 'Integral' },
              ]}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Sala (Opcional)"
          {...form.register('sala')}
          placeholder="ex: Sala 12, Bloco B"
          error={form.formState.errors.sala?.message}
          leftIcon={<MapPin className="w-4 h-4" />}
        />
        <Controller
          name="capacidade"
          control={form.control}
          render={({ field }) => (
            <NumberInput
              label="Capacidade Máxima"
              value={field.value}
              onChange={field.onChange}
              min={1}
              max={100}
              leftIcon={<Users className="w-4 h-4" />}
              error={form.formState.errors.capacidade?.message}
            />
          )}
        />
      </div>

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
