/**
 * Barra de loading global no topo da página (estilo Vercel/NProgress).
 * Anima ao mudar de rota para dar feedback visual de navegação.
 */
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const DURATION_FAST = 300
const DURATION_DONE = 150

export function GlobalLoadingBar() {
  const location = useLocation()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    setProgress(0)

    const t1 = setTimeout(() => setProgress(90), 50)
    const t2 = setTimeout(() => setProgress(100), DURATION_FAST)
    const t3 = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, DURATION_FAST + DURATION_DONE)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [location.pathname])

  if (!visible) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] h-0 overflow-visible pointer-events-none print:hidden"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="A carregar página"
    >
      <div
        className="h-[3px] bg-studio-brand shadow-[0_0_10px_rgba(var(--studio-brand-rgb,59,130,246),0.5)]"
        style={{
          width: `${progress}%`,
          transition: progress <= 90
            ? `width ${DURATION_FAST}ms ease-out`
            : `width ${DURATION_DONE}ms ease-in`,
        }}
      />
    </div>
  )
}
