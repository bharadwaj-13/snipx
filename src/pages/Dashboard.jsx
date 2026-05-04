import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSnippets } from '../services/snippets'
import { getCollections } from '../services/collections'
import { LuArchive, LuFolder, LuGlobe, LuLock, LuPlus, LuZap, LuClock, LuArrowLeft, LuShieldCheck } from 'react-icons/lu'
import SnippetCard from '../components/SnippetCard'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [snippets, setSnippets] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterVisibility, setFilterVisibility] = useState('')
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('snipx_view_mode') || 'grid')

  const changeViewMode = (mode) => {
    setViewMode(mode)
    localStorage.setItem('snipx_view_mode', mode)
  }
  const filterCollection = searchParams.get('collection') ?? ''

  useEffect(() => {
    async function load() {
      const [{ data: s }, { data: c }] = await Promise.all([
        getSnippets(user.id),
        getCollections(user.id),
      ])
      setSnippets(s ?? [])
      setCollections(c ?? [])
      setLoading(false)
    }
    load()
  }, [user.id])

  const filtered = useMemo(() => {
    return snippets.filter(s => {
      if (search && !s.title.toLowerCase().includes(search.toLowerCase()) &&
        !s.description?.toLowerCase().includes(search.toLowerCase()) &&
        !s.code.toLowerCase().includes(search.toLowerCase())) return false
      if (filterCollection && s.collection_id !== filterCollection) return false
      if (filterVisibility && s.visibility !== filterVisibility) return false
      return true
    })
  }, [snippets, search, filterCollection, filterVisibility])

  function handleDelete(id) {
    setSnippets(prev => prev.filter(s => s.id !== id))
  }

  const activeCollection = collections.find(c => c.id === filterCollection)

  const displayName = profile?.username || user?.email?.split('@')[0] || 'Architect'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', position: 'relative' }}>

      {/* Standardized Atmospheric Glow */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0.05, transparent 70%)', filter: 'blur(100px)', zIndex: 0, opacity: 1, pointerEvents: 'none' }} />

      <div style={{ padding: '60px 48px', position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto' }}>

        <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            {activeCollection && (
              <button 
                onClick={() => navigate(-1)} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'none', border: 'none', color: 'var(--text-muted)', 
                  cursor: 'pointer', marginBottom: '24px', padding: 0,
                  transition: 'all 0.2s',
                  fontWeight: 600, fontSize: '13px'
                }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <LuArrowLeft size={18} /> <span>Back</span>
              </button>
            )}
            <h1 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-2px', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
              {activeCollection ? `${activeCollection.name}.` : 'Vault.'}
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: 0, fontWeight: 500, opacity: 0.6 }}>
              {activeCollection
                ? (activeCollection.description || '')
                : `Welcome back, ${displayName}.`
              }
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => navigate('/collections')} className="btn btn-ghost" style={{ borderRadius: '12px', padding: '10px 20px', fontSize: '13px' }}>
              <LuFolder size={16} /> Directories
            </button>

            {profile?.is_admin && (
              <button 
                onClick={() => navigate(profile.is_super_admin ? '/super-admin-hq' : '/admin-vault-control')} 
                className="btn btn-ghost" 
                style={{ borderRadius: '12px', padding: '10px 20px', fontSize: '13px', color: '#2ea44f', border: '1px solid rgba(46, 164, 79, 0.2)' }}
              >
                <LuShieldCheck size={16} /> {profile.is_super_admin ? 'Super Admin HQ' : 'Admin Vault'}
              </button>
            )}
            <button onClick={() => navigate(filterCollection ? `/new?collection=${filterCollection}` : '/new')} className="btn btn-primary" style={{ borderRadius: '12px', padding: '10px 24px', fontSize: '13px' }}>
              <LuPlus size={18} /> New Snippet
            </button>
          </div>
        </header>

        {/* METRICS TRAY */}
        {!filterCollection && !search && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '60px', animation: 'fade-in 0.6s ease-out' }}>
            <div className="metric-card">
              <div className="metric-icon" style={{ background: 'rgba(255,255,255,0.03)' }}><LuArchive size={20} /></div>
              <div className="metric-info">
                <span className="metric-value">{snippets.length}</span>
                <label className="metric-label">Total Snippets</label>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon" style={{ background: 'rgba(255,255,255,0.03)' }}><LuFolder size={20} /></div>
              <div className="metric-info">
                <span className="metric-value">{collections.length}</span>
                <label className="metric-label">Directories</label>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon" style={{ background: 'rgba(34, 197, 94, 0.05)', color: 'var(--accent-green)' }}><LuGlobe size={20} /></div>
              <div className="metric-info">
                <span className="metric-value">{snippets.filter(s => s.visibility === 'public').length}</span>
                <label className="metric-label">Public Access</label>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon" style={{ background: 'rgba(239, 68, 68, 0.05)', color: 'var(--accent-red)' }}><LuLock size={20} /></div>
              <div className="metric-info">
                <span className="metric-value">{snippets.filter(s => s.visibility === 'private').length}</span>
                <label className="metric-label">Private</label>
              </div>
            </div>
          </div>
        )}

        {/* RECENT ACTIVITY TRAY */}
        {!filterCollection && !search && snippets.length > 0 && (
          <div style={{ marginBottom: '60px', animation: 'fade-in 0.8s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <LuClock size={18} style={{ color: 'var(--text-muted)' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Recent Architectural Edits</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {snippets.slice(0, 3).map(s => <SnippetCard key={s.id} snippet={s} onDelete={handleDelete} />)}
            </div>
          </div>
        )}

        <div style={{ height: '1px', background: 'var(--border)', marginBottom: '60px', opacity: 0.5 }} />

        {/* Themed Command Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
          background: 'var(--bg-secondary)', backdropFilter: 'blur(20px)',
          border: '1px solid var(--border)', borderRadius: '20px',
          padding: '12px 16px', marginBottom: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="text"
              placeholder="Search library patterns..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', background: 'transparent', border: 'none', padding: '12px 16px 12px 48px',
                color: 'var(--text-primary)', fontSize: '15px', outline: 'none'
              }}
            />
          </div>

          <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />

          <select value={filterVisibility} onChange={e => setFilterVisibility(e.target.value)}>
            <option value="">Visibility</option>
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>

          {(search || filterVisibility || filterCollection) && (
            <button onClick={() => { setSearch(''); setFilterVisibility(''); navigate('/dashboard') }}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', fontSize: '13px', padding: '8px 12px', cursor: 'pointer' }}>
              Reset View
            </button>
          )}

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

        {/* Content Area */}
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div className="spin" style={{ color: 'var(--text-muted)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.2" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 20px', border: '1px dashed var(--border)', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Void</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                No architectural patterns match your active filters.
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px',
              animation: 'fade-in 0.4s ease-out'
            }}>
              {filtered.map(s => <SnippetCard key={s.id} snippet={s} onDelete={handleDelete} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              {filtered.map(s => <SnippetCard key={s.id} snippet={s} onDelete={handleDelete} listMode />)}
            </div>
          )}
        </div>

      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .spin { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .metric-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all 0.3s;
        }
        .metric-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.2); }
        .metric-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
        }
        .metric-info { display: flex; flex-direction: column; }
        .metric-value { font-size: 24px; font-weight: 800; color: var(--text-primary); line-height: 1; margin-bottom: 4px; }
        .metric-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }


      `}</style>
    </div>
  )
}