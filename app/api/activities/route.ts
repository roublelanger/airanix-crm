import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get('contactId')

    let query = supabase.from('interactions').select('*')

    if (contactId) {
      query = query.eq('contact_id', contactId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('GET error:', error)
      throw error
    }

    // Transform data to match expected format
    const transformedData = (data || []).map((activity: any) => ({
      id: activity.id,
      type: activity.type,
      title: activity.notes?.split(':')[0] || activity.type,
      description: activity.notes || '',
      outcome: activity.outcome || 'pending',
      contact_id: activity.contact_id,
      created_at: activity.created_at,
      updated_at: activity.updated_at
    }))

    return NextResponse.json(transformedData)
  } catch (error: any) {
    console.error('GET /api/activities error:', {
      message: error.message,
      code: error.code
    })
    return NextResponse.json({ error: error.message || 'Failed to fetch activities' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.type) throw new Error('type is required')

    // Validate contactId if provided - should be a UUID
    if (body.contactId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(body.contactId)) {
        throw new Error('Invalid contact ID format. Contact ID must be a valid UUID.')
      }
    }

    // Build notes from title and description
    const notes = body.title
      ? `${body.title}: ${body.description || ''}`
      : body.description || 'Activity'

    // Build the insert data - only use columns that exist in interactions table
    // The interactions table has: id, contact_id, type, notes, created_at, updated_at, created_by, scheduled_date, completed_date
    const insertData: any = {
      type: body.type,
      notes: notes.trim()
    }

    // Only add contact_id if provided and valid
    if (body.contactId) {
      insertData.contact_id = body.contactId
    }

    // Note: outcome, call_duration, email_opens, and meeting_outcome are stored in the notes field
    // because the interactions table doesn't have separate columns for these

    console.log('Inserting activity:', insertData)

    const { data, error } = await supabase
      .from('interactions')
      .insert([insertData])
      .select('*')

    if (error) {
      console.error('Supabase insert error:', {
        message: error.message,
        code: error.code,
        details: error.details
      })
      throw error
    }

    console.log('Activity saved successfully:', data?.[0]?.id)

    return NextResponse.json({
      success: true,
      activity: data?.[0] || insertData
    }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/activities error:', {
      message: error.message,
      code: error.code,
      details: error.details
    })
    return NextResponse.json(
      { error: error.message || 'Failed to save activity' },
      { status: 500 }
    )
  }
}
