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
    contactId: '',
    callDuration: '',
    emailOpens: 0,
    meetingOutcome: ''
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
        setFormData({ type: 'call', title: '', description: '', outcome: 'pending', contactId: '', callDuration: '', emailOpens: 0, meetingOutcome: '' })
        setShowForm(false)
        fetchActivities()
      } else {
        alert('Error saving activity')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error saving activity')
    }
  }

  async function handleDeleteActivity(activityId: string) {
    if (!confirm('Are you sure you want to delete this activity?')) return
    try {
      const res = await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      if (res.ok) {
        fetchActivities()
      } else {
        alert('Error deleting activity')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting activity')
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

            {formData.type === 'call' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Call Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.callDuration}
                  onChange={(e) => setFormData({ ...formData, callDuration: e.target.value })}
                  placeholder="e.g., 15"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {formData.type === 'email' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Email Opens</label>
                <input
                  type="number"
                  value={formData.emailOpens}
                  onChange={(e) => setFormData({ ...formData, emailOpens: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {formData.type === 'meeting' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Meeting Outcome</label>
                <select
                  value={formData.meetingOutcome}
                  onChange={(e) => setFormData({ ...formData, meetingOutcome: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="">Select outcome...</option>
                  <option value="positive">👍 Positive</option>
                  <option value="neutral">😐 Neutral</option>
                  <option value="negative">👎 Negative</option>
                  <option value="scheduled_followup">📅 Scheduled Follow-up</option>
                </select>
              </div>
            )}

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
                  <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px', color: '#1e293b' }}>
                    {activityTypeIcons[activity.type] || '📌'} {activity.title || activity.description?.substring(0, 30) || 'Activity'}
                  </div>
                  {activity.description && (
                    <p style={{ fontSize: '13px', color: '#666', margin: '0 0 8px 0', lineHeight: '1.4' }}>{activity.description}</p>
                  )}
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    background: `${activityTypeColors[activity.type] || '#6b7280'}20`,
                    color: activityTypeColors[activity.type] || '#6b7280',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {activity.type} {activity.outcome ? '• ' + activity.outcome : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', minWidth: '140px' }}>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {activity.created_at ? new Date(activity.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      style={{
                        padding: '6px 12px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
