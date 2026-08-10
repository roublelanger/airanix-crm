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
        background: '#1a3a52',
        color: 'white',
        padding: '12px 16px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        width: '100%',
        borderBottom: '1px solid rgba(0,191,255,0.08)'
      }}>
        {/* Logo */}
        <a href="/" style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #00bfff 0%, #1e90ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0, 191, 255, 0.2)'
          }}>
            <span style={{
              fontSize: '22px',
              fontWeight: '800',
              color: 'white',
              lineHeight: '1'
            }}>A</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', lineHeight: '1.1' }}>Airanix</div>
            <div style={{ fontSize: '10px', fontWeight: '600', color: '#00bfff', letterSpacing: '0.6px', lineHeight: '1' }}>CRM</div>
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
          top: '64px',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#1a3a52',
          color: 'white',
          zIndex: 99,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '8px',
          animation: 'slideIn 0.3s ease-out',
          borderTop: '1px solid rgba(0,191,255,0.08)'
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
                padding: '12px 16px',
                margin: '4px 12px',
                color: '#b0c4d8',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.03)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,191,255,0.12)';
                e.currentTarget.style.color = '#00bfff';
                e.currentTarget.style.paddingLeft = '20px';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.color = '#b0c4d8';
                e.currentTarget.style.paddingLeft = '16px';
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
