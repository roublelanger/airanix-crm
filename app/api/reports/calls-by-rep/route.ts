import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// Every activity type that represents an actual call attempt (connected or
// not) - matches exactly what the Analytics page's "Call Connect Rate" KPI
// already treats as call activity, plus cold-call-not-interested (added
// after that KPI was built).
const CALL_TYPES = ['follow-up-call', 'call-not-received', 'cold-call-not-interested']

// IST day boundaries (not UTC) so a call logged late evening in India
// doesn't get miscounted into the wrong calendar day - matches the IST
// convention already used for displaying timestamps elsewhere in the app.
function istDayBoundsUtc(dateStr: string) {
  // dateStr is a plain YYYY-MM-DD picked by the user, meant as an IST
  // calendar date. IST is UTC+5:30 with no DST, so IST midnight equals
  // (dateStr 00:00:00) minus 5:30, expressed directly in UTC.
  const startUtc = new Date(`${dateStr}T00:00:00+05:30`)
  const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000)
  return { startUtc, endUtc }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const nowIst = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
    const date = searchParams.get('date') || nowIst // YYYY-MM-DD

    const { startUtc, endUtc } = istDayBoundsUtc(date)

    const { data, error } = await supabase
      .from('interactions')
      .select('id, type, created_by_name, created_at, contact_id, notes')
      .in('type', CALL_TYPES)
      .gte('created_at', startUtc.toISOString())
      .lt('created_at', endUtc.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[CALLS-BY-REP] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = data || []

    // Enrich with contact name/company for the drill-down view. Only the
    // contacts actually called this day - at most a few dozen rows even on
    // a busy day - not the whole contacts table.
    const contactIds = Array.from(new Set(rows.map(r => r.contact_id).filter(Boolean)))
    let contactsById: Record<string, { name: string; company: string }> = {}
    if (contactIds.length > 0) {
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('id, name, company')
        .in('id', contactIds)
      if (contactsError) {
        console.error('[CALLS-BY-REP] Contacts lookup error:', contactsError)
      } else {
        contactsById = Object.fromEntries((contactsData || []).map(c => [c.id, { name: c.name, company: c.company }]))
      }
    }

    const istTimeFormat = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true })

    const byRep: Record<string, {
      connected: number; notReceived: number; notInterested: number; total: number
      calls: { id: string; time: string; type: string; contactName: string; company: string; notes: string | null }[]
    }> = {}

    for (const row of rows) {
      const rep = row.created_by_name || 'Unknown'
      if (!byRep[rep]) byRep[rep] = { connected: 0, notReceived: 0, notInterested: 0, total: 0, calls: [] }
      if (row.type === 'follow-up-call') byRep[rep].connected++
      else if (row.type === 'call-not-received') byRep[rep].notReceived++
      else if (row.type === 'cold-call-not-interested') byRep[rep].notInterested++
      byRep[rep].total++

      const contact = row.contact_id ? contactsById[row.contact_id] : undefined
      byRep[rep].calls.push({
        id: row.id,
        time: istTimeFormat.format(new Date(row.created_at)),
        type: row.type,
        contactName: contact?.name || '(contact record no longer exists)',
        company: contact?.company || '',
        notes: row.notes
      })
    }

    const reps = Object.entries(byRep)
      .map(([name, counts]) => ({ name, ...counts }))
      .sort((a, b) => b.total - a.total)

    return NextResponse.json({
      date,
      totalCalls: rows.length,
      reps
    })
  } catch (error: any) {
    console.error('[CALLS-BY-REP] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch call report' }, { status: 500 })
  }
}
