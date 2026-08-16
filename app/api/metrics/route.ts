import { createClient } from '@supabase/supabase-js'

// Use ANON_KEY to match contacts page behavior (same RLS policies)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET() {
  try {
    // Fetch all contacts with status - using same SELECT_FIELDS as contacts API
    const contactsRes = await supabase
      .from('contacts')
      .select('id, status')
      .order('company', { ascending: true })
      .order('name', { ascending: true })

    const contacts = contactsRes.data || []

    // Fetch all deals with status
    const dealsRes = await supabase
      .from('deals')
      .select('id, status')
      .order('createdAt', { ascending: false })

    const deals = dealsRes.data || []

    // Calculate metrics
    const totalContacts = contacts.length  // ALL contacts (exactly as contacts page shows)
    const newLeads = contacts.filter(c => c.status === 'LEAD').length

    // Active Deals = deals that are not completed/lost
    const activeDeals = deals.filter(d => d.status && !['CLOSED', 'LOST', 'WON'].includes(d.status?.toUpperCase() || '')).length

    // Conversions = WON deals
    const wonDeals = deals.filter(d => d.status && d.status.toUpperCase() === 'WON').length

    // Debug: Log exact counts
    console.log('=== METRICS API DEBUG ===')
    console.log(`Total contacts fetched: ${contacts.length}`)
    console.log(`New Leads (LEAD status): ${newLeads}`)
    console.log(`Active Deals: ${activeDeals}`)
    console.log(`Won Deals (Conversions): ${wonDeals}`)

    // Breakdown by status
    const statusBreakdown: Record<string, number> = {}
    contacts.forEach(c => {
      statusBreakdown[c.status || 'UNKNOWN'] = (statusBreakdown[c.status || 'UNKNOWN'] || 0) + 1
    })
    console.log('Status breakdown:', statusBreakdown)
    console.log('======================')

    return Response.json({
      totalContacts,
      activeDeal: activeDeals,
      newLeads,
      conversions: wonDeals
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
