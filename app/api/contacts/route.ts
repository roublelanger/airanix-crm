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
    // A single unbounded .select() is capped at Postgres/PostgREST's default
    // page size (1000 rows). With 4700+ contacts after the recent bulk
    // import, this endpoint was silently truncating - the Contacts page
    // (search, filters, stat cards, sorting, bulk actions) has only been
    // operating on the first 1000 rows (ordered by company/name) since then,
    // with no error surfaced anywhere. Page through the full table instead.
    const pageSize = 1000
    let allData: any[] = []
    let from = 0
    while (true) {
      const { data, error } = await supabase
        .from('contacts')
        .select(SELECT_FIELDS)
        .order('company', { ascending: true })
        .order('name', { ascending: true })
        .range(from, from + pageSize - 1)

      if (error) {
        console.error('GET error:', error)
        throw error
      }
      if (!data || data.length === 0) break

      allData = allData.concat(data)
      if (data.length < pageSize) break
      from += pageSize
    }

    return NextResponse.json(allData)
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
