import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET() {
  try {
    const [contactsRes, dealsRes, leadsRes] = await Promise.all([
      supabase.from('contacts').select('id', { count: 'exact', head: true }),
      supabase.from('deals').select('id', { count: 'exact', head: true }),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('status', 'lead')
    ])

    return Response.json({
      totalContacts: contactsRes.count || 0,
      activeDeal: dealsRes.count || 0,
      newLeads: leadsRes.count || 0,
      conversions: 0
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
