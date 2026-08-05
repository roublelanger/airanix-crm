import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select('id, value, stage')

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const dealsWithNames = data?.map((deal: any) => ({
      id: deal.id,
      name: `Deal #${deal.id.slice(0, 8)}`,
      value: deal.value || 0,
      stage: deal.stage || 'prospect'
    })) || []

    return NextResponse.json(dealsWithNames)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
  }
}
