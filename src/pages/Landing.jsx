import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DEMO_CODE = `function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value)
    }, delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}`

const FEATURES = [
  {
    title: 'syntax highlighting',
    desc: 'VS Code-quality highlighting for 15+ languages powered by Shiki.',
    color: '#58a6ff',
  },
  {
    title: 'tags + search',
    desc: 'Tag every snippet. Search across title, description, and code instantly.',
    color: '#3fb950',
  },
  {
    title: 'collections',
    desc: 'Organise snippets into folders. Filter by collection in one click.',
    color: '#d2a8ff',
  },
  {
    title: 'share links',
    desc: 'Every snippet gets a shareable link. Works even for private ones.',
    color: '#ffa657',
  },
]

const LANGS = ['javascript', 'typescript', 'python', 'rust', 'go', 'sql', 'bash', 'css', 'html', 'json']

export default function Landing() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) navigate('/dashboard')
  }, [user, loading])

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3' }}>

      {/* Navbar */}
      <nav style={{
        borderBottom: '1px solid #21262d',
        padding: '0 2rem', height: '56px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1100px', margin: '0 auto',
      }}>
        <span style={{
          fontFamily: 'monospace', fontSize: '1.2rem',
          color: '#58a6ff', fontWeight: '600', letterSpacing: '-0.5px'
        }}>
          snipx
        </span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/login" style={{
            color: '#8b949e', fontSize: '13px', textDecoration: 'none'
          }}>
            sign in
          </Link>
          <Link to="/signup" style={{
            background: '#238636', border: '1px solid #2ea043',
            borderRadius: '8px', padding: '0.4rem 0.875rem',
            color: '#fff', fontSize: '13px', textDecoration: 'none',
            fontWeight: '500',
          }}>
            get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '5rem 2rem 3rem',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block',
          background: '#161b22', border: '1px solid #30363d',
          borderRadius: '99px', padding: '4px 14px',
          fontSize: '12px', color: '#8b949e',
          marginBottom: '1.5rem',
          fontFamily: 'monospace',
        }}>
          your personal code vault
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: '600', lineHeight: '1.2',
          marginBottom: '1.25rem',
          letterSpacing: '-1px',
        }}>
          stop losing your best{' '}
          <span style={{ color: '#58a6ff' }}>code snippets</span>
        </h1>

        <p style={{
          color: '#8b949e', fontSize: '1.05rem',
          maxWidth: '520px', margin: '0 auto 2.5rem',
          lineHeight: '1.7',
        }}>
          snipx is a fast, beautiful snippet manager. save, search, tag, and share
          your code — all in one place. better than GitHub Gist.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/signup" style={{
            background: '#238636', border: '1px solid #2ea043',
            borderRadius: '10px', padding: '0.75rem 1.75rem',
            color: '#fff', fontSize: '15px', textDecoration: 'none',
            fontWeight: '500',
          }}>
            start for free
          </Link>
          <Link to="/login" style={{
            background: 'none', border: '1px solid #30363d',
            borderRadius: '10px', padding: '0.75rem 1.75rem',
            color: '#e6edf3', fontSize: '15px', textDecoration: 'none',
          }}>
            sign in
          </Link>
        </div>
      </div>

      {/* Code preview */}
      <div style={{
        maxWidth: '780px', margin: '0 auto',
        padding: '0 2rem 4rem',
      }}>
        <div style={{
          background: '#161b22', border: '1px solid #30363d',
          borderRadius: '14px', overflow: 'hidden',
        }}>
          {/* Fake window bar */}
          <div style={{
            background: '#21262d', padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: '8px',
            borderBottom: '1px solid #30363d',
          }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f78166', display: 'block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffa657', display: 'block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3fb950', display: 'block' }} />
            <span style={{ color: '#484f58', fontSize: '12px', fontFamily: 'monospace', marginLeft: '8px' }}>
              useDebounce.js
            </span>
            <span style={{
              marginLeft: 'auto', fontSize: '11px', padding: '2px 8px',
              background: '#1a3a2a', color: '#3fb950',
              border: '1px solid #2ea04330', borderRadius: '99px'
            }}>
              public
            </span>
          </div>
          {/* Code */}
          <pre style={{
            padding: '1.5rem', fontFamily: 'monospace',
            fontSize: '13px', lineHeight: '1.7',
            color: '#e6edf3', overflowX: 'auto', margin: 0,
          }}>
            <code>{DEMO_CODE}</code>
          </pre>
        </div>
      </div>

      {/* Features */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '2rem 2rem 5rem',
      }}>
        <h2 style={{
          textAlign: 'center', fontSize: '1.5rem',
          fontWeight: '500', marginBottom: '2.5rem',
          color: '#e6edf3',
        }}>
          everything Gist should have been
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: '#161b22', border: '1px solid #30363d',
              borderRadius: '12px', padding: '1.5rem',
            }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: f.color, marginBottom: '1rem',
              }} />
              <h3 style={{
                color: '#e6edf3', fontWeight: '500',
                fontSize: '14px', marginBottom: '8px',
                fontFamily: 'monospace',
              }}>
                {f.title}
              </h3>
              <p style={{ color: '#8b949e', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div style={{
        borderTop: '1px solid #21262d',
        padding: '3rem 2rem',
        textAlign: 'center',
      }}>
        <p style={{ color: '#484f58', fontSize: '13px', marginBottom: '1rem' }}>
          supports
        </p>
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          gap: '8px', justifyContent: 'center',
          maxWidth: '600px', margin: '0 auto',
        }}>
          {LANGS.map(l => (
            <span key={l} style={{
              background: '#161b22', border: '1px solid #30363d',
              borderRadius: '6px', padding: '4px 12px',
              fontSize: '12px', color: '#8b949e',
              fontFamily: 'monospace',
            }}>
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        borderTop: '1px solid #21262d',
        padding: '5rem 2rem',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '1.75rem', fontWeight: '500',
          marginBottom: '1rem', letterSpacing: '-0.5px',
        }}>
          ready to build your vault?
        </h2>
        <p style={{ color: '#8b949e', marginBottom: '2rem', fontSize: '14px' }}>
          free forever. no credit card.
        </p>
        <Link to="/signup" style={{
          background: '#238636', border: '1px solid #2ea043',
          borderRadius: '10px', padding: '0.75rem 2rem',
          color: '#fff', fontSize: '15px', textDecoration: 'none',
          fontWeight: '500',
        }}>
          create your vault →
        </Link>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #21262d',
        padding: '1.5rem 2rem',
        textAlign: 'center',
      }}>
        <span style={{ fontFamily: 'monospace', color: '#484f58', fontSize: '13px' }}>
          snipx — built by{' '}
          <span style={{ color: '#8b949e' }}>bunny</span>
        </span>
      </div>

    </div>
  )
}