'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  location?: string
  designation?: string
  industry?: string
  remarks?: string
  assigned_to?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

function ContactsContent() {
  const searchParams = useSearchParams()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ company: searchParams.get('company') || '' })
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    designation: '',
    industry: '',
    remarks: '',
    assigned_to: '',
    status: 'NEW',
    followupDate: '',
    followupTime: '',
    followupType: 'meeting',
    followupNotes: ''
  })

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
    if (!formData.name || !formData.email) {
      alert('Name and Email are required')
      return
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/contacts/${editingId}` : '/api/contacts'

      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        location: formData.location || null,
        designation: formData.designation || null,
        industry: formData.industry || null,
        remarks: formData.remarks || null,
        assigned_to: formData.assigned_to || null,
        status: formData.status
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const data = await res.json()
        alert(`Error: ${data.error || 'Failed to save contact'}`)
        return
      }

      const data = await res.json()

      // Create follow-up if specified
      if (formData.followupDate) {
        try {
          await fetch('/api/followups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: `Follow-up with ${formData.name}`,
              description: formData.followupNotes,
              dueDate: formData.followupDate,
              dueTime: formData.followupTime,
              priority: 'high',
              type: formData.followupType,
              status: 'open',
              contactId: data.id || editingId
            })
          })
        } catch (error) {
          console.error('Follow-up creation failed:', error)
        }
      }

      resetForm()
      fetchContacts()
      alert('Contact saved successfully!')
    } catch (error) {
      console.error('Error saving contact:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save contact'}`)
    }
  }

  async function handleDeleteContact(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        alert('Failed to delete contact')
        return
      }
      fetchContacts()
      alert('Contact deleted successfully')
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Error deleting contact')
    }
  }

  function handleEditContact(contact: Contact) {
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      company: contact.company || '',
      location: contact.location || '',
      designation: contact.designation || '',
      industry: contact.industry || '',
      remarks: contact.remarks || '',
      assigned_to: contact.assigned_to || '',
      status: contact.status || 'NEW',
      followupDate: '',
      followupTime: '',
      followupType: 'meeting',
      followupNotes: ''
    })
    setEditingId(contact.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      location: '',
      designation: '',
      industry: '',
      remarks: '',
      assigned_to: '',
      status: 'NEW',
      followupDate: '',
      followupTime: '',
      followupType: 'meeting',
      followupNotes: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  // Group contacts by company
  const groupedContacts = contacts.reduce((acc: Record<string, Contact[]>, contact) => {
    const company = contact.company || 'Unassigned'
    if (!acc[company]) acc[company] = []
    acc[company].push(contact)
    return acc
  }, {})

  const filteredCompanies = Object.keys(groupedContacts).filter(
    company => !filters.company || company === filters.company
  )

  const totalFiltered = filteredCompanies.reduce((sum, company) => sum + groupedContacts[company].length, 0)

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold' }}>Contacts ({totalFiltered})</h1>
          <p style={{ color: '#666', margin: 0 }}>Manage your leads and customers by company</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '12px 24px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          {showForm ? '✕ Cancel' : '+ New Contact'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>{editingId ? 'Edit Contact' : 'New Contact'}</h2>

          {/* Basic Info */}
          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 24px 0' }}>
            <legend style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>Contact Information</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <input type="text" placeholder="Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
              <input type="email" placeholder="Email *" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
              <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
              <input type="text" placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
            </div>
          </fieldset>

          {/* Company & Professional */}
          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 24px 0' }}>
            <legend style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>Company & Professional Details</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <input type="text" placeholder="Company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
              <input type="text" placeholder="Designation" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
              <input type="text" placeholder="Industry" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
              <input type="text" placeholder="Assigned To" value={formData.assigned_to} onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
            </div>
          </fieldset>

          {/* Status & Notes */}
          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 24px 0' }}>
            <legend style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>Status & Remarks</legend>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%', marginBottom: '16px', fontSize: '14px' }}>
              <option value="NEW">New</option>
              <option value="LEAD">Lead</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="COLD">Cold</option>
              <option value="CLOSED">Closed</option>
            </select>
            <textarea value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} placeholder="Remarks and notes" style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%', minHeight: '80px', fontFamily: 'system-ui', boxSizing: 'border-box', fontSize: '14px', marginBottom: '16px' }} />
          </fieldset>

          {/* Follow-up */}
          <fieldset style={{ border: '1px solid #bfdbfe', padding: '16px', borderRadius: '8px', background: '#f0f9ff', margin: '0 0 24px 0' }}>
            <legend style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af', padding: '0 8px', textTransform: 'uppercase' }}>📅 Schedule Follow-up (Optional)</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px', marginTop: '12px' }}>
              <input type="date" value={formData.followupDate} onChange={(e) => setFormData({ ...formData, followupDate: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
              <input type="time" value={formData.followupTime} onChange={(e) => setFormData({ ...formData, followupTime: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
            </div>
            <select value={formData.followupType} onChange={(e) => setFormData({ ...formData, followupType: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%', marginBottom: '16px', fontSize: '14px' }}>
              <option value="meeting">📅 Meeting</option>
              <option value="call">📞 Call</option>
              <option value="email">📧 Email</option>
              <option value="demo">🎯 Demo</option>
            </select>
            <textarea value={formData.followupNotes} onChange={(e) => setFormData({ ...formData, followupNotes: e.target.value })} placeholder="Follow-up notes and agenda" style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%', minHeight: '60px', fontFamily: 'system-ui', boxSizing: 'border-box', fontSize: '14px' }} />
          </fieldset>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button onClick={resetForm} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#333', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>Cancel</button>
            <button onClick={handleSaveContact} style={{ padding: '10px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>Save Contact</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ marginBottom: '24px' }}>
        <select
          value={filters.company}
          onChange={(e) => setFilters({ company: e.target.value })}
          style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
        >
          <option value="">All Companies</option>
          {Object.keys(groupedContacts).map(company => (
            <option key={company} value={company}>{company}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Loading contacts...</div>
      ) : error ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#d1495a' }}>Error: {error}</div>
      ) : filteredCompanies.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No contacts found</div>
      ) : (
        filteredCompanies.map(company => (
          <div key={company} style={{ marginBottom: '32px' }}>
            {/* Company Header */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px', borderLeft: '4px solid #2563eb' }}>
              <h2 style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>🏢 {company}</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>{groupedContacts[company].length} contact{groupedContacts[company].length !== 1 ? 's' : ''}</p>
            </div>

            {/* Contacts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
              {groupedContacts[company].map(contact => (
                <div key={contact.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#2563eb' }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e5e7eb' }}>
                  {/* Contact Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{contact.name}</h3>
                      {contact.designation && <p style={{ margin: '0', fontSize: '12px', color: '#2563eb', fontWeight: '500' }}>{contact.designation}</p>}
                    </div>
                    <span style={{
                      background: contact.status === 'NEW' ? '#dbeafe' : contact.status === 'LEAD' ? '#fef3c7' : contact.status === 'ACTIVE' ? '#d1fae5' : contact.status === 'CLOSED' ? '#fecaca' : '#e5e7eb',
                      color: contact.status === 'NEW' ? '#0369a1' : contact.status === 'LEAD' ? '#92400e' : contact.status === 'ACTIVE' ? '#047857' : contact.status === 'CLOSED' ? '#991b1b' : '#374151',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {contact.status || 'NEW'}
                    </span>
                  </div>

                  {/* Contact Details */}
                  <div style={{ fontSize: '13px', lineHeight: '1.8', marginBottom: '16px', color: '#475569' }}>
                    {contact.email && (
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontWeight: '500', color: '#64748b' }}>📧 Email:</span> <a href={`mailto:${contact.email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{contact.email}</a>
                      </div>
                    )}
                    {contact.phone && <div style={{ marginBottom: '8px' }}><span style={{ fontWeight: '500', color: '#64748b' }}>📱 Phone:</span> <a href={`tel:${contact.phone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{contact.phone}</a></div>}
                    {contact.location && <div style={{ marginBottom: '8px' }}><span style={{ fontWeight: '500', color: '#64748b' }}>📍 Location:</span> {contact.location}</div>}
                    {contact.industry && <div style={{ marginBottom: '8px' }}><span style={{ fontWeight: '500', color: '#64748b' }}>🏭 Industry:</span> {contact.industry}</div>}
                    {contact.assigned_to && <div style={{ marginBottom: '8px' }}><span style={{ fontWeight: '500', color: '#64748b' }}>👤 Assigned To:</span> {contact.assigned_to}</div>}
                    {contact.remarks && <div style={{ marginBottom: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}><span style={{ fontWeight: '500', color: '#64748b' }}>📝 Notes:</span> <span style={{ color: '#64748b', fontSize: '12px' }}>{contact.remarks}</span></div>}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                    <button onClick={() => handleEditContact(contact)} style={{ flex: 1, padding: '8px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>✏️ Edit</button>
                    <button onClick={() => handleDeleteContact(contact.id, contact.name)} style={{ flex: 1, padding: '8px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
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
