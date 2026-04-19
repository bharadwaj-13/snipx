import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) { setError(error.message); setLoading(false) }
    else navigate('/dashboard')
  }

  const inputStyle = {
    width: '100%', background: '#0d1117', border: '1px solid #30363d',
    borderRadius: '8px', padding: '0.6rem 0.875rem',
    color: '#e6edf3', fontSize: '14px', outline: 'none',
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0d1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'monospace', fontSize: '1.8rem', color: '#58a6ff', letterSpacing: '-1px' }}>
            snipx
          </h1>
          <p style={{ color: '#8b949e', marginTop: '0.5rem', fontSize: '14px' }}>sign in to your vault</p>
        </div>

        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{
                background: '#2d1117', border: '1px solid #f7816630',
                borderRadius: '8px', padding: '0.75rem 1rem',
                color: '#f78166', fontSize: '13px'
              }}>{error}</div>
            )}
            <div>
              <label style={{ display: 'block', color: '#8b949e', fontSize: '13px', marginBottom: '6px' }}>email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#8b949e', fontSize: '13px', marginBottom: '6px' }}>password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••" style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', background: '#238636', border: '1px solid #2ea043',
              borderRadius: '8px', padding: '0.65rem', color: '#fff',
              fontSize: '14px', fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'signing in...' : 'sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#8b949e', fontSize: '13px' }}>
          no account?{' '}
          <Link to="/signup" style={{ color: '#58a6ff', textDecoration: 'none' }}>sign up</Link>
        </p>
      </div>
    </div>
  )
}