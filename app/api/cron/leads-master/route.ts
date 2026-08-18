import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// API Keys from environment
const APOLLO_API_KEY = process.env.APOLLO_API_KEY || ''
const CLEARBIT_API_KEY = process.env.CLEARBIT_API_KEY || ''
const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY || ''
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID || ''
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const CRON_SECRET = process.env.CRON_SECRET || ''

interface Lead {
  name: string
  email: string
  company?: string
  phone?: string
  designation?: string
  source: 'google-forms' | 'linkedin' | 'apollo' | 'manual'
  company_size?: string
}

interface EnrichedLead extends Lead {
  email_verified: boolean
  email_confidence: number
  company_verified: boolean
  quality_score: number
  enriched_data?: any
}

// 1. FETCH FROM GOOGLE FORMS (Google Sheets)
async function fetchGoogleFormsLeads(): Promise<Lead[]> {
  if (!GOOGLE_SHEET_ID || !GOOGLE_SHEETS_API_KEY) {
    console.log('[MASTER-CRON] Google Sheets not configured')
    return []
  }

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Leads?key=${GOOGLE_SHEETS_API_KEY}`
    )
    const data = await response.json()

    if (!data.values || data.values.length < 2) {
      return []
    }

    const leads: Lead[] = data.values.slice(1).map((row: string[]) => ({
      name: row[0]?.trim() || '',
      email: row[1]?.trim() || '',
      company: row[2]?.trim() || '',
      phone: row[3]?.trim() || '',
      designation: row[4]?.trim() || '',
      company_size: row[5]?.trim() || '',
      source: 'google-forms'
    }))

    console.log(`[MASTER-CRON] Fetched ${leads.length} leads from Google Forms`)
    return leads.filter(l => l.email && l.name)
  } catch (error) {
    console.error('[MASTER-CRON] Error fetching Google Forms:', error)
    return []
  }
}

// 2. FETCH FROM LINKEDIN (Google Sheets)
async function fetchLinkedInLeads(): Promise<Lead[]> {
  if (!GOOGLE_SHEET_ID || !GOOGLE_SHEETS_API_KEY) {
    return []
  }

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/LinkedIn?key=${GOOGLE_SHEETS_API_KEY}`
    )
    const data = await response.json()

    if (!data.values || data.values.length < 2) {
      return []
    }

    const leads: Lead[] = data.values.slice(1).map((row: string[]) => ({
      name: row[0]?.trim() || '',
      email: row[1]?.trim() || '',
      company: row[2]?.trim() || '',
      phone: row[3]?.trim() || '',
      designation: row[4]?.trim() || '',
      company_size: row[5]?.trim() || '',
      source: 'linkedin'
    }))

    console.log(`[MASTER-CRON] Fetched ${leads.length} leads from LinkedIn`)
    return leads.filter(l => l.email && l.name)
  } catch (error) {
    console.error('[MASTER-CRON] Error fetching LinkedIn:', error)
    return []
  }
}

// 3. FETCH FROM APOLLO.IO (Verified Leads)
async function fetchApolloLeads(): Promise<Lead[]> {
  if (!APOLLO_API_KEY) {
    console.log('[MASTER-CRON] Apollo.io not configured')
    return []
  }

  try {
    // Apollo.io API to search for potential leads
    // Using common search filters for B2B
    const response = await fetch('https://api.apollo.io/v1/contacts/search', {
      method: 'POST',
      headers: {
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        employment_status: ['employed'],
        organization_locations: ['India'],
        limit: 100,
        sort_by: 'contact_grade'
      })
    })

    const data = await response.json()

    if (!data.contacts) {
      return []
    }

    const leads: Lead[] = data.contacts.map((contact: any) => ({
      name: `${contact.first_name} ${contact.last_name}`.trim(),
      email: contact.email,
      company: contact.organization?.name || '',
      phone: contact.phone_numbers?.[0]?.number || '',
      designation: contact.title || '',
      company_size: contact.organization?.num_employees?.toString() || '',
      source: 'apollo'
    }))

    console.log(`[MASTER-CRON] Fetched ${leads.length} leads from Apollo.io`)
    return leads
  } catch (error) {
    console.error('[MASTER-CRON] Error fetching Apollo.io:', error)
    return []
  }
}

// 4. ENRICH WITH CLEARBIT
async function enrichWithClearbit(lead: Lead): Promise<EnrichedLead> {
  const enriched: EnrichedLead = {
    ...lead,
    email_verified: true,
    email_confidence: 85,
    company_verified: false,
    quality_score: 7
  }

  if (!CLEARBIT_API_KEY || !lead.company) {
    return enriched
  }

  try {
    const response = await fetch(`https://company.clearbit.com/v1/companies/find?domain=${lead.company}`, {
      headers: { Authorization: `Bearer ${CLEARBIT_API_KEY}` }
    })

    if (response.ok) {
      const data = await response.json()
      enriched.enriched_data = {
        company_name: data.company.name,
        industry: data.company.category.industry,
        employees: data.company.metrics.employees,
        annual_revenue: data.company.metrics.annualRevenue,
        tech_stack: data.company.tech,
        website: data.company.website,
        founded: data.company.founded.year
      }
      enriched.company_verified = true
    }
  } catch (error) {
    // Clearbit error - continue with unverified data
  }

  return enriched
}

