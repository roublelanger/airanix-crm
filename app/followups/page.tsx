'use client'

import { useState, useEffect } from 'react'

export default function FollowupsPage() {
  const [followups, setFollowups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('open')
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
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
    setFormError('')
    setFormSuccess('')

    if (!formData.title.trim()) {
      setFormError('Follow-up title is required')
      return
    }
    if (!formData.dueDate) {
      setFormError('Due date is required')
      return
    }

    try {
      const res = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
          priority: formData.priority,
          status: 'open',
          type: formData.type
        })
      })
      const data = await res.json()
      if (res.ok) {
        setFormSuccess('Follow-up created successfully!')
        setFormData({ title: '', description: '', dueDate: '', priority: 'medium', type: 'demo' })
        setTimeout(() => {
          setShowForm(false)
          fetchFollowups()
        }, 500)
      } else {
        setFormError(data.error || 'Failed to create follow-up')
      }
    } catch (error) {
      setFormError(`Error: ${error instanceof Error ? error.message : 'Failed to create'}`)
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/followups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        fetchFollowups()
        alert('Follow-up status updated!')
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error updating status')
    }
  }

  const filteredFollowups = followups.filter(f => {
    if (activeTab === 'completed') return f.status === 'completed'
    return f.status === 'open'
  })

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 24px 0' }}>📋 Follow-ups & Reminders</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #eee', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('open')}
            style={{
              padding: '8px 16px',
              background: activeTab === 'open' ? '#3b82f6' : 'transparent',
              color: activeTab === 'open' ? 'white' : '#666',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            📋 Pending
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            style={{
              padding: '8px 16px',
              background: activeTab === 'completed' ? '#10b981' : 'transparent',
              color: activeTab === 'completed' ? 'white' : '#666',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            ✅ Completed
          </button>
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
          {showForm ? '✕ Cancel' : '+ New Follow-up'}
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
          <h2 style={{ margin: '0 0 20px 0' }}>Create Follow-up</h2>
          {formError && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>⚠️ {formError}</div>}
          {formSuccess && <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>✓ {formSuccess}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Follow up with John"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Due Date *</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
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
                  <option value="call">📞 Call</option>
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

      {/* Follow-ups List */}
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Loading...</div>
        ) : filteredFollowups.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            {activeTab === 'completed' ? 'No completed follow-ups' : 'No pending follow-ups'}
          </div>
        ) : (
          <div>
            {filteredFollowups.map((followup: any) => (
              <div
                key={followup.id}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #eee',
                  background: activeTab === 'completed' ? '#f0fdf4' : '#fafafa',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>
                    {followup.type === 'demo' ? '🎯' : followup.type === 'meeting' ? '📅' : '📞'} {followup.title}
                  </div>
                  <p style={{ fontSize: '13px', color: '#666', margin: '0 0 8px 0' }}>{followup.description || 'No description'}</p>
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
                      {followup.priority.toUpperCase()}
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
                      {new Date(followup.due_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {activeTab === 'open' && (
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
                      marginLeft: '16px',
                      whiteSpace: 'nowrap'
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
    </div>
  )
}
