/**
 * Sincroniza estado com os query params da URL (filtros, ordenação, página).
 * Permite partilhar links com filtros e usar voltar/avançar do browser.
 */

import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Lê e escreve um único query param como string.
 * @param key Nome do param (ex.: "q", "sort", "page")
 * @param defaultValue Valor quando o param está ausente
 */
export function useQueryState(
  key: string,
  defaultValue: string = ''
): [string, (value: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams()

  const value = searchParams.get(key) ?? defaultValue

  const setValue = useCallback(
    (next: string) => {
      setSearchParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev)
          if (next === '' || next === defaultValue) {
            nextParams.delete(key)
          } else {
            nextParams.set(key, next)
          }
          return nextParams
        },
        { replace: true }
      )
    },
    [key, defaultValue, setSearchParams]
  )

  return [value, setValue]
}

/**
 * Lê e escreve vários query params de uma vez (ex.: filtros de lista).
 * @param keys Array de chaves a ler; valores ausentes ficam como ""
 */
export function useQueryStateMulti(
  keys: string[]
): [Record<string, string>, (updates: Record<string, string>) => void] {
  const [searchParams, setSearchParams] = useSearchParams()

  const state = useMemo(() => {
    const out: Record<string, string> = {}
    for (const k of keys) {
      out[k] = searchParams.get(k) ?? ''
    }
    return out
  }, [keys.join(','), searchParams])

  const setState = useCallback(
    (updates: Record<string, string>) => {
      setSearchParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev)
          for (const [k, v] of Object.entries(updates)) {
            if (v === '') nextParams.delete(k)
            else nextParams.set(k, v)
          }
          return nextParams
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  return [state, setState]
}

/**
 * Lê um param numérico (ex.: page, pageSize). Devolve número ou default.
 */
export function useQueryStateNumber(
  key: string,
  defaultValue: number
): [number, (value: number) => void] {
  const [str, setStr] = useQueryState(key, String(defaultValue))
  const num = useMemo(() => {
    const n = parseInt(str, 10)
    return Number.isNaN(n) ? defaultValue : n
  }, [str, defaultValue])
  const setNum = useCallback(
    (n: number) => setStr(n === defaultValue ? '' : String(n)),
    [defaultValue, setStr]
  )
  return [num, setNum]
}
