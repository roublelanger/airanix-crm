'use client'

import { useEffect, useState } from 'react'
import EnhancedExcelImport from '@/components/EnhancedExcelImport'

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ totalContacts: 0, activeDeal: 0, newLeads: 0, conversions: 0 })
  const [loading, setLoading] = useState(true)

  async function fetchMetrics() {
    try {
      const res = await fetch('/api/metrics', { cache: 'no-store' })
      const data = await res.json()
      setMetrics(data)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      background: '#ffffff',
      minHeight: '100vh',
      padding: '40px 24px'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '50px' }}>
          <h1 style={{
            fontSize: '42px',
            fontWeight: '900',
            color: '#0f172a',
            margin: '0 0 8px 0',
            letterSpacing: '-1px'
          }}>
            Dashboard
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            margin: '0',
            fontWeight: '500'
          }}>
            Real-time overview of your sales performance
          </p>
        </div>

        {/* CSV Import */}
        <div style={{ marginBottom: '50px' }}>
          <EnhancedExcelImport onImportComplete={fetchMetrics} />
        </div>

        {/* Main Metrics Grid */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#0f172a',
            margin: '0 0 24px 0'
          }}>
            Key Metrics
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {/* Total Contacts Card */}
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fc 0%, #f0f4ff 100%)',
              border: '1px solid #e2e8f0',
              borderLeft: '5px solid #2563eb',
              borderRadius: '12px',
              padding: '28px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => window.location.href = '/contacts'}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)'
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(37, 99, 235, 0.15)'
              e.currentTarget.style.borderLeftColor = '#1d4ed8'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.08)'
              e.currentTarget.style.borderLeftColor = '#2563eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Contacts</span>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                }}>👥</div>
              </div>
              <p style={{ fontSize: '52px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0', lineHeight: '1' }}>
                {metrics.totalContacts}
              </p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0', fontWeight: '500' }}>All contacts in your CRM</p>
            </div>

            {/* New Leads Card */}
            <div style={{
              background: 'linear-gradient(135deg, #fffbf0 0%, #fef3e2 100%)',
              border: '1px solid #fde047',
              borderLeft: '5px solid #ca8a04',
              borderRadius: '12px',
              padding: '28px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: '0 2px 8px rgba(202, 138, 4, 0.12)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => window.location.href = '/contacts?status=lead'}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)'
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(202, 138, 4, 0.20)'
              e.currentTarget.style.borderLeftColor = '#b45309'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(202, 138, 4, 0.12)'
              e.currentTarget.style.borderLeftColor = '#ca8a04'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase', letterSpacing: '1px' }}>New Leads</span>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ca8a04 0%, #b45309 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: '0 4px 12px rgba(202, 138, 4, 0.25)'
                }}>🎯</div>
              </div>
              <p style={{ fontSize: '52px', fontWeight: '900', color: '#92400e', margin: '0 0 8px 0', lineHeight: '1' }}>
                {metrics.newLeads}
              </p>
              <p style={{ fontSize: '13px', color: '#92400e', margin: '0', fontWeight: '500' }}>Fresh opportunities to pursue</p>
            </div>

            {/* Active Deals Card */}
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              border: '1px solid #93c5fd',
              borderLeft: '5px solid #0369a1',
              borderRadius: '12px',
              padding: '28px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: '0 2px 8px rgba(3, 105, 161, 0.12)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => window.location.href = '/deals'}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)'
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(3, 105, 161, 0.20)'
              e.currentTarget.style.borderLeftColor = '#00509e'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(3, 105, 161, 0.12)'
              e.currentTarget.style.borderLeftColor = '#0369a1'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Deals</span>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0369a1 0%, #00509e 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: '0 4px 12px rgba(3, 105, 161, 0.25)'
                }}>💼</div>
              </div>
              <p style={{ fontSize: '52px', fontWeight: '900', color: '#0369a1', margin: '0 0 8px 0', lineHeight: '1' }}>
                {metrics.activeDeal}
              </p>
              <p style={{ fontSize: '13px', color: '#0369a1', margin: '0', fontWeight: '500' }}>Deals in your pipeline</p>
            </div>

            {/* Conversions Card */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #e1fce4 100%)',
              border: '1px solid #86efac',
              borderLeft: '5px solid #10b981',
              borderRadius: '12px',
              padding: '28px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.12)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => window.location.href = '/deals?stage=won'}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)'
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(16, 185, 129, 0.20)'
              e.currentTarget.style.borderLeftColor = '#059669'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.12)'
              e.currentTarget.style.borderLeftColor = '#10b981'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#047857', textTransform: 'uppercase', letterSpacing: '1px' }}>Conversions</span>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                }}>🏆</div>
              </div>
              <p style={{ fontSize: '52px', fontWeight: '900', color: '#047857', margin: '0 0 8px 0', lineHeight: '1' }}>
                {metrics.conversions}
              </p>
              <p style={{ fontSize: '13px', color: '#047857', margin: '0', fontWeight: '500' }}>Successfully closed deals</p>
            </div>
          </div>
        </div>

        {/* Quick Navigation Section */}
        <div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#0f172a',
            margin: '0 0 24px 0'
          }}>
            Quick Actions
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {[
              { icon: '👥', title: 'Manage Contacts', desc: 'View and edit your contacts', link: '/contacts' },
              { icon: '💼', title: 'Track Deals', desc: 'Monitor your sales pipeline', link: '/deals' },
              { icon: '📞', title: 'Activities', desc: 'Log calls, emails & meetings', link: '/activities' },
              { icon: '📋', title: 'Follow-ups', desc: 'Schedule and manage follow-ups', link: '/followups' },
              { icon: '📧', title: 'Email Templates', desc: 'Send emails with templates', link: '/emails' },
              { icon: '📊', title: 'Analytics', desc: 'View detailed insights', link: '/analytics' }
            ].map((action, idx) => (
              <a key={idx} href={action.link} style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'block'
              }}>
                <div style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '24px',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)'
                  e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.1)'
                  e.currentTarget.style.borderColor = '#2563eb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                  e.currentTarget.style.borderColor = '#e2e8f0'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{action.icon}</div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>{action.title}</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0', fontWeight: '500' }}>{action.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
