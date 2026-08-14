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
          .nav-link {
            background: rgba(100, 160, 200, 0.15) !important;
            border-radius: 8px !important;
            margin: 6px 12px !important;
            padding: 12px 16px !important;
            transition: all 0.25s ease !important;
            border-left: 3px solid rgba(0,191,255,0.3) !important;
          }
          .nav-link:hover {
            background: rgba(0,191,255,0.25) !important;
            color: #ffffff !important;
            padding-left: 20px !important;
            border-left-color: #00bfff !important;
          }
        `}</style>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f5f7fa' }}>
        <MobileHeader />
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* Desktop Sidebar */}
          <nav style={{
            width: '250px',
            background: '#2d4e68',
            color: 'white',
            padding: '0',
            position: 'fixed',
            height: '100vh',
            overflowY: 'auto',
            boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
            zIndex: 10
          }}>
            {/* Header Section */}
            <div style={{
              padding: '24px 20px 20px 20px',
              borderBottom: '2px solid rgba(0,191,255,0.3)',
              background: '#253d54',
              marginBottom: '12px'
            }}>
              <a href="/" style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Logo Circle */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #00bfff 0%, #1e90ff 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0, 191, 255, 0.2)'
                }}>
                  <span style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    color: 'white',
                    lineHeight: '1'
                  }}>A</span>
                </div>
                {/* Logo Text */}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', lineHeight: '1.2', margin: '0' }}>Airanix</div>
                  <div style={{ fontSize: '10px', color: '#4fa3d1', fontWeight: '600', letterSpacing: '0.4px', lineHeight: '1.1', margin: '2px 0 0 0' }}>CRM SYSTEM</div>
                </div>
              </a>
            </div>

            {/* Navigation Section */}
            <div style={{ padding: '4px 0 16px 0' }}>
              <a href="/" className="nav-link" style={{ display: 'block', color: '#c5d9eb', textDecoration: 'none', fontSize: '13px', fontWeight: '500', lineHeight: '1.5' }}>🏠 Home</a>
              <a href="/dashboard" className="nav-link" style={{ display: 'block', color: '#c5d9eb', textDecoration: 'none', fontSize: '13px', fontWeight: '500', lineHeight: '1.5' }}>📈 Dashboard</a>
              <a href="/contacts" className="nav-link" style={{ display: 'block', color: '#c5d9eb', textDecoration: 'none', fontSize: '13px', fontWeight: '500', lineHeight: '1.5' }}>👥 Contacts</a>
              <a href="/deals" className="nav-link" style={{ display: 'block', color: '#c5d9eb', textDecoration: 'none', fontSize: '13px', fontWeight: '500', lineHeight: '1.5' }}>🎯 Leads</a>
              <a href="/activities" className="nav-link" style={{ display: 'block', color: '#c5d9eb', textDecoration: 'none', fontSize: '13px', fontWeight: '500', lineHeight: '1.5' }}>📞 Activities</a>
              <a href="/followups" className="nav-link" style={{ display: 'block', color: '#c5d9eb', textDecoration: 'none', fontSize: '13px', fontWeight: '500', lineHeight: '1.5' }}>📋 Follow-ups</a>
              <a href="/emails" className="nav-link" style={{ display: 'block', color: '#c5d9eb', textDecoration: 'none', fontSize: '13px', fontWeight: '500', lineHeight: '1.5' }}>📧 Email Templates</a>
              <a href="/analytics" className="nav-link" style={{ display: 'block', color: '#c5d9eb', textDecoration: 'none', fontSize: '13px', fontWeight: '500', lineHeight: '1.5' }}>📊 Analytics</a>
              <a href="/settings" className="nav-link" style={{ display: 'block', color: '#c5d9eb', textDecoration: 'none', fontSize: '13px', fontWeight: '500', lineHeight: '1.5' }}>⚙️ Settings</a>
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
