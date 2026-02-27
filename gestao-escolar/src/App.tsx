import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import Layout from './pages/Layout'
import { CommandPalette } from './components/shared/CommandPalette'
import { OfflineIndicator } from './components/shared/OfflineIndicator'

/* Páginas carregadas sob demanda (code-splitting) */
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Alunos = lazy(() => import('./pages/Alunos'))
const Turmas = lazy(() => import('./pages/Turmas'))
const Notas = lazy(() => import('./pages/Notas'))
const Pautas = lazy(() => import('./pages/Pautas'))
const Recuperacao = lazy(() => import('./pages/Recuperacao'))
const Atas = lazy(() => import('./pages/Atas'))
const ConfiguracoesAcademico = lazy(() => import('./pages/ConfiguracoesAcademico'))
const Frequencia = lazy(() => import('./pages/Frequencia'))
const FrequenciaJustificativas = lazy(() => import('./pages/FrequenciaJustificativas'))
const ScannerFrequencia = lazy(() => import('./pages/ScannerFrequencia'))
const Ocorrencias = lazy(() => import('./pages/Ocorrencias'))
const Boletim = lazy(() => import('./pages/Boletim'))
const Horarios = lazy(() => import('./pages/Horarios'))
const Comunicados = lazy(() => import('./pages/Comunicados'))
const Disciplinas = lazy(() => import('./pages/Disciplinas'))
const AnosLetivos = lazy(() => import('./pages/AnosLetivos'))
const Salas = lazy(() => import('./pages/Salas'))
const Auditoria = lazy(() => import('./pages/Auditoria'))
const Perfil = lazy(() => import('./pages/Perfil'))
const MeuBoletim = lazy(() => import('./pages/MeuBoletim'))
const AulasHoje = lazy(() => import('./pages/AulasHoje'))
const Presencas = lazy(() => import('./pages/Presencas'))
const MeusFilhos = lazy(() => import('./pages/MeusFilhos'))
const Arquivos = lazy(() => import('./pages/Arquivos'))
const Utilizadores = lazy(() => import('./pages/Utilizadores'))
const Modulos = lazy(() => import('./pages/Modulos'))
const Matrizes = lazy(() => import('./pages/Matrizes'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Forbidden = lazy(() => import('./pages/Forbidden'))

const Financas = lazy(() => import('./pages/Financas'))
const FinancasDashboard = lazy(() => import('./pages/FinancasDashboard'))
const FinancasCategorias = lazy(() => import('./pages/FinancasCategorias'))
const FinancasLancamentos = lazy(() => import('./pages/FinancasLancamentos'))
const FinancasParcelas = lazy(() => import('./pages/FinancasParcelas'))
const FinancasRelatorios = lazy(() => import('./pages/FinancasRelatorios'))
const FinancasConfiguracao = lazy(() => import('./pages/FinancasConfiguracao'))

function PageLoadFallback() {
  return (
    <div
      className="min-h-[50vh] flex flex-col items-center justify-center gap-4 bg-studio-bg-alt text-studio-foreground-light"
      role="status"
      aria-live="polite"
      aria-label="A carregar página"
    >
      <div className="w-8 h-8 rounded-full border-2 border-studio-border border-t-studio-brand animate-spin" />
      <span className="text-sm">A carregar...</span>
    </div>
  )
}

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
      <OfflineIndicator />
      <CommandPalette />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          className: 'bg-studio-bg border border-studio-border text-studio-foreground shadow-glass rounded-xl font-medium text-sm',
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
            className: 'border-emerald-200 dark:border-emerald-500/30 shadow-glass',
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
            className: 'border-red-200 dark:border-red-500/30 shadow-glass animate-shake',
            duration: 6000,
          }
        }}
      />
      <Routes>
        <Route
          path="/login"
          element={
            <Suspense fallback={<PageLoadFallback />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/403"
          element={
            <Suspense fallback={<PageLoadFallback />}>
              <Forbidden />
            </Suspense>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="alunos"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Alunos />
              </Suspense>
            }
          />
          <Route
            path="turmas"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Turmas />
              </Suspense>
            }
          />
          <Route
            path="notas"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Notas />
              </Suspense>
            }
          />
          <Route
            path="pautas"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Pautas />
              </Suspense>
            }
          />
          <Route
            path="recuperacao"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Recuperacao />
              </Suspense>
            }
          />
          <Route
            path="atas"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Atas />
              </Suspense>
            }
          />
          <Route
            path="configuracoes"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <ConfiguracoesAcademico />
              </Suspense>
            }
          />
          <Route
            path="frequencia"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Frequencia />
              </Suspense>
            }
          />
          <Route
            path="frequencia/scanner"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <ScannerFrequencia />
              </Suspense>
            }
          />
          <Route
            path="frequencia/justificativas"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <FrequenciaJustificativas />
              </Suspense>
            }
          />
          <Route
            path="boletim"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Boletim />
              </Suspense>
            }
          />
          <Route
            path="ocorrencias"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Ocorrencias />
              </Suspense>
            }
          />
          <Route
            path="horarios"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Horarios />
              </Suspense>
            }
          />
          <Route
            path="comunicados"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Comunicados />
              </Suspense>
            }
          />
          <Route
            path="disciplinas"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Disciplinas />
              </Suspense>
            }
          />
          <Route
            path="anos-letivos"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <AnosLetivos />
              </Suspense>
            }
          />
          <Route
            path="salas"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Salas />
              </Suspense>
            }
          />
          <Route
            path="matrizes"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Matrizes />
              </Suspense>
            }
          />
          <Route
            path="auditoria"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Auditoria />
              </Suspense>
            }
          />
          <Route
            path="financas"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Financas />
              </Suspense>
            }
          >
            <Route index element={<Navigate to="/financas/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<PageLoadFallback />}>
                  <FinancasDashboard />
                </Suspense>
              }
            />
            <Route
              path="categorias"
              element={
                <Suspense fallback={<PageLoadFallback />}>
                  <FinancasCategorias />
                </Suspense>
              }
            />
            <Route
              path="lancamentos"
              element={
                <Suspense fallback={<PageLoadFallback />}>
                  <FinancasLancamentos />
                </Suspense>
              }
            />
            <Route
              path="parcelas"
              element={
                <Suspense fallback={<PageLoadFallback />}>
                  <FinancasParcelas />
                </Suspense>
              }
            />
            <Route
              path="relatorios"
              element={
                <Suspense fallback={<PageLoadFallback />}>
                  <FinancasRelatorios />
                </Suspense>
              }
            />
            <Route
              path="configuracao"
              element={
                <Suspense fallback={<PageLoadFallback />}>
                  <FinancasConfiguracao />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="modulos"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Modulos />
              </Suspense>
            }
          />
          <Route
            path="perfil"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Perfil />
              </Suspense>
            }
          />
          <Route
            path="meu-perfil"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Perfil />
              </Suspense>
            }
          />
          <Route
            path="aulas-hoje"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <AulasHoje />
              </Suspense>
            }
          />
          <Route
            path="meu-boletim"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <MeuBoletim />
              </Suspense>
            }
          />
          <Route
            path="presencas"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Presencas />
              </Suspense>
            }
          />
          <Route
            path="meus-filhos"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <MeusFilhos />
              </Suspense>
            }
          />
          <Route
            path="arquivos"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Arquivos />
              </Suspense>
            }
          />
          <Route
            path="utilizadores"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Utilizadores />
              </Suspense>
            }
          />
          <Route
            path="403"
            element={
              <Suspense fallback={<PageLoadFallback />}>
                <Forbidden />
              </Suspense>
            }
          />
        </Route>
        <Route path="*" element={
          <Suspense fallback={<PageLoadFallback />}>
            <NotFound />
          </Suspense>
        } />
      </Routes>
    </>
  )
}
