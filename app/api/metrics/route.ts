import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET() {
  try {
    // Fetch all contacts directly to get accurate count
    const contactsRes = await supabase.from('contacts').select('id, status')
    const dealsRes = await supabase.from('deals').select('id', { count: 'exact', head: true })

    const contacts = contactsRes.data || []
    const totalContacts = contacts.length
    const newLeads = contacts.filter(c => c.status === 'LEAD').length

    return Response.json({
      totalContacts,
      activeDeal: dealsRes.count || 0,
      newLeads,
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
