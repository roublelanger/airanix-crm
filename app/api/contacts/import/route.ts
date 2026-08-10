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

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'Invalid contacts data' }, { status: 400 })
    }

    // Validate and prepare contacts
    const validatedContacts = contacts
      .filter(contact => contact.name && contact.email)
      .map(contact => ({
        id: uuidv4(),
        name: contact.name?.trim() || '',
        email: contact.email?.trim()?.toLowerCase() || '',
        phone: contact.phone?.trim() || '',
        company: contact.company?.trim() || '',
        status: (contact.status?.toUpperCase() || 'LEAD') as string,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))

    if (validatedContacts.length === 0) {
      return NextResponse.json({ error: 'No valid contacts to import' }, { status: 400 })
    }

    // Insert into database
    const { data, error } = await supabase
      .from('contacts')
      .insert(validatedContacts)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      imported: data.length,
      total: contacts.length,
      skipped: contacts.length - data.length
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error importing contacts:', error)
    return NextResponse.json({ error: error.message || 'Failed to import contacts' }, { status: 500 })
  }
}
