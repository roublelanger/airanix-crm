'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [metrics, setMetrics] = useState({ totalContacts: 0, activeDeal: 0, newLeads: 0, conversions: 0 })

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch('/api/metrics', { cache: 'no-store' })
        const data = await res.json()
        setMetrics(data)
      } catch (error) {
        console.error('Error fetching metrics:', error)
      }
    }
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <h1>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '30px' }}>
        <div onClick={() => window.location.href = '/contacts'} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
          <h3 style={{ color: '#666', fontSize: '14px' }}>Total Contacts</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>{metrics.totalContacts}</p>
        </div>

        <div onClick={() => window.location.href = '/contacts?status=lead'} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
          <h3 style={{ color: '#666', fontSize: '14px' }}>New Leads</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>{metrics.newLeads}</p>
        </div>

        <div onClick={() => window.location.href = '/deals'} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
          <h3 style={{ color: '#666', fontSize: '14px' }}>Active Deals</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>{metrics.activeDeal}</p>
        </div>

        <div onClick={() => window.location.href = '/deals?stage=won'} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
          <h3 style={{ color: '#666', fontSize: '14px' }}>Conversions</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>{metrics.conversions}</p>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>Quick Links</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginTop: '20px' }}>
          <div onClick={() => window.location.href = '/contacts'} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
            <h3>👥 Contacts</h3>
            <p>Manage leads and customers</p>
          </div>
          <div onClick={() => window.location.href = '/deals'} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
            <h3>💰 Deals</h3>
            <p>Track your pipeline</p>
          </div>
          <div onClick={() => window.location.href = '/emails'} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
            <h3>📧 Email Templates</h3>
            <p>Quick outreach templates</p>
          </div>
          <div onClick={() => window.location.href = '/analytics'} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
            <h3>📊 Analytics</h3>
            <p>Sales pipeline insights</p>
          </div>
          <div onClick={() => window.location.href = '/settings'} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
            <h3>⚙️ Settings</h3>
            <p>Configure your CRM</p>
          </div>
        </div>
      </div>
    </div>
  )
}
