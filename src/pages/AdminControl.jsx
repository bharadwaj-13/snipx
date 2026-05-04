import { useState, useEffect } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { migrateAllToGitHub, migrateGlobalVault, downloadAllSnippets, purgeAllSnippets } from '../services/snippets'
import { getAdmins, addAdmin, removeAdmin } from '../services/admin'
import { LuShieldCheck, LuDownload, LuTrash, LuGithub, LuArrowLeft, LuUserPlus, LuUserMinus, LuUsers, LuZap } from 'react-icons/lu'
import Logo from '../components/Logo'

export default function AdminControl() {
  const { user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [admins, setAdmins] = useState([])
  const [newAdminInput, setNewAdminInput] = useState('')

  useEffect(() => {
    if (profile?.is_admin) {
      loadAdmins()
    }
  }, [profile])

  async function loadAdmins() {
    const { data } = await getAdmins()
    if (data) setAdmins(data)
  }

  async function handleAddAdmin(e) {
    e.preventDefault()
    if (!newAdminInput) return
    setLoading(true)
    const { error } = await addAdmin(newAdminInput)
    if (error) alert(error)
    else {
      setNewAdminInput('')
      loadAdmins()
    }
    setLoading(false)
  }

  async function handleRemoveAdmin(userId) {
    if (userId === user.id) return alert("You cannot remove yourself!")
    if (!confirm('Revoke admin access for this user?')) return
    
    setLoading(true)
    await removeAdmin(userId)
    loadAdmins()
    setLoading(false)
  }

  if (authLoading) return <div style={{ padding: '100px', textAlign: 'center', color: '#fff' }}>Verifying Identity...</div>
  
  // SECURITY: Kick out non-admins
  if (!profile?.is_admin) return <Navigate to="/dashboard" replace />

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '60px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Logo size={24} />
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Vault Control {profile.is_super_admin ? '(Super)' : '(Admin)'}</h1>
          </div>
          <Link to="/dashboard" style={{ color: '#666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <LuArrowLeft size={16} /> Return to Dashboard
          </Link>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
          
          {/* LEFT: COMMON ADMIN UTILITIES */}
          <div style={{ display: 'grid', gap: '30px' }}>
            <div style={{ background: '#0a0a0a', border: '1px solid #111', borderRadius: '24px', padding: '32px' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Admin Utilities</h2>
              <p style={{ color: '#444', marginBottom: '32px', fontSize: '13px' }}>Maintenance tools available to all administrators.</p>

              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ padding: '20px', background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>GitHub Sync</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Offload code to Gists.</p>
                  </div>
                  <button 
                    onClick={async () => {
                      setLoading(true)
                      const res = await migrateAllToGitHub(user.id)
                      alert(`Migrated ${res.count} snippets.`)
                      setLoading(false)
                    }}
                    disabled={loading}
                    style={{ background: '#2ea44f', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}
                  >
                    <LuGithub size={14} /> Run Sync
                  </button>
                </div>

                <div style={{ padding: '20px', background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>Export Vault</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Download local backup.</p>
                  </div>
                  <button 
                    onClick={() => downloadAllSnippets(user.id)}
                    style={{ background: '#fff', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}
                  >
                    <LuDownload size={14} /> JSON
                  </button>
                </div>
              </div>
            </div>

            {/* ADMIN TEAM LIST (Viewable by all) */}
            <div style={{ background: '#0a0a0a', border: '1px solid #111', borderRadius: '24px', padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <LuUsers size={20} color="#444" />
                <h2 style={{ fontSize: '18px', margin: 0 }}>Administrator Team</h2>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {admins.map(admin => (
                  <div key={admin.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #111' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#222', overflow: 'hidden' }}>
                        {admin.avatar_url && <img src={admin.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{admin.username || 'System User'}</span>
                    </div>
                    
                    {/* ONLY Super Admin can see the remove button */}
                    {profile.is_super_admin && admin.id !== user.id && (
                      <button 
                        onClick={() => handleRemoveAdmin(admin.id)}
                        style={{ background: 'transparent', border: 'none', color: '#444', cursor: 'pointer' }}
                        title="Revoke Admin Access"
                      >
                        <LuUserMinus size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: SUPER ADMIN ZONE */}
          {profile.is_super_admin && (
            <div style={{ background: 'rgba(255, 68, 68, 0.02)', border: '1px solid rgba(255, 68, 68, 0.1)', borderRadius: '24px', padding: '32px' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '8px', color: '#ff4444' }}>Super Admin Zone</h2>
              <p style={{ color: '#666', marginBottom: '32px', fontSize: '13px' }}>Critical system controls and user management.</p>

              {/* Add Admin Section */}
              <div style={{ marginBottom: '40px', padding: '24px', background: 'rgba(255, 68, 68, 0.05)', borderRadius: '16px' }}>
                 <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Promote New Admin</h4>
                 <form onSubmit={handleAddAdmin} style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Paste User ID (UID)..."
                    value={newAdminInput}
                    onChange={e => setNewAdminInput(e.target.value)}
                    style={{ flex: 1, background: '#000', border: '1px solid #333', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none', fontSize: '13px' }}
                  />
                  <button type="submit" disabled={loading} style={{ background: '#ff4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 16px', cursor: 'pointer' }}>
                    <LuUserPlus size={18} />
                  </button>
                </form>
                <p style={{ margin: '12px 0 0 0', fontSize: '11px', color: '#666' }}>Paste a user UID from your Supabase Auth table to grant them access.</p>
              </div>

              {/* Global Sync Section */}
              <div style={{ marginBottom: '40px', padding: '24px', background: 'rgba(46, 164, 79, 0.05)', border: '1px solid rgba(46, 164, 79, 0.1)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#2ea44f' }}>Global Vault Sync</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Move EVERYONE to GitHub.</p>
                </div>
                <button 
                  onClick={async () => {
                    if(!confirm('This will find ALL plain-text snippets in the database and move them to your GitHub. Proceed?')) return
                    setLoading(true)
                    const res = await migrateGlobalVault()
                    alert(res.message || `Successfully migrated ${res.count} global snippets.`)
                    setLoading(false)
                  }}
                  disabled={loading}
                  style={{ background: '#2ea44f', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '13px' }}
                >
                  <LuZap size={16} /> GLOBAL SYNC
                </button>
              </div>

              {/* Purge Section */}
              <div style={{ padding: '24px', background: 'rgba(255, 68, 68, 0.1)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#ff4444' }}>Total Purge</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#ff4444', opacity: 0.7 }}>Reset DB to zero usage.</p>
                </div>
                <button 
                  onClick={async () => {
                    if(confirm('WIPE EVERYTHING? This cannot be undone.')) {
                      await purgeAllSnippets(user.id)
                      alert('Vault Purged.')
                    }
                  }}
                  style={{ background: '#ff4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '13px' }}
                >
                  <LuTrash size={16} /> PURGE
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
