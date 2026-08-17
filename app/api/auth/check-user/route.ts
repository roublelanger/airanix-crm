import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists in auth.users
    const { data: authResponse, error: authError } = await supabaseServer.auth.admin.listUsers()

    if (authError) throw authError

    const authUsers = authResponse?.users || []
    const userExists = authUsers.some(user => user.email?.toLowerCase() === email.toLowerCase())

    return NextResponse.json({ exists: userExists })
  } catch (error: any) {
    console.error('Error checking user:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
