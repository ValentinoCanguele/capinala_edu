import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Sun, Moon, Mail, Lock, LogIn } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-studio-bg-alt">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-studio-foreground-light hover:bg-studio-muted hover:text-studio-foreground transition-colors"
          title={theme === 'dark' ? 'Mudar para claro' : 'Mudar para escuro'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm p-6 rounded-xl border border-studio-border bg-studio-bg shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-studio-brand/20 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-studio-brand" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-studio-foreground">Gestão Escolar</h1>
              <p className="text-studio-foreground-light text-sm">Entre com o seu email e senha.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg text-sm bg-red-500/10 text-red-600 border border-red-500/20 flex items-center gap-2" role="alert">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-studio-foreground mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-studio-foreground-lighter pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input w-full pl-9"
                  placeholder="admin@escola.demo"
                />
              </div>
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-studio-foreground mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-studio-foreground-lighter pointer-events-none" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input w-full pl-9"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-studio-brand hover:bg-studio-brand-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'A entrar...' : 'Entrar'}
            </button>
          </form>
          <p className="text-studio-foreground-lighter text-xs mt-4">
            Demo: admin@escola.demo / admin123
          </p>
        </div>
      </div>
    </div>
  )
}
