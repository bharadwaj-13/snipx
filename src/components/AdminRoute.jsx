import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children }) {
  const { profile, loading } = useAuth()

  if (loading) return null // Wait for auth to load

  if (!profile?.is_admin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
