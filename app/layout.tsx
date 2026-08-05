import './globals.css'

export const metadata = {
  title: 'Airanix CRM',
  description: 'Professional CRM System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body style={{ margin: 0, padding: 0, fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', backgroundColor: '#f5f7fa' }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <nav style={{ width: '250px', background: '#1e3a5f', color: 'white', padding: '24px 0', position: 'fixed', height: '100vh', overflowY: 'auto', zIndex: 1000 }}>
            <div style={{ paddingLeft: '20px', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#fff' }}>📊 Airanix</h2>
              <p style={{ fontSize: '12px', color: '#9db4d1', margin: '4px 0 0 0' }}>Professional CRM</p>
            </div>
            <a href="/" style={{ display: 'block', padding: '12px 20px', color: '#9db4d1', textDecoration: 'none', fontSize: '14px' }}>📈 Dashboard</a>
            <a href="/contacts" style={{ display: 'block', padding: '12px 20px', color: '#9db4d1', textDecoration: 'none', fontSize: '14px' }}>👥 Contacts</a>
            <a href="/deals" style={{ display: 'block', padding: '12px 20px', color: '#9db4d1', textDecoration: 'none', fontSize: '14px' }}>💼 Deals</a>
            <a href="/activities" style={{ display: 'block', padding: '12px 20px', color: '#9db4d1', textDecoration: 'none', fontSize: '14px' }}>📞 Activities</a>
            <a href="/followups" style={{ display: 'block', padding: '12px 20px', color: '#9db4d1', textDecoration: 'none', fontSize: '14px' }}>📋 Follow-ups</a>
            <a href="/emails" style={{ display: 'block', padding: '12px 20px', color: '#9db4d1', textDecoration: 'none', fontSize: '14px' }}>📧 Email Templates</a>
            <a href="/analytics" style={{ display: 'block', padding: '12px 20px', color: '#9db4d1', textDecoration: 'none', fontSize: '14px' }}>📊 Analytics</a>
            <a href="/settings" style={{ display: 'block', padding: '12px 20px', color: '#9db4d1', textDecoration: 'none', fontSize: '14px' }}>⚙️ Settings</a>
          </nav>
          <main style={{ marginLeft: '250px', flex: 1, padding: '24px' }}>{children}</main>
        </div>
      </body>
    </html>
  )
}
