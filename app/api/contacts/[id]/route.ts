import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log('=== Fetching contact ===')
    console.log('ID:', params.id)
    console.log('ID type:', typeof params.id)

    const { data, error, status } = await supabase
      .from('contacts')
      .select()
      .eq('id', params.id)
      .single()

    console.log('=== Query result ===')
    console.log('Status:', status)
    console.log('Data:', data)
    console.log('Error:', error)
    console.log('Error type:', typeof error)
    console.log('Error keys:', error ? Object.keys(error) : 'null')

    if (error) {
      console.error('SUPABASE ERROR:', JSON.stringify(error))
      return NextResponse.json({ error: `Supabase: ${error?.message || JSON.stringify(error)}` }, { status: 500 })
    }

    if (!data) {
      console.error('No data returned for ID:', params.id)
      return NextResponse.json({ error: 'Contact not found in database' }, { status: 404 })
    }

    console.log('SUCCESS: Returning contact data')
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('=== EXCEPTION ===', error)
    return NextResponse.json({ error: `Exception: ${error?.message || String(error)}` }, { status: 500 })
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
