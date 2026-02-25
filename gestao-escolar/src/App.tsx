import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import Alunos from './pages/Alunos'
import Turmas from './pages/Turmas'
import Notas from './pages/Notas'
import Frequencia from './pages/Frequencia'
import Boletim from './pages/Boletim'
import Horarios from './pages/Horarios'
import Comunicados from './pages/Comunicados'
import Disciplinas from './pages/Disciplinas'
import AnosLetivos from './pages/AnosLetivos'
import Salas from './pages/Salas'
import Auditoria from './pages/Auditoria'
import Perfil from './pages/Perfil'
import MeuBoletim from './pages/MeuBoletim'
import Presencas from './pages/Presencas'
import MeusFilhos from './pages/MeusFilhos'
import Arquivos from './pages/Arquivos'
import Utilizadores from './pages/Utilizadores'
import Login from './pages/Login'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 bg-studio-bg-alt text-studio-foreground-light"
        role="status"
        aria-live="polite"
        aria-label="A carregar"
      >
        <div className="w-8 h-8 rounded-full border-2 border-studio-border border-t-studio-brand animate-spin" />
        <span className="text-sm">A carregar...</span>
      </div>
    )
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          className: 'bg-studio-bg border border-studio-border text-studio-foreground shadow-lg',
        }}
      />
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="alunos" element={<Alunos />} />
        <Route path="turmas" element={<Turmas />} />
        <Route path="notas" element={<Notas />} />
        <Route path="frequencia" element={<Frequencia />} />
        <Route path="boletim" element={<Boletim />} />
        <Route path="horarios" element={<Horarios />} />
        <Route path="comunicados" element={<Comunicados />} />
        <Route path="disciplinas" element={<Disciplinas />} />
        <Route path="anos-letivos" element={<AnosLetivos />} />
        <Route path="salas" element={<Salas />} />
        <Route path="auditoria" element={<Auditoria />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="meu-boletim" element={<MeuBoletim />} />
        <Route path="presencas" element={<Presencas />} />
        <Route path="meus-filhos" element={<MeusFilhos />} />
        <Route path="arquivos" element={<Arquivos />} />
        <Route path="utilizadores" element={<Utilizadores />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
