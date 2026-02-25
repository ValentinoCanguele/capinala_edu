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
import Financas from './pages/Financas'
import FinancasDashboard from './pages/FinancasDashboard'
import FinancasLancamentos from './pages/FinancasLancamentos'
import FinancasCategorias from './pages/FinancasCategorias'
import FinancasConfiguracao from './pages/FinancasConfiguracao'
import FinancasParcelas from './pages/FinancasParcelas'
import FinancasRelatorios from './pages/FinancasRelatorios'
import Modulos from './pages/Modulos'
import Login from './pages/Login'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-studio-bg-alt text-studio-foreground-lighter">
        A carregar...
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
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
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
        <Route path="definicoes/modulos" element={<Modulos />} />
        <Route path="financas" element={<Financas />}>
          <Route index element={<FinancasDashboard />} />
          <Route path="categorias" element={<FinancasCategorias />} />
          <Route path="lancamentos" element={<FinancasLancamentos />} />
          <Route path="parcelas" element={<FinancasParcelas />} />
          <Route path="configuracao" element={<FinancasConfiguracao />} />
          <Route path="relatorios" element={<FinancasRelatorios />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
