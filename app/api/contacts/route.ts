import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const SELECT_FIELDS = 'id,name,email,phone,company,status,location,designation,industry,remarks,assigned_to,createdAt,updatedAt'

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

    const now = new Date().toISOString()

    // Match the exact format from import endpoint that works
    const insertData = {
      id: uuidv4(),
      name: name?.trim() || '',
      email: email?.trim()?.toLowerCase() || '',
      phone: phone?.trim() || '',
      company: company?.trim() || '',
      status: (status?.toUpperCase() || 'NEW') as string,
      createdAt: now,
      updatedAt: now,
      ...(location && { location: location.trim() }),
      ...(designation && { designation: designation.trim() }),
      ...(industry && { industry: industry.trim() }),
      ...(remarks && { remarks: remarks.trim() }),
      ...(assigned_to && { assigned_to: assigned_to.trim() })
    }

    console.log('Creating contact with data:', insertData)

    const { data, error } = await supabase
      .from('contacts')
      .insert([insertData])

    if (error) {
      console.error('Supabase insert error:', {
        message: error.message,
        code: error.code,
        details: error.details
      })
      throw error
    }

    console.log('Contact created successfully')

    return NextResponse.json({
      success: true,
      contact: insertData
    }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/contacts error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to create contact' },
      { status: 500 }
    )
  }
}
