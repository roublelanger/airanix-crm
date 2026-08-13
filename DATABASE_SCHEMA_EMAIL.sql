-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_email_templates_created_at ON email_templates(created_at);

-- Insert default email templates
INSERT INTO email_templates (name, subject, body) VALUES
  (
    '📬 Initial Contact',
    'Hello from Airanix CRM',
    'Hi {{contact_name}},

I hope this email finds you well. I wanted to reach out to discuss potential opportunities.

Best regards,
Airanix Team'
  ),
  (
    '🔄 Follow-up',
    'Follow-up: {{contact_name}}',
    'Hi {{contact_name}},

I hope you received my previous email. I wanted to follow up and see if you''re interested in discussing this further.

Looking forward to hearing from you.

Best regards,
Airanix Team'
  ),
  (
    '📅 Meeting Confirmation',
    'Meeting Confirmation',
    'Hi {{contact_name}},

Thank you for confirming our meeting. I''m looking forward to our discussion.

Please let me know if you need any additional information beforehand.

Best regards,
Airanix Team'
  ),
  (
    '📊 Proposal',
    'Proposal for Your Review',
    'Hi {{contact_name}},

Please find attached our proposal for your review. I would appreciate your feedback and would be happy to discuss any questions you may have.

Best regards,
Airanix Team'
  ),
  (
    '🙏 Thank You',
    'Thank You for Your Time',
    'Hi {{contact_name}},

Thank you for taking the time to meet with me today. I appreciate the opportunity to discuss potential collaboration.

I look forward to continuing our conversation.

Best regards,
Airanix Team'
  )
ON CONFLICT DO NOTHING;

-- Add email type support to activities table (if not already present)
-- This assumes activities table already exists with type column that can accept 'email'
-- If you get an error about the column not existing, that's expected and safe to ignore
