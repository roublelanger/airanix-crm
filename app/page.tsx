'use client'

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        top: '-100px',
        right: '-100px',
        animation: 'float 6s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        bottom: '-50px',
        left: '-50px',
        animation: 'float 8s ease-in-out infinite reverse'
      }}></div>

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        color: 'white',
        padding: '40px 20px'
      }}>
        {/* Logo Icon */}
        <div style={{
          fontSize: '80px',
          marginBottom: '30px',
          animation: 'pulse 2s ease-in-out infinite'
        }}>⚡</div>

        {/* Main Heading */}
        <h1 style={{
          fontSize: 'clamp(48px, 12vw, 120px)',
          fontWeight: '900',
          margin: '0 0 20px 0',
          lineHeight: '1.1',
          letterSpacing: '-2px',
          background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          AIRANIX CRM
        </h1>

        {/* Welcome Subtitle */}
        <p style={{
          fontSize: 'clamp(20px, 4vw, 32px)',
          fontWeight: '300',
          margin: '0 0 50px 0',
          color: '#cbd5e1',
          letterSpacing: '0.5px'
        }}>
          Welcome
        </p>

        {/* CTA Button */}
        <a href="/dashboard" style={{
          display: 'inline-block',
          padding: '16px 48px',
          background: '#2563eb',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '12px',
          fontWeight: '600',
          fontSize: '18px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)',
          border: 'none',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#1d4ed8'
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 12px 48px rgba(37, 99, 235, 0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#2563eb'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(37, 99, 235, 0.3)'
        }}>
          Go to Dashboard
        </a>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(30px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}
