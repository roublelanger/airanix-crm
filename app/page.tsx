'use client'

import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // Optional: Redirect to dashboard after a delay, or keep on home page
    // setTimeout(() => window.location.href = '/dashboard', 5000)
  }, [])

  const stats = [
    { label: 'Global Teams', value: '500+', icon: '👥' },
    { label: 'Integrations', value: '50+', icon: '🔗' },
    { label: 'Uptime SLA', value: '99.9%', icon: '✓' },
    { label: 'Support', value: '24/7', icon: '🎯' }
  ]

  const features = [
    {
      icon: '📊',
      title: 'Smart Analytics',
      description: 'Real-time insights into your sales pipeline with detailed metrics and trends'
    },
    {
      icon: '👥',
      title: 'Contact Management',
      description: 'Organize and track all your contacts with custom fields and rich profiles'
    },
    {
      icon: '💼',
      title: 'Deal Pipeline',
      description: 'Visualize your sales stages and track deal progression effortlessly'
    },
    {
      icon: '📧',
      title: 'Email Integration',
      description: 'Send emails with templates and track engagement automatically'
    },
    {
      icon: '📋',
      title: 'Follow-ups',
      description: 'Never miss a follow-up with scheduled reminders and smart notifications'
    },
    {
      icon: '☁️',
      title: 'Platform Tracking',
      description: 'Track which platforms your clients use for better integration planning'
    }
  ]

  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <nav style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '20px 0',
        borderBottom: '1px solid #334155',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px', fontWeight: '800', color: '#2563eb' }}>⚡</span>
            <div>
              <h1 style={{ margin: '0', fontSize: '24px', fontWeight: '800', color: 'white' }}>AIRANIX</h1>
              <p style={{ margin: '0', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>CRM Platform</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a href="/contacts" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>Contacts</a>
            <a href="/deals" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>Deals</a>
            <a href="/dashboard" style={{ padding: '8px 20px', background: '#2563eb', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '600', borderRadius: '8px', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.4)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.boxShadow = 'none'; }}>Go to Dashboard</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        color: 'white',
        padding: '120px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decorative elements */}
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          top: '-100px',
          right: '-100px'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          bottom: '-50px',
          left: '-50px'
        }}></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '60px' }}>⚡</span>
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: '900', margin: '0 0 16px 0', lineHeight: '1.2', letterSpacing: '-1px' }}>
            Welcome to AIRANIX
          </h1>
          <p style={{ fontSize: '18px', color: '#cbd5e1', margin: '0 0 32px 0', lineHeight: '1.6', fontWeight: '400' }}>
            The modern CRM platform built for ambitious sales teams. Manage contacts, track deals, and close more business.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <a href="/dashboard" style={{ padding: '14px 32px', background: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '16px', transition: 'all 0.3s', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,99,235,0.4)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.3)'; }}>
              Enter Dashboard
            </a>
            <a href="/contacts" style={{ padding: '14px 32px', background: 'transparent', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '16px', border: '2px solid #2563eb', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(37,99,235,0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
              Explore Contacts
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {stats.map((stat, idx) => (
              <div key={idx} style={{
                background: 'white',
                padding: '32px 24px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                transition: 'all 0.3s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{stat.icon}</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>{stat.value}</div>
                <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0' }}>Powerful Features</h2>
            <p style={{ fontSize: '18px', color: '#64748b', margin: '0', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>Everything you need to manage relationships and close deals faster</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {features.map((feature, idx) => (
              <div key={idx} style={{
                padding: '32px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 12px 0' }}>{feature.title}</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '0', lineHeight: '1.6' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        padding: '80px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '800', margin: '0 0 16px 0' }}>Ready to Transform Your Sales?</h2>
          <p style={{ fontSize: '16px', color: '#cbd5e1', margin: '0 0 32px 0' }}>Start using AIRANIX today and see the difference a modern CRM can make</p>
          <a href="/dashboard" style={{ display: 'inline-block', padding: '14px 32px', background: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '16px', transition: 'all 0.3s', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,99,235,0.4)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.3)'; }}>
            Get Started Now
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#0f172a',
        color: '#94a3b8',
        padding: '40px 24px',
        borderTop: '1px solid #334155',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#2563eb' }}>⚡</span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>AIRANIX</span>
          </div>
          <p style={{ margin: '0 0 20px 0', fontSize: '14px' }}>The modern CRM for ambitious sales teams</p>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
            <a href="/contacts" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>Contacts</a>
            <a href="/deals" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>Deals</a>
            <a href="/followups" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>Follow-ups</a>
            <a href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>Dashboard</a>
          </div>
          <p style={{ margin: '20px 0 0 0', fontSize: '12px', color: '#64748b', borderTop: '1px solid #334155', paddingTop: '20px' }}>© 2026 AIRANIX. All rights reserved. | Designed for ambitious sales teams</p>
        </div>
      </footer>
    </div>
  )
}
