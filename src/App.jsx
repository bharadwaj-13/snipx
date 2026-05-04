import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import NewSnippet from './pages/NewSnippet'
import SnippetDetail from './pages/SnippetDetail'
import EditSnippet from './pages/EditSnippet'
import SharedSnippet from './pages/SharedSnippet'
import SharedVault from './pages/SharedVault'
import Collections from './pages/Collections'
import Landing from './pages/Landing'
import Explore from './pages/Explore'
import Profile from './pages/Profile'
import PublicProfile from './pages/PublicProfile'
import Settings from './pages/Settings'
import Import from './pages/Import'
import ResetPassword from './pages/ResetPassword'
import AdminControl from './pages/AdminControl'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import AdminRoute from './components/AdminRoute'
import MobileOnly from './components/MobileOnly'

function ProtectedWithLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

function AuthRedirectSentry({ children }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (user && !loading) {
      const pendingRedirect = sessionStorage.getItem('snipx_redirect')
      if (pendingRedirect) {
        console.log('Global Sentry: Pending redirect found:', pendingRedirect)
        
        // If we land on a "generic" landing spot (Dashboard, Login, or Signup),
        // instantly pull the user back to their intended snippet.
        const isGenericSpot = location.pathname === '/dashboard' || 
                             location.pathname === '/login' || 
                             location.pathname === '/signup' ||
                             location.pathname === '/'

        if (isGenericSpot) {
          sessionStorage.removeItem('snipx_redirect')
          console.log('Global Sentry: Executing redirect to:', pendingRedirect)
          navigate(pendingRedirect, { replace: true })
        }
      }
    }
  }, [user, loading, navigate, location])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-spin" style={{ width: '24px', height: '24px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
      </div>
    )
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AuthRedirectSentry>
            <MobileOnly />
            <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/s/:token" element={<SharedSnippet />} />
            <Route path="/v/:token" element={<SharedVault />} />
            <Route path="/explore" element={<AppLayout><Explore /></AppLayout>} />
            <Route path="/dashboard" element={<ProtectedWithLayout><Dashboard /></ProtectedWithLayout>} />
            <Route path="/profile" element={<ProtectedWithLayout><Profile /></ProtectedWithLayout>} />
            <Route path="/profile/:username" element={<AppLayout><PublicProfile /></AppLayout>} />
            <Route path="/new" element={<ProtectedWithLayout><NewSnippet /></ProtectedWithLayout>} />
            <Route path="/snippet/:id" element={<ProtectedWithLayout><SnippetDetail /></ProtectedWithLayout>} />
            <Route path="/edit/:id" element={<ProtectedWithLayout><EditSnippet /></ProtectedWithLayout>} />
            <Route path="/collections" element={<ProtectedWithLayout><Collections /></ProtectedWithLayout>} />
            <Route path="/settings" element={<ProtectedWithLayout><Settings /></ProtectedWithLayout>} />
            <Route path="/import" element={<ProtectedWithLayout><Import /></ProtectedWithLayout>} />
            <Route path="/admin-vault-control" element={
              <AdminRoute>
                <ProtectedWithLayout><AdminControl /></ProtectedWithLayout>
              </AdminRoute>
            } />
            <Route path="/super-admin-hq" element={
              <AdminRoute>
                <ProtectedWithLayout><SuperAdminDashboard /></ProtectedWithLayout>
              </AdminRoute>
            } />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthRedirectSentry>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App