// 5. AI QUALIFICATION (ChatGPT/Claude)
async function qualifyLeadWithAI(lead: EnrichedLead): Promise<number> {
  if (!OPENAI_API_KEY) {
    return 5 // Default score if no AI configured
  }

  try {
    const prompt = `Score this B2B SaaS lead for CRM software (1-10 scale).

Lead Details:
- Name: ${lead.name}
- Title: ${lead.designation}
- Company: ${lead.company}
- Company Size: ${lead.company_size}
- Industry: ${lead.enriched_data?.industry || 'Unknown'}
- Source: ${lead.source}

Scoring Criteria:
- Decision maker roles (CEO, CTO, VP Sales, etc): +3
- Company size (100-5000 employees): +2
- Tech/SaaS industry: +2
- Verified email/phone: +1
- Recent activity: +2

Return ONLY a number 1-10, nothing else.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10
      })
    })

    const data = await response.json()
    const score = parseInt(data.choices[0]?.message?.content?.trim() || '5')
    return Math.min(10, Math.max(1, score))
  } catch (error) {
    console.error('[MASTER-CRON] AI qualification error:', error)
    return 5
  }
}

// MAIN CRON JOB
export async function GET(request: Request) {
  try {
    // Verify cron authorization
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[MASTER-CRON] Starting complete lead import at', new Date().toISOString())

    // Step 1: Collect leads from ALL sources
    const [googleFormsLeads, linkedInLeads, apolloLeads] = await Promise.all([
      fetchGoogleFormsLeads(),
      fetchLinkedInLeads(),
      fetchApolloLeads()
    ])

    const allLeads = [...googleFormsLeads, ...linkedInLeads, ...apolloLeads]
    console.log(`[MASTER-CRON] Total leads collected: ${allLeads.length}`)

    if (allLeads.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new leads to import',
        stats: { imported: 0, duplicates: 0, failed: 0, total: 0 }
      })
    }

    // Step 2: Get existing emails
    const { data: existingContacts } = await supabase
      .from('contacts')
      .select('email')

    const existingEmails = new Set(
      existingContacts?.map(c => c.email.toLowerCase().trim()) || []
    )

    // Step 3: Remove duplicates
    const newLeads = allLeads.filter(
      lead => !existingEmails.has(lead.email.toLowerCase().trim())
    )

    console.log(`[MASTER-CRON] Found ${newLeads.length} new leads (${allLeads.length - newLeads.length} duplicates)`)

    // Step 4: Enrich and qualify all leads
    const enrichedLeads = await Promise.all(
      newLeads.map(async (lead) => {
        const enriched = await enrichWithClearbit(lead)
        const score = await qualifyLeadWithAI(enriched)
        enriched.quality_score = score
        return enriched
      })
    )

    // Step 5: Filter high-quality leads (score > 5)
    const qualityLeads = enrichedLeads.filter(lead => lead.quality_score > 5)

    console.log(
      `[MASTER-CRON] ${qualityLeads.length} leads passed quality threshold (${enrichedLeads.length - qualityLeads.length} low quality)`
    )

    // Step 6: Prepare for import
    const leadsToImport = qualityLeads.map(lead => ({
      name: lead.name,
      email: lead.email.toLowerCase().trim(),
      phone: lead.phone || null,
      company: lead.company || null,
      designation: lead.designation || null,
      platform: lead.source,
      status: 'NEW',
      email_verified: lead.email_verified,
      email_confidence: lead.email_confidence,
      company_verified: lead.company_verified,
      quality_score: lead.quality_score,
      enriched_data: lead.enriched_data ? JSON.stringify(lead.enriched_data) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))

    // Step 7: Bulk insert
    let imported = 0
    let failed = 0

    if (leadsToImport.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from('contacts')
        .insert(leadsToImport)
        .select('id')

      if (insertError) {
        console.error('[MASTER-CRON] Insert error:', insertError)
        failed = leadsToImport.length
      } else {
        imported = inserted?.length || 0
      }
    }

    console.log(
      `[MASTER-CRON] Import complete - Imported: ${imported}, Failed: ${failed}, Duplicates: ${allLeads.length - newLeads.length}`
    )

    return NextResponse.json({
      success: true,
      message: `Imported ${imported} qualified leads`,
      stats: {
        total_found: allLeads.length,
        google_forms: googleFormsLeads.length,
        linkedin: linkedInLeads.length,
        apollo: apolloLeads.length,
        new_leads: newLeads.length,
        qualified: qualityLeads.length,
        imported,
        duplicates: allLeads.length - newLeads.length,
        failed,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('[MASTER-CRON] Fatal error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Cron job failed' },
      { status: 500 }
    )
  }
}
