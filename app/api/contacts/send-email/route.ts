import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export const maxDuration = 60

const createTransporter = () => {
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASSWORD

  if (!user || !pass) {
    throw new Error('EMAIL_USER / EMAIL_PASSWORD are not configured')
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    connectionTimeout: 10000,
    socketTimeout: 10000
  })
}

// Supports both {{name}} and {{contact_name}} since saved email templates
// (see /api/email-templates) use {{contact_name}} while this endpoint's own
// callers have historically used {{name}} - without both, one or the other
// group of senders would see the literal placeholder text in the sent email.
function personalize(text: string, recipient: { name: string; email: string; company?: string }) {
  return text
    .replace(/{{\s*(name|contact_name)\s*}}/g, recipient.name || '')
    .replace(/{{\s*email\s*}}/g, recipient.email || '')
    .replace(/{{\s*company\s*}}/g, recipient.company || '')
}

export async function POST(request: NextRequest) {
  try {
    const { subject, body, recipients, userId, userName } = await request.json()

    if (!subject || !body || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Missing subject, body, or recipients' },
        { status: 400 }
      )
    }

    const transporter = createTransporter()
    let sent = 0
    const errors: string[] = []
    const sentContactIds: string[] = []

    for (const recipient of recipients) {
      try {
        const personalizedSubject = personalize(subject, recipient)
        const personalizedBody = personalize(body, recipient)

        const emailHTML = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .content { white-space: pre-wrap; word-wrap: break-word; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="content">
${personalizedBody}
                </div>
                <div class="footer">
                  <p>This email was sent from Airanix CRM</p>
                  <p>© 2026 Airanix. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: recipient.email,
          subject: personalizedSubject,
          html: emailHTML,
          text: personalizedBody
        })

        sent++
        if (recipient.id) sentContactIds.push(recipient.id)
      } catch (emailError: any) {
        errors.push(`Failed to send to ${recipient.email}: ${emailError.message}`)
      }
    }

    // Log a CRM activity for every contact the email actually reached, so the
    // send shows up in that contact's Activity Timeline like any other touch.
    if (sentContactIds.length > 0) {
      const activityRows = sentContactIds.map((contactId) => ({
        type: 'email',
        notes: `Email sent: ${subject}`,
        contact_id: contactId,
        created_by: userId || null,
        created_by_name: userName || null
      }))

      const { error: activityError } = await supabase.from('interactions').insert(activityRows)
      if (activityError) {
        console.error('[SEND-EMAIL] Failed to log activity entries:', activityError)
      }
    }

    if (sent === 0) {
      return NextResponse.json(
        { error: `Failed to send any emails. Errors: ${errors.join('; ')}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        sent,
        failed: errors.length,
        errors,
        message: `Email sent to ${sent} recipient${sent !== 1 ? 's' : ''}${errors.length > 0 ? ` (${errors.length} failed)` : ''}`
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Bulk email error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send bulk emails' },
      { status: 500 }
    )
  }
}
