import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LuCommand, LuFolder, LuGlobe,
  LuChevronRight, LuSearch, LuShield,
  LuCode, LuLayers, LuCloud, LuLayoutDashboard
} from 'react-icons/lu'

import Logo from '../components/Logo'

export default function Landing() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const mockupRef = useRef(null)

  useEffect(() => {
    if (!loading && user) navigate('/dashboard')

    const handleScroll = () => setScrolled(window.scrollY > 20)
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [user, loading, navigate])

  // Scroll reveal logic
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('reveal-on')
      })
    }, { threshold: 0.1 })
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="snipx-root">

      {/* Extreme Depth Background */}
      <div className="bg-canvas">
        <div className="bg-glow g1" />
        <div className="bg-glow g2" />

        {/* Interactive Mouse Spotlight */}
        <div
          className="mouse-spotlight"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            transform: 'translate(-50%, -50%)'
          }}
        />

        {/* Hero Beam Factor */}
        <div className="hero-beam" />

        {/* Floating Space Shards */}
        <div className="shard s1" />
        <div className="shard s2" />
        <div className="shard s3" />

        <div className="bg-grid" />
      </div>

      {/* Navigation */}
      <nav className={`nav-bar ${scrolled ? 'nav-filled' : ''}`}>
        <div className="nav-container">
          <div className="brand">
            <Logo size={20} />
            <span>Snipx.</span>
          </div>
          <div className="nav-actions">
            <Link to="/login" className="nav-link">Sign in</Link>
            <Link to="/login" className="nav-btn-primary">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-wrap reveal">
          <div className="badge">
            <span className="badge-dot" />
            v1 now live
          </div>
          <h1 className="hero-title">
            <span style={{ whiteSpace: 'nowrap' }}>All your snippets.</span> <br />
            <span className="hero-accent">At one place.</span>
          </h1>
          <p className="hero-subtitle">
            The simplest code manager for developers. Save your snippets,
            organize with folders, and access your library from any machine.
          </p>
          <div className="hero-cta">
            <Link to="/login" className="btn-mega">
              Get Started<LuChevronRight size={20} />
            </Link>
          </div>
        </div>
      </header>

      {/* Product Glimpse */}
      <section className="product-glimpse reveal" ref={mockupRef}>
        <div className="glimpse-stage">
          <div className="glimpse-glow" />
          <div className="glimpse-frame">
            <div className="app-window">
              <div className="aw-header">
                <div className="aw-dots"><span /><span /><span /></div>
                <div className="aw-search"><LuSearch size={12} /> <span>Quick search...</span></div>
                <div className="aw-user" />
              </div>

              <div className="aw-body">
                <div className="aw-sidebar">
                  <div className="aw-icon active"><LuLayoutDashboard /></div>
                  <div className="aw-icon"><LuFolder /></div>
                  <div className="aw-icon"><LuGlobe /></div>
                </div>

                <div className="aw-canvas">
                  <div className="aw-top">
                    <h3>My Library</h3>
                    <div className="aw-pill">+ New Snippet</div>
                  </div>
                  <div className="aw-grid">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="aw-card">
                        <div className="aw-card-line" style={{ width: '70%', background: '#111' }} />
                        <div className="aw-card-line" style={{ width: '40%', opacity: 0.5, background: '#111' }} />
                        <div className="aw-card-footer" style={{ background: '#111' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interaction: Typing Editor Layer (Floating) */}
              <div className="floating-editor">
                <div className="fe-head">useDebounce.ts</div>
                <div className="fe-code">
                  <div className="fe-typing">
                    <span>export function</span> <span>useDebounce</span>(value, delay) {'{'} <br />
                    &nbsp;&nbsp;<span>const</span> [state, setState] = useState(value) <br />
                    &nbsp;&nbsp;<span>useEffect</span>(() =&gt; {'{'} ... {'}'}) <br />
                    {'}'}
                  </div>
                </div>
              </div>

              {/* Interaction: Command Palette Layer (Floating Top) */}
              <div className="floating-palette">
                <div className="fp-input"><LuCommand size={14} /> <span>useDebounce</span></div>
                <div className="fp-results">
                  <div className="fp-row active">useDebounce.ts <span className="fp-tag">React</span></div>
                  <div className="fp-row">debounce.sh <span className="fp-tag">Bash</span></div>
                </div>
              </div>
            </div>
            <div className="aw-reflection" />
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="features-grid-section">
        <div className="feat-header reveal">
          <h2>Built for engineers.</h2>
          <p>Uncompromising speed and organization for your daily workflow.</p>
        </div>

        <div className="bento-grid">

          <div className="bento-card b-slim reveal">
            <div className="b-icon"><LuShield /></div>
            <h3>Security</h3>
            <p>Your logic is stored safely in private vaults. You have total control over what is public and what is private.</p>
          </div>

          <div className="bento-card b-slim reveal">
            <div className="b-icon"><LuCloud /></div>
            <h3>Cloud Sync</h3>
            <p>Log in from any device and your entire library is there. No configuration required, just your code.</p>
          </div>

          <div className="bento-card b-slim reveal">
            <div className="b-icon"><LuCode /></div>
            <h3>Better Formatting</h3>
            <p>Everything is automatically cleaned and highlighted for you. Supports over 50+ programming languages.</p>
          </div>

          <div className="bento-card b-large reveal">
            <div className="b-icon"><LuLayers /></div>
            <h3>Simple Folders</h3>
            <p>Group your code by project, technology, or category. Keep your library organized and easy to navigate.</p>
            <div className="b-visual folder-vis">
              <div className="v-folder" /><div className="v-folder" /><div className="v-folder" />
            </div>
          </div>

          <div className="bento-card b-slim reveal">
            <div className="b-icon"><LuGlobe /></div>
            <h3>The Network</h3>
            <p>Learn from a community of top developers. Browse public snippets and save best practices to your own vault.</p>
          </div>

        </div>
      </section>

      {/* Outro */}
      <section className="outro">
        <div className="outro-wrap reveal">
          <h2 className="outro-title">Start building.</h2>
          <p className="outro-desc">
            Upgrade your organization and Join thousands of developers today.
          </p>
          <div className="outro-actions">
            <Link to="/login" className="btn-mega">Get Started</Link>
            <Link to="/login" className="outro-link">Sign in</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="f-left">Snipx. <a href="mailto:workk.15413@gmail.com" style={{ color: 'inherit', marginLeft: '12px', fontWeight: 500, opacity: 0.6 }}>workk.15413@gmail.com</a></div>
          <div className="f-right">© 2026. Built for developers.</div>
        </div>
      </footer>

      <style>{`
        .snipx-root { background: #000; color: #fff; font-family: 'Inter', -apple-system, sans-serif; overflow-x: hidden; min-height: 100vh; position: relative; }
        
        /* Background Environment */
        .bg-canvas { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .bg-glow { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.1; }
        .g1 { top: -10%; left: -10%; width: 60vw; height: 60vw; background: radial-gradient(white, transparent); }
        .g2 { bottom: -10%; right: -10%; width: 50vw; height: 50vw; background: radial-gradient(#222, transparent); }
        .bg-grid { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 40px 40px; mask-image: radial-gradient(circle, black, transparent 80%); }

        /* Mouse Spotlight */
        .mouse-spotlight { position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%); border-radius: 50%; z-index: 1; pointer-events: none; transition: width 0.3s, height 0.3s; }
        
        /* Hero Beam */
        .hero-beam { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 1px; height: 100vh; background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent); z-index: 0; }
        .hero-beam::after { content: ''; position: absolute; top: 20%; left: 50%; transform: translateX(-50%); width: 200px; height: 400px; background: rgba(255,255,255,0.02); filter: blur(100px); }

        /* Shards */
        .shard { position: absolute; background: rgba(255,255,255,0.1); width: 2px; height: 100px; border-radius: 2px; filter: blur(1px); animation: floatShard 10s infinite ease-in-out alternate; }
        .s1 { top: 20%; left: 15%; height: 60px; transform: rotate(45deg); animation-delay: 0.5s; }
        .s2 { top: 60%; right: 10%; height: 120px; transform: rotate(-20deg); animation-delay: 2s; }
        .s3 { bottom: 10%; left: 30%; height: 40px; transform: rotate(110deg); animation-delay: 4s; }

        @keyframes floatShard { 0% { transform: translateY(0) rotate(var(--r, 45deg)); } 100% { transform: translateY(-30px) rotate(var(--r, 45deg)); } }

        .nav-bar { position: fixed; top: 0; left: 0; right: 0; height: 72px; z-index: 1000; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .nav-filled { background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        
        .nav-container { max-width: 1300px; margin: 0 auto; height: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; }
        .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 1.2rem; letter-spacing: -1px; }
        .brand-box { width: 32px; height: 32px; background: #fff; color: #000; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .nav-actions { display: flex; align-items: center; gap: 2rem; }
        .nav-link { color: #888; text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.3s; }
        .nav-link:hover { color: #fff; }
        .nav-btn-primary { background: #fff; color: #000; padding: 10px 20px; border-radius: 100px; font-size: 13px; font-weight: 600; text-decoration: none; }

        .hero { position: relative; z-index: 10; padding: 10rem 2rem 8rem; text-align: center; display: flex; flex-direction: column; align-items: center; }
        .hero-wrap { max-width: 850px; }
        
        .badge { 
          display: inline-flex; align-items: center; gap: 10px;
          padding: 8px 16px; background: rgba(255,255,255,0.05); 
          border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; 
          font-size: 11px; font-weight: 700; 
          letter-spacing: 1px; color: #888; margin-bottom: 2.5rem; 
        }
        .badge-dot { width: 6px; height: 6px; background: #fff; border-radius: 50%; box-shadow: 0 0 10px #fff; animation: blink 1.5s infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.8); } }

        .hero-title { font-size: clamp(3.5rem, 8vw, 6.5rem); font-weight: 900; letter-spacing: -4px; line-height: 0.95; margin-bottom: 2rem; }
        .hero-accent { color: #444; }
        .hero-subtitle { font-size: clamp(1.1rem, 2vw, 1.4rem); color: #666; line-height: 1.6; max-width: 650px; margin: 0 auto 3.5rem; }
        .btn-mega { display: inline-flex; align-items: center; gap: 12px; background: #fff; color: #000; padding: 18px 40px; border-radius: 14px; font-size: 18px; font-weight: 700; text-decoration: none; transition: transform 0.3s ease; }
        .btn-mega:hover { transform: scale(1.02); box-shadow: 0 0 40px rgba(255,255,255,0.1); }

        .product-glimpse { position: relative; z-index: 10; padding: 0 2rem 10rem; display: flex; justify-content: center; }
        .glimpse-stage { width: 100%; max-width: 1100px; position: relative; display: flex; justify-content: center; }
        .glimpse-glow { position: absolute; inset: -100px; background: radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 60%); z-index: 0; filter: blur(60px); pointer-events: none; }
        .glimpse-frame { position: relative; width: 100%; border-radius: 32px; background: #000; padding: 2px; box-shadow: 0 50px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1) inset; transform: perspective(2000px) rotateX(10deg); transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .glimpse-frame:hover { transform: perspective(2000px) rotateX(0deg) scale(1.02); }
        .app-window { position: relative; z-index: 2; height: 650px; background: #050505; border-radius: 30px; display: flex; flex-direction: column; overflow: hidden; }
        .aw-header { height: 60px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; padding: 0 24px; justify-content: space-between; background: #000; }
        .aw-dots { display: flex; gap: 8px; width: 80px; }
        .aw-dots span { width: 12px; height: 12px; background: #111; border-radius: 50%; }
        .aw-search { flex: 1; max-width: 320px; height: 32px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 100px; display: flex; align-items: center; justify-content: center; gap: 8px; color: #222; font-size: 12px; }
        .aw-user { width: 80px; display: flex; justify-content: flex-end; }
        .aw-user::after { content: ''; width: 28px; height: 28px; background: #0a0a0a; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }

        .aw-body { display: flex; flex: 1; position: relative; }
        .aw-sidebar { width: 80px; border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; padding: 32px 0; gap: 24px; background: #000; }
        .aw-icon { color: #111; font-size: 20px; transition: color 0.3s; }
        .aw-icon.active { color: #fff; }
        .aw-canvas { flex: 1; padding: 48px; background: radial-gradient(circle at top left, #080808, #030303); }
        .aw-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .aw-top h3 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .aw-pill { font-size: 11px; background: #fff; color: #000; padding: 6px 12px; border-radius: 8px; font-weight: 700; cursor: pointer; }
        .aw-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .aw-card { background: #0a0a0a; border: 1px solid rgba(255,255,255,0.05); height: 180px; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; gap: 12px; }
        .aw-card-line { height: 8px; background: #111; border-radius: 4px; }
        .aw-card-footer { height: 14px; width: 40px; background: #111; border-radius: 4px; margin-top: auto; }

        .floating-editor { position: absolute; right: 60px; bottom: 80px; width: 400px; height: 250px; background: rgba(10,10,10,0.8); backdrop-filter: blur(40px); border: 1px solid rgba(255,255,255,0.2); border-radius: 24px; box-shadow: 0 40px 100px rgba(0,0,0,1); padding: 24px; transform: translateZ(100px); animation: float 6s infinite ease-in-out; }
        .fe-head { font-size: 13px; font-weight: 700; color: #444; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; margin-bottom: 16px; }
        .fe-code { font-family: monospace; font-size: 13px; line-height: 1.8; color: #fff; }
        .fe-code span { opacity: 0.4; }

        .floating-palette { position: absolute; left: 50%; top: 120px; transform: translateX(-50%) translateZ(150px); width: 440px; background: rgba(0,0,0,0.9); backdrop-filter: blur(30px); border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; box-shadow: 0 60px 120px rgba(0,0,0,1); padding: 12px; animation: floatPalette 5s infinite; }
        .fp-input { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 12px; font-size: 15px; color: #fff; }
        .fp-input span { opacity: 0.5; }
        .fp-results { padding: 8px; }
        .fp-row { padding: 12px 16px; border-radius: 10px; font-size: 14px; color: #444; display: flex; justify-content: space-between; }
        .fp-row.active { background: rgba(255,255,255,0.05); color: #fff; }
        .fp-tag { font-size: 11px; opacity: 0.5; }
        .aw-reflection { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 40%); z-index: 3; pointer-events: none; }

        .features-grid-section { position: relative; z-index: 10; padding: 6rem 2.5rem; max-width: 1400px; margin: 0 auto; }
        .feat-header { text-align: left; margin-bottom: 5rem; max-width: 700px; }
        .feat-header h2 { font-size: 4rem; font-weight: 900; letter-spacing: -2px; line-height: 1; margin-bottom: 1.5rem; }
        .feat-header p { font-size: 1.5rem; color: #444; line-height: 1.4; }

        .bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .bento-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 32px; padding: 3.5rem; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); position: relative; overflow: hidden; }
        .bento-card:hover { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.04); transform: translateY(-10px); }
        .b-large { grid-column: span 2; }
        .bento-card h3 { font-size: 1.8rem; font-weight: 800; margin-bottom: 1rem; letter-spacing: -0.5px; }
        .bento-card p { font-size: 1.15rem; color: #555; line-height: 1.6; }
        .b-icon { width: 50px; height: 50px; background: #fff; color: #000; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 2.5rem; }
        
        .outro { padding: 14rem 2rem; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); position: relative; overflow: hidden; }
        .outro-wrap { max-width: 900px; margin: 0 auto; position: relative; z-index: 10; }
        .outro-title { font-size: clamp(3.5rem, 8vw, 6rem); font-weight: 900; letter-spacing: -4px; line-height: 0.9; margin-bottom: 2rem; }
        .outro-desc { font-size: 1.5rem; color: #444; margin-bottom: 4rem; }
        .outro-actions { display: flex; flex-direction: column; align-items: center; gap: 2rem; }
        .outro-link { color: #333; text-decoration: none; font-size: 15px; font-weight: 600; transition: color 0.3s; }
        .outro-link:hover { color: #fff; }

        @keyframes float { 0%, 100% { transform: translateY(0) translateZ(100px); } 50% { transform: translateY(-20px) translateZ(120px); } }
        @keyframes floatPalette { 0%, 100% { transform: translateX(-50%) translateY(0) translateZ(150px); } 50% { transform: translateX(-50%) translateY(-15px) translateZ(180px); } }
        .reveal { opacity: 0; transform: translateY(40px); transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal-on { opacity: 1; transform: translateY(0); }

        .footer { padding: 4rem 2.5rem; border-top: 1px solid rgba(255,255,255,0.05); color: #222; }
        .footer-inner { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 600; }

        @media (max-width: 1024px) {
          .bento-grid { grid-template-columns: 1fr; }
          .b-large { grid-column: span 1; }
          .app-window { height: 500px; }
          .floating-editor { display: none; }
          .floating-palette { width: 90%; }
          .aw-grid { grid-template-columns: 1fr; }
          .aw-sidebar { display: none; }
          .nav-actions { display: none; }
          .hero-title { white-space: normal; line-height: 1.1; }
        }
      `}</style>
    </div>
  )
}