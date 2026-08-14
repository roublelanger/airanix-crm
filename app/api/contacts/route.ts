import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const SELECT_FIELDS = 'id,name,email,phone,company,status,location,designation,industry,remarks,assigned_to,created_at,updated_at'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select(SELECT_FIELDS)
      .order('company', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('GET error:', error)
      throw error
    }

    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error('GET /api/contacts error:', error.message)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, company, status, location, designation, industry, remarks, assigned_to } = body

    // Validate required fields
    if (!name) throw new Error('name is required')
    if (!email) throw new Error('email is required')

    const insertData: any = {
      id: uuidv4(),
      name,
      email,
      phone: phone || null,
      company: company || null,
      status: status?.toUpperCase() || 'NEW'
    }

    // Add optional fields
    if (location) insertData.location = location
    if (designation) insertData.designation = designation
    if (industry) insertData.industry = industry
    if (remarks) insertData.remarks = remarks
    if (assigned_to) insertData.assigned_to = assigned_to

    console.log('Creating contact with data:', insertData)

    const { data, error } = await supabase
      .from('contacts')
      .insert([insertData])
      .select(SELECT_FIELDS)

    if (error) {
      console.error('Supabase insert error:', {
        message: error.message,
        code: error.code,
        details: error.details
      })
      throw error
    }

    if (!data || data.length === 0) {
      throw new Error('No data returned after insert')
    }

    console.log('Contact created successfully:', data[0].id)
    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    console.error('POST /api/contacts error:', {
      message: error.message,
      code: error.code,
      details: error.details
    })
    return NextResponse.json(
      { error: error.message || 'Failed to create contact' },
      { status: 500 }
    )
  }
}
