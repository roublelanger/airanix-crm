import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let supabase: SupabaseClient | null = null
let supabaseServer: SupabaseClient | null = null

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } else {
    console.warn('Supabase configuration incomplete')
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error)
}

try {
  if (supabaseUrl && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseServer = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    )
  }
} catch (error) {
  console.error('Failed to initialize Supabase server client:', error)
}

export { supabase, supabaseServer }
