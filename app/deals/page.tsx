'use client'

import { useEffect, useState } from 'react'

interface Deal {
  id: string
  name: string
  value: number
  stage: string
  created_at: string
  owner?: string
  close_date?: string
  last_activity?: string
}

interface Filters {
  dealOwner: string
  createdAfter: string
  closedAfter: string
  lastActivityAfter: string
  searchText: string
}

const STAGES = [
  { id: 'PROSPECTING', label: 'Prospecting', badge: 'primary', count: 0 },
  { id: 'INITIAL_CONTACT', label: 'Initial Contact', badge: 'orange', count: 0 },
  { id: 'QUALIFICATION', label: 'Qualification', badge: 'purple', count: 0 },
  { id: 'PROPOSAL', label: 'Proposal Presented', badge: 'pink', count: 0 },
  { id: 'NEGOTIATION', label: 'Negotiation', badge: 'indigo', count: 0 },
  { id: 'WON', label: 'Closed Won', badge: 'green', count: 0 },
  { id: 'LOST', label: 'Closed Lost', badge: 'red', count: 0 }
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

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [formData, setFormData] = useState({ name: '', value: '', stage: 'PROSPECTING', owner: '' })
  const [filters, setFilters] = useState<Filters>({
    dealOwner: '',
    createdAfter: '',
    closedAfter: '',
    lastActivityAfter: '',
    searchText: ''
  })
  const [sortBy, setSortBy] = useState('created')

  useEffect(() => {
    fetchDeals()
  }, [])

  async function fetchDeals() {
    try {
      const res = await fetch('/api/deals')
      const data = await res.json()
      setDeals(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveDeal() {
    if (!formData.name.trim() || !formData.value) return

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          value: parseInt(formData.value),
          stage: formData.stage,
          owner: formData.owner || null
        })
      })

      if (res.ok) {
        setFormData({ name: '', value: '', stage: 'PROSPECTING', owner: '' })
        setShowForm(false)
        fetchDeals()
      }
    } catch (error) {
      console.error('Error saving deal:', error)
    }
  }

  async function handleUpdateDealStage(dealId: string, newStage: string) {
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      })

      if (res.ok) {
        fetchDeals()
      }
    } catch (error) {
      console.error('Error updating deal:', error)
    }
  }

  async function handleDeleteDeal(dealId: string) {
    if (!confirm('Delete this deal?')) return

    try {
      const res = await fetch(`/api/deals/${dealId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchDeals()
      }
    } catch (error) {
      console.error('Error deleting deal:', error)
    }
  }

  const filteredDeals = deals.filter(deal => {
    // Search filter
    if (filters.searchText && !deal.name.toLowerCase().includes(filters.searchText.toLowerCase())) return false

    // Owner filter
    if (filters.dealOwner && deal.owner !== filters.dealOwner) return false

    // Created date filter
    if (filters.createdAfter) {
      const dealDate = new Date(deal.created_at)
      const filterDate = new Date(filters.createdAfter)
      if (dealDate < filterDate) return false
    }

    // Close date filter
    if (filters.closedAfter && deal.close_date) {
      const dealDate = new Date(deal.close_date)
      const filterDate = new Date(filters.closedAfter)
      if (dealDate < filterDate) return false
    }

    // Last activity filter
    if (filters.lastActivityAfter && deal.last_activity) {
      const dealDate = new Date(deal.last_activity)
      const filterDate = new Date(filters.lastActivityAfter)
      if (dealDate < filterDate) return false
    }

    return true
  })

  const getDealsByStage = (stageId: string) => {
    return filteredDeals.filter(deal => deal.stage === stageId)
  }

  const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0)

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '24px 0' }}>
      {/* Top Bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 24px', marginBottom: '24px' }}>
        <div style={{ maxWidth: '1800px', margin: '0 auto', paddingTop: '24px', paddingBottom: '24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '800', color: '#111827' }}>
                Deals
              </h1>
              <p style={{ margin: '0', fontSize: '13px', color: '#6b7280' }}>
                All deals • {filteredDeals.length} deals • ₹{totalValue.toLocaleString('en-IN')} total
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
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
              {showForm ? '✕ Close' : '+ Add deals'}
            </button>
          </div>

          {/* Add Deal Form */}
          {showForm && (
            <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="Deal Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'inherit'
                  }}
                />
                <input
                  type="number"
                  placeholder="Deal Value (₹)"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'inherit'
                  }}
                />
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    backgroundColor: 'white'
                  }}
                >
                  {STAGES.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Owner"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSaveDeal}
                  style={{
                    padding: '8px 16px',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px'
                  }}
                >
                  Save
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
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, minWidth: '300px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', whiteSpace: 'nowrap' }}>Deal owner</label>
              <select
                value={filters.dealOwner}
                onChange={(e) => setFilters({ ...filters, dealOwner: e.target.value })}
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

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', minWidth: '200px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', whiteSpace: 'nowrap' }}>Create date</label>
              <input
                type="date"
                value={filters.createdAfter}
                onChange={(e) => setFilters({ ...filters, createdAfter: e.target.value })}
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
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', whiteSpace: 'nowrap' }}>Last activity date</label>
              <input
                type="date"
                value={filters.lastActivityAfter}
                onChange={(e) => setFilters({ ...filters, lastActivityAfter: e.target.value })}
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
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', whiteSpace: 'nowrap' }}>Close date</label>
              <input
                type="date"
                value={filters.closedAfter}
                onChange={(e) => setFilters({ ...filters, closedAfter: e.target.value })}
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
                whiteSpace: 'nowrap'
              }}
            >
              Filter {(filters.createdAfter || filters.closedAfter || filters.lastActivityAfter) ? '✓' : ''}
            </button>

            {(filters.dealOwner || filters.createdAfter || filters.closedAfter || filters.lastActivityAfter || filters.searchText) && (
              <button
                onClick={() => setFilters({ dealOwner: '', createdAfter: '', closedAfter: '', lastActivityAfter: '', searchText: '' })}
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
                Clear Filters
              </button>
            )}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: 'inherit',
                backgroundColor: 'white',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <option value="created">Sort by: Created</option>
              <option value="value">Sort by: Value</option>
              <option value="name">Sort by: Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: '#6b7280' }}>Loading deals...</p>
        </div>
      ) : (
        <div style={{ padding: '0 24px', overflow: 'auto' }}>
          <div style={{ maxWidth: '1800px', margin: '0 auto', display: 'flex', gap: '16px', minWidth: 'min-content' }}>
            {STAGES.map(stage => {
              const stageDealCount = getDealsByStage(stage.id).length
              const stageValue = getDealsByStage(stage.id).reduce((sum, deal) => sum + deal.value, 0)
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
                        {stageDealCount}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                      ₹{stageValue.toLocaleString('en-IN')} total amount
                    </div>
                  </div>

                  {/* Deal Cards Container */}
                  <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
                    {getDealsByStage(stage.id).length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 12px', color: '#9ca3af' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>+</div>
                        <div style={{ fontSize: '13px' }}>No deals</div>
                      </div>
                    ) : (
                      getDealsByStage(stage.id).map((deal, idx) => (
                        <div
                          key={deal.id}
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
                          {/* Deal Title */}
                          <div style={{ fontWeight: '600', color: '#111827', marginBottom: '8px', fontSize: '13px' }}>
                            {deal.name}
                          </div>

                          {/* Deal Amount */}
                          <div style={{ color: badgeColor.text, fontWeight: '700', marginBottom: '10px', fontSize: '15px' }}>
                            ₹{(deal.value || 0).toLocaleString('en-IN')}
                          </div>

                          {/* Deal Details */}
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
                            {deal.owner && (
                              <div style={{ marginBottom: '4px' }}>👤 {deal.owner}</div>
                            )}
                            {deal.created_at && (
                              <div>{new Date(deal.created_at).toLocaleDateString('en-IN')}</div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: '6px', paddingTop: '10px', borderTop: '1px solid #e5e7eb' }}>
                            <select
                              value={deal.stage}
                              onChange={(e) => handleUpdateDealStage(deal.id, e.target.value)}
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
                              onClick={() => handleDeleteDeal(deal.id)}
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
    </div>
  )
}
