import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// The email-attachments bucket is private, so downloading the uploaded file
// (to hand to nodemailer) needs the service role key, not the anon key.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const ATTACHMENT_BUCKET = 'email-attachments'

// A real 8MB attachment (storage download + Gmail SMTP transfer) measured
// at ~90s during testing - well past a 60s budget. 300s is the max Vercel
// allows a serverless function without Fluid Compute enabled; this route
// needs a Pro (or higher) plan for that ceiling to actually apply - on the
// Hobby plan, Vercel hard-caps every function at 60s regardless of this
// value, so large attachments will still fail there.
export const maxDuration = 300

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
    connectionTimeout: 15000,
    // A real 8MB attachment measured ~90s end-to-end during testing (storage
    // download + Gmail SMTP transfer combined). Scaling that rate up to the
    // 20MB attachment limit this feature allows, with margin for network
    // variability, needs well over a minute just for the SMTP leg alone.
    socketTimeout: 180000
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
    const { subject, body, recipients, userId, userName, attachment } = await request.json()

    if (!subject || !body || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Missing subject, body, or recipients' },
        { status: 400 }
      )
    }

    // Download once per request (not per recipient) - it's the same file for
    // every recipient in this batch. The file lives in Supabase Storage
    // (uploaded directly from the browser via a signed URL) rather than in
    // this request's JSON body, since a PPT/PDF can easily be 10-20MB and
    // Vercel hard-caps serverless function request bodies around 4.5MB.
    let attachments: { filename: string; content: Buffer; contentType: string }[] | undefined
    if (attachment?.path) {
      const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
        .from(ATTACHMENT_BUCKET)
        .download(attachment.path)

      if (downloadError) {
        console.error('[SEND-EMAIL] Failed to download attachment:', downloadError)
      } else {
        const arrayBuffer = await fileBlob.arrayBuffer()
        attachments = [{
          filename: attachment.filename || 'attachment',
          content: Buffer.from(arrayBuffer),
          contentType: attachment.contentType || 'application/octet-stream'
        }]
      }
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
          text: personalizedBody,
          attachments
        })

        sent++
        if (recipient.id) sentContactIds.push(recipient.id)
      } catch (emailError: any) {
        // Full error was previously only pushed into the response body's
        // errors array and never logged server-side - made past failures
        // impossible to diagnose from Vercel's logs. Log the complete
        // nodemailer error (code, response, command) so a real SMTP
        // rejection is actually visible next time.
        console.error(`[SEND-EMAIL] Failed to send to ${recipient.email}:`, {
          message: emailError.message,
          code: emailError.code,
          response: emailError.response,
          responseCode: emailError.responseCode,
          command: emailError.command
        })
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
