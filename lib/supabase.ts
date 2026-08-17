import { createClient, SupabaseClient } from '@supabase/supabase-js'
import https from 'https'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let supabase: SupabaseClient | null = null
let supabaseServer: SupabaseClient | null = null

// Create HTTPS agent that rejects unauthorized certificates (for production)
// In development, we use NODE_TLS_REJECT_UNAUTHORIZED=0
const httpsAgent = new https.Agent({
  rejectUnauthorized: process.env.NODE_ENV === 'production'
})

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

export { supabase, supabaseServer, httpsAgent }
