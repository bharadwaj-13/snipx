import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LuLayoutDashboard, LuGlobe, LuFolder, LuSearch, LuPlus } from 'react-icons/lu'
import Sidebar from './SideBar'
import CommandPalette from './CommandPalette'

function MobileNav({ onSearchClick }) {
  const location = useLocation()
  const items = [
    { icon: <LuLayoutDashboard />, label: 'Deck', path: '/dashboard' },
    { icon: <LuGlobe />, label: 'Matrix', path: '/explore' },
    { icon: <LuFolder />, label: 'Vaults', path: '/collections' }
  ]

  return (
    <div className="mobile-bottom-nav show-on-mobile">
      {items.map(item => (
        <Link 
          key={item.path} 
          to={item.path} 
          className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <span className="mobile-nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
      <button 
        className="mobile-nav-item" 
        onClick={onSearchClick} 
        style={{ background: 'none', border: 'none', padding: 0 }}
      >
        <span className="mobile-nav-icon"><LuSearch /></span>
        <span>Search</span>
      </button>
      <Link to="/new" className="mobile-nav-item">
        <span className="mobile-nav-icon"><LuPlus /></span>
        <span>New</span>
      </Link>
    </div>
  )
}

export default function AppLayout({ children }) {
  const [cmdOpen, setCmdOpen] = useState(false)

  useEffect(() => {
    function handleKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(o => !o)
      }
      if (e.key === 'Escape') setCmdOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', flexDirection: 'row' }}>
      <Sidebar onCmdK={() => setCmdOpen(true)} />
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        {children}
      </main>
      <MobileNav onSearchClick={() => setCmdOpen(true)} />
      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}
    </div>
  )
}