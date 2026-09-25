'use client'

import { useState, useEffect, Fragment } from 'react'

interface CallRecord {
  id: string
  time: string
  type: string
  contactName: string
  company: string
  notes: string | null
}

interface RepRow {
  name: string
  total: number
  connected: number
  notReceived: number
  notInterested: number
  calls: CallRecord[]
}

const CALL_TYPE_LABELS: Record<string, string> = {
  'follow-up-call': 'Connected',
  'call-not-received': 'Not Received',
  'cold-call-not-interested': 'Not Interested'
}

const CALL_TYPE_COLORS: Record<string, string> = {
  'follow-up-call': '#059669',
  'call-not-received': '#dc2626',
  'cold-call-not-interested': '#9ca3af'
}

function todayIst(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00+05:30`)
  d.setUTCDate(d.getUTCDate() + days)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d)
}

export default function CallsByRepPage() {
  const [date, setDate] = useState(todayIst())
  const [reps, setReps] = useState<RepRow[]>([])
  const [totalCalls, setTotalCalls] = useState(0)
  const [loading, setLoading] = useState(true)
  const [expandedRep, setExpandedRep] = useState<string | null>(null)

  useEffect(() => {
    fetchReport()
    setExpandedRep(null)
  }, [date])

  async function fetchReport() {
    setLoading(true)
    try {
      const res = await fetch(`/api/reports/calls-by-rep?date=${date}`)
      const data = await res.json()
      setReps(data.reps || [])
      setTotalCalls(data.totalCalls || 0)
    } catch (error) {
      console.error('Error fetching call report:', error)
      setReps([])
      setTotalCalls(0)
    } finally {
      setLoading(false)
    }
  }

  const isToday = date === todayIst()
  const displayDate = new Date(`${date}T00:00:00+05:30`).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
        📞 Calls by ISR
      </h1>
      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0' }}>
        How many calls each rep logged, per day - click a row to see the individual calls
      </p>

      {/* Date navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setDate(shiftDate(date, -1))}
          style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '14px' }}
        >
          ← Previous Day
        </button>
        <input
          type="date"
          value={date}
          max={todayIst()}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
        />
        <button
          onClick={() => setDate(shiftDate(date, 1))}
          disabled={isToday}
          style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: '6px', background: isToday ? '#f3f4f6' : 'white', cursor: isToday ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: isToday ? 0.5 : 1 }}
        >
          Next Day →
        </button>
        {!isToday && (
          <button
            onClick={() => setDate(todayIst())}
            style={{ padding: '8px 14px', border: 'none', borderRadius: '6px', background: '#2563eb', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
          >
            Jump to Today
          </button>
        )}
      </div>

      <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px 0' }}>{displayDate} (IST)</p>

      {/* Summary */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0' }}>
          Total Calls This Day
        </p>
        <p style={{ fontSize: '36px', fontWeight: 800, color: '#111827', margin: 0 }}>{totalCalls}</p>
      </div>

      {/* Per-rep table */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>Loading...</p>
      ) : reps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>No calls logged on this day</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}></th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>ISR</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Total Calls</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#059669' }}>Connected</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#dc2626' }}>Not Received</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#9ca3af' }}>Not Interested</th>
              </tr>
            </thead>
            <tbody>
              {reps.map((rep) => {
                const isExpanded = expandedRep === rep.name
                return (
                  <Fragment key={rep.name}>
                    <tr
                      onClick={() => setExpandedRep(isExpanded ? null : rep.name)}
                      style={{ borderBottom: '1px solid #e5e7eb', cursor: 'pointer', background: isExpanded ? '#f9fafb' : 'white' }}
                    >
                      <td style={{ padding: '12px 16px', color: '#9ca3af', width: '24px' }}>{isExpanded ? '▼' : '▶'}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#2563eb', textDecoration: 'underline' }}>{rep.name}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#111827' }}>{rep.total}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#059669' }}>{rep.connected}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#dc2626' }}>{rep.notReceived}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#9ca3af' }}>{rep.notInterested}</td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${rep.name}-detail`}>
                        <td colSpan={6} style={{ padding: 0, background: '#f9fafb' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ padding: '8px 16px 8px 48px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Time</th>
                                <th style={{ padding: '8px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Contact</th>
                                <th style={{ padding: '8px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Company</th>
                                <th style={{ padding: '8px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Outcome</th>
                                <th style={{ padding: '8px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rep.calls.map((call) => (
                                <tr key={call.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                  <td style={{ padding: '8px 16px 8px 48px', color: '#374151', whiteSpace: 'nowrap' }}>{call.time}</td>
                                  <td style={{ padding: '8px 16px', color: '#111827', fontWeight: 500 }}>{call.contactName}</td>
                                  <td style={{ padding: '8px 16px', color: '#6b7280' }}>{call.company}</td>
                                  <td style={{ padding: '8px 16px' }}>
                                    <span style={{ color: CALL_TYPE_COLORS[call.type] || '#6b7280', fontWeight: 600 }}>
                                      {CALL_TYPE_LABELS[call.type] || call.type}
                                    </span>
                                  </td>
                                  <td style={{ padding: '8px 16px', color: '#6b7280', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={call.notes || ''}>
                                    {call.notes || '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
