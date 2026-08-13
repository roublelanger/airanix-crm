import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// GET all companies with contact count
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*, contacts(count)', { count: 'exact' })
      .order('name')

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error('Error fetching companies:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch companies' }, { status: 500 })
  }
}

// POST - Create new company
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, industry, location, remarks } = body

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('companies')
      .insert([
        {
          id: uuidv4(),
          name: name.trim(),
          industry: industry?.trim() || null,
          location: location?.trim() || null,
          remarks: remarks?.trim() || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      if (error.message.includes('unique')) {
        return NextResponse.json({ error: 'Company name already exists' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    console.error('Error creating company:', error)
    return NextResponse.json({ error: error.message || 'Failed to create company' }, { status: 500 })
  }
}
