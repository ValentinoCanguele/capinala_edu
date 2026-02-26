import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

/**
 * Indicador flutuante modo Offline (item 78 do catálogo).
 * Mostra uma barra no topo quando o browser perde ligação à rede.
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 bg-amber-600 text-white py-2 px-4 text-sm font-medium shadow-md animate-fade-in"
      role="alert"
      aria-live="assertive"
    >
      <WifiOff className="w-4 h-4 flex-shrink-0" aria-hidden />
      <span>Sem ligação à rede. Algumas ações podem falhar.</span>
    </div>
  )
}
