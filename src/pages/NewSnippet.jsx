import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createSnippet } from '../services/snippets'
import { getCollections } from '../services/collections'
import Navbar from '../components/Navbar'
import TagInput from '../components/TagInput'

const LANGUAGES = ['javascript', 'typescript', 'python', 'rust', 'go', 'css', 'html', 'sql', 'bash', 'json', 'plaintext']

export default function NewSnippet() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [tags, setTags] = useState([])
  const [visibility, setVisibility] = useState('private')
  const [collectionId, setCollectionId] = useState('')
  const [collections, setCollections] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getCollections(user.id).then(({ data }) => setCollections(data ?? []))
  }, [user.id])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!code.trim()) { setError('code cannot be empty'); return }
    setError('')
    setLoading(true)
    const { data, error } = await createSnippet({
      user_id: user.id, title, description, code,
      language, tags, visibility,
      collection_id: collectionId || null,
    })
    if (error) { setError(error.message); setLoading(false) }
    else navigate(`/snippet/${data.id}`)
  }

  const inputStyle = {
    width: '100%', background: '#0d1117', border: '1px solid #30363d',
    borderRadius: '8px', padding: '0.6rem 0.875rem',
    color: '#e6edf3', fontSize: '14px', outline: 'none',
  }
  const labelStyle = { display: 'block', color: '#8b949e', fontSize: '13px', marginBottom: '6px' }

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117' }}>
      <Navbar />
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h2 style={{ color: '#e6edf3', fontWeight: '500', marginBottom: '1.5rem' }}>new snippet</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{
              background: '#2d1117', border: '1px solid #f7816630',
              borderRadius: '8px', padding: '0.75rem 1rem', color: '#f78166', fontSize: '13px'
            }}>{error}</div>
          )}

          <div>
            <label style={labelStyle}>title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              required placeholder="e.g. debounce hook" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>description</label>
            <input value={description} onChange={e => setDescription(e.target.value)}
              placeholder="what does this snippet do?" style={inputStyle} />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>visibility</label>
              <select value={visibility} onChange={e => setVisibility(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="private">private</option>
                <option value="public">public</option>
              </select>
            </div>
          </div>

          {collections.length > 0 && (
            <div>
              <label style={labelStyle}>collection</label>
              <select value={collectionId} onChange={e => setCollectionId(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">none</option>
                {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label style={labelStyle}>code *</label>
            <textarea
              value={code} onChange={e => setCode(e.target.value)}
              required rows={16}
              placeholder="paste your code here..."
              style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6', resize: 'vertical' }}
              onKeyDown={e => {
                if (e.key === 'Tab') {
                  e.preventDefault()
                  const s = e.target.selectionStart
                  const newCode = code.substring(0, s) + '  ' + code.substring(e.target.selectionEnd)
                  setCode(newCode)
                  setTimeout(() => e.target.setSelectionRange(s + 2, s + 2), 0)
                }
              }}
            />
          </div>

          <div>
            <label style={labelStyle}>tags</label>
            <TagInput tags={tags} onChange={setTags} />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => navigate(-1)} style={{
              background: 'none', border: '1px solid #30363d', borderRadius: '8px',
              padding: '0.6rem 1.25rem', color: '#8b949e', fontSize: '14px', cursor: 'pointer',
            }}>cancel</button>
            <button type="submit" disabled={loading} style={{
              background: '#238636', border: '1px solid #2ea043', borderRadius: '8px',
              padding: '0.6rem 1.25rem', color: '#fff', fontSize: '14px', fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'saving...' : 'save snippet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}