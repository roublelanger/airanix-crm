'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

interface FollowUp {
  id: string
  contactId: string
  contact: {
    id: string
    name: string
    email: string
    company: string
    phone: string
  }
  activityType: string
  description: string
  priority: 'high' | 'normal' | 'low'
  status: string
  scheduledDate: string
  scheduledTime: string
  createdAt: string
}

const FollowupsPage = () => {
  const [followups, setFollowups] = useState<FollowUp[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'upcoming' | 'completed'>('today')
  const [filterStatus, setFilterStatus] = useState<'pending' | 'all'>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'normal' | 'low'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    fetchFollowups()
  }, [activeTab, filterStatus])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, priorityFilter])

  async function fetchFollowups() {
    try {
      setLoading(true)
      let status = filterStatus === 'all' ? '' : 'pending'
      let range = activeTab

      if (activeTab === 'completed') {
        status = 'completed'
        range = 'upcoming'
      }

      const url = `/api/followups?range=${range}${status ? `&status=${status}` : ''}`
      const res = await fetch(url)
      const data = await res.json()
      setFollowups(data.data || [])
    } catch (error) {
      console.error('Error fetching followups:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and search logic
  const filteredFollowups = useMemo(() => {
    return followups.filter(f => {
      const matchesSearch = f.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           f.contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           f.contact.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPriority = priorityFilter === 'all' || f.priority === priorityFilter
      return matchesSearch && matchesPriority
    })
  }, [followups, searchQuery, priorityFilter])

  // Pagination
  const totalPages = Math.ceil(filteredFollowups.length / itemsPerPage)
  const paginatedFollowups = filteredFollowups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  async function handleComplete(followupId: string) {
    try {
      const followup = followups.find(f => f.id === followupId)
      if (!followup) return

      const { supabase } = await import('@/lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user

      let userName = 'Unknown User'
      if (currentUser?.id) {
        try {
          const { data: userData } = await supabase
            .from('crm_users')
            .select('name')
            .eq('id', currentUser.id)
            .single()

          if (userData?.name) {
            userName = userData.name
          } else {
            const emailParts = currentUser.email?.split('@') || []
            userName = emailParts[0] || 'Unknown User'
          }
        } catch (error) {
          userName = currentUser.email?.split('@')[0] || 'Unknown User'
        }
      }

      const res = await fetch('/api/followups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: followupId,
          status: 'completed'
        })
      })

      if (res.ok) {
        await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'follow-up-completed',
            description: `Follow-up Call completed - Scheduled for ${followup.scheduledDate} at ${followup.scheduledTime}`,
            contactId: followup.contactId,
            userId: currentUser?.id,
            userName: userName
          })
        })

        fetchFollowups()
      }
    } catch (error) {
      console.error('Error completing followup:', error)
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return { bg: '#fee2e2', text: '#dc2626' }
      case 'normal': return { bg: '#dbeafe', text: '#2563eb' }
      case 'low': return { bg: '#dcfce7', text: '#059669' }
      default: return { bg: '#f3f4f6', text: '#6b7280' }
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
          📞 My Follow-ups
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Track and manage your scheduled follow-up calls
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px', flexWrap: 'wrap' }}>
        {(['today', 'week', 'upcoming', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: activeTab === tab ? '#2563eb' : 'transparent',
              color: activeTab === tab ? 'white' : '#6b7280',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            {tab === 'today' && '📅 Today'}
            {tab === 'week' && '📆 This Week'}
            {tab === 'upcoming' && '🗓️ Upcoming'}
            {tab === 'completed' && '✅ Completed'}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <input
            type="text"
            placeholder="🔍 Search by contact name, company, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as any)}
          style={{
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'inherit',
            cursor: 'pointer',
            backgroundColor: 'white'
          }}
        >
          <option value="all">All Priorities</option>
          <option value="high">⚠️ High Priority</option>
          <option value="normal">📌 Normal Priority</option>
          <option value="low">✓ Low Priority</option>
        </select>
      </div>

      {/* Results count */}
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
        Showing {paginatedFollowups.length > 0 ? ((currentPage - 1) * itemsPerPage + 1) : 0} - {Math.min(currentPage * itemsPerPage, filteredFollowups.length)} of {filteredFollowups.length} follow-ups
      </div>

      {/* Table View */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>Loading...</p>
      ) : filteredFollowups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>✨ No follow-ups found</p>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '8px 0 0 0' }}>
            {searchQuery || priorityFilter !== 'all' ? 'Try adjusting your filters' : 'No scheduled follow-ups for this period'}
          </p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Date & Time</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Contact</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Company</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Description</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Priority</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFollowups.map((f) => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: '600', color: '#111827' }}>
                        {new Date(f.scheduledDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{f.scheduledTime}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Link href={`/contacts/${f.contactId}`} style={{ textDecoration: 'none' }}>
                        <div style={{ fontWeight: '600', color: '#2563eb', cursor: 'pointer' }}>{f.contact.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{f.contact.phone || 'No phone'}</div>
                      </Link>
                    </td>
                    <td style={{ padding: '12px', color: '#6b7280' }}>{f.contact.company}</td>
                    <td style={{ padding: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#6b7280' }}>
                      {f.description || '-'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: getPriorityBadgeColor(f.priority).bg,
                        color: getPriorityBadgeColor(f.priority).text
                      }}>
                        {f.priority.charAt(0).toUpperCase() + f.priority.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleComplete(f.id)}
                        style={{
                          padding: '6px 12px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '12px'
                        }}
                      >
                        ✓ Done
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                ← Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: '8px 12px',
                    border: currentPage === page ? '1px solid #2563eb' : '1px solid #d1d5db',
                    background: currentPage === page ? '#2563eb' : 'white',
                    color: currentPage === page ? 'white' : '#111827',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: currentPage === page ? '600' : 'normal'
                  }}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default FollowupsPage
