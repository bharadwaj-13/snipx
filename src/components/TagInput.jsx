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
      background: '#0d1117', border: '1px solid #30363d',
      borderRadius: '8px', padding: '6px 10px', minHeight: '42px',
    }}>
      {tags.map(tag => (
        <span key={tag} style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          background: '#21262d', border: '1px solid #30363d',
          borderRadius: '99px', padding: '2px 10px',
          fontSize: '12px', color: '#8b949e',
        }}>
          {tag}
          <span
            onClick={() => onChange(tags.filter(t => t !== tag))}
            style={{ cursor: 'pointer', color: '#484f58', fontSize: '14px', lineHeight: 1 }}
          >×</span>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? 'add tags (enter or comma)' : ''}
        style={{
          background: 'none', border: 'none', outline: 'none',
          color: '#e6edf3', fontSize: '13px', flex: 1, minWidth: '120px',
        }}
      />
    </div>
  )
}