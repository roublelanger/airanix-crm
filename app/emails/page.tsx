'use client'

import { useState, useEffect } from 'react'

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    try {
      const res = await fetch('/api/email-templates')
      const data = await res.json()
      setTemplates(data)
      setSelectedTemplate(data[0])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>📧 Email Templates</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        {/* Template List */}
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Loading...</div>
          ) : (
            <div>
              {templates.map((template: any) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    background: selectedTemplate?.id === template.id ? '#dbeafe' : 'white',
                    transition: 'background 0.2s'
                  }}
                >
                  <p style={{ margin: 0, fontWeight: '500', fontSize: '14px' }}>{template.name}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>Used 24 times</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Template Preview */}
        {selectedTemplate && (
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>{selectedTemplate.name}</h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#666', marginBottom: '6px' }}>Subject Line</label>
              <input
                type="text"
                value={selectedTemplate.subject}
                readOnly
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#666', marginBottom: '6px' }}>Email Body</label>
              <textarea
                value={selectedTemplate.body}
                readOnly
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', minHeight: '200px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ background: '#dbeafe', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px', color: '#1e40af' }}>
              💡 Use {{'{firstName}'}} {{'{company}'}} {{'{date}'}} for merge fields
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ flex: 1, padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                Use This Template
              </button>
              <button style={{ flex: 1, padding: '10px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                Copy
              </button>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
              <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Last used 2 days ago • Used 24 times</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
