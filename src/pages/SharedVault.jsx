import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCollectionByToken, getSnippetsByCollectionId } from '../services/collections'
import SnippetCard from '../components/SnippetCard'
import { LuFolder, LuTerminal } from 'react-icons/lu'

import Logo from '../components/Logo'

export default function SharedVault() {
  const { token } = useParams()
  const [collection, setCollection] = useState(null)
  const [snippets, setSnippets] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: col, error: colError } = await getCollectionByToken(token)
      if (colError || !col) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setCollection(col)
      const { data: snips } = await getSnippetsByCollectionId(col.id)
      setSnippets(snips || [])
      setLoading(false)
    }
    load()
  }, [token])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spin" style={{ color: 'var(--text-muted)' }}>
          <LuTerminal size={32} />
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>404</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>This shared vault does not exist or has been restricted.</p>
        <Link to="/" className="btn btn-ghost">Back to Home</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', position: 'relative' }}>
      {/* Background Ambience */}
      <div style={{ position: 'fixed', top: 0, right: 0, width: '500px', height: '500px', background: 'radial-gradient(circle, var(--text-muted) 0.05, transparent 70%)', filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none', opacity: 0.2 }} />
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 0, pointerEvents: 'none' }} />

      {/* Minimal Nav */}
      <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Logo size={20} />
          <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Snipx.</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>Login</Link>
          <Link to="/signup" style={{
            background: 'var(--text-primary)', color: 'var(--bg-primary)',
            borderRadius: '100px', padding: '10px 24px',
            fontSize: '13px', textDecoration: 'none', fontWeight: 800
          }}>
            Sign up to see all contents →
          </Link>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '160px 40px' }}>
        
        <header style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
             <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LuFolder size={24} />
             </div>
             <div>
                <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1.5px', margin: 0 }}>{collection.name}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                   Shared by <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{collection.profiles?.username || 'Architect'}</span>
                </p>
             </div>
          </div>
          {collection.description && <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', lineHeight: 1.6 }}>{collection.description}</p>}
        </header>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-primary)' }} />
            <h2 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)' }}>Shared Patterns ({snippets.length})</h2>
          </div>

          {snippets.length === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '24px', color: 'var(--text-secondary)' }}>
              This vault is currently empty.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {snippets.map(s => (
                <SnippetCard key={s.id} snippet={s} allowDelete={false} allowFork={true} />
              ))}
            </div>
          )}
        </section>
      </div>

      <style>{`
        .spin { animation: rotate 2s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
