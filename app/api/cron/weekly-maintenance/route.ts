import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

function createTransporter() {
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASSWORD
  if (!user || !pass) return null
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass },
    tls: { rejectUnauthorized: false, minVersion: 'TLSv1.2' }
  })
}

// This is deliberately report-only. Auto-deleting contacts or activities on
// a schedule is a real, hard-to-reverse data-loss risk - duplicates and
// orphans are surfaced here for a human to review, not removed automatically.
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[WEEKLY-MAINTENANCE] Starting at', new Date().toISOString())

    const [{ count: contactsCount }, { count: interactionsCount }, { count: followUpsCount }] = await Promise.all([
      supabaseAdmin.from('contacts').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('interactions').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('follow_ups').select('id', { count: 'exact', head: true })
    ])

    // Duplicate contacts: same email+name, matching the exact rule the
    // Contacts and Analytics pages already use to dedupe for display.
    const { data: allContacts } = await supabaseAdmin.from('contacts').select('id, email, name, created_at')
    const seen = new Map<string, number>()
    let duplicateCount = 0
    const duplicateGroups: { key: string; count: number }[] = []
    for (const contact of allContacts || []) {
      const key = `${contact.email?.toLowerCase() || ''}:${contact.name?.toLowerCase() || ''}`
      seen.set(key, (seen.get(key) || 0) + 1)
    }
    for (const [key, count] of seen.entries()) {
      if (count > 1) {
        duplicateCount += count - 1
        duplicateGroups.push({ key, count })
      }
    }
    duplicateGroups.sort((a, b) => b.count - a.count)

    // Orphaned interactions: contact_id that no longer matches any real
    // contact (e.g. the contact was deleted after the activity was logged).
    const contactIds = new Set((allContacts || []).map(c => c.id))
    const { data: allInteractions } = await supabaseAdmin.from('interactions').select('id, contact_id')
    const orphanedInteractions = (allInteractions || []).filter(i => i.contact_id && !contactIds.has(i.contact_id))

    const summary = {
      contactsCount,
      interactionsCount,
      followUpsCount,
      duplicateContactGroups: duplicateGroups.length,
      duplicateContactRowsExtra: duplicateCount,
      topDuplicates: duplicateGroups.slice(0, 10),
      orphanedInteractions: orphanedInteractions.length
    }

    console.log('[WEEKLY-MAINTENANCE] Summary:', summary)

    const transporter = createTransporter()
    if (transporter) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'Airanix CRM - Weekly Health Report',
        text: `Weekly CRM health report (${new Date().toLocaleDateString()})\n\n` +
          `Contacts: ${contactsCount}\n` +
          `Activities logged: ${interactionsCount}\n` +
          `Follow-ups: ${followUpsCount}\n\n` +
          `Duplicate contacts: ${duplicateGroups.length} groups, ${duplicateCount} extra rows beyond the first in each group\n` +
          `Orphaned activity records (contact no longer exists): ${orphanedInteractions.length}\n\n` +
          (duplicateGroups.length > 0
            ? `This is a report only - nothing was deleted automatically. Review and clean up duplicates from the Contacts page when convenient.\n`
            : '')
      })
    }

    return NextResponse.json({ success: true, summary })
  } catch (error: any) {
    console.error('[WEEKLY-MAINTENANCE] Fatal error:', error)
    return NextResponse.json({ error: error.message || 'Weekly maintenance failed' }, { status: 500 })
  }
}
