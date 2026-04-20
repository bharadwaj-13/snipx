import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProfileByUsername, getPublicSnippetsByUserId } from '../services/profiles'
import SnippetCard from '../components/SnippetCard'
import { LuGithub, LuGlobe, LuTwitter, LuTerminal, LuActivity, LuChevronLeft, LuArrowLeft } from 'react-icons/lu'

export default function PublicProfile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [snippets, setSnippets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { data: prof, error: profError } = await getProfileByUsername(username)
      
      if (profError || !prof) {
        setError('Vault not found.')
        setLoading(false)
        return
      }

      setProfile(prof)
      const { data: snips } = await getPublicSnippetsByUserId(prof.id)
      setSnippets(snips || [])
      setLoading(false)
    }
    loadData()
  }, [username])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spin" style={{ color: 'var(--text-muted)' }}>
          <LuTerminal size={32} />
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>404</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error || 'This architectural vault does not exist.'}</p>
        <Link to="/explore" className="btn btn-ghost"><LuChevronLeft /> Back to Explore</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', position: 'relative' }}>
      {/* Background Ambience */}
      <div style={{ position: 'fixed', top: 0, right: 0, width: '500px', height: '500px', background: 'radial-gradient(circle, var(--text-muted) 0.05, transparent 70%)', filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none', opacity: 0.2 }} />
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '100px 40px' }}>
        
        <button 
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute', top: '40px', left: '40px',
            background: 'none', border: 'none', 
            display: 'flex', alignItems: 'center', gap: '8px',
            color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s',
            fontSize: '13px', fontWeight: 600, padding: 0
          }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <LuArrowLeft size={18} /> <span>Back</span>
        </button>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '80px', flexWrap: 'wrap', gap: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-muted)' }}>{profile.username?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <div>
              <h1 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-1.5px', margin: 0 }}>{profile.username}</h1>
              {profile.bio && <p style={{ color: 'var(--text-secondary)', fontSize: '16px', margin: '8px 0 16px 0', maxWidth: '500px', lineHeight: 1.6 }}>{profile.bio}</p>}
              <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)' }}>
                {profile.github && <a href={`https://github.com/${profile.github}`} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}><LuGithub size={20} /></a>}
                {profile.twitter && <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}><LuTwitter size={20} /></a>}
                {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}><LuGlobe size={20} /></a>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '40px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Snippets</div>
              <div style={{ fontSize: '32px', fontWeight: 800 }}>{snippets.length}</div>
            </div>
          </div>
        </header>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-primary)' }} />
            <h2 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)' }}>Public Vault</h2>
          </div>

          {snippets.length === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '24px', color: 'var(--text-secondary)' }}>
              This vault is currently empty or all snippets are private.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {snippets.map(s => (
                <SnippetCard key={s.id} snippet={s} allowDelete={false} allowFork={true} />
              ))}
            </div>
          )}
        </section>

      </div>

      <style>{`
        .spin { animation: rotate 2s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
