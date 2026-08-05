export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    lead: 'bg-blue-100 text-blue-800',
    prospect: 'bg-purple-100 text-purple-800',
    customer: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
