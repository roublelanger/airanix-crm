import { createClient } from '@supabase/supabase-js'

// Without this, Next.js has no reason to treat this route as dynamic (it
// calls no request-scoped API like headers()/cookies()), so it gets
// statically rendered at build time and the response is frozen from
// whatever the DB looked like at the last deploy - confirmed via the build
// output marking this route "○ Static". force-dynamic makes it run the
// Supabase query fresh on every request instead.
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// Use ANON_KEY to match contacts page behavior (same RLS policies)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET() {
  try {
    // Plain exact-count queries instead of fetching every row to count/dedupe
    // in JS. The old approach silently truncated at Postgres/PostgREST's
    // default 1000-row response cap - with 4700 real contacts it undercounted
    // by nearly 4x (reported 953). head:true means no rows are transferred at
    // all, so there's no cap to hit, and it's far cheaper at any table size.
    // Also drops the email+name dedup: per the same decision already made
    // for the Contacts page, duplicates get fixed at the source (import/cron
    // uniqueness) and cleaned up via the weekly report, not hidden by
    // re-deduping on every read - so this now reports the real total.
    const [totalRes, leadsRes, activeDealsRes, wonDealsRes] = await Promise.all([
      supabase.from('contacts').select('id', { count: 'exact', head: true }),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('status', 'LEAD'),
      supabase.from('deals').select('id', { count: 'exact', head: true }).not('status', 'in', '(CLOSED,LOST,WON)'),
      supabase.from('deals').select('id', { count: 'exact', head: true }).eq('status', 'WON')
    ])

    for (const [label, res] of [['contacts total', totalRes], ['leads', leadsRes], ['active deals', activeDealsRes], ['won deals', wonDealsRes]] as const) {
      if (res.error) console.error(`[METRICS] ${label} count error:`, res.error.message)
    }

    return Response.json({
      totalContacts: totalRes.count ?? 0,
      activeDeal: activeDealsRes.count ?? 0,
      newLeads: leadsRes.count ?? 0,
      conversions: wonDealsRes.count ?? 0
    })
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return Response.json({
      totalContacts: 0,
      activeDeal: 0,
      newLeads: 0,
      conversions: 0
    })
  }
}
