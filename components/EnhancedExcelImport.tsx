'use client'

import { useState, useRef } from 'react'

interface ParsedContact {
  company_name: string
  contact_name: string
  designation?: string
  email: string
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

const EXPECTED_HEADERS = [
  'company_name',
  'contact_name',
  'designation',
  'email',
  'phone',
  'location',
  'industry',
  'remarks',
  'assigned_to',
  'status'
]

export default function EnhancedExcelImport({ onImportComplete }: { onImportComplete?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info' | ''>('')
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<ParsedContact[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Robust CSV parsing with proper quote handling
  const parseCSV = (text: string): ParsedContact[] => {
    try {
      const lines = text.split('\n').filter(line => line.trim())

      if (lines.length < 2) {
        throw new Error('CSV must have header and at least one data row')
      }

      // Parse header row - handle spaces and case variations
      const rawHeaders = lines[0].split(',').map(h => h.trim())
      const headers = rawHeaders.map(h =>
        h.toLowerCase()
          .replace(/\s+/g, '_')
          .replace('company', 'company_name')
          .replace('contact', 'contact_name')
          .replace('name', 'contact_name')
      )

      const contacts: ParsedContact[] = []
      const errors: Array<{ row: number; error: string }> = []

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = parseCSVLine(lines[i])

          if (values.length === 0 || !values.some(v => v.trim())) {
            continue // Skip empty rows
          }

          const contact: any = {}

          headers.forEach((header, index) => {
            const value = values[index]?.trim() || ''
            if (value) {
              contact[header] = value
            }
          })

          // Validate required fields
          if (!contact.contact_name || !contact.email) {
            errors.push({
              row: i + 1,
              error: 'Missing required fields (Contact Name and Email)'
            })
            continue
          }

          // Set defaults for required fields
          contact.company_name = contact.company_name || 'Unassigned'
          contact.status = contact.status || 'LEAD'

          contacts.push(contact as ParsedContact)
        } catch (error: any) {
          errors.push({
            row: i + 1,
            error: `Parse error: ${error.message}`
          })
        }
      }

      if (contacts.length === 0) {
        throw new Error('No valid contacts found after parsing')
      }

      return contacts
    } catch (error: any) {
      throw new Error(`CSV Parse Error: ${error.message}`)
    }
  }

  // Parse single CSV line with proper quote handling
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let insideQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"'
          i++
        } else {
          insideQuotes = !insideQuotes
        }
      } else if (char === ',' && !insideQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }

    result.push(current)
    return result
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      // Validate file
      if (!file.name.match(/\.(csv|xlsx?|txt)$/i)) {
        throw new Error('Invalid file type. Please upload a CSV, XLSX, or TXT file.')
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit')
      }

      const text = await file.text()

      if (!text || text.trim().length === 0) {
        throw new Error('File is empty')
      }

      const parsed = parseCSV(text)

      if (parsed.length === 0) {
        throw new Error('No valid contacts found. Check CSV format and required fields.')
      }

      setPreviewData(parsed)
      setShowPreview(true)
      setMessage(`📋 Found ${parsed.length} valid contacts ready to import.`)
      setMessageType('info')
    } catch (error: any) {
      setMessage(`❌ ${error.message || 'Error parsing CSV'}`)
      setMessageType('error')
      setShowPreview(false)
      setPreviewData([])
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (previewData.length === 0) {
      setMessage('❌ No contacts to import')
      setMessageType('error')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/contacts/import-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: previewData })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result: ImportResult = await response.json()

      if (!result) {
        throw new Error('Empty response from server')
      }

      if (result.success) {
        const summary = result.summary || { companiesCreated: 0, contactsAdded: 0, skipped: 0 }
        const errorMsg = result.failed > 0
          ? ` | ${result.failed} failed`
          : ''

        setMessage(
          `✅ Import Successful!\n📊 Companies: ${summary.companiesCreated} created\n👥 Contacts: ${summary.contactsAdded} added${result.failed > 0 ? errorMsg : ''}`
        )
        setMessageType('success')
        setPreviewData([])
        setShowPreview(false)

        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }

        setTimeout(() => {
          setMessage('')
          if (onImportComplete) {
            onImportComplete()
          }
        }, 3000)
      } else {
        const errorDetails = result.errors
          ?.slice(0, 5)
          .map(e => `Row ${e.row}: ${e.error}`)
          .join('\n') || 'Unknown error'

        setMessage(`❌ Import Failed\n${result.summary?.companiesCreated || 0} companies created, ${result.summary?.contactsAdded || 0} contacts added\n\nErrors:\n${errorDetails}`)
        setMessageType('error')
      }
    } catch (error: any) {
      setMessage(`❌ Import Error: ${error.message || 'Failed to import contacts'}`)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setShowPreview(false)
    setPreviewData([])
    setMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>📥 Import Contacts from CSV</h2>

      <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
        Upload a CSV with: Company Name, Contact Name, Designation, Email, Phone, Location, Industry, Remarks, Assigned To
      </p>

      <div
        style={{
          border: '2px dashed #2563eb',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          cursor: loading ? 'not-allowed' : 'pointer',
          background: '#f0f9ff',
          marginBottom: '16px',
          opacity: loading ? 0.6 : 1
        }}
        onClick={() => !loading && fileInputRef.current?.click()}
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
          {loading ? '⏳ Processing...' : '📁 Click or drag CSV file'}
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
          CSV, XLSX, XLS (max 10MB)
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
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '16px',
            whiteSpace: 'pre-line',
            lineHeight: '1.5'
          }}
        >
          {message}
        </div>
      )}

      {showPreview && previewData.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
            Preview ({Math.min(5, previewData.length)} of {previewData.length} rows)
          </h3>
          <div style={{ overflowX: 'auto', marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', whiteSpace: 'nowrap' }}>Company</th>
                  <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', whiteSpace: 'nowrap' }}>Contact Name</th>
                  <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', whiteSpace: 'nowrap' }}>Email</th>
                  <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', whiteSpace: 'nowrap' }}>Designation</th>
                  <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', whiteSpace: 'nowrap' }}>Location</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 5).map((contact, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px' }}>{contact.company_name}</td>
                    <td style={{ padding: '10px' }}>{contact.contact_name}</td>
                    <td style={{ padding: '10px', fontSize: '11px' }}>{contact.email}</td>
                    <td style={{ padding: '10px' }}>{contact.designation || '-'}</td>
                    <td style={{ padding: '10px' }}>{contact.location || '-'}</td>
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
              {loading ? '⏳ Importing...' : `✅ Import ${previewData.length} Contacts`}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: '#f3f4f6',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '6px', padding: '12px', marginTop: '16px', fontSize: '12px', color: '#1e40af' }}>
        <strong>📋 CSV Format (Required Fields: Company Name, Contact Name, Email):</strong>
        <pre style={{ margin: '8px 0 0 0', overflow: 'auto', fontSize: '11px', background: '#f0f9ff', padding: '8px', borderRadius: '4px', lineHeight: '1.4' }}>
{`Company Name,Contact Name,Designation,Email,Phone,Location,Industry,Remarks,Assigned To
Acme Corp,John Doe,Sales Manager,john@acme.com,9876543210,New York,Technology,High priority,Sarah
Acme Corp,Jane Smith,CTO,jane@acme.com,9876543211,New York,Technology,Decision maker,Sarah`}
        </pre>
      </div>
    </div>
  )
}
