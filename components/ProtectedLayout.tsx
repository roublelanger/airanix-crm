'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import MobileHeader from './MobileHeader'

const PUBLIC_ROUTES = ['/login']

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Check if mobile on mount
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!loading && isClient) {
      if (!user && !PUBLIC_ROUTES.includes(pathname)) {
        router.push('/login')
      }
    }
  }, [user, loading, router, pathname, isClient])

  if (!isClient || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff'
      }}>
        <div style={{ fontSize: '18px', color: '#666666' }}>Loading...</div>
      </div>
    )
  }

  const isPublicPage = PUBLIC_ROUTES.includes(pathname)

  if (isPublicPage) {
    return <>{children}</>
  }

  if (!user) {
    return null
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: isMobile ? 'column' : 'row' }}>
      {isMobile && <MobileHeader />}

      {/* Desktop Sidebar - Hidden on Mobile */}
      {!isMobile && (
        <nav style={{
          width: '250px',
          background: '#1e293b',
          color: 'white',
          padding: '0',
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header Section */}
          <div style={{
            padding: '24px 20px 20px 20px',
            borderBottom: '2px solid #3b82f6',
            background: '#1e293b',
            marginBottom: '12px'
          }}>
            <a href="/" style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Logo Circle */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)'
              }}>
                <span style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: '#000000',
                  lineHeight: '1'
                }}>A</span>
              </div>
              {/* Logo Text */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', lineHeight: '1.2', margin: '0' }}>Airanix</div>
                <div style={{ fontSize: '10px', color: '#b0b0b0', fontWeight: '600', letterSpacing: '0.4px', lineHeight: '1.1', margin: '2px 0 0 0' }}>CRM SYSTEM</div>
              </div>
            </a>
          </div>

          {/* Navigation Section */}
          <nav style={{ padding: '8px 0 16px 0', flex: 1, overflowY: 'auto', background: '#1f2937' }}>
            <a href="/" className="nav-link" style={{ color: '#1f2937', display: 'block', padding: '14px 16px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>🏠 Home</a>
            <a href="/dashboard" className="nav-link" style={{ color: '#1f2937', display: 'block', padding: '14px 16px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>📈 Dashboard</a>
            <a href="/contacts" className="nav-link" style={{ color: '#1f2937', display: 'block', padding: '14px 16px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>👥 Contacts</a>
            <a href="/deals" className="nav-link" style={{ color: '#1f2937', display: 'block', padding: '14px 16px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>🎯 Leads</a>
            <a href="/activities" className="nav-link" style={{ color: '#1f2937', display: 'block', padding: '14px 16px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>📞 Activities</a>
            <a href="/followups" className="nav-link" style={{ color: '#1f2937', display: 'block', padding: '14px 16px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>📋 Follow-ups</a>
            <a href="/emails" className="nav-link" style={{ color: '#1f2937', display: 'block', padding: '14px 16px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>📧 Email Templates</a>
            <a href="/analytics" className="nav-link" style={{ color: '#1f2937', display: 'block', padding: '14px 16px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>📊 Analytics</a>
            <a href="/settings" className="nav-link" style={{ color: '#1f2937', display: 'block', padding: '14px 16px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>⚙️ Settings</a>
          </nav>

          {/* Logout Button Only - No border, No user info */}
          <div style={{ padding: '12px', background: '#1e293b' }}>
            <LogoutButton />
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main style={{
        marginLeft: isMobile ? '0' : '250px',
        marginTop: isMobile ? '64px' : '0',
        flex: 1,
        padding: isMobile ? '16px' : '24px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {children}
      </main>
    </div>
  )
}

function LogoutButton() {
  const { logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        width: '100%',
        padding: '10px 16px',
        background: '#fee2e2',
        color: '#dc2626',
        border: '1px solid #fecaca',
        borderRadius: '6px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontWeight: '600',
        fontSize: '12px',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.background = '#fecaca'
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          e.currentTarget.style.background = '#fee2e2'
        }
      }}
    >
      {loading ? '⏳ Logging out...' : '🚪 Logout'}
    </button>
  )
}
