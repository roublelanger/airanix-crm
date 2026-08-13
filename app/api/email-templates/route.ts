import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const DEFAULT_TEMPLATES = [
  {
    id: 'initial-contact',
    name: '📬 Initial Contact',
    subject: 'Hello from Airanix CRM',
    body: 'Hi {{contact_name}},\n\nI hope this email finds you well. I wanted to reach out to discuss potential opportunities.\n\nBest regards,\nAiranix Team'
  },
  {
    id: 'follow-up',
    name: '🔄 Follow-up',
    subject: 'Follow-up: {{contact_name}}',
    body: 'Hi {{contact_name}},\n\nI hope you received my previous email. I wanted to follow up and see if you\'re interested in discussing this further.\n\nLooking forward to hearing from you.\n\nBest regards,\nAiranix Team'
  },
  {
    id: 'meeting-confirmation',
    name: '📅 Meeting Confirmation',
    subject: 'Meeting Confirmation',
    body: 'Hi {{contact_name}},\n\nThank you for confirming our meeting. I\'m looking forward to our discussion.\n\nPlease let me know if you need any additional information beforehand.\n\nBest regards,\nAiranix Team'
  },
  {
    id: 'proposal',
    name: '📊 Proposal',
    subject: 'Proposal for Your Review',
    body: 'Hi {{contact_name}},\n\nPlease find attached our proposal for your review. I would appreciate your feedback and would be happy to discuss any questions you may have.\n\nBest regards,\nAiranix Team'
  },
  {
    id: 'thank-you',
    name: '🙏 Thank You',
    subject: 'Thank You for Your Time',
    body: 'Hi {{contact_name}},\n\nThank you for taking the time to meet with me today. I appreciate the opportunity to discuss potential collaboration.\n\nI look forward to continuing our conversation.\n\nBest regards,\nAiranix Team'
  }
]

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: true })

    // If error or no data, return default templates
    if (error || !data || data.length === 0) {
      return NextResponse.json(DEFAULT_TEMPLATES)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching email templates:', error)
    // Return default templates as fallback
    return NextResponse.json(DEFAULT_TEMPLATES)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, subject, body: templateBody } = body

    if (!name || !subject || !templateBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('email_templates')
      .insert([{ name, subject, body: templateBody }])
      .select('*')

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    console.error('Error creating email template:', error)
    return NextResponse.json({ error: error.message || 'Failed to create email template' }, { status: 500 })
  }
}
