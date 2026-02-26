import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-[95vw] h-[95vh]',
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null && !el.hasAttribute('aria-hidden')
  )
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const previousActiveRef = useRef<HTMLElement | null>(null)

  // Block scrolling when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Focus trap: keep focus inside modal; on open store previous and focus first input (AutoFocus) or first focusable; on close restore
  useEffect(() => {
    if (open && contentRef.current) {
      previousActiveRef.current = document.activeElement as HTMLElement | null
      const focusable = getFocusableElements(contentRef.current)
      const firstInput = focusable.find((el) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
      const first = firstInput ?? focusable[0]
      if (first) {
        const t = setTimeout(() => first.focus(), 0)
        return () => clearTimeout(t)
      }
    } else if (!open && previousActiveRef.current?.focus) {
      const prev = previousActiveRef.current
      previousActiveRef.current = null
      const t = setTimeout(() => prev.focus(), 0)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !contentRef.current) return
      const focusable = getFocusableElements(contentRef.current)
      if (focusable.length === 0) return
      const current = document.activeElement as HTMLElement
      const currentIndex = focusable.indexOf(current)
      if (e.shiftKey) {
        if (currentIndex <= 0) {
          e.preventDefault()
          focusable[focusable.length - 1].focus()
        }
      } else {
        if (currentIndex === focusable.length - 1 || currentIndex === -1) {
          e.preventDefault()
          focusable[0].focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto pt-24 pb-24">
      {/* Background Overlay */}
      <div
        className="fixed inset-0 bg-studio-bg/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog container */}
      <div
        ref={contentRef}
        className={`relative bg-studio-bg rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-studio-border/50 w-full animate-slide-up flex flex-col max-h-full ${sizeClasses[size]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="px-6 py-5 border-b border-studio-border/50 relative">
          <h2 id="modal-title" className="text-lg font-semibold text-studio-foreground pr-8">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-studio-foreground-line text-studio-foreground-light">
              {description}
            </p>
          )}

          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-studio-foreground-lighter hover:text-studio-foreground hover:bg-studio-muted p-1.5 rounded-lg transition-colors focus:ring-2 focus:ring-studio-brand focus:outline-none"
            aria-label="Encerrar Modal"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 bg-studio-muted/30 border-t border-studio-border/50 rounded-b-xl flex items-center justify-end gap-3 rounded-b-[calc(0.75rem-1px)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
