import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Google Sheets API - for reading leads from shared sheet
const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY || ''
const SHEET_ID = process.env.GOOGLE_SHEET_ID || ''

// Hunter.io API - for email verification
const HUNTER_API_KEY = process.env.HUNTER_API_KEY || ''

interface LeadRow {
  name: string
  company: string
  designation: string
  email?: string
  phone?: string
  linkedin_url?: string
  company_size?: string
}

async function verifyEmailWithHunter(email: string, domain: string): Promise<{ email: string; confidence: number }> {
  if (!HUNTER_API_KEY) {
    return { email, confidence: 0 }
  }

  try {
    const response = await fetch(`https://api.hunter.io/v2/email-verifier?domain=${domain}&email=${email}&domain=${domain}`, {
      headers: { Authorization: `Bearer ${HUNTER_API_KEY}` }
    })
    const data = await response.json()

    return {
      email: data.data?.email || email,
      confidence: data.data?.result === 'deliverable' ? 90 : 40
    }
  } catch (error) {
    console.error('[CRON] Hunter.io verification failed:', error)
    return { email, confidence: 0 }
  }
}

async function getLeadsFromGoogleSheets(): Promise<LeadRow[]> {
  if (!SHEET_ID || !GOOGLE_SHEETS_API_KEY) {
    console.warn('[CRON] Google Sheets not configured, using mock data')
    return []
  }

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Leads?key=${GOOGLE_SHEETS_API_KEY}`
    )
    const data = await response.json()

    if (!data.values || data.values.length < 2) {
      return []
    }

    // Skip header row
    const leads: LeadRow[] = data.values.slice(1).map((row: string[]) => ({
      name: row[0]?.trim() || '',
      company: row[1]?.trim() || '',
      designation: row[2]?.trim() || '',
      email: row[3]?.trim() || '',
      phone: row[4]?.trim() || '',
      linkedin_url: row[5]?.trim() || '',
      company_size: row[6]?.trim() || ''
    }))

    console.log(`[CRON] Fetched ${leads.length} leads from Google Sheets`)
    return leads.filter(l => l.email && l.name)
  } catch (error) {
    console.error('[CRON] Error fetching from Google Sheets:', error)
    return []
  }
}

export async function GET(request: Request) {
  try {
    // Verify it's a cron request from Vercel
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[CRON] Daily lead import started at', new Date().toISOString())

    // Step 1: Get leads from Google Sheets
    const sheetsLeads = await getLeadsFromGoogleSheets()

    if (sheetsLeads.length === 0) {
      console.log('[CRON] No leads found in Google Sheets')
      return NextResponse.json({
        success: true,
        message: 'No new leads to import',
        imported: 0,
        duplicates: 0,
        failed: 0
      })
    }

    // Step 2: Get existing emails from CRM
    const { data: existingContacts } = await supabase
      .from('contacts')
      .select('email')

    const existingEmails = new Set(
      existingContacts?.map(c => c.email.toLowerCase().trim()) || []
    )

    // Step 3: Filter duplicates and prepare for import
    const newLeads = sheetsLeads.filter(
      lead => !existingEmails.has(lead.email.toLowerCase().trim())
    )

    console.log(
      `[CRON] Found ${newLeads.length} new leads (${sheetsLeads.length - newLeads.length} duplicates)`
    )

    // Step 4: Verify emails with Hunter.io (if configured)
    const verifiedLeads = await Promise.all(
      newLeads.map(async (lead) => {
        const domain = lead.email.split('@')[1]
        const verification = await verifyEmailWithHunter(lead.email, domain)

        return {
          name: lead.name,
          email: lead.email.toLowerCase().trim(),
          phone: lead.phone || null,
          company: lead.company || null,
          designation: lead.designation || null,
          platform: 'LinkedIn',
          status: 'NEW',
          email_verified: verification.confidence > 70,
          email_confidence: verification.confidence,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
    )

    // Step 5: Filter only high-confidence emails
    const highConfidenceLeads = verifiedLeads.filter(
      lead => lead.email_confidence > 60
    )

    console.log(
      `[CRON] ${highConfidenceLeads.length} leads passed verification (${verifiedLeads.length - highConfidenceLeads.length} low confidence)`
    )

    // Step 6: Bulk insert to CRM
    let imported = 0
    let failed = 0

    if (highConfidenceLeads.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from('contacts')
        .insert(highConfidenceLeads)
        .select('id')

      if (insertError) {
        console.error('[CRON] Insert error:', insertError)
        failed = highConfidenceLeads.length
      } else {
        imported = inserted?.length || 0
      }
    }

    console.log(
      `[CRON] Import complete - Imported: ${imported}, Failed: ${failed}, Duplicates: ${sheetsLeads.length - newLeads.length}`
    )

    // Step 7: Send email report (optional)
    if (process.env.CRON_EMAIL_REPORT) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/cron/send-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            total: sheetsLeads.length,
            imported,
            duplicates: sheetsLeads.length - newLeads.length,
            failed
          })
        })
      } catch (error) {
        console.error('[CRON] Error sending report:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${imported} leads successfully`,
      stats: {
        total_found: sheetsLeads.length,
        imported,
        duplicates: sheetsLeads.length - newLeads.length,
        failed,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('[CRON] Fatal error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Cron job failed' },
      { status: 500 }
    )
  }
}
