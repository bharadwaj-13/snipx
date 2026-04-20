import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { getCollections } from '../services/collections'
import {
  LuLayoutDashboard, LuGlobe, LuLibrary,
  LuSettings, LuLogOut, LuFolder, LuPin
} from 'react-icons/lu'
import { SiGithub } from 'react-icons/si'

// Internal component for nav links aware of `expanded`
function NavItem({ to, icon, label, exact = false, expanded }) {
  return (
    <NavLink to={to} end={exact} style={{ textDecoration: 'none', display: 'block' }}>
      {({ isActive }) => (
        <div style={{
          display: 'flex', alignItems: 'center',
          height: '46px', borderRadius: '10px', cursor: 'pointer',
          background: isActive ? 'var(--bg-secondary)' : 'transparent',
          transition: 'background 0.2s', margin: '6px 0',
          position: 'relative'
        }}
          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-secondary)' }}
          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
        >
          <div style={{
            width: '64px', height: '46px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
            transition: 'color 0.2s'
          }}>
            {icon}
          </div>

          <span style={{
            fontSize: '14px', fontWeight: isActive ? 500 : 400,
            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            whiteSpace: 'nowrap', opacity: expanded ? 1 : 0,
            transform: expanded ? 'translateX(0)' : 'translateX(-10px)',
            transition: 'opacity 0.2s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: 'none'
          }}>
            {label}
          </span>

        </div>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const loc = useLocation()
  const searchParams = new URLSearchParams(loc.search)
  const [collections, setCollections] = useState([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    function load() {
      if (user) {
        getCollections(user.id).then(({ data }) => setCollections(data ?? []))
      }
    }
    load()
    window.addEventListener('collections_changed', load)
    return () => window.removeEventListener('collections_changed', load)
  }, [user])

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <>
      <aside style={{ width: '64px', minWidth: '64px', flexShrink: 0, background: 'var(--bg-primary)' }} />

      <div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          width: expanded ? '280px' : '64px',
          background: 'var(--bg-primary)',
          borderRight: '1px solid var(--border-light)',
          display: 'flex', flexDirection: 'column',
          zIndex: 50,
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowX: 'hidden', overflowY: 'hidden',
          boxShadow: expanded ? '24px 0 60px rgba(0,0,0,0.5)' : 'none',
        }}>

        {/* Header / Logo */}
        <div style={{ height: '72px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
            <div style={{ width: '64px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src="/favicon.svg" alt="Logo" style={{ width: '20px', height: '20px' }} />
            </div>
            <div style={{
              fontSize: '18px', color: 'var(--text-primary)', fontWeight: '700',
              letterSpacing: '-0.5px', opacity: expanded ? 1 : 0, transition: 'all 0.2s ease', whiteSpace: 'nowrap',
              transform: expanded ? 'translateX(0)' : 'translateX(-10px)'
            }}>
              Snipx.
            </div>
          </Link>
        </div>

        {/* Scrollable Nav Payload */}
        <div style={{ flex: 1, padding: '0 8px', overflowY: 'auto', overflowX: 'hidden' }}>

          <nav>
            <NavItem to="/dashboard" label="Snippet Vault" icon={<LuLayoutDashboard size={20} />} expanded={expanded} />
            <NavItem to="/explore" label="Explore" icon={<LuGlobe size={20} />} expanded={expanded} />
            <NavItem to="/collections" label="Directories" icon={<LuLibrary size={20} />} expanded={expanded} />
          </nav>

          <div style={{ margin: '16px 0', borderBottom: '1px solid var(--border-light)' }} />

          {/* User Specific Folders */}
          <div>
            <div style={{
              height: '32px', display: 'flex', alignItems: 'center',
              opacity: expanded ? 1 : 0, transition: 'opacity 0.2s', whiteSpace: 'nowrap',
              paddingLeft: '24px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em'
            }}>
              QUICK ACCESS
            </div>

            {collections.filter(c => c.is_pinned).length === 0 && expanded && (
              <div style={{ paddingLeft: '24px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', whiteSpace: 'nowrap', opacity: expanded ? 1 : 0 }}>
                No pinned directories.
              </div>
            )}

            {collections.filter(c => c.is_pinned).map(col => {
              const activeColId = searchParams.get('collection')
              const isActive = loc.pathname === '/dashboard' && activeColId === col.id
              return (
                <Link key={col.id} to={`/dashboard?collection=${col.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    height: '42px', borderRadius: '10px', cursor: 'pointer',
                    background: isActive ? 'var(--bg-secondary)' : 'transparent',
                    transition: 'background 0.2s', margin: '4px 0'
                  }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-secondary)' }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ width: '64px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      <LuPin size={16} />
                    </div>
                    <span style={{
                      fontSize: '13px', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: isActive ? 500 : 400,
                      whiteSpace: 'nowrap', opacity: expanded ? 1 : 0,
                      transform: expanded ? 'translateX(0)' : 'translateX(-10px)',
                      transition: 'opacity 0.2s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      flex: 1, overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {col.name}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>

          <div style={{ margin: '16px 0', borderBottom: '1px solid var(--border-light)' }} />

          <nav>
            <NavItem to="/import" label="GitHub Integrations" icon={<SiGithub size={18} />} expanded={expanded} />
            <NavItem to="/settings" label="Workspace Settings" icon={<LuSettings size={20} />} expanded={expanded} />
          </nav>

        </div>

        {/* Fixed Bottom Profile Target */}
        <div style={{ borderTop: '1px solid var(--border-light)', padding: '16px 8px', flexShrink: 0 }}>
          <Link to="/profile" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
              display: 'flex', alignItems: 'center', height: '48px', borderRadius: '10px', cursor: 'pointer',
              background: 'transparent', transition: 'background 0.2s'
            }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden' }}>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    profile?.username?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'
                  )}
                </div>
              </div>
              <div style={{
                flex: 1, whiteSpace: 'nowrap', overflow: 'hidden',
                opacity: expanded ? 1 : 0, transition: 'opacity 0.2s ease',
                display: 'flex', flexDirection: 'column', justifyContent: 'center'
              }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{profile?.username ?? 'Anonymous'}</span>
              </div>
            </div>
          </Link>

          <button onClick={handleSignOut} title="Sign Out Session" style={{
            width: '100%', background: 'none', border: 'none', height: '48px', display: 'flex', alignItems: 'center', cursor: 'pointer',
            borderRadius: '10px', color: 'var(--text-muted)', transition: 'background 0.2s, color 0.2s', marginTop: '8px'
          }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = 'var(--accent-red)' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}>
            <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LuLogOut size={20} />
            </div>
            <span style={{ whiteSpace: 'nowrap', opacity: expanded ? 1 : 0, fontSize: '14px', fontWeight: 500, transition: 'opacity 0.2s ease', color: 'inherit' }}>
              Sign Out
            </span>
          </button>
        </div>

      </div>
    </>
  )
}