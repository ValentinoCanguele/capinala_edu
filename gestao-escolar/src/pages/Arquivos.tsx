import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { useDocumentos, useMeusFilhos } from '@/data/escola/queries'
import { useUploadDocumento, useDeleteDocumento } from '@/data/escola/mutations'
import { getAuthHeader } from '@/lib/auth'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import Modal from '@/components/Modal'
import { TableSkeleton } from '@/components/PageSkeleton'
import { Upload } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

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

  const handleDelete = (id: string) => {
    setItemToDelete(id)
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
    <div>
      <Modal
        title="Eliminar documento"
        open={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        size="sm"
      >
        <p className="text-sm text-studio-foreground-light mb-4">
          Tem a certeza que deseja eliminar este documento? Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setItemToDelete(null)} className="btn-secondary">Cancelar</button>
          <button type="button" onClick={confirmDelete} disabled={deleteDoc.isPending} className="btn-primary bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">
            {deleteDoc.isPending ? 'A eliminar...' : 'Eliminar'}
          </button>
        </div>
      </Modal>

      <PageHeader
        title="Arquivos"
        subtitle="Documentos associados à sua conta ou aos seus filhos."
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Enviar
          </button>
        }
      />

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="label">Ver documentos de</label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as 'pessoa' | 'aluno')}
            className="input min-w-[160px]"
          >
            <option value="pessoa">Os meus</option>
            <option value="aluno">Do aluno</option>
          </select>
        </div>
        {scope === 'aluno' && (
          <div>
            <label className="label">Aluno</label>
            <select
              value={alunoId}
              onChange={(e) => setAlunoId(e.target.value)}
              className="input min-w-[200px]"
            >
              <option value="">Selecionar</option>
              {filhos.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : documentos.length === 0 ? (
          <EmptyState
            title="Nenhum documento"
            description="Envie um documento usando o botão Enviar."
            action={
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="btn-primary"
              >
                Enviar documento
              </button>
            }
          />
        ) : (
          <table className="min-w-full divide-y divide-studio-border">
            <thead className="bg-studio-muted/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">Título / Ficheiro</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">Tipo</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-studio-foreground-lighter uppercase">Tamanho</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-studio-foreground-lighter uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-studio-border">
              {documentos.map((d) => (
                <tr key={d.id} className="hover:bg-studio-muted/30">
                  <td className="px-4 py-2">
                    <span className="text-studio-foreground">{d.titulo}</span>
                    <span className="block text-xs text-studio-foreground-lighter">{d.nomeFicheiro}</span>
                  </td>
                  <td className="px-4 py-2 text-sm text-studio-foreground-light">{d.tipoMime ?? '—'}</td>
                  <td className="px-4 py-2 text-right text-sm text-studio-foreground-light">
                    {d.tamanho != null ? `${(d.tamanho / 1024).toFixed(1)} KB` : '—'}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownload(d.id, d.nomeFicheiro)}
                      className="link-action link-action-primary mr-2"
                    >
                      Descarregar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(d.id)}
                      className="link-action link-action-danger"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Enviar documento">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="label">Título *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="input w-full"
              placeholder="Ex: Certificado"
              required
            />
          </div>
          {scope === 'aluno' && (
            <div>
              <label className="label">Aluno</label>
              <select
                value={alunoId}
                onChange={(e) => setAlunoId(e.target.value)}
                className="input w-full"
                required
              >
                <option value="">Selecionar</option>
                {filhos.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="label">Ficheiro *</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="input w-full"
            />
            {file && <p className="text-sm text-studio-foreground-light mt-1">{file.name}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={uploadDoc.isPending || !titulo.trim() || !file}>
              {uploadDoc.isPending ? 'A enviar...' : 'Enviar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
