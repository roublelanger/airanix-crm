'use client'

import { useState } from 'react'
import { login } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await login(formData.email, formData.password)
      if (result.user) {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '32px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            📊 Airanix CRM
          </h1>
          <p style={{ color: '#666' }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '4px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{ width: '100%', padding: '10px 16px', background: '#2563eb', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', opacity: isLoading ? 0.6 : 1 }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '14px' }}>
            <p style={{ color: '#666' }}>
              Don't have an account?{' '}
              <button type="button" onClick={() => router.push('/auth/signup')} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
                Sign up
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
