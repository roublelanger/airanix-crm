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
  location?: string
  industry?: string
  remarks?: string
  assigned_to?: string
  platform?: string
  needs?: string
  status: 'lead' | 'prospect' | 'customer' | 'lost'
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
