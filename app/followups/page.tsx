'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface FollowUp {
  id: string
  contactId: string
  contact: {
    id: string
    name: string
    email: string
    company: string
    phone: string
  }
  activityType: string
  description: string
  priority: 'high' | 'normal' | 'low'
  status: string
  scheduledDate: string
  scheduledTime: string
  createdAt: string
}

const FollowupsPage = () => {
  const [followups, setFollowups] = useState<FollowUp[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'upcoming'>('today')
  const [filterStatus, setFilterStatus] = useState<'pending' | 'all'>('pending')

  useEffect(() => {
    fetchFollowups()
  }, [activeTab, filterStatus])

  async function fetchFollowups() {
    try {
      setLoading(true)
      const status = filterStatus === 'all' ? '' : 'pending'
      const url = `/api/followups?range=${activeTab}${status ? `&status=${status}` : ''}`
      const res = await fetch(url)
      const data = await res.json()
      setFollowups(data.data || [])
    } catch (error) {
      console.error('Error fetching followups:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleComplete(followupId: string) {
    try {
      const res = await fetch('/api/followups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: followupId,
          status: 'completed'
        })
      })
      if (res.ok) {
        fetchFollowups()
      }
    } catch (error) {
      console.error('Error completing followup:', error)
    }
  }

  const getActivityIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'call': '☎️',
      'email': '📧',
      'meeting': '🤝',
      default: '📌'
    }
    return icons[type?.toLowerCase()] || icons.default
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#fee2e2'
      case 'normal': return '#eff6ff'
      case 'low': return '#f0fdf4'
      default: return '#f9fafb'
    }
  }

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high': return '#fca5a5'
      case 'normal': return '#93c5fd'
      case 'low': return '#86efac'
      default: return '#e5e7eb'
    }
  }

  const groupedFollowups = followups.reduce((acc: any, followup) => {
    const date = followup.scheduledDate
    if (!acc[date]) acc[date] = []
    acc[date].push(followup)
    return acc
  }, {})

  const sortedDates = Object.keys(groupedFollowups).sort()

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
        📞 My Follow-ups
      </h1>
      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 32px 0' }}>
        Track and manage your scheduled follow-up calls
      </p>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
        {(['today', 'week', 'upcoming'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: activeTab === tab ? '#2563eb' : 'transparent',
              color: activeTab === tab ? 'white' : '#6b7280',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            {tab === 'today' && '📅 Today'}
            {tab === 'week' && '📆 This Week'}
            {tab === 'upcoming' && '🗓️ Upcoming'}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading...</p>
      ) : followups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9fafb', borderRadius: '12px' }}>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>✨ No follow-ups</p>
        </div>
      ) : (
        sortedDates.map(date => (
          <div key={date} style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
              {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </h2>
            {groupedFollowups[date].map((f: FollowUp) => (
              <div key={f.id} style={{ background: getPriorityColor(f.priority), border: `2px solid ${getPriorityBorder(f.priority)}`, borderRadius: '12px', padding: '16px', marginBottom: '12px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontSize: '24px' }}>{getActivityIcon(f.activityType)}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{f.scheduledTime}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <Link href={`/contacts/${f.contactId}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb', margin: '0 0 4px 0' }}>{f.contact.name}</h3>
                  </Link>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0' }}>{f.contact.company}</p>
                </div>
                <button onClick={() => handleComplete(f.id)} style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                  ✓ Done
                </button>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}

export default FollowupsPage
