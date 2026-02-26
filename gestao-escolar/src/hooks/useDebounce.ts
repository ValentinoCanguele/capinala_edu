import { useState, useEffect } from 'react'

/**
 * Debounce de valor para pesquisa e filtros (Catálogo Item 102).
 * Evita chamadas excessivas à API ou re-filtros a cada tecla.
 * @param value Valor a debounce (ex.: texto do input de pesquisa)
 * @param delayMs Atraso em ms (300–500 recomendado para pesquisa)
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delayMs)
    return () => clearTimeout(t)
  }, [value, delayMs])

  return debouncedValue
}

/**
 * Versão com setter: retorna [valor imediato, valor debounced, setValor].
 * Útil quando o input é controlado pelo mesmo estado que se quer debounce.
 */
export function useDebouncedState<T>(initial: T, delayMs: number): [T, T, (v: T) => void] {
  const [value, setValue] = useState<T>(initial)
  const debounced = useDebounce(value, delayMs)
  return [value, debounced, setValue]
}
