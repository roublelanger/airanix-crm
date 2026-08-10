import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()

    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', params.id)
      .select()

    if (error) throw error

    return NextResponse.json(data?.[0], { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update task' }, { status: 500 })
  }
}
