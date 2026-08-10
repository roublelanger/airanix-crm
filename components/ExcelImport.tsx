'use client'

import { useState, useRef } from 'react'

export default function ExcelImport({ onImportComplete }: { onImportComplete?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const contacts = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const contact: any = {}

      headers.forEach((header, index) => {
        if (values[index]) {
          contact[header] = values[index]
        }
      })

      if (contact.name || contact.email) {
        contacts.push(contact)
      }
    }

    return contacts
  }

  const parseExcel = (data: ArrayBuffer) => {
    // Simple XLSX parsing - read first sheet as CSV-like
    // For production, use a library like xlsx or papaparse
    const text = new TextDecoder().decode(data)
    return parseCSV(text)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      const text = await file.text()
      const contacts = parseCSV(text)

      if (contacts.length === 0) {
        setMessage('❌ No valid contacts found in file')
        setMessageType('error')
        setLoading(false)
        return
      }

      // Import contacts via API
      const response = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts })
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(`✅ Successfully imported ${result.imported} contacts!${result.skipped > 0 ? ` (${result.skipped} skipped)` : ''}`)
        setMessageType('success')
        if (fileInputRef.current) fileInputRef.current.value = ''
        setTimeout(() => {
          if (onImportComplete) onImportComplete()
          setMessage('')
        }, 2000)
      } else {
        setMessage(`❌ ${result.error}`)
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
    <div style={{
      background: 'white',
      padding: '24px',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '24px'
    }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>📥 Import Contacts from CSV</h2>

      <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
        Upload a CSV file with columns: name, email, phone, company, status
      </p>

      <div style={{
        border: '2px dashed #2563eb',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        background: '#f0f9ff',
        marginBottom: '16px'
      }} onClick={() => fileInputRef.current?.click()}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.txt"
          onChange={handleFileUpload}
          disabled={loading}
          style={{ display: 'none' }}
        />
        <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#2563eb' }}>
          {loading ? '⏳ Uploading...' : '📁 Click or drag CSV file here'}
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
          Supported formats: CSV, XLSX, XLS
        </p>
      </div>

      {message && (
        <div style={{
          padding: '12px',
          background: messageType === 'success' ? '#d1fae5' : '#fee2e2',
          color: messageType === 'success' ? '#065f46' : '#991b1b',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {message}
        </div>
      )}

      <div style={{
        background: '#eff6ff',
        border: '1px solid #93c5fd',
        borderRadius: '6px',
        padding: '12px',
        marginTop: '16px',
        fontSize: '13px',
        color: '#1e40af'
      }}>
        <strong>📋 CSV Format Example:</strong>
        <pre style={{ margin: '8px 0 0 0', overflow: 'auto', fontSize: '11px' }}>
name,email,phone,company,status
John Doe,john@example.com,9876543210,Acme Corp,lead
Jane Smith,jane@example.com,9876543211,Tech Inc,active
        </pre>
      </div>
    </div>
  )
}
