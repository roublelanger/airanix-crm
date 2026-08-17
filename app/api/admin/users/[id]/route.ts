import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if user exists and get their role
    const { data: userToDelete, error: userError } = await supabaseServer
      .from('crm_users')
      .select('role')
      .eq('id', id)
      .single()

    if (userError || !userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If deleting an admin, check if there are other admins
    if (userToDelete.role === 'admin') {
      const { data: admins, error: adminError } = await supabaseServer
        .from('crm_users')
        .select('id')
        .eq('role', 'admin')

      if (adminError) throw adminError

      if (!admins || admins.length <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin user. Please create another admin first.' },
          { status: 403 }
        )
      }
    }

    await supabaseServer.auth.admin.deleteUser(id)

    await supabaseServer
      .from('crm_users')
      .delete()
      .eq('id', id)

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
