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
      .select('*')

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, value, stage, owner, close_date, last_activity, notes } = await request.json()

    if (!name) throw new Error('Lead name is required')
    if (!value || value <= 0) throw new Error('Valid lead value is required')

    const now = new Date().toISOString()
    const leadId = uuidv4()

    console.log('[API POST /deals] Creating lead:', { name, value, stage, owner })

    const { data, error } = await supabase
      .from('deals')
      .insert([{
        id: leadId,
        name,
        title: name,
        value: parseInt(value),
        stage: stage || 'LEAD',
        owner: owner || null,
        close_date: close_date || null,
        last_activity: last_activity || null,
        notes: notes || null,
        contactId: null,
        createdAt: now,
        updatedAt: now
      }])
      .select('*')

    if (error) {
      console.error('[API POST /deals] Supabase error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('[API POST /deals] Lead created successfully:', leadId)
    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    console.error('[API POST /deals] Error:', error.message)
    return NextResponse.json({ error: error.message || 'Failed to create lead' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, value, stage, owner, close_date, last_activity, notes } = await request.json()

    if (!id) throw new Error('Lead ID is required')
    if (!name) throw new Error('Lead name is required')
    if (!value || value <= 0) throw new Error('Valid lead value is required')

    console.log('[API PUT /deals] Updating lead:', { id, name, value, stage })

    const { data, error } = await supabase
      .from('deals')
      .update({
        name,
        value: parseInt(value),
        stage: stage || 'LEAD',
        owner: owner || null,
        close_date: close_date || null,
        last_activity: last_activity || null,
        notes: notes || null,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')

    if (error) {
      console.error('[API PUT /deals] Supabase error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('[API PUT /deals] Lead updated successfully:', id)
    return NextResponse.json(data[0], { status: 200 })
  } catch (error: any) {
    console.error('[API PUT /deals] Error:', error.message)
    return NextResponse.json({ error: error.message || 'Failed to update lead' }, { status: 500 })
  }
}
