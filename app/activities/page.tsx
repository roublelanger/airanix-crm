'use client'

import { useState, useEffect } from 'react'

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'call',
    title: '',
    description: '',
    outcome: 'pending',
    contactId: ''
  })

  useEffect(() => {
    fetchActivities()
  }, [])

  async function fetchActivities() {
    try {
      const res = await fetch('/api/activities')
      const data = await res.json()
      setActivities(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setFormData({ type: 'call', title: '', description: '', outcome: 'pending', contactId: '' })
        setShowForm(false)
        fetchActivities()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const activityTypeColors: any = {
    call: '#3b82f6',
    email: '#10b981',
    meeting: '#f59e0b',
    note: '#8b5cf6'
  }

  const activityTypeIcons: any = {
    call: '☎️',
    email: '📧',
    meeting: '📅',
    note: '📝'
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>📞 Activity Log</h1>
          <p style={{ color: '#666', margin: 0 }}>Track all your calls, emails, and meetings</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          {showForm ? '✕ Close' : '+ Log Activity'}
        </button>
      </div>

      {showForm && (
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Activity Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="call">☎️ Call</option>
                  <option value="email">📧 Email</option>
                  <option value="meeting">📅 Meeting</option>
                  <option value="note">📝 Note</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Sales Call - John Doe"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What was discussed?"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', minHeight: '100px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Outcome</label>
                <select
                  value={formData.outcome}
                  onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="pending">⏳ Pending Follow-up</option>
                  <option value="demo">🎯 Demo Scheduled</option>
                  <option value="meeting">📅 Meeting Scheduled</option>
                  <option value="completed">✅ Completed</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Contact ID</label>
                <input
                  type="text"
                  value={formData.contactId}
                  onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                  placeholder="Contact ID (optional)"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '10px 20px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Save Activity
            </button>
          </form>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Loading activities...</div>
        ) : activities.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No activities yet. Start by logging a call or email.</div>
        ) : (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {activities.map((activity: any) => (
              <div
                key={activity.id}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>
                    {activityTypeIcons[activity.type]} {activity.title || 'Untitled'}
                  </div>
                  <p style={{ fontSize: '13px', color: '#666', margin: '0 0 4px 0' }}>{activity.description}</p>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    background: `${activityTypeColors[activity.type]}20`,
                    color: activityTypeColors[activity.type],
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} • {activity.outcome}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#999', minWidth: '120px', textAlign: 'right' }}>
                  {new Date(activity.completed_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
