import { supabase } from './supabase'

export async function signup(email: string, password: string, name: string) {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      await supabase.from('crm_users').insert({ id: data.user.id, email, name })
    }
    return { user: data.user, session: data.session }
  } catch (error) {
    throw error
  }
}

export async function login(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return { user: data.user, session: data.session }
  } catch (error) {
    throw error
  }
}

export async function logout() {
  await supabase.auth.signOut()
}

export async function getCurrentSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}
