import { useState } from 'react'
import { LuX, LuCopy, LuEye, LuMessageSquare, LuPencil, LuCheck } from 'react-icons/lu'

export default function ShareModal({ 
  onClose, 
  shareToken
}) {
  const [copying, setCopying] = useState(false)
  const shareLink = `${window.location.origin}/s/${shareToken}`

  async function handleCopy() {
    await navigator.clipboard.writeText(shareLink)
    setCopying(true)
    setTimeout(() => setCopying(false), 2000)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: '32px', width: '100%', maxWidth: '480px',
        boxShadow: '0 50px 100px rgba(0,0,0,0.5)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '32px', paddingBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Share Logic</h2>
          <button onClick={onClose} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LuX size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '0 32px 32px 32px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Anyone with this link can view this vault entry. It is strictly read-only.</p>
          
          <div style={{ marginTop: '32px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Vault Resource Link</div>
            <div style={{ 
              display: 'flex', gap: '8px', padding: '8px', 
              background: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border)' 
            }}>
              <input 
                readOnly 
                value={shareLink} 
                style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', paddingLeft: '12px', outline: 'none', fontFamily: 'monospace' }} 
              />
              <button 
                onClick={handleCopy}
                style={{
                  background: copying ? 'var(--accent-green)' : 'var(--text-primary)',
                  color: copying ? '#fff' : 'var(--bg-primary)',
                  border: 'none', borderRadius: '12px', padding: '10px 20px',
                  fontSize: '12px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                {copying ? <LuCheck size={16} /> : <LuCopy size={16} />}
                {copying ? 'COPIED' : 'COPY'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
