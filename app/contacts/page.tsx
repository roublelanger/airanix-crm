'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ContactsContent() {
  const searchParams = useSearchParams()
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ status: searchParams.get('status') || '', company: '' })

  useEffect(() => {
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
    fetchContacts()
  }, [])

  return (
    <div style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1>Contacts ({contacts.filter(c => (!filters.status || c.status === filters.status) && (!filters.company || c.company === filters.company)).length})</h1>
        <p style={{ color: '#666' }}>Manage your leads and customers</p>

        {/* Quick Filters */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
          >
            <option value="">All Status</option>
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="customer">Customer</option>
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
                <tr key={contact.id} style={{ borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }} onClick={() => window.location.href = `/contacts/${contact.id}`}>
                  <td style={{ padding: '16px', fontSize: '14px', fontWeight: '500', color: '#2563eb' }}>{contact.name}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#2563eb' }}>{contact.email || '-'}</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>{contact.phone || '-'}</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>{contact.company || '-'}</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>
                    <span style={{
                      background: contact.status === 'lead' ? '#fef3c7' : contact.status === 'prospect' ? '#dbeafe' : '#d1fae5',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {contact.status || 'lead'}
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

export default function ContactsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading contacts...</div>}>
      <ContactsContent />
    </Suspense>
  )
}
