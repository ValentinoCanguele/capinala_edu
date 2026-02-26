import { useEffect, useState, useRef } from 'react'

/**
 * Hook para gravar automaticamente rascunhos de formulários
 * SaaS Feature de topo: Previne perdas de dados quando o browser fecha acidentalmente
 * 
 * @param key Identificador único no localStorage (ex: 'form-notas-turma-A')
 * @param initialData Estado inicial
 * @param delay MS antes de gravar no Storage (debounce)
 */
export function useAutoSave<T>(key: string, initialData: T, delay: number = 1000) {
    const [data, setData] = useState<T>(() => {
        try {
            const saved = localStorage.getItem(key)
            return saved ? JSON.parse(saved) : initialData
        } catch {
            return initialData
        }
    })

    const [isSaving, setIsSaving] = useState(false)
    const isFirstRender = useRef(true)

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        setIsSaving(true)
        const handler = setTimeout(() => {
            try {
                localStorage.setItem(key, JSON.stringify(data))
            } catch (err) {
                console.error('Erro ao guardar rascunho', err)
            } finally {
                setIsSaving(false)
            }
        }, delay)

        return () => clearTimeout(handler)
    }, [data, key, delay])

    const clearDraft = () => {
        localStorage.removeItem(key)
        setData(initialData)
    }

    return { data, setData, isSaving, clearDraft }
}
