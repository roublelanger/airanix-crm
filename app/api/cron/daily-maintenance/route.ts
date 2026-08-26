import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const ATTACHMENT_BUCKET = 'email-attachments'
const RESPONSE_TIME_ALERT_THRESHOLD_MS = 3000

// Abandoned uploads (attachment selected in the compose modal, never sent)
// have no other cleanup path. 48h is well beyond how long any real send
// takes to complete, so anything older than that is safe to remove.
const ATTACHMENT_MAX_AGE_HOURS = 48

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

async function timeQuery(label: string, fn: () => PromiseLike<any>) {
  const start = Date.now()
  await fn()
  return { label, ms: Date.now() - start }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[DAILY-MAINTENANCE] Starting at', new Date().toISOString())

    // 1. Response-time healthcheck on the two queries known to have caused
    // real slowness before (see the Contacts page N+1 fix).
    const timings = await Promise.all([
      timeQuery('contacts', () => supabaseAdmin.from('contacts').select('id', { count: 'exact', head: true })),
      timeQuery('interactions', () => supabaseAdmin.from('interactions').select('id', { count: 'exact', head: true }))
    ])
    const slowQueries = timings.filter(t => t.ms > RESPONSE_TIME_ALERT_THRESHOLD_MS)
    console.log('[DAILY-MAINTENANCE] Query timings:', timings)

    // 2. Clean up abandoned attachment uploads.
    let attachmentsDeleted = 0
    const { data: files, error: listError } = await supabaseAdmin.storage.from(ATTACHMENT_BUCKET).list()
    if (listError) {
      console.error('[DAILY-MAINTENANCE] Could not list attachments bucket:', listError)
    } else if (files) {
      const cutoff = Date.now() - ATTACHMENT_MAX_AGE_HOURS * 60 * 60 * 1000
      const stale = files.filter(f => f.created_at && new Date(f.created_at).getTime() < cutoff)
      if (stale.length > 0) {
        const { error: removeError } = await supabaseAdmin.storage
          .from(ATTACHMENT_BUCKET)
          .remove(stale.map(f => f.name))
        if (removeError) {
          console.error('[DAILY-MAINTENANCE] Failed to remove stale attachments:', removeError)
        } else {
          attachmentsDeleted = stale.length
        }
      }
    }

    console.log(`[DAILY-MAINTENANCE] Deleted ${attachmentsDeleted} stale attachment(s)`)

    // Only send an email when there's actually something to flag - a clean
    // run every day would just be noise.
    if (slowQueries.length > 0) {
      const transporter = createTransporter()
      if (transporter) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          subject: `Airanix CRM - Performance Alert (${slowQueries.length} slow queries)`,
          text: `Daily healthcheck found queries exceeding ${RESPONSE_TIME_ALERT_THRESHOLD_MS}ms:\n\n${slowQueries.map(q => `- ${q.label}: ${q.ms}ms`).join('\n')}\n\nAll timings: ${JSON.stringify(timings, null, 2)}`
        })
      }
    }

    return NextResponse.json({
      success: true,
      timings,
      slowQueries,
      attachmentsDeleted
    })
  } catch (error: any) {
    console.error('[DAILY-MAINTENANCE] Fatal error:', error)
    return NextResponse.json({ error: error.message || 'Daily maintenance failed' }, { status: 500 })
  }
}
