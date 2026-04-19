import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getCollections, createCollection, deleteCollection } from '../services/collections'
import { getSnippets } from '../services/snippets'
import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'

export default function Collections() {
  const { user } = useAuth()
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
    })
    if (error) { setError(error.message) }
    else {
      setCollections(prev => [...prev, data])
      setNewName('')
      setNewDesc('')
      setShowForm(false)
    }
    setCreating(false)
  }

  async function handleDelete(id) {
    await deleteCollection(id)
    setCollections(prev => prev.filter(c => c.id !== id))
  }

  function snippetCountFor(collectionId) {
    return snippets.filter(s => s.collection_id === collectionId).length
  }

  const inputStyle = {
    width: '100%', background: '#0d1117', border: '1px solid #30363d',
    borderRadius: '8px', padding: '0.6rem 0.875rem',
    color: '#e6edf3', fontSize: '14px', outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117' }}>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '1.5rem'
        }}>
          <h2 style={{ color: '#e6edf3', fontWeight: '500', fontSize: '1.1rem' }}>
            collections
            <span style={{ color: '#484f58', fontWeight: '400', marginLeft: '8px', fontSize: '0.95rem' }}>
              {collections.length}
            </span>
          </h2>
          <button
            onClick={() => setShowForm(f => !f)}
            style={{
              background: showForm ? 'none' : '#238636',
              border: `1px solid ${showForm ? '#30363d' : '#2ea043'}`,
              borderRadius: '8px', padding: '0.4rem 0.875rem',
              color: showForm ? '#8b949e' : '#fff',
              fontSize: '13px', fontWeight: '500', cursor: 'pointer',
            }}
          >
            {showForm ? 'cancel' : '+ new collection'}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} style={{
            background: '#161b22', border: '1px solid #30363d',
            borderRadius: '12px', padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '1rem'
          }}>
            {error && (
              <div style={{
                background: '#2d1117', border: '1px solid #f7816630',
                borderRadius: '8px', padding: '0.75rem',
                color: '#f78166', fontSize: '13px'
              }}>{error}</div>
            )}
            <div>
              <label style={{ display: 'block', color: '#8b949e', fontSize: '13px', marginBottom: '6px' }}>
                name *
              </label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. React hooks"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#8b949e', fontSize: '13px', marginBottom: '6px' }}>
                description
              </label>
              <input
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="what's in this collection?"
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={creating} style={{
                background: '#238636', border: '1px solid #2ea043',
                borderRadius: '8px', padding: '0.5rem 1.25rem',
                color: '#fff', fontSize: '13px', fontWeight: '500',
                cursor: creating ? 'not-allowed' : 'pointer',
                opacity: creating ? 0.7 : 1,
              }}>
                {creating ? 'creating...' : 'create'}
              </button>
            </div>
          </form>
        )}

        {/* Collections grid */}
        {loading ? (
          <div style={{ color: '#484f58', fontFamily: 'monospace', padding: '3rem 0' }}>
            loading...
          </div>
        ) : collections.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '5rem 2rem',
            color: '#484f58', fontFamily: 'monospace'
          }}>
            no collections yet — create one to organise your snippets
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1rem'
          }}>
            {collections.map(col => (
              <div key={col.id} style={{
                background: '#161b22', border: '1px solid #30363d',
                borderRadius: '12px', padding: '1.25rem',
                display: 'flex', flexDirection: 'column', gap: '10px',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#58a6ff44'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#30363d'}
              >
                {/* Folder icon + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#58a6ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span style={{ color: '#e6edf3', fontWeight: '500', fontSize: '14px' }}>
                    {col.name}
                  </span>
                </div>

                {/* Description */}
                {col.description && (
                  <p style={{ color: '#8b949e', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                    {col.description}
                  </p>
                )}

                {/* Snippet count */}
                <div style={{ color: '#484f58', fontSize: '12px', fontFamily: 'monospace' }}>
                  {snippetCountFor(col.id)} snippet{snippetCountFor(col.id) !== 1 ? 's' : ''}
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex', gap: '8px',
                  marginTop: 'auto', paddingTop: '6px',
                  borderTop: '1px solid #21262d'
                }}>
                  <Link
                    to={`/dashboard?collection=${col.id}`}
                    style={{
                      flex: 1, textAlign: 'center',
                      background: 'none', border: '1px solid #30363d',
                      borderRadius: '6px', padding: '4px 0',
                      color: '#8b949e', fontSize: '12px',
                      textDecoration: 'none', cursor: 'pointer',
                    }}
                  >
                    view snippets
                  </Link>
                  <button
                    onClick={() => handleDelete(col.id)}
                    style={{
                      background: 'none', border: '1px solid #30363d',
                      borderRadius: '6px', padding: '4px 10px',
                      color: '#8b949e', fontSize: '12px', cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = '#f78166'
                      e.currentTarget.style.borderColor = '#f7816650'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = '#8b949e'
                      e.currentTarget.style.borderColor = '#30363d'
                    }}
                  >
                    delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}