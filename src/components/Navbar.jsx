import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <nav style={{
      background: '#161b22', borderBottom: '1px solid #30363d',
      padding: '0 1.5rem', height: '56px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <span style={{
          fontFamily: 'monospace', fontSize: '1.2rem',
          color: '#58a6ff', letterSpacing: '-0.5px', fontWeight: '600'
        }}>snipx</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to="/collections" style={{
          color: '#8b949e', fontSize: '13px',
          textDecoration: 'none', padding: '0.4rem 0.5rem',
        }}>
          collections
        </Link>
        <Link to="/new" style={{
          background: '#238636', border: '1px solid #2ea043',
          borderRadius: '8px', padding: '0.4rem 0.875rem',
          color: '#fff', fontSize: '13px', fontWeight: '500',
          textDecoration: 'none',
        }}>
          + new snippet
        </Link>
        <div
          onClick={handleSignOut}
          title={`${profile?.username} — click to sign out`}
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: '#58a6ff22', border: '1px solid #58a6ff44',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#58a6ff', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
          }}
        >
          {profile?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
      </div>
    </nav>
  )
}