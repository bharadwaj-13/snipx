import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { getSnippets } from '../services/snippets'
import { LuUser, LuGithub, LuGlobe, LuTwitter, LuUpload, LuCheck, LuArrowRight, LuShieldCheck, LuActivity, LuArrowLeft, LuTrash2 } from 'react-icons/lu'

export default function Profile() {
  const { user, profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAvatarMenu, setShowAvatarMenu] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [stats, setStats] = useState({ totalSnippets: 0, publicSnippets: 0 })
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatar_url: '',
    website: '',
    twitter: '',
    github: ''
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        website: profile.website || '',
        twitter: profile.twitter || '',
        github: profile.github || ''
      })
    }
  }, [profile])

  useEffect(() => {
    async function loadStats() {
      if (!user) return
      try {
        const { data: snippets } = await getSnippets(user.id)
        setStats({
          totalSnippets: snippets?.length || 0,
          publicSnippets: snippets?.filter(s => s.visibility === 'public').length || 0
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }
    loadStats()
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(formData)
      setMsg({ type: 'success', text: 'Profile saved successfully.' })
      setTimeout(() => setMsg({ type: '', text: '' }), 3000)
    } catch (error) {
      const errorMsg = error.message?.includes('profiles_username_key') 
        ? 'Username already taken.' 
        : 'Error saving profile: ' + error.message
      setMsg({ type: 'error', text: errorMsg })
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Math.random()}.${fileExt}`
      const { error } = await supabase.storage.from('avatars').upload(fileName, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)

      const updatedData = { ...formData, avatar_url: publicUrl }
      setFormData(updatedData)
      await updateProfile(updatedData)
      setMsg({ type: 'success', text: 'Profile picture updated.' })
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert("Upload failed. Make sure 'avatars' bucket exists in Supabase.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="profile-void">
      {/* Background Ambience */}
      <div className="p-grid" />
      <div className="p-glow" />

      <div className="p-container">
        <button 
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', color: 'var(--text-muted)', 
            cursor: 'pointer', marginBottom: '32px', padding: 0,
            transition: 'all 0.22s',
            fontWeight: 600, fontSize: '13px'
          }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <LuArrowLeft size={18} /> <span>Back</span>
        </button>

        {/* Header Section */}
        <header className="p-header">
          <div className="avatar-console">
            <div 
              className="avatar-ring" 
              onClick={() => setShowAvatarMenu(!showAvatarMenu)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">{formData.username?.[0] || user.email?.[0]}</div>
              )}

              {/* Hover Overlay */}
              <div className="avatar-hover" style={{ opacity: showAvatarMenu ? 1 : undefined }}>
                <LuUpload size={20} />
              </div>
            </div>

            {/* Avatar Dropdown Menu - Moved OUTSIDE avatar-ring to avoid overflow:hidden clipping */}
            {showAvatarMenu && (
              <div 
                className="avatar-dropdown"
                style={{
                  position: 'absolute', top: '132px', left: '0', 
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: '16px', padding: '8px', zIndex: 1000, width: '180px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)', animation: 'fade-in 0.2s ease-out'
                }}
                onClick={e => e.stopPropagation()}
              >
                <button 
                  onClick={() => { document.getElementById('avatar-up').click(); setShowAvatarMenu(false); }}
                  style={{
                    width: '100%', padding: '12px', background: 'none', border: 'none',
                    color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600,
                    textAlign: 'left', borderRadius: '10px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseOut={e => e.currentTarget.style.background = 'none'}
                >
                  <LuUpload size={16} /> Update Photo
                </button>
                <button 
                  onClick={() => { setFormData({ ...formData, avatar_url: '' }); setShowAvatarMenu(false); }}
                  style={{
                    width: '100%', padding: '12px', background: 'none', border: 'none',
                    color: 'var(--accent-red)', fontSize: '13px', fontWeight: 600,
                    textAlign: 'left', borderRadius: '10px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                  onMouseOut={e => e.currentTarget.style.background = 'none'}
                >
                  <LuTrash2 size={16} /> Remove Photo
                </button>
              </div>
            )}
            
            <input type="file" id="avatar-up" hidden accept="image/*" onChange={handleAvatarUpload} />
            <div className="user-meta">
              <h1>{formData.username || 'User'}</h1>
              <p>{user.email}</p>
              <div className="status-badge">
                <span className="dot" />
                Online
              </div>
            </div>
          </div>

          <div className="p-stats">
            <div className="stat-unit">
              <span className="label">Total Snippets</span>
              <span className="value">{stats.totalSnippets}</span>
            </div>
            <div className="stat-unit">
              <span className="label">Public</span>
              <span className="value">{stats.publicSnippets}</span>
            </div>
          </div>
        </header>

        <main className="p-main">

          <div className="p-card">
            <div className="card-head">
              <h2><LuUser size={18} /> Profile Settings</h2>
              <p>Update your personal information and links</p>
            </div>

            <form onSubmit={handleSubmit} className="p-form">
              <div className="form-row">
                <div className="field">
                  <label>Display Name</label>
                  <input
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Your Name"
                    className="input"
                  />
                </div>
                <div className="field">
                  <label>GitHub</label>
                  <div className="input-with-icon">
                    <LuGithub size={14} className="icon" />
                    <input
                      value={formData.github}
                      onChange={e => setFormData({ ...formData, github: e.target.value })}
                      placeholder="username"
                      className="input"
                    />
                  </div>
                </div>
              </div>

              <div className="field">
                <label>About You</label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="input"
                />
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Portfolio URL</label>
                  <div className="input-with-icon">
                    <LuGlobe size={14} className="icon" />
                    <input
                      value={formData.website}
                      onChange={e => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://..."
                      className="input"
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Twitter / X</label>
                  <div className="input-with-icon">
                    <LuTwitter size={14} className="icon" />
                    <input
                      value={formData.twitter}
                      onChange={e => setFormData({ ...formData, twitter: e.target.value })}
                      placeholder="@handle"
                      className="input"
                    />
                  </div>
                </div>
              </div>

              {msg.text && (
                <div className={`p-toast ${msg.type}`}>
                  <LuShieldCheck size={16} />
                  {msg.text}
                </div>
              )}

              <div className="form-footer">
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 24px' }}>
                  {saving ? 'Saving...' : <>Save Changes <LuCheck size={18} /></>}
                </button>
              </div>
            </form>
          </div>

          <aside className="p-sidebar">
            <div className="sid-card">
              <h3><LuActivity size={16} /> Account Info</h3>
              <div className="sid-item">
                <span className="label">Joined</span>
                <span className="dim">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              <div className="sid-item">
                <span className="label">Plan</span>
                <span className="dim">Free Tier</span>
              </div>
              <div className="sid-item">
                <span className="label">Security</span>
                <span className="dim">Encrypted</span>
              </div>
            </div>

            <div className="sid-card help">
              <h3>Support / Suggesstions</h3>
              <p>Need help? Reach out to <a href="mailto:workk.15413@gmail.com" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>workk.15413@gmail.com</a></p>
            </div>
          </aside>

        </main>
      </div>

      <style>{`
        .profile-void { min-height: 100vh; background: var(--bg-primary); color: var(--text-primary); position: relative; overflow-x: hidden; padding-bottom: 100px; }
        .p-grid { position: fixed; inset: 0; background-image: radial-gradient(var(--border) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; opacity: 0.3; }
        .p-glow { position: fixed; top: -10%; left: -10%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(255,255,255,0.05) 0.05, transparent 70%); filter: blur(100px); pointer-events: none; z-index: 0; }

        .p-container { max-width: 1000px; margin: 0 auto; padding: 60px 40px 0 40px; position: relative; z-index: 10; }

        /* HEADER */
        .p-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 60px; }
        .avatar-console { display: flex; align-items: center; gap: 32px; }
        .avatar-ring { position: relative; width: 120px; height: 120px; border-radius: 50%; border: 1px solid var(--border); background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .avatar-ring img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-placeholder { font-size: 40px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
        .avatar-hover { position: absolute; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s; cursor: pointer; color: #fff; }
        .avatar-ring:hover .avatar-hover { opacity: 1; }

        .user-meta h1 { font-size: 32px; font-weight: 800; letter-spacing: -1px; margin: 0; color: var(--text-primary); }
        .user-meta p { color: var(--text-secondary); margin: 4px 0 12px 0; font-size: 15px; }
        .status-badge { display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); background: var(--bg-tertiary); padding: 4px 10px; border-radius: 100px; width: fit-content; }
        .status-badge .dot { width: 6px; height: 6px; background: var(--accent-green); border-radius: 50%; box-shadow: 0 0 8px var(--accent-green); }

        .p-stats { display: flex; gap: 40px; }
        .stat-unit { display: flex; flex-direction: column; }
        .stat-unit .label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
        .stat-unit .value { font-size: 24px; font-weight: 700; color: var(--text-primary); }

        /* MAIN */
        .p-main { display: grid; grid-template-columns: 1fr 280px; gap: 40px; }
        .p-card { background: var(--bg-secondary); backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: 24px; padding: 40px; }
        .card-head { margin-bottom: 40px; }
        .card-head h2 { display: flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 700; margin: 0 0 8px 0; color: var(--text-primary); }
        .card-head p { color: var(--text-secondary); font-size: 14px; margin: 0; }

        .p-form { display: flex; flex-direction: column; gap: 24px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .field { display: flex; flex-direction: column; gap: 8px; }
        .field label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
        .input-with-icon { position: relative; }
        .input-with-icon .icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .input-with-icon input { padding-left: 40px; width: 100%; }

        .p-toast { background: var(--bg-tertiary); border: 1px solid var(--border); padding: 12px 20px; border-radius: 12px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 12px; color: var(--accent-green); }

        /* SIDEBAR */
        .p-sidebar { display: flex; flex-direction: column; gap: 24px; }
        .sid-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 20px; padding: 24px; }
        .sid-card h3 { font-size: 13px; font-weight: 700; margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px; color: var(--text-muted); }
        .sid-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 12px; }
        .sid-item .label { color: var(--text-muted); }
        .dim { color: var(--text-secondary); font-weight: 600; }
        .help p { font-size: 12px; color: var(--text-secondary); line-height: 1.6; }

        .spinner { width: 20px; height: 20px; border: 2px solid var(--border); border-top-color: var(--text-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .p-header { flex-direction: column; align-items: flex-start; gap: 32px; }
          .p-main { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
        }

        @keyframes fade-in { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
      `}</style>
    </div>
  )
}