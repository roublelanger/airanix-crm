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

    if (!body.contactId) throw new Error('contactId is required')
    if (!body.type) throw new Error('type is required')

    // Build notes from title and description
    const notes = body.title
      ? `${body.title}: ${body.description || ''}`
      : body.description || 'Activity'

    // Build the insert data
    const insertData: any = {
      contact_id: body.contactId,
      type: body.type,
      notes: notes.trim(),
      outcome: body.outcome || 'pending'
    }

    // Add optional fields based on activity type
    if (body.type === 'call' && body.callDuration) {
      insertData.call_duration = parseInt(body.callDuration) || null
    }

    if (body.type === 'email') {
      insertData.email_opens = parseInt(body.emailOpens) || 0
    }

    if (body.type === 'meeting') {
      if (body.meetingOutcome) {
        insertData.meeting_outcome = body.meetingOutcome
      }
      if (body.meetingDate) {
        insertData.scheduled_date = body.meetingDate
      }
    }

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
