import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SiGoogle } from 'react-icons/si'
import { LuTerminal, LuArrowRight, LuShieldCheck, LuSparkles } from 'react-icons/lu'

import Logo from '../components/Logo'

export default function Signup() {
  const { signUp, signInWithOAuth, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (user && !authLoading) navigate('/dashboard')

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [user, authLoading, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signUp(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  async function handleSocialLogin(provider) {
    setError('')
    const { error } = await signInWithOAuth(provider)
    if (error) {
      setError(error.message)
    }
  }

  return (
    <div className="auth-container">
      {/* Immersive Background */}
      <div className="auth-bg">
        <div className="auth-grid" />
        <div
          className="auth-spotlight"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>

      <div className="auth-content">
        <Link to="/" className="auth-logo">
          <Logo size={24} />
          <span>Snipx.</span>
        </Link>

        <div className="auth-card">
          <div className="auth-header">
            <h1>Create your vault</h1>
            <p>Join the architecture for your code.</p>
          </div>

          <button
            onClick={() => handleSocialLogin('google')}
            className="social-btn"
          >
            <SiGoogle size={18} />
            <span>Sign up with Google</span>
          </button>

          <div className="auth-divider">
            <div className="line" />
            <span>or use email</span>
            <div className="line" />
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-error">
                <LuShieldCheck size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="architect@snipx.io"
                required
              />
            </div>

            <div className="input-group">
              <div className="label-row">
                <label>Choose Password</label>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn" style={{ background: '#fff', color: '#000', borderColor: '#fff' }}>
              {loading ? 'Generating Vault...' : (
                <>
                  Initialize Vault <LuSparkles size={18} />
                </>
              )}
            </button>
          </form>

          <p className="auth-footer">
            Already have a vault? <Link to="/login">Sign in here</Link>
          </p>
        </div>

        <div className="auth-security">
          <LuShieldCheck size={14} />
          <span>Private, encrypted, and decentralized by default.</span>
        </div>
      </div>

      <style>{`
        .auth-container {
          min-height: 100vh;
          background: #000;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .auth-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .auth-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(circle, black, transparent 80%);
        }

        .auth-spotlight {
          position: absolute;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%);
          border-radius: 50%;
          z-index: 1;
        }

        .auth-content {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .auth-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          text-decoration: none;
          color: #fff;
          font-weight: 800;
          font-size: 1.5rem;
          letter-spacing: -1px;
          transition: transform 0.3s ease;
        }

        .auth-logo:hover {
          transform: scale(1.05);
        }

        .logo-box {
          width: 36px;
          height: 36px;
          background: #fff;
          color: #000;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-card {
          width: 100%;
          background: rgba(10, 10, 10, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          padding: 40px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-header h1 {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }

        .auth-header p {
          color: #666;
          font-size: 15px;
        }

        .social-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: rgba(255,255,255,0.03);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 24px;
        }

        .social-btn:hover {
          transform: translateY(-2px);
          background: #fff;
          color: #000;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .auth-divider .line {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
        }

        .auth-divider span {
          font-size: 12px;
          color: #444;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .auth-error {
          background: #111;
          border: 1px solid #333;
          color: #fff;
          padding: 12px;
          border-radius: 12px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-size: 13px;
          font-weight: 600;
          color: #888;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .input-group input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 14px;
          color: #fff;
          font-size: 15px;
          outline: none;
          transition: all 0.2s ease;
        }

        .input-group input:focus {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
        }

        .submit-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 16px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255,255,255,0.1);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .auth-footer {
          margin-top: 32px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }

        .auth-footer a {
          color: #fff;
          font-weight: 600;
          text-decoration: none;
        }

        .auth-footer a:hover {
          text-decoration: underline;
        }

        .auth-security {
          margin-top: 32px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #333;
          font-size: 12px;
          font-weight: 500;
          text-align: center;
          max-width: 250px;
        }
      `}</style>
    </div>
  )
}