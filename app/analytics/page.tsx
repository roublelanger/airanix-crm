'use client'

import { useState, useEffect } from 'react'

export default function AnalyticsPage() {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState<string | null>(null)

  useEffect(() => {
    fetchDeals()
    const interval = setInterval(fetchDeals, 5000)
    return () => clearInterval(interval)
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

  const formatCurrency = (value: number) => {
    return `₹${(value / 100000).toFixed(2)}L`
  }

  const stages = ['LEAD', 'CONTACTED', 'PROPOSAL', 'WON', 'LOST']
  const stageColors: any = {
    LEAD: '#dbeafe',
    CONTACTED: '#fef3c7',
    PROPOSAL: '#d1fae5',
    WON: '#10b981',
    LOST: '#ef4444'
  }

  const dealsByStage = stages.map(stage => ({
    stage,
    count: deals.filter(d => d.stage === stage).length,
    value: deals.filter(d => d.stage === stage).reduce((sum: number, d: any) => sum + (d.value || 0), 0)
  }))

  const totalValue = deals.reduce((sum: number, d: any) => sum + (d.value || 0), 0)
  const avgDealValue = deals.length > 0 ? (totalValue / deals.length) : 0

  const conversionRate = deals.filter(d => d.stage === 'WON').length > 0
    ? ((deals.filter(d => d.stage === 'WON').length / deals.length) * 100).toFixed(1)
    : 0

  const selectedStageData = dealsByStage.find(s => s.stage === selectedStage)

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>📊 Sales Analytics</h1>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#666', fontSize: '13px', margin: '0 0 8px 0' }}>Total Pipeline Value</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{formatCurrency(totalValue)}</p>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#666', fontSize: '13px', margin: '0 0 8px 0' }}>Total Deals</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{deals.length}</p>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#666', fontSize: '13px', margin: '0 0 8px 0' }}>Avg Deal Value</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{formatCurrency(avgDealValue)}</p>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#666', fontSize: '13px', margin: '0 0 8px 0' }}>Win Rate</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{conversionRate}%</p>
        </div>
      </div>

      {/* Pipeline by Stage - Interactive */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Pipeline by Stage (Click to View Details)</h2>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#999' }}>Loading...</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: selectedStage ? '24px' : '0' }}>
              {dealsByStage.map(stage => (
                <div
                  key={stage.stage}
                  onClick={() => setSelectedStage(selectedStage === stage.stage ? null : stage.stage)}
                  style={{
                    background: stageColors[stage.stage],
                    padding: '16px',
                    borderRadius: '8px',
                    border: selectedStage === stage.stage ? '3px solid #1e40af' : '1px solid rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    transform: selectedStage === stage.stage ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase' }}>
                    {stage.stage}
                  </p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{stage.count}</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
                    {formatCurrency(stage.value)}
                  </p>
                </div>
              ))}
            </div>

            {selectedStageData && (
              <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '8px', border: '1px solid #93c5fd' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#1e40af' }}>📊 {selectedStageData.stage} Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Deal Count</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{selectedStageData.count}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Total Value</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{formatCurrency(selectedStageData.value)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Avg Value per Deal</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{selectedStageData.count > 0 ? formatCurrency(selectedStageData.value / selectedStageData.count) : '₹0'}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Insights */}
      <div style={{ background: '#f0f9ff', padding: '24px', borderRadius: '8px', border: '1px solid #93c5fd' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e40af', margin: '0 0 12px 0' }}>💡 Quick Insights</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e40af', fontSize: '14px', lineHeight: '1.8' }}>
          <li>Top stage: <strong>{dealsByStage.sort((a, b) => b.value - a.value)[0].stage}</strong> with {formatCurrency(dealsByStage.sort((a, b) => b.value - a.value)[0].value)} value</li>
          <li>Deals in pipeline: <strong>{dealsByStage.find(s => s.stage === 'LEAD')?.count || 0}</strong> leads waiting follow-up</li>
          <li>Win rate: <strong>{conversionRate}%</strong> (industry average: 20-30%)</li>
          <li>Last updated: <strong>Every 5 seconds</strong> ⟳ (auto-refresh enabled)</li>
        </ul>
      </div>
    </div>
  )
}
