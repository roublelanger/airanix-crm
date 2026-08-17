import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabaseServer.auth.admin.getUserById('')
    if (authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userProfile, error: profileError } = await supabaseServer
      .from('crm_users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { data: users, error } = await supabaseServer
      .from('crm_users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(users)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    const { data: authUser, error: signupError } = await supabaseServer.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (signupError) throw signupError

    const { error: profileError } = await supabaseServer
      .from('crm_users')
      .insert({
        id: authUser.user.id,
        email,
        name,
        role: role || 'sales'
      })

    if (profileError) {
      await supabaseServer.auth.admin.deleteUser(authUser.user.id)
      throw profileError
    }

    return NextResponse.json(
      { user: authUser.user, message: 'User created successfully' },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
