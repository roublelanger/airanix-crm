import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true })

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        contact_id: body.contactId,
        title: body.title,
        description: body.description,
        priority: body.priority || 'medium',
        status: body.status || 'open',
        due_date: body.dueDate
      }])
      .select()

    if (error) throw error
    return NextResponse.json(data?.[0], { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('tasks')
      .update({ status: body.status })
      .eq('id', body.id)
      .select()

    if (error) throw error
    return NextResponse.json(data?.[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
