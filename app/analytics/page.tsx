'use client'

import { useState, useEffect } from 'react'

export default function AnalyticsPage() {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeals()
  }, [])

  async function fetchDeals() {
    try {
      const res = await fetch('/api/deals')
      const data = await res.json()
      setDeals(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const stages = ['prospect', 'negotiation', 'proposal', 'active', 'won', 'lost']
  const stageColors: any = {
    prospect: '#dbeafe',
    negotiation: '#fef3c7',
    proposal: '#d1fae5',
    active: '#c7d2fe',
    won: '#10b981',
    lost: '#ef4444'
  }

  const dealsByStage = stages.map(stage => ({
    stage,
    count: deals.filter(d => d.stage === stage).length,
    value: deals.filter(d => d.stage === stage).reduce((sum: number, d: any) => sum + (d.value || 0), 0)
  }))

  const totalValue = deals.reduce((sum: number, d: any) => sum + (d.value || 0), 0)
  const avgDealValue = deals.length > 0 ? (totalValue / deals.length).toFixed(0) : 0

  const conversionRate = deals.filter(d => d.stage === 'won').length > 0
    ? ((deals.filter(d => d.stage === 'won').length / deals.length) * 100).toFixed(1)
    : 0

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>📊 Sales Analytics</h1>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#666', fontSize: '13px', margin: '0 0 8px 0' }}>Total Pipeline Value</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>${(totalValue / 1000).toFixed(0)}K</p>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#666', fontSize: '13px', margin: '0 0 8px 0' }}>Total Deals</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{deals.length}</p>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#666', fontSize: '13px', margin: '0 0 8px 0' }}>Avg Deal Value</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>${avgDealValue}</p>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#666', fontSize: '13px', margin: '0 0 8px 0' }}>Win Rate</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{conversionRate}%</p>
        </div>
      </div>

      {/* Pipeline by Stage */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Pipeline by Stage</h2>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#999' }}>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {dealsByStage.map(stage => (
              <div key={stage.stage} style={{
                background: stageColors[stage.stage],
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.1)'
              }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500', textTransform: 'capitalize' }}>
                  {stage.stage}
                </p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{stage.count}</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
                  ${(stage.value / 1000).toFixed(1)}K
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Insights */}
      <div style={{ marginTop: '40px', background: '#f0f9ff', padding: '24px', borderRadius: '8px', border: '1px solid #93c5fd' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e40af', margin: '0 0 12px 0' }}>💡 Quick Insights</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e40af', fontSize: '14px' }}>
          <li>Top stage: <strong>{dealsByStage.sort((a, b) => b.value - a.value)[0].stage}</strong> with ${(dealsByStage.sort((a, b) => b.value - a.value)[0].value / 1000).toFixed(1)}K value</li>
          <li>Deals waiting follow-up: <strong>{dealsByStage.find(s => s.stage === 'prospect')?.count || 0}</strong> prospects</li>
          <li>Close rate: <strong>{conversionRate}%</strong> (industry average: 20-30%)</li>
        </ul>
      </div>
    </div>
  )
}
