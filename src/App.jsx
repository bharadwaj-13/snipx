import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
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
import Collections from './pages/Collections'
import Landing from './pages/Landing'
import Explore from './pages/Explore'
import Profile from './pages/Profile'
import PublicProfile from './pages/PublicProfile'
import Settings from './pages/Settings'
import Import from './pages/Import'
import ResetPassword from './pages/ResetPassword'

function ProtectedWithLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/s/:token" element={<SharedSnippet />} />
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
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App