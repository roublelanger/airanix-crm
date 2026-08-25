import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Service-role client: this bucket is private (may hold internal business
// documents like proposals/decks), so uploads/downloads/deletes go through
// signed URLs and server-side calls rather than a public bucket policy.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const BUCKET = 'email-attachments'

async function ensureBucketExists() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets()
  if (buckets?.some((b) => b.name === BUCKET)) return

  const { error } = await supabaseAdmin.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: '25MB'
  })
  // Ignore "already exists" race from a concurrent request creating it first.
  if (error && !error.message.includes('already exists')) {
    throw error
  }
}

// Step 1 of the direct-upload flow: the client asks for a signed upload URL,
// then uploads the actual file bytes straight to Supabase Storage - never
// through this Vercel function - so a 20MB PPT never touches our request
// body size limit.
export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json()

    if (!filename) {
      return NextResponse.json({ error: 'filename is required' }, { status: 400 })
    }

    await ensureBucketExists()

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUploadUrl(path)

    if (error) throw error

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path,
      contentType: contentType || 'application/octet-stream'
    })
  } catch (error: any) {
    console.error('[ATTACHMENT-UPLOAD] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to prepare upload' }, { status: 500 })
  }
}

// Cleanup: called after a send completes (or the attachment is removed
// before sending) so temporary attachments don't pile up in the bucket.
export async function DELETE(request: Request) {
  try {
    const { path } = await request.json()
    if (!path) {
      return NextResponse.json({ error: 'path is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path])
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[ATTACHMENT-UPLOAD] Delete error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete attachment' }, { status: 500 })
  }
}
