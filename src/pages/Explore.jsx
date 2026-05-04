import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import SnippetCard from '../components/SnippetCard'
import { LuGlobe, LuSearch, LuUsers, LuCode } from 'react-icons/lu'

export default function Explore() {
  const [snippets, setSnippets] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [exploreMode, setExploreMode] = useState('snippets') // 'snippets' or 'creators'
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('snipx_view_mode') || 'grid')

  const changeViewMode = (mode) => {
    setViewMode(mode)
    localStorage.setItem('snipx_view_mode', mode)
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        if (exploreMode === 'snippets') {
          const { data, error } = await supabase
            .from('snippets')
            .select('*, profiles(username, avatar_url)')
            .eq('visibility', 'public')
            .order('created_at', { ascending: false })
            .limit(100)
          if (error) throw error
          setSnippets(data || [])
        } else {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('username', { ascending: true })
            .limit(100)
          if (error) throw error
          setProfiles(data || [])
        }
      } catch (error) {
        console.error('Error loading explore data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [exploreMode])

  const filteredSnippets = useMemo(() => {
    return snippets.filter(s => {
      const combined = (s.title + (s.description || '') + s.code + (s.profiles?.username || '')).toLowerCase()
      if (search && !combined.includes(search.toLowerCase())) return false
      return true
    })
  }, [snippets, search])

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      const combined = (p.username + (p.bio || '')).toLowerCase()
      if (search && !combined.includes(search.toLowerCase())) return false
      return true
    })
  }, [profiles, search])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', position: 'relative' }}>

      {/* Standardized Atmospheric Glow */}
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0.04, transparent 60%)', filter: 'blur(100px)', zIndex: 0, opacity: 1, pointerEvents: 'none' }} />

      <div style={{ padding: '60px 48px', position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto' }}>

        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-2px', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
              Explore.
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: 0, fontWeight: 500, opacity: 0.6 }}>
              {exploreMode === 'snippets'
                ? `Discover and learn from ${snippets.length} public patterns.`
                : `Connect with ${profiles.length} creators in the network.`}
            </p>
          </div>

          {/* Mode Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px' }}>
            <button
              onClick={() => setExploreMode('snippets')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: exploreMode === 'snippets' ? 'var(--text-primary)' : 'transparent',
                color: exploreMode === 'snippets' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                fontWeight: 700, fontSize: '13px', transition: 'all 0.2s'
              }}
            >
              <LuCode size={16} /> Snippets
            </button>
            <button
              onClick={() => setExploreMode('creators')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: exploreMode === 'creators' ? 'var(--text-primary)' : 'transparent',
                color: exploreMode === 'creators' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                fontWeight: 700, fontSize: '13px', transition: 'all 0.2s'
              }}
            >
              <LuUsers size={16} /> People
            </button>
          </div>
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
              placeholder={exploreMode === 'snippets' ? "Browse patterns or authors..." : "Search for creators..."}
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
                className="btn-ghost btn-sm"
                style={{ textTransform: 'uppercase', fontSize: '10px', letterSpacing: '1px' }}
              >
                Clear
              </button>
            )}
          </div>

          <div className="hide-on-mobile" style={{ display: 'flex', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '100px', padding: '4px', marginLeft: 'auto' }}>
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
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
              <div className="spin" style={{ color: 'var(--text-muted)' }}>
                <LuGlobe size={32} />
              </div>
            </div>
          ) : exploreMode === 'creators' ? (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px',
              animation: 'fade-in 0.4s ease-out'
            }}>
              {filteredProfiles.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', opacity: 0.5 }}>
                  No creators found matching "{search}"
                </div>
              ) : (
                filteredProfiles.map(p => (
                  <Link
                    key={p.id}
                    to={`/profile/${p.username}`}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                      padding: '32px 24px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
                      borderRadius: '24px', textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      textAlign: 'center'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = 'var(--text-muted)'
                      e.currentTarget.style.transform = 'translateY(-4px)'
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = 'var(--border-light)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div style={{
                      width: '80px', height: '80px', borderRadius: '30px',
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                    }}>
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={p.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>{p.username?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{p.username}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {p.bio || ''}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          ) : filteredSnippets.length === 0 ? (
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
              {filteredSnippets.map(s => <SnippetCard key={s.id} snippet={s} showAuthor={true} allowDelete={false} allowFork={true} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              {filteredSnippets.map(s => <SnippetCard key={s.id} snippet={s} showAuthor={true} listMode={true} allowDelete={false} allowFork={true} />)}
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