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
  platform?: string
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
  const [searchQuery, setSearchQuery] = useState('')
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
    platform: '',
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
        // Deduplicate contacts by email and name combination
        const seen = new Map<string, Contact>()
        const deduplicated = data.filter(contact => {
          const key = `${contact.email?.toLowerCase() || ''}:${contact.name?.toLowerCase() || ''}`
          if (seen.has(key)) {
            return false
          }
          seen.set(key, contact)
          return true
        })
        setContacts(deduplicated)
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
        status: formData.status,
        platform: formData.platform || null
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
      platform: contact.platform || '',
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
      platform: '',
      followupDate: '',
      followupTime: '',
      followupType: 'meeting',
      followupNotes: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  // Filter by search query
  const searchedContacts = contacts.filter(contact => {
    const query = searchQuery.toLowerCase()
    return (
      contact.name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.company?.toLowerCase().includes(query) ||
      contact.location?.toLowerCase().includes(query)
    )
  })

  // Group contacts by company
  const groupedContacts = searchedContacts.reduce((acc: Record<string, Contact[]>, contact) => {
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
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', minHeight: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>
            Contacts
          </h1>
          <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
            Manage your {totalFiltered} leads and customers
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px',
            background: showForm ? '#ef4444' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          {showForm ? '✕ Cancel' : '+ New Contact'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '32px',
            borderRadius: '14px',
            marginBottom: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <span style={{ fontSize: '24px' }}>{editingId ? '✏️' : '➕'}</span>
            <div>
              <h2 style={{ margin: '0', fontSize: '20px', fontWeight: '800', color: '#111827' }}>
                {editingId ? 'Edit Contact' : 'New Contact'}
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                {editingId ? 'Update contact information' : 'Add a new contact to your CRM'}
              </p>
            </div>
          </div>

          {/* Basic Info */}
          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 28px 0' }}>
            <legend style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>👤 Contact Information</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <input type="text" placeholder="Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ padding: '11px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
              <input type="email" placeholder="Email *" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ padding: '11px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
              <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ padding: '11px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
              <input type="text" placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} style={{ padding: '11px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
            </div>
          </fieldset>

          {/* Company & Professional */}
          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 28px 0' }}>
            <legend style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏢 Company & Professional Details</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <input type="text" placeholder="Company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} style={{ padding: '11px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
              <input type="text" placeholder="Designation" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} style={{ padding: '11px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
              <input type="text" placeholder="Industry" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} style={{ padding: '11px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
              <input type="text" placeholder="Assigned To" value={formData.assigned_to} onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })} style={{ padding: '11px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
            </div>
          </fieldset>

          {/* Platform & Domain */}
          <fieldset style={{ border: '1px solid #e0e7ff', padding: '16px', borderRadius: '8px', background: '#f0f4ff', margin: '0 0 24px 0' }}>
            <legend style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af', padding: '0 8px', textTransform: 'uppercase' }}>☁️ Platform/Domain (Optional)</legend>
            <select value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} style={{ padding: '10px', border: '1px solid #bfdbfe', borderRadius: '6px', width: '100%', marginTop: '12px', fontSize: '14px', backgroundColor: 'white' }}>
              <option value="">-- Select Platform --</option>
              <option value="Google Workspace">🔵 Google Workspace</option>
              <option value="Microsoft 365">🔷 Microsoft 365</option>
              <option value="Zoho">🟣 Zoho Suite</option>
              <option value="AWS">🟠 AWS</option>
              <option value="Azure">🔵 Azure</option>
              <option value="Salesforce">☁️ Salesforce</option>
              <option value="HubSpot">🧡 HubSpot</option>
              <option value="Monday.com">📅 Monday.com</option>
              <option value="Asana">✓ Asana</option>
              <option value="Jira">🔵 Jira</option>
              <option value="Slack">🟣 Slack</option>
              <option value="Teams">💜 Microsoft Teams</option>
              <option value="Other">🔧 Other</option>
            </select>
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
      <div style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <input
          type="text"
          placeholder="🔍 Search by name, email, company, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '11px 14px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#374151',
            backgroundColor: 'white',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#2563eb'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb'
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
          }}
        />
        <select
          value={filters.company}
          onChange={(e) => setFilters({ company: e.target.value })}
          style={{
            padding: '10px 14px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#374151',
            backgroundColor: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#2563eb'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb'
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <option value="">All Companies ({Object.keys(groupedContacts).reduce((sum, c) => sum + groupedContacts[c].length, 0)})</option>
          {Object.keys(groupedContacts).map(company => (
            <option key={company} value={company}>{company} ({groupedContacts[company].length})</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: '60px 40px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #e5e7eb', borderTop: '4px solid #2563eb', animation: 'spin 1s linear infinite' }}></div>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500', margin: '0' }}>Loading contacts...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '60px 40px', textAlign: 'center', background: '#fee2e2', borderRadius: '12px', border: '1px solid #fecaca' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#991b1b', margin: '0 0 8px 0' }}>Error Loading Contacts</h3>
          <p style={{ fontSize: '14px', color: '#7c2515', margin: '0' }}>{error}</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div style={{ padding: '60px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>No contacts found</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Add your first contact to get started</p>
        </div>
      ) : (
        filteredCompanies.map(company => (
          <div key={company} style={{ marginBottom: '40px' }}>
            {/* Company Header */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f0f4f8 100%)',
              padding: '20px 24px',
              borderRadius: '12px',
              marginBottom: '20px',
              borderLeft: '4px solid #2563eb',
              border: '1px solid #e5e7eb',
            }}>
              <h2 style={{ margin: '0', fontSize: '18px', fontWeight: '700', color: '#111827' }}>🏢 {company}</h2>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                {groupedContacts[company].length} contact{groupedContacts[company].length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Contacts Grid - Vertical Layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {groupedContacts[company].map(contact => (
                <div
                  key={contact.id}
                  onClick={() => (window.location.href = `/contacts/${contact.id}`)}
                  style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                    e.currentTarget.style.borderColor = '#2563eb'
                    e.currentTarget.style.backgroundColor = '#f0f9ff'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.backgroundColor = 'white'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  {/* Thumbnail Avatar with Initials */}
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '20px',
                      flexShrink: 0,
                    }}
                  >
                    {contact.name
                      .split(' ')
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>

                  {/* Main Info - Flex 1 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ margin: '0', fontSize: '15px', fontWeight: '700', color: '#111827' }}>
                        {contact.name}
                      </h3>
                      <span
                        style={{
                          background:
                            contact.status === 'NEW'
                              ? '#dbeafe'
                              : contact.status === 'LEAD'
                                ? '#fef3c7'
                                : contact.status === 'ACTIVE'
                                  ? '#d1fae5'
                                  : contact.status === 'CLOSED'
                                    ? '#fecaca'
                                    : '#e5e7eb',
                          color:
                            contact.status === 'NEW'
                              ? '#0369a1'
                              : contact.status === 'LEAD'
                                ? '#92400e'
                                : contact.status === 'ACTIVE'
                                  ? '#047857'
                                  : contact.status === 'CLOSED'
                                    ? '#991b1b'
                                    : '#374151',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {contact.status || 'NEW'}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#6b7280', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {contact.designation || contact.company || '—'}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6b7280', flexWrap: 'wrap' }}>
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          style={{
                            color: '#2563eb',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '180px',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {contact.email}
                        </a>
                      )}
                      {contact.location && (
                        <span style={{ color: '#6b7280', whiteSpace: 'nowrap' }}>📍 {contact.location}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions - Right Side */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      flexShrink: 0,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleEditContact(contact)}
                      style={{
                        padding: '8px 12px',
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(37, 99, 235, 0.3)'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id, contact.name)}
                      style={{
                        padding: '8px 12px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fecaca'
                        e.currentTarget.style.color = '#991b1b'
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(220, 38, 38, 0.3)'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fee2e2'
                        e.currentTarget.style.color = '#dc2626'
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                      title="Delete this contact (this action cannot be undone)"
                    >
                      🗑️
                    </button>
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
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading contacts...</div>}>
        <ContactsContent />
      </Suspense>
    </>
  )
}
