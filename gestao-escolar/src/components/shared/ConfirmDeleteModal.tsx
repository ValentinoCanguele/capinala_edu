import { useState, useEffect, useRef } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'

interface ConfirmDeleteModalProps {
    isOpen: boolean
    title: string
    description?: string
    challengeText?: string // Ex: "Turma 10A"
    itemName?: string
    onConfirm: () => void
    onCancel: () => void
}

/**
 * Modal de Confirmação B2B (Premium)
 * Se `challengeText` fornecido, força o utilizador a digitar o nome do item a eliminar
 * para evitar acidentes com itens vitais. (Estilo GitHub/Vercel)
 */
export function ConfirmDeleteModal({
    isOpen,
    title,
    description,
    challengeText,
    itemName = 'este item',
    onConfirm,
    onCancel,
}: ConfirmDeleteModalProps) {
    const [inputValue, setInputValue] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) {
            setInputValue('')
            // Pequeno delay para focar após a transição de abertura do modal
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [isOpen])

    // Fecha o modal ao clicar ESCAPE
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (isOpen && e.key === 'Escape') onCancel()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [isOpen, onCancel])

    if (!isOpen) return null

    const isConfirmed = challengeText ? inputValue === challengeText : true

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
            <div
                className="fixed inset-0 bg-studio-bg/60 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={onCancel}
                aria-hidden="true"
            />
            <div
                className="relative bg-studio-bg rounded-xl shadow-2xl ring-1 ring-studio-border w-full max-w-md overflow-hidden animate-slide-up"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <h2 id="modal-title" className="text-lg font-semibold text-studio-foreground">
                            {title}
                        </h2>
                    </div>
                    <p className="text-sm text-studio-foreground-light mb-4">
                        {description || `Tem a certeza que deseja eliminar ${itemName}? Esta acção não pode ser revertida e irá remover permanentemente os dados associados.`}
                    </p>

                    {challengeText && (
                        <div className="bg-studio-muted/50 p-4 rounded-lg border border-studio-border/50 mb-4">
                            <label
                                htmlFor="challenge-input"
                                className="block text-sm font-medium text-studio-foreground mb-2"
                            >
                                Para confirmar, digite <span className="font-bold text-red-600 select-all">{challengeText}</span> abaixo:
                            </label>
                            <input
                                id="challenge-input"
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="input w-full bg-studio-bg font-mono text-sm placeholder:text-studio-foreground-lighter/50 focus:ring-red-500 focus:border-red-500"
                                placeholder={challengeText}
                                autoComplete="off"
                                spellCheck="false"
                            />
                        </div>
                    )}
                </div>

                <div className="bg-studio-muted/50 px-6 py-4 border-t border-studio-border flex justify-end gap-3 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-secondary"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={!isConfirmed}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all
              ${isConfirmed
                                ? 'bg-red-600 hover:bg-red-700 shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-studio-bg focus:ring-red-500'
                                : 'bg-red-300 cursor-not-allowed opacity-70'}
            `}
                    >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    )
}
