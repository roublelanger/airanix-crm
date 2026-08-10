import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const contactId = params.id

    const { data, error } = await supabase
      .from('contacts')
      .select('id, name, email, phone, company, status')
      .match({ id: contactId })

    if (error) throw new Error(`DB Error: ${error.message}`)
    if (!data || data.length === 0) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })

    return NextResponse.json(data[0], { status: 200 })
  } catch (error: any) {
    console.error('GET /api/contacts/[id] error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { name, email, phone, company, status } = await request.json()

    const { data, error } = await supabase
      .from('contacts')
      .update({ name, email, phone, company, status })
      .eq('id', params.id)
      .select('id,name,email,phone,company,status')

    if (error) throw error

    return NextResponse.json(data[0], { status: 200 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
  }
}
