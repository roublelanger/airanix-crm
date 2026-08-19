import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface Contact {
  contact_name?: string
  name?: string
  email?: string
  company_name?: string
  company?: string
  phone?: string
  designation?: string
  title?: string
  location?: string
  city?: string
  industry?: string
  remarks?: string
  notes?: string
  assigned_to?: string
  assigned?: string
}

interface ValidationResult {
  valid: boolean
  name: string
  email: string
  company: string
  phone: string | null
  designation: string | null
  location: string | null
  industry: string | null
  remarks: string | null
  assigned_to: string | null
  error?: string
}

// Validate and normalize a contact
function validateContact(contact: Contact, index: number): ValidationResult {
  const name = String(contact.contact_name || contact.name || '').trim()
  let email = String(contact.email || '').trim().toLowerCase()
  const company = String(contact.company_name || contact.company || 'Unassigned').trim()

  // Validate name (required)
  if (!name || name.length === 0) {
    return { valid: false, name: 'Unknown', email, company, phone: null, designation: null, location: null, industry: null, remarks: null, assigned_to: null, error: 'Name is required' }
  }

  // Handle missing/invalid emails
  if (!email || email === 'na' || email === 'n/a' || email.length === 0) {
    email = `auto_${uuidv4().substring(0, 8)}@temp.local`
  } else if (!email.includes('@') || !email.includes('.')) {
    email = `auto_${uuidv4().substring(0, 8)}@temp.local`
  }

  // Length validation
  if (name.length > 255) {
    return { valid: false, name, email, company, phone: null, designation: null, location: null, industry: null, remarks: null, assigned_to: null, error: 'Name too long (max 255)' }
  }

  return {
    valid: true,
    name,
    email,
    company,
    phone: contact.phone ? String(contact.phone).trim() : null,
    designation: contact.designation || contact.title ? String(contact.designation || contact.title).trim() : null,
    location: contact.location || contact.city ? String(contact.location || contact.city).trim() : null,
    industry: contact.industry ? String(contact.industry).trim() : null,
    remarks: contact.remarks || contact.notes ? String(contact.remarks || contact.notes).trim() : null,
    assigned_to: contact.assigned_to || contact.assigned ? String(contact.assigned_to || contact.assigned).trim() : null
  }
}

export async function POST(request: Request) {
  const startTime = Date.now()
  const correlationId = uuidv4()

  console.log(`[IMPORT-${correlationId}] Starting import request`)

  try {
    const body = await request.json()
    const { contacts } = body

    // Validate input
    if (!contacts || !Array.isArray(contacts)) {
      console.log(`[IMPORT-${correlationId}] Invalid input: contacts not array`)
      return NextResponse.json(
        { success: false, error: 'Invalid input: contacts must be an array' },
        { status: 400 }
      )
    }

    if (contacts.length === 0) {
      console.log(`[IMPORT-${correlationId}] Empty contacts array`)
      return NextResponse.json(
        { success: false, error: 'No contacts provided' },
        { status: 400 }
      )
    }

    if (contacts.length > 5000) {
      console.log(`[IMPORT-${correlationId}] Too many contacts: ${contacts.length}`)
      return NextResponse.json(
        { success: false, error: 'Maximum 5000 contacts per import' },
        { status: 400 }
      )
    }

    console.log(`[IMPORT-${correlationId}] Processing ${contacts.length} contacts`)

    // Step 1: Validate all contacts
    const validationErrors: any[] = []
    const validContacts: ValidationResult[] = []

    contacts.forEach((contact: Contact, index: number) => {
      const result = validateContact(contact, index)
      if (result.valid) {
        validContacts.push(result)
      } else {
        validationErrors.push({
          row: index + 1,
          name: contact.contact_name || contact.name || 'Unknown',
          email: contact.email || 'Unknown',
          error: result.error
        })
      }
    })

    console.log(`[IMPORT-${correlationId}] Validation complete: ${validContacts.length} valid, ${validationErrors.length} invalid`)

    if (validContacts.length === 0) {
      console.log(`[IMPORT-${correlationId}] No valid contacts after validation`)
      return NextResponse.json(
        {
          success: false,
          error: 'No valid contacts to import',
          imported: 0,
          failed: contacts.length,
          validationErrors: validationErrors.slice(0, 10)
        },
        { status: 400 }
      )
    }

    // Step 2: Prepare contact records for insertion
    const contactsToInsert = validContacts.map(contact => ({
      id: uuidv4(),
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      designation: contact.designation,
      location: contact.location,
      industry: contact.industry,
      remarks: contact.remarks,
      assigned_to: contact.assigned_to,
      status: 'NEW',
      company_id: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))

    console.log(`[IMPORT-${correlationId}] Prepared ${contactsToInsert.length} records for insertion`)

    // Step 3: Batch insert (in chunks of 100)
    let imported = 0
    let insertErrors: any[] = []
    const chunkSize = 100

    for (let i = 0; i < contactsToInsert.length; i += chunkSize) {
      const chunk = contactsToInsert.slice(i, i + chunkSize)
      const chunkNumber = Math.floor(i / chunkSize) + 1

      console.log(`[IMPORT-${correlationId}] Inserting chunk ${chunkNumber} (${chunk.length} contacts)`)

      const { data, error } = await supabase
        .from('contacts')
        .insert(chunk)
        .select('id')

      if (error) {
        console.error(`[IMPORT-${correlationId}] Chunk ${chunkNumber} failed:`, error.message)
        insertErrors.push({
          chunk: chunkNumber,
          error: error.message,
          count: chunk.length
        })
      } else {
        const count = data?.length || 0
        imported += count
        console.log(`[IMPORT-${correlationId}] Chunk ${chunkNumber} inserted: ${count} contacts`)
      }
    }

    const duration = Date.now() - startTime
    console.log(`[IMPORT-${correlationId}] Import complete in ${duration}ms: ${imported} imported, ${validationErrors.length} validation errors, ${insertErrors.length} insert errors`)

    return NextResponse.json({
      success: true,
      correlationId,
      imported,
      failed: validationErrors.length + insertErrors.length,
      total: contacts.length,
      duration,
      summary: {
        requested: contacts.length,
        valid: validContacts.length,
        imported,
        validationErrors: validationErrors.length,
        insertErrors: insertErrors.length,
        autoGeneratedEmails: validContacts.filter(c => c.email.includes('temp.local')).length
      },
      errors: validationErrors.length > 0 ? validationErrors.slice(0, 20) : undefined,
      details: {
        timestamp: new Date().toISOString(),
        message: `Successfully imported ${imported} of ${validContacts.length} valid contacts in ${duration}ms`
      }
    }, { status: 201 })

  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error(`[IMPORT-${correlationId}] Fatal error in ${duration}ms:`, error.message)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Import failed',
        correlationId,
        duration
      },
      { status: 500 }
    )
  }
}
