import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const transporter = nodemailer.createTransport({
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

    console.log('Testing Gmail connection...')

    const result = await transporter.sendMail({
      from: 'rouble@airanix.com',
      to: 'rouble.langer@gmail.com',
      subject: '✅ Airanix CRM - Email Test',
      html: `
        <html>
          <body style="font-family: Arial; color: #333;">
            <h2>✅ Gmail Configuration Test</h2>
            <p>If you're reading this, your Gmail SMTP is working correctly!</p>
            <p><strong>Status:</strong> Connected and sending</p>
            <hr>
            <p style="font-size: 12px; color: #999;">Sent from Airanix CRM</p>
          </body>
        </html>
      `,
      text: 'Gmail test successful!'
    })

    console.log(`✅ Test email sent successfully (Message ID: ${result.messageId})`)

    return NextResponse.json(
      {
        success: true,
        message: 'Test email sent successfully to rouble.langer@gmail.com',
        messageId: result.messageId
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Gmail test failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        hint: 'Check: 1) Gmail app password is correct, 2) 2FA is enabled, 3) Account is not blocked'
      },
      { status: 500 }
    )
  }
}
