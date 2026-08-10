import './globals.css'

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
            main { margin-left: 0 !important; }
            .mobile-header { display: flex !important; }
            .mobile-nav { position: fixed; top: 56px; left: 0; right: 0; background: #1e3a5f; color: white; z-index: 99; }
            .mobile-nav a { display: block; padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); }
          }
          @media (min-width: 769px) {
            .mobile-header { display: none !important; }
            .mobile-nav { display: none !important; }
          }
        `}</style>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f5f7fa' }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* Desktop Sidebar */}
          <nav style={{
            width: '250px',
            background: '#1e3a5f',
            color: 'white',
            padding: '24px 0',
            position: 'fixed',
            height: '100vh',
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10
          }}>
            <div style={{ paddingLeft: '20px', marginBottom: '40px' }}>
              <a href="/" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#fff' }}>📊 Airanix</h2>
                <p style={{ fontSize: '12px', color: '#9db4d1', margin: '4px 0 0 0' }}>Professional CRM</p>
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

          {/* Mobile Header */}
          <div className="mobile-header" style={{
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
            width: '100%'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>📊 Airanix</h2>
            <button onClick="document.querySelector('.mobile-nav').style.display = document.querySelector('.mobile-nav').style.display === 'flex' ? 'none' : 'flex'" style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px'
            }}>☰</button>
          </div>

          {/* Mobile Navigation */}
          <div className="mobile-nav" style={{ display: 'none', flexDirection: 'column' }}>
            <a href="/" style={{ color: 'white', textDecoration: 'none' }}>🏠 Home</a>
            <a href="/" style={{ color: 'white', textDecoration: 'none' }}>📈 Dashboard</a>
            <a href="/contacts" style={{ color: 'white', textDecoration: 'none' }}>👥 Contacts</a>
            <a href="/deals" style={{ color: 'white', textDecoration: 'none' }}>🎯 Leads</a>
            <a href="/activities" style={{ color: 'white', textDecoration: 'none' }}>📞 Activities</a>
            <a href="/followups" style={{ color: 'white', textDecoration: 'none' }}>📋 Follow-ups</a>
            <a href="/emails" style={{ color: 'white', textDecoration: 'none' }}>📧 Email Templates</a>
            <a href="/analytics" style={{ color: 'white', textDecoration: 'none' }}>📊 Analytics</a>
            <a href="/settings" style={{ color: 'white', textDecoration: 'none' }}>⚙️ Settings</a>
          </div>

          {/* Main Content */}
          <main style={{ marginLeft: '250px', flex: 1, padding: '24px' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
