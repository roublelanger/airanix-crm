import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get('contact_id')

    console.log(`[ACTIVITIES] GET request - contact_id: ${contactId || 'none (fetch all)'}`)

    // Filter by contact_id in the actual SQL query instead of fetching the
    // entire interactions table and filtering in JavaScript. The old
    // approach meant every single-contact lookup re-downloaded and scanned
    // the whole table - measured at ~1.1s per call regardless of match
    // count, and the Contacts list page was firing one of these PER
    // CONTACT (684 calls on a full page load) to build activity previews.
    let query = supabase
      .from('interactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (contactId) {
      query = query.eq('contact_id', contactId)
    }

    const { data, error } = await query

    if (error) {
      console.error('[ACTIVITIES] Supabase error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    const count = (data || []).length
    console.log(`[ACTIVITIES] Returning ${count} activities${contactId ? ` for contact ${contactId}` : ''}`)

    // Format response with ISR names and formatted timestamps
    const formattedActivities = (data || []).map((activity: any) => ({
      id: activity.id,
      contactId: activity.contact_id,
      type: activity.type || 'note',
      title: activity.notes?.substring(0, 50) || activity.description?.substring(0, 50) || 'Activity',
      description: activity.notes || activity.description,
      createdBy: {
        id: activity.created_by,
        name: activity.created_by_name || 'Unknown User',
        initials: (activity.created_by_name || 'U')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
      },
      createdAt: activity.created_at,
      createdAtFormatted: formatDateTime(activity.created_at),
      updatedAt: activity.updated_at
    }))

    return NextResponse.json({
      success: true,
      data: formattedActivities,
      pagination: {
        total: count || 0,
        hasMore: false
      }
    })
  } catch (error: any) {
    console.error('[ACTIVITIES] Catch error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
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

    // Build notes - use description as-is (no duplication with title)
    const notes = body.description || 'Activity'

    // Build the insert data - only use columns that exist in interactions table
    // The interactions table has: id, contact_id, type, notes, created_at, updated_at, created_by, created_by_name, scheduled_date, completed_date
    const insertData: any = {
      type: body.type,
      notes: notes.trim()
    }

    // Only add contact_id if provided and valid
    if (body.contactId) {
      insertData.contact_id = body.contactId
    }

    // Capture user attribution (client sends current user info)
    if (body.userId) {
      insertData.created_by = body.userId
    }
    if (body.userName) {
      insertData.created_by_name = body.userName
    }

    // Note: outcome, call_duration, email_opens, and meeting_outcome are stored in the notes field
    // because the interactions table doesn't have separate columns for these

    console.log('[ACTIVITIES POST] Inserting activity:', JSON.stringify(insertData, null, 2))

    const { data, error } = await supabase
      .from('interactions')
      .insert([insertData])
      .select('*')

    console.log('[ACTIVITIES POST] Insert result:', { insertedData: data?.[0], error })

    if (error) {
      console.error('Supabase insert error:', {
        message: error.message,
        code: error.code,
        details: error.details
      })
      throw error
    }

    console.log('Activity saved successfully:', data?.[0]?.id)

    // Format the response the same way as GET endpoint
    const activity = data?.[0]
    const formattedActivity = activity ? {
      id: activity.id,
      contactId: activity.contact_id,
      type: activity.type || 'note',
      title: activity.notes?.substring(0, 50) || activity.description?.substring(0, 50) || 'Activity',
      description: activity.notes || activity.description,
      createdBy: {
        id: activity.created_by,
        name: activity.created_by_name || 'Unknown User',
        initials: (activity.created_by_name || 'U')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
      },
      createdAt: activity.created_at,
      createdAtFormatted: formatDateTime(activity.created_at),
      updatedAt: activity.updated_at
    } : null

    return NextResponse.json({
      success: true,
      activity: formattedActivity || insertData
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

function formatDateTime(dateString: string): string {
  if (!dateString) return 'Unknown'

  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata' // IST
  }

  return date.toLocaleDateString('en-US', options)
}
