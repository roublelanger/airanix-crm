import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contactId, templateId, templateName, subject, description } = body

    if (!contactId || !templateId || !templateName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Log as an activity
    const { data, error } = await supabase
      .from('activities')
      .insert([
        {
          contact_id: contactId,
          type: 'email',
          title: `Email Sent: ${templateName}`,
          description: `Template: ${templateName}\nSubject: ${subject}\n\n${description || 'No additional notes'}`,
          outcome: 'completed'
        }
      ])
      .select('*')

    if (error) throw error

    return NextResponse.json({ success: true, activity: data[0] }, { status: 201 })
  } catch (error: any) {
    console.error('Error logging email activity:', error)
    return NextResponse.json({ error: error.message || 'Failed to log email activity' }, { status: 500 })
  }
}
