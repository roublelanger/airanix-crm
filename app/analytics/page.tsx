'use client'

import { useState, useEffect } from 'react'

interface AnalyticsData {
  totalContacts: number
  newContactsLast30: number
  totalDeals: number
  newDealsLast30: number
  dealsByStage: Record<string, number>
  contactsBySource: Record<string, number>
  activitiesByType: Record<string, number>
  contactsOverTime: { date: string; count: number }[]
  dealsOverTime: { date: string; count: number }[]
  avgDealValue: number
  totalDealValue: number
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchAnalytics() {
    try {
      const [contactsRes, dealsRes, activitiesRes] = await Promise.all([
        fetch('/api/contacts'),
        fetch('/api/deals'),
        fetch('/api/activities')
      ])

      const contacts = await contactsRes.json()
      const deals = await dealsRes.json()
      const activities = await activitiesRes.json()

      const now = new Date()
      const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const newContacts = contacts.filter((c: any) => new Date(c.createdAt) > last30).length
      const newDeals = deals.filter((d: any) => new Date(d.createdAt) > last30).length

      const dealsByStage = deals.reduce((acc: any, d: any) => {
        acc[d.stage || 'LEAD'] = (acc[d.stage || 'LEAD'] || 0) + 1
        return acc
      }, {})

      const contactsBySource = contacts.reduce((acc: any, c: any) => {
        const source = c.platform || c.company || 'Direct'
        acc[source] = (acc[source] || 0) + 1
        return acc
      }, {})

      const activitiesByType = activities.reduce((acc: any, a: any) => {
        acc[a.type || 'Task'] = (acc[a.type || 'Task'] || 0) + 1
        return acc
      }, {})

      const contactsOverTime = generateTimeSeriesData(contacts, 30)
      const dealsOverTime = generateTimeSeriesData(deals, 30)

      const totalDealValue = deals.reduce((sum: number, d: any) => sum + (d.value || 0), 0)
      const avgDealValue = deals.length > 0 ? totalDealValue / deals.length : 0

      setAnalytics({
        totalContacts: contacts.length,
        newContactsLast30: newContacts,
        totalDeals: deals.length,
        newDealsLast30: newDeals,
        dealsByStage,
        contactsBySource,
        activitiesByType,
        contactsOverTime,
        dealsOverTime,
        avgDealValue,
        totalDealValue
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  function generateTimeSeriesData(items: any[], days: number) {
    const data: { date: string; count: number }[] = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const count = items.filter((item) => item.createdAt?.startsWith(dateStr)).length
      data.push({ date: dateStr, count })
    }

    return data
  }

  if (loading) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center', color: '#64748b' }}>
        Loading analytics...
      </div>
    )
  }

  if (!analytics) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center', color: '#ef4444' }}>
        Error loading analytics
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 24px', background: '#ffffff', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>
            Analytics Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0', fontWeight: '500' }}>
            Last 30 days performance overview
          </p>
        </div>

        {/* Filter Bar */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '8px',
          borderLeft: '4px solid #2563eb'
        }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
            📊 Last 30 Days
          </span>
        </div>

        {/* Key Metrics Row 1 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {/* New Contacts Created */}
          <div style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '1px solid #7dd3fc',
            borderLeft: '4px solid #0369a1',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(3, 105, 161, 0.08)'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#0369a1', textTransform: 'uppercase', margin: '0', letterSpacing: '0.8px' }}>
                New Contacts Created
              </p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>In the last 30 days</p>
            </div>
            <p style={{ fontSize: '48px', fontWeight: '900', color: '#0369a1', margin: '0 0 8px 0' }}>
              {analytics.newContactsLast30}
            </p>
            <p style={{ fontSize: '12px', color: '#0369a1', margin: '0' }}>
              Total: {analytics.totalContacts} contacts
            </p>
          </div>

          {/* New Deals Created */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #e1fce4 100%)',
            border: '1px solid #86efac',
            borderLeft: '4px solid #10b981',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#047857', textTransform: 'uppercase', margin: '0', letterSpacing: '0.8px' }}>
                New Deals Created
              </p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>In the last 30 days</p>
            </div>
            <p style={{ fontSize: '48px', fontWeight: '900', color: '#047857', margin: '0 0 8px 0' }}>
              {analytics.newDealsLast30}
            </p>
            <p style={{ fontSize: '12px', color: '#047857', margin: '0' }}>
              Total: {analytics.totalDeals} deals
            </p>
          </div>

          {/* Avg Deal Value */}
          <div style={{
            background: 'linear-gradient(135deg, #fffbf0 0%, #fef3e2 100%)',
            border: '1px solid #fde047',
            borderLeft: '4px solid #ca8a04',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(202, 138, 4, 0.08)'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase', margin: '0', letterSpacing: '0.8px' }}>
                Average Deal Value
              </p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Per deal</p>
            </div>
            <p style={{ fontSize: '48px', fontWeight: '900', color: '#92400e', margin: '0 0 8px 0' }}>
              ₹{(analytics.avgDealValue / 100000).toFixed(1)}L
            </p>
            <p style={{ fontSize: '12px', color: '#92400e', margin: '0' }}>
              Total: ₹{(analytics.totalDealValue / 100000).toFixed(1)}L
            </p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {/* Contacts Added Over Time */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #2563eb',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px 0' }}>
              📈 Contacts Added Over Time
            </h3>
            <div style={{
              height: '300px',
              background: '#f8f9fa',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              padding: '16px',
              gap: '8px'
            }}>
              {analytics.contactsOverTime.map((item, idx) => {
                const maxCount = Math.max(...analytics.contactsOverTime.map(d => d.count), 1)
                const height = (item.count / maxCount) * 250
                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      height: `${height}px`,
                      background: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)',
                      borderRadius: '4px 4px 0 0',
                      minHeight: '4px',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                      opacity: height > 0 ? 0.9 : 0.3
                    }}
                    title={`${item.date}: ${item.count} contacts`}
                  />
                )
              })}
            </div>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '12px 0 0 0', textAlign: 'center' }}>
              Daily breakdown over 30 days
            </p>
          </div>

          {/* Deals Added Over Time */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #10b981',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px 0' }}>
              📊 Deals Added Over Time
            </h3>
            <div style={{
              height: '300px',
              background: '#f8f9fa',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              padding: '16px',
              gap: '8px'
            }}>
              {analytics.dealsOverTime.map((item, idx) => {
                const maxCount = Math.max(...analytics.dealsOverTime.map(d => d.count), 1)
                const height = (item.count / maxCount) * 250
                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      height: `${height}px`,
                      background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                      borderRadius: '4px 4px 0 0',
                      minHeight: '4px',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                      opacity: height > 0 ? 0.9 : 0.3
                    }}
                    title={`${item.date}: ${item.count} deals`}
                  />
                )
              })}
            </div>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '12px 0 0 0', textAlign: 'center' }}>
              Daily breakdown over 30 days
            </p>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {/* Deals by Stage */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #0369a1',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px 0' }}>
              🎯 Deals by Stage
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(analytics.dealsByStage).map(([stage, count]) => {
                const total = analytics.totalDeals
                const percentage = total > 0 ? ((count as number) / total) * 100 : 0
                const stageColors: any = {
                  LEAD: '#2563eb',
                  CONTACTED: '#ca8a04',
                  PROPOSAL: '#0369a1',
                  CLOSED_WON: '#10b981',
                  CLOSED_LOST: '#ef4444'
                }
                return (
                  <div key={stage}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a' }}>
                        {stage}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: stageColors[stage] }}>
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: '#f0f0f0',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: stageColors[stage],
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Contact Sources */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #ca8a04',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px 0' }}>
              👥 Contact Sources
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(analytics.contactsBySource)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .slice(0, 6)
                .map(([source, count]) => {
                  const total = analytics.totalContacts
                  const percentage = total > 0 ? ((count as number) / total) * 100 : 0
                  return (
                    <div key={source}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a' }}>
                          {source}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb' }}>
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#f0f0f0',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: '#2563eb',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #10b981',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px 0' }}>
            📞 Activity Type Breakdown
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '20px'
          }}>
            {Object.entries(analytics.activitiesByType).map(([type, count]) => {
              const icons: any = {
                'Call': '📞',
                'Email': '📧',
                'Meeting': '🤝',
                'Task': '📋'
              }
              return (
                <div key={type} style={{
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{ fontSize: '24px', margin: '0 0 8px 0' }}>
                    {icons[type] || '📌'}
                  </p>
                  <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 8px 0' }}>
                    {type}
                  </p>
                  <p style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: '0' }}>
                    {count}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
