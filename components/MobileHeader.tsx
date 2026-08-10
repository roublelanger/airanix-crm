'use client'

import { useState } from 'react'

export default function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const navLinks = [
    { href: '/', label: '🏠 Home' },
    { href: '/', label: '📈 Dashboard' },
    { href: '/contacts', label: '👥 Contacts' },
    { href: '/deals', label: '🎯 Leads' },
    { href: '/activities', label: '📞 Activities' },
    { href: '/followups', label: '📋 Follow-ups' },
    { href: '/emails', label: '📧 Email Templates' },
    { href: '/analytics', label: '📊 Analytics' },
    { href: '/settings', label: '⚙️ Settings' },
  ]

  return (
    <>
      {/* Mobile Header */}
      <div style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: '#1e3a5f',
        color: 'white',
        padding: '12px 16px',
        zIndex: 100,
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: '100%',
        '@media (max-width: 768px)': {
          display: 'flex'
        }
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>📊 Airanix</h2>
        <button onClick={toggleMenu} style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          padding: '8px'
        }}>☰</button>
      </div>

      {/* Mobile Navigation Menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: '56px',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#1e3a5f',
          color: 'white',
          zIndex: 99,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 0',
          '@media (min-width: 769px)': {
            display: 'none'
          }
        }}>
          {navLinks.map(link => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{
              padding: '14px 16px',
              color: '#9db4d1',
              textDecoration: 'none',
              fontSize: '15px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s'
            }}>{link.label}</a>
          ))}
        </div>
      )}
    </>
  )
}
