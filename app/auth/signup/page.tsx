'use client'

import { useState } from 'react'

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '32px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            📊 Airanix CRM
          </h1>
          <p style={{ color: '#666' }}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Full Name</label>
            <input name="name" type="text" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }} placeholder="John Doe" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }} placeholder="you@example.com" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Password</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }} placeholder="••••••••" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Confirm Password</label>
            <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }} placeholder="••••••••" />
          </div>

          <button type="submit" style={{ width: '100%', padding: '10px 16px', background: '#2563eb', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            Sign Up
          </button>
        </form>
      </div>
    </div>
  )
}
