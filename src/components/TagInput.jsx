import { useState } from 'react'

export default function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('')

  function handleKeyDown(e) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      const newTag = input.trim().toLowerCase().replace(/,/g, '')
      if (!tags.includes(newTag) && tags.length < 8) {
        onChange([...tags, newTag])
      }
      setInput('')
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center',
      background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
      borderRadius: '12px', padding: '10px 14px', minHeight: '42px',
    }}>
      {tags.map(tag => (
        <span key={tag} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'var(--bg-primary)', border: '1px solid var(--border)',
          borderRadius: '99px', padding: '4px 12px',
          fontSize: '12px', color: 'var(--text-secondary)',
          fontWeight: 600
        }}>
          {tag}
          <span
            onClick={() => onChange(tags.filter(t => t !== tag))}
            style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1 }}
          >×</span>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? 'Add tags...' : ''}
        style={{
          background: 'none', border: 'none', outline: 'none',
          color: 'var(--text-primary)', fontSize: '13px', flex: 1, minWidth: '100px',
        }}
      />
    </div>
  )
}