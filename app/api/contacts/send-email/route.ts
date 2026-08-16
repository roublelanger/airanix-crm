import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'rouble@airanix.com',
      pass: 'jfmq cqvr mkra pbri'
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    connectionTimeout: 10000,
    socketTimeout: 10000,
    logger: true,
    debug: true
  })
}

export async function POST(request: NextRequest) {
  try {
    const { subject, body, recipients } = await request.json()

    if (!subject || !body || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Missing subject, body, or recipients' },
        { status: 400 }
      )
    }

    const transporter = createTransporter()
    let sent = 0

    for (const recipient of recipients) {
      try {
        const personalizedBody = body
          .replace(/{{name}}/g, recipient.name)
          .replace(/{{email}}/g, recipient.email)

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
          from: 'rouble@airanix.com',
          to: recipient.email,
          subject: subject,
          html: emailHTML,
          text: personalizedBody
        })

        sent++
      } catch (emailError: any) {
        console.error(`Failed to send email to ${recipient.email}:`, emailError.message)
      }
    }

    return NextResponse.json(
      {
        success: true,
        sent: sent,
        message: `Email sent to ${sent} recipient${sent !== 1 ? 's' : ''}`
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Bulk email error:', error)
    return NextResponse.json(
      { error: 'Failed to send bulk emails' },
      { status: 500 }
    )
  }
}
