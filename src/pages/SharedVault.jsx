import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getCollectionByToken, getSnippetsByCollectionId } from '../services/collections'
import SnippetCard from '../components/SnippetCard'
import { LuFolder, LuTerminal, LuArrowRight, LuLock, LuCopy, LuCheck } from 'react-icons/lu'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

import Logo from '../components/Logo'

export default function SharedVault() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [collection, setCollection] = useState(null)
  const [snippets, setSnippets] = useState([])
  const [loading, setLoading] = useState(true)
  const [forking, setForking] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

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

  useEffect(() => {
    if (!user && !loading && !notFound) {
      const timer = setTimeout(() => setShowPaywall(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [user, loading, notFound])

  const isOwner = user && collection && user.id === collection.user_id

  async function handleForkVault() {
    if (!user || !collection || isSaved) return
    setForking(true)
    try {
      // 1. Create a new collection for the user
      const { data: newCol, error: colErr } = await supabase.from('collections').insert({
        name: `${collection.name} (Forked)`,
        description: collection.description,
        user_id: user.id,
        is_public: false
      }).select().single()

      if (colErr) throw colErr

      // 2. Clone all snippets into this collection
      const snippetsToClone = snippets.map(s => ({
        title: s.title,
        description: s.description,
        code: s.code,
        language: s.language,
        user_id: user.id,
        collection_id: newCol.id,
        visibility: 'private',
        tags: s.tags,
        code_preview: s.code_preview
      }))

      if (snippetsToClone.length > 0) {
        const { error: snipErr } = await supabase.from('snippets').insert(snippetsToClone)
        if (snipErr) throw snipErr
      }

      setIsSaved(true)
    } catch (err) {
      alert('Error forking vault: ' + err.message)
    } finally {
      setForking(false)
    }
  }

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
      <nav style={{ position: 'sticky', top: 0, height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 100 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Logo size={20} />
          <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Snipx.</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
            onClick={user ? (isOwner ? () => navigate('/collections') : (isSaved ? () => navigate('/collections') : handleForkVault)) : () => {
              sessionStorage.setItem('snipx_redirect', window.location.pathname)
              navigate('/login')
            }} 
            disabled={forking}
            style={{ 
              display: 'inline-block', background: 'var(--text-primary)', 
              color: 'var(--bg-primary)', 
              padding: '10px 24px', borderRadius: '100px', fontWeight: 800, textDecoration: 'none',
              border: 'none', cursor: 'pointer', fontSize: '13px',
              boxShadow: isSaved ? '0 0 20px rgba(255,255,255,0.2)' : 'none',
              opacity: forking ? 0.7 : 1
            }}>
            {user ? (isOwner ? 'Manage Vault' : (forking ? 'FORKING...' : (isSaved ? 'GO TO VAULT →' : 'Fork to My Vault'))) : 'Connect to build your vault →'}
          </button>
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

      {/* Timed Paywall Trap */}
      {showPaywall && (
        <div style={{ 
          position: 'fixed', inset: 0, zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.8s ease-out forwards'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }} />
          <div style={{ 
            position: 'relative', width: '90%', maxWidth: '500px', 
            background: '#111', border: '1px solid #333', borderRadius: '32px',
            padding: '60px 40px', textAlign: 'center',
            boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
            animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #333, #000)', border: '1px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
              <LuLock size={32} style={{ color: '#fff' }} />
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '16px', color: '#fff' }}>Access Restricted</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.6, marginBottom: '40px' }}>
              This curated collection contains high-value patterns. Connect your vault to clone all {snippets.length} snippets instantly.
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
              Connect to Vault
            </Link>
          </div>
        </div>
      )}

      <style>{`
        .spin { animation: rotate 2s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  )
}
