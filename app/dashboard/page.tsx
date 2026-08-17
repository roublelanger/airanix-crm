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
              background: '#ffffff',
              border: '2px solid #000000',
              borderRadius: '16px',
              padding: '32px',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => window.location.href = '/contacts'}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)'
              e.currentTarget.style.borderColor = '#2563eb'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
              e.currentTarget.style.borderColor = '#e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Total Contacts</span>
                <span style={{ fontSize: '32px' }}>👥</span>
              </div>
              <p style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a', margin: '0 0 12px 0', lineHeight: '1' }}>
                {metrics.totalContacts}
              </p>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0', fontWeight: '500' }}>All contacts in your CRM</p>
            </div>

            {/* New Leads Card */}
            <div style={{
              background: '#f5f5f5',
              border: '2px solid #000000',
              borderRadius: '16px',
              padding: '32px',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: '0 2px 8px rgba(202, 138, 4, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => window.location.href = '/contacts?status=lead'}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(202, 138, 4, 0.25)'
              e.currentTarget.style.borderColor = '#ca8a04'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(202, 138, 4, 0.15)'
              e.currentTarget.style.borderColor = '#fde047'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.8px' }}>New Leads</span>
                <span style={{ fontSize: '32px' }}>🎯</span>
              </div>
              <p style={{ fontSize: '48px', fontWeight: '900', color: '#92400e', margin: '0 0 12px 0', lineHeight: '1' }}>
                {metrics.newLeads}
              </p>
              <p style={{ fontSize: '14px', color: '#92400e', margin: '0', fontWeight: '500' }}>Fresh opportunities to pursue</p>
            </div>

            {/* Active Deals Card */}
            <div style={{
              background: '#f5f5f5',
              border: '2px solid #000000',
              borderRadius: '16px',
              padding: '32px',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => window.location.href = '/deals'}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.25)'
              e.currentTarget.style.borderColor = '#0369a1'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.15)'
              e.currentTarget.style.borderColor = '#93c5fd'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Active Deals</span>
                <span style={{ fontSize: '32px' }}>💼</span>
              </div>
              <p style={{ fontSize: '48px', fontWeight: '900', color: '#0369a1', margin: '0 0 12px 0', lineHeight: '1' }}>
                {metrics.activeDeal}
              </p>
              <p style={{ fontSize: '14px', color: '#0369a1', margin: '0', fontWeight: '500' }}>Deals in your pipeline</p>
            </div>

            {/* Conversions Card */}
            <div style={{
              background: '#f5f5f5',
              border: '2px solid #000000',
              borderRadius: '16px',
              padding: '32px',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => window.location.href = '/deals?stage=won'}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.25)'
              e.currentTarget.style.borderColor = '#047857'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.15)'
              e.currentTarget.style.borderColor = '#6ee7b7'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Conversions</span>
                <span style={{ fontSize: '32px' }}>🏆</span>
              </div>
              <p style={{ fontSize: '48px', fontWeight: '900', color: '#047857', margin: '0 0 12px 0', lineHeight: '1' }}>
                {metrics.conversions}
              </p>
              <p style={{ fontSize: '14px', color: '#047857', margin: '0', fontWeight: '500' }}>Successfully closed deals</p>
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
