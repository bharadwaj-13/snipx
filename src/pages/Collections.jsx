import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getCollections, createCollection, deleteCollection, updateCollection } from '../services/collections'
import { getSnippets } from '../services/snippets'
import { Link, useNavigate } from 'react-router-dom'
import { LuFolder, LuPlus, LuTrash2, LuArrowRight, LuFolderGit2, LuSearch, LuArrowLeft, LuPin } from 'react-icons/lu'

export default function Collections() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [collections, setCollections] = useState([])
  const [snippets, setSnippets] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const [{ data: c }, { data: s }] = await Promise.all([
        getCollections(user.id),
        getSnippets(user.id),
      ])
      setCollections(c ?? [])
      setSnippets(s ?? [])
      setLoading(false)
    }
    load()
  }, [user.id])

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    const { data, error } = await createCollection({
      user_id: user.id,
      name: newName.trim(),
      description: newDesc.trim() || null,
      is_pinned: false
    })
    if (error) { setError(error.message) }
    else {
      setCollections(prev => [...prev, data])
      window.dispatchEvent(new Event('collections_changed'))
      setNewName('')
      setNewDesc('')
      setShowForm(false)
    }
    setCreating(false)
  }

  async function handleDelete(id) {
    const isConfirmed = window.confirm("Are you sure you want to delete this collection? Snippets inside it will be kept but orphaned.")
    if (!isConfirmed) return
    await deleteCollection(id)
    setCollections(prev => prev.filter(c => c.id !== id))
    window.dispatchEvent(new Event('collections_changed'))
  }

  async function togglePin(col) {
    console.log('Toggling pin for collection:', col.id, 'New state:', !col.is_pinned);
    const { data, error } = await updateCollection(col.id, { is_pinned: !col.is_pinned })
    if (error) {
      console.error('Pin toggle failed:', error.message)
      setError('Pin toggle failed: ' + error.message)
      setTimeout(() => setError(''), 3000)
    } else if (data) {
      setCollections(prev => prev.map(c => c.id === data.id ? data : c))
      window.dispatchEvent(new Event('collections_changed'))
    }
  }

  function snippetCountFor(collectionId) {
    return snippets.filter(s => s.collection_id === collectionId).length
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', color: 'var(--text-primary)' }}>

      {/* Standardized Atmospheric Glow */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0.05, transparent 60%)', filter: 'blur(100px)', zIndex: 0, opacity: 1, pointerEvents: 'none' }} />

      <div style={{ padding: '60px 48px', position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto' }}>

        {/* Master Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-2px', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
              Directories.
            </h1>
          </div>

          <button onClick={() => setShowForm(!showForm)} className={showForm ? "btn btn-ghost" : "btn btn-primary"} style={{ padding: '12px 24px', fontSize: '13px', borderRadius: '12px' }}>
            {showForm ? 'Cancel Request' : <><LuPlus size={18} /> New Directory</>}
          </button>
        </header>

        {/* Create Form Injection */}
        {showForm && (
          <form onSubmit={handleCreate} style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            padding: '32px', borderRadius: '24px', marginBottom: '60px',
            backdropFilter: 'blur(20px)', animation: 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LuFolderGit2 size={20} color="var(--text-muted)" /> Initialize Node
            </h3>

            {error && <div className="error-box" style={{ marginBottom: '20px' }}>{error}</div>}

            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <label className="label">Node Name</label>
                <input
                  className="input"
                  style={{ background: 'var(--bg-tertiary)', borderRadius: '12px' }}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. React Patterns"
                  required
                  autoFocus
                />
              </div>
              <div style={{ flex: 2 }}>
                <label className="label">Definition (Optional)</label>
                <input
                  className="input"
                  style={{ background: 'var(--bg-tertiary)', borderRadius: '12px' }}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="The purpose of this node..."
                />
              </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={creating} className="btn btn-primary" style={{ padding: '12px 32px', borderRadius: '12px' }}>
                {creating ? 'Initializing...' : 'Confirm Node'}
              </button>
            </div>
          </form>
        )}

        {/* Collection Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
             <div className="spin"><LuFolder size={32} /></div>
          </div>
        ) : collections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', border: '1px dashed var(--border)', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Void</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              No architectural nodes have been defined yet.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px',
            animation: 'fade-in 0.4s ease-out'
          }}>
            {collections.map(col => (
              <div key={col.id} 
                onClick={() => navigate(`/dashboard?collection=${col.id}`)}
                className="card" style={{
                  display: 'flex', flexDirection: 'column', padding: '32px',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', 
                  cursor: 'pointer', position: 'relative'
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--text-muted)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LuFolder size={20} color="var(--text-primary)" />
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); togglePin(col); }}
                      style={{ 
                        background: 'none', border: 'none', outline: 'none',
                        color: col.is_pinned ? 'var(--accent-purple)' : 'var(--text-muted)',
                        cursor: 'pointer', padding: '12px', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                      onMouseOver={e => e.currentTarget.style.color = col.is_pinned ? 'var(--accent-purple)' : 'var(--text-primary)'}
                      onMouseOut={e => e.currentTarget.style.color = col.is_pinned ? 'var(--accent-purple)' : 'var(--text-muted)'}
                      title={col.is_pinned ? "Remove from Quick Access" : "Add to Quick Access"}
                    >
                      <LuPin size={18} style={{ transform: col.is_pinned ? 'rotate(0deg)' : 'rotate(-45deg)', transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                    </button>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(col.id); }} 
                    title="Delete Folder" className="btn btn-ghost" style={{ padding: '8px', border: 'none', zIndex: 2 }} 
                    onMouseOver={e => e.currentTarget.style.color = 'var(--accent-red)'} 
                    onMouseOut={e => e.currentTarget.style.color = 'inherit'}
                  >
                    <LuTrash2 size={16} />
                  </button>
                </div>

                <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-0.8px' }}>
                  {col.name}
                </h3>

                {col.description && (
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, opacity: 0.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {col.description}
                  </p>
                )}

                <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '8px' }}>
                    {snippetCountFor(col.id)} Snippet{snippetCountFor(col.id) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .spin { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}