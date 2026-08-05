'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function DealsContent() {
  const searchParams = useSearchParams()
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const stageFilter = searchParams.get('stage') || ''

  useEffect(() => {
    async function fetchDeals() {
      try {
        const res = await fetch('/api/deals')
        const data = await res.json()
        if (Array.isArray(data)) {
          setDeals(data)
        } else {
          console.error('API returned non-array:', data)
          setDeals([])
          setError(data?.error || 'Failed to load deals')
        }
      } catch (error) {
        console.error('Error fetching deals:', error)
        setDeals([])
      } finally {
        setLoading(false)
      }
    }
    fetchDeals()
  }, [])

  const filteredDeals = stageFilter ? deals.filter(d => d.stage === stageFilter) : deals
  const totalValue = filteredDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <h1>Deals ({filteredDeals.length}) {stageFilter && `- ${stageFilter}`}</h1>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginTop: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div>
          <h3 style={{ color: '#666', marginBottom: '8px' }}>Pipeline Value</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e40af' }}>
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '30px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Deal Name</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Value</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Stage</th>
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
                <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#d1495a' }}>
                  Error: {error}
                </td>
              </tr>
            ) : filteredDeals.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  {stageFilter ? `No deals in ${stageFilter} stage` : 'No deals yet'}
                </td>
              </tr>
            ) : (
              filteredDeals.map((deal: any) => (
                <tr key={deal.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px', fontSize: '14px', fontWeight: '500' }}>{deal.name}</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>${(deal.value || 0).toLocaleString()}</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>
                    <span style={{ background: '#dbeafe', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                      {deal.stage || 'prospect'}
                    </span>
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
