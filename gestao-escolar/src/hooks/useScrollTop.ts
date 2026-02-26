import { useState, useEffect, useCallback } from 'react'

const VISIBILITY_THRESHOLD_PX = 400

/**
 * Hook para botão "Voltar ao topo" em listas longas.
 * showBackToTop fica true após o utilizador fazer scroll para baixo.
 */
export function useScrollTop(containerRef?: React.RefObject<HTMLElement | null>) {
  const [showBackToTop, setShowBackToTop] = useState(false)

  const scrollToTop = useCallback(() => {
    const el = containerRef?.current ?? document.documentElement
    el.scrollTo({ top: 0, behavior: 'smooth' })
  }, [containerRef])

  useEffect(() => {
    const el = containerRef?.current
    const target: EventTarget = el ?? window
    const handleScroll = () => {
      const scrollTop = el?.scrollTop ?? window.scrollY ?? document.documentElement.scrollTop
      setShowBackToTop(scrollTop > VISIBILITY_THRESHOLD_PX)
    }
    target.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => target.removeEventListener('scroll', handleScroll)
  }, [containerRef])

  return { showBackToTop, scrollToTop }
}
