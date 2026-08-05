'use client'

import { useState, useEffect } from 'react'

export default function FollowupsPage() {
  const [followups, setFollowups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('demo')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    type: 'demo'
  })

  useEffect(() => {
    fetchFollowups()
  }, [])

  async function fetchFollowups() {
    try {
      const res = await fetch('/api/followups')
      const data = await res.json()
      setFollowups(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
          priority: formData.priority,
          status: formData.type
        })
      })
      if (res.ok) {
        setFormData({ title: '', description: '', dueDate: '', priority: 'medium', type: 'demo' })
        setShowForm(false)
        fetchFollowups()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch('/api/followups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      fetchFollowups()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const tabConfig: any = {
    demo: { label: '🎯 Demo', color: '#f59e0b', key: 'open' },
    meeting: { label: '📅 Meetings', color: '#3b82f6', key: 'open' },
    done: { label: '✅ Meeting Done', color: '#10b981', key: 'completed' }
  }

  const filteredFollowups = followups.filter(f => {
    if (activeTab === 'done') return f.status === 'completed'
    return f.status === 'open'
  })

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 24px 0' }}>📋 Follow-ups & Reminders</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #eee', paddingBottom: '12px' }}>
          {['demo', 'meeting', 'done'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                background: activeTab === tab ? tabConfig[tab].color : 'transparent',
                color: activeTab === tab ? 'white' : '#666',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              {tabConfig[tab].label}
            </button>
          ))}
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
          {showForm ? '✕ Close' : '+ New Follow-up'}
        </button>
      </div>

      {/* Form */}
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
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Follow up with John on Demo"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="demo">🎯 Demo</option>
                  <option value="meeting">📅 Meeting</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add details about the follow-up"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', minHeight: '80px', boxSizing: 'border-box' }}
              />
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
              Create Follow-up
            </button>
          </form>
        </div>
      )}

      {/* Followups List */}
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Loading...</div>
        ) : filteredFollowups.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No follow-ups in this category</div>
        ) : (
          <div>
            {filteredFollowups.map((followup: any) => (
              <div
                key={followup.id}
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
                    {followup.title}
                  </div>
                  <p style={{ fontSize: '13px', color: '#666', margin: '0 0 8px 0' }}>{followup.description}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      background: followup.priority === 'high' ? '#fee2e2' : followup.priority === 'medium' ? '#fef3c7' : '#dbeafe',
                      color: followup.priority === 'high' ? '#991b1b' : followup.priority === 'medium' ? '#b45309' : '#1e40af',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {followup.priority.toUpperCase()} Priority
                    </span>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      background: '#d1fae5',
                      color: '#065f46',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      Due: {new Date(followup.due_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {activeTab !== 'done' && (
                  <button
                    onClick={() => updateStatus(followup.id, 'completed')}
                    style={{
                      padding: '8px 16px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginLeft: '16px'
                    }}
                  >
                    Mark Done
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Summary Reminder */}
      <div style={{
        background: '#dbeafe',
        border: '1px solid #93c5fd',
        padding: '16px',
        borderRadius: '8px',
        marginTop: '30px'
      }}>
        <p style={{ margin: 0, color: '#1e40af', fontSize: '14px', fontWeight: '500' }}>
          💡 Tip: Set a daily reminder at 5:00 PM to review all pending follow-ups and send a summary email to rouble@airanix.com
        </p>
      </div>
    </div>
  )
}
