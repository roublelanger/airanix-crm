'use client'

import { useState, useRef } from 'react'

interface ParsedContact {
  company_name?: string
  contact_name?: string
  designation?: string
  email?: string
  phone?: string
  location?: string
  industry?: string
  remarks?: string
  assigned_to?: string
  status?: string
}

interface ImportResult {
  success: boolean
  imported: number
  failed: number
  total: number
  errors?: Array<{ row: number; error: string }>
  summary?: {
    companiesCreated: number
    contactsAdded: number
    skipped: number
  }
}

export default function EnhancedExcelImport({ onImportComplete }: { onImportComplete?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info' | ''>('')
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<ParsedContact[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSV = (text: string): ParsedContact[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0]
      .split(',')
      .map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))

    const contacts: ParsedContact[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const contact: ParsedContact = {}

      headers.forEach((header, index) => {
        if (values[index]) {
          // Map header names to expected field names
          const fieldName = header
            .replace('company_name', 'company_name')
            .replace('contact_name', 'contact_name')
            .replace('name', 'contact_name')

          contact[fieldName as keyof ParsedContact] = values[index]
        }
      })

      // At least name and email required
      if (contact.contact_name || contact.name || contact.email) {
        contacts.push(contact)
      }
    }

    return contacts
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      const text = await file.text()
      const parsed = parseCSV(text)

      if (parsed.length === 0) {
        setMessage('❌ No valid contacts found in file. Check CSV format.')
        setMessageType('error')
        setLoading(false)
        return
      }

      setPreviewData(parsed)
      setShowPreview(true)
      setMessage(`📋 Found ${parsed.length} contacts. Preview below:`)
      setMessageType('info')
      setLoading(false)
    } catch (error: any) {
      setMessage(`❌ Error parsing CSV: ${error.message}`)
      setMessageType('error')
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (previewData.length === 0) return

    setLoading(true)

    try {
      const response = await fetch('/api/contacts/import-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: previewData })
      })

      const result: ImportResult = await response.json()

      if (response.ok && result.success) {
        const summary = result.summary
        setMessage(
          `✅ Import successful!\n📊 ${summary?.contactsAdded} contacts added | ${summary?.companiesCreated} companies created${result.failed > 0 ? ` | ${result.failed} errors` : ''}`
        )
        setMessageType('success')
        setPreviewData([])
        setShowPreview(false)

        if (fileInputRef.current) fileInputRef.current.value = ''

        setTimeout(() => {
          if (onImportComplete) onImportComplete()
          setMessage('')
        }, 3000)
      } else {
        setMessage(
          `❌ Import failed: ${result.error || 'Unknown error'}\n${result.errors?.slice(0, 3).map(e => `Row ${e.row}: ${e.error}`).join('\n') || ''}`
        )
        setMessageType('error')
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>📥 Import Contacts from CSV</h2>

      <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
        Upload a CSV file with columns: Company Name, Contact Name, Designation, Email, Phone, Location, Industry, Remarks, Assigned To
      </p>

      <div
        style={{
          border: '2px dashed #2563eb',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: '#f0f9ff',
          marginBottom: '16px'
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.txt"
          onChange={handleFileUpload}
          disabled={loading}
          style={{ display: 'none' }}
        />
        <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#2563eb' }}>
          {loading ? '⏳ Processing...' : '📁 Click or drag CSV file here'}
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
          Supported formats: CSV, XLSX, XLS
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: '12px',
            background:
              messageType === 'success' ? '#d1fae5' : messageType === 'error' ? '#fee2e2' : '#dbeafe',
            color:
              messageType === 'success' ? '#065f46' : messageType === 'error' ? '#991b1b' : '#1e40af',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '16px',
            whiteSpace: 'pre-line'
          }}
        >
          {message}
        </div>
      )}

      {showPreview && previewData.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Preview (first 5 rows)</h3>
          <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600' }}>Company</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600' }}>Contact</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600' }}>Designation</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600' }}>Email</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600' }}>Location</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600' }}>Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 5).map((contact, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px' }}>{contact.company_name || '-'}</td>
                    <td style={{ padding: '8px' }}>{contact.contact_name || '-'}</td>
                    <td style={{ padding: '8px' }}>{contact.designation || '-'}</td>
                    <td style={{ padding: '8px', fontSize: '11px' }}>{contact.email || '-'}</td>
                    <td style={{ padding: '8px' }}>{contact.location || '-'}</td>
                    <td style={{ padding: '8px' }}>{contact.assigned_to || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleImport}
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '⏳ Importing...' : '✅ Import All ' + previewData.length + ' Contacts'}
            </button>
            <button
              onClick={() => {
                setShowPreview(false)
                setPreviewData([])
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: '#f3f4f6',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '6px', padding: '12px', marginTop: '16px', fontSize: '13px', color: '#1e40af' }}>
        <strong>📋 CSV Format Template:</strong>
        <pre style={{ margin: '8px 0 0 0', overflow: 'auto', fontSize: '11px', background: '#f0f9ff', padding: '8px', borderRadius: '4px' }}>
Company Name,Contact Name,Designation,Email,Phone,Location,Industry,Remarks,Assigned To
Acme Corp,John Doe,Sales Manager,john@acme.com,9876543210,New York,Technology,High priority,Sarah
Acme Corp,Jane Smith,CTO,jane@acme.com,9876543211,New York,Technology,Decision maker,Sarah
Tech Inc,Bob Johnson,CEO,bob@tech.com,9876543212,San Francisco,SaaS,Initial meeting,Mike</pre>
      </div>
    </div>
  )
}
