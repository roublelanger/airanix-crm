'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function PasswordResetContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    // Validate token
    if (!token) {
      setLoading(false)
      setTokenValid(false)
      setMessage({ type: 'error', text: 'No reset token provided. Invalid or expired link.' })
      return
    }

    // In production, would validate token against backend
    // For now, we'll accept any non-empty token as valid
    setLoading(false)
    setTokenValid(true)
  }, [token])

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please enter both password fields' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    // In production, would call:
    // POST /api/password-reset/confirm with { token, newPassword }
    // Backend would validate token and update password

    // For demo, show success
    localStorage.setItem('deletePassword', newPassword)
    setSubmitted(true)
    setMessage({
      type: 'success',
      text: 'Password reset successfully! Redirecting to login...'
    })

    // Redirect after 3 seconds
    setTimeout(() => {
      window.location.href = '/contacts'
    }, 3000)
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '60px 24px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #e5e7eb', borderTop: '4px solid #2563eb', animation: 'spin 1s linear infinite' }}></div>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Validating reset link...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '60px 24px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', background: '#fee2e2', padding: '40px 32px', borderRadius: '12px', border: '1px solid #fecaca' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#991b1b', margin: '0 0 8px 0' }}>Invalid or Expired Link</h2>
          <p style={{ fontSize: '14px', color: '#7c2515', margin: '0 0 24px 0', lineHeight: '1.6' }}>
            The password reset link is invalid or has expired. Reset links expire after 1 hour for security.
          </p>
          <a href="/contacts" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#2563eb',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.2s',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1d4ed8'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2563eb'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Go to Contacts
          </a>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '24px 0 0 0' }}>
            <a href="/contacts" style={{ color: '#2563eb', textDecoration: 'none' }}>Request a new reset link</a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '60px 24px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>Reset Your Password</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Enter a new password to regain access to your account</p>
        </div>

        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
        }}>
          {message && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              fontWeight: '500',
              background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: message.type === 'success' ? '#065f46' : '#7c2515',
              border: `1px solid ${message.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
            }}>
              {message.type === 'success' ? '✅' : '❌'} {message.text}
            </div>
          )}

          {!submitted && (
            <form onSubmit={handleReset} style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  🔐 New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = '#cbd5e1'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  ✓ Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: newPassword && confirmPassword && newPassword === confirmPassword ? '1px solid #10b981' : '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = newPassword && confirmPassword && newPassword === confirmPassword ? '#10b981' : '#cbd5e1'
                  }}
                />
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>❌ Passwords do not match</p>
                )}
                {newPassword && confirmPassword && newPassword === confirmPassword && (
                  <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#10b981', fontWeight: '500' }}>✅ Passwords match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: newPassword && confirmPassword && newPassword === confirmPassword ? '#2563eb' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: newPassword && confirmPassword && newPassword === confirmPassword ? 'pointer' : 'not-allowed',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  opacity: newPassword && confirmPassword && newPassword === confirmPassword ? 1 : 0.5,
                }}
                onMouseEnter={(e) => {
                  if (newPassword && confirmPassword && newPassword === confirmPassword) {
                    e.currentTarget.style.background = '#1d4ed8'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (newPassword && confirmPassword && newPassword === confirmPassword) {
                    e.currentTarget.style.background = '#2563eb'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                Reset Password
              </button>
            </form>
          )}

          {submitted && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <p style={{ fontSize: '14px', color: '#10b981', fontWeight: '600', margin: '0' }}>
                Password reset successfully!
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '12px 0 0 0' }}>
                Redirecting you back to contacts...
              </p>
            </div>
          )}

          <div style={{ marginTop: '24px', padding: '16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: '#1e40af', margin: '0', fontWeight: '500' }}>
              🔒 <strong>Security:</strong> Your new password must be at least 6 characters. Make it strong and unique.
            </p>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', margin: '24px 0 0 0' }}>
          Remember your password now? <a href="/contacts" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Go back to contacts</a>
        </p>
      </div>
    </div>
  )
}

export default function PasswordResetPage() {
  return (
    <Suspense fallback={
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '60px 24px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #e5e7eb', borderTop: '4px solid #2563eb', animation: 'spin 1s linear infinite' }}></div>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Loading password reset...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <PasswordResetContent />
    </Suspense>
  )
}
