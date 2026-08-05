import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function getMetrics() {
  try {
    const [contactsRes, dealsRes, leadsRes] = await Promise.all([
      supabase.from('contacts').select('id', { count: 'exact', head: true }),
      supabase.from('deals').select('id', { count: 'exact', head: true }),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('status', 'lead')
    ])

    return {
      totalContacts: contactsRes.count || 0,
      activeDeal: dealsRes.count || 0,
      newLeads: leadsRes.count || 0,
      conversions: 0
    }
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return { totalContacts: 0, activeDeal: 0, newLeads: 0, conversions: 0 }
  }
}

export default async function Home() {
  const metrics = await getMetrics()

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <h1>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#666', fontSize: '14px' }}>Total Contacts</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{metrics.totalContacts}</p>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#666', fontSize: '14px' }}>New Leads</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{metrics.newLeads}</p>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#666', fontSize: '14px' }}>Active Deals</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{metrics.activeDeal}</p>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#666', fontSize: '14px' }}>Conversions</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{metrics.conversions}</p>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>Quick Links</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
          <a href="/contacts" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
              <h3>👥 Contacts</h3>
              <p>Manage leads and customers</p>
            </div>
          </a>
          <a href="/deals" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
              <h3>💰 Deals</h3>
              <p>Track your pipeline</p>
            </div>
          </a>
          <a href="/settings" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
              <h3>⚙️ Settings</h3>
              <p>Configure your CRM</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
