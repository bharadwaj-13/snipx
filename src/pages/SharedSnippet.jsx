import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSnippetByToken } from '../services/snippets'
import CodeBlock from '../components/CodeBlock'

import Logo from '../components/Logo'

export default function SharedSnippet() {
  const { token } = useParams()
  const [snippet, setSnippet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copying, setCopying] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await getSnippetByToken(token)
      if (error || !data) setNotFound(true)
      else setSnippet(data)
      setLoading(false)
    }
    load()
  }, [token])

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet.code)
    setCopying(true)
    setTimeout(() => setCopying(false), 1500)
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--text-muted)', fontFamily: 'monospace'
    }}>
      loading...
    </div>
  )
 
  if (notFound) return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '1.5rem'
    }}>
      <p style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '1.2rem' }}>vault entry not found</p>
      <Link to="/" style={{ color: 'var(--text-primary)', fontSize: '14px', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
        return to Snipx. →
      </Link>
    </div>
  )
 
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
 
      {/* Minimal navbar */}
      <nav style={{
        background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)',
        padding: '0 2.5rem', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Logo size={22} />
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Snipx.</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>Login</Link>
          <Link to="/login" style={{ 
            display: 'inline-block', background: 'var(--text-primary)', color: 'var(--bg-primary)', 
            padding: '12px 32px', borderRadius: '100px', fontWeight: 800, textDecoration: 'none'
          }}>
            Connect to Snipx
          </Link>
        </div>
      </nav>
 
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 40px' }}>
 
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <span style={{ background: 'var(--bg-tertiary)', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', textTransform: 'capitalize', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>{snippet.language}</span>
            {snippet.profiles?.username && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>by {snippet.profiles.username}</span>}
          </div>
          <h1 style={{
            color: 'var(--text-primary)', fontSize: '2.5rem',
            fontWeight: '800', letterSpacing: '-1px', marginBottom: '12px'
          }}>
            {snippet.title}
          </h1>
          {snippet.description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.6' }}>{snippet.description}</p>
          )}
        </div>
 
        {/* Code Section */}
        <div style={{ 
          position: 'relative', 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--border)', 
          borderRadius: '24px', 
          padding: '32px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.2)'
        }}>
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px'
          }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'monospace' }}>SOURCE_CODE</div>
            <button onClick={handleCopy} style={{
              background: copying ? 'var(--text-primary)' : 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: '8px', padding: '6px 16px',
              color: copying ? 'var(--bg-primary)' : 'var(--text-primary)',
              fontSize: '12px', cursor: 'pointer', fontWeight: 700,
              transition: 'all 0.2s'
            }}>
              {copying ? 'COPIED' : 'COPY'}
            </button>
          </div>
          <CodeBlock code={snippet.code} language={snippet.language} />
        </div>
 
        {/* Footer info for guests */}
        <div style={{ marginTop: '4rem', padding: '40px', background: 'var(--bg-tertiary)', borderRadius: '24px', textAlign: 'center', border: '1px dashed var(--border)' }}>
          <h3 style={{ marginBottom: '12px', fontWeight: 800 }}>Like this logic?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Snipx is a high-performance vault for your architectural patterns. Join the network to save your first snippet.</p>
          <Link to="/login" style={{ 
            display: 'inline-block', background: 'var(--text-primary)', color: 'var(--bg-primary)', 
            padding: '12px 32px', borderRadius: '100px', fontWeight: 800, textDecoration: 'none'
          }}>
            Create your free vault
          </Link>
        </div>
 
      </div>
    </div>
  )
}