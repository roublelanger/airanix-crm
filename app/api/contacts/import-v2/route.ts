import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface ImportContact {
  company_name?: string
  contact_name?: string
  name?: string
  designation?: string
  email?: string
  phone?: string
  location?: string
  industry?: string
  remarks?: string
  assigned_to?: string
  status?: string
}

interface ImportResult {
  success: boolean
  imported: number
  failed: number
  total: number
  errors: Array<{ row: number; error: string }>
  summary: {
    companiesCreated: number
    contactsAdded: number
    skipped: number
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contacts } = body

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'Invalid contacts data' }, { status: 400 })
    }

    const errors: Array<{ row: number; error: string }> = []
    const validatedContacts: any[] = []
    const companyMap = new Map<string, string>() // company name -> id
    let companiesCreated = 0
    let contactsAdded = 0
    let skipped = 0

    // Step 1: Validate and normalize data
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i]
      const contactName = (contact.contact_name || contact.name)?.trim()
      const email = contact.email?.trim()?.toLowerCase()
      const companyName = contact.company_name?.trim()

      // Validation
      if (!contactName) {
        errors.push({ row: i + 1, error: 'Contact name is required' })
        skipped++
        continue
      }

      if (!email) {
        errors.push({ row: i + 1, error: 'Email is required' })
        skipped++
        continue
      }

      validatedContacts.push({
        row: i + 1,
        companyName: companyName || 'Unassigned',
        name: contactName,
        designation: contact.designation?.trim() || null,
        email,
        phone: contact.phone?.trim() || null,
        location: contact.location?.trim() || null,
        industry: contact.industry?.trim() || null,
        remarks: contact.remarks?.trim() || null,
        assigned_to: contact.assigned_to?.trim() || null,
        status: (contact.status?.toUpperCase() || 'LEAD').trim()
      })
    }

    if (validatedContacts.length === 0) {
      return NextResponse.json({
        error: 'No valid contacts to import',
        details: errors
      }, { status: 400 })
    }

    // Step 2: Get or create companies
    const uniqueCompanies = [...new Set(validatedContacts.map(c => c.companyName))]

    for (const companyName of uniqueCompanies) {
      if (companyMap.has(companyName)) continue

      // Try to find existing company
      const { data: existing } = await supabase
        .from('companies')
        .select('id')
        .eq('name', companyName)
        .single()

      if (existing) {
        companyMap.set(companyName, existing.id)
      } else {
        // Create new company
        const { data: newCompany, error } = await supabase
          .from('companies')
          .insert([
            {
              id: uuidv4(),
              name: companyName,
              industry: null,
              location: null,
              remarks: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          .select()
          .single()

        if (error) {
          errors.push({ row: 0, error: `Failed to create company "${companyName}": ${error.message}` })
        } else if (newCompany) {
          companyMap.set(companyName, newCompany.id)
          companiesCreated++
        }
      }
    }

    // Step 3: Prepare contacts for insertion
    const contactsToInsert = validatedContacts
      .filter(contact => companyMap.has(contact.companyName))
      .map(contact => ({
        id: uuidv4(),
        company_id: companyMap.get(contact.companyName),
        name: contact.name,
        designation: contact.designation,
        email: contact.email,
        phone: contact.phone,
        location: contact.location,
        industry: contact.industry,
        remarks: contact.remarks,
        assigned_to: contact.assigned_to,
        status: contact.status,
        company: contact.companyName, // Keep for backward compatibility
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

    // Step 4: Batch insert contacts
    if (contactsToInsert.length > 0) {
      const { data: insertedContacts, error: insertError } = await supabase
        .from('contacts')
        .insert(contactsToInsert)
        .select()

      if (insertError) {
        throw insertError
      }

      contactsAdded = insertedContacts?.length || 0
    }

    return NextResponse.json({
      success: true,
      imported: contactsAdded,
      failed: errors.length,
      total: contacts.length,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        companiesCreated,
        contactsAdded,
        skipped
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error importing contacts:', error)
    return NextResponse.json({
      error: error.message || 'Failed to import contacts',
      success: false
    }, { status: 500 })
  }
}
