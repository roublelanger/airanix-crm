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

interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
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
  const [duplicateWarning, setDuplicateWarning] = useState<{ show: boolean; existingContact: Contact | null; pendingSave: boolean }>({ show: false, existingContact: null, pendingSave: false })
  const [toasts, setToasts] = useState<Toast[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; contactId: string; contactName: string } | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
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

  // Toast auto-dismiss effect
  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map((toast) => {
      const duration = toast.duration || (toast.type === 'error' ? 5000 : 3000)
      return setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, duration)
    })
    return () => timers.forEach(timer => clearTimeout(timer))
  }, [toasts])

  function showToast(type: 'success' | 'error' | 'info' | 'warning', message: string, duration?: number) {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { id, type, message, duration }])
  }

  // Validation utilities
  function validateEmail(email: string): string | null {
    if (!email) return null // empty is checked separately
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Invalid email format'
    return null
  }

  function validatePhone(phone: string): string | null {
    if (!phone) return null // optional field
    // Basic validation: at least 7 digits, can contain +, -, (), spaces
    const phoneRegex = /^[\d+\-() ]{7,}$/
    if (!phoneRegex.test(phone)) return 'Phone must contain at least 7 digits'
    if (phone.replace(/\D/g, '').length > 15) return 'Phone number too long'
    return null
  }

  function validateField(fieldName: string, value: string): string | null {
    switch (fieldName) {
      case 'name':
        if (!value) return 'Name is required'
        if (value.length < 2) return 'Name must be at least 2 characters'
        if (value.length > 100) return 'Name must be under 100 characters'
        return null
      case 'email':
        if (!value) return 'Email is required'
        return validateEmail(value)
      case 'phone':
        return validatePhone(value)
      case 'company':
        if (value && value.length > 100) return 'Company name too long'
        return null
      case 'designation':
        if (value && value.length > 100) return 'Designation too long'
        return null
      case 'industry':
        if (value && value.length > 100) return 'Industry too long'
        return null
      case 'location':
        if (value && value.length > 100) return 'Location too long'
        return null
      case 'remarks':
        if (value && value.length > 500) return 'Remarks must be under 500 characters'
        return null
      default:
        return null
    }
  }

  function handleFieldChange(fieldName: string, value: string) {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
    // Real-time validation
    const error = validateField(fieldName, value)
    setFormErrors(prev => {
      const updated = { ...prev }
      if (error) {
        updated[fieldName] = error
      } else {
        delete updated[fieldName]
      }
      return updated
    })
  }

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

  async function handleSaveContact(ignoreDuplicate: boolean = false) {
    // Validate all fields before save
    const errors: Record<string, string> = {}
    const nameError = validateField('name', formData.name)
    const emailError = validateField('email', formData.email)
    const phoneError = validateField('phone', formData.phone)

    if (nameError) errors['name'] = nameError
    if (emailError) errors['email'] = emailError
    if (phoneError) errors['phone'] = phoneError

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      showToast('error', 'Please fix validation errors before saving')
      return
    }

    // Check for duplicate contact (by name only)
    if (!ignoreDuplicate && !editingId) {
      const existingContact = contacts.find(
        c => c.name?.toLowerCase() === formData.name.toLowerCase()
      )

      if (existingContact) {
        setDuplicateWarning({
          show: true,
          existingContact,
          pendingSave: true
        })
        return
      }
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
        showToast('error', data.error || 'Failed to save contact')
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
      showToast('success', 'Contact saved successfully!')
    } catch (error) {
      console.error('Error saving contact:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to save contact')
    }
  }

  function handleDeleteContact(id: string, name: string) {
    setDeleteConfirm({ show: true, contactId: id, contactName: name })
  }

  async function confirmDelete(id: string) {
    setDeleteConfirm(null)
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        showToast('error', 'Failed to delete contact')
        return
      }
      fetchContacts()
      showToast('success', 'Contact deleted successfully')
    } catch (error) {
      console.error('Error deleting contact:', error)
      showToast('error', 'Error deleting contact')
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
    setFormErrors({})
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
              <div>
                <input type="text" placeholder="Name *" value={formData.name} onChange={(e) => handleFieldChange('name', e.target.value)} style={{ padding: '11px 12px', border: formErrors.name ? '1px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = formErrors.name ? '#dc2626' : '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
                {formErrors.name && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>⚠️ {formErrors.name}</p>}
              </div>
              <div>
                <input type="email" placeholder="Email *" value={formData.email} onChange={(e) => handleFieldChange('email', e.target.value)} style={{ padding: '11px 12px', border: formErrors.email ? '1px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = formErrors.email ? '#dc2626' : '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
                {formErrors.email && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>⚠️ {formErrors.email}</p>}
              </div>
              <div>
                <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => handleFieldChange('phone', e.target.value)} style={{ padding: '11px 12px', border: formErrors.phone ? '1px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = formErrors.phone ? '#dc2626' : '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
                {formErrors.phone && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>⚠️ {formErrors.phone}</p>}
              </div>
              <div>
                <input type="text" placeholder="Location" value={formData.location} onChange={(e) => handleFieldChange('location', e.target.value)} style={{ padding: '11px 12px', border: formErrors.location ? '1px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = formErrors.location ? '#dc2626' : '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
                {formErrors.location && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>⚠️ {formErrors.location}</p>}
              </div>
            </div>
          </fieldset>

          {/* Company & Professional */}
          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 28px 0' }}>
            <legend style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏢 Company & Professional Details</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <input type="text" placeholder="Company" value={formData.company} onChange={(e) => handleFieldChange('company', e.target.value)} style={{ padding: '11px 12px', border: formErrors.company ? '1px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = formErrors.company ? '#dc2626' : '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
                {formErrors.company && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>⚠️ {formErrors.company}</p>}
              </div>
              <div>
                <input type="text" placeholder="Designation" value={formData.designation} onChange={(e) => handleFieldChange('designation', e.target.value)} style={{ padding: '11px 12px', border: formErrors.designation ? '1px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = formErrors.designation ? '#dc2626' : '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
                {formErrors.designation && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>⚠️ {formErrors.designation}</p>}
              </div>
              <div>
                <input type="text" placeholder="Industry" value={formData.industry} onChange={(e) => handleFieldChange('industry', e.target.value)} style={{ padding: '11px 12px', border: formErrors.industry ? '1px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = formErrors.industry ? '#dc2626' : '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
                {formErrors.industry && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>⚠️ {formErrors.industry}</p>}
              </div>
              <div>
                <input type="text" placeholder="Assigned To" value={formData.assigned_to} onChange={(e) => handleFieldChange('assigned_to', e.target.value)} style={{ padding: '11px 12px', border: formErrors.assigned_to ? '1px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = formErrors.assigned_to ? '#dc2626' : '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
                {formErrors.assigned_to && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>⚠️ {formErrors.assigned_to}</p>}
              </div>
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
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Remarks and notes</label>
                <span style={{ fontSize: '12px', color: formData.remarks.length > 450 ? '#ea580c' : '#9ca3af' }}>
                  {formData.remarks.length}/500
                </span>
              </div>
              <textarea value={formData.remarks} onChange={(e) => handleFieldChange('remarks', e.target.value)} placeholder="Remarks and notes" style={{ padding: '10px', border: formErrors.remarks ? '1px solid #dc2626' : '1px solid #ddd', borderRadius: '6px', width: '100%', minHeight: '80px', fontFamily: 'system-ui', boxSizing: 'border-box', fontSize: '14px', marginBottom: formErrors.remarks ? '4px' : '16px', transition: 'all 0.2s' }} />
              {formErrors.remarks && <p style={{ margin: '4px 0 16px 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>⚠️ {formErrors.remarks}</p>}
            </div>
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
            <button onClick={() => handleSaveContact()} style={{ padding: '10px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>Save Contact</button>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 2000, maxWidth: '400px' }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              marginBottom: '12px',
              padding: '14px 16px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              animation: 'slideIn 0.3s ease-out',
              background:
                toast.type === 'success'
                  ? '#d1fae5'
                  : toast.type === 'error'
                  ? '#fee2e2'
                  : toast.type === 'warning'
                  ? '#fef3c7'
                  : '#dbeafe',
              color:
                toast.type === 'success'
                  ? '#065f46'
                  : toast.type === 'error'
                  ? '#7c2515'
                  : toast.type === 'warning'
                  ? '#92400e'
                  : '#0c4a6e',
              border: `1px solid ${
                toast.type === 'success'
                  ? '#6ee7b7'
                  : toast.type === 'error'
                  ? '#fca5a5'
                  : toast.type === 'warning'
                  ? '#fcd34d'
                  : '#7dd3fc'
              }`,
            }}
          >
            <span style={{ fontSize: '18px', flexShrink: 0 }}>
              {toast.type === 'success'
                ? '✅'
                : toast.type === 'error'
                ? '❌'
                : toast.type === 'warning'
                ? '⚠️'
                : 'ℹ️'}
            </span>
            <span style={{ fontSize: '14px', fontWeight: '500', flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0',
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1500,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '28px' }}>🗑️</span>
              <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                Delete Contact
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', lineHeight: '1.6' }}>
              Are you sure you want to delete <strong>{deleteConfirm.contactName}</strong>?
            </p>
            <p style={{ fontSize: '12px', color: '#991b1b', marginBottom: '24px', fontWeight: '500' }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e5e7eb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f3f4f6'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirm.contactId)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#b91c1c'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#dc2626'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Warning Dialog */}
      {duplicateWarning.show && duplicateWarning.existingContact && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            border: '2px solid #fbbf24',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '32px' }}>⚠️</span>
              <h2 style={{ margin: '0', fontSize: '20px', fontWeight: '800', color: '#111827' }}>
                Duplicate Contact Found
              </h2>
            </div>

            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
              A contact with this name and email already exists in your database. You can:
            </p>

            <div style={{
              background: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '24px',
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase' }}>
                Existing Contact:
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#111827' }}>
                {duplicateWarning.existingContact.name}
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#6b7280' }}>
                📧 {duplicateWarning.existingContact.email}
              </p>
              {duplicateWarning.existingContact.designation && (
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#6b7280' }}>
                  💼 {duplicateWarning.existingContact.designation}
                </p>
              )}
              {duplicateWarning.existingContact.company && (
                <p style={{ margin: '0', fontSize: '13px', color: '#6b7280' }}>
                  🏢 {duplicateWarning.existingContact.company}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDuplicateWarning({ show: false, existingContact: null, pendingSave: false })}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#f3f4f6',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e5e7eb'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f3f4f6'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  window.location.href = `/contacts/${duplicateWarning.existingContact?.id}`
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                View Existing Contact
              </button>

              <button
                onClick={() => {
                  setDuplicateWarning({ show: false, existingContact: null, pendingSave: false })
                  handleSaveContact(true)
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#fbbf24',
                  color: '#111827',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Add Anyway
              </button>
            </div>
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
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(400px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading contacts...</div>}>
        <ContactsContent />
      </Suspense>
    </>
  )
}
