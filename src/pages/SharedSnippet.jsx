import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getSnippetByToken } from '../services/snippets'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import CodeBlock from '../components/CodeBlock'
import Logo from '../components/Logo'

export default function SharedSnippet() {
  const { token } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [snippet, setSnippet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copying, setCopying] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await getSnippetByToken(token)
      if (error || !data) setNotFound(true)
      else {
        setSnippet(data)
      }
      setLoading(false)
    }
    load()
  }, [token])

  // Timed Trap Logic: Appear after 2.5 seconds if guest
  useEffect(() => {
    if (!user && !loading && !notFound) {
      const timer = setTimeout(() => {
        setShowOverlay(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [user, loading, notFound])

  const [isSaved, setIsSaved] = useState(false)

  async function handleSaveToVault() {
    if (!user || !snippet || isSaved) return
    setLoading(true)
    try {
      const { error } = await supabase.from('snippets').insert({
        title: snippet.title,
        description: snippet.description,
        code: snippet.code,
        language: snippet.language,
        user_id: user.id,
        visibility: 'private',
        tags: snippet.tags,
        code_preview: snippet.code_preview
      })
      if (error) throw error
      setIsSaved(true)
    } catch (err) {
      alert('Error saving: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!user) return 
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

  const isOwner = user && user.id === snippet.user_id

  return (
    <div style={{ 
      minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)',
      position: 'relative', overflow: 'hidden' 
    }}>

      {/* Timed Glassy Login Wall */}
      {!user && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          backdropFilter: showOverlay ? 'blur(10px)' : 'none',
          WebkitBackdropFilter: showOverlay ? 'blur(10px)' : 'none',
          background: showOverlay ? 'rgba(0,0,0,0.6)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: showOverlay ? 'auto' : 'none',
          opacity: showOverlay ? 1 : 0
        }}>
          <div style={{
            background: 'rgba(30,30,30,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px', padding: '48px 32px',
            maxWidth: '400px', width: '100%', textAlign: 'center',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
            transform: showOverlay ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-1px' }}>Unlock the code.</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.6, marginBottom: '40px' }}>
              You found it! Connect your vault to read the full code and save it in your vault
            </p>
            <Link 
              to="/login" 
              onClick={() => sessionStorage.setItem('snipx_redirect', window.location.pathname)}
              style={{ 
                display: 'block', background: '#fff', color: '#000', 
                padding: '18px 32px', borderRadius: '100px', fontWeight: 900, textDecoration: 'none',
                fontSize: '14px', letterSpacing: '0.05em', transition: 'all 0.2s',
                boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Sign-in
            </Link>
          </div>
        </div>
      )}

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
          {!user && (
            <Link 
              to="/login" 
              onClick={() => sessionStorage.setItem('snipx_redirect', window.location.pathname)}
              style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}
            >
              Login
            </Link>
          )}
          <button 
            onClick={user ? (isOwner ? () => navigate(`/snippet/${snippet.id}`) : (isSaved ? () => navigate('/dashboard') : handleSaveToVault)) : () => {
              sessionStorage.setItem('snipx_redirect', window.location.pathname)
              navigate('/login')
            }} 
            style={{ 
              display: 'inline-block', background: 'var(--text-primary)', 
              color: 'var(--bg-primary)', 
              padding: '12px 32px', borderRadius: '100px', fontWeight: 800, textDecoration: 'none',
              border: 'none', cursor: 'pointer',
              boxShadow: isSaved ? '0 0 20px rgba(255,255,255,0.2)' : 'none'
            }}>
            {user ? (isOwner ? 'Edit Snippet' : (isSaved ? 'GO TO VAULT →' : 'Save to Vault')) : 'Connect to Snipx'}
          </button>
      </nav>
 
      <div style={{ 
        maxWidth: '1000px', margin: '0 auto', padding: '80px 40px',
        pointerEvents: (showOverlay && !user) ? 'none' : 'auto',
        transition: 'filter 0.8s ease',
        filter: (showOverlay && !user) ? 'blur(6px)' : 'none'
      }}>
  
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'monospace' }}>SOURCE_ENV_READ_ONLY</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
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