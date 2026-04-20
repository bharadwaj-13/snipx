import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import SnippetCard from '../components/SnippetCard'
import { LuGlobe, LuSearch } from 'react-icons/lu'

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'rust',
  'go', 'css', 'html', 'sql', 'bash', 'json'
]

export default function Explore() {
  const [snippets, setSnippets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterLang, setFilterLang] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('snipx_view_mode') || 'grid')
  const [profiles, setProfiles] = useState([])

  const changeViewMode = (mode) => {
    setViewMode(mode)
    localStorage.setItem('snipx_view_mode', mode)
  }

  useEffect(() => {
    async function loadPublicSnippets() {
      setLoading(true)
      try {
        let query = supabase
          .from('snippets')
          .select('*, profiles(username, avatar_url)')
          .eq('visibility', 'public')

        if (sortBy === 'newest') query = query.order('created_at', { ascending: false })
        else if (sortBy === 'oldest') query = query.order('created_at', { ascending: true })
        else query = query.order('created_at', { ascending: false })

        const { data, error } = await query.limit(100)
        if (error) throw error
        setSnippets(data || [])
      } catch (error) {
        console.error('Error loading public snippets:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPublicSnippets()
  }, [sortBy])

  useEffect(() => {
    if (!search || search.length < 2) { setProfiles([]); return }
    const t = setTimeout(async () => {
      const { data } = await supabase.from('profiles').select('*').ilike('username', `%${search}%`).limit(8)
      setProfiles(data || [])
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const filtered = useMemo(() => {
    return snippets.filter(s => {
      const combined = (s.title + (s.description || '') + s.code + (s.profiles?.username || '')).toLowerCase()
      if (search && !combined.includes(search.toLowerCase())) return false
      if (filterLang && s.language !== filterLang) return false
      return true
    })
  }, [snippets, search, filterLang])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', position: 'relative' }}>

      {/* Standardized Atmospheric Glow */}
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0.04, transparent 60%)', filter: 'blur(100px)', zIndex: 0, opacity: 1, pointerEvents: 'none' }} />

      <div style={{ padding: '60px 48px', position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto' }}>

        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-2px', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            Explore.
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: 0, fontWeight: 500, opacity: 0.6 }}>
            Discover and learn from {snippets.length} public patterns in the global network.
          </p>
        </header>

        {/* Themed Command Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
          background: 'var(--bg-secondary)', backdropFilter: 'blur(20px)',
          border: '1px solid var(--border)', borderRadius: '20px',
          padding: '12px 16px', marginBottom: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <LuSearch size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px' }} />
            <input
              type="text"
              placeholder="Browse profiles or snippets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', background: 'transparent', border: 'none', padding: '12px 16px 12px 48px',
                color: 'var(--text-primary)', fontSize: '15px', outline: 'none'
              }}
            />
          </div>

          <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 12px' }}>
            {search && (
              <button onClick={() => setSearch('')}
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700, padding: '6px 12px', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase' }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--text-muted)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                Clear Results
              </button>
            )}
          </div>

          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '100px', padding: '4px', marginLeft: 'auto' }}>
            {[['grid', 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z'], ['list', 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01']].map(([mode, path]) => (
              <button key={mode} onClick={() => changeViewMode(mode)} style={{
                background: viewMode === mode ? 'var(--bg-primary)' : 'transparent',
                border: 'none', padding: '6px 10px', borderRadius: '100px', cursor: 'pointer',
                color: viewMode === mode ? 'var(--text-primary)' : 'var(--text-muted)', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={path} /></svg>
              </button>
            ))}
          </div>
        </div>

        {/* Content Render Tree */}
        <div>
          {!loading && profiles.length > 0 && (
            <div style={{ marginBottom: '48px', animation: 'fade-in 0.4s ease-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-primary)' }} />
                <h2 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)' }}>Profiles Found</h2>
              </div>
              <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }}>
                {profiles.map(p => (
                  <Link
                    key={p.id}
                    to={`/profile/${p.username}`}
                    style={{
                      flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 20px', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                      borderRadius: '16px', textDecoration: 'none', transition: 'all 0.2s'
                    }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--bg-tertiary)' }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)' }}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={p.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>{p.username?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.username}</span>
                  </Link>
                ))}
              </div>
              <div style={{ height: '1px', background: 'var(--border)', margin: '32px 0' }} />
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
              <div className="spin" style={{ color: 'var(--text-muted)' }}>
                <LuGlobe size={32} />
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 20px', border: '1px dashed var(--border)', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>No snippets found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                Try adjusting your search criteria.
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px',
              animation: 'fade-in 0.4s ease-out'
            }}>
              {filtered.map(s => <SnippetCard key={s.id} snippet={s} showAuthor={true} allowDelete={false} allowFork={true} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              {filtered.map(s => <SnippetCard key={s.id} snippet={s} showAuthor={true} listMode={true} allowDelete={false} allowFork={true} />)}
            </div>
          )}
        </div>

      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .spin { animation: rotate 2s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}