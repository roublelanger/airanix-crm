'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  userProfile: any
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        if (!supabase) {
          console.warn('Supabase client not initialized')
          setLoading(false)
          return
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          setLoading(false)
          return
        }

        if (session?.user) {
          setUser(session.user)

          try {
            const { data, error: profileError } = await supabase
              .from('crm_users')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (profileError) {
              console.warn('Profile not found, using user email:', profileError)
              // Create a minimal profile from auth user
              setUserProfile({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || 'User',
                role: 'sales'
              })
            } else {
              setUserProfile(data)
            }
          } catch (err) {
            console.error('Error fetching user profile:', err)
            setUserProfile({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || 'User',
              role: 'sales'
            })
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    if (!supabase) {
      setLoading(false)
      return () => {}
    }

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            setUser(session.user)
            try {
              if (supabase) {
                const { data, error: profileError } = await supabase
                  .from('crm_users')
                  .select('*')
                  .eq('id', session.user.id)
                  .single()

                if (profileError) {
                  console.warn('Profile not found:', profileError)
                  setUserProfile({
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.name || 'User',
                    role: 'sales'
                  })
                } else {
                  setUserProfile(data)
                }
              }
            } catch (err) {
              console.error('Error fetching user profile:', err)
              setUserProfile({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || 'User',
                role: 'sales'
              })
            }
          } else {
            setUser(null)
            setUserProfile(null)
          }
        }
      )

      return () => subscription?.unsubscribe()
    } catch (error) {
      console.error('Error setting up auth listener:', error)
      return () => {}
    }
  }, [])

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setUserProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
