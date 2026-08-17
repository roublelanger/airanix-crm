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
  { id: 'PROSPECTING', label: 'Prospecting', color: '#3b82f6', bgColor: '#dbeafe' },
  { id: 'INITIAL_CONTACT', label: 'Initial Contact', color: '#f59e0b', bgColor: '#fef3c7' },
  { id: 'QUALIFICATION', label: 'Qualification', color: '#8b5cf6', bgColor: '#ede9fe' },
  { id: 'PROPOSAL', label: 'Proposal Presented', color: '#ec4899', bgColor: '#fce7f3' },
  { id: 'NEGOTIATION', label: 'Negotiation', color: '#6366f1', bgColor: '#e0e7ff' },
  { id: 'WON', label: 'Closed Won', color: '#10b981', bgColor: '#d1fae5' },
  { id: 'LOST', label: 'Closed Lost', color: '#ef4444', bgColor: '#fee2e2' }
]

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
    if (filters.searchText && !deal.name.toLowerCase().includes(filters.searchText.toLowerCase())) return false
    if (filters.dealOwner && deal.owner !== filters.dealOwner) return false
    return true
  })

  const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0)

  const getDealsByStage = (stageId: string) => {
    return filteredDeals.filter(deal => deal.stage === stageId)
  }

  return (
    <div style={{ background: '#f9fafb', minHeight: 'calc(100vh - 80px)', padding: '24px' }}>
      {/* Header */}
      <div style={{ maxWidth: '1600px', margin: '0 auto 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800', color: '#111827' }}>
              🎯 Deals
            </h1>
            <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
              Manage your sales pipeline • ₹{totalValue.toLocaleString('en-IN')} total value
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '12px 24px',
              background: showForm ? '#ef4444' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            {showForm ? '✕ Cancel' : '+ Add deals'}
          </button>
        </div>

        {/* Add Deal Form */}
        {showForm && (
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>New Deal</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Deal Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  padding: '10px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
              <input
                type="number"
                placeholder="Deal Value (₹)"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                style={{
                  padding: '10px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                style={{
                  padding: '10px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                {STAGES.map(stage => (
                  <option key={stage.id} value={stage.id}>{stage.label}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Deal Owner"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                style={{
                  padding: '10px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleSaveDeal}
                style={{
                  padding: '10px 20px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Save Deal
              </button>
              <button
                onClick={() => {
                  setShowForm(false)
                  setFormData({ name: '', value: '', stage: 'PROSPECTING', owner: '' })
                }}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search deals..."
              value={filters.searchText}
              onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
              style={{
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                minWidth: '200px',
                fontFamily: 'inherit'
              }}
            />

            <select
              value={filters.dealOwner}
              onChange={(e) => setFilters({ ...filters, dealOwner: e.target.value })}
              style={{
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">All Owners</option>
              {[...new Set(deals.map(d => d.owner).filter(Boolean))].map(owner => (
                <option key={owner} value={owner}>{owner}</option>
              ))}
            </select>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              style={{
                padding: '8px 12px',
                background: showAdvancedFilters ? '#2563eb' : '#f3f4f6',
                color: showAdvancedFilters ? 'white' : '#374151',
                border: showAdvancedFilters ? 'none' : '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px'
              }}
            >
              Advanced Filters
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                backgroundColor: 'white',
                cursor: 'pointer',
                marginLeft: 'auto'
              }}
            >
              <option value="created">Sort by Created</option>
              <option value="value">Sort by Value</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>

          {showAdvancedFilters && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>
                  Create Date After
                </label>
                <input
                  type="date"
                  value={filters.createdAfter}
                  onChange={(e) => setFilters({ ...filters, createdAfter: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>
                  Close Date After
                </label>
                <input
                  type="date"
                  value={filters.closedAfter}
                  onChange={(e) => setFilters({ ...filters, closedAfter: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>
                  Last Activity After
                </label>
                <input
                  type="date"
                  value={filters.lastActivityAfter}
                  onChange={(e) => setFilters({ ...filters, lastActivityAfter: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: '#6b7280' }}>Loading deals...</p>
        </div>
      ) : (
        <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {STAGES.map(stage => {
            const stageDealCount = getDealsByStage(stage.id).length
            const stageValue = getDealsByStage(stage.id).reduce((sum, deal) => sum + deal.value, 0)

            return (
              <div key={stage.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 200px)' }}>
                {/* Stage Header */}
                <div style={{ background: stage.bgColor, padding: '16px', borderBottom: `3px solid ${stage.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ margin: '0', fontSize: '14px', fontWeight: '700', color: stage.color }}>
                      {stage.label}
                    </h3>
                    <span style={{ background: stage.color, color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>
                      {stageDealCount}
                    </span>
                  </div>
                  <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>
                    ₹{stageValue.toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Deal Cards */}
                <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
                  {getDealsByStage(stage.id).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca3af', fontSize: '13px' }}>
                      No deals
                    </div>
                  ) : (
                    getDealsByStage(stage.id).map(deal => (
                      <div
                        key={deal.id}
                        style={{
                          background: '#f9fafb',
                          border: `1px solid ${stage.bgColor}`,
                          borderRadius: '8px',
                          padding: '12px',
                          marginBottom: '10px',
                          cursor: 'grab',
                          transition: 'all 0.2s',
                          fontSize: '13px'
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
                        <div style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                          {deal.name}
                        </div>
                        <div style={{ color: stage.color, fontWeight: '700', marginBottom: '8px', fontSize: '14px' }}>
                          ₹{(deal.value || 0).toLocaleString('en-IN')}
                        </div>
                        {deal.owner && (
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                            👤 {deal.owner}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                          <select
                            value={deal.stage}
                            onChange={(e) => handleUpdateDealStage(deal.id, e.target.value)}
                            style={{
                              flex: 1,
                              padding: '4px 6px',
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
                              padding: '4px 8px',
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}
                          >
                            ✕
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
      )}
    </div>
  )
}
