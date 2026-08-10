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
      {/* Mobile Header - Premium Design */}
      <div className="mobile-header" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)',
        color: 'white',
        padding: '14px 18px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        width: '100%'
      }}>
        {/* Logo */}
        <a href="/" style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            fontSize: '26px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #4a9eff 0%, #00d4ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-1px'
          }}>
            A
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>Airanix</div>
            <div style={{ fontSize: '9px', fontWeight: '600', color: '#4a9eff', letterSpacing: '0.5px' }}>CRM</div>
          </div>
        </a>

        {/* Hamburger Button - Professional */}
        <button
          onClick={toggleMenu}
          aria-label="Menu"
          style={{
            background: menuOpen ? 'rgba(74, 158, 255, 0.2)' : 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '8px 10px',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            transition: 'all 0.3s ease'
          }}>
          <div style={{
            width: '22px',
            height: '2px',
            background: 'white',
            borderRadius: '1px',
            transition: 'all 0.3s ease',
            transform: menuOpen ? 'rotate(45deg) translate(8px, 8px)' : 'none'
          }}></div>
          <div style={{
            width: '22px',
            height: '2px',
            background: 'white',
            borderRadius: '1px',
            opacity: menuOpen ? 0 : 1,
            transition: 'all 0.3s ease'
          }}></div>
          <div style={{
            width: '22px',
            height: '2px',
            background: 'white',
            borderRadius: '1px',
            transition: 'all 0.3s ease',
            transform: menuOpen ? 'rotate(-45deg) translate(7px, -7px)' : 'none'
          }}></div>
        </button>
      </div>

      {/* Mobile Navigation Menu - Elegant Sliding */}
      {menuOpen && (
        <div className="mobile-nav-menu" style={{
          position: 'fixed',
          top: '60px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #1e3a5f 0%, #152a47 100%)',
          color: 'white',
          zIndex: 99,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '8px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <style>{`
            @keyframes slideIn {
              from { transform: translateY(-20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
          {navLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '16px 20px',
                color: '#9db4d1',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '500',
                borderBottom: '1px solid rgba(74, 158, 255, 0.1)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(74, 158, 255, 0.1)';
                e.currentTarget.style.color = '#4a9eff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#9db4d1';
              }}
            >
              <span style={{ fontSize: '18px' }}>{link.label.split(' ')[0]}</span>
              <span>{link.label.substring(2)}</span>
            </a>
          ))}
        </div>
      )}
    </>
  )
}
