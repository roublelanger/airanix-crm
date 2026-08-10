import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select('id,name,value,stage')

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, value, stage } = await request.json()

    if (!name) throw new Error('Lead name is required')
    if (!value || value <= 0) throw new Error('Valid lead value is required')

    const { data, error } = await supabase
      .from('deals')
      .insert([{ id: uuidv4(), name, title: name, value: parseInt(value), stage: stage || 'LEAD', contactId: uuidv4() }])
      .select('id,name,value,stage')

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create lead' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, value, stage } = await request.json()

    if (!id) throw new Error('Lead ID is required')
    if (!name) throw new Error('Lead name is required')
    if (!value || value <= 0) throw new Error('Valid lead value is required')

    const { data, error } = await supabase
      .from('deals')
      .update({ name, value: parseInt(value), stage: stage || 'LEAD' })
      .eq('id', id)
      .select('id,name,value,stage')

    if (error) throw error

    return NextResponse.json(data[0], { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update lead' }, { status: 500 })
  }
}
