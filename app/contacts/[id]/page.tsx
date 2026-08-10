'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function ContactDetailPage() {
  const params = useParams()
  const [contact, setContact] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<any[]>([])
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [activityForm, setActivityForm] = useState({
    type: 'call',
    title: '',
    description: '',
    outcome: 'pending'
  })

  useEffect(() => {
    fetchContact()
    fetchActivities()
  }, [params.id])

  async function fetchContact() {
    try {
      console.log('Fetching contact with ID:', params.id)
      const res = await fetch(`/api/contacts/${params.id}`)
      const data = await res.json()
      console.log('API response:', { status: res.ok, data })
      if (res.ok) {
        setContact(data)
      } else {
        console.error('API error:', data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchActivities() {
    try {
      const res = await fetch(`/api/activities?contactId=${params.id}`)
      const data = await res.json()
      setActivities(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  async function handleActivitySubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...activityForm,
          contactId: params.id
        })
      })
      if (res.ok) {
        setActivityForm({ type: 'call', title: '', description: '', outcome: 'pending' })
        setShowActivityForm(false)
        fetchActivities()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
  if (!contact) return <div style={{ padding: '40px', textAlign: 'center', color: '#d1495a' }}>Contact not found</div>

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <a href="/contacts" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px' }}>← Back to Contacts</a>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '16px 0 0 0' }}>{contact.name}</h1>
        <span style={{ background: contact.status === 'lead' ? '#fef3c7' : '#dbeafe', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
          {contact.status || 'lead'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '30px' }}>
        {/* Contact Info */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Contact Information</h2>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>Email</p>
            <p style={{ fontSize: '14px', margin: 0 }}>{contact.email || '-'}</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>Phone</p>
            <p style={{ fontSize: '14px', margin: 0 }}>{contact.phone || '-'}</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>Company</p>
            <p style={{ fontSize: '14px', margin: 0 }}>{contact.company || '-'}</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>Designation</p>
            <p style={{ fontSize: '14px', margin: 0 }}>{contact.designation || '-'}</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>Address</p>
            <p style={{ fontSize: '14px', margin: 0 }}>{contact.address || '-'}</p>
          </div>

          <div>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>Location</p>
            <p style={{ fontSize: '14px', margin: 0 }}>{contact.location || '-'}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Quick Actions</h2>

          <button onClick={() => {
            if (!contact?.phone) {
              alert('No phone number available for this contact')
              return
            }
            window.location.href = `tel:${contact.phone}`
          }} style={{
            width: '100%',
            padding: '12px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            ☎️ Call Now
          </button>

          <button onClick={() => {
            if (!contact?.email) {
              alert('No email available for this contact')
              return
            }
            window.location.href = `mailto:${contact.email}?subject=Follow-up with ${contact.name}`
          }} style={{
            width: '100%',
            padding: '12px 16px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            📧 Send Email
          </button>

          <button
            onClick={() => setShowActivityForm(!showActivityForm)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            📝 Log Activity
          </button>

          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>Follow-up Status</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ flex: 1, padding: '8px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
                📋 Demo
              </button>
              <button style={{ flex: 1, padding: '8px', background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
                📅 Meeting
              </button>
              <button style={{ flex: 1, padding: '8px', background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
                ✅ Done
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Form */}
      {showActivityForm && (
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Log Activity</h2>
          <form onSubmit={handleActivitySubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Type</label>
                <select
                  value={activityForm.type}
                  onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }}
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
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  placeholder="Activity title"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Description</label>
              <textarea
                value={activityForm.description}
                onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                placeholder="What was discussed?"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', minHeight: '80px' }}
              />
            </div>

            <button type="submit" style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              Save Activity
            </button>
          </form>
        </div>
      )}

      {/* Activities Timeline */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Activity Timeline</h2>
        {activities.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', margin: 0 }}>No activities yet</p>
        ) : (
          <div>
            {activities.map((activity: any) => (
              <div key={activity.id} style={{ padding: '12px', borderBottom: '1px solid #eee', fontSize: '13px' }}>
                <strong>{activity.type === 'call' ? '☎️' : activity.type === 'email' ? '📧' : activity.type === 'meeting' ? '📅' : '📝'} {activity.title || 'Untitled'}</strong>
                <p style={{ margin: '4px 0 0 0', color: '#666' }}>{activity.description}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>{new Date(activity.completed_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
