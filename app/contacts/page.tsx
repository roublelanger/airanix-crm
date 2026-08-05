'use client'

import { useEffect, useState } from 'react'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
        <h1>Contacts ({contacts.length})</h1>
        <p style={{ color: '#666' }}>Manage your leads and customers</p>
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
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  No contacts yet
                </td>
              </tr>
            ) : (
              contacts.map((contact: any) => (
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
