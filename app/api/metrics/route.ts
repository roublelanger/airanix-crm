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
    const totalContacts = contacts.length  // ALL contacts
    const leadContacts = contacts.filter(c => c.status === 'LEAD').length
    const newContacts = contacts.filter(c => c.status === 'NEW').length
    const activeContacts = contacts.filter(c => c.status === 'ACTIVE').length

    // New Leads = LEAD status only (not NEW + LEAD)
    const newLeads = leadContacts

    // Active Deals = deals that are not completed/lost
    const activeDeals = deals.filter(d => d.status && !['CLOSED', 'LOST', 'WON'].includes(d.status.toUpperCase())).length

    // Conversions = WON deals
    const wonDeals = deals.filter(d => d.status && d.status.toUpperCase() === 'WON').length

    console.log('Dashboard Metrics:', {
      totalContacts,
      leadContacts,
      newContacts,
      activeContacts,
      newLeads,
      activeDeals,
      wonDeals,
      dealsTotal: deals.length
    })

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
