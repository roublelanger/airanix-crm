'use client'

import { useEffect, useState } from 'react'

interface Lead {
  id: string
  name: string
  value: number
  stage: string
  created_at: string
  owner?: string
  close_date?: string
  last_activity?: string
  notes?: string
}

interface Filters {
  leadOwner: string
  createdAfter: string
  closedAfter: string
  lastActivityAfter: string
  searchText: string
}

interface Message {
  type: 'success' | 'error'
  text: string
}

const STAGES = [
  { id: 'PROSPECTING', label: 'Prospecting', badge: 'primary' },
  { id: 'INITIAL_CONTACT', label: 'Initial Contact', badge: 'orange' },
  { id: 'QUALIFICATION', label: 'Qualification', badge: 'purple' },
  { id: 'PROPOSAL', label: 'Proposal Presented', badge: 'pink' },
  { id: 'NEGOTIATION', label: 'Negotiation', badge: 'indigo' },
  { id: 'WON', label: 'Closed Won', badge: 'green' },
  { id: 'LOST', label: 'Closed Lost', badge: 'red' }
]

const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  primary: { bg: '#dbeafe', text: '#0369a1', border: '#7dd3fc' },
  orange: { bg: '#fed7aa', text: '#92400e', border: '#fdba74' },
  purple: { bg: '#e9d5ff', text: '#6b21a8', border: '#d8b4fe' },
  pink: { bg: '#fbcfe8', text: '#9d174d', border: '#f472b6' },
  indigo: { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' },
  green: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  red: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' }
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    stage: 'PROSPECTING',
    owner: '',
    close_date: '',
    last_activity: '',
    notes: ''
  })
  const [filters, setFilters] = useState<Filters>({
    leadOwner: '',
    createdAfter: '',
    closedAfter: '',
    lastActivityAfter: '',
    searchText: ''
  })

  useEffect(() => {
    fetchLeads()
  }, [])

  // Auto-hide messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  async function fetchLeads() {
    try {
      console.log('[Leads] Fetching leads from API...')
      const res = await fetch('/api/deals')
      console.log('[Leads] Response status:', res.status)

      if (!res.ok) {
        const responseText = await res.text()
        throw new Error(`Failed to fetch leads (${res.status}): ${responseText}`)
      }

      const data = await res.json()
      console.log('[Leads] Fetched', data.length, 'leads')
      setLeads(Array.isArray(data) ? data : [])
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load leads'
      console.error('[Leads] Error:', errorMsg)
      setMessage({ type: 'error', text: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  function validateLead() {
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Lead name is required' })
      return false
    }
    if (formData.name.length > 100) {
      setMessage({ type: 'error', text: 'Lead name must be less than 100 characters' })
      return false
    }
    if (!formData.value || parseInt(formData.value) <= 0) {
      setMessage({ type: 'error', text: 'Lead value must be greater than 0' })
      return false
    }
    if (formData.notes && formData.notes.length > 500) {
      setMessage({ type: 'error', text: 'Notes must be less than 500 characters' })
      return false
    }
    return true
  }

  async function handleSaveLead() {
    if (!validateLead()) return

    try {
      const url = selectedLead ? `/api/deals/${selectedLead.id}` : '/api/deals'
      const method = selectedLead ? 'PUT' : 'POST'

      const payload = {
        name: formData.name,
        value: parseInt(formData.value),
        stage: formData.stage,
        owner: formData.owner || null,
        close_date: formData.close_date || null,
        last_activity: formData.last_activity || null,
        notes: formData.notes || null
      }

      if (selectedLead) {
        payload.id = selectedLead.id
      }

      console.log(`[Lead Save] ${method} ${url}`, payload)

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      console.log(`[Lead Save] Response status: ${res.status}`)

      const responseText = await res.text()
      console.log(`[Lead Save] Response body: ${responseText}`)

      if (!res.ok) {
        let errorMessage = 'Failed to save lead'
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (e) {
          errorMessage = `Server error (${res.status}): ${responseText || 'No details provided'}`
        }
        throw new Error(errorMessage)
      }

      setMessage({
        type: 'success',
        text: selectedLead ? 'Lead updated successfully!' : 'Lead created successfully!'
      })
      setFormData({ name: '', value: '', stage: 'PROSPECTING', owner: '', close_date: '', last_activity: '', notes: '' })
      setShowForm(false)
      setShowDetailsModal(false)
      setSelectedLead(null)
      fetchLeads()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save lead'
      console.error('[Lead Save] Error:', errorMsg)
      setMessage({
        type: 'error',
        text: errorMsg
      })
    }
  }

  async function handleUpdateLeadStage(leadId: string, newStage: string) {
    try {
      const res = await fetch(`/api/deals/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      })

      const responseText = await res.text()
      if (!res.ok) {
        let errorMsg = 'Failed to update lead'
        try {
          const errorData = JSON.parse(responseText)
          errorMsg = errorData.error || errorMsg
        } catch (e) {
          errorMsg = `Server error (${res.status}): ${responseText || 'No details'}`
        }
        throw new Error(errorMsg)
      }

      setMessage({ type: 'success', text: 'Lead moved successfully' })
      fetchLeads()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to move lead'
      setMessage({ type: 'error', text: errorMsg })
    }
  }

  async function handleDeleteLead(leadId: string) {
    if (!confirm('Are you sure you want to delete this lead?')) return

    try {
      const res = await fetch(`/api/deals/${leadId}`, { method: 'DELETE' })
      const responseText = await res.text()

      if (!res.ok) {
        let errorMsg = 'Failed to delete lead'
        try {
          const errorData = JSON.parse(responseText)
          errorMsg = errorData.error || errorMsg
        } catch (e) {
          errorMsg = `Server error (${res.status}): ${responseText || 'No details'}`
        }
        throw new Error(errorMsg)
      }

      setMessage({ type: 'success', text: 'Lead deleted successfully' })
      fetchLeads()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete lead'
      setMessage({ type: 'error', text: errorMsg })
    }
  }

  function openLeadDetails(lead: Lead) {
    setSelectedLead(lead)
    setFormData({
      name: lead.name,
      value: lead.value.toString(),
      stage: lead.stage,
      owner: lead.owner || '',
      close_date: lead.close_date || '',
      last_activity: lead.last_activity || '',
      notes: lead.notes || ''
    })
    setShowDetailsModal(true)
  }

  function closeLeadDetails() {
    setShowDetailsModal(false)
    setSelectedLead(null)
    setFormData({ name: '', value: '', stage: 'PROSPECTING', owner: '', close_date: '', last_activity: '', notes: '' })
  }

  const filteredLeads = leads.filter(lead => {
    if (filters.searchText && !lead.name.toLowerCase().includes(filters.searchText.toLowerCase())) return false
    if (filters.leadOwner && lead.owner !== filters.leadOwner) return false
    if (filters.createdAfter) {
      const leadDate = new Date(lead.created_at)
      const filterDate = new Date(filters.createdAfter)
      if (leadDate < filterDate) return false
    }
    if (filters.closedAfter && lead.close_date) {
      const leadDate = new Date(lead.close_date)
      const filterDate = new Date(filters.closedAfter)
      if (leadDate < filterDate) return false
    }
    if (filters.lastActivityAfter && lead.last_activity) {
      const leadDate = new Date(lead.last_activity)
      const filterDate = new Date(filters.lastActivityAfter)
      if (leadDate < filterDate) return false
    }
    return true
  })

  const getLeadsByStage = (stageId: string) => {
    return filteredLeads.filter(lead => lead.stage === stageId)
  }

  const totalValue = filteredLeads.reduce((sum, lead) => sum + lead.value, 0)

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '24px 0' }}>
      {/* Message Toast */}
      {message && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          padding: '14px 20px',
          background: message.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: message.type === 'error' ? '#991b1b' : '#065f46',
          borderRadius: '8px',
          border: message.type === 'error' ? '1px solid #fecaca' : '1px solid #a7f3d0',
          fontWeight: '500',
          fontSize: '13px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {message.type === 'error' ? '❌ ' : '✅ '}{message.text}
        </div>
      )}

      {/* Top Bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 24px', marginBottom: '24px' }}>
        <div style={{ maxWidth: '1800px', margin: '0 auto', paddingTop: '24px', paddingBottom: '24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '800', color: '#111827' }}>
                Leads
              </h1>
              <p style={{ margin: '0', fontSize: '13px', color: '#6b7280' }}>
                All leads • {filteredLeads.length} leads • ₹{totalValue.toLocaleString('en-IN')} total
              </p>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm)
                setShowDetailsModal(false)
              }}
              style={{
                padding: '10px 20px',
                background: showForm ? '#ef4444' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                transition: 'all 0.2s'
              }}
            >
              {showForm ? '✕ Close' : '+ Add leads'}
            </button>
          </div>

          {/* Add Lead Form */}
          {showForm && (
            <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Lead Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Acme Corp Lead"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    maxLength={100}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{formData.name.length}/100</div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Value (₹) *</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Stage *</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      backgroundColor: 'white',
                      boxSizing: 'border-box'
                    }}
                  >
                    {STAGES.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Owner</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Close Date</label>
                  <input
                    type="date"
                    value={formData.close_date}
                    onChange={(e) => setFormData({ ...formData, close_date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Last Activity</label>
                  <input
                    type="date"
                    value={formData.last_activity}
                    onChange={(e) => setFormData({ ...formData, last_activity: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Notes</label>
                <textarea
                  placeholder="Add deal notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  maxLength={500}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                />
                <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{formData.notes.length}/500</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSaveLead}
                  style={{
                    padding: '8px 16px',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
                >
                  Save Lead
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '8px 16px',
                    background: '#e5e7eb',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, minWidth: '250px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', whiteSpace: 'nowrap' }}>🔍 Search</label>
              <input
                type="text"
                placeholder="Lead name..."
                value={filters.searchText}
                onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', minWidth: '200px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', whiteSpace: 'nowrap' }}>Lead owner</label>
              <select
                value={filters.leadOwner}
                onChange={(e) => setFilters({ ...filters, leadOwner: e.target.value })}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  backgroundColor: 'white'
                }}
              >
                <option value="">All</option>
                {[...new Set(deals.map(d => d.owner).filter(Boolean))].map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              style={{
                padding: '8px 12px',
                background: (filters.createdAfter || filters.closedAfter || filters.lastActivityAfter) ? '#2563eb' : (showAdvancedFilters ? '#2563eb' : 'white'),
                color: (filters.createdAfter || filters.closedAfter || filters.lastActivityAfter) ? 'white' : (showAdvancedFilters ? 'white' : '#6b7280'),
                border: `1px solid ${showAdvancedFilters || (filters.createdAfter || filters.closedAfter || filters.lastActivityAfter) ? '#2563eb' : '#d1d5db'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              Filter {(filters.createdAfter || filters.closedAfter || filters.lastActivityAfter) ? '✓' : ''}
            </button>

            {(filters.leadOwner || filters.createdAfter || filters.closedAfter || filters.lastActivityAfter || filters.searchText) && (
              <button
                onClick={() => setFilters({ leadOwner: '', createdAfter: '', closedAfter: '', lastActivityAfter: '', searchText: '' })}
                style={{
                  padding: '8px 12px',
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '12px',
                  whiteSpace: 'nowrap'
                }}
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div style={{ marginTop: '12px', padding: '12px', background: '#f3f4f6', borderRadius: '6px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Created After</label>
                <input
                  type="date"
                  value={filters.createdAfter}
                  onChange={(e) => setFilters({ ...filters, createdAfter: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Close Date After</label>
                <input
                  type="date"
                  value={filters.closedAfter}
                  onChange={(e) => setFilters({ ...filters, closedAfter: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Last Activity After</label>
                <input
                  type="date"
                  value={filters.lastActivityAfter}
                  onChange={(e) => setFilters({ ...filters, lastActivityAfter: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lead Details Modal */}
      {showDetailsModal && selectedLead && (
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
          zIndex: 999
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: '0', fontSize: '22px', fontWeight: '700', color: '#111827' }}>
                Edit Lead
              </h2>
              <button
                onClick={closeLeadDetails}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>Lead Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={100}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{formData.name.length}/100</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>Value (₹)</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>Stage</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      backgroundColor: 'white',
                      boxSizing: 'border-box'
                    }}
                  >
                    {STAGES.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>Owner</label>
                  <input
                    type="text"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>Close Date</label>
                  <input
                    type="date"
                    value={formData.close_date}
                    onChange={(e) => setFormData({ ...formData, close_date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>Last Activity</label>
                <input
                  type="date"
                  value={formData.last_activity}
                  onChange={(e) => setFormData({ ...formData, last_activity: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  maxLength={500}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{formData.notes.length}/500</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleSaveLead}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
              >
                Update Lead
              </button>
              <button
                onClick={() => handleDeleteLead(selectedLead.id)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Delete Lead
              </button>
              <button
                onClick={closeLeadDetails}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: '#6b7280' }}>Loading leads...</p>
        </div>
      ) : (
        <div style={{ padding: '0 24px', overflow: 'auto' }}>
          <div style={{ maxWidth: '1800px', margin: '0 auto', display: 'flex', gap: '16px', minWidth: 'min-content' }}>
            {STAGES.map(stage => {
              const stageLeadCount = getLeadsByStage(stage.id).length
              const stageValue = getLeadsByStage(stage.id).reduce((sum, lead) => sum + lead.value, 0)
              const badgeColor = BADGE_COLORS[stage.badge]

              return (
                <div
                  key={stage.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '340px',
                    minHeight: 'calc(100vh - 300px)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  {/* Column Header */}
                  <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', background: badgeColor.bg }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span
                        style={{
                          background: badgeColor.text,
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '700',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {stage.label}
                      </span>
                      <span style={{ background: 'white', color: badgeColor.text, padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>
                        {stageLeadCount}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                      ₹{stageValue.toLocaleString('en-IN')} total
                    </div>
                  </div>

                  {/* Lead Cards Container */}
                  <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
                    {getLeadsByStage(stage.id).length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 12px', color: '#9ca3af' }}>
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>+</div>
                        <div style={{ fontSize: '13px' }}>No leads</div>
                      </div>
                    ) : (
                      getLeadsByStage(stage.id).map((lead) => (
                        <div
                          key={lead.id}
                          onClick={() => openLeadDetails(lead)}
                          style={{
                            background: '#ffffff',
                            border: `1px solid ${badgeColor.border}`,
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = 'none'
                            e.currentTarget.style.transform = 'translateY(0)'
                          }}
                        >
                          <div style={{ fontWeight: '600', color: '#111827', marginBottom: '8px', fontSize: '13px' }}>
                            {lead.name}
                          </div>
                          <div style={{ color: badgeColor.text, fontWeight: '700', marginBottom: '10px', fontSize: '15px' }}>
                            ₹{(lead.value || 0).toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
                            {lead.owner && <div style={{ marginBottom: '4px' }}>👤 {lead.owner}</div>}
                            {lead.created_at && <div>{new Date(lead.created_at).toLocaleDateString('en-IN')}</div>}
                          </div>
                          {lead.notes && (
                            <div style={{ fontSize: '11px', color: '#9ca3af', padding: '8px', background: '#f9fafb', borderRadius: '4px', marginBottom: '10px', maxHeight: '50px', overflow: 'hidden' }}>
                              {lead.notes}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '6px', paddingTop: '10px', borderTop: '1px solid #e5e7eb' }}>
                            <select
                              onClick={(e) => e.stopPropagation()}
                              value={lead.stage}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleUpdateLeadStage(lead.id, e.target.value)
                              }}
                              style={{
                                flex: 1,
                                padding: '6px 8px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontFamily: 'inherit',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                              }}
                            >
                              {STAGES.map(s => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                              ))}
                            </select>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteLead(lead.id)
                              }}
                              style={{
                                padding: '6px 10px',
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
