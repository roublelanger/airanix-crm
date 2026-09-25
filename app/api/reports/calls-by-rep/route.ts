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
      .select('type, created_by_name, created_at')
      .in('type', CALL_TYPES)
      .gte('created_at', startUtc.toISOString())
      .lt('created_at', endUtc.toISOString())

    if (error) {
      console.error('[CALLS-BY-REP] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const byRep: Record<string, { connected: number; notReceived: number; notInterested: number; total: number }> = {}

    for (const row of data || []) {
      const rep = row.created_by_name || 'Unknown'
      if (!byRep[rep]) byRep[rep] = { connected: 0, notReceived: 0, notInterested: 0, total: 0 }
      if (row.type === 'follow-up-call') byRep[rep].connected++
      else if (row.type === 'call-not-received') byRep[rep].notReceived++
      else if (row.type === 'cold-call-not-interested') byRep[rep].notInterested++
      byRep[rep].total++
    }

    const reps = Object.entries(byRep)
      .map(([name, counts]) => ({ name, ...counts }))
      .sort((a, b) => b.total - a.total)

    return NextResponse.json({
      date,
      totalCalls: (data || []).length,
      reps
    })
  } catch (error: any) {
    console.error('[CALLS-BY-REP] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch call report' }, { status: 500 })
  }
}
