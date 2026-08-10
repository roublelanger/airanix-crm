'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ContactsContent() {
  const searchParams = useSearchParams()
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ status: searchParams.get('status') || '', company: '' })
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', status: 'new', comments: '', followupDate: '', followupType: 'meeting', followupNotes: '' })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchContacts()
  }, [])

  async function fetchContacts() {
    try {
      const res = await fetch('/api/contacts')
      const data = await res.json()
      if (Array.isArray(data)) {
        setContacts(data)
      } else {
        console.error('API returned non-array:', data)
        setContacts([])
        setError(data?.error || 'Failed to load contacts')
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveContact() {
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/contacts/${editingId}` : '/api/contacts'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, phone: formData.phone, company: formData.company, status: formData.status })
      })
      const data = await res.json()
      if (res.ok) {
        if (formData.followupDate) {
          await fetch('/api/followups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: `Follow-up with ${formData.name}`,
              description: formData.followupNotes,
              dueDate: formData.followupDate,
              priority: 'high',
              status: formData.type,
              contactId: data.id || editingId
            })
          })
        }
        setFormData({ name: '', email: '', phone: '', company: '', status: 'new', comments: '', followupDate: '', followupType: 'meeting', followupNotes: '' })
        setEditingId(null)
        setShowForm(false)
        fetchContacts()
        alert('Contact saved successfully!')
      } else {
        alert(`Error: ${data.error || 'Failed to save contact'}`)
      }
    } catch (error) {
      console.error('Error saving contact:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save contact'}`)
    }
  }

  function handleEditContact(contact: any) {
    setFormData({ name: contact.name, email: contact.email, phone: contact.phone, company: contact.company, status: contact.status, comments: contact.comments || '', followupDate: '', followupType: 'meeting', followupNotes: '' })
    setEditingId(contact.id)
    setShowForm(true)
  }

  function handleCloseForm() {
    setShowForm(false)
    setFormData({ name: '', email: '', phone: '', company: '', status: 'new', comments: '', followupDate: '', followupType: 'meeting', followupNotes: '' })
    setEditingId(null)
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Contacts ({contacts.filter(c => (!filters.status || c.status === filters.status) && (!filters.company || c.company === filters.company)).length})</h1>
          <p style={{ color: '#666' }}>Manage your leads and customers</p>
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
          {showForm ? '✕ Cancel' : '+ New Contact'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 20px 0' }}>{editingId ? 'Edit Contact' : 'New Contact'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            <input type="text" placeholder="Company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%' }}>
              <option value="new">New</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="cold">Cold</option>
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '6px' }}>Comments</label>
            <textarea value={formData.comments} onChange={(e) => setFormData({ ...formData, comments: e.target.value })} placeholder="Add notes or comments about this contact" style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%', minHeight: '100px', fontFamily: 'system-ui', boxSizing: 'border-box' }} />
          </div>

          <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #bfdbfe' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>📅 Set Follow-up Reminder</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#333' }}>Follow-up Date</label>
                <input type="date" value={formData.followupDate} onChange={(e) => setFormData({ ...formData, followupDate: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#333' }}>Type</label>
                <select value={formData.followupType} onChange={(e) => setFormData({ ...formData, followupType: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }}>
                  <option value="meeting">📅 Meeting</option>
                  <option value="demo">🎯 Demo</option>
                  <option value="call">📞 Call</option>
                  <option value="email">📧 Email</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#333' }}>Follow-up Notes</label>
              <textarea value={formData.followupNotes} onChange={(e) => setFormData({ ...formData, followupNotes: e.target.value })} placeholder="What to discuss or cover during follow-up?" style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%', minHeight: '60px', fontFamily: 'system-ui', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleSaveContact} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
            <button onClick={handleCloseForm} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#333', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        {/* Quick Filters */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="cold">Cold</option>
          </select>

          <select
            value={filters.company}
            onChange={(e) => setFilters({ ...filters, company: e.target.value })}
            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
          >
            <option value="">All Companies</option>
            {[...new Set(contacts.map(c => c.company).filter(Boolean))].map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Name</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Phone</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Company</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#d1495a' }}>
                  Error: {error}
                </td>
              </tr>
            ) : contacts.filter(c => (!filters.status || c.status === filters.status) && (!filters.company || c.company === filters.company)).length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  No contacts match your filters
                </td>
              </tr>
            ) : (
              contacts.filter(c => (!filters.status || c.status === filters.status) && (!filters.company || c.company === filters.company)).map((contact: any) => (
                <tr key={contact.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px', fontSize: '14px', fontWeight: '500' }}>{contact.name}</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>{contact.email || '-'}</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>{contact.phone || '-'}</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>{contact.company || '-'}</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>
                    <span style={{
                      background: contact.status === 'new' ? '#dbeafe' : contact.status === 'active' ? '#d1fae5' : contact.status === 'closed' ? '#fecaca' : '#f3f4f6',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      {contact.status || 'new'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>
                    <button onClick={() => handleEditContact(contact)} style={{ padding: '6px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function ContactsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading contacts...</div>}>
      <ContactsContent />
    </Suspense>
  )
}
