import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSnippetByToken } from '../services/snippets'
import CodeBlock from '../components/CodeBlock'

export default function SharedSnippet() {
  const { token } = useParams()
  const [snippet, setSnippet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copying, setCopying] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await getSnippetByToken(token)
      if (error || !data) setNotFound(true)
      else setSnippet(data)
      setLoading(false)
    }
    load()
  }, [token])

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet.code)
    setCopying(true)
    setTimeout(() => setCopying(false), 1500)
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#0d1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#484f58', fontFamily: 'monospace'
    }}>
      loading...
    </div>
  )

  if (notFound) return (
    <div style={{
      minHeight: '100vh', background: '#0d1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '1rem'
    }}>
      <p style={{ color: '#8b949e', fontFamily: 'monospace' }}>snippet not found</p>
      <Link to="/login" style={{ color: '#58a6ff', fontSize: '13px', textDecoration: 'none' }}>
        go to snipx →
      </Link>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117' }}>

      {/* Minimal navbar */}
      <nav style={{
        background: '#161b22', borderBottom: '1px solid #30363d',
        padding: '0 1.5rem', height: '52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <span style={{
          fontFamily: 'monospace', fontSize: '1.1rem',
          color: '#58a6ff', fontWeight: '600'
        }}>snipx</span>
        <Link to="/signup" style={{
          background: '#238636', border: '1px solid #2ea043',
          borderRadius: '8px', padding: '0.35rem 0.875rem',
          color: '#fff', fontSize: '13px', textDecoration: 'none'
        }}>
          create your vault →
        </Link>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 style={{
            color: '#e6edf3', fontSize: '1.3rem',
            fontWeight: '500', marginBottom: '6px'
          }}>
            {snippet.title}
          </h1>
          {snippet.description && (
            <p style={{ color: '#8b949e', fontSize: '14px' }}>{snippet.description}</p>
          )}
        </div>

        {/* Meta */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '1.25rem', flexWrap: 'wrap'
        }}>
          <span style={{
            background: '#21262d', border: '1px solid #30363d',
            borderRadius: '6px', padding: '2px 10px',
            color: '#8b949e', fontSize: '12px', fontFamily: 'monospace'
          }}>
            {snippet.language}
          </span>
          {snippet.profiles?.username && (
            <span style={{ color: '#484f58', fontSize: '12px' }}>
              by {snippet.profiles.username}
            </span>
          )}
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

        {/* Code */}
        <div style={{ position: 'relative' }}>
          <button onClick={handleCopy} style={{
            position: 'absolute', top: '12px', right: '12px', zIndex: 10,
            background: '#161b22', border: '1px solid #30363d',
            borderRadius: '8px', padding: '3px 12px',
            color: copying ? '#3fb950' : '#8b949e',
            fontSize: '12px', cursor: 'pointer',
          }}>
            {copying ? 'copied!' : 'copy'}
          </button>
          <CodeBlock code={snippet.code} language={snippet.language} />
        </div>

      </div>
    </div>
  )
}