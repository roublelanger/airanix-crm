import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    // Fetch all users from auth.users
    const authResponse = await supabaseServer.auth.admin.listUsers()

    if (authResponse.error) throw authResponse.error

    const authUsers = authResponse.data?.users || []

    // Get all crm_users to supplement with names and roles
    const { data: crmUsers, error: crmError } = await supabaseServer
      .from('crm_users')
      .select('*')

    if (crmError) throw crmError

    // Create a map of crm_users by id for quick lookup
    const crmUserMap = new Map(crmUsers?.map(u => [u.id, u]) || [])

    // Merge auth users with crm user data
    const mergedUsers = authUsers.map(authUser => {
      const crmUser = crmUserMap.get(authUser.id)
      return {
        id: authUser.id,
        email: authUser.email || '',
        name: crmUser?.name || authUser.email?.split('@')[0] || 'Unknown',
        role: crmUser?.role || 'sales',
        created_at: authUser.created_at || new Date().toISOString()
      }
    })

    return NextResponse.json(mergedUsers)
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
