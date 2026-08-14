'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function ContactDetailPage() {
  const params = useParams()
  const [contact, setContact] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<any[]>([])
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [activityForm, setActivityForm] = useState({
    type: 'follow-up-call',
    title: '',
    description: '',
    outcome: 'pending',
    assignedTo: '',
    meetingDate: '',
    meetingTime: ''
  })
  const [followupStatus, setFollowupStatus] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailFeedback, setEmailFeedback] = useState('')
  const [emailTemplates, setEmailTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [emailActivityForm, setEmailActivityForm] = useState({
    type: 'email-sent',
    description: ''
  })
  const [followups, setFollowups] = useState<any[]>([])

  // Sanitize email - remove quotes and invalid characters
  const sanitizeEmail = (email: string) => {
    if (!email) return ''
    return email.replace(/["\s]/g, '').toLowerCase().trim()
  }

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Interpolate template with contact data
  const interpolateTemplate = (template: any, contactData: any) => {
    let body = template.body
    let subject = template.subject

    body = body.replace(/{{contact_name}}/g, contactData?.name || 'there')
    subject = subject.replace(/{{contact_name}}/g, contactData?.name || 'Contact')

    return { ...template, body, subject }
  }

  // Fetch email templates from API
  useEffect(() => {
    const fetchEmailTemplates = async () => {
      try {
        const res = await fetch('/api/email-templates')
        const data = await res.json()
        setEmailTemplates(data)
      } catch (error) {
        console.error('Error fetching email templates:', error)
      }
    }
    fetchEmailTemplates()
  }, [])


  useEffect(() => {
    fetchContact()
    fetchActivities()
    fetchFollowups()
  }, [params.id])

  async function fetchContact() {
    try {
      console.log('Fetching contact with ID:', params.id)
      const res = await fetch(`/api/contacts/${params.id}`)
      const data = await res.json()
      console.log('API response:', { status: res.ok, data })
      if (res.ok) {
        setContact(data)
      } else {
        console.error('API error:', data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchActivities() {
    try {
      const res = await fetch(`/api/activities?contactId=${params.id}`)
      const data = await res.json()
      setActivities(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  async function fetchFollowups() {
    try {
      const res = await fetch('/api/followups')
      const data = await res.json()
      const contactFollowups = Array.isArray(data) ? data.filter((f: any) => f.contactId === params.id || f.contact_id === params.id) : []
      const sorted = contactFollowups.sort((a: any, b: any) => {
        const dateA = new Date(a.scheduledDate || a.scheduled_date || 0).getTime()
        const dateB = new Date(b.scheduledDate || b.scheduled_date || 0).getTime()
        return dateA - dateB
      })
      setFollowups(sorted)
    } catch (error) {
      console.error('Error fetching followups:', error)
    }
  }

  async function handleActivitySubmit(e: React.FormEvent) {
    e.preventDefault()

    // Generate title based on type
    const typeLabels: Record<string, string> = {
      'follow-up-call': 'Follow-up Call',
      'follow-up-meeting': 'Follow-up for Meeting',
      'meeting-booked': 'Meeting Booked',
      'meeting-happened': 'Meeting Happened',
      'assigned': 'Contact Assigned'
    }
    const title = typeLabels[activityForm.type] || 'Activity'

    // Build complete description with meeting details
    let fullDescription = activityForm.description || ''

    // Add meeting details if applicable
    if ((activityForm.type === 'meeting-booked' || activityForm.type === 'meeting-happened' || activityForm.type === 'follow-up-meeting') &&
        (activityForm.meetingDate || activityForm.meetingTime)) {
      fullDescription += '\n' + (fullDescription ? '\n' : '')
      if (activityForm.meetingDate) fullDescription += `Date: ${activityForm.meetingDate}\n`
      if (activityForm.meetingTime) fullDescription += `Time: ${activityForm.meetingTime}\n`
    }

    // Add assigned to if applicable
    if ((activityForm.type === 'assigned' || activityForm.type === 'meeting-booked') && activityForm.assignedTo) {
      fullDescription += '\n' + (fullDescription ? '\n' : '')
      fullDescription += `Assigned to: ${activityForm.assignedTo}`
    }

    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activityForm.type,
          title: title,
          description: fullDescription,
          outcome: activityForm.outcome,
          contactId: params.id
        })
      })
      const data = await res.json()
      if (res.ok) {
        setActivityForm({ type: 'follow-up-call', title: '', description: '', outcome: 'pending', assignedTo: '', meetingDate: '', meetingTime: '' })
        setShowActivityForm(false)
        fetchActivities()
        alert('Activity logged successfully!')
      } else {
        alert(`Error: ${data.error || 'Failed to save activity'}`)
      }
    } catch (error) {
      console.error('Error saving activity:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save activity'}`)
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', minHeight: 'calc(100vh - 80px)' }}>
        <div style={{ textAlign: 'center', paddingTop: '60px' }}>
          <div style={{ display: 'inline-block', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #e5e7eb', borderTop: '4px solid #2563eb', animation: 'spin 1s linear infinite' }}></div>
          </div>
          <p style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>Loading contact details...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!contact) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', minHeight: 'calc(100vh - 80px)' }}>
        <div style={{ textAlign: 'center', paddingTop: '80px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Contact Not Found</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>This contact doesn't exist or has been deleted.</p>
          <a href="/contacts" style={{ display: 'inline-block', padding: '10px 24px', background: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' }}>← Back to Contacts</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', minHeight: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
        <a href="/contacts" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
          ← Back to Contacts
        </a>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
          <div>
            <h1 style={{ margin: '0 0 12px 0', fontSize: '32px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>{contact.name}</h1>
            <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
              {contact.designation && <span>{contact.designation}</span>}
              {contact.designation && contact.company && <span> at </span>}
              {contact.company && <span style={{ fontWeight: '600' }}>{contact.company}</span>}
            </p>
          </div>
          <span style={{
            background: contact.status === 'NEW' ? '#dbeafe' : contact.status === 'LEAD' ? '#fef3c7' : contact.status === 'ACTIVE' ? '#d1fae5' : contact.status === 'CLOSED' ? '#fecaca' : '#e5e7eb',
            color: contact.status === 'NEW' ? '#0369a1' : contact.status === 'LEAD' ? '#92400e' : contact.status === 'ACTIVE' ? '#047857' : contact.status === 'CLOSED' ? '#991b1b' : '#374151',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap'
          }}>
            {contact.status || 'NEW'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Contact Info Card */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#111827' }}>📋 Contact Information</h2>

          <div style={{ marginBottom: '18px' }}>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 6px 0', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>📧 Email</p>
            <p style={{ fontSize: '14px', margin: 0, color: '#333' }}>
              {contact.email ? <a href={`mailto:${contact.email}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>{contact.email}</a> : <span style={{ color: '#9ca3af' }}>Not provided</span>}
            </p>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 6px 0', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>📱 Phone</p>
            <p style={{ fontSize: '14px', margin: 0, color: '#333' }}>
              {contact.phone ? <a href={`tel:${contact.phone}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>{contact.phone}</a> : <span style={{ color: '#9ca3af' }}>Not provided</span>}
            </p>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 6px 0', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>🏢 Company</p>
            <p style={{ fontSize: '14px', margin: 0, color: '#333' }}>{contact.company ? <span style={{ fontWeight: '500' }}>{contact.company}</span> : <span style={{ color: '#9ca3af' }}>Not provided</span>}</p>
          </div>

          {contact.designation && (
            <div style={{ marginBottom: '18px' }}>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 6px 0', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>💼 Designation</p>
              <p style={{ fontSize: '14px', margin: 0, color: '#333' }}>{contact.designation}</p>
            </div>
          )}

          {contact.location && (
            <div style={{ marginBottom: '18px' }}>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 6px 0', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>📍 Location</p>
              <p style={{ fontSize: '14px', margin: 0, color: '#333' }}>{contact.location}</p>
            </div>
          )}

          {contact.platform && (
            <div style={{ marginBottom: '18px', padding: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
              <p style={{ fontSize: '11px', color: '#0369a1', margin: '0 0 6px 0', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>☁️ Platform/Domain</p>
              <p style={{ fontSize: '14px', margin: 0, color: '#0369a1', fontWeight: '500' }}>{contact.platform}</p>
            </div>
          )}

          {contact.industry && (
            <div style={{ marginBottom: '18px' }}>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 6px 0', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>🏭 Industry</p>
              <p style={{ fontSize: '14px', margin: 0, color: '#333' }}>{contact.industry}</p>
            </div>
          )}

          {contact.assigned_to && (
            <div style={{ marginBottom: '18px' }}>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 6px 0', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>👤 Assigned To</p>
              <p style={{ fontSize: '14px', margin: 0, color: '#333' }}>{contact.assigned_to}</p>
            </div>
          )}

          {contact.remarks && (
            <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 6px 0', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>📝 Remarks</p>
              <p style={{ fontSize: '13px', margin: 0, color: '#4b5563', lineHeight: '1.6' }}>{contact.remarks}</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Quick Actions</h2>

          <button onClick={() => {
            if (!contact?.phone) {
              alert('No phone number available for this contact')
              return
            }
            window.location.href = `tel:${contact.phone}`
          }} style={{
            width: '100%',
            padding: '12px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            ☎️ Call Now
          </button>

          <button onClick={() => {
            if (!contact?.email) {
              setEmailFeedback('❌ No email available for this contact')
              setTimeout(() => setEmailFeedback(''), 3000)
              return
            }
            const cleanEmail = sanitizeEmail(contact.email)
            if (!isValidEmail(cleanEmail)) {
              setEmailFeedback('❌ Invalid email format: ' + contact.email)
              setTimeout(() => setEmailFeedback(''), 3000)
              return
            }
            setSelectedTemplate(null)
            setEmailActivityForm({ type: 'email-sent', description: '' })
            setEmailFeedback('✅ Select email template')
            setShowEmailModal(true)
          }} style={{
            width: '100%',
            padding: '12px 16px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            📧 Send Email
          </button>

          <button
            onClick={() => setShowActivityForm(!showActivityForm)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            📝 Log Activity
          </button>

          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>Follow-up Status</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setFollowupStatus('demo')} style={{ flex: 1, padding: '8px', background: followupStatus === 'demo' ? '#fcd34d' : '#fef3c7', border: `2px solid ${followupStatus === 'demo' ? '#d97706' : '#fcd34d'}`, borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
                📋 Demo
              </button>
              <button onClick={() => setFollowupStatus('meeting')} style={{ flex: 1, padding: '8px', background: followupStatus === 'meeting' ? '#93c5fd' : '#dbeafe', border: `2px solid ${followupStatus === 'meeting' ? '#3b82f6' : '#93c5fd'}`, borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
                📅 Meeting
              </button>
              <button onClick={() => setFollowupStatus('done')} style={{ flex: 1, padding: '8px', background: followupStatus === 'done' ? '#6ee7b7' : '#d1fae5', border: `2px solid ${followupStatus === 'done' ? '#10b981' : '#6ee7b7'}`, borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
                ✅ Done
              </button>
            </div>
            {followupStatus && <p style={{ fontSize: '12px', color: '#10b981', margin: '8px 0 0 0', fontWeight: '500' }}>✓ Follow-up marked as {followupStatus}</p>}
          </div>
        </div>
      </div>

      {/* Email Feedback Message */}
      {emailFeedback && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: emailFeedback.includes('❌') ? '#fee2e2' : '#dcfce7',
          color: emailFeedback.includes('❌') ? '#991b1b' : '#166534',
          padding: '12px 16px',
          borderRadius: '6px',
          zIndex: 2000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          {emailFeedback}
        </div>
      )}

      {/* Email Template Modal */}
      {showEmailModal && contact?.email && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowEmailModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)'
          }} onClick={(e) => e.stopPropagation()}>
            {!selectedTemplate ? (
              <>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>📧 Select Email Template</h2>
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#666' }}>
                  To: {sanitizeEmail(contact.email)}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '20px' }}>
                  {emailTemplates.length > 0 ? emailTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(interpolateTemplate(template, contact))}
                      style={{
                        padding: '16px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.borderColor = '#2563eb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }}
                    >
                      <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{template.name}</div>
                      <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
                        Subject: {template.subject}
                      </div>
                    </button>
                  )) : <p style={{ color: '#999' }}>Loading templates...</p>}
                </div>

                <button
                  onClick={() => {
                    setShowEmailModal(false)
                    setEmailFeedback('')
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#f3f4f6',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>📝 Email Activity Details</h2>
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#666' }}>
                  Template: {selectedTemplate?.name} | To: {sanitizeEmail(contact.email)}
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Activity Type *
                  </label>
                  <select
                    value={emailActivityForm.type}
                    onChange={(e) => setEmailActivityForm({ ...emailActivityForm, type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="email-sent">📧 Email Sent</option>
                    <option value="follow-up-call">☎️ Follow-up Call</option>
                    <option value="meeting-booked">📅 Meeting Booked</option>
                    <option value="proposal-sent">📊 Proposal Sent</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Activity Notes
                  </label>
                  <textarea
                    value={emailActivityForm.description}
                    onChange={(e) => setEmailActivityForm({ ...emailActivityForm, description: e.target.value })}
                    placeholder="Add any notes about this email (optional)"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      minHeight: '80px',
                      fontFamily: 'inherit',
                      resize: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    onClick={() => {
                      setSelectedTemplate(null)
                      setEmailActivityForm({ type: 'email-sent', description: '' })
                    }}
                    style={{
                      padding: '12px',
                      background: '#f3f4f6',
                      color: '#333',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Back
                  </button>
                  <button
                    onClick={async () => {
                      const cleanEmail = sanitizeEmail(contact.email)
                      if (!isValidEmail(cleanEmail)) {
                        setEmailFeedback('❌ Invalid email address')
                        setTimeout(() => setEmailFeedback(''), 3000)
                        return
                      }

                      try {
                        // Log as activity
                        await fetch('/api/email-activities', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            contactId: contact.id,
                            templateId: selectedTemplate.id,
                            templateName: selectedTemplate.name,
                            subject: selectedTemplate.subject,
                            description: emailActivityForm.description
                          })
                        })

                        // Open email client with pre-filled content
                        const subject = encodeURIComponent(selectedTemplate.subject);
                        const body = encodeURIComponent(selectedTemplate.body);
                        window.location.href = `mailto:${cleanEmail}?subject=${subject}&body=${body}`;

                        setEmailFeedback('✅ Email client opened & activity logged')
                        setShowEmailModal(false)
                        setSelectedTemplate(null)
                        setEmailActivityForm({ type: 'email-sent', description: '' })

                        // Refresh activities
                        const res = await fetch(`/api/activities?contactId=${contact.id}`)
                        const data = await res.json()
                        if (Array.isArray(data)) setActivities(data)

                        setTimeout(() => setEmailFeedback(''), 3000)
                      } catch (error) {
                        console.error('Error sending email:', error)
                        setEmailFeedback('❌ Error logging email activity')
                        setTimeout(() => setEmailFeedback(''), 3000)
                      }
                    }}
                    style={{
                      padding: '12px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    📧 Send Email
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Activity Form */}
      {showActivityForm && (
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '30px',
          border: '2px solid #2563eb'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>📝 Log Call Activity</h2>
          <form onSubmit={handleActivitySubmit}>
            {/* Activity Type Selection */}
            <fieldset style={{ border: 'none', padding: 0, margin: '0 0 24px 0' }}>
              <legend style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>Select Activity Type *</legend>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                {[
                  { value: 'follow-up-call', label: '☎️ Follow-up Call', desc: 'Regular follow-up call' },
                  { value: 'follow-up-meeting', label: '🔔 Follow-up for Meeting', desc: 'Follow-up before meeting' },
                  { value: 'meeting-booked', label: '📅 Meeting Booked', desc: 'Meeting confirmed' },
                  { value: 'meeting-happened', label: '✅ Meeting Happened', desc: 'Meeting completed' },
                  { value: 'assigned', label: '👤 Assigned', desc: 'Contact assigned' }
                ].map(option => (
                  <div
                    key={option.value}
                    onClick={() => setActivityForm({ ...activityForm, type: option.value })}
                    style={{
                      padding: '12px',
                      border: `2px solid ${activityForm.type === option.value ? '#2563eb' : '#ddd'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: activityForm.type === option.value ? '#eff6ff' : '#f9fafb',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: '600', color: activityForm.type === option.value ? '#2563eb' : '#333', marginBottom: '4px' }}>
                      {option.label}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{option.desc}</div>
                  </div>
                ))}
              </div>
              <input type="hidden" value={activityForm.type} />
            </fieldset>

            {/* Meeting Details - Show for meeting-related activities */}
            {(activityForm.type === 'meeting-booked' || activityForm.type === 'meeting-happened' || activityForm.type === 'follow-up-meeting') && (
              <fieldset style={{ border: 'none', padding: 0, margin: '0 0 24px 0' }}>
                <legend style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>Meeting Details</legend>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#333' }}>Date</label>
                    <input
                      type="date"
                      value={activityForm.meetingDate}
                      onChange={(e) => setActivityForm({ ...activityForm, meetingDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#333' }}>Time</label>
                    <input
                      type="time"
                      value={activityForm.meetingTime}
                      onChange={(e) => setActivityForm({ ...activityForm, meetingTime: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>
              </fieldset>
            )}

            {/* Assigned To - Show for assigned activities */}
            {(activityForm.type === 'assigned' || activityForm.type === 'meeting-booked') && (
              <fieldset style={{ border: 'none', padding: 0, margin: '0 0 24px 0' }}>
                <legend style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>Assign to Sales</legend>
                <input
                  type="text"
                  value={activityForm.assignedTo}
                  onChange={(e) => setActivityForm({ ...activityForm, assignedTo: e.target.value })}
                  placeholder="Sales team member name"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </fieldset>
            )}

            {/* Description/Remarks */}
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>Description & Remarks</legend>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: '#333' }}>What happened during the call?</label>
                <textarea
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  placeholder="Add details about the call, discussion points, next steps, etc."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    minHeight: '120px',
                    fontFamily: 'system-ui',
                    boxSizing: 'border-box',
                    fontSize: '14px'
                  }}
                />
              </div>
            </fieldset>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              <button
                type="button"
                onClick={() => setShowActivityForm(false)}
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
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 24px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ✓ Save Activity
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Activities Timeline */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#111827' }}>📊 Activity Timeline</h2>
        {activities.length === 0 ? (
          <div style={{ textAlign: 'center', paddingY: '32px', color: '#9ca3af' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
            <p style={{ margin: '0', fontSize: '14px', fontWeight: '500' }}>No activities recorded yet</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#d1d5db' }}>Start by logging a call, meeting, or email activity</p>
          </div>
        ) : (
          <div>
            {activities.map((activity: any) => {
              const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
                'follow-up-call': { icon: '☎️', label: 'Follow-up Call', color: '#3b82f6' },
                'follow-up-meeting': { icon: '🔔', label: 'Follow-up for Meeting', color: '#f59e0b' },
                'meeting-booked': { icon: '📅', label: 'Meeting Booked', color: '#8b5cf6' },
                'meeting-happened': { icon: '✅', label: 'Meeting Happened', color: '#10b981' },
                'assigned': { icon: '👤', label: 'Assigned', color: '#6366f1' },
                'call': { icon: '☎️', label: 'Call', color: '#3b82f6' },
                'email': { icon: '📧', label: 'Email', color: '#0ea5e9' },
                'meeting': { icon: '📅', label: 'Meeting', color: '#a855f7' },
                'note': { icon: '📝', label: 'Note', color: '#64748b' }
              };

              const config = typeConfig[activity.type] || { icon: '📌', label: activity.type?.toUpperCase() || 'Activity', color: '#6b7280' };

              return (
                <div key={activity.id} style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', borderLeft: `4px solid ${config.color}`, background: '#f9fafb', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '18px', marginRight: '12px' }}>{config.icon}</span>
                    <strong style={{ color: config.color, fontSize: '14px', fontWeight: '600' }}>{config.label}</strong>
                  </div>

                  {/* Meeting Details */}
                  {(activity.type === 'meeting-booked' || activity.type === 'meeting-happened') && activity.description && (
                    <>
                      {activity.description.includes('Date:') && (
                        <div style={{ margin: '8px 0', fontSize: '12px', color: '#555', paddingLeft: '28px' }}>
                          {activity.description.split('\n').map((line: string, idx: number) => (
                            <div key={idx}>{line}</div>
                          ))}
                        </div>
                      )}
                      {!activity.description.includes('Date:') && (
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333', paddingLeft: '28px' }}>{activity.description}</p>
                      )}
                    </>
                  )}

                  {/* Regular Description */}
                  {activity.type !== 'meeting-booked' && activity.type !== 'meeting-happened' && activity.description && (
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333', paddingLeft: '28px' }}>{activity.description}</p>
                  )}

                  <p style={{ margin: 0, fontSize: '12px', color: '#999', paddingLeft: '28px' }}>
                    {activity.created_at ? new Date(activity.created_at).toLocaleString() : 'Recently'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Follow-ups Section */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#111827' }}>📋 Scheduled Follow-ups</h2>
        {followups.length === 0 ? (
          <div style={{ textAlign: 'center', paddingY: '32px', color: '#9ca3af' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
            <p style={{ margin: '0', fontSize: '14px', fontWeight: '500' }}>No follow-ups scheduled yet</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#d1d5db' }}>Add a follow-up from the form above to get started</p>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div style={{ position: 'absolute', left: '12px', top: '0', bottom: '0', width: '2px', background: '#e5e7eb' }}></div>

            {followups.map((followup: any, idx: number) => {
              const scheduledDate = new Date(followup.scheduledDate || followup.scheduled_date)
              const isUpcoming = scheduledDate > new Date()
              const typeLabel = followup.type === 'call' ? '☎️ Call' : followup.type === 'meeting' ? '📅 Meeting' : followup.type === 'email' ? '📧 Email' : '📋 ' + (followup.type || 'Follow-up')
              const priorityColor = followup.priority === 'HIGH' ? '#dc2626' : followup.priority === 'MEDIUM' ? '#f59e0b' : '#10b981'

              return (
                <div key={idx} style={{ paddingLeft: '40px', paddingBottom: idx < followups.length - 1 ? '24px' : '0', position: 'relative' }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute',
                    left: '4px',
                    top: '2px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: isUpcoming ? priorityColor : '#d1d5db',
                    border: '3px solid white',
                    boxShadow: `0 0 0 2px ${isUpcoming ? priorityColor : '#d1d5db'}`
                  }}></div>

                  <div style={{
                    background: isUpcoming ? (priorityColor === '#dc2626' ? '#fee2e2' : priorityColor === '#f59e0b' ? '#fef3c7' : '#d1fae5') : '#f9fafb',
                    padding: '16px',
                    borderRadius: '8px',
                    border: `1px solid ${isUpcoming ? (priorityColor === '#dc2626' ? '#fecaca' : priorityColor === '#f59e0b' ? '#fcd34d' : '#a7f3d0') : '#e5e7eb'}`,
                    opacity: isUpcoming ? 1 : 0.6
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <strong style={{ color: '#111827', fontSize: '14px', fontWeight: '600' }}>{typeLabel}</strong>
                        {followup.priority && (
                          <span style={{ padding: '2px 8px', background: priorityColor + '25', color: priorityColor, borderRadius: '4px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                            {followup.priority}
                          </span>
                        )}
                      </div>
                      {!isUpcoming && <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>✓ Completed</span>}
                    </div>

                    {followup.description && (
                      <p style={{ margin: '10px 0', fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>{followup.description}</p>
                    )}

                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280', fontWeight: '500', marginTop: '10px' }}>
                      <span>📅 {scheduledDate.toLocaleDateString()}</span>
                      <span>🕐 {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}
