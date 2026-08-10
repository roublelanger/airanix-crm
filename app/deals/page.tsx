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
  const [formData, setFormData] = useState({ name: '', value: '', stage: 'prospect' })
  const [editingId, setEditingId] = useState<string | null>(null)

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
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/deals/${editingId}` : '/api/deals'

      // Only send fields that exist in database - strip everything else
      const cleanData = {
        name: formData.name || '',
        value: parseInt(formData.value) || 0,
        stage: formData.stage || 'prospect'
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData)
      })
      if (res.ok) {
        setFormData({ name: '', value: '', stage: 'prospect' })
        setEditingId(null)
        setShowForm(false)
        fetchDeals()
      }
    } catch (error) {
      console.error('Error saving deal:', error)
    }
  }

  function handleEditDeal(deal: any) {
    setFormData({ name: deal.name, value: deal.value.toString(), stage: deal.stage })
    setEditingId(deal.id)
    setShowForm(true)
  }

  function handleCloseForm() {
    setShowForm(false)
    setFormData({ name: '', value: '', stage: 'prospect' })
    setEditingId(null)
  }

  const filteredDeals = stageFilter ? deals.filter(d => d.stage === stageFilter) : deals
  const totalValue = filteredDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1>Deals ({filteredDeals.length}) {stageFilter && `- ${stageFilter}`}</h1>
          <p style={{ color: '#666' }}>Track your sales pipeline</p>
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
          {showForm ? '✕ Cancel' : '+ New Deal'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 20px 0' }}>{editingId ? 'Edit Deal' : 'New Deal'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <input type="text" placeholder="Deal Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            <input type="number" placeholder="Value (INR)" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            <select value={formData.stage} onChange={(e) => setFormData({ ...formData, stage: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
              <option value="prospect">Prospect</option>
              <option value="negotiation">Negotiation</option>
              <option value="proposal">Proposal</option>
              <option value="active">Active</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleSaveDeal} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
            <button onClick={handleCloseForm} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#333', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: '#666', marginBottom: '8px' }}>Pipeline Value</h3>
        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e40af', margin: 0 }}>₹ {totalValue.toLocaleString('en-IN')}</p>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '30px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Deal Name</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Value</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Stage</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#d1495a' }}>
                  Error: {error}
                </td>
              </tr>
            ) : filteredDeals.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  {stageFilter ? `No deals in ${stageFilter} stage` : 'No deals yet'}
                </td>
              </tr>
            ) : (
              filteredDeals.map((deal: any) => (
                <tr key={deal.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px', fontSize: '14px', fontWeight: '500' }}>{deal.name}</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>₹ {(deal.value || 0).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>
                    <span style={{ background: '#dbeafe', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', textTransform: 'capitalize' }}>
                      {deal.stage || 'prospect'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>
                    <button onClick={() => handleEditDeal(deal)} style={{ padding: '6px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
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
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading deals...</div>}>
      <DealsContent />
    </Suspense>
  )
}
