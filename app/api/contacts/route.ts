import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('id, name, email, phone, company, status')

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}
