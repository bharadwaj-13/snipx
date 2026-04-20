import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { LuArrowLeft } from 'react-icons/lu'

export default function Settings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setMsg({ type: 'error', text: error.message })
    else {
      setMsg({ type: 'success', text: 'Password updated successfully!' })
      setPassword('')
    }
    setLoading(false)
  }

  const handleExportData = async () => {
    setLoading(true)
    const { data } = await supabase.from('snippets').select('*').eq('user_id', user.id)
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `snipx_export_${new Date().toISOString().split('T')[0]}.json`
      a.click()
    }
    setLoading(false)
  }

  return (
    <div className="page-content" style={{ maxWidth: '800px', paddingBottom: '4rem' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', 
          background: 'none', border: 'none', color: 'var(--text-muted)', 
          fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '24px', padding: 0
        }}
        onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <LuArrowLeft size={18} /> <span>Back</span>
      </button>

      <div style={{ marginBottom: '3rem' }}>
        <h1 className="section-title" style={{ fontSize: '2rem', margin: 0 }}>Workspace Settings</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Manage your Snipx preferences and integrations.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Appearance */}
        <section>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Appearance</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Customize the look and feel of your vault.</p>
          </div>
          
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px' }}>
              <div>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>Interface Theme</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Currently using the <span style={{ textTransform: 'capitalize', color: 'var(--text-primary)', fontWeight: 600 }}>{theme}</span> theme natively.</div>
              </div>
              <button onClick={toggle} className="btn" style={{ padding: '8px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                {theme === 'dark' ? (
                   <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Switch to Light</span>
                ) : (
                   <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> Switch to Dark</span>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Security / Account */}
        <section>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Account Security</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Update your authentication credentials.</p>
          </div>
          
          <div className="card">
            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
              {msg.text && (
                <div style={{ padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', background: msg.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: msg.type === 'error' ? 'var(--accent-red)' : 'var(--accent-green)', border: `1px solid ${msg.type === 'error' ? 'var(--accent-red)' : 'var(--accent-green)'}` }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                  {msg.text}
                </div>
              )}
              <div>
                <label className="label">New Password</label>
                <input 
                  type="password" 
                  className="input" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </section>


        {/* Data Ownership */}
        <section>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Data Ownership</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>You own your code. Manage it how you see fit.</p>
          </div>

          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>Export Vault</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Download a .json file containing all your snippets.</div>
              </div>
              <button onClick={handleExportData} disabled={loading} className="btn btn-ghost" style={{ padding: '8px 16px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'rgba(239, 68, 68, 0.02)' }}>
              <div>
                <div style={{ fontWeight: 500, color: 'var(--accent-red)', marginBottom: '4px' }}>Delete Account</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Permanently erase your account and drop all snippet rows.</div>
              </div>
              <button 
                onClick={() => alert('Account deletion would be handled here via a Supabase Edge Function to cascade delete everything.')} 
                className="btn" 
                style={{ padding: '8px 16px', background: 'var(--accent-red)', color: '#fff', border: 'none' }}
              >
                Delete
              </button>
            </div>

          </div>
        </section>

      </div>
    </div>
  )
}
