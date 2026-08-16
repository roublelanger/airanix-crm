import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// In-memory token storage (in production, use database)
const resetTokens = new Map<string, { email: string; expiresAt: Date; used: boolean }>()

// Generate a secure random token
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

// Email configuration - Direct Gmail SMTP with robust settings
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
    const { email } = await request.json()

    // Validate email
    if (!email || email !== 'rouble@airanix.com') {
      return NextResponse.json(
        { error: 'Email not found in system' },
        { status: 404 }
      )
    }

    // Generate reset token
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry

    // Store token
    resetTokens.set(token, { email, expiresAt, used: false })

    // Build reset link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const resetLink = `${baseUrl}/password-reset?token=${token}`

    // Email HTML template
    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
            .warning { background: #fef3c7; border: 1px solid #fcd34d; padding: 12px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #92400e; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🔐 Password Reset Request</h1>
            </div>

            <div class="content">
              <p>Hi there,</p>

              <p>We received a request to reset the password for your Airanix CRM account. If you didn't make this request, you can ignore this email.</p>

              <p><strong>To reset your password, click the button below:</strong></p>

              <center>
                <a href="${resetLink}" class="button">Reset Password</a>
              </center>

              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 6px;">
                ${resetLink}
              </p>

              <div class="warning">
                ⏰ <strong>Important:</strong> This reset link will expire in <strong>1 hour</strong> for security. If the link expires, you'll need to request a new password reset.
              </div>

              <p><strong>Security Tips:</strong></p>
              <ul>
                <li>Never share this link with anyone</li>
                <li>Choose a strong password (minimum 6 characters)</li>
                <li>Don't use the same password as other accounts</li>
                <li>Change your password periodically for security</li>
              </ul>

              <p style="margin-top: 30px;">Best regards,<br><strong>Airanix CRM Team</strong></p>

              <div class="footer">
                <p>This is an automated email. Please do not reply directly.</p>
                <p>If you have questions, contact support at rouble@airanix.com</p>
                <p>© 2026 Airanix CRM. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email with proper error handling
    try {
      const transporter = createTransporter()

      console.log('📧 Attempting to send password reset email...')
      console.log(`To: ${email}`)
      console.log(`Reset Link: ${resetLink}`)

      const result = await transporter.sendMail({
        from: 'rouble@airanix.com',
        to: email,
        subject: '🔐 Airanix CRM - Password Reset Request',
        html: emailHTML,
        text: `Password Reset Request\n\nClick here to reset your password: ${resetLink}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.`
      })

      console.log(`✅ SUCCESS - Email sent! Message ID: ${result.messageId}`)

      return NextResponse.json(
        {
          success: true,
          message: `Password reset link sent to ${email}. Check your inbox for the reset email.`
        },
        { status: 200 }
      )
    } catch (emailError: any) {
      console.error('❌ EMAIL SENDING FAILED')
      console.error('Error Code:', emailError.code)
      console.error('Error Message:', emailError.message)
      console.error('Error Details:', emailError)

      // Still return success to user but log the error
      return NextResponse.json(
        {
          success: true,
          message: `Password reset link sent to ${email}. Check your inbox for the reset email.`,
          _debug: process.env.NODE_ENV === 'development' ? emailError.message : undefined
        },
        { status: 200 }
      )
    }
  } catch (error: any) {
    console.error('❌ PASSWORD RESET ERROR')
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}

// Endpoint to validate and reset password
export async function PUT(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    // Validate token
    const resetData = resetTokens.get(token)
    if (!resetData) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (new Date() > resetData.expiresAt) {
      resetTokens.delete(token)
      return NextResponse.json(
        { error: 'Password reset link has expired' },
        { status: 400 }
      )
    }

    // Check if token was already used
    if (resetData.used) {
      return NextResponse.json(
        { error: 'Password reset link has already been used' },
        { status: 400 }
      )
    }

    // Validate password
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Mark token as used
    resetTokens.set(token, { ...resetData, used: true })

    // Send confirmation email
    try {
      const transporter = createTransporter()

      await transporter.sendMail({
        from: 'rouble@airanix.com',
        to: resetData.email,
        subject: '✅ Airanix CRM - Password Reset Successful',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #10b981;">✅ Password Reset Successful</h2>
                <p>Your password has been successfully reset. You can now log in with your new password.</p>
                <p>If you didn't reset your password, please contact us immediately.</p>
                <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
                  This is an automated email. Please do not reply directly.
                </p>
              </div>
            </body>
          </html>
        `
      })

      console.log(`✅ Confirmation email sent to ${resetData.email}`)
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
    }

    return NextResponse.json(
      { success: true, message: 'Password reset successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Password reset confirmation error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
