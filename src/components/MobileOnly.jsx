import Logo from './Logo'
import { LuMonitor, LuSmartphone } from 'react-icons/lu'

export default function MobileOnly() {
  return (
    <div className="mobile-only-block show-on-mobile">
      {/* Header Logo */}
      <div style={{ position: 'absolute', top: '32px', left: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Logo size={20} />
        <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-1px' }}>Snipx.</span>
      </div>

      <div className="mobile-block-content">
        <div className="mobile-block-icon" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)' }}>
          <LuSmartphone size={32} />
        </div>
        <h1>Coming Soon to Mobile.</h1>
        <p>
          We are currently engineering the ultimate mobile experience for your snippets. 
          For now, please access your vault from a desktop browser.
        </p>
        <div style={{ 
          marginTop: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: 'var(--text-muted)',
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          <LuMonitor size={16} /> Best experienced on Windows & Mac
        </div>
      </div>
    </div>
  )
}
