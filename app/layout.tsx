import './globals.css'
import MobileHeader from '@/components/MobileHeader'

export const metadata = {
  title: 'Airanix CRM',
  description: 'Professional CRM System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <style>{`
          @media (max-width: 768px) {
            nav { display: none !important; }
            main { margin-left: 0 !important; padding-top: 80px !important; }
          }
        `}</style>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f5f7fa' }}>
        <MobileHeader />
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* Desktop Sidebar */}
          <nav style={{
            width: '250px',
            background: 'linear-gradient(180deg, #1e3a5f 0%, #162842 100%)',
            color: 'white',
            padding: '24px 0',
            position: 'fixed',
            height: '100vh',
            overflowY: 'auto',
            boxShadow: '4px 0 16px rgba(0,0,0,0.2)',
            zIndex: 10
          }}>
            <div style={{ paddingLeft: '24px', paddingRight: '20px', marginBottom: '48px' }}>
              <a href="/" style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #4a9eff 0%, #00d4ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: '1',
                  marginTop: '2px'
                }}>
                  A
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 2px 0', color: '#ffffff', letterSpacing: '-0.5px' }}>Airanix</h2>
                  <p style={{ fontSize: '11px', color: '#4a9eff', margin: 0, fontWeight: '600', letterSpacing: '0.5px' }}>PROFESSIONAL CRM</p>
                </div>
              </a>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <a href="/" style={{ display: 'block', padding: '12px 20px', color: '#9db4d1', textDecoration: 'none', fontSize: '14px' }}>🏠 Home</a>
              <a href="/" style={{ display: 'block', padding: '12px 20px', color: '#9db4d1', textDecoration: 'none', fontSize: '14px' }}>📈 Dashboard</a>
              <a href="/contacts" style={{ display: 'block', padding: '12px 20px', color: '#9db4d1', textDecoration: 'none', fontSize: '14px' }}>👥 Contacts</a>
              <a href="/deals" style={{ display: 'block', padding: '12px 20px', color: '#9db4d1', textDecoration: 'none', fontSize: '14px' }}>🎯 Leads</a>
              <a href="/activities" style={{ display: 'block', padding: '12px 20px', color: '#9db4d1', textDecoration: 'none', fontSize: '14px' }}>📞 Activities</a>
              <a href="/followups" style={{ display: 'block', padding: '12px 20px', color: '#9db4d1', textDecoration: 'none', fontSize: '14px' }}>📋 Follow-ups</a>
              <a href="/emails" style={{ display: 'block', padding: '12px 20px', color: '#9db4d1', textDecoration: 'none', fontSize: '14px' }}>📧 Email Templates</a>
              <a href="/analytics" style={{ display: 'block', padding: '12px 20px', color: '#9db4d1', textDecoration: 'none', fontSize: '14px' }}>📊 Analytics</a>
              <a href="/settings" style={{ display: 'block', padding: '12px 20px', color: '#9db4d1', textDecoration: 'none', fontSize: '14px' }}>⚙️ Settings</a>
            </div>
          </nav>

          {/* Main Content */}
          <main style={{ marginLeft: '250px', flex: 1, padding: '24px' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
