import { useState, useEffect } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { migrateGlobalVault, purgeAllSnippets } from '../services/snippets'
import { getAdmins, addAdmin, removeAdmin } from '../services/admin'
import { 
  LuShieldAlert, LuUsers, LuDatabase, LuGithub, LuTrash, 
  LuArrowLeft, LuUserPlus, LuUserMinus, LuZap, LuActivity,
  LuExternalLink, LuSearch, LuRefreshCw
} from 'react-icons/lu'
import Logo from '../components/Logo'

export default function SuperAdminDashboard() {
  const { profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ total: 0, inDb: 0, inGist: 0, totalUsers: 0 })
  const [snippets, setSnippets] = useState([])
  const [admins, setAdmins] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [newAdminInput, setNewAdminInput] = useState('')

  // PROGRESS TRACKING
  const [syncStatus, setSyncStatus] = useState({ 
    active: false, 
    current: 0, 
    total: 0, 
    label: '',
    percent: 0 
  })

  useEffect(() => {
    if (profile?.is_super_admin) {
      loadData()
    }
  }, [profile])

  async function loadData() {
    setLoading(true)
    const { count: total } = await supabase.from('snippets').select('*', { count: 'exact', head: true })
    const { count: inGist } = await supabase.from('snippets').select('*', { count: 'exact', head: true }).not('gist_id', 'is', null)
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    setStats({ total: total || 0, inGist: inGist || 0, inDb: (total || 0) - (inGist || 0), totalUsers: totalUsers || 0 })
    const { data: feed } = await supabase.from('snippets').select('id, title, language, user_id, gist_id, created_at, profiles(username)').order('created_at', { ascending: false }).limit(50)
    if (feed) setSnippets(feed)
    const { data: adminList } = await getAdmins()
    if (adminList) setAdmins(adminList)
    setLoading(false)
  }

  async function startGlobalSync() {
    if(!confirm('Push EVERYONE to GitHub Gists?')) return
    setSyncStatus({ active: true, current: 0, total: 0, label: 'Initializing...', percent: 0 })
    const res = await migrateGlobalVault((current, total, label) => {
      setSyncStatus({ 
        active: true, current, total, 
        label: `Syncing: ${label}`, 
        percent: Math.round((current / total) * 100) 
      })
    })
    setSyncStatus(prev => ({ ...prev, active: false, label: 'Sync Complete!' }))
    setTimeout(() => setSyncStatus({ active: false, current: 0, total: 0, label: '', percent: 0 }), 3000)
    loadData()
    if (res.count > 0) alert(`Success! Optimized ${res.count} snippets.`)
    else if (res.message) alert(res.message)
  }

  async function handleAddAdmin(e) {
    e.preventDefault()
    if (!newAdminInput) return
    const { error } = await addAdmin(newAdminInput)
    if (error) alert(error)
    else { setNewAdminInput(''); loadData() }
  }

  async function handleWipeUser(userId, username) {
    if (!confirm(`WAR ZONE: Are you sure you want to delete ALL snippets from @${username}? This will wipe their entire vault.`)) return
    setLoading(true)
    const { error } = await supabase.from('snippets').delete().eq('user_id', userId)
    if (error) alert('Error: ' + error.message)
    else loadData()
    setLoading(false)
  }

  async function handleAdminDelete(id) {
    if (!confirm('Are you sure you want to PERMANENTLY DELETE this snippet from the platform? This cannot be undone.')) return
    setLoading(true)
    const { error } = await supabase.from('snippets').delete().eq('id', id)
    if (error) alert('Error: ' + error.message)
    else loadData()
    setLoading(false)
  }

  if (authLoading) return <div style={{ color: '#fff', padding: '100px', textAlign: 'center' }}>Authenticating System...</div>
  if (!profile?.is_super_admin) return <Navigate to="/dashboard" replace />

  const filteredSnippets = snippets.filter(s => 
    s.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Logo size={28} />
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px', margin: 0 }}>Super Admin HQ</h1>
              <p style={{ margin: 0, fontSize: '12px', color: '#ff4444', fontWeight: 600 }}>SYSTEM OVERRIDE ACTIVE</p>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', outline: 'none' }}>
            <LuArrowLeft size={16} /> Dashboard
          </button>
        </header>

        {/* TOP COMMAND BAR (Monochrome) */}
        <div style={{ background: '#111', border: '1px solid #333', borderRadius: '24px', padding: '24px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             <LuShieldAlert size={24} color="#fff" />
             <div>
               <h3 style={{ margin: 0, fontSize: '15px', color: '#fff' }}>System Override Console</h3>
               <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Critical storage & platform management.</p>
             </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={startGlobalSync}
              disabled={syncStatus.active}
              style={{ padding: '12px 24px', background: '#fff', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', opacity: syncStatus.active ? 0.5 : 1 }}
            >
              <LuZap size={18} /> {syncStatus.active ? 'SYNCING...' : 'GLOBAL VAULT SYNC'}
            </button>
            <button 
              onClick={async () => { if(!confirm('Wipe ALL database contents?')) return; await purgeAllSnippets(profile.id); loadData() }} 
              disabled={syncStatus.active} 
              style={{ padding: '12px 24px', background: 'transparent', border: '1px solid #333', color: '#fff', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <LuTrash size={18} /> TOTAL PURGE
            </button>
          </div>
        </div>

        {/* PROGRESS OVERLAY (Monochrome) */}
        {syncStatus.active && (
          <div style={{ marginBottom: '40px', background: '#111', border: '1px solid #fff', borderRadius: '24px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <LuRefreshCw className="animate-spin" size={24} color="#fff" />
                <h3 style={{ margin: 0, fontSize: '18px' }}>Global Migration in Progress...</h3>
              </div>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>{syncStatus.percent}%</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: '#000', borderRadius: '6px', overflow: 'hidden', marginBottom: '15px' }}>
              <div style={{ width: `${syncStatus.percent}%`, height: '100%', background: '#fff', transition: 'width 0.3s ease' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
              <span>{syncStatus.label}</span>
              <span>{syncStatus.current} / {syncStatus.total} Items</span>
            </div>
          </div>
        )}

        {/* STATS STRIP (Monochrome) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
          {[
            { label: 'Total Snippets', value: stats.total, icon: <LuActivity color="#fff" />, color: '#111' },
            { label: 'Saved to GitHub', value: stats.inGist, icon: <LuGithub color="#fff" />, color: '#111' },
            { label: 'Still in Database', value: stats.inDb, icon: <LuDatabase color="#fff" />, color: '#111' },
            { label: 'Total Users', value: stats.totalUsers, icon: <LuUsers color="#fff" />, color: '#111' }
          ].map((s, i) => (
            <div key={i} style={{ background: s.color, border: '1px solid #222', borderRadius: '20px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</span>
                {s.icon}
              </div>
              <span style={{ fontSize: '32px', fontWeight: 900 }}>{s.value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          
          {/* MASTER FEED */}
          <div style={{ background: '#0a0a0a', border: '1px solid #111', borderRadius: '24px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>Master Vault Feed</h2>
              <div style={{ position: 'relative' }}>
                <LuSearch size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ background: '#000', border: '1px solid #222', borderRadius: '10px', padding: '8px 12px 8px 35px', color: '#fff', fontSize: '12px', outline: 'none', width: '200px' }} />
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#444', borderBottom: '1px solid #111' }}>
                    <th style={{ padding: '12px' }}>Snippet</th>
                    <th style={{ padding: '12px' }}>Owner</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSnippets.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #0e0e0e' }}>
                      <td style={{ padding: '15px 12px' }}>
                        <div style={{ fontWeight: 600 }}>{s.title}</div>
                        <div style={{ fontSize: '10px', color: '#444' }}>{s.language}</div>
                      </td>
                      <td style={{ padding: '15px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>@{s.profiles?.username || 'unknown'}</span>
                          <button 
                            onClick={() => handleWipeUser(s.user_id, s.profiles?.username || 'unknown')} 
                            style={{ 
                              background: 'transparent', border: '1px solid rgba(255, 68, 68, 0.3)', 
                              color: '#ff4444', fontSize: '10px', fontWeight: 900,
                              borderRadius: '6px', padding: '2px 8px', cursor: 'pointer',
                              transition: 'all 0.2s', textTransform: 'uppercase'
                            }}
                            onMouseOver={e => {
                              e.currentTarget.style.background = 'rgba(255, 68, 68, 0.1)'
                              e.currentTarget.style.borderColor = '#ff4444'
                            }}
                            onMouseOut={e => {
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.borderColor = 'rgba(255, 68, 68, 0.3)'
                            }}
                            title="Wipe User Vault"
                          >
                            WIPE
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '15px 12px' }}>
                        {s.gist_id ? <span style={{ color: '#2ea44f' }}>Gist</span> : <span style={{ color: '#ff4444' }}>DB</span>}
                      </td>
                      <td style={{ padding: '15px 12px' }}>
                        <div style={{ display: 'flex', gap: '15px' }}>
                          <button onClick={() => navigate(`/snippet/${s.id}`)} style={{ background: 'transparent', border: 'none', color: '#0088ff', cursor: 'pointer', padding: 0 }} title="View">
                            <LuExternalLink size={18} />
                          </button>
                          <button onClick={() => handleAdminDelete(s.id)} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', padding: 0 }} title="Delete Snippet">
                            <LuTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ADMIN TEAM */}
          <div style={{ background: '#0a0a0a', border: '1px solid #111', borderRadius: '24px', padding: '32px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Admin Team</h2>
            <form onSubmit={handleAddAdmin} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input type="text" placeholder="Add UID..." value={newAdminInput} onChange={e => setNewAdminInput(e.target.value)} style={{ flex: 1, background: '#000', border: '1px solid #222', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '12px' }} />
              <button type="submit" style={{ background: '#fff', color: '#000', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer' }}><LuUserPlus size={16} /></button>
            </form>
            <div style={{ display: 'grid', gap: '10px' }}>
              {admins.map(admin => (
                <div key={admin.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: '#0e0e0e', borderRadius: '10px' }}>
                  <span style={{ fontSize: '12px' }}>{admin.username || admin.id.substring(0,8)}</span>
                  {!admin.is_super_admin && (
                    <button onClick={async () => { if(confirm('Revoke?')) { await removeAdmin(admin.id); loadData() } }} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}><LuUserMinus size={14} /> </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <style>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
