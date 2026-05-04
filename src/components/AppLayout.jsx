import { useState, useEffect } from 'react'
import Sidebar from './SideBar'
import CommandPalette from './CommandPalette'

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
      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}
    </div>
  )
}