import { useState, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import {
  useModulosComDisponiveis,
  type Modulo,
  type ModuloCatalogo,
} from '@/data/escola/queries'
import { useUpdateModulo, useInstallModulo } from '@/data/escola/mutations'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'
import { TableSkeleton } from '@/components/PageSkeleton'
import ListResultSummary from '@/components/ListResultSummary'
import { getModuleIcon, Download, SlidersHorizontal } from '@/lib/moduloIcons'

const PAPEIS: { value: string; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'direcao', label: 'Direção' },
  { value: 'professor', label: 'Professor' },
  { value: 'responsavel', label: 'Responsável' },
  { value: 'aluno', label: 'Aluno' },
]

function ModuloForm({
  modulo,
  onSubmit,
  onCancel,
  isLoading,
}: {
  modulo: Modulo
  onSubmit: (data: {
    nome: string
    descricao: string | null
    ordem: number
    config: Record<string, unknown>
    permissoes: string[]
    imagem?: string | null
    icone?: string | null
  }) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [nome, setNome] = useState(modulo.nome)
  const [descricao, setDescricao] = useState(modulo.descricao ?? '')
  const [ordem, setOrdem] = useState(String(modulo.ordem))
  const [imagem, setImagem] = useState(modulo.imagem ?? '')
  const [icone, setIcone] = useState(modulo.icone ?? '')
  const [configRaw, setConfigRaw] = useState(
    () => JSON.stringify(modulo.config, null, 2)
  )
  const [permissoes, setPermissoes] = useState<string[]>(() => [...modulo.permissoes])

  const togglePapel = (papel: string) => {
    setPermissoes((prev) =>
      prev.includes(papel) ? prev.filter((p) => p !== papel) : [...prev, papel]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let config: Record<string, unknown> = {}
    if (configRaw.trim()) {
      try {
        config = JSON.parse(configRaw) as Record<string, unknown>
      } catch {
        toast.error('Config inválido (JSON)')
        return
      }
    }
    onSubmit({
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      ordem: parseInt(ordem, 10) || 0,
      config,
      permissoes,
      imagem: imagem.trim() || null,
      icone: icone.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="mod-nome" className="label">
          Nome
        </label>
        <input
          id="mod-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="input w-full"
          placeholder="Ex: Finanças"
          required
        />
      </div>
      <div>
        <label htmlFor="mod-desc" className="label">
          Descrição (opcional)
        </label>
        <input
          id="mod-desc"
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="input w-full"
          placeholder="Breve descrição do módulo"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="mod-imagem" className="label">
            Imagem (URL)
          </label>
          <input
            id="mod-imagem"
            type="text"
            value={imagem}
            onChange={(e) => setImagem(e.target.value)}
            className="input w-full"
            placeholder="https://..."
          />
        </div>
        <div>
          <label htmlFor="mod-icone" className="label">
            Ícone (nome)
          </label>
          <input
            id="mod-icone"
            type="text"
            value={icone}
            onChange={(e) => setIcone(e.target.value)}
            className="input w-full"
            placeholder="Ex: Banknote"
          />
        </div>
      </div>
      <div>
        <label htmlFor="mod-ordem" className="label">
          Ordem no menu
        </label>
        <input
          id="mod-ordem"
          type="number"
          min={0}
          value={ordem}
          onChange={(e) => setOrdem(e.target.value)}
          className="input w-full"
        />
      </div>
      <div>
        <label htmlFor="mod-config" className="label">
          Config (JSON, opcional)
        </label>
        <textarea
          id="mod-config"
          value={configRaw}
          onChange={(e) => setConfigRaw(e.target.value)}
          className="input w-full font-mono text-sm resize-none"
          rows={4}
          placeholder="{}"
        />
      </div>
      <div>
        <span className="label block mb-2">Permissões (quem pode aceder)</span>
        <div className="flex flex-wrap gap-3">
          {PAPEIS.map((p) => (
            <label key={p.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={permissoes.includes(p.value)}
                onChange={() => togglePapel(p.value)}
                className="rounded border-studio-border"
              />
              <span className="text-sm text-studio-foreground">{p.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-studio-border">
        <button type="button" onClick={onCancel} className="btn-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2">
          Cancelar
        </button>
        <button type="submit" className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 disabled:opacity-50" disabled={isLoading}>
          {isLoading ? 'A guardar...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

/** Card padrão: título, descrição, imagem (opcional), ícone. */
function ModuloCardInstalado({
  modulo,
  onConfig,
  onToggle,
  isToggling,
}: {
  modulo: Modulo
  onConfig: () => void
  onToggle: () => void
  isToggling: boolean
}) {
  const Icon = getModuleIcon(modulo.icone)
  return (
    <article
      className="card p-4 flex flex-col gap-3"
      aria-label={`Módulo ${modulo.nome}`}
    >
      <div className="flex items-start gap-3">
        {modulo.imagem ? (
          <img
            src={modulo.imagem}
            alt=""
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-studio-muted"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-studio-muted flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-studio-foreground-lighter" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-studio-foreground">{modulo.nome}</h3>
          <p className="text-sm text-studio-foreground-light line-clamp-2">
            {modulo.descricao || 'Sem descrição.'}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-studio-border">
        <button
          type="button"
          onClick={onConfig}
          className="flex items-center gap-1.5 text-sm text-studio-brand hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 rounded px-1"
          title="Configuração"
          aria-label={`Configurar ${modulo.nome}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Configuração
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-studio-foreground-lighter">
            {modulo.ativo ? 'Activo' : 'Inactivo'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={modulo.ativo}
            aria-label={modulo.ativo ? 'Desactivar' : 'Activar'}
            onClick={onToggle}
            disabled={isToggling}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 ${
              modulo.ativo ? 'bg-studio-brand' : 'bg-studio-muted'
            } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                modulo.ativo ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </article>
  )
}

/** Card para módulo ainda não instalado: ícone Instalar. */
function ModuloCardDisponivel({
  item,
  onInstall,
  isInstalling,
}: {
  item: ModuloCatalogo
  onInstall: () => void
  isInstalling: boolean
}) {
  const Icon = getModuleIcon(item.icone)
  return (
    <article
      className="card p-4 flex flex-col gap-3 border-dashed"
      aria-label={`Módulo disponível: ${item.nome}`}
    >
      <div className="flex items-start gap-3">
        {item.imagem ? (
          <img
            src={item.imagem}
            alt=""
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-studio-muted"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-studio-muted flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-studio-foreground-lighter" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-studio-foreground">{item.nome}</h3>
          <p className="text-sm text-studio-foreground-light line-clamp-2">
            {item.descricao}
          </p>
        </div>
      </div>
      <div className="pt-2 border-t border-studio-border">
        <button
          type="button"
          onClick={onInstall}
          disabled={isInstalling}
          className="flex items-center gap-2 w-full justify-center py-2 rounded-md text-sm font-medium bg-studio-brand text-white hover:bg-studio-brand-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 disabled:opacity-50"
          aria-label={`Instalar módulo ${item.nome}`}
        >
          <Download className="w-4 h-4" />
          {isInstalling ? 'A instalar...' : 'Instalar módulo'}
        </button>
      </div>
    </article>
  )
}

export default function Modulos() {
  const { user } = useAuth()
  const [filter, setFilter] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data, isLoading, error } = useModulosComDisponiveis()
  const instalados = data?.instalados ?? []
  const disponiveis = data?.disponiveis ?? []

  const updateModulo = useUpdateModulo()
  const installModulo = useInstallModulo()

  const filteredInstalados = useMemo(
    () =>
      filter
        ? instalados.filter(
            (m) =>
              m.nome.toLowerCase().includes(filter.toLowerCase()) ||
              m.chave.toLowerCase().includes(filter.toLowerCase())
          )
        : instalados,
    [instalados, filter]
  )
  const filteredDisponiveis = useMemo(
    () =>
      filter
        ? disponiveis.filter(
            (m) =>
              m.nome.toLowerCase().includes(filter.toLowerCase()) ||
              m.chave.toLowerCase().includes(filter.toLowerCase())
          )
        : disponiveis,
    [disponiveis, filter]
  )

  const editing = editingId ? instalados.find((m) => m.id === editingId) ?? null : null

  const handleToggleAtivo = (m: Modulo) => {
    updateModulo.mutate(
      { id: m.id, ativo: !m.ativo },
      {
        onSuccess: () =>
          toast.success(m.ativo ? 'Módulo desactivado.' : 'Módulo activado.'),
        onError: (err) => toast.error(err.message),
      }
    )
  }

  const handleInstall = (chave: string) => {
    installModulo.mutate(chave, {
      onSuccess: () => toast.success('Módulo instalado.'),
      onError: (err) => toast.error(err.message),
    })
  }

  const handleSubmitEdit = (data: Parameters<ModuloForm['props']['onSubmit']>[0]) => {
    if (!editingId) return
    updateModulo.mutate(
      { id: editingId, ...data },
      {
        onSuccess: () => {
          toast.success('Módulo atualizado.')
          setEditingId(null)
        },
        onError: (err) => toast.error(err.message),
      }
    )
  }

  const total = instalados.length + disponiveis.length

  if (user?.papel !== 'admin') {
    return <Navigate to="/" replace />
  }

  return (
    <div>
      <PageHeader
        title="Módulos do sistema"
        subtitle="Instalar novos módulos, activar/desactivar e configurar permissões. Cada módulo pode estender o sistema (rotas, menu, configurações)."
      />

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <input
          type="search"
          placeholder="Pesquisar por nome ou chave..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input max-w-xs"
          aria-label="Pesquisar módulos"
        />
        <ListResultSummary
          count={filteredInstalados.length + filteredDisponiveis.length}
          total={total}
          label="módulo"
          hasFilter={filter.length > 0}
          onClearFilter={() => setFilter('')}
          isLoading={isLoading}
        />
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditingId(null)}
        title={editing ? `Configurar: ${editing.nome}` : 'Configurar módulo'}
        size="md"
      >
        {editing && (
          <ModuloForm
            modulo={editing}
            onSubmit={handleSubmitEdit}
            onCancel={() => setEditingId(null)}
            isLoading={updateModulo.isPending}
          />
        )}
      </Modal>

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : error ? (
        <div className="p-8 text-center text-red-600" role="alert">
          Erro: {(error as Error).message}
        </div>
      ) : (
        <div className="space-y-8">
          <section aria-labelledby="modulos-instalados-heading">
            <h2 id="modulos-instalados-heading" className="text-sm font-semibold text-studio-foreground mb-3">
              Módulos instalados
            </h2>
            {filteredInstalados.length === 0 ? (
              <EmptyState
                title="Nenhum módulo instalado que corresponda à pesquisa"
                description="Altere o texto de pesquisa ou limpe o filtro para ver todos os módulos instalados."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredInstalados.map((m) => (
                  <ModuloCardInstalado
                    key={m.id}
                    modulo={m}
                    onConfig={() => setEditingId(m.id)}
                    onToggle={() => handleToggleAtivo(m)}
                    isToggling={updateModulo.isPending}
                  />
                ))}
              </div>
            )}
          </section>

          {filteredDisponiveis.length > 0 && (
            <section aria-labelledby="modulos-disponiveis-heading">
              <h2 id="modulos-disponiveis-heading" className="text-sm font-semibold text-studio-foreground mb-3">
                Disponíveis para instalar
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDisponiveis.map((item) => (
                  <ModuloCardDisponivel
                    key={item.chave}
                    item={item}
                    onInstall={() => handleInstall(item.chave)}
                    isInstalling={installModulo.isPending}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
