import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createSnippet } from '../services/snippets'
import { useNavigate } from 'react-router-dom'
import { LuArrowLeft } from 'react-icons/lu'

export default function Import() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [gists, setGists] = useState([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [hasSearched, setHasSearched] = useState(false)

  const fetchGists = async (e) => {
    e.preventDefault()
    if (!username.trim()) return
    setLoading(true)
    setError('')
    setHasSearched(true)
    try {
      const res = await fetch(`https://api.github.com/users/${username}/gists`)
      if (!res.ok) throw new Error('Could not fetch gists. Ensure the username is correct.')
      const data = await res.json()
      
      const flatGists = []
      data.forEach(g => {
        Object.values(g.files).forEach(file => {
          flatGists.push({
            id: g.id + '-' + file.filename,
            title: file.filename,
            description: g.description || 'Imported via GitHub Gist',
            language: file.language ? file.language.toLowerCase() : 'plaintext',
            raw_url: file.raw_url
          })
        })
      })
      setGists(flatGists)
      // Auto-select all by default to make it easy
      setSelected(new Set(flatGists.map(g => g.id)))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const handleImport = async () => {
    if (selected.size === 0) return
    setImporting(true)
    setError('')
    try {
      const gistsToImport = gists.filter(g => selected.has(g.id))
      
      for (const gist of gistsToImport) {
        const fileRes = await fetch(gist.raw_url)
        const code = await fileRes.text()
        
        await createSnippet({
          user_id: user.id,
          title: gist.title,
          description: gist.description + ` (Imported by ${username})`,
          code: code,
          language: ['javascript', 'typescript', 'python', 'rust', 'go', 'css', 'html', 'sql', 'bash', 'json'].includes(gist.language) ? gist.language : 'plaintext',
          tags: ['gist', `from:${username}`],
          visibility: 'private'
        })
      }
      navigate('/dashboard')
    } catch (err) {
      setError('An error occurred during import: ' + err.message)
      setImporting(false)
    }
  }

  // Helper for language colors
  const getLangColor = (lang) => {
    const colors = {
      javascript: '#f1e05a', typescript: '#3178c6', python: '#3572A5',
      rust: '#dea584', go: '#00ADD8', css: '#563d7c', html: '#e34c26'
    }
    return colors[lang] || '#8b949e'
  }

  return (
    <div className="page-content" style={{ maxWidth: '900px', paddingBottom: '100px' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', 
          background: 'none', border: 'none', color: 'var(--text-muted)', 
          fontSize: '13px', cursor: 'pointer', marginBottom: '24px', padding: 0
        }}
        onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <LuArrowLeft size={16} /> Back
      </button>

      <div style={{ marginBottom: '3rem', textAlign: 'center', marginTop: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Import from GitHub
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Instantly migrate your public Gists into your Snipx vault.
        </p>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto 3rem' }}>
        <form onSubmit={fetchGists} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <input 
            type="text" 
            placeholder="Enter GitHub username (e.g. torvalds)" 
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{
               width: '100%', padding: '16px 16px 16px 48px', fontSize: '16px',
               background: 'var(--bg-secondary)', border: '1px solid var(--border)',
               borderRadius: '12px', color: 'var(--text-primary)', outline: 'none',
               transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{
              position: 'absolute', right: '8px', background: 'var(--text-primary)', color: 'var(--bg-primary)',
              border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Fetching...' : 'Continue'}
          </button>
        </form>
        {error && (
          <div style={{ marginTop: '1rem', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-red)', borderRadius: '8px', color: 'var(--accent-red)', fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}
      </div>

      {hasSearched && !loading && gists.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.2, marginBottom: '1rem' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
          <p>No public gists found for this user.</p>
        </div>
      )}

      {gists.length > 0 && (
        <div style={{ animation: 'fade-in 0.5s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 4px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Found {gists.length} Gists
            </h3>
            <button 
              onClick={() => setSelected(selected.size === gists.length ? new Set() : new Set(gists.map(g => g.id)))}
              className="btn btn-ghost btn-sm"
            >
              {selected.size === gists.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
            {gists.map(g => {
              const isSelected = selected.has(g.id);
              return (
                <div 
                  key={g.id} 
                  onClick={() => toggleSelect(g.id)}
                  style={{
                    background: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-secondary)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--accent-blue)' : 'var(--border)',
                    borderRadius: '12px', padding: '16px',
                    cursor: 'pointer', transition: 'all 0.2s',
                    position: 'relative', overflow: 'hidden'
                  }}
                >
                  {/* Selection Checkbox indicator overlay */}
                  <div style={{ position: 'absolute', top: '16px', right: '16px', width: '20px', height: '20px', borderRadius: '6px', border: '1px solid', borderColor: isSelected ? 'var(--accent-blue)' : 'var(--text-muted)', background: isSelected ? 'var(--accent-blue)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>

                  <div style={{ paddingRight: '30px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', wordBreak: 'break-all' }}>
                      {g.title}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {g.description}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getLangColor(g.language) }} />
                      <span style={{ textTransform: 'capitalize' }}>{g.language === 'plaintext' ? 'Text' : g.language}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Floating Action Bar */}
      {selected.size > 0 && (
        <div style={{
          position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(20, 20, 20, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)',
          padding: '12px 24px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 100, animation: 'slide-up 0.3s ease-out'
        }}>
          <div style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>
            <span style={{ color: 'var(--accent-blue)' }}>{selected.size}</span> snippets ready to import
          </div>
          <button 
            onClick={handleImport}
            disabled={importing}
            style={{
              background: '#fff', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '100px',
              fontSize: '14px', fontWeight: 600, cursor: importing ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s'
            }}
            onMouseOver={e => !importing && (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={e => !importing && (e.currentTarget.style.transform = 'scale(1)')}
          >
            {importing ? (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/></svg> Importing...</>
            ) : (
              'Confirm Import →'
            )}
          </button>
        </div>
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
