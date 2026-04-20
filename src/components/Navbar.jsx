import React from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Navbar() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
      height: '64px',
      background: 'rgba(10, 10, 10, 0.65)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-light)',
      display: 'flex', alignItems: 'center', padding: '0'
    }}>
      <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', height: '100%' }}>
        <div style={{ width: '64px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Logo size={20} />
        </div>
        <div style={{
          fontSize: '18px', color: 'var(--text-primary)', fontWeight: '700',
          letterSpacing: '-0.5px', marginLeft: '0px'
        }}>
          Snipx.
        </div>
      </Link>
    </nav>
  )
}