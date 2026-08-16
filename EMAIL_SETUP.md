# 📧 Email Configuration Guide

## Overview
The password reset feature now includes real email sending capabilities. This guide walks you through setting up email sending for the application.

---

## 🚀 Quick Setup (Gmail - Easiest)

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Sign in with your Gmail account
3. Enable "2-Step Verification"
4. Complete the verification process

### Step 2: Generate App Password
1. Go back to [Google Account Security](https://myaccount.google.com/security)
2. Find "App passwords" (only visible if 2FA is enabled)
3. Select "Mail" and "Windows Computer" (or your device)
4. Google will generate a 16-character app password
5. Copy this password (you'll need it in Step 3)

### Step 3: Configure .env.local
Create a `.env.local` file in the root directory with:

```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Replace:
- `your-email@gmail.com` with your Gmail address
- `xxxx xxxx xxxx xxxx` with the 16-char app password from Step 2

### Step 4: Test
1. Run the application
2. Click "📧 Reset Password" button
3. Click "Send Reset Link"
4. Check your Gmail inbox for the password reset email
5. Click the link to test the reset flow

---

## 🔧 Advanced Setup (Other Email Providers)

### Option 1: Gmail (via nodemailer)
```
service: 'gmail'
auth:
  user: your-email@gmail.com
  pass: your-app-password
```

### Option 2: Outlook/Hotmail
```
host: smtp-mail.outlook.com
port: 587
secure: false
auth:
  user: your-email@outlook.com
  pass: your-password
```

### Option 3: SendGrid
```
host: smtp.sendgrid.net
port: 587
secure: false
auth:
  user: apikey
  pass: SG.xxxx...
```

### Option 4: Custom SMTP Server
```
host: mail.example.com
port: 587 (or 465 for TLS)
secure: false (or true for TLS)
auth:
  user: your-email
  pass: your-password
```

---

## 🧪 Development Mode (Testing Without Email)

If you don't want to configure email yet, the system includes a development mode:

1. **Don't set EMAIL_USER/EMAIL_PASSWORD** - leave .env.local empty or without these vars
2. **Click "📧 Reset Password"** - the system will:
   - Generate a token
   - Log the reset link to the **browser console**
   - Return a success message

3. **Copy the link from console:**
   ```
   📧 DEV MODE - Reset Link: http://localhost:3000/password-reset?token=abc123...
   ```

4. **Manually navigate** to that URL to test the reset page

---

## 📬 Email Templates

### Password Reset Email
- **To:** rouble@airanix.com
- **Subject:** 🔐 Airanix CRM - Password Reset Request
- **Contents:**
  - Reset button with secure link
  - Manual link (copy-paste option)
  - 1-hour expiry warning
  - Security tips
  - Automated email disclaimer

### Password Reset Confirmation Email
- **To:** rouble@airanix.com  
- **Subject:** ✅ Airanix CRM - Password Reset Successful
- **Contents:**
  - Success confirmation
  - Warning about unauthorized access
  - Contact info for issues

---

## 🔐 Security Considerations

### Token Security
- ✅ 32-character random token
- ✅ 1-hour expiry time
- ✅ Single-use enforcement
- ✅ No password in email or URLs

### Email Best Practices
- ✅ Use app passwords, never account passwords
- ✅ Enable 2-factor authentication
- ✅ Keep credentials in .env.local (not committed)
- ✅ Monitor email sending logs

### Production Requirements
- Use production email service (SendGrid, AWS SES, etc.)
- Store tokens in database, not memory
- Implement token rotation
- Monitor for abuse/excessive resets
- Add rate limiting to reset endpoint
- Use environment variables for all credentials

---

## 🐛 Troubleshooting

### Email Not Sending
**Problem:** Reset button clicked but no email received

**Solutions:**
1. Check `NODE_ENV` is not set to `production` (in dev, check console for token)
2. Verify .env.local exists and contains EMAIL_USER/EMAIL_PASSWORD
3. Check Gmail app password is correct (copy from Google Account)
4. Enable "Less secure app access" (Gmail setting) if using regular password
5. Check email server isn't blocking the connection
6. Look for error message in Node.js console

### Invalid/Expired Token
**Problem:** Reset link shows "Invalid or Expired Link"

**Solutions:**
1. Wait 1 hour for token to expire naturally (for testing)
2. Generate a new reset link
3. Check server time is correct
4. Verify token wasn't already used

### Email Service Timeout
**Problem:** "Failed to send password reset email"

**Solutions:**
1. Check internet connection
2. Verify email server is responding
3. Check firewall isn't blocking port 587/465
4. Test with simpler email provider (Gmail first)

---

## 📝 Environment Variables Reference

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `EMAIL_USER` | Yes* | your@gmail.com | Email sender address |
| `EMAIL_PASSWORD` | Yes* | xxxx xxxx xxxx | Email service password/token |
| `NEXT_PUBLIC_BASE_URL` | Optional | http://localhost:3000 | Base URL for reset links |
| `NODE_ENV` | Auto | development | Dev mode enables console logging |

*Only required if you want actual email sending. Development mode works without them.

---

## 🎯 Testing Checklist

- [ ] .env.local created with EMAIL_USER and EMAIL_PASSWORD
- [ ] Email credentials verified (2FA enabled, app password generated)
- [ ] Application restarted after .env.local changes
- [ ] Click "📧 Reset Password" button
- [ ] Email received at rouble@airanix.com
- [ ] Click reset link in email
- [ ] Password reset form appears
- [ ] Enter new password (6+ chars)
- [ ] Confirmation email received
- [ ] New password works for delete operations

---

## 🚀 Production Deployment

### Before Going Live
1. **Use Production Email Service**
   - SendGrid (recommended, 100 emails/day free)
   - AWS SES
   - Postmark
   - Mailgun

2. **Database Integration**
   - Migrate tokens from memory to database
   - Store: token, email, expiresAt, used status
   - Add cleanup job for expired tokens

3. **Rate Limiting**
   - Limit reset requests to 3 per hour per email
   - Prevent brute force attacks
   - Add progressive delays

4. **Monitoring**
   - Log all password reset attempts
   - Alert on suspicious activity
   - Track email delivery rates
   - Monitor token generation

5. **Security Audit**
   - Verify no passwords in logs
   - Confirm tokens are random and unique
   - Test for token enumeration attacks
   - Review email content for sensitive data

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify .env.local configuration
4. Test with a simpler email provider first
5. Enable NODE_ENV=development for console logs

---

## Next Steps

- [ ] Configure email credentials in .env.local
- [ ] Test password reset flow
- [ ] Verify emails are being received
- [ ] Deploy to production with production email service
- [ ] Set up monitoring and alerts
- [ ] Document for your team

