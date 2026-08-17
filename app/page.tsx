'use client'

import { useAuth } from '@/app/context/AuthContext'

export default function Home() {
  const { userProfile } = useAuth()
  const isAdmin = userProfile?.role === 'admin'

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px 16px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Welcome Section */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
        border: '2px solid #e5e7eb',
        borderRadius: '16px',
        padding: '32px 20px',
        marginBottom: '32px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          fontSize: '56px',
          marginBottom: '20px',
          animation: 'pulse 2.5s ease-in-out infinite'
        }}>
          ⚡
        </div>
        <h1 style={{
          fontSize: 'clamp(28px, 6vw, 48px)',
          fontWeight: '900',
          color: '#000000',
          margin: '0 0 16px 0',
          letterSpacing: '-1.5px',
          background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Welcome to Airanix CRM
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#666666',
          margin: '0 0 36px 0',
          fontWeight: '500',
          letterSpacing: '0.3px'
        }}>
          Professional Contact & Deal Management System
        </p>

        {userProfile && (
          <div style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #f3f4f6 100%)',
            border: '2px solid #3b82f6',
            padding: '16px 24px',
            borderRadius: '12px',
            marginBottom: '36px',
            display: 'inline-block',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#000000',
              margin: '0 0 6px 0',
              fontWeight: '700'
            }}>
              👤 {userProfile.name}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#3b82f6',
              margin: '0',
              fontWeight: '600'
            }}>
              Role: {userProfile.role.toUpperCase()}
            </p>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
          maxWidth: '650px',
          margin: '0 auto'
        }}>
          <a href="/dashboard" style={{
            display: 'inline-block',
            padding: '16px 28px',
            background: 'linear-gradient(135deg, #000000 0%, #1f2937 100%)',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '15px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)'
          }}>
            📊 Dashboard
          </a>

          <a href="/contacts" style={{
            display: 'inline-block',
            padding: '16px 28px',
            background: '#ffffff',
            color: '#000000',
            textDecoration: 'none',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '15px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: '2px solid #000000',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f3f4f6'
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            👥 Contacts
          </a>

          {isAdmin && (
            <a href="/admin" style={{
              display: 'inline-block',
              padding: '16px 28px',
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '15px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 16px rgba(220, 38, 38, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(220, 38, 38, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(220, 38, 38, 0.3)'
            }}>
              ⚙️ Admin Panel
            </a>
          )}
        </div>
      </div>

      {/* Quick Stats - Modern Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* Manage Contacts Card */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)',
          border: '2px solid #dbeafe',
          borderRadius: '16px',
          padding: '24px 20px',
          textAlign: 'center',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)'
          e.currentTarget.style.boxShadow = '0 16px 32px rgba(59, 130, 246, 0.2)'
          e.currentTarget.style.borderColor = '#60a5fa'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.1)'
          e.currentTarget.style.borderColor = '#dbeafe'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            width: '72px',
            height: '72px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            👥
          </div>
          <h3 style={{
            fontSize: '18px',
            color: '#000000',
            margin: '0 0 8px 0',
            fontWeight: '700'
          }}>
            Manage Contacts
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#666666',
            margin: '0',
            lineHeight: '1.6'
          }}>
            Add, edit, and organize your contacts with ease
          </p>
        </div>

        {/* Track Deals Card */}
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)',
          border: '2px solid #fcd34d',
          borderRadius: '16px',
          padding: '24px 20px',
          textAlign: 'center',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(202, 138, 4, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)'
          e.currentTarget.style.boxShadow = '0 16px 32px rgba(202, 138, 4, 0.2)'
          e.currentTarget.style.borderColor = '#facc15'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(202, 138, 4, 0.1)'
          e.currentTarget.style.borderColor = '#fcd34d'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            width: '72px',
            height: '72px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            💼
          </div>
          <h3 style={{
            fontSize: '18px',
            color: '#000000',
            margin: '0 0 8px 0',
            fontWeight: '700'
          }}>
            Track Deals
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#666666',
            margin: '0',
            lineHeight: '1.6'
          }}>
            Monitor your sales pipeline and close more deals
          </p>
        </div>

        {/* Log Activities Card */}
        <div style={{
          background: 'linear-gradient(135deg, #fce7f3 0%, #ffffff 100%)',
          border: '2px solid #fbcfe8',
          borderRadius: '16px',
          padding: '24px 20px',
          textAlign: 'center',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(236, 72, 153, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)'
          e.currentTarget.style.boxShadow = '0 16px 32px rgba(236, 72, 153, 0.2)'
          e.currentTarget.style.borderColor = '#f472b6'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.1)'
          e.currentTarget.style.borderColor = '#fbcfe8'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            width: '72px',
            height: '72px',
            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            📞
          </div>
          <h3 style={{
            fontSize: '18px',
            color: '#000000',
            margin: '0 0 8px 0',
            fontWeight: '700'
          }}>
            Log Activities
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#666666',
            margin: '0',
            lineHeight: '1.6'
          }}>
            Track calls, emails, meetings, and interactions
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}
