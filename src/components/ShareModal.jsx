import { useState } from 'react'
import { LuX, LuCopy, LuEye, LuMessageSquare, LuEdit3, LuCheck } from 'react-icons/lu'

export default function ShareModal({ 
  onClose, 
  shareToken, 
  allowPublicEdit, 
  allowPublicComment, 
  onUpdatePermissions 
}) {
  const [copying, setCopying] = useState(false)
  const shareLink = `${window.location.origin}/s/${shareToken}`

  async function handleCopy() {
    await navigator.clipboard.writeText(shareLink)
    setCopying(true)
    setTimeout(() => setCopying(false), 2000)
  }

  const levels = [
    { id: 'view', label: 'View Only', icon: LuEye, edit: false, comment: false, desc: 'Static read-only access' },
    { id: 'comment', label: 'Can Comment', icon: LuMessageSquare, edit: false, comment: true, desc: 'Allows for insights and feedback' },
    { id: 'edit', label: 'Can Edit', icon: LuEdit3, edit: true, comment: true, desc: 'Full collaborative evolution' }
  ]

  const currentLevel = allowPublicEdit ? 'edit' : (allowPublicComment ? 'comment' : 'view')

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

        {/* Permissions */}
        <div style={{ padding: '0 32px 32px 32px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Control how others interact with this vault entry.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {levels.map(level => {
              const Icon = level.icon
              const active = currentLevel === level.id
              return (
                <button 
                  key={level.id}
                  onClick={() => onUpdatePermissions(level.edit, level.comment)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '16px 20px', borderRadius: '20px',
                    background: active ? 'rgba(52, 120, 255, 0.1)' : 'transparent',
                    border: active ? '1px solid var(--accent-blue)' : '1px solid var(--border)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', outline: 'none'
                  }}
                >
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '12px', 
                    background: active ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: active ? '#fff' : 'var(--text-muted)'
                  }}>
                    <Icon size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{level.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{level.desc}</div>
                  </div>
                  {active && <LuCheck size={20} color="var(--accent-blue)" />}
                </button>
              )
            })}
          </div>

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
