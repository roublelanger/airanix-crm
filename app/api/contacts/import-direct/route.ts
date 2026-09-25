import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contacts } = body

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts provided' }, { status: 400 })
    }

    console.log(`[DIRECT-IMPORT] Starting import of ${contacts.length} contacts`)

    let imported = 0
    let failed = 0
    const errors: any[] = []

    // Process each contact
    const contactsToInsert = contacts
      .map((c: any, idx: number) => {
        const name = String(c.contact_name || c.name || `Contact ${idx + 1}`).trim()
        let email = String(c.email || '').trim().toLowerCase()
        const company = String(c.company_name || c.company || 'Unassigned').trim()

        // Generate email if missing
        if (!email || email === 'na' || email === 'n/a') {
          email = `contact_${idx + 1}_${Date.now()}@temp.local`
        }

        // Ensure email has @ and .
        if (!email.includes('@')) {
          email = `contact_${idx + 1}@temp.local`
        }

        return {
          id: uuidv4(),
          name,
          email,
          phone: c.phone ? String(c.phone).trim() : null,
          company: company,
          designation: c.designation ? String(c.designation).trim() : null,
          location: c.location ? String(c.location).trim() : null,
          industry: c.industry ? String(c.industry).trim() : null,
          remarks: c.remarks ? String(c.remarks).trim() : null,
          assigned_to: c.assigned_to ? String(c.assigned_to).trim() : null,
          status: 'NEW',
          company_id: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Not persisted onto the contacts row - carried through only to
          // build the matching interactions record below, so an imported
          // call shows up on the Activity Timeline with who made it.
          calledBy: c.calledBy ? String(c.calledBy).trim() : '',
          callNotes: c.callNotes ? String(c.callNotes).trim() : ''
        }
      })
      .filter((c: any) => c && c.name && c.email)

    console.log(`[DIRECT-IMPORT] Prepared ${contactsToInsert.length} contacts for insertion`)

    if (contactsToInsert.length === 0) {
      return NextResponse.json(
        { error: 'No valid contacts after processing', success: false },
        { status: 400 }
      )
    }

    // Batch insert (in chunks of 100)
    const chunkSize = 100
    for (let i = 0; i < contactsToInsert.length; i += chunkSize) {
      const chunk = contactsToInsert.slice(i, i + chunkSize)
      console.log(`[DIRECT-IMPORT] Inserting chunk ${Math.floor(i / chunkSize) + 1} (${chunk.length} contacts)`)

      // calledBy/callNotes aren't real columns on `contacts` - strip them
      // before inserting, but keep the full chunk (with ids) around to
      // build the interactions rows below.
      const contactRows = chunk.map(({ calledBy, callNotes, ...rest }: any) => rest)

      const { data, error } = await supabase
        .from('contacts')
        .insert(contactRows)
        .select('id')

      if (error) {
        console.error(`[DIRECT-IMPORT] Chunk insert error:`, error.message)
        failed += chunk.length
        errors.push({
          chunk: Math.floor(i / chunkSize) + 1,
          error: error.message,
          count: chunk.length
        })
        continue
      }

      imported += data?.length || 0
      console.log(`[DIRECT-IMPORT] Chunk inserted: ${data?.length || 0} contacts`)

      // For every contact that came with call info from the sheet, log it
      // as an activity so the Activity Timeline isn't empty and shows who
      // made the call. Uses a distinct type ('imported-call') kept out of
      // the Calls-by-ISR report's CALL_TYPES allow-list on purpose, so
      // historical imported calls don't inflate daily call-volume numbers.
      const interactionRows = chunk
        .filter((c: any) => c.remarks || c.callNotes)
        .map((c: any) => ({
          contact_id: c.id,
          type: 'imported-call',
          notes: [c.remarks, c.callNotes].filter(Boolean).join(' — '),
          created_by_name: c.calledBy || 'Unknown',
          created_at: c.createdAt
        }))

      if (interactionRows.length > 0) {
        const { error: interactionError } = await supabase
          .from('interactions')
          .insert(interactionRows)

        if (interactionError) {
          console.error(`[DIRECT-IMPORT] Interaction insert error:`, interactionError.message)
        }
      }
    }

    console.log(`[DIRECT-IMPORT] Import complete: ${imported} imported, ${failed} failed`)

    return NextResponse.json({
      success: true,
      message: `✅ Direct import completed`,
      imported,
      failed,
      total: contacts.length,
      processed: contactsToInsert.length,
      summary: {
        requested: contacts.length,
        prepared: contactsToInsert.length,
        imported,
        failed,
        generatedEmails: contactsToInsert.filter((c: any) => c.email.includes('temp.local')).length
      },
      errors: errors.length > 0 ? errors : undefined,
      details: {
        timestamp: new Date().toISOString(),
        message: `${imported} of ${contactsToInsert.length} contacts inserted successfully`
      }
    })
  } catch (error: any) {
    console.error('[DIRECT-IMPORT] Fatal error:', error)
    return NextResponse.json(
      { error: error.message || 'Import failed', success: false },
      { status: 500 }
    )
  }
}
