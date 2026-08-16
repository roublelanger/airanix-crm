import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET() {
  try {
    // Fetch all contacts with status
    const contactsRes = await supabase.from('contacts').select('id, status')
    const contacts = contactsRes.data || []

    // Fetch all deals with status
    const dealsRes = await supabase.from('deals').select('id, status')
    const deals = dealsRes.data || []

    // Calculate metrics
    const activeContacts = contacts.filter(c => c.status === 'ACTIVE').length
    const newLeads = contacts.filter(c => c.status === 'LEAD').length
    const activeDeals = deals.filter(d => d.status && !['CLOSED', 'LOST', 'WON'].includes(d.status)).length
    const wonDeals = deals.filter(d => d.status === 'WON').length

    console.log('Dashboard Metrics:', {
      activeContacts,
      newLeads,
      activeDeals,
      wonDeals,
      totalContacts: contacts.length,
      totalDeals: deals.length
    })

    return Response.json({
      totalContacts: activeContacts,
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
