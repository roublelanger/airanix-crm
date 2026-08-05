# Airanix CRM Setup Script for Windows
# This script creates all necessary files and directories for the CRM

Write-Host "🚀 Starting Airanix CRM Setup..." -ForegroundColor Green

# Get the script directory (where this file is located)
$projectRoot = Get-Location
Write-Host "📁 Project root: $projectRoot" -ForegroundColor Blue

# Function to create a file with content
function New-FileWithContent {
    param(
        [string]$Path,
        [string]$Content
    )

    # Create directory if it doesn't exist
    $dir = Split-Path -Parent $Path
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  📁 Created directory: $dir" -ForegroundColor Gray
    }

    # Create the file
    Set-Content -Path $Path -Value $Content -Encoding UTF8
    Write-Host "  ✓ Created: $Path" -ForegroundColor Green
}

Write-Host "`n📝 Creating directory structure and files..." -ForegroundColor Yellow

# ============================================================================
# LIBRARY FILES (lib/)
# ============================================================================

Write-Host "`n[1/6] Creating lib files..." -ForegroundColor Cyan

New-FileWithContent -Path "lib\supabase.ts" -Content @'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseServer = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false } }
)
'@

New-FileWithContent -Path "lib\types.ts" -Content @'
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'sales' | 'manager'
  team_id: string
}

export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  designation?: string
  status: 'lead' | 'prospect' | 'customer' | 'lost'
  source?: string
  owner_id?: string
  team_id: string
  notes?: string
  created_at: string
}

export interface Deal {
  id: string
  name: string
  contact_id: string
  value?: number
  currency: string
  stage: 'prospect' | 'negotiation' | 'proposal' | 'won' | 'lost'
  probability: number
  close_date?: string
  owner_id?: string
  team_id: string
  created_at: string
}

export interface Interaction {
  id: string
  contact_id: string
  type: 'call' | 'email' | 'meeting' | 'note'
  title: string
  description?: string
  outcome?: string
  scheduled_at?: string
  completed_at?: string
  owner_id?: string
  team_id: string
  created_at: string
}

export interface Task {
  id: string
  title: string
  description?: string
  contact_id?: string
  deal_id?: string
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'completed'
  due_date?: string
  assigned_to?: string
  team_id: string
  created_at: string
}

export interface DashboardMetrics {
  total_contacts: number
  total_deals: number
  total_deals_value: number
  won_deals_this_month: number
  open_tasks: number
  upcoming_interactions: number
}
'@

New-FileWithContent -Path "lib\auth.ts" -Content @'
import { supabase } from './supabase'

export async function login(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return { user: data.user, session: data.session }
  } catch (error) {
    throw error
  }
}

export async function logout() {
  await supabase.auth.signOut()
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()
  return data.session
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('crm_users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}
'@

New-FileWithContent -Path "lib\utils.ts" -Content @'
export function formatCurrency(value: number, currency = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  })
  return formatter.format(value)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDatetime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    lead: 'bg-blue-100 text-blue-800',
    prospect: 'bg-purple-100 text-purple-800',
    customer: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
    open: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    won: 'bg-green-100 text-green-800',
    lost_deal: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function truncate(text: string, length: number): string {
  return text.length > length ? text.substring(0, length) + '...' : text
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
'@

New-FileWithContent -Path "lib\scoring.ts" -Content @'
import { Contact, Deal, Interaction } from './types'

interface ScoringInput {
  contact: Contact
  deals: Deal[]
  interactions: Interaction[]
  emailEngagement?: number
}

export function calculateLeadScore(input: ScoringInput): number {
  let score = 0

  const statusScores: Record<string, number> = {
    customer: 100,
    prospect: 75,
    lead: 50,
    lost: 0,
  }
  score += statusScores[input.contact.status] || 0

  const totalDealValue = input.deals.reduce((sum, d) => sum + (d.value || 0), 0)
  const dealScore = Math.min(totalDealValue / 1000, 30)
  score += dealScore

  const interactionScore = Math.min(input.interactions.length * 2, 20)
  score += interactionScore

  if (input.emailEngagement) {
    score += Math.min(input.emailEngagement, 20)
  }

  if (input.interactions.length > 0) {
    const lastInteraction = new Date(input.interactions[0].created_at)
    const daysSinceInteraction = Math.floor(
      (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceInteraction < 7) {
      score += 10
    } else if (daysSinceInteraction < 14) {
      score += 5
    }
  }

  return Math.min(Math.max(score, 0), 100)
}

export function getScoringTier(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 75) return 'hot'
  if (score >= 50) return 'warm'
  return 'cold'
}
'@

New-FileWithContent -Path "lib\gmail-sync.ts" -Content @'
export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  team_id: string
  created_at: string
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'First Follow-up',
    subject: 'Following up on our conversation',
    body: `Hi {{contact_name}},

I hope you'\''re having a great day. I wanted to follow up on our conversation regarding {{company}}.

I believe we can help you achieve {{goal}}.

Would you be open to a quick 15-minute call this week?

Best regards,
{{your_name}}`,
    team_id: '',
    created_at: new Date().toISOString(),
  },
]

