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

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('interactions')
      .insert([{
        contact_id: body.contactId,
        type: body.type,
        title: body.title
      }])
      .select()

    if (error) throw error
    return NextResponse.json(data?.[0], { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
