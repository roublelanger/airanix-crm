import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log('[API DELETE /deals/[id]] Deleting lead:', params.id)

    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('[API DELETE /deals/[id]] Supabase error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('[API DELETE /deals/[id]] Lead deleted successfully:', params.id)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('[API DELETE /deals/[id]] Error:', error.message)
    return NextResponse.json({ error: error.message || 'Failed to delete lead' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { name, value, stage, owner, close_date, last_activity, notes } = await request.json()

    if (!name) throw new Error('Lead name is required')
    if (!value || value <= 0) throw new Error('Valid lead value is required')

    console.log('[API PUT /deals/[id]] Updating lead:', { id: params.id, name, value, stage })

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
      .eq('id', params.id)
      .select('*')

    if (error) {
      console.error('[API PUT /deals/[id]] Supabase error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('[API PUT /deals/[id]] Lead updated successfully:', params.id)
    return NextResponse.json(data[0], { status: 200 })
  } catch (error: any) {
    console.error('[API PUT /deals/[id]] Error:', error.message)
    return NextResponse.json({ error: error.message || 'Failed to update lead' }, { status: 500 })
  }
}
