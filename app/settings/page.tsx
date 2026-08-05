export default function SettingsPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <h1>Settings</h1>

      <div style={{ background: 'white', padding: '24px', borderRadius: '8px', marginTop: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>CRM Configuration</h2>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Team Name</h3>
          <input type="text" placeholder="Airanix CRM" style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', maxWidth: '400px' }} />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Contact Status Options</h3>
          <div style={{ color: '#666', fontSize: '14px' }}>
            <p>✓ Lead</p>
            <p>✓ Prospect</p>
            <p>✓ Customer</p>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Deal Stages</h3>
          <div style={{ color: '#666', fontSize: '14px' }}>
            <p>✓ Prospect</p>
            <p>✓ Negotiation</p>
            <p>✓ Proposal</p>
            <p>✓ Active</p>
            <p>✓ Won</p>
            <p>✓ Lost</p>
          </div>
        </div>

        <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '12px', color: '#666' }}>
            Version: 1.0 | Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
