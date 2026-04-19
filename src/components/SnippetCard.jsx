import { useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteSnippet } from '../services/snippets'

const LANG_COLORS = {
  javascript: '#f1e05a', typescript: '#3178c6', python: '#3572A5',
  rust: '#dea584', go: '#00ADD8', css: '#563d7c', html: '#e34c26',
  sql: '#e38c00', bash: '#89e051', json: '#292929', plaintext: '#8b949e',
}

export default function SnippetCard({ snippet, onDelete }) {
  const [copying, setCopying] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function handleCopy(e) {
    e.preventDefault()
    await navigator.clipboard.writeText(snippet.code)
    setCopying(true)
    setTimeout(() => setCopying(false), 1500)
  }

  async function handleDelete(e) {
    e.preventDefault()
    if (!confirming) { setConfirming(true); return }
    await deleteSnippet(snippet.id)
    onDelete(snippet.id)
  }

  const langColor = LANG_COLORS[snippet.language] ?? '#8b949e'
  const lineCount = snippet.code.split('\n').length

  return (
    <Link to={`/snippet/${snippet.id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: '#161b22', border: '1px solid #30363d',
          borderRadius: '12px', padding: '1.25rem', cursor: 'pointer',
          transition: 'border-color 0.15s', height: '100%',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#58a6ff44'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#30363d'}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: langColor, flexShrink: 0 }} />
            <span style={{
              color: '#e6edf3', fontWeight: '500', fontSize: '14px',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {snippet.title}
            </span>
          </div>
          <span style={{
            fontSize: '11px', padding: '2px 8px', borderRadius: '99px', flexShrink: 0,
            background: snippet.visibility === 'public' ? '#1a3a2a' : '#21262d',
            color: snippet.visibility === 'public' ? '#3fb950' : '#8b949e',
            border: `1px solid ${snippet.visibility === 'public' ? '#2ea04330' : '#30363d'}`,
          }}>
            {snippet.visibility}
          </span>
        </div>

        {/* Description */}
        {snippet.description && (
          <p style={{
            color: '#8b949e', fontSize: '13px', lineHeight: '1.5', margin: 0,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {snippet.description}
          </p>
        )}

        {/* Code preview */}
        <div style={{
          background: '#0d1117', borderRadius: '8px', padding: '0.75rem',
          fontFamily: 'monospace', fontSize: '12px', color: '#8b949e',
          overflow: 'hidden', maxHeight: '72px', lineHeight: '1.6',
        }}>
          {snippet.code.split('\n').slice(0, 3).map((line, i) => (
            <div key={i} style={{ whiteSpace: 'pre', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {line || ' '}
            </div>
          ))}
        </div>

        {/* Tags */}
        {snippet.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {snippet.tags.slice(0, 4).map(tag => (
              <span key={tag} style={{
                fontSize: '11px', padding: '2px 8px', borderRadius: '99px',
                background: '#21262d', color: '#8b949e', border: '1px solid #30363d',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <span style={{ color: '#484f58', fontSize: '12px', fontFamily: 'monospace' }}>
            {snippet.language} · {lineCount} lines
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={handleCopy} style={{
              background: 'none', border: '1px solid #30363d', borderRadius: '6px',
              padding: '3px 10px', color: copying ? '#3fb950' : '#8b949e',
              fontSize: '12px', cursor: 'pointer',
            }}>
              {copying ? 'copied!' : 'copy'}
            </button>
            <button onClick={handleDelete} onBlur={() => setConfirming(false)} style={{
              background: 'none',
              border: `1px solid ${confirming ? '#f7816650' : '#30363d'}`,
              borderRadius: '6px', padding: '3px 10px',
              color: confirming ? '#f78166' : '#8b949e',
              fontSize: '12px', cursor: 'pointer',
            }}>
              {confirming ? 'sure?' : 'del'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}