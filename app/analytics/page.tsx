'use client'

import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area
} from 'recharts'

interface Contact {
  id: string
  name: string
  email: string
  createdAt: string
  company?: string
  status?: string
}

interface Deal {
  id: string
  createdAt: string
  stage?: string
}

interface Activity {
  id: string
  type: string
  createdAt: string
}

interface FollowUp {
  id: string
  status: string
}

const STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  LEAD: 'Lead',
  ACTIVE: 'Active',
  CLOSED: 'Closed',
  INACTIVE: 'Inactive'
}

const STATUS_COLORS: Record<string, string> = {
  NEW: '#2563eb',
  LEAD: '#f59e0b',
  ACTIVE: '#10b981',
  CLOSED: '#64748b',
  INACTIVE: '#ef4444'
}

const ACTIVITY_LABELS: Record<string, string> = {
  'call': 'Call',
  'email': 'Email Sent',
  'meeting': 'Meeting',
  'note': 'Note',
  'task': 'Task',
  'call-not-received': 'Call Not Received',
  'follow-up-call': 'Follow-up Call',
  'follow-up-meeting': 'Follow-up for Meeting',
  'meeting-booked': 'Meeting Booked',
  'meeting-happened': 'Meeting Happened',
  'follow-up-completed': 'Follow-up Completed',
  'assigned': 'Assigned'
}

const CATEGORY_COLORS = ['#2563eb', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#0ea5e9', '#ec4899', '#64748b']

const CARD_STYLE: CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '28px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
}

const SECTION_TITLE_STYLE: CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#0f172a',
  margin: '0 0 20px 0'
}

const CAPTION_STYLE: CSSProperties = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '12px 0 0 0',
  textAlign: 'center'
}

