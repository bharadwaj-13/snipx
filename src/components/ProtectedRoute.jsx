import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#000'
    }}>
      <div className="animate-spin" style={{ width: '24px', height: '24px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  return children
}