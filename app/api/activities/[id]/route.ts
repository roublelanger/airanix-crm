import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      const msg = 'Activity ID is required'
      console.error(msg)
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    console.log('Deleting activity with ID:', id)

    const { error, data } = await supabase
      .from('interactions')
      .delete()
      .eq('id', id)
      .select()

    console.log('Delete result - error:', error, 'data:', data)

    if (error) {
      console.error('Supabase delete error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw new Error(`Supabase error: ${error.message} (Code: ${error.code})`)
    }

    if (!data || data.length === 0) {
      console.warn('No activity found with ID:', id)
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      )
    }

    console.log('Activity deleted successfully:', data[0].id)
    return NextResponse.json({ success: true, deleted: data[0] })
  } catch (error: any) {
    console.error('Error deleting activity - full error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      {
        error: error.message || 'Failed to delete activity',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
