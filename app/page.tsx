'use client'

import { useEffect, useState } from 'react'
import EnhancedExcelImport from '@/components/EnhancedExcelImport'

export default function Home() {
  const [metrics, setMetrics] = useState({ totalContacts: 0, activeDeal: 0, newLeads: 0, conversions: 0 })

  async function fetchMetrics() {
    try {
      const res = await fetch('/api/metrics', { cache: 'no-store' })
      const data = await res.json()
      setMetrics(data)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  const MetricCard = ({ title, value, onClick, icon }: { title: string; value: number; onClick: () => void; icon: string }) => (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#d1d5db'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e5e7eb'
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </span>
        <span style={{ fontSize: '24px' }}>{icon}</span>
      </div>
      <p style={{ fontSize: '36px', fontWeight: '700', color: '#111827', margin: '0', lineHeight: '1' }}>
        {value.toLocaleString()}
      </p>
      <p style={{ fontSize: '12px', color: '#9ca3af', margin: '8px 0 0 0' }}>View details →</p>
    </div>
  )

  const QuickLink = ({ title, description, onClick, icon }: { title: string; description: string; onClick: () => void; icon: string }) => (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#d1d5db'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
        e.currentTarget.style.backgroundColor = '#f9fafb'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e5e7eb'
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
        e.currentTarget.style.backgroundColor = 'white'
      }}
    >
      <div style={{ fontSize: '32px' }}>{icon}</div>
      <div>
        <h3 style={{ margin: '0', fontSize: '15px', fontWeight: '600', color: '#111827' }}>{title}</h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>{description}</p>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', minHeight: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ margin: '0 0 12px 0', fontSize: '32px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>
          Dashboard
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
          Welcome back. Here's your sales pipeline at a glance.
        </p>
      </div>

      {/* CSV Import */}
      <div style={{ marginBottom: '32px' }}>
        <EnhancedExcelImport onImportComplete={fetchMetrics} />
      </div>

      {/* Key Metrics */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#111827' }}>Key Metrics</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          <MetricCard
            title="Total Contacts"
            value={metrics.totalContacts}
            icon="👥"
            onClick={() => (window.location.href = '/contacts')}
          />
          <MetricCard
            title="New Leads"
            value={metrics.newLeads}
            icon="🎯"
            onClick={() => (window.location.href = '/contacts?status=lead')}
          />
          <MetricCard
            title="Active Deals"
            value={metrics.activeDeal}
            icon="💼"
            onClick={() => (window.location.href = '/deals')}
          />
          <MetricCard
            title="Conversions"
            value={metrics.conversions}
            icon="🏆"
            onClick={() => (window.location.href = '/deals?stage=won')}
          />
        </div>
      </div>

      {/* Quick Navigation */}
      <div>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#111827' }}>Quick Navigation</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
          <QuickLink
            title="Contacts"
            description="Manage leads and customers"
            icon="👥"
            onClick={() => (window.location.href = '/contacts')}
          />
          <QuickLink
            title="Deals"
            description="Track your sales pipeline"
            icon="💰"
            onClick={() => (window.location.href = '/deals')}
          />
          <QuickLink
            title="Activities"
            description="View calls, emails, meetings"
            icon="📞"
            onClick={() => (window.location.href = '/activities')}
          />
          <QuickLink
            title="Follow-ups"
            description="Scheduled reminders & tasks"
            icon="📋"
            onClick={() => (window.location.href = '/followups')}
          />
          <QuickLink
            title="Email Templates"
            description="Quick outreach templates"
            icon="📧"
            onClick={() => (window.location.href = '/emails')}
          />
          <QuickLink
            title="Analytics"
            description="Sales pipeline insights"
            icon="📊"
            onClick={() => (window.location.href = '/analytics')}
          />
        </div>
      </div>
    </div>
  )
}
