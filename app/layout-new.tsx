import './globals.css'

export const metadata = {
  title: 'Airanix CRM',
  description: 'Professional CRM System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f5f7fa' }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* Sidebar */}
          <nav style={{
            width: '250px',
            background: '#1e3a5f',
            color: 'white',
            padding: '24px 0',
            position: 'fixed',
            height: '100vh',
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <div style={{ paddingLeft: '20px', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#fff' }}>📊 Airanix</h2>
              <p style={{ fontSize: '12px', color: '#9db4d1', margin: '4px 0 0 0' }}>Professional CRM</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <a href="/" style={{
                display: 'block',
                padding: '12px 20px',
                color: '#9db4d1',
                textDecoration: 'none',
                fontSize: '14px',
                borderLeft: '4px solid transparent',
                transition: 'all 0.2s'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderLeft = '4px solid #2563eb';
                e.currentTarget.style.color = '#fff';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderLeft = '4px solid transparent';
                e.currentTarget.style.color = '#9db4d1';
              }}>
                📈 Dashboard
              </a>

              <a href="/contacts" style={{
                display: 'block',
                padding: '12px 20px',
                color: '#9db4d1',
                textDecoration: 'none',
                fontSize: '14px',
                borderLeft: '4px solid transparent',
                transition: 'all 0.2s'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderLeft = '4px solid #2563eb';
                e.currentTarget.style.color = '#fff';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderLeft = '4px solid transparent';
                e.currentTarget.style.color = '#9db4d1';
              }}>
                👥 Contacts
              </a>

              <a href="/deals" style={{
                display: 'block',
                padding: '12px 20px',
                color: '#9db4d1',
                textDecoration: 'none',
                fontSize: '14px',
                borderLeft: '4px solid transparent',
                transition: 'all 0.2s'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderLeft = '4px solid #2563eb';
                e.currentTarget.style.color = '#fff';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderLeft = '4px solid transparent';
                e.currentTarget.style.color = '#9db4d1';
              }}>
                💼 Deals
              </a>

              <a href="/activities" style={{
                display: 'block',
                padding: '12px 20px',
                color: '#9db4d1',
                textDecoration: 'none',
                fontSize: '14px',
                borderLeft: '4px solid transparent',
                transition: 'all 0.2s'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderLeft = '4px solid #2563eb';
                e.currentTarget.style.color = '#fff';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderLeft = '4px solid transparent';
                e.currentTarget.style.color = '#9db4d1';
              }}>
                📞 Activities
              </a>

              <a href="/settings" style={{
                display: 'block',
                padding: '12px 20px',
                color: '#9db4d1',
                textDecoration: 'none',
                fontSize: '14px',
                borderLeft: '4px solid transparent',
                transition: 'all 0.2s'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderLeft = '4px solid #2563eb';
                e.currentTarget.style.color = '#fff';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderLeft = '4px solid transparent';
                e.currentTarget.style.color = '#9db4d1';
              }}>
                ⚙️ Settings
              </a>
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
