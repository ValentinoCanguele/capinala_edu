import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { useDocumentos, useMeusFilhos } from '@/data/escola/queries'
import { useUploadDocumento, useDeleteDocumento } from '@/data/escola/mutations'
import { getAuthHeader } from '@/lib/auth'
import { formatBytes } from '@/utils/formatters'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import Modal from '@/components/Modal'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Button } from '@/components/shared/Button'
import { Badge } from '@/components/shared/Badge'
import { Card } from '@/components/shared/Card'
import {
  Upload,
  FileText,
  FileCode,
  FileImage,
  FileVideo,
  Download,
  Trash2,
  ShieldCheck,
  Search,
  Filter,
  Plus
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

function FileIcon({ mime }: { mime?: string }) {
  if (mime?.includes('image')) return <FileImage className="w-5 h-5 text-blue-500" />
  if (mime?.includes('video')) return <FileVideo className="w-5 h-5 text-purple-500" />
  if (mime?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />
  return <FileCode className="w-5 h-5 text-studio-foreground-lighter" />
}

export default function Arquivos() {
  const { user } = useAuth()
  const [scope, setScope] = useState<'pessoa' | 'aluno'>('pessoa')
  const [alunoId, setAlunoId] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  const pessoaId = user?.pessoaId ?? ''
  const { data: filhos = [] } = useMeusFilhos()
  const filters = scope === 'pessoa' ? { pessoaId } : { alunoId: alunoId || undefined }
  const { data: documentos = [], isLoading } = useDocumentos(filters)
  const uploadDoc = useUploadDocumento()
  const deleteDoc = useDeleteDocumento()

  const handleDelete = (id: string) => {
    setItemToDelete(id)
  }

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim() || !file) {
      toast.error('Título e ficheiro são obrigatórios')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      uploadDoc.mutate(
        {
          titulo: titulo.trim(),
          image: dataUrl,
          fileName: file.name,
          mimeType: file.type,
          ...(scope === 'pessoa' ? { pessoaId } : { alunoId }),
        },
        {
          onSuccess: () => {
            toast.success('Documento enviado.')
            setModalOpen(false)
            setTitulo('')
            setFile(null)
          },
          onError: (err) => toast.error(err.message),
        }
      )
    }
    reader.readAsDataURL(file)
  }

  const confirmDelete = () => {
    if (!itemToDelete) return
    deleteDoc.mutate(itemToDelete, {
      onSuccess: () => {
        toast.success('Documento eliminado.')
        setItemToDelete(null)
      },
      onError: (err) => {
        toast.error(err.message)
        setItemToDelete(null)
      },
    })
  }

  const handleDownload = async (id: string, nomeFicheiro: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/escola/documentos/${id}`, {
        headers: getAuthHeader(),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Falha ao descarregar')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nomeFicheiro || 'documento'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Falha ao descarregar documento')
    }
  }

  return (
    <div className="max-w-6xl animate-fade-in">
      <Modal
        title="Eliminar documento"
        open={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        size="sm"
      >
        <p className="text-sm text-studio-foreground-light mb-6">
          Tem a certeza que deseja eliminar este documento? Esta ação **não pode ser desfeita**.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setItemToDelete(null)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmDelete} loading={deleteDoc.isPending}>
            Confirmar Eliminação
          </Button>
        </div>
      </Modal>

      <PageHeader
        title="Centro de Documentação"
        subtitle="Armazenamento seguro de arquivos institucionais, diplomas e declarações."
        actions={
          <Button
            onClick={() => setModalOpen(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            Novo Arquivo
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-studio-muted/5 p-4 rounded-2xl border border-studio-border/50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-studio-foreground-lighter" />
            <span className="text-xs font-black uppercase text-studio-foreground-lighter tracking-widest leading-none">Visibilidade</span>
          </div>
          <div className="flex rounded-lg bg-studio-muted/20 p-1 border border-studio-border/30">
            <button
              onClick={() => setScope('pessoa')}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${scope === 'pessoa' ? 'bg-white shadow-sm text-studio-brand' : 'text-studio-foreground-lighter hover:text-studio-foreground'}`}
            >
              Os meus
            </button>
            <button
              onClick={() => setScope('aluno')}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${scope === 'aluno' ? 'bg-white shadow-sm text-studio-brand' : 'text-studio-foreground-lighter hover:text-studio-foreground'}`}
            >
              Dependentes
            </button>
          </div>
        </div>

        {scope === 'aluno' && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-studio-foreground">Estudante:</span>
            <select
              value={alunoId}
              onChange={(e) => setAlunoId(e.target.value)}
              className="bg-studio-bg border border-studio-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-studio-brand outline-none"
            >
              <option value="">Selecionar...</option>
              {filhos.map((f) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <Card noPadding className="overflow-hidden border-studio-border/60">
        {isLoading ? (
          <SkeletonTable rows={5} columns={4} />
        ) : documentos.length === 0 ? (
          <EmptyState
            title="Nenhum arquivo encontrado"
            description="Aqui aparecerão os seus diplomas, declarações e documentos carregados."
            icon={<ShieldCheck className="w-16 h-16 text-studio-muted/30" />}
            actionLabel="Carregar Primeiro Arquivo"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-studio-border/20" aria-label="Lista de documentos">
              <thead>
                <tr className="bg-studio-muted/5">
                  <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Identificação / Ficheiro</th>
                  <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Categoria</th>
                  <th scope="col" className="px-6 py-4 text-right text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Tamanho</th>
                  <th scope="col" className="px-6 py-4 text-right text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Gestão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border/10">
                {documentos.map((d) => (
                  <tr key={d.id} className="group hover:bg-studio-brand/[0.01] transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-studio-muted/10 border border-studio-border flex items-center justify-center shadow-sm">
                          <FileIcon mime={d.tipoMime} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-studio-foreground group-hover:text-studio-brand transition-colors uppercase tracking-tight">{d.titulo}</span>
                          <span className="text-[10px] text-studio-foreground-lighter font-medium">{d.nomeFicheiro}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <Badge variant="neutral" className="text-[9px] font-black px-2 py-0.5 border-studio-border/50">
                        {d.tipoMime?.split('/')[1]?.toUpperCase() ?? 'DOC'}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap tabular-nums text-xs font-bold text-studio-foreground-lighter">
                      {d.tamanho != null ? formatBytes(d.tamanho) : '—'}
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Download className="w-3.5 h-3.5" />}
                          onClick={() => handleDownload(d.id, d.nomeFicheiro)}
                          className="text-[10px] font-black uppercase text-studio-brand"
                        >
                          Baixar
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => handleDelete(d.id)}
                          className="text-red-400 hover:text-red-500 hover:bg-red-50"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Enviar Novo Documento">
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="p-8 border-2 border-dashed border-studio-border rounded-2xl bg-studio-muted/5 flex flex-col items-center justify-center group hover:border-studio-brand transition-colors cursor-pointer relative" onClick={() => fileInputRef.current?.click()}>
            <div className="p-4 rounded-full bg-studio-brand/10 mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-studio-brand" />
            </div>
            <p className="text-sm font-bold text-studio-foreground">Clique para carregar</p>
            <p className="text-xs text-studio-foreground-lighter mt-1 text-center">Formatos suportados: PDF, JPG, PNG, DOCX (Máx. 10MB)</p>
            {file && (
              <Badge variant="success" className="mt-4 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                {file.name}
              </Badge>
            )}
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase text-studio-foreground-lighter tracking-widest">Título do Documento</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="bg-studio-bg border border-studio-border rounded-xl px-4 py-3 text-sm font-medium w-full outline-none focus:ring-2 focus:ring-studio-brand"
                placeholder="Ex: Certificado de Habilitações"
                required
              />
            </div>

            {scope === 'aluno' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-studio-foreground-lighter tracking-widest">Vincular ao Estudante</label>
                <select
                  value={alunoId}
                  onChange={(e) => setAlunoId(e.target.value)}
                  className="bg-studio-bg border border-studio-border rounded-xl px-4 py-3 text-sm font-medium w-full outline-none focus:ring-2 focus:ring-studio-brand"
                  required
                >
                  <option value="">Selecionar...</option>
                  {filhos.map((f) => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-studio-border/40">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={uploadDoc.isPending} disabled={!titulo.trim() || !file}>
              Finalizar Upload
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
