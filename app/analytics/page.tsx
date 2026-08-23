'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface Contact {
  id: string
  name: string
  createdAt: string
  platform?: string
  company?: string
}

interface Deal {
  id: string
  name: string
  value: number
  stage: string
  createdAt: string
}

interface Activity {
  id: string
  type: string
  createdAt: string
}

export default function AnalyticsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  async function fetchData() {
    try {
      const [contactsRes, dealsRes, activitiesRes] = await Promise.all([
        fetch('/api/contacts'),
        fetch('/api/deals'),
        fetch('/api/activities')
      ])

      const contactsData = await contactsRes.json()
      const dealsData = await dealsRes.json()
      const activitiesData = await activitiesRes.json()

      // Defensively handle both raw-array and { success, data } response shapes
      setContacts(Array.isArray(contactsData) ? contactsData : [])
      setDeals(Array.isArray(dealsData) ? dealsData : [])
      setActivities(
        Array.isArray(activitiesData)
          ? activitiesData
          : Array.isArray(activitiesData?.data)
          ? activitiesData.data
          : []
      )
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate metrics
  const now = new Date()
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const last60Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  const previous30Start = new Date(last30Days.getTime() - 30 * 24 * 60 * 60 * 1000)

  const contactsLast30 = contacts.filter(c => new Date(c.createdAt) > last30Days).length
  const contactsPrevious30 = contacts.filter(c => {
    const d = new Date(c.createdAt)
    return d > previous30Start && d <= last30Days
  }).length
  const contactsGrowth = contactsPrevious30 > 0 ? ((contactsLast30 - contactsPrevious30) / contactsPrevious30 * 100).toFixed(0) : '0'

  const dealsLast30 = deals.filter(d => new Date(d.createdAt) > last30Days).length
  const dealsPrevious30 = deals.filter(d => {
    const cr = new Date(d.createdAt)
    return cr > previous30Start && cr <= last30Days
  }).length
  const dealsGrowth = dealsPrevious30 > 0 ? ((dealsLast30 - dealsPrevious30) / dealsPrevious30 * 100).toFixed(0) : '0'

  // Generate time series data (last 30 days)
  const timeSeriesData = Array.from({ length: 30 }).map((_, i) => {
    const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]
    const contactCount = contacts.filter(c => c.createdAt.startsWith(dateStr)).length
    const dealCount = deals.filter(d => d.createdAt.startsWith(dateStr)).length
    return {
      date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: dateStr,
      contacts: contactCount,
      deals: dealCount
    }
  })

  // Contact sources
  const contactSourcesMap = contacts.reduce((acc: any, c) => {
    const source = c.platform || c.company || 'Direct'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {})

  const contactSourcesData = Object.entries(contactSourcesMap)
    .map(([source, count]) => ({ name: source, value: count as number }))
    .sort((a, b) => (b.value as number) - (a.value as number))
    .slice(0, 6)

  // Deals by stage
  const dealsByStageMap = deals.reduce((acc: any, d) => {
    const stage = d.stage || 'LEAD'
    acc[stage] = (acc[stage] || 0) + 1
    return acc
  }, {})

  const dealsByStageData = Object.entries(dealsByStageMap).map(([stage, count]) => ({
    name: stage,
    value: count
  }))

  // Activity breakdown
  const activityByTypeMap = activities.reduce((acc: any, a) => {
    const type = a.type || 'Task'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  const COLORS = ['#2563eb', '#ca8a04', '#0369a1', '#10b981', '#ef4444', '#8b5cf6']

  const activityIcons: any = {
    'Call': '📞',
    'Email': '📧',
    'Meeting': '🤝',
    'Task': '📋'
  }

  if (loading) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center', color: '#64748b', minHeight: '100vh' }}>
        <p>Loading analytics...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 24px', background: '#ffffff', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>
            Analytics
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0', fontWeight: '500' }}>
            📊 In the last 30 days
          </p>
        </div>

        {/* Top 4 Metrics - 2x2 Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {/* New Contacts Created */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', margin: '0 0 16px 0', letterSpacing: '0.5px' }}>
              📇 New Contacts Created
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
              <p style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a', margin: '0' }}>
                {contactsLast30}
              </p>
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                color: contactsLast30 >= contactsPrevious30 ? '#10b981' : '#ef4444',
                padding: '4px 8px',
                background: contactsLast30 >= contactsPrevious30 ? '#f0fdf4' : '#fef2f2',
                borderRadius: '4px'
              }}>
                {contactsGrowth}% vs previous
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0' }}>
              In the last 30 days | {contactsPrevious30} in previous 30 days
            </p>
          </div>

          {/* New Deals Created */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', margin: '0 0 16px 0', letterSpacing: '0.5px' }}>
              🎯 New Deals Created
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
              <p style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a', margin: '0' }}>
                {dealsLast30}
              </p>
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                color: dealsLast30 >= dealsPrevious30 ? '#10b981' : '#ef4444',
                padding: '4px 8px',
                background: dealsLast30 >= dealsPrevious30 ? '#f0fdf4' : '#fef2f2',
                borderRadius: '4px'
              }}>
                {dealsGrowth}% vs previous
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0' }}>
              In the last 30 days | {dealsPrevious30} in previous 30 days
            </p>
          </div>

          {/* Total Contacts */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', margin: '0 0 16px 0', letterSpacing: '0.5px' }}>
              👥 Total Contacts
            </p>
            <p style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>
              {contacts.length}
            </p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0' }}>
              All contacts in your CRM
            </p>
          </div>

          {/* Total Deals */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', margin: '0 0 16px 0', letterSpacing: '0.5px' }}>
              💼 Total Deals
            </p>
            <p style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>
              {deals.length}
            </p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0' }}>
              All deals in pipeline
            </p>
          </div>
        </div>

        {/* Charts Row 1 - Contacts & Deals Over Time */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {/* Contacts Added Over Time */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '0 0 24px 0' }}>
              📈 Contacts Added Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="contacts" stroke="#2563eb" fillOpacity={1} fill="url(#colorContacts)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '12px 0 0 0', textAlign: 'center' }}>
              Daily - In the last 30 days
            </p>
          </div>

          {/* Deals Added Over Time */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '0 0 24px 0' }}>
              📊 Deals Created Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorDeals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="deals" stroke="#10b981" fillOpacity={1} fill="url(#colorDeals)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '12px 0 0 0', textAlign: 'center' }}>
              Daily - In the last 30 days
            </p>
          </div>
        </div>

        {/* Charts Row 2 - Sources & Stages */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {/* Contact Sources */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '0 0 24px 0' }}>
              🔗 Contact Sources
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contactSourcesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#ca8a04" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '12px 0 0 0', textAlign: 'center' }}>
              In the last 30 days
            </p>
          </div>

          {/* Deals by Stage */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '0 0 24px 0' }}>
              🎯 Deals by Stage
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dealsByStageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {dealsByStageData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} deals`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '12px 0 0 0', textAlign: 'center' }}>
              In the last 30 days
            </p>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '0 0 24px 0' }}>
            📞 Activity Type Breakdown
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px'
          }}>
            {Object.entries(activityByTypeMap).map(([type, count]: [string, any]) => (
              <div key={type} style={{
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '28px', margin: '0 0 8px 0' }}>
                  {activityIcons[type] || '📌'}
                </p>
                <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 8px 0' }}>
                  {type}
                </p>
                <p style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', margin: '0' }}>
                  {count}
                </p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '20px 0 0 0', textAlign: 'center' }}>
            In the last 30 days | Compared to | Previous 30 days
          </p>
        </div>

        {/* Last Updated */}
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '32px 0 0 0', textAlign: 'center' }}>
          Auto-refresh every 10 seconds • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
