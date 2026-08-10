'use client'

import { useState } from 'react'

export default function EmailTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('welcome')
  const [editedSubject, setEditedSubject] = useState('')
  const [editedBody, setEditedBody] = useState('')
  const [savedMessage, setSavedMessage] = useState('')

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

  // Initialize edited content when template changes
  const currentEditedSubject = editedSubject || currentTemplate.subject
  const currentEditedBody = editedBody || currentTemplate.body

  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey)
    setEditedSubject('')
    setEditedBody('')
    setSavedMessage('')
  }

  const handleSaveTemplate = () => {
    const templateData = {
      name: currentTemplate.name,
      subject: currentEditedSubject,
      body: currentEditedBody,
      savedAt: new Date().toLocaleString()
    }
    // Save to localStorage for demo purposes
    localStorage.setItem(`template_${selectedTemplate}`, JSON.stringify(templateData))
    setSavedMessage('✓ Template saved successfully!')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const handleUseTemplate = () => {
    const templateText = `Subject: ${currentEditedSubject}\n\n${currentEditedBody}`
    navigator.clipboard.writeText(templateText)
    setSavedMessage('✓ Template copied to clipboard! Ready to paste into your email client.')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>📧 Email Templates</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Professional templates for quick outreach</p>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#666' }}>Templates</h3>
          </div>
          {Object.entries(templates).map(([key, template]: any) => (
            <button
              key={key}
              onClick={() => handleTemplateChange(key)}
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
                color: selectedTemplate === key ? '#1e40af' : '#333',
                transition: 'all 0.2s'
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

          {savedMessage && (
            <div style={{
              padding: '12px',
              background: '#d1fae5',
              color: '#065f46',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {savedMessage}
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
              Subject
            </label>
            <input
              type="text"
              value={currentEditedSubject}
              onChange={(e) => setEditedSubject(e.target.value)}
              placeholder={currentTemplate.subject}
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
              value={currentEditedBody}
              onChange={(e) => setEditedBody(e.target.value)}
              placeholder={currentTemplate.body}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                minHeight: '300px',
                fontFamily: 'monospace',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px', padding: '12px', background: '#f0f9ff', borderRadius: '6px', fontSize: '12px', color: '#1e40af' }}>
            <strong>Available variables:</strong><br/>
            {'{firstName}'}, {'{companyName}'}, {'{email}'}, {'{phone}'}, {'{topic}'}, {'{date}'}, {'{timeline}'}, {'{senderName}'}, {'{amount}'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={handleSaveTemplate}
              style={{
                padding: '10px 20px',
                background: '#f3f4f6',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#e5e7eb')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#f3f4f6')}
            >
              💾 Save Template
            </button>
            <button
              onClick={handleUseTemplate}
              style={{
                padding: '10px 20px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#2563eb')}
            >
              📋 Copy to Clipboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
