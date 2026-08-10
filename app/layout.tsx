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
            main { margin-left: 0 !important; padding-top: 64px !important; }
          }
          .nav-link:hover {
            background: rgba(0,191,255,0.08) !important;
            color: #00bfff !important;
          }
        `}</style>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f5f7fa' }}>
        <MobileHeader />
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* Desktop Sidebar */}
          <nav style={{
            width: '250px',
            background: '#0f2742',
            color: 'white',
            padding: '0',
            position: 'fixed',
            height: '100vh',
            overflowY: 'auto',
            boxShadow: '2px 0 8px rgba(0,0,0,0.3)',
            zIndex: 10
          }}>
            {/* Header Section */}
            <div style={{
              padding: '32px 24px 32px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              background: '#0f2742'
            }}>
              <a href="/" style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Logo Circle */}
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #00bfff 0%, #1e90ff 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0, 191, 255, 0.2)'
                }}>
                  <span style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: 'white',
                    lineHeight: '1'
                  }}>A</span>
                </div>
                {/* Logo Text */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', lineHeight: '1.2', marginBottom: '2px' }}>Airanix</div>
                  <div style={{ fontSize: '10px', color: '#00bfff', fontWeight: '600', letterSpacing: '0.8px', lineHeight: '1' }}>CRM PLATFORM</div>
                </div>
              </a>
            </div>

            {/* Navigation Section */}
            <div style={{ padding: '24px 0 16px 0' }}>
              <a href="/" className="nav-link" style={{ display: 'block', padding: '12px 24px', color: '#a8c5dd', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s', borderLeft: '3px solid transparent', margin: '4px 0' }}>🏠 Home</a>
              <a href="/" className="nav-link" style={{ display: 'block', padding: '12px 24px', color: '#a8c5dd', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s', borderLeft: '3px solid transparent', margin: '4px 0' }}>📈 Dashboard</a>
              <a href="/contacts" className="nav-link" style={{ display: 'block', padding: '12px 24px', color: '#a8c5dd', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s', borderLeft: '3px solid transparent', margin: '4px 0' }}>👥 Contacts</a>
              <a href="/deals" className="nav-link" style={{ display: 'block', padding: '12px 24px', color: '#a8c5dd', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s', borderLeft: '3px solid transparent', margin: '4px 0' }}>🎯 Leads</a>
              <a href="/activities" className="nav-link" style={{ display: 'block', padding: '12px 24px', color: '#a8c5dd', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s', borderLeft: '3px solid transparent', margin: '4px 0' }}>📞 Activities</a>
              <a href="/followups" className="nav-link" style={{ display: 'block', padding: '12px 24px', color: '#a8c5dd', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s', borderLeft: '3px solid transparent', margin: '4px 0' }}>📋 Follow-ups</a>
              <a href="/emails" className="nav-link" style={{ display: 'block', padding: '12px 24px', color: '#a8c5dd', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s', borderLeft: '3px solid transparent', margin: '4px 0' }}>📧 Email Templates</a>
              <a href="/analytics" className="nav-link" style={{ display: 'block', padding: '12px 24px', color: '#a8c5dd', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s', borderLeft: '3px solid transparent', margin: '4px 0' }}>📊 Analytics</a>
              <a href="/settings" className="nav-link" style={{ display: 'block', padding: '12px 24px', color: '#a8c5dd', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s', borderLeft: '3px solid transparent', margin: '4px 0' }}>⚙️ Settings</a>
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
