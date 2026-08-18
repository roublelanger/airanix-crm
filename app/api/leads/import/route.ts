import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface LeadData {
  name?: string
  email?: string
  company?: string
  phone?: string
  source?: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log('[API LEADS/IMPORT] Received lead:', { name: body.name, email: body.email, source: body.source })

    // Validate required fields
    if (!body.email || !body.name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check for duplicate email
    const { data: existingContact, error: checkError } = await supabase
      .from('contacts')
      .select('id')
      .eq('email', body.email.toLowerCase().trim())
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is what we want
      console.error('[API LEADS/IMPORT] Check error:', checkError)
      throw new Error(`Database check failed: ${checkError.message}`)
    }

    if (existingContact) {
      console.log('[API LEADS/IMPORT] Duplicate email found:', body.email)
      return NextResponse.json(
        {
          success: false,
          message: 'Lead with this email already exists',
          contactId: existingContact.id,
          isDuplicate: true
        },
        { status: 409 }
      )
    }

    // Create new contact
    const { data: newContact, error: createError } = await supabase
      .from('contacts')
      .insert([
        {
          name: body.name.trim(),
          email: body.email.toLowerCase().trim(),
          phone: body.phone ? body.phone.trim() : null,
          company: body.company ? body.company.trim() : null,
          platform: body.source ? body.source.trim() : 'Direct',
          status: 'NEW',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ])
      .select('*')

    if (createError) {
      console.error('[API LEADS/IMPORT] Create error:', createError)
      throw new Error(`Failed to create lead: ${createError.message}`)
    }

    console.log('[API LEADS/IMPORT] Lead created successfully:', newContact[0]?.id)

    return NextResponse.json(
      {
        success: true,
        message: 'Lead imported successfully',
        contactId: newContact[0]?.id,
        contact: newContact[0]
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[API LEADS/IMPORT] Error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to import lead' },
      { status: 500 }
    )
  }
}

// Bulk import endpoint
export async function PUT(request: Request) {
  try {
    const { leads } = await request.json()

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: 'Leads array is required and cannot be empty' },
        { status: 400 }
      )
    }

    console.log('[API LEADS/IMPORT-BULK] Processing', leads.length, 'leads')

    // Validate email format for all
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const validLeads = leads.filter(lead =>
      lead.email &&
      lead.name &&
      emailRegex.test(lead.email)
    )

    const invalidLeads = leads.filter(lead =>
      !lead.email ||
      !lead.name ||
      !emailRegex.test(lead.email)
    )

    console.log('[API LEADS/IMPORT-BULK] Valid:', validLeads.length, 'Invalid:', invalidLeads.length)

    // Get existing emails
    const { data: existingContacts } = await supabase
      .from('contacts')
      .select('email')

    const existingEmails = new Set(
      existingContacts?.map(c => c.email.toLowerCase().trim()) || []
    )

    // Filter out duplicates
    const newLeads = validLeads.filter(
      lead => !existingEmails.has(lead.email.toLowerCase().trim())
    )

    const duplicates = validLeads.filter(
      lead => existingEmails.has(lead.email.toLowerCase().trim())
    )

    console.log('[API LEADS/IMPORT-BULK] New leads:', newLeads.length, 'Duplicates:', duplicates.length)

    // Insert new leads
    let insertedCount = 0
    if (newLeads.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from('contacts')
        .insert(
          newLeads.map(lead => ({
            name: lead.name.trim(),
            email: lead.email.toLowerCase().trim(),
            phone: lead.phone ? lead.phone.trim() : null,
            company: lead.company ? lead.company.trim() : null,
            platform: lead.source ? lead.source.trim() : 'Direct',
            status: 'NEW',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }))
        )
        .select('id')

      if (insertError) {
        throw new Error(`Bulk insert failed: ${insertError.message}`)
      }

      insertedCount = inserted?.length || 0
    }

    return NextResponse.json(
      {
        success: true,
        imported: insertedCount,
        duplicates: duplicates.length,
        invalid: invalidLeads.length,
        total: leads.length,
        message: `Imported ${insertedCount} leads, ${duplicates.length} duplicates, ${invalidLeads.length} invalid`
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[API LEADS/IMPORT-BULK] Error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Bulk import failed' },
      { status: 500 }
    )
  }
}
