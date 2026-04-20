import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSnippets } from '../services/snippets'
import { 
  LuSearch, LuPlus, LuLayoutDashboard, 
  LuLibrary, LuUser, 
  LuSettings, LuCode 
} from 'react-icons/lu'

export default function CommandPalette({ onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [snippets, setSnippets] = useState([])
  const [filtered, setFiltered] = useState([])
  const [selected, setSelected] = useState(0)
  const inputRef = useRef(null)

  const ACTIONS = [
    { type: 'action', label: 'New Snippet', hint: 'create', path: '/new', icon: <LuPlus size={14} /> },
    { type: 'action', label: 'Snippet Vault', hint: 'navigate', path: '/dashboard', icon: <LuLayoutDashboard size={14} /> },
    { type: 'action', label: 'Explore', hint: 'navigate', path: '/explore', icon: <LuSearch size={14} /> },
    { type: 'action', label: 'Collections', hint: 'navigate', path: '/collections', icon: <LuLibrary size={14} /> },
    { type: 'action', label: 'Profile', hint: 'navigate', path: '/profile', icon: <LuUser size={14} /> },
    { type: 'action', label: 'Settings', hint: 'navigate', path: '/settings', icon: <LuSettings size={14} /> },
  ]

  useEffect(() => {
    inputRef.current?.focus()
    if (user) {
      getSnippets(user.id).then(({ data }) => setSnippets(data ?? []))
    }
  }, [user])

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(ACTIONS)
      setSelected(0)
      return
    }
    const q = query.toLowerCase()
    const matchedSnippets = snippets
      .filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.tags?.some(t => t.includes(q)) ||
        s.language.includes(q)
      )
      .slice(0, 6)
      .map(s => ({
        type: 'snippet',
        label: s.title,
        hint: s.language,
        path: `/snippet/${s.id}`,
        tags: s.tags,
        icon: <LuCode size={14} />,
      }))

    const matchedActions = ACTIONS.filter(a =>
      a.label.toLowerCase().includes(q)
    )

    setFiltered([...matchedActions, ...matchedSnippets])
    setSelected(0)
  }, [query, snippets])

  function handleKey(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(s => Math.min(s + 1, filtered.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(s => Math.max(s - 1, 0))
    }
    if (e.key === 'Enter' && filtered[selected]) {
      navigate(filtered[selected].path)
      onClose()
    }
  }

  function handleSelect(path) {
    navigate(path)
    onClose()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center', paddingTop: '15vh',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '560px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: '12px', overflow: 'hidden',
          margin: '0 1rem',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          animation: 'slideDown 0.2s ease-out'
        }}
      >
        {/* Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--bg-secondary)'
        }}>
          <LuSearch color="var(--text-muted)" size={18} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search snippets or jump to..."
            style={{
              flex: 1, background: 'none', border: 'none',
              outline: 'none', fontSize: '15px',
              color: 'var(--text-primary)',
            }}
          />
          <button onClick={onClose} style={{
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            borderRadius: '6px', padding: '4px 8px', fontSize: '11px',
            color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'monospace',
            fontWeight: 600
          }}>
            ESC
          </button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px 0' }}>
          {filtered.length === 0 ? (
            <div style={{
              padding: '3rem 2rem', textAlign: 'center',
              color: 'var(--text-muted)', fontSize: '14px',
            }}>
              No results exactly matching "{query}"
            </div>
          ) : (
            <>
              {filtered.some(f => f.type === 'action') && (
                <div style={{
                  padding: '8px 20px 4px',
                  fontSize: '11px', color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  fontWeight: 600
                }}>
                  {query ? 'Actions' : 'Quick Actions'}
                </div>
              )}
              {filtered.filter(f => f.type === 'action').map((item, i) => (
                <div key={item.path}
                  onClick={() => handleSelect(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 20px', cursor: 'pointer',
                    background: selected === i ? 'var(--bg-secondary)' : 'transparent',
                    borderLeft: selected === i ? '2px solid var(--text-primary)' : '2px solid transparent',
                  }}
                  onMouseEnter={() => setSelected(i)}
                >
                  <span style={{
                    color: selected === i ? 'var(--text-primary)' : 'var(--text-muted)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {item.icon}
                  </span>
                  <span style={{ fontSize: '14px', color: selected === i ? 'var(--text-primary)' : 'var(--text-secondary)', flex: 1, fontWeight: selected === i ? 500 : 400 }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {item.hint}
                  </span>
                </div>
              ))}

              {filtered.some(f => f.type === 'snippet') && (
                <div style={{
                  padding: '12px 20px 4px',
                  fontSize: '11px', color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  fontWeight: 600,
                  borderTop: filtered.some(f => f.type === 'action') ? '1px solid var(--border-light)' : 'none', 
                  marginTop: filtered.some(f => f.type === 'action') ? '8px' : '0'
                }}>
                  Your Snippets
                </div>
              )}
              {filtered.filter(f => f.type === 'snippet').map((item, i) => {
                const globalIdx = filtered.filter(f => f.type === 'action').length + i
                return (
                  <div key={item.path}
                    onClick={() => handleSelect(item.path)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 20px', cursor: 'pointer',
                      background: selected === globalIdx ? 'var(--bg-secondary)' : 'transparent',
                      borderLeft: selected === globalIdx ? '2px solid var(--accent-blue)' : '2px solid transparent',
                    }}
                    onMouseEnter={() => setSelected(globalIdx)}
                  >
                    <span style={{
                      color: selected === globalIdx ? 'var(--accent-blue)' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {item.icon}
                    </span>
                    <span style={{ fontSize: '14px', color: selected === globalIdx ? 'var(--text-primary)' : 'var(--text-secondary)', flex: 1, fontWeight: selected === globalIdx ? 500 : 400 }}>
                      {item.label}
                    </span>
                    <span style={{
                      fontSize: '11px', color: 'var(--text-muted)',
                      fontFamily: 'monospace', background: 'var(--bg-tertiary)',
                      padding: '2px 6px', borderRadius: '4px'
                    }}>
                      {item.hint}
                    </span>
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-light)',
          background: 'var(--bg-secondary)',
          display: 'flex', gap: '16px',
        }}>
          {[['↑↓', 'navigate'], ['↵', 'open'], ['esc', 'close']].map(([key, label]) => (
            <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd style={{
                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                borderRadius: '4px', padding: '2px 6px', fontSize: '10px',
                color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 600
              }}>{key}</kbd>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}