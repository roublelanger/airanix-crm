'use client'

import { useState } from 'react'

export default function EmailTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('welcome')

  const templates: any = {
    welcome: {
      name: 'Welcome Email',
      subject: 'Welcome to {{companyName}} - {{firstName}}',
      body: `Hi {{firstName}},

Thank you for choosing {{companyName}}. We're thrilled to have you on board!

We're here to support you every step of the way. If you have any questions or need assistance getting started, don't hesitate to reach out.

Looking forward to working with you.

Best regards,
{{senderName}}
{{companyName}}`
    },
    followup: {
      name: 'Follow-up Email',
      subject: 'Following Up - {{topic}}',
      body: `Hi {{firstName}},

I hope this email finds you well. I wanted to follow up on our recent conversation regarding {{topic}}.

I believe our solution can deliver significant value to {{companyName}}, and I'd love to discuss how we can help achieve your goals.

Would you be available for a brief call this week?

Best regards,
{{senderName}}`
    },
    proposal: {
      name: 'Proposal Email',
      subject: 'Proposal: {{topic}} for {{companyName}}',
      body: `Hi {{firstName}},

Thank you for the opportunity to work with {{companyName}}. I've attached a customized proposal tailored to your specific needs and budget.

Key highlights:
• Addresses your primary objectives
• Flexible implementation timeline
• Transparent pricing structure

I'm available to discuss any questions or refine the proposal further. Looking forward to your feedback.

Best regards,
{{senderName}}`
    },
    closing: {
      name: 'Closing Email',
      subject: 'Let\'s Move Forward - Final Steps',
      body: `Hi {{firstName}},

Thank you for the positive feedback on our proposal. I'm excited about the opportunity to work with {{companyName}}.

To get started, we just need your approval and can begin implementation on {{date}}. The expected timeline is {{timeline}}.

Let me know if you have any final questions before we proceed.

Best regards,
{{senderName}}`
    }
  }

  const currentTemplate = templates[selectedTemplate]

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>📧 Email Templates</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Professional templates for quick outreach</p>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#666' }}>Templates</h3>
          </div>
          {Object.entries(templates).map(([key, template]: any) => (
            <button
              key={key}
              onClick={() => setSelectedTemplate(key)}
              style={{
                width: '100%',
                padding: '16px 20px',
                border: 'none',
                borderBottom: '1px solid #eee',
                textAlign: 'left',
                background: selectedTemplate === key ? '#dbeafe' : 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: selectedTemplate === key ? '600' : '500',
                color: selectedTemplate === key ? '#1e40af' : '#333'
              }}
            >
              {template.name}
            </button>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 20px 0' }}>
            {currentTemplate.name}
          </h2>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
              Subject
            </label>
            <input
              type="text"
              defaultValue={currentTemplate.subject}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
              Body
            </label>
            <textarea
              defaultValue={currentTemplate.body}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                minHeight: '300px',
                fontFamily: 'monospace',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              style={{
                padding: '10px 20px',
                background: '#f3f4f6',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Save Template
            </button>
            <button
              style={{
                padding: '10px 20px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Use Template
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
