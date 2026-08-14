'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function DealsContent() {
  const searchParams = useSearchParams()
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const stageFilter = searchParams.get('stage') || ''
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', value: '', stage: 'LEAD' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')

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
      setDeals([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveDeal() {
    setSaveError('')
    setSaveSuccess('')

    if (!formData.name.trim()) {
      setSaveError('Deal name is required')
      return
    }
    if (!formData.value || parseInt(formData.value) <= 0) {
      setSaveError('Valid deal value is required')
      return
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/deals/${editingId}` : '/api/deals'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, value: parseInt(formData.value), stage: formData.stage })
      })
      const data = await res.json()
      if (res.ok) {
        setSaveSuccess(editingId ? 'Deal updated successfully!' : 'Deal created successfully!')
        setFormData({ name: '', value: '', stage: 'LEAD' })
        setEditingId(null)
        setTimeout(() => {
          setShowForm(false)
          fetchDeals()
        }, 500)
      } else {
        setSaveError(data.error || 'Failed to save deal')
      }
    } catch (error) {
      setSaveError(`Error: ${error instanceof Error ? error.message : 'Failed to save'}`)
    }
  }

  async function handleDeleteDeal(id: string) {
    if (!confirm('Delete this deal?')) return

    try {
      const res = await fetch(`/api/deals/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchDeals()
      } else {
        alert('Failed to delete deal')
      }
    } catch (error) {
      console.error('Error deleting deal:', error)
    }
  }

  function handleEditDeal(deal: any) {
    setFormData({ name: deal.name, value: deal.value.toString(), stage: deal.stage })
    setEditingId(deal.id)
    setShowForm(true)
    setSaveError('')
    setSaveSuccess('')
  }

  function handleCloseForm() {
    setShowForm(false)
    setFormData({ name: '', value: '', stage: 'LEAD' })
    setEditingId(null)
    setSaveError('')
    setSaveSuccess('')
  }

  const filteredDeals = stageFilter ? deals.filter(d => d.stage === stageFilter) : deals
  const totalValue = filteredDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)

  const stageConfig: Record<string, { color: string; bg: string; textColor: string }> = {
    LEAD: { color: '#0369a1', bg: '#dbeafe', textColor: '#0369a1' },
    CONTACTED: { color: '#7c2d12', bg: '#fed7aa', textColor: '#7c2d12' },
    PROPOSAL: { color: '#4338ca', bg: '#e0e7ff', textColor: '#4338ca' },
    WON: { color: '#047857', bg: '#d1fae5', textColor: '#047857' },
    LOST: { color: '#991b1b', bg: '#fecaca', textColor: '#991b1b' },
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', minHeight: 'calc(100vh - 80px)' }}>
        <div style={{ textAlign: 'center', paddingTop: '80px' }}>
          <div style={{ display: 'inline-block', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #e5e7eb', borderTop: '4px solid #2563eb', animation: 'spin 1s linear infinite' }}></div>
          </div>
          <p style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500', margin: '0' }}>Loading deals...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', minHeight: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>
            Leads
          </h1>
          <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
            Manage your sales pipeline • {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''} {stageFilter && `in ${stageFilter}`}
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
          {showForm ? '✕ Cancel' : '➕ New Deal'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div
          style={{
            background: 'white',
            padding: '28px',
            borderRadius: '12px',
            marginBottom: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb',
          }}
        >
          <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '700', color: '#111827' }}>
            {editingId ? '✏️ Edit Deal' : '➕ New Deal'}
          </h2>
          {saveError && (
            <div
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                fontWeight: '500',
                border: '1px solid #fecaca',
              }}
            >
              ⚠️ {saveError}
            </div>
          )}
          {saveSuccess && (
            <div
              style={{
                background: '#d1fae5',
                color: '#065f46',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                fontWeight: '500',
                border: '1px solid #a7f3d0',
              }}
            >
              ✓ {saveSuccess}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Deal Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                padding: '10px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#2563eb'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            <input
              type="number"
              placeholder="Value (₹) *"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              style={{
                padding: '10px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#2563eb'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.boxShadow = 'none'
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
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#2563eb'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <option value="LEAD">🎯 Lead</option>
              <option value="CONTACTED">📞 Contacted</option>
              <option value="PROPOSAL">📋 Proposal</option>
              <option value="WON">🏆 Won</option>
              <option value="LOST">❌ Lost</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleSaveDeal}
              style={{
                padding: '10px 24px',
                background: '#2563eb',
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
              Save Deal
            </button>
            <button
              onClick={handleCloseForm}
              style={{
                padding: '10px 24px',
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Pipeline Value */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '32px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          border: '1px solid #bfdbfe',
        }}
      >
        <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          💰 Total Pipeline Value
        </p>
        <p style={{ fontSize: '36px', fontWeight: '800', color: '#0369a1', margin: '0', lineHeight: '1' }}>
          ₹ {totalValue.toLocaleString('en-IN')}
        </p>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Deal Name
              </th>
              <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Value
              </th>
              <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Stage
              </th>
              <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={4} style={{ padding: '60px 40px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#991b1b', margin: '0 0 8px 0' }}>Error Loading Deals</h3>
                  <p style={{ fontSize: '14px', color: '#7c2515', margin: '0' }}>{error}</p>
                </td>
              </tr>
            ) : filteredDeals.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '60px 40px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>💼</div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                    {stageFilter ? `No deals in ${stageFilter} stage` : 'No deals yet'}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                    {stageFilter ? 'Try a different stage or create a new deal' : 'Add your first deal to get started'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredDeals.map((deal: any, idx: number) => (
                <tr
                  key={deal.id}
                  style={{
                    borderBottom: idx < filteredDeals.length - 1 ? '1px solid #e5e7eb' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white'
                  }}
                >
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                    {deal.name}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '700', color: '#0369a1', textAlign: 'right' }}>
                    ₹ {(deal.value || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span
                      style={{
                        background: (stageConfig[deal.stage] || stageConfig.LEAD).bg,
                        color: (stageConfig[deal.stage] || stageConfig.LEAD).textColor,
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        display: 'inline-block',
                      }}
                    >
                      {deal.stage || 'LEAD'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleEditDeal(deal)}
                      style={{
                        padding: '6px 12px',
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(37, 99, 235, 0.3)'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDeal(deal.id)}
                      style={{
                        padding: '6px 12px',
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
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fee2e2'
                        e.currentTarget.style.color = '#dc2626'
                      }}
                    >
                      Delete
                    </button>
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

export default function DealsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading leads...</div>}>
      <DealsContent />
    </Suspense>
  )
}
