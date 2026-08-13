import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

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

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, phone, company, status, location, designation, industry, remarks, assigned_to } = await request.json()

    const insertData: any = {
      name,
      email,
      phone,
      company,
      status: status?.toUpperCase() || 'NEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (location) insertData.location = location
    if (designation) insertData.designation = designation
    if (industry) insertData.industry = industry
    if (remarks) insertData.remarks = remarks
    if (assigned_to) insertData.assigned_to = assigned_to

    const { data, error } = await supabase
      .from('contacts')
      .insert([insertData])
      .select(SELECT_FIELDS)

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }
}
