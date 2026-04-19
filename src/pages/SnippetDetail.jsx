import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSnippetById, deleteSnippet, updateSnippet } from '../services/snippets'
import Navbar from '../components/Navbar'
import CodeBlock from '../components/CodeBlock'

export default function SnippetDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [snippet, setSnippet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copying, setCopying] = useState(false)
  const [copyingLink, setCopyingLink] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [togglingVis, setTogglingVis] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await getSnippetById(id)
      if (error || !data) navigate('/dashboard')
      else setSnippet(data)
      setLoading(false)
    }
    load()
  }, [id])

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet.code)
    setCopying(true)
    setTimeout(() => setCopying(false), 1500)
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/s/${snippet.share_token}`
    await navigator.clipboard.writeText(url)
    setCopyingLink(true)
    setTimeout(() => setCopyingLink(false), 1500)
  }

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    await deleteSnippet(snippet.id)
    navigate('/dashboard')
  }

  async function handleToggleVisibility() {
    setTogglingVis(true)
    const newVis = snippet.visibility === 'private' ? 'public' : 'private'
    const { data } = await updateSnippet(snippet.id, { visibility: newVis })
    if (data) setSnippet(data)
    setTogglingVis(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d1117' }}>
      <Navbar />
      <div style={{ color: '#484f58', fontFamily: 'monospace', padding: '3rem 2rem' }}>
        loading...
      </div>
    </div>
  )

  const isOwner = user?.id === snippet.user_id
  const shareUrl = `${window.location.origin}/s/${snippet.share_token}`

  const btnStyle = {
    background: 'none',
    border: '1px solid #30363d',
    borderRadius: '8px',
    padding: '0.4rem 0.875rem',
    color: '#8b949e',
    fontSize: '13px',
    cursor: 'pointer',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117' }}>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: '1.25rem' }}>
          <Link to="/dashboard" style={{ color: '#484f58', fontSize: '13px', textDecoration: 'none' }}>
            ← dashboard
          </Link>
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: '1rem',
          marginBottom: '1.5rem', flexWrap: 'wrap'
        }}>
          <div>
            <h1 style={{
              color: '#e6edf3', fontSize: '1.3rem',
              fontWeight: '500', marginBottom: '6px'
            }}>
              {snippet.title}
            </h1>
            {snippet.description && (
              <p style={{ color: '#8b949e', fontSize: '14px' }}>
                {snippet.description}
              </p>
            )}
          </div>

          {/* Actions */}
          {isOwner && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={handleToggleVisibility} disabled={togglingVis} style={{
                ...btnStyle,
                color: snippet.visibility === 'public' ? '#3fb950' : '#8b949e',
                borderColor: snippet.visibility === 'public' ? '#2ea04330' : '#30363d',
              }}>
                {togglingVis ? '...' : snippet.visibility === 'public' ? 'public' : 'private'}
              </button>
              <button onClick={handleCopyLink} style={{
                ...btnStyle,
                color: copyingLink ? '#58a6ff' : '#8b949e',
                borderColor: copyingLink ? '#58a6ff44' : '#30363d',
              }}>
                {copyingLink ? 'link copied!' : 'share link'}
              </button>
              <Link to={`/edit/${snippet.id}`} style={{
                ...btnStyle, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center'
              }}>
                edit
              </Link>
              <button onClick={handleDelete} style={{
                ...btnStyle,
                color: confirming ? '#f78166' : '#8b949e',
                borderColor: confirming ? '#f7816650' : '#30363d',
              }}
                onBlur={() => setConfirming(false)}
              >
                {confirming ? 'sure?' : 'delete'}
              </button>
            </div>
          )}
        </div>

        {/* Meta row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          marginBottom: '1.25rem', flexWrap: 'wrap'
        }}>
          <span style={{
            background: '#21262d', border: '1px solid #30363d',
            borderRadius: '6px', padding: '2px 10px',
            color: '#8b949e', fontSize: '12px', fontFamily: 'monospace'
          }}>
            {snippet.language}
          </span>
          <span style={{ color: '#484f58', fontSize: '12px' }}>
            {snippet.code.split('\n').length} lines
          </span>
          <span style={{ color: '#484f58', fontSize: '12px' }}>
            {new Date(snippet.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </span>
          {snippet.tags?.map(tag => (
            <span key={tag} style={{
              background: '#21262d', border: '1px solid #30363d',
              borderRadius: '99px', padding: '2px 10px',
              color: '#8b949e', fontSize: '12px'
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Code block */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <button
            onClick={handleCopy}
            style={{
              ...btnStyle,
              position: 'absolute', top: '12px', right: '12px',
              zIndex: 10, fontSize: '12px', padding: '3px 12px',
              color: copying ? '#3fb950' : '#8b949e',
              borderColor: copying ? '#3fb95030' : '#30363d',
              background: '#161b22',
            }}
          >
            {copying ? 'copied!' : 'copy'}
          </button>
          <CodeBlock code={snippet.code} language={snippet.language} />
        </div>

        {/* Share section */}
        <div style={{
          background: '#161b22', border: '1px solid #30363d',
          borderRadius: '10px', padding: '1rem 1.25rem',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap'
        }}>
          <div>
            <p style={{ color: '#8b949e', fontSize: '12px', marginBottom: '4px' }}>
              shareable link {snippet.visibility === 'private' && '(works even for private snippets)'}
            </p>
            <span style={{
              fontFamily: 'monospace', fontSize: '12px', color: '#484f58'
            }}>
              {shareUrl}
            </span>
          </div>
          <button onClick={handleCopyLink} style={{
            ...btnStyle,
            color: copyingLink ? '#58a6ff' : '#8b949e',
            flexShrink: 0,
          }}>
            {copyingLink ? 'copied!' : 'copy link'}
          </button>
        </div>

      </div>
    </div>
  )
}