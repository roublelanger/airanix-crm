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

          {/* Main Content */}
          <main style={{ marginLeft: '250px', flex: 1, padding: '24px' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
