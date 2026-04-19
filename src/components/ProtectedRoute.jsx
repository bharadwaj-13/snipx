import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0d1117'
    }}>
      <div style={{ color: '#8b949e', fontFamily: 'monospace' }}>loading...</div>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  return children
}