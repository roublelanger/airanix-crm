import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Helper: Generate email from name and company
const generateEmail = (name: string, company: string, index: number): string => {
  const nameClean = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)
  const companyClean = company.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)
  return `${nameClean}_${companyClean}_${index}@temp.local`
}

export async function POST(request: Request) {
  try {
    // Validate request
    if (!request.body) {
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 })
    }

    const body = await request.json()
    const { contacts, forceImport } = body

    if (!contacts) {
      return NextResponse.json({ error: 'Contacts field is required' }, { status: 400 })
    }

    if (!Array.isArray(contacts)) {
      return NextResponse.json({ error: 'Contacts must be an array' }, { status: 400 })
    }

    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts provided' }, { status: 400 })
    }

    if (contacts.length > 5000) {
      return NextResponse.json({ error: 'Maximum 5000 contacts per import' }, { status: 400 })
    }

    const errors: Array<{ row: number; name: string; email: string; error: string }> = []
    const warnings: Array<{ row: number; name: string; message: string }> = []
    const validatedContacts: any[] = []
    const companyMap = new Map<string, string>()
    let companiesCreated = 0
    let contactsAdded = 0
    let skipped = 0
    let generated = 0

    // Step 1: Validate and clean contacts
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i]

      if (!contact || typeof contact !== 'object') {
        errors.push({ row: i + 1, name: 'Unknown', email: 'Unknown', error: 'Invalid contact data' })
        skipped++
        continue
      }

      const contactName = String(contact.contact_name || contact.name || '').trim()
      let email = String(contact.email || '').trim().toLowerCase()
      const companyName = String(contact.company_name || 'Unassigned').trim()

      // Skip rows with no name
      if (!contactName || contactName.length === 0) {
        errors.push({ row: i + 1, name: 'Unknown', email: email || 'N/A', error: 'Contact name is required' })
        skipped++
        continue
      }

      // Handle missing/invalid emails
      if (!email || email === 'na' || email === 'n/a' || !email.includes('@')) {
        if (forceImport) {
          // Generate temporary email if force importing
          email = generateEmail(contactName, companyName, i)
          warnings.push({
            row: i + 1,
            name: contactName,
            message: `Email was missing/invalid (NA). Generated temporary: ${email}`
          })
          generated++
        } else {
          errors.push({
            row: i + 1,
            name: contactName,
            email: email || 'Missing',
            error: `Email is missing or invalid (currently: "${email || 'empty'}")`
          })
          skipped++
          continue
        }
      }

      // Validate length constraints
      if (contactName.length > 255) {
        errors.push({ row: i + 1, name: contactName, email, error: 'Contact name too long (max 255 chars)' })
        skipped++
        continue
      }

      if (email && email.length > 255) {
        errors.push({ row: i + 1, name: contactName, email, error: 'Email too long (max 255 chars)' })
        skipped++
        continue
      }

      validatedContacts.push({
        row: i + 1,
        companyName,
        name: contactName,
        designation: contact.designation?.trim() || null,
        email,
        phone: contact.phone?.trim() || null,
        location: contact.location?.trim() || null,
        industry: contact.industry?.trim() || null,
        remarks: contact.remarks?.trim() || null,
        assigned_to: contact.assigned_to?.trim() || null,
        status: 'NEW'
      })
    }

    console.log(`[IMPORT] Total: ${contacts.length} | Valid: ${validatedContacts.length} | Generated emails: ${generated} | Skipped: ${skipped}`)

    if (validatedContacts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid contacts to import',
          imported: 0,
          failed: contacts.length,
          total: contacts.length,
          errors: errors.slice(0, 20)
        },
        { status: 400 }
      )
    }

    // Step 2: Get or create companies
    const uniqueCompanies = [...new Set(validatedContacts.map(c => c.companyName))].filter(c => c && c.length > 0)

    for (const companyName of uniqueCompanies) {
      try {
        if (companyMap.has(companyName)) continue

        if (!companyName || companyName.length === 0 || companyName.length > 255) {
          errors.push({ row: 0, name: 'Company', email: companyName, error: `Invalid company name: "${companyName}"` })
          continue
        }

        // Find existing company
        const { data: existing, error: existingError } = await supabase
          .from('companies')
          .select('id')
          .eq('name', companyName)
          .maybeSingle()

        if (existingError && existingError.code !== 'PGRST116') {
          throw new Error(`Database error: ${existingError.message}`)
        }

        if (existing) {
          companyMap.set(companyName, existing.id)
          continue
        }

        // Create new company
        const companyId = uuidv4()
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert([
            {
              id: companyId,
              name: companyName,
              industry: null,
              location: null,
              remarks: null
            }
          ])
          .select('id')
          .single()

        if (createError) {
          if (createError.message.includes('unique')) {
            const { data: retryExisting } = await supabase
              .from('companies')
              .select('id')
              .eq('name', companyName)
              .maybeSingle()

            if (retryExisting) {
              companyMap.set(companyName, retryExisting.id)
            } else {
              errors.push({ row: 0, name: 'Company', email: companyName, error: `Failed to create company "${companyName}"` })
            }
          } else {
            errors.push({ row: 0, name: 'Company', email: companyName, error: `Failed to create company "${companyName}"` })
          }
        } else if (newCompany) {
          companyMap.set(companyName, newCompany.id)
          companiesCreated++
        }
      } catch (error: any) {
        errors.push({ row: 0, name: 'Company', email: companyName, error: `Company error: ${error.message}` })
      }
    }

    // Step 3: Prepare contacts for insertion
    const contactsToInsert = validatedContacts
      .map(contact => {
        const companyId = companyMap.get(contact.companyName)
        if (!companyId) {
          errors.push({ row: contact.row, name: contact.name, email: contact.email, error: `Company not found: ${contact.companyName}` })
          return null
        }

        return {
          id: uuidv4(),
          company_id: companyId,
          name: contact.name,
          designation: contact.designation,
          email: contact.email,
          phone: contact.phone,
          location: contact.location,
          industry: contact.industry,
          remarks: contact.remarks,
          assigned_to: contact.assigned_to,
          status: contact.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
      .filter((c): c is any => c !== null)

    // Step 4: Insert contacts
    if (contactsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('contacts')
        .insert(contactsToInsert)

      if (insertError) {
        throw new Error(`Insert failed: ${insertError.message}`)
      }

      contactsAdded = contactsToInsert.length
    }

    return NextResponse.json(
      {
        success: true,
        imported: contactsAdded,
        failed: errors.length,
        total: contacts.length,
        errors: errors.length > 0 ? errors.slice(0, 50) : undefined,
        warnings: warnings.length > 0 ? warnings.slice(0, 20) : undefined,
        summary: {
          companiesCreated,
          contactsAdded,
          skipped,
          generatedEmails: generated,
          totalWarnings: warnings.length,
          totalErrors: errors.length
        },
        details: {
          message: `✅ Imported: ${contactsAdded} | ⚠️ Generated emails: ${generated} | ❌ Skipped: ${skipped}`,
          actionTaken: generated > 0 ? `Generated temporary emails for ${generated} contacts missing email. You can update these later.` : ''
        }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to import contacts',
        success: false
      },
      { status: 500 }
    )
  }
}
