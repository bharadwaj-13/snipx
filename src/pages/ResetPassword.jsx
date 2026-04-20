import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LuTerminal, LuArrowRight, LuShieldCheck } from 'react-icons/lu'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      await supabase.auth.signOut()
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-void">
      <div className="void-bg">
        <div className="void-grid" />
        <div className="void-glow" />
      </div>

      <div className="void-container">
        <header className="void-nav">
          <div className="v-brand">
            <img src="/favicon.svg" alt="Logo" style={{ width: '22px', height: '22px' }} />
            <span>Snipx.</span>
          </div>
        </header>

        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="v-card" style={{ maxWidth: '450px', width: '100%' }}>
            <div className="v-card-head">
              <h2>Reset Architectural Key</h2>
              <p>Define your new secure password for the vault</p>
            </div>

            {success ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ color: 'var(--accent-green)', marginBottom: '16px' }}>
                  <LuShieldCheck size={48} style={{ margin: '0 auto' }} />
                </div>
                <h3 style={{ color: '#fff', marginBottom: '8px' }}>Password Secured</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>Redirecting to login gateway...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="v-form">
                {error && (
                  <div className="v-error">
                    <span>{error}</span>
                  </div>
                )}

                <div className="v-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoFocus
                  />
                </div>

                <button type="submit" disabled={loading} className="v-submit">
                  {loading ? 'Securing...' : (
                    <>Update Vault Key <LuArrowRight size={18} /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>

      <style>{`
        .login-void { height: 100vh; background: #000; color: #fff; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; position: relative; overflow: hidden; }
        .void-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .void-grid { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 40px 40px; mask-image: radial-gradient(circle, black, transparent 80%); }
        .void-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(255,255,255,0.03), transparent 70%); filter: blur(80px); }
        .void-container { position: relative; z-index: 10; height: 100vh; display: flex; flex-direction: column; max-width: 1200px; margin: 0 auto; width: 100%; padding: 0 40px; }
        .void-nav { position: absolute; top: 0; left: 40px; right: 40px; height: 100px; display: flex; align-items: center; justify-content: space-between; }
        .v-brand { display: flex; align-items: center; gap: 12px; text-decoration: none; color: #fff; font-weight: 800; font-size: 1.4rem; letter-spacing: -1px; }
        .v-logo { width: 32px; height: 32px; background: #fff; color: #000; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .v-card { background: rgba(10,10,10,0.6); backdrop-filter: blur(40px); border: 1px solid rgba(255,255,255,0.1); border-radius: 32px; padding: 40px; box-shadow: 0 50px 100px rgba(0,0,0,1); }
        .v-card-head { margin-bottom: 32px; text-align: center; }
        .v-card-head h2 { font-size: 24px; font-weight: 700; letter-spacing: -1px; margin-bottom: 8px; }
        .v-card-head p { color: #555; font-size: 14px; }
        .v-form { display: flex; flex-direction: column; gap: 20px; }
        .v-error { background: #111; border: 1px solid #333; color: #fff; padding: 12px; border-radius: 12px; font-size: 13px; text-align: center; }
        .v-group { display: flex; flex-direction: column; gap: 8px; }
        .v-group label { font-size: 12px; font-weight: 600; color: #666; }
        .v-group input { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; color: #fff; font-size: 14px; outline: none; transition: all 0.2s; }
        .v-group input:focus { border-color: #fff; background: rgba(255,255,255,0.05); }
        .v-submit { background: #fff; color: #000; border: none; padding: 14px; border-radius: 14px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: transform 0.2s; }
        .v-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 30px rgba(255,255,255,0.1); }
      `}</style>
    </div>
  )
}
