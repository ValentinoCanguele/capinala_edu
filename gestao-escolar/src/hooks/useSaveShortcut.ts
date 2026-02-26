import { useEffect, useRef } from 'react'

/**
 * Atalho Cmd+S / Ctrl+S para guardar formulários (Item 22 – Acessibilidade).
 * Só ativo quando enabled (ex.: modal de form aberto).
 * Usa ref para chamar sempre o handler mais recente sem re-registar o listener.
 */
export function useSaveShortcut(onSave: () => void, enabled: boolean) {
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave

  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        onSaveRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled])
}
