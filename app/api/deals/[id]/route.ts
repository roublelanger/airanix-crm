import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete lead' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { name, value, stage } = await request.json()

    if (!name) throw new Error('Lead name is required')
    if (!value || value <= 0) throw new Error('Valid lead value is required')

    const { data, error } = await supabase
      .from('deals')
      .update({ name, value: parseInt(value), stage: stage || 'prospect' })
      .eq('id', params.id)
      .select('id,name,value,stage')

    if (error) throw error

    return NextResponse.json(data[0], { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update lead' }, { status: 500 })
  }
}
