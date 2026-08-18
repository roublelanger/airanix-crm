import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function POST() {
  try {
    console.log('[API DELETE ALL] Starting contact deletion...')

    const { error } = await supabase
      .from('contacts')
      .delete()
      .gte('id', '0')

    if (error) {
      console.error('[API DELETE ALL] Supabase error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('[API DELETE ALL] All contacts deleted successfully')
    return NextResponse.json({ success: true, message: 'All contacts deleted' }, { status: 200 })
  } catch (error: any) {
    console.error('[API DELETE ALL] Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
