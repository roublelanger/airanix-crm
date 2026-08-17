'use client'

import { useAuth } from '@/app/context/AuthContext'

export default function Home() {
  const { userProfile } = useAuth()
  const isAdmin = userProfile?.role === 'admin'

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 24px'
    }}>
      {/* Welcome Section */}
      <div style={{
        background: '#ffffff',
        border: '2px solid #000000',
        borderRadius: '12px',
        padding: '40px',
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '42px',
          fontWeight: '900',
          color: '#000000',
          margin: '0 0 12px 0',
          letterSpacing: '-1px'
        }}>
          ⚡ Welcome to Airanix CRM
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#666666',
          margin: '0 0 32px 0',
          fontWeight: '500'
        }}>
          Professional Contact & Deal Management System
        </p>

        {userProfile && (
          <div style={{
            background: '#f5f5f5',
            border: '1px solid #e0e0e0',
            padding: '16px 24px',
            borderRadius: '8px',
            marginBottom: '32px',
            display: 'inline-block'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#000000',
              margin: '0 0 4px 0',
              fontWeight: '600'
            }}>
              👤 {userProfile.name}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#666666',
              margin: '0'
            }}>
              Role: <strong>{userProfile.role.toUpperCase()}</strong>
            </p>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <a href="/dashboard" style={{
            display: 'inline-block',
            padding: '14px 32px',
            background: '#000000',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '16px',
            transition: 'all 0.3s ease',
            border: '2px solid #000000',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#333333'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#000000'
          }}>
            📊 Dashboard
          </a>

          <a href="/contacts" style={{
            display: 'inline-block',
            padding: '14px 32px',
            background: '#ffffff',
            color: '#000000',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '16px',
            transition: 'all 0.3s ease',
            border: '2px solid #000000',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f5f5f5'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff'
          }}>
            👥 Contacts
          </a>

          {isAdmin && (
            <a href="/admin" style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: '#fee2e2',
              color: '#dc2626',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              border: '2px solid #fecaca',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fecaca'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fee2e2'
            }}>
              ⚙️ Admin Panel
            </a>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          background: '#ffffff',
          border: '2px solid #000000',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>👥</div>
          <h3 style={{
            fontSize: '14px',
            color: '#666666',
            margin: '0 0 8px 0',
            fontWeight: '600'
          }}>
            Manage Contacts
          </h3>
          <p style={{
            fontSize: '12px',
            color: '#999999',
            margin: '0'
          }}>
            Add, edit, and organize your contacts
          </p>
        </div>

        <div style={{
          background: '#ffffff',
          border: '2px solid #000000',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>💼</div>
          <h3 style={{
            fontSize: '14px',
            color: '#666666',
            margin: '0 0 8px 0',
            fontWeight: '600'
          }}>
            Track Deals
          </h3>
          <p style={{
            fontSize: '12px',
            color: '#999999',
            margin: '0'
          }}>
            Monitor your sales pipeline
          </p>
        </div>

        <div style={{
          background: '#ffffff',
          border: '2px solid #000000',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📞</div>
          <h3 style={{
            fontSize: '14px',
            color: '#666666',
            margin: '0 0 8px 0',
            fontWeight: '600'
          }}>
            Log Activities
          </h3>
          <p style={{
            fontSize: '12px',
            color: '#999999',
            margin: '0'
          }}>
            Track calls, emails & meetings
          </p>
        </div>
      </div>
    </div>
  )
}
