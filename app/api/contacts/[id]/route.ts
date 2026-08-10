import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('id,name,email,phone,company,status')
      .eq('id', params.id)
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 })
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
