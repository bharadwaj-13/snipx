import { useState, useEffect } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { SiGoogle } from 'react-icons/si'
import { LuTerminal, LuArrowRight, LuShieldCheck, LuSparkles } from 'react-icons/lu'

import Logo from '../components/Logo'

export default function Login() {
  const { signIn, signInWithOAuth, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect')
      navigate(redirect || '/dashboard')
    }
  }

  async function handleSocialLogin(provider) {
    setError('')
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect') || sessionStorage.getItem('snipx_redirect')
    const { error } = await signInWithOAuth(provider, redirect || undefined)
    if (error) setError(error.message)
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setResetSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="login-void">
      {/* Immersive Background */}
      <div className="void-bg">
        <div className="void-grid" />
        <div
          className="void-spotlight"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div className="void-glow" />
      </div>

      <div className="void-container">
        {/* Top Header */}
        <header className="void-nav">
          <Link to="/" className="v-brand">
            <Logo size={22} />
            <span>Snipx.</span>
          </Link>
          <div className="v-status">
            <span className="v-dot" />
            Vault System Active
          </div>
        </header>

        {/* Main Content Cluster */}
        <main className="void-main">

          <div className="v-hero-side">
            <h1>Your code<br /> remembered.</h1>
            <p>The simplest code manager for developers. <br /> Your architectural vault is ready.</p>

            <div className="v-floating-code">
              <div className="vc-header">
                <div className="vc-dots"><span /><span /><span /></div>
                <span>useVault.sh</span>
              </div>
              <div className="vc-body editor-font">
                <div className="l"><span className="p">export function</span> <span className="f">Vault</span>() {'{'}</div>
                <div className="l">&nbsp;&nbsp;<span className="p">return</span> (</div>
                <div className="l">&nbsp;&nbsp;&nbsp;&nbsp;<span className="t">&lt;SecureStorage</span> <span className="a">id</span>=<span className="s">"snipx"</span> <span className="t">/&gt;</span></div>
                <div className="l">&nbsp;&nbsp;);</div>
                <div className="l">{'}'}</div>
              </div>
            </div>
          </div>

          <div className="v-form-side">
            <div className="v-card">
              <div className="v-card-head">
                <h2>{isResetting ? 'Recover Access' : 'Welcome back'}</h2>
                <p>{isResetting ? 'Enter your email to reset your vault key' : 'Enter your credentials to proceed'}</p>
              </div>

              {resetSent ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ color: 'var(--accent-green)', marginBottom: '16px' }}>
                    <LuShieldCheck size={40} style={{ margin: '0 auto' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Recovery Link Sent</h3>
                  <p style={{ color: '#555', fontSize: '14px', marginBottom: '24px' }}>Check your email to secure your architectural keys.</p>
                  <button onClick={() => { setResetSent(false); setIsResetting(false); }} className="v-submit" style={{ width: '100%' }}>
                    Back to Login
                  </button>
                </div>
              ) : isResetting ? (
                <form onSubmit={handleResetPassword} className="v-form">
                  {error && (
                    <div className="v-error">
                      <LuShieldCheck size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="v-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="architect@snipx.io"
                      required
                      autoFocus
                    />
                  </div>

                  <button type="submit" disabled={loading} className="v-submit">
                    {loading ? 'Processing...' : (
                      <>Send Recovery Link <LuArrowRight size={18} /></>
                    )}
                  </button>

                  <button type="button" onClick={() => setIsResetting(false)} style={{ background: 'none', border: 'none', color: '#444', fontSize: '13px', cursor: 'pointer', marginTop: '8px' }}>
                    Cancel & Return
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="v-form">
                  {error && (
                    <div className="v-error">
                      <LuShieldCheck size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="v-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="architect@snipx.io"
                      required
                    />
                  </div>

                  <div className="v-group">
                    <div className="v-label-row">
                      <label>Password</label>
                      <button type="button" onClick={() => setIsResetting(true)} style={{ background: 'none', border: 'none', color: '#444', fontSize: '11px', cursor: 'pointer', padding: 0 }}>Forgot?</button>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button type="submit" disabled={loading} className="v-submit">
                    {loading ? 'Authenticating...' : (
                      <>Initialize Session <LuArrowRight size={18} /></>
                    )}
                  </button>
                </form>
              )}

              <div className="v-divider">
                <div className="v-line" />
                <span>OR</span>
                <div className="v-line" />
              </div>

              <button onClick={() => handleSocialLogin('google')} className="v-google">
                <SiGoogle size={18} />
                <span>Continue with Google</span>
              </button>

              <p className="v-footer">
                Need a vault? <Link to="/signup">Join the network</Link>
              </p>
            </div>
          </div>

        </main>

        <footer className="void-footer">
          <div className="vf-left">© 2026 Snipx. Internal Access Only.</div>
          <div className="vf-right">AES-256 Encryption Secured</div>
        </footer>
      </div>

      <style>{`
        .login-void {
          height: 100vh;
          background: #000;
          color: #fff;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        /* BACKGROUND */
        .void-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .void-grid { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 40px 40px; mask-image: radial-gradient(circle, black, transparent 80%); }
        .void-spotlight { position: absolute; width: 1000px; height: 1000px; background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%); border-radius: 50%; z-index: 1; transition: width 0.3s, height 0.3s; }
        .void-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(255,255,255,0.03), transparent 70%); filter: blur(80px); }

        .void-container { 
          position: relative; 
          z-index: 10; 
          height: 100vh;
          display: flex; 
          flex-direction: column; 
          max-width: 1200px; 
          margin: 0 auto; 
          width: 100%; 
          padding: 0 40px; 
        }

        /* NAV */
        .void-nav { position: absolute; top: 0; left: 40px; right: 40px; height: 100px; display: flex; align-items: center; justify-content: space-between; }
        .v-brand { display: flex; align-items: center; gap: 12px; text-decoration: none; color: #fff; font-weight: 800; font-size: 1.4rem; letter-spacing: -1px; }
        .v-logo { width: 32px; height: 32px; background: #fff; color: #000; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .v-status { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; color: #444; text-transform: uppercase; letter-spacing: 1px; }
        .v-dot { width: 6px; height: 6px; background: #fff; border-radius: 50%; box-shadow: 0 0 10px #fff; animation: blink 2s infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        /* MAIN CLUSTER */
        .void-main { flex: 1; display: grid; grid-template-columns: 1.1fr 1fr; align-items: center; gap: 100px; padding-top: 40px; }
        
        .v-hero-side h1 { font-size: 72px; font-weight: 900; line-height: 0.9; letter-spacing: -4px; margin-bottom: 24px; }
        .v-hero-side p { font-size: 16px; color: #666; line-height: 1.6; margin-bottom: 40px; }

        .v-floating-code { width: 340px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; box-shadow: 0 30px 60px rgba(0,0,0,0.4); animation: float 6s infinite ease-in-out; transform: perspective(1000px) rotateX(10deg); }
        .vc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-size: 10px; color: #333; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
        .vc-dots { display: flex; gap: 6px; }
        .vc-dots span { width: 8px; height: 8px; background: #111; border-radius: 50%; }
        .vc-body { display: flex; flex-direction: column; gap: 4px; }
        .editor-font { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 13px; line-height: 1.6; }
        .vc-body .l { white-space: nowrap; }
        .vc-body .p { color: #fff; font-weight: 700; }    /* bold white */
        .vc-body .f { color: #fff; }                   /* white */
        .vc-body .t { color: #888; }                   /* mid gray */
        .vc-body .a { color: #555; }                   /* dark gray */
        .vc-body .s { color: #aaa; }                   /* light gray */

        @keyframes float { 0%, 100% { transform: perspective(1000px) rotateX(10deg) translateY(0); } 50% { transform: perspective(1000px) rotateX(8deg) translateY(-15px); } }

        /* FORM SIDE */
        .v-card { background: rgba(10,10,10,0.6); backdrop-filter: blur(40px); border: 1px solid rgba(255,255,255,0.1); border-radius: 32px; padding: 40px; box-shadow: 0 50px 100px rgba(0,0,0,1); }
        .v-card-head { margin-bottom: 32px; text-align: center; }
        .v-card-head h2 { font-size: 24px; font-weight: 700; letter-spacing: -1px; margin-bottom: 8px; }
        .v-card-head p { color: #555; font-size: 14px; }

        .v-form { display: flex; flex-direction: column; gap: 20px; }
        .v-error { background: #111; border: 1px solid #333; color: #fff; padding: 12px; border-radius: 12px; font-size: 13px; display: flex; align-items: center; gap: 10px; }
        .v-group { display: flex; flex-direction: column; gap: 8px; }
        .v-group label { font-size: 12px; font-weight: 600; color: #666; }
        .v-label-row { display: flex; justify-content: space-between; align-items: center; }
        .v-label-row a { font-size: 11px; color: #444; text-decoration: none; }
        .v-group input { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; color: #fff; font-size: 14px; outline: none; transition: all 0.2s; }
        .v-group input:focus { border-color: #fff; background: rgba(255,255,255,0.05); }

        .v-submit { background: #fff; color: #000; border: none; padding: 14px; border-radius: 14px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: transform 0.2s; }
        .v-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 30px rgba(255,255,255,0.1); }

        .v-divider { display: flex; align-items: center; gap: 16px; margin: 24px 0; }
        .v-line { flex: 1; height: 1px; background: rgba(255,255,255,0.05); }
        .v-divider span { font-size: 9px; font-weight: 800; color: #222; letter-spacing: 2px; }

        .v-google { width: 100%; padding: 14px; border-radius: 14px; background: #000; border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 14px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 12px; cursor: pointer; transition: all 0.2s; }
        .v-google:hover { background: rgba(255,255,255,0.05); border-color: #fff; }

        .v-footer { margin-top: 32px; text-align: center; color: #333; font-size: 13px; }
        .v-footer a { color: #fff; text-decoration: none; font-weight: 600; }

        /* FOOTER */
        .void-footer { position: absolute; bottom: 0; left: 40px; right: 40px; height: 80px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.05); color: #222; font-size: 11px; font-weight: 600; }

        @media (max-width: 1024px) {
          .void-main { grid-template-columns: 1fr; gap: 40px; padding-top: 40px; }
          .v-hero-side { text-align: center; display: flex; flex-direction: column; align-items: center; }
          .v-hero-side h1 { font-size: 50px; }
          .v-floating-code { display: none; }
        }
      `}</style>
    </div>
  )
}