'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      // Check if user exists in system
      const checkRes = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const checkData = await checkRes.json()

      if (!checkRes.ok || !checkData.exists) {
        throw new Error('This email is not registered in the system. Please contact an administrator.')
      }

      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          shouldCreateUser: false
        }
      })

      if (authError) throw authError

      setSuccess('✅ Magic link sent! Check your email to login.')
      setEmail('')
    } catch (err: any) {
      setError(err.message || 'Failed to send login link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '48px 40px',
        background: '#ffffff',
        border: '2px solid #dbeafe',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(59, 130, 246, 0.15)'
      }}>
        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '36px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)'
          }}>
            <span style={{ fontSize: '36px', color: '#ffffff' }}>⚡</span>
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '900',
            color: '#000000',
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Airanix CRM
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#666666',
            margin: '0',
            fontWeight: '500'
          }}>
            Professional Contact Management
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleMagicLink} style={{ marginBottom: '24px' }}>
          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{
              background: '#d1fae5',
              border: '1px solid #6ee7b7',
              color: '#047857',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {success}
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '700',
              color: '#000000',
              marginBottom: '8px'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rouble@airanix.com"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #dbeafe',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                background: '#f9fafb',
                color: '#000000',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6'
                e.currentTarget.style.background = '#ffffff'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#dbeafe'
                e.currentTarget.style.background = '#f9fafb'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: loading ? 'none' : '0 8px 16px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(59, 130, 246, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(59, 130, 246, 0.3)'
              }
            }}
          >
            {loading ? '📧 Sending link...' : '🔗 Send Login Link'}
          </button>
        </form>

        {/* Info Box */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #f9fafb 100%)',
          border: '2px solid #dbeafe',
          padding: '20px 16px',
          borderRadius: '12px',
          fontSize: '13px',
          color: '#1e40af',
          lineHeight: '1.8',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '12px', fontWeight: '700' }}>
            ✨ Passwordless Login
          </div>
          <div style={{ color: '#666666', fontSize: '12px' }}>
            Enter your email and we'll send you a magic link. Click it to log in instantly — no password needed!
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#999999' }}>
            Demo: <strong>rouble@airanix.com</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
