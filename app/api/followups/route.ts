import { createClient } from '@supabase/supabase-js'
import { NextResponse, NextRequest } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') // today, week, upcoming
    const status = searchParams.get('status') // pending, completed, etc.

    let query = supabase
      .from('follow_ups')
      .select(`
        *,
        contact:contacts(id, name, email, company, phone),
        created_by_user:crm_users(id, name, email)
      `)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })

    // Filter by date range
    if (range === 'today') {
      const today = new Date().toISOString().split('T')[0]
      query = query.eq('scheduled_date', today)
    } else if (range === 'week') {
      const today = new Date()
      const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const todayStr = today.toISOString().split('T')[0]
      const weekEndStr = weekEnd.toISOString().split('T')[0]
      query = query.gte('scheduled_date', todayStr).lte('scheduled_date', weekEndStr)
    } else if (range === 'upcoming') {
      const today = new Date().toISOString().split('T')[0]
      query = query.gte('scheduled_date', today)
    }

    // Filter by status - default to pending
    if (status) {
      query = query.eq('status', status)
    } else {
      query = query.neq('status', 'cancelled')
    }

    const { data, error } = await query

    if (error) {
      console.error('[FOLLOWUPS] Query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formatted = (data || []).map((followup: any) => ({
      id: followup.id,
      contactId: followup.contact_id,
      contact: followup.contact,
      activityType: followup.activity_type,
      description: followup.description,
      priority: followup.priority,
      status: followup.status,
      scheduledDate: followup.scheduled_date,
      scheduledTime: followup.scheduled_time,
      createdBy: followup.created_by_user?.name || 'Unknown',
      createdByUser: followup.created_by_user,
      createdAt: followup.created_at
    }))

    return NextResponse.json({
      success: true,
      data: formatted,
      count: formatted.length
    })
  } catch (error: any) {
    console.error('[FOLLOWUPS] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.contactId) {
      return NextResponse.json({ error: 'contactId is required' }, { status: 400 })
    }
    if (!body.scheduledDate) {
      return NextResponse.json({ error: 'scheduledDate is required' }, { status: 400 })
    }
    if (!body.scheduledTime) {
      return NextResponse.json({ error: 'scheduledTime is required' }, { status: 400 })
    }

    console.log('[FOLLOWUPS POST] Creating follow-up:', {
      contactId: body.contactId,
      scheduledDate: body.scheduledDate,
      userId: body.userId,
      userName: body.userName
    })

    const { data, error } = await supabase
      .from('follow_ups')
      .insert([{
        contact_id: body.contactId,
        activity_id: body.activityId || null,
        scheduled_date: body.scheduledDate,
        scheduled_time: body.scheduledTime,
        activity_type: body.activityType || 'call',
        description: body.description || null,
        priority: body.priority || 'normal',
        status: 'pending',
        notes: body.notes || null,
        created_by: body.userId || null
      }])
      .select()

    if (error) {
      console.error('[FOLLOWUPS] Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      followup: data?.[0]
    }, { status: 201 })
  } catch (error: any) {
    console.error('[FOLLOWUPS] POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('follow_ups')
      .update({
        status: body.status,
        notes: body.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.id)
      .select()

    if (error) {
      console.error('[FOLLOWUPS] Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      followup: data?.[0]
    })
  } catch (error: any) {
    console.error('[FOLLOWUPS] PUT error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