export default function AnalyticsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [followups, setFollowups] = useState<FollowUp[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchData() {
    try {
      const [contactsRes, dealsRes, activitiesRes, followupsRes] = await Promise.all([
        fetch('/api/contacts'),
        fetch('/api/deals'),
        fetch('/api/activities'),
        fetch('/api/followups')
      ])

      const contactsData = await contactsRes.json()
      const dealsData = await dealsRes.json()
      const activitiesData = await activitiesRes.json()
      const followupsData = await followupsRes.json()

      const rawContacts = Array.isArray(contactsData) ? contactsData : []

      // The contacts table has duplicate rows (same person imported more than
      // once by the lead-import crons). Dedupe by email+name - the same rule
      // the Contacts page already uses - so every page reports the same counts.
      const seen = new Set<string>()
      const dedupedContacts = rawContacts.filter((c: Contact) => {
        const key = `${c.email?.toLowerCase?.() || ''}:${c.name?.toLowerCase?.() || ''}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      setContacts(dedupedContacts)
      setDeals(Array.isArray(dealsData) ? dealsData : [])
      setActivities(
        Array.isArray(activitiesData) ? activitiesData
          : Array.isArray(activitiesData?.data) ? activitiesData.data : []
      )
      setFollowups(
        Array.isArray(followupsData) ? followupsData
          : Array.isArray(followupsData?.data) ? followupsData.data : []
      )
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const now = new Date()

  // How many days of real history this CRM has - used to explain the growth
  // numbers honestly instead of leaving a spike with no context.
  const earliestContactTime = contacts.reduce<number | null>((earliest, c) => {
    const t = new Date(c.createdAt).getTime()
    return earliest === null || t < earliest ? t : earliest
  }, null)
  const daysOfHistory = earliestContactTime
    ? Math.max(1, Math.ceil((now.getTime() - earliestContactTime) / (24 * 60 * 60 * 1000)))
    : 0

  // Call connect rate: follow-up-call (connected) vs call-not-received (missed)
  const connectedCalls = activities.filter(a => a.type === 'follow-up-call').length
  const missedCalls = activities.filter(a => a.type === 'call-not-received').length
  const totalCallAttempts = connectedCalls + missedCalls
  const connectRate = totalCallAttempts > 0 ? Math.round((connectedCalls / totalCallAttempts) * 100) : null

  // Follow-up completion rate
  const completedFollowups = followups.filter(f => f.status === 'completed').length
  const totalFollowups = followups.length
  const completionRate = totalFollowups > 0 ? Math.round((completedFollowups / totalFollowups) * 100) : null

  // Cumulative contact growth over the last 30 days (a running total reads as
  // a clean growth curve; a daily-new-contacts chart spikes then falls off a
  // cliff whenever contacts arrive in one bulk import, which looks broken).
  const contactTimestamps = contacts
    .map(c => new Date(c.createdAt).getTime())
    .sort((a, b) => a - b)

  const growthData = Array.from({ length: 30 }).map((_, i) => {
    const dayEnd = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
    dayEnd.setHours(23, 59, 59, 999)
    const cumulativeTotal = contactTimestamps.filter(t => t <= dayEnd.getTime()).length
    return {
      date: dayEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total: cumulativeTotal
    }
  })

  // Contacts by pipeline status - only stages that actually have contacts
  const statusCounts = contacts.reduce<Record<string, number>>((acc, c) => {
    const status = c.status || 'NEW'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})
  const pipelineData = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      color: STATUS_COLORS[status] || '#94a3b8'
    }))

  // Activity type breakdown
  const activityCounts = activities.reduce<Record<string, number>>((acc, a) => {
    const type = a.type || 'note'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})
  const activityData = Object.entries(activityCounts)
    .map(([type, count], i) => ({
      name: ACTIVITY_LABELS[type] || type,
      value: count,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
    }))
    .sort((a, b) => b.value - a.value)

  // Top companies by contact count. Contacts with no company on file are
  // tracked separately as a data-completeness note instead of being folded
  // into the chart as a misleading "biggest company".
  const companyCounts = contacts.reduce<Record<string, number>>((acc, c) => {
    if (!c.company) return acc
    acc[c.company] = (acc[c.company] || 0) + 1
    return acc
  }, {})
  const topCompaniesData = Object.entries(companyCounts)
    .map(([name, count]) => ({ name, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
  const contactsWithoutCompany = contacts.length - Object.values(companyCounts).reduce((a, b) => a + b, 0)
  const missingCompanyPct = contacts.length > 0 ? Math.round((contactsWithoutCompany / contacts.length) * 100) : 0

  // Deals by stage (only rendered once real deals exist)
  const dealStageCounts = deals.reduce<Record<string, number>>((acc, d) => {
    const stage = d.stage || 'LEAD'
    acc[stage] = (acc[stage] || 0) + 1
    return acc
  }, {})
  const dealsByStageData = Object.entries(dealStageCounts).map(([stage, count], i) => ({
    name: stage,
    value: count,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
  }))

  if (loading) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center', color: '#64748b', minHeight: '100vh' }}>
        <p>Loading analytics...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 24px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Analytics
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              CRM performance overview
            </p>
          </div>
          {lastUpdated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '999px', padding: '6px 14px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <KpiCard
            label="Total Contacts"
            value={contacts.length.toLocaleString()}
            accent="#2563eb"
            note={daysOfHistory > 0 ? `All added within the last ${daysOfHistory} day${daysOfHistory === 1 ? '' : 's'}` : 'No contacts yet'}
          />
          <KpiCard
            label="Total Activities Logged"
            value={activities.length.toLocaleString()}
            accent="#8b5cf6"
            note="Calls, notes & follow-ups combined"
          />
          <KpiCard
            label="Call Connect Rate"
            value={connectRate !== null ? `${connectRate}%` : '—'}
            accent="#10b981"
            note={totalCallAttempts > 0 ? `${connectedCalls} connected of ${totalCallAttempts} call attempts` : 'No calls logged yet'}
          />
          <KpiCard
            label="Follow-up Completion Rate"
            value={completionRate !== null ? `${completionRate}%` : '—'}
            accent="#f59e0b"
            note={totalFollowups > 0 ? `${completedFollowups} of ${totalFollowups} follow-ups completed` : 'No follow-ups scheduled yet'}
          />
        </div>

        {/* Growth + Pipeline Status */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          <div style={CARD_STYLE}>
            <h3 style={SECTION_TITLE_STYLE}>Contacts Growth</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }}
                  formatter={(value: number) => [`${value} contacts`, 'Total']}
                />
                <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
            <p style={CAPTION_STYLE}>Cumulative total contacts, last 30 days</p>
          </div>

          <div style={CARD_STYLE}>
            <h3 style={SECTION_TITLE_STYLE}>Contacts by Pipeline Status</h3>
            {pipelineData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={2} dataKey="value">
                      {pipelineData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [`${value} contacts`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <p style={CAPTION_STYLE}>
                  {contacts.length} contacts across {pipelineData.length} pipeline stage{pipelineData.length === 1 ? '' : 's'}
                </p>
              </>
            ) : (
              <EmptyState message="No contacts to show yet" />
            )}
          </div>
        </div>

        {/* Activity Breakdown + Top Companies */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          <div style={CARD_STYLE}>
            <h3 style={SECTION_TITLE_STYLE}>Activity Type Breakdown</h3>
            {activityData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={activityData} cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={2} dataKey="value">
                      {activityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [`${value} activities`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <p style={CAPTION_STYLE}>{activities.length} total activities logged</p>
              </>
            ) : (
              <EmptyState message="No activities logged yet" />
            )}
          </div>

          <div style={CARD_STYLE}>
            <h3 style={SECTION_TITLE_STYLE}>Top Companies by Contact Count</h3>
            {topCompaniesData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topCompaniesData} layout="vertical" margin={{ left: 16, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11, fill: '#475569' }} />
                    <Tooltip formatter={(value: number) => [`${value} contacts`, '']} contentStyle={{ fontSize: '13px' }} />
                    <Bar dataKey="value" fill="#2563eb" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                {contactsWithoutCompany > 0 && (
                  <p style={CAPTION_STYLE}>
                    {contactsWithoutCompany} contact{contactsWithoutCompany === 1 ? '' : 's'} ({missingCompanyPct}%) have no company on file and are excluded above
                  </p>
                )}
              </>
            ) : (
              <EmptyState message="No company data available yet" />
            )}
          </div>
        </div>

        {/* Deals Pipeline */}
        <div style={CARD_STYLE}>
          <h3 style={SECTION_TITLE_STYLE}>Deals Pipeline</h3>
          {deals.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={dealsByStageData} cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={2} dataKey="value">
                    {dealsByStageData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [`${value} deals`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p style={CAPTION_STYLE}>{deals.length} deals in pipeline</p>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#334155', margin: '0 0 6px 0' }}>
                No deals recorded yet
              </p>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                Once your team starts creating deals, value and stage distribution will appear here.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function KpiCard({ label, value, accent, note }: { label: string; value: string; accent: string; note: string }) {
  return (
    <div style={{ ...CARD_STYLE, padding: '24px', borderLeft: `4px solid ${accent}` }}>
      <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px 0' }}>
        {label}
      </p>
      <p style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
        {value}
      </p>
      <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
        {note}
      </p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{message}</p>
    </div>
  )
}