export function getDefaultTemplates(): EmailTemplate[] {
  return defaultTemplates
}

export function renderTemplate(template: string, variables: Record<string, string>): string {
  let rendered = template
  Object.entries(variables).forEach(([key, value]) => {
    rendered = rendered.replace(`{{${key}}}`, value)
  })
  return rendered
}
'@

# ============================================================================
# API ROUTES (app/api/)
# ============================================================================

Write-Host "`n[2/6] Creating API routes..." -ForegroundColor Cyan

New-FileWithContent -Path "app\api\contacts\route.ts" -Content @'
import { supabase, supabaseServer } from '@/lib/supabase'
import { Contact } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabaseServer.from('contacts').select('*')

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const session = await supabase.auth.getSession()
    const userId = session.data.session?.user.id

    const contact: Contact = {
      id: '',
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      designation: body.designation,
      status: body.status || 'lead',
      source: body.source,
      owner_id: userId,
      team_id: body.team_id,
      notes: body.notes,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseServer
      .from('contacts')
      .insert([contact])
      .select()

    if (error) throw error
    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
'@

New-FileWithContent -Path "app\api\contacts\[id]\route.ts" -Content @'
import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseServer
      .from('contacts')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const { data, error } = await supabaseServer
      .from('contacts')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()

    if (error) throw error
    return NextResponse.json(data[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseServer
      .from('contacts')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
'@

New-FileWithContent -Path "app\api\deals\route.ts" -Content @'
import { supabase, supabaseServer } from '@/lib/supabase'
import { Deal } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage')

    let query = supabaseServer.from('deals').select('*, contacts(name, email)')

    if (stage) {
      query = query.eq('stage', stage)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const session = await supabase.auth.getSession()
    const userId = session.data.session?.user.id

    const deal: Deal = {
      id: '',
      name: body.name,
      contact_id: body.contact_id,
      value: body.value || 0,
      currency: body.currency || 'USD',
      stage: body.stage || 'prospect',
      probability: body.probability || 0,
      close_date: body.close_date,
      owner_id: userId,
      team_id: body.team_id,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseServer
      .from('deals')
      .insert([deal])
      .select()

    if (error) throw error
    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
'@

New-FileWithContent -Path "app\api\deals\[id]\route.ts" -Content @'
import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseServer
      .from('deals')
      .select('*, contacts(name, email, phone, company)')
      .eq('id', params.id)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const { data, error } = await supabaseServer
      .from('deals')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()

    if (error) throw error
    return NextResponse.json(data[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseServer
      .from('deals')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
'@

New-FileWithContent -Path "app\api\interactions\route.ts" -Content @'
import { supabase, supabaseServer } from '@/lib/supabase'
import { Interaction } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get('contact_id')

    let query = supabaseServer.from('interactions').select('*')

    if (contactId) {
      query = query.eq('contact_id', contactId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const session = await supabase.auth.getSession()
    const userId = session.data.session?.user.id

    const interaction: Interaction = {
      id: '',
      contact_id: body.contact_id,
      type: body.type,
      title: body.title,
      description: body.description,
      outcome: body.outcome,
      scheduled_at: body.scheduled_at,
      completed_at: body.completed_at,
      owner_id: userId,
      team_id: body.team_id,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseServer
      .from('interactions')
      .insert([interaction])
      .select()

    if (error) throw error
    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
'@

New-FileWithContent -Path "app\api\tasks\route.ts" -Content @'
import { supabase, supabaseServer } from '@/lib/supabase'
import { Task } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabaseServer.from('tasks').select('*')

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('due_date', { ascending: true })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const session = await supabase.auth.getSession()
    const userId = session.data.session?.user.id

    const task: Task = {
      id: '',
      title: body.title,
      description: body.description,
      contact_id: body.contact_id,
      deal_id: body.deal_id,
      priority: body.priority || 'medium',
      status: 'open',
      due_date: body.due_date,
      assigned_to: body.assigned_to || userId,
      team_id: body.team_id,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseServer
      .from('tasks')
      .insert([task])
      .select()

    if (error) throw error
    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
'@

New-FileWithContent -Path "app\api\tasks\[id]\route.ts" -Content @'
import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const { data, error } = await supabaseServer
      .from('tasks')
      .update(body)
      .eq('id', params.id)
      .select()

    if (error) throw error
    return NextResponse.json(data[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseServer
      .from('tasks')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
'@

New-FileWithContent -Path "app\api\dashboard\route.ts" -Content @'
import { supabaseServer } from '@/lib/supabase'
import { DashboardMetrics } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const contactsQuery = supabaseServer
      .from('contacts')
      .select('id', { count: 'exact' })
    const { count: totalContacts } = await contactsQuery

    const dealsQuery = supabaseServer
      .from('deals')
      .select('id, value', { count: 'exact' })
    const { data: dealsData, count: totalDeals } = await dealsQuery

    const totalDealsValue = dealsData?.reduce((sum, d) => sum + (d.value || 0), 0) || 0

    const currentMonth = new Date()
    currentMonth.setDate(1)
    const wonQuery = supabaseServer
      .from('deals')
      .select('id', { count: 'exact' })
      .eq('stage', 'won')
      .gte('created_at', currentMonth.toISOString())
    const { count: wonDeals } = await wonQuery

    const tasksQuery = supabaseServer
      .from('tasks')
      .select('id', { count: 'exact' })
      .eq('status', 'open')
    const { count: openTasks } = await tasksQuery

    const now = new Date()
    const interactionsQuery = supabaseServer
      .from('interactions')
      .select('id', { count: 'exact' })
      .gte('scheduled_at', now.toISOString())
      .is('completed_at', null)
    const { count: upcomingInteractions } = await interactionsQuery

    const metrics: DashboardMetrics = {
      total_contacts: totalContacts || 0,
      total_deals: totalDeals || 0,
      total_deals_value: totalDealsValue,
      won_deals_this_month: wonDeals || 0,
      open_tasks: openTasks || 0,
      upcoming_interactions: upcomingInteractions || 0,
    }

    return NextResponse.json(metrics)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
'@

# ============================================================================
# LAYOUT FILES (app/)
# ============================================================================

Write-Host "`n[3/6] Creating layout and pages..." -ForegroundColor Cyan

New-FileWithContent -Path "app\layout.tsx" -Content @'
import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Airanix CRM - Sales Pipeline Management',
  description: 'Cloud-based CRM for managing contacts, deals, and sales pipeline',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
'@

New-FileWithContent -Path "app\page.tsx" -Content @'
'use client'

import { useEffect, useState } from 'react'
import { getCurrentSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, BarChart3, Users, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getCurrentSession()
        if (session) {
          router.push('/dashboard')
        } else {
          setIsLoading(false)
        }
      } catch {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">
          <span className="text-3xl">📊</span> Airanix CRM
        </h1>
        <div className="flex gap-4">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <section className="px-6 py-20 max-w-7xl mx-auto text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Manage Your Sales Pipeline Like a Pro
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Airanix CRM helps teams track contacts, manage deals, and close more business.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 transition-colors"
          >
            Start Free Trial <ArrowRight size={20} />
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>
    </div>
  )
}
'@

# ============================================================================
# CONFIG FILES
# ============================================================================

Write-Host "`n[4/6] Creating configuration files..." -ForegroundColor Cyan

New-FileWithContent -Path "package.json" -Content @'
{
  "name": "airanix-crm",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/supabase-js": "^2.38.0",
    "lucide-react": "^0.383.0",
    "next": "^14.2.29",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3"
  }
}
'@

New-FileWithContent -Path "tsconfig.json" -Content @'
{
  "compilerOptions": {
    "target": "es2020",
    "useDefineForClassFields": true,
    "lib": ["es2020", "dom", "dom.iterable"],
    "module": "esnext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist", ".next"]
}
'@

New-FileWithContent -Path ".env.example" -Content @'
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
'@

# ============================================================================
# STUB PAGES (minimal - full components will go in next step)
# ============================================================================

Write-Host "`n[5/6] Creating pages (minimal structure)..." -ForegroundColor Cyan

New-FileWithContent -Path "app\auth\login\page.tsx" -Content @'
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-center mb-8">
          <span className="text-blue-600">📊</span> Airanix CRM
        </h1>
        <p className="text-center text-gray-600">Login functionality coming soon</p>
      </div>
    </div>
  )
}
'@

New-FileWithContent -Path "app\auth\signup\page.tsx" -Content @'
export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-center mb-8">
          <span className="text-blue-600">📊</span> Airanix CRM
        </h1>
        <p className="text-center text-gray-600">Signup functionality coming soon</p>
      </div>
    </div>
  )
}
'@

New-FileWithContent -Path "app\dashboard\page.tsx" -Content @'
export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-gray-600 mt-2">Dashboard coming soon</p>
    </div>
  )
}
'@

New-FileWithContent -Path "app\contacts\page.tsx" -Content @'
export default function ContactsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Contacts</h1>
      <p className="text-gray-600 mt-2">Contacts list coming soon</p>
    </div>
  )
}
'@

New-FileWithContent -Path "app\deals\page.tsx" -Content @'
export default function DealsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Pipeline</h1>
      <p className="text-gray-600 mt-2">Pipeline visualization coming soon</p>
    </div>
  )
}
'@

# ============================================================================
# SUMMARY
# ============================================================================

Write-Host "`n" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "`n📁 Files Created:" -ForegroundColor Green
Write-Host "  ✓ 6 lib utility files" -ForegroundColor Green
Write-Host "  ✓ 8 API route files" -ForegroundColor Green
Write-Host "  ✓ 5 Page files" -ForegroundColor Green
Write-Host "  ✓ 4 Config files" -ForegroundColor Green
Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Copy .env.example to .env.local" -ForegroundColor Yellow
Write-Host "  2. Add your Supabase credentials to .env.local" -ForegroundColor Yellow
Write-Host "  3. Create Supabase database tables (SQL provided)" -ForegroundColor Yellow
Write-Host "  4. Run: npm install" -ForegroundColor Yellow
Write-Host "  5. Run: npm run dev" -ForegroundColor Yellow
Write-Host "`n🔗 Access Your CRM:" -ForegroundColor Cyan
Write-Host "  Home: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Login: http://localhost:3000/auth/login" -ForegroundColor Cyan
Write-Host "  Signup: http://localhost:3000/auth/signup" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
