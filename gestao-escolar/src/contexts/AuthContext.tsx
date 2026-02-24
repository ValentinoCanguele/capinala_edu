import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getToken, setToken as persistToken, clearToken } from '@/lib/auth'
import { api } from '@/api/client'

const ESCOLA_API = '/api/escola'

type Papel = 'admin' | 'direcao' | 'professor' | 'responsavel' | 'aluno'

interface UserInfo {
  papel: Papel
  userId: string
  pessoaId: string
  escolaId: string | null
}

interface AuthContextValue {
  user: UserInfo | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => void
  setToken: (token: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }
    const { data, error } = await api.get<UserInfo>(`${ESCOLA_API}/meu-papel`)
    if (error || !data) {
      clearToken()
      setUser(null)
    } else {
      setUser(data)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      const { data, error } = await api.post<{ token?: string; data?: { token?: string } }>(
        '/api/auth/login',
        { email, password }
      )
      const token = data?.token ?? data?.data?.token
      if (error || !token) {
        return { error: error?.message ?? 'Falha no login' }
      }
      persistToken(token)
      await loadUser()
      return {}
    },
    [loadUser]
  )

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const setToken = useCallback(
    (token: string) => {
      persistToken(token)
      loadUser()
    },
    [loadUser]
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
