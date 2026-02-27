import { useState, useEffect, useRef, type RefObject } from 'react'
import { ArrowUp } from 'lucide-react'

const SCROLL_THRESHOLD = 400

interface ScrollToTopProps {
  /** Ref do contentor com overflow (ex.: área do Outlet). Se não for passado, usa window. */
  scrollRef?: RefObject<HTMLDivElement | null>
  className?: string
}

/**
 * Botão flutuante "Voltar ao topo" (Item 70 — Refinamento Frontend).
 * Aparece após deslizar para baixo; faz scroll suave para o topo do contentor.
 */
export function ScrollToTop({ scrollRef, className = '' }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const el = scrollRef?.current ?? (typeof document !== 'undefined' ? document.documentElement : null)
    if (!el) return

    const handleScroll = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const scrollTop = el === document.documentElement ? window.scrollY : (el as HTMLDivElement).scrollTop
        setVisible(scrollTop > SCROLL_THRESHOLD)
        rafRef.current = null
      })
    }

    if (el === document.documentElement) {
      window.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll()
      return () => {
        window.removeEventListener('scroll', handleScroll)
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      }
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      el.removeEventListener('scroll', handleScroll)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [scrollRef])

  const scrollToTop = () => {
    const el = scrollRef?.current ?? document.documentElement
    if (el === document.documentElement) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      ;(el as HTMLDivElement).scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`no-print fixed bottom-6 right-6 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-studio-brand text-white shadow-lg transition-opacity hover:bg-studio-brand-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-bg ${className}`}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}
