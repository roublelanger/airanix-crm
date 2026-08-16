'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  location?: string
  designation?: string
  industry?: string
  remarks?: string
  assigned_to?: string
  platform?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

function ContactsContent() {
  const searchParams = useSearchParams()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ company: searchParams.get('company') || '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [duplicateWarning, setDuplicateWarning] = useState<{ show: boolean; existingContact: Contact | null; pendingSave: boolean }>({ show: false, existingContact: null, pendingSave: false })
  const [toasts, setToasts] = useState<Toast[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; contactId: string; contactName: string } | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status' | 'company'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeletePassword, setShowDeletePassword] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwordChangeForm, setPasswordChangeForm] = useState({ current: '', new: '', confirm: '' })
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [resetEmailStatus, setResetEmailStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const resetEmail = 'rouble@airanix.com'
  const [storedPassword, setStoredPassword] = useState('191288')
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set())
  const [showImportModal, setShowImportModal] = useState(false)
  const [importData, setImportData] = useState<any[]>([])
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)

  // Advanced Filters
  const [advancedFilters, setAdvancedFilters] = useState({
    status: '',
    industry: '',
    dateFrom: '',
    dateTo: '',
    assignedTo: ''
  })

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    company: true,
    designation: true,
    phone: true,
    email: true
  })

  // Bulk Status Update
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false)
  const [bulkStatusValue, setBulkStatusValue] = useState('NEW')

  // Statistics
  const [stats, setStats] = useState({ total: 0, byStatus: {} as Record<string, number> })

  // Tags and Notes
  const [showTagsModal, setShowTagsModal] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [selectedContactForModal, setSelectedContactForModal] = useState<Contact | null>(null)
  const [newTag, setNewTag] = useState('')
  const [newNote, setNewNote] = useState('')
  const [availableTags] = useState(['Client', 'Partner', 'Prospect', 'Lead', 'VIP', 'Inactive', 'Hot', 'Cold'])

  // Add or remove tag from contact
  async function handleTagToggle(contactId: string, tag: string) {
    try {
      const contact = contacts.find(c => c.id === contactId)
      if (!contact) return

      const tags = (contact.remarks ? contact.remarks.split(',').map(t => t.trim()) : [])
      const tagIndex = tags.indexOf(tag)

      if (tagIndex > -1) {
        tags.splice(tagIndex, 1)
      } else {
        tags.push(tag)
      }

      const remarksValue = tags.length > 0 ? tags.join(', ') : ''

      const res = await fetch(`/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: remarksValue })
      })

      if (res.ok) {
        fetchContacts()
        showToast('success', `Tag updated for ${contact.name}`)
      }
    } catch (error) {
      console.error('Error updating tags:', error)
      showToast('error', 'Failed to update tag')
    }
  }

  // Add note to contact
  async function handleAddNote(contactId: string, noteText: string) {
    if (!noteText.trim()) {
      showToast('warning', 'Note cannot be empty')
      return
    }

    try {
      const contact = contacts.find(c => c.id === contactId)
      if (!contact) return

      const timestamp = new Date().toLocaleString()
      const noteWithTime = `[${timestamp}] ${noteText}`

      const existingNotes = contact.location ? `${contact.location}\n${noteWithTime}` : noteWithTime

      const res = await fetch(`/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: existingNotes })
      })

      if (res.ok) {
        fetchContacts()
        setNewNote('')
        showToast('success', 'Note added')
      }
    } catch (error) {
      console.error('Error adding note:', error)
      showToast('error', 'Failed to add note')
    }
  }

  // Load stored password from localStorage on mount
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('deletePassword') : null
    if (saved) setStoredPassword(saved)
  }, [])

  const correctPassword = storedPassword
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    designation: '',
    industry: '',
    remarks: '',
    assigned_to: '',
    status: 'NEW',
    platform: '',
    followupDate: '',
    followupTime: '',
    followupType: 'meeting',
    followupNotes: ''
  })

  useEffect(() => {
    fetchContacts()
  }, [])

  // Toast auto-dismiss effect
  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map((toast) => {
      const duration = toast.duration || (toast.type === 'error' ? 5000 : 3000)
      return setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, duration)
    })
    return () => timers.forEach(timer => clearTimeout(timer))
  }, [toasts])

  function showToast(type: 'success' | 'error' | 'info' | 'warning', message: string, duration?: number) {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { id, type, message, duration }])
  }

  // Validation utilities
  function validateEmail(email: string): string | null {
    if (!email) return null // empty is checked separately
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Invalid email format'
    return null
  }

  function validatePhone(phone: string): string | null {
    if (!phone) return null // optional field
    // Basic validation: at least 7 digits, can contain +, -, (), spaces
    const phoneRegex = /^[\d+\-() ]{7,}$/
    if (!phoneRegex.test(phone)) return 'Phone must contain at least 7 digits'
    if (phone.replace(/\D/g, '').length > 15) return 'Phone number too long'
    return null
  }

  function validateField(fieldName: string, value: string): string | null {
    switch (fieldName) {
      case 'name':
        if (!value) return 'Name is required'
        if (value.length < 2) return 'Name must be at least 2 characters'
        if (value.length > 100) return 'Name must be under 100 characters'
        return null
      case 'email':
        if (!value) return 'Email is required'
        return validateEmail(value)
      case 'phone':
        return validatePhone(value)
      case 'company':
        if (value && value.length > 100) return 'Company name too long'
        return null
      case 'designation':
        if (value && value.length > 100) return 'Designation too long'
        return null
      case 'industry':
        if (value && value.length > 100) return 'Industry too long'
        return null
      case 'location':
        if (value && value.length > 100) return 'Location too long'
        return null
      case 'remarks':
        if (value && value.length > 500) return 'Remarks must be under 500 characters'
        return null
      default:
        return null
    }
  }

  function handleFieldChange(fieldName: string, value: string) {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
    // Real-time validation
    const error = validateField(fieldName, value)
    setFormErrors(prev => {
      const updated = { ...prev }
      if (error) {
        updated[fieldName] = error
      } else {
        delete updated[fieldName]
      }
      return updated
    })
  }

  function sortContacts(contactsToSort: Contact[]): Contact[] {
    const sorted = [...contactsToSort].sort((a, b) => {
      let compareValue = 0

      switch (sortBy) {
        case 'name':
          compareValue = (a.name || '').localeCompare(b.name || '')
          break
        case 'date':
          const dateA = new Date(a.createdAt || 0).getTime()
          const dateB = new Date(b.createdAt || 0).getTime()
          compareValue = dateA - dateB
          break
        case 'status':
          compareValue = (a.status || '').localeCompare(b.status || '')
          break
        case 'company':
          compareValue = (a.company || '').localeCompare(b.company || '')
          break
      }

      return sortOrder === 'asc' ? compareValue : -compareValue
    })

    return sorted
  }

  async function fetchContacts() {
    try {
      const res = await fetch('/api/contacts')
      const data = await res.json()
      if (Array.isArray(data)) {
        // Deduplicate contacts by email and name combination
        const seen = new Map<string, Contact>()
        const deduplicated = data.filter(contact => {
          const key = `${contact.email?.toLowerCase() || ''}:${contact.name?.toLowerCase() || ''}`
          if (seen.has(key)) {
            return false
          }
          seen.set(key, contact)
          return true
        })
        setContacts(deduplicated)
      } else {
        console.error('API returned non-array:', data)
        setContacts([])
        setError(data?.error || 'Failed to load contacts')
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveContact(ignoreDuplicate: boolean = false) {
    // Validate all fields before save
    const errors: Record<string, string> = {}
    const nameError = validateField('name', formData.name)
    const emailError = validateField('email', formData.email)
    const phoneError = validateField('phone', formData.phone)

    if (nameError) errors['name'] = nameError
    if (emailError) errors['email'] = emailError
    if (phoneError) errors['phone'] = phoneError

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      showToast('error', 'Please fix validation errors before saving')
      return
    }

    // Check for duplicate contact (by name only)
    if (!ignoreDuplicate && !editingId) {
      const existingContact = contacts.find(
        c => c.name?.toLowerCase() === formData.name.toLowerCase()
      )

      if (existingContact) {
        setDuplicateWarning({
          show: true,
          existingContact,
          pendingSave: true
        })
        return
      }
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/contacts/${editingId}` : '/api/contacts'

      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        location: formData.location || null,
        designation: formData.designation || null,
        industry: formData.industry || null,
        remarks: formData.remarks || null,
        assigned_to: formData.assigned_to || null,
        status: formData.status,
        platform: formData.platform || null
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const data = await res.json()
        showToast('error', data.error || 'Failed to save contact')
        return
      }

      const data = await res.json()

      // Create follow-up if specified
      if (formData.followupDate) {
        try {
          await fetch('/api/followups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: `Follow-up with ${formData.name}`,
              description: formData.followupNotes,
              dueDate: formData.followupDate,
              dueTime: formData.followupTime,
              priority: 'high',
              type: formData.followupType,
              status: 'open',
              contactId: data.id || editingId
            })
          })
        } catch (error) {
          console.error('Follow-up creation failed:', error)
        }
      }

      resetForm()
      fetchContacts()
      showToast('success', 'Contact saved successfully!')
    } catch (error) {
      console.error('Error saving contact:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to save contact')
    }
  }

  function handleDeleteContact(id: string, name: string) {
    setDeleteConfirm({ show: true, contactId: id, contactName: name })
    setDeletePassword('')  // Clear password field when delete modal opens
    setShowDeletePassword(false)  // Reset to initial confirmation step
  }

  async function confirmDelete(id: string) {
    setDeleteConfirm(null)
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        showToast('error', 'Failed to delete contact')
        return
      }
      fetchContacts()
      showToast('success', 'Contact deleted successfully')
    } catch (error) {
      console.error('Error deleting contact:', error)
      showToast('error', 'Error deleting contact')
    }
  }

  // Checkbox handlers
  function toggleContactSelection(contactId: string) {
    setSelectedContacts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(contactId)) {
        newSet.delete(contactId)
      } else {
        newSet.add(contactId)
      }
      return newSet
    })
  }

  function toggleSelectAll() {
    if (selectedContacts.size === paginatedContacts.length && selectedContacts.size > 0) {
      setSelectedContacts(new Set())
    } else {
      setSelectedContacts(new Set(paginatedContacts.map(c => c.id)))
    }
  }

  // Export to Excel
  function exportToExcel() {
    if (selectedContacts.size === 0) {
      showToast('warning', 'Please select at least one contact to export')
      return
    }

    try {
      const XLSX = require('xlsx')
      const contactsToExport = paginatedContacts.filter(c => selectedContacts.has(c.id))

      const data = contactsToExport.map(contact => ({
        'Name': contact.name,
        'Email': contact.email || '',
        'Phone': contact.phone || '',
        'Company': contact.company || '',
        'Designation': contact.designation || '',
        'Location': contact.location || '',
        'Industry': contact.industry || '',
        'Status': contact.status || 'NEW',
        'Assigned To': contact.assigned_to || '',
        'Platform': contact.platform || '',
        'Remarks': contact.remarks || '',
        'Date Added': contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : ''
      }))

      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts')

      // Set column widths
      worksheet['!cols'] = [
        { wch: 20 }, // Name
        { wch: 25 }, // Email
        { wch: 15 }, // Phone
        { wch: 20 }, // Company
        { wch: 20 }, // Designation
        { wch: 15 }, // Location
        { wch: 15 }, // Industry
        { wch: 12 }, // Status
        { wch: 15 }, // Assigned To
        { wch: 15 }, // Platform
        { wch: 30 }, // Remarks
        { wch: 15 }  // Date Added
      ]

      XLSX.writeFile(workbook, `Contacts_Export_${new Date().toISOString().split('T')[0]}.xlsx`)
      showToast('success', `Exported ${selectedContacts.size} contact(s) to Excel`)
      setSelectedContacts(new Set())
    } catch (error) {
      console.error('Export error:', error)
      showToast('error', 'Failed to export contacts')
    }
  }

  // Import handler
  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const XLSX = require('xlsx')
      const reader = new FileReader()

      reader.onload = (e: any) => {
        const data = e.target.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        setImportData(jsonData)
        setShowImportModal(true)
        showToast('info', `Loaded ${jsonData.length} records from file`)
      }

      reader.readAsBinaryString(file)
    } catch (error) {
      console.error('Import error:', error)
      showToast('error', 'Failed to read file. Please ensure it\'s a valid Excel or CSV file.')
    }
  }

  // Confirm bulk import with duplicate detection
  async function confirmBulkImport() {
    if (importData.length === 0) return

    try {
      const XLSX = require('xlsx')
      let imported = 0
      let duplicates = 0
      const rejectedRecords: any[] = []
      const existingEmails = new Set(contacts.map(c => c.email?.toLowerCase().trim()))
      const existingNames = new Set(contacts.map(c => c.name?.toLowerCase().trim()))

      for (const row of importData) {
        const contactData = {
          name: row['Name'] || row['name'] || '',
          email: row['Email'] || row['email'] || '',
          phone: row['Phone'] || row['phone'] || '',
          company: row['Company'] || row['company'] || '',
          designation: row['Designation'] || row['designation'] || '',
          location: row['Location'] || row['location'] || '',
          industry: row['Industry'] || row['industry'] || '',
          status: row['Status'] || row['status'] || 'NEW',
          assigned_to: row['Assigned To'] || row['assigned_to'] || '',
          platform: row['Platform'] || row['platform'] || '',
          remarks: row['Remarks'] || row['remarks'] || ''
        }

        // Validation: Name and Email required
        if (!contactData.name || !contactData.email) {
          rejectedRecords.push({
            ...row,
            'Reject Reason': 'Missing Name or Email'
          })
          duplicates++
          continue
        }

        // Check for duplicate email
        const emailLower = contactData.email.toLowerCase().trim()
        if (existingEmails.has(emailLower)) {
          rejectedRecords.push({
            ...row,
            'Reject Reason': 'Duplicate Email'
          })
          duplicates++
          continue
        }

        // Check for duplicate name
        const nameLower = contactData.name.toLowerCase().trim()
        if (existingNames.has(nameLower)) {
          rejectedRecords.push({
            ...row,
            'Reject Reason': 'Duplicate Name'
          })
          duplicates++
          continue
        }

        // If not duplicate, import it
        try {
          const res = await fetch('/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactData)
          })

          if (res.ok) {
            imported++
            existingEmails.add(emailLower)
            existingNames.add(nameLower)
          } else {
            rejectedRecords.push({
              ...row,
              'Reject Reason': 'Failed to Create'
            })
            duplicates++
          }
        } catch (error) {
          rejectedRecords.push({
            ...row,
            'Reject Reason': 'Error During Import'
          })
          duplicates++
        }
      }

      // Generate rejected records file if there are any
      if (rejectedRecords.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(rejectedRecords)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Rejected Records')

        worksheet['!cols'] = [
          { wch: 20 }, // Name
          { wch: 25 }, // Email
          { wch: 15 }, // Phone
          { wch: 20 }, // Company
          { wch: 20 }, // Designation
          { wch: 15 }, // Location
          { wch: 15 }, // Industry
          { wch: 12 }, // Status
          { wch: 15 }, // Assigned To
          { wch: 15 }, // Platform
          { wch: 30 }, // Remarks
          { wch: 25 }  // Reject Reason
        ]

        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `Rejected_Contacts_${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }

      setShowImportModal(false)
      setImportData([])
      fetchContacts()

      if (duplicates > 0) {
        showToast('success', `✓ Imported: ${imported} | ✗ Rejected: ${duplicates} (check downloaded file)`)
      } else {
        showToast('success', `Successfully imported ${imported} contact(s)!`)
      }
    } catch (error) {
      console.error('Bulk import error:', error)
      showToast('error', 'Error importing contacts')
    }
  }

  // Load column preferences from localStorage
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('contactColumnPrefs') : null
    if (saved) {
      try {
        setVisibleColumns(JSON.parse(saved))
      } catch {
        // Use defaults if parse fails
      }
    }
  }, [])

  // Save column preferences
  function saveColumnPreferences(newPrefs: typeof visibleColumns) {
    setVisibleColumns(newPrefs)
    if (typeof window !== 'undefined') {
      localStorage.setItem('contactColumnPrefs', JSON.stringify(newPrefs))
    }
  }

  // Calculate statistics
  useEffect(() => {
    const byStatus: Record<string, number> = {}
    contacts.forEach(contact => {
      const status = contact.status || 'NEW'
      byStatus[status] = (byStatus[status] || 0) + 1
    })
    setStats({ total: contacts.length, byStatus })
  }, [contacts])

  // Apply advanced filters
  function applyAdvancedFilters(contactsList: Contact[]) {
    return contactsList.filter(contact => {
      if (advancedFilters.status && contact.status !== advancedFilters.status) return false
      if (advancedFilters.industry && contact.industry !== advancedFilters.industry) return false
      if (advancedFilters.assignedTo && contact.assigned_to !== advancedFilters.assignedTo) return false

      if (advancedFilters.dateFrom && contact.createdAt) {
        const contactDate = new Date(contact.createdAt)
        const filterDate = new Date(advancedFilters.dateFrom)
        if (contactDate < filterDate) return false
      }

      if (advancedFilters.dateTo && contact.createdAt) {
        const contactDate = new Date(contact.createdAt)
        const filterDate = new Date(advancedFilters.dateTo)
        if (contactDate > filterDate) return false
      }

      return true
    })
  }

  // Bulk status update
  async function confirmBulkStatusUpdate() {
    if (selectedContacts.size === 0) return

    try {
      let updated = 0
      for (const id of selectedContacts) {
        try {
          const res = await fetch(`/api/contacts/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: bulkStatusValue })
          })
          if (res.ok) updated++
        } catch (error) {
          console.error(`Failed to update contact ${id}:`, error)
        }
      }

      setShowBulkStatusModal(false)
      setSelectedContacts(new Set())
      fetchContacts()
      showToast('success', `Updated ${updated} contact(s) to ${bulkStatusValue}`)
    } catch (error) {
      console.error('Bulk status update error:', error)
      showToast('error', 'Error updating contacts')
    }
  }

  // Bulk delete
  async function confirmBulkDelete() {
    if (selectedContacts.size === 0) return

    try {
      let deleted = 0
      const contactIdsToDelete = Array.from(selectedContacts)

      for (const id of contactIdsToDelete) {
        try {
          const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
          if (res.ok) {
            deleted++
          }
        } catch (error) {
          console.error(`Failed to delete contact ${id}:`, error)
        }
      }

      setShowBulkDeleteConfirm(false)
      setSelectedContacts(new Set())
      fetchContacts()
      showToast('success', `Deleted ${deleted} contact(s)`)
    } catch (error) {
      console.error('Bulk delete error:', error)
      showToast('error', 'Error deleting contacts')
    }
  }

  function handleEditContact(contact: Contact) {
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      company: contact.company || '',
      location: contact.location || '',
      designation: contact.designation || '',
      industry: contact.industry || '',
      remarks: contact.remarks || '',
      assigned_to: contact.assigned_to || '',
      status: contact.status || 'NEW',
      platform: contact.platform || '',
      followupDate: '',
      followupTime: '',
      followupType: 'meeting',
      followupNotes: ''
    })
    setEditingId(contact.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      location: '',
      designation: '',
      industry: '',
      remarks: '',
      assigned_to: '',
      status: 'NEW',
      platform: '',
      followupDate: '',
      followupTime: '',
      followupType: 'meeting',
      followupNotes: ''
    })
    setFormErrors({})
    setEditingId(null)
    setShowForm(false)
  }

  // Filter by search query
  const searchedContacts = contacts.filter(contact => {
    const query = searchQuery.toLowerCase()
    return (
      contact.name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.company?.toLowerCase().includes(query) ||
      contact.location?.toLowerCase().includes(query)
    )
  })

  // Apply advanced filters
  const advancedFilteredContacts = applyAdvancedFilters(searchedContacts)

  // Group contacts by company
  const groupedContacts = advancedFilteredContacts.reduce((acc: Record<string, Contact[]>, contact) => {
    const company = contact.company || 'Unassigned'
    if (!acc[company]) acc[company] = []
    acc[company].push(contact)
    return acc
  }, {})

  const filteredCompanies = Object.keys(groupedContacts).filter(
    company => !filters.company || company === filters.company
  )

  // Get all filtered contacts (for pagination)
  const allFilteredContacts = filteredCompanies.flatMap(company => groupedContacts[company])
  const sortedContacts = sortContacts(allFilteredContacts)

  // Calculate pagination
  const totalContacts = sortedContacts.length
  const totalPages = Math.ceil(totalContacts / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedContacts = sortedContacts.slice(startIndex, endIndex)

  // Reset to page 1 if current page exceeds max pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

  // Reset pagination when search/filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filters.company])

  const totalFiltered = filteredCompanies.reduce((sum, company) => sum + groupedContacts[company].length, 0)

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', minHeight: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>
            Contacts
          </h1>
          <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
            Manage your {totalFiltered} leads and customers
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            style={{
              padding: '10px 16px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            title="Change password (remember current password)"
          >
            🔐 Change Password
          </button>
          <button
            onClick={() => setShowPasswordReset(!showPasswordReset)}
            style={{
              padding: '10px 16px',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            title="Reset password via email (forgot current password)"
          >
            📧 Reset Password
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '10px 20px',
              background: showForm ? '#ef4444' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {showForm ? '✕ Cancel' : '+ New Contact'}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '32px',
            borderRadius: '14px',
            marginBottom: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <span style={{ fontSize: '24px' }}>{editingId ? '✏️' : '➕'}</span>
            <div>
              <h2 style={{ margin: '0', fontSize: '20px', fontWeight: '800', color: '#111827' }}>
                {editingId ? 'Edit Contact' : 'New Contact'}
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                {editingId ? 'Update contact information' : 'Add a new contact to your CRM'}
              </p>
            </div>
          </div>

          {/* Basic Info */}
          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 28px 0' }}>
            <legend style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>👤 Contact Information</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <input type="text" placeholder="Name *" value={formData.name} onChange={(e) => handleFieldChange('name', e.target.value)} style={{ padding: '11px 12px', border: formErrors.name ? '1px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = formErrors.name ? '#dc2626' : '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
                {formErrors.name && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>⚠️ {formErrors.name}</p>}
              </div>
              <div>
                <input type="email" placeholder="Email *" value={formData.email} onChange={(e) => handleFieldChange('email', e.target.value)} style={{ padding: '11px 12px', border: formErrors.email ? '1px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = formErrors.email ? '#dc2626' : '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
                {formErrors.email && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>⚠️ {formErrors.email}</p>}
              </div>
              <div>
                <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => handleFieldChange('phone', e.target.value)} style={{ padding: '11px 12px', border: formErrors.phone ? '1px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = formErrors.phone ? '#dc2626' : '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
                {formErrors.phone && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>⚠️ {formErrors.phone}</p>}
              </div>
              <div>
                <input type="text" placeholder="Location" value={formData.location} onChange={(e) => handleFieldChange('location', e.target.value)} style={{ padding: '11px 12px', border: formErrors.location ? '1px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = formErrors.location ? '#dc2626' : '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
                {formErrors.location && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>⚠️ {formErrors.location}</p>}
              </div>
            </div>
          </fieldset>

          {/* Company & Professional */}
          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 28px 0' }}>
            <legend style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏢 Company & Professional Details</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <input type="text" placeholder="Company" value={formData.company} onChange={(e) => handleFieldChange('company', e.target.value)} style={{ padding: '11px 12px', border: formErrors.company ? '1px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = formErrors.company ? '#dc2626' : '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
                {formErrors.company && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>⚠️ {formErrors.company}</p>}
              </div>
              <div>
                <input type="text" placeholder="Designation" value={formData.designation} onChange={(e) => handleFieldChange('designation', e.target.value)} style={{ padding: '11px 12px', border: formErrors.designation ? '1px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = formErrors.designation ? '#dc2626' : '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
                {formErrors.designation && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>⚠️ {formErrors.designation}</p>}
              </div>
              <div>
                <input type="text" placeholder="Industry" value={formData.industry} onChange={(e) => handleFieldChange('industry', e.target.value)} style={{ padding: '11px 12px', border: formErrors.industry ? '1px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = formErrors.industry ? '#dc2626' : '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
                {formErrors.industry && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>⚠️ {formErrors.industry}</p>}
              </div>
              <div>
                <input type="text" placeholder="Assigned To" value={formData.assigned_to} onChange={(e) => handleFieldChange('assigned_to', e.target.value)} style={{ padding: '11px 12px', border: formErrors.assigned_to ? '1px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = formErrors.assigned_to ? '#dc2626' : '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }} />
                {formErrors.assigned_to && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>⚠️ {formErrors.assigned_to}</p>}
              </div>
            </div>
          </fieldset>

          {/* Platform & Domain */}
          <fieldset style={{ border: '1px solid #e0e7ff', padding: '16px', borderRadius: '8px', background: '#f0f4ff', margin: '0 0 24px 0' }}>
            <legend style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af', padding: '0 8px', textTransform: 'uppercase' }}>☁️ Platform/Domain (Optional)</legend>
            <select value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} style={{ padding: '10px', border: '1px solid #bfdbfe', borderRadius: '6px', width: '100%', marginTop: '12px', fontSize: '14px', backgroundColor: 'white' }}>
              <option value="">-- Select Platform --</option>
              <option value="Google Workspace">🔵 Google Workspace</option>
              <option value="Microsoft 365">🔷 Microsoft 365</option>
              <option value="Zoho">🟣 Zoho Suite</option>
              <option value="AWS">🟠 AWS</option>
              <option value="Azure">🔵 Azure</option>
              <option value="Salesforce">☁️ Salesforce</option>
              <option value="HubSpot">🧡 HubSpot</option>
              <option value="Monday.com">📅 Monday.com</option>
              <option value="Asana">✓ Asana</option>
              <option value="Jira">🔵 Jira</option>
              <option value="Slack">🟣 Slack</option>
              <option value="Teams">💜 Microsoft Teams</option>
              <option value="Other">🔧 Other</option>
            </select>
          </fieldset>

          {/* Status & Notes */}
          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 24px 0' }}>
            <legend style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>Status & Remarks</legend>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%', marginBottom: '16px', fontSize: '14px' }}>
              <option value="NEW">New</option>
              <option value="LEAD">Lead</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="COLD">Cold</option>
              <option value="CLOSED">Closed</option>
            </select>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Remarks and notes</label>
                <span style={{ fontSize: '12px', color: formData.remarks.length > 450 ? '#ea580c' : '#9ca3af' }}>
                  {formData.remarks.length}/500
                </span>
              </div>
              <textarea value={formData.remarks} onChange={(e) => handleFieldChange('remarks', e.target.value)} placeholder="Remarks and notes" style={{ padding: '10px', border: formErrors.remarks ? '1px solid #dc2626' : '1px solid #ddd', borderRadius: '6px', width: '100%', minHeight: '80px', fontFamily: 'system-ui', boxSizing: 'border-box', fontSize: '14px', marginBottom: formErrors.remarks ? '4px' : '16px', transition: 'all 0.2s' }} />
              {formErrors.remarks && <p style={{ margin: '4px 0 16px 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>⚠️ {formErrors.remarks}</p>}
            </div>
          </fieldset>

          {/* Follow-up */}
          <fieldset style={{ border: '1px solid #bfdbfe', padding: '16px', borderRadius: '8px', background: '#f0f9ff', margin: '0 0 24px 0' }}>
            <legend style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af', padding: '0 8px', textTransform: 'uppercase' }}>📅 Schedule Follow-up (Optional)</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px', marginTop: '12px' }}>
              <input type="date" value={formData.followupDate} onChange={(e) => setFormData({ ...formData, followupDate: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
              <input type="time" value={formData.followupTime} onChange={(e) => setFormData({ ...formData, followupTime: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
            </div>
            <select value={formData.followupType} onChange={(e) => setFormData({ ...formData, followupType: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%', marginBottom: '16px', fontSize: '14px' }}>
              <option value="meeting">📅 Meeting</option>
              <option value="call">📞 Call</option>
              <option value="email">📧 Email</option>
              <option value="demo">🎯 Demo</option>
            </select>
            <textarea value={formData.followupNotes} onChange={(e) => setFormData({ ...formData, followupNotes: e.target.value })} placeholder="Follow-up notes and agenda" style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%', minHeight: '60px', fontFamily: 'system-ui', boxSizing: 'border-box', fontSize: '14px' }} />
          </fieldset>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button onClick={resetForm} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#333', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>Cancel</button>
            <button onClick={() => handleSaveContact()} style={{ padding: '10px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>Save Contact</button>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 2000, maxWidth: '400px' }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              marginBottom: '12px',
              padding: '14px 16px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              animation: 'slideIn 0.3s ease-out',
              background:
                toast.type === 'success'
                  ? '#d1fae5'
                  : toast.type === 'error'
                  ? '#fee2e2'
                  : toast.type === 'warning'
                  ? '#fef3c7'
                  : '#dbeafe',
              color:
                toast.type === 'success'
                  ? '#065f46'
                  : toast.type === 'error'
                  ? '#7c2515'
                  : toast.type === 'warning'
                  ? '#92400e'
                  : '#0c4a6e',
              border: `1px solid ${
                toast.type === 'success'
                  ? '#6ee7b7'
                  : toast.type === 'error'
                  ? '#fca5a5'
                  : toast.type === 'warning'
                  ? '#fcd34d'
                  : '#7dd3fc'
              }`,
            }}
          >
            <span style={{ fontSize: '18px', flexShrink: 0 }}>
              {toast.type === 'success'
                ? '✅'
                : toast.type === 'error'
                ? '❌'
                : toast.type === 'warning'
                ? '⚠️'
                : 'ℹ️'}
            </span>
            <span style={{ fontSize: '14px', fontWeight: '500', flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0',
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1500,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '28px' }}>🗑️</span>
              <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                Delete Contact
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', lineHeight: '1.6' }}>
              Are you sure you want to delete <strong>{deleteConfirm.contactName}</strong>?
            </p>
            <p style={{ fontSize: '12px', color: '#991b1b', marginBottom: '20px', fontWeight: '500' }}>
              This action cannot be undone.
            </p>

            {!showDeletePassword ? (
              <button
                onClick={() => setShowDeletePassword(true)}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: '#fca5a5',
                  color: '#7c2515',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  marginBottom: '12px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f87171'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fca5a5'
                }}
              >
                Click to Delete
              </button>
            ) : (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                    🔐 Enter Password to Confirm Deletion
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && deletePassword === storedPassword) {
                        confirmDelete(deleteConfirm.contactId)
                      }
                    }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: deletePassword === storedPassword && deletePassword ? '1px solid #10b981' : '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#2563eb'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                  {deletePassword && deletePassword !== storedPassword && (
                    <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>❌ Incorrect password</p>
                  )}
                  {deletePassword === storedPassword && (
                    <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#10b981', fontWeight: '500' }}>✅ Password correct</p>
                  )}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setDeleteConfirm(null)
                  setDeletePassword('')
                  setShowDeletePassword(false)
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e5e7eb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f3f4f6'
                }}
              >
                Cancel
              </button>
              {showDeletePassword && (
                <button
                  onClick={() => {
                    setShowDeletePassword(false)
                    setDeletePassword('')
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    background: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fcd34d',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fde047'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fef3c7'
                  }}
                >
                  Back
                </button>
              )}
              <button
                onClick={() => confirmDelete(deleteConfirm.contactId)}
                disabled={!showDeletePassword || deletePassword !== storedPassword}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: showDeletePassword && deletePassword === storedPassword ? '#dc2626' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: showDeletePassword && deletePassword === storedPassword ? 'pointer' : 'not-allowed',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  opacity: showDeletePassword && deletePassword === storedPassword ? 1 : 0.5,
                }}
                onMouseEnter={(e) => {
                  if (showDeletePassword && deletePassword === storedPassword) {
                    e.currentTarget.style.background = '#b91c1c'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (showDeletePassword && deletePassword === storedPassword) {
                    e.currentTarget.style.background = '#dc2626'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordChange && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1500,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <span style={{ fontSize: '28px' }}>🔐</span>
              <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                Change Delete Password
              </h3>
            </div>

            {passwordChangeStatus && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                fontWeight: '500',
                background: passwordChangeStatus.type === 'success' ? '#d1fae5' : '#fee2e2',
                color: passwordChangeStatus.type === 'success' ? '#065f46' : '#7c2515',
                border: `1px solid ${passwordChangeStatus.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
              }}>
                {passwordChangeStatus.type === 'success' ? '✅' : '❌'} {passwordChangeStatus.message}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                Current Password
              </label>
              <input
                type="password"
                placeholder="Enter current password"
                value={passwordChangeForm.current}
                onChange={(e) => setPasswordChangeForm({ ...passwordChangeForm, current: e.target.value })}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = '#cbd5e1'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                value={passwordChangeForm.new}
                onChange={(e) => setPasswordChangeForm({ ...passwordChangeForm, new: e.target.value })}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = '#cbd5e1'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwordChangeForm.confirm}
                onChange={(e) => setPasswordChangeForm({ ...passwordChangeForm, confirm: e.target.value })}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: passwordChangeForm.new && passwordChangeForm.confirm && passwordChangeForm.new === passwordChangeForm.confirm ? '1px solid #10b981' : '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = passwordChangeForm.new && passwordChangeForm.confirm && passwordChangeForm.new === passwordChangeForm.confirm ? '#10b981' : '#cbd5e1'
                }}
              />
              {passwordChangeForm.new && passwordChangeForm.confirm && passwordChangeForm.new !== passwordChangeForm.confirm && (
                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>❌ Passwords do not match</p>
              )}
              {passwordChangeForm.new && passwordChangeForm.confirm && passwordChangeForm.new === passwordChangeForm.confirm && (
                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#10b981', fontWeight: '500' }}>✅ Passwords match</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowPasswordChange(false)
                  setPasswordChangeForm({ current: '', new: '', confirm: '' })
                  setPasswordChangeStatus(null)
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e5e7eb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f3f4f6'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (passwordChangeForm.current !== storedPassword) {
                    setPasswordChangeStatus({ type: 'error', message: 'Current password is incorrect' })
                    return
                  }
                  if (passwordChangeForm.new !== passwordChangeForm.confirm) {
                    setPasswordChangeStatus({ type: 'error', message: 'New passwords do not match' })
                    return
                  }
                  if (passwordChangeForm.new.length < 6) {
                    setPasswordChangeStatus({ type: 'error', message: 'New password must be at least 6 characters' })
                    return
                  }
                  // Update password in localStorage and state
                  localStorage.setItem('deletePassword', passwordChangeForm.new)
                  setStoredPassword(passwordChangeForm.new)  // Update state immediately
                  setPasswordChangeStatus({ type: 'success', message: 'Password changed successfully!' })
                  setTimeout(() => {
                    setShowPasswordChange(false)
                    setPasswordChangeForm({ current: '', new: '', confirm: '' })
                    setPasswordChangeStatus(null)
                  }, 2000)
                }}
                disabled={!passwordChangeForm.current || !passwordChangeForm.new || !passwordChangeForm.confirm || passwordChangeForm.new !== passwordChangeForm.confirm}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: passwordChangeForm.current && passwordChangeForm.new && passwordChangeForm.confirm && passwordChangeForm.new === passwordChangeForm.confirm ? '#2563eb' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: passwordChangeForm.current && passwordChangeForm.new && passwordChangeForm.confirm && passwordChangeForm.new === passwordChangeForm.confirm ? 'pointer' : 'not-allowed',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  opacity: passwordChangeForm.current && passwordChangeForm.new && passwordChangeForm.confirm && passwordChangeForm.new === passwordChangeForm.confirm ? 1 : 0.5,
                }}
                onMouseEnter={(e) => {
                  if (passwordChangeForm.current && passwordChangeForm.new && passwordChangeForm.confirm && passwordChangeForm.new === passwordChangeForm.confirm) {
                    e.currentTarget.style.background = '#1d4ed8'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (passwordChangeForm.current && passwordChangeForm.new && passwordChangeForm.confirm && passwordChangeForm.new === passwordChangeForm.confirm) {
                    e.currentTarget.style.background = '#2563eb'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset via Email Modal */}
      {showPasswordReset && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1500,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <span style={{ fontSize: '28px' }}>📧</span>
              <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                Reset Password via Email
              </h3>
            </div>

            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
              We'll send a secure password reset link to your email. You can then set a new password without entering your current password.
            </p>

            {resetEmailStatus && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                fontWeight: '500',
                background: resetEmailStatus.type === 'success' ? '#d1fae5' : '#fee2e2',
                color: resetEmailStatus.type === 'success' ? '#065f46' : '#7c2515',
                border: `1px solid ${resetEmailStatus.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
              }}>
                {resetEmailStatus.type === 'success' ? '✅' : '❌'} {resetEmailStatus.message}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                📧 Email Address
              </label>
              <div style={{
                padding: '12px 16px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#374151',
                fontWeight: '500',
              }}>
                {resetEmail}
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0' }}>
                ℹ️ A secure reset link will be sent to this email address
              </p>
            </div>

            <div style={{ marginBottom: '20px', padding: '16px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px' }}>
              <p style={{ margin: '0', fontSize: '13px', color: '#92400e', fontWeight: '500' }}>
                🔗 <strong>Security Note:</strong> The reset link will expire in 1 hour for security. You'll need to verify you own this email address.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowPasswordReset(false)
                  setResetEmailStatus(null)
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e5e7eb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f3f4f6'
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/password-reset', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: resetEmail })
                    })

                    const data = await res.json()

                    if (!res.ok) {
                      setResetEmailStatus({
                        type: 'error',
                        message: data.error || 'Failed to send password reset email'
                      })
                      return
                    }

                    setResetEmailStatus({
                      type: 'success',
                      message: data.message || `Password reset link sent to ${resetEmail}. Please check your email and click the link to reset your password.`
                    })

                    // Show dev token in console if available (development mode)
                    if (data.devToken) {
                      console.log('📧 DEV MODE - Reset Link:', data.devLink)
                      console.log('Token:', data.devToken)
                    }

                    // Close after 4 seconds
                    setTimeout(() => {
                      setShowPasswordReset(false)
                      setResetEmailStatus(null)
                    }, 4000)
                  } catch (error) {
                    console.error('Password reset error:', error)
                    setResetEmailStatus({
                      type: 'error',
                      message: 'Failed to send password reset email. Please try again.'
                    })
                  }
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#d97706'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f59e0b'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Send Reset Link
              </button>
            </div>

            <p style={{ fontSize: '11px', color: '#9ca3af', margin: '16px 0 0 0', textAlign: 'center' }}>
              💡 Tip: Keep this email secure. The reset link grants access to change your password.
            </p>
          </div>
        </div>
      )}

      {/* Duplicate Warning Dialog */}
      {duplicateWarning.show && duplicateWarning.existingContact && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            border: '2px solid #fbbf24',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '32px' }}>⚠️</span>
              <h2 style={{ margin: '0', fontSize: '20px', fontWeight: '800', color: '#111827' }}>
                Duplicate Contact Found
              </h2>
            </div>

            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
              A contact with this name and email already exists in your database. You can:
            </p>

            <div style={{
              background: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '24px',
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase' }}>
                Existing Contact:
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#111827' }}>
                {duplicateWarning.existingContact.name}
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#6b7280' }}>
                📧 {duplicateWarning.existingContact.email}
              </p>
              {duplicateWarning.existingContact.designation && (
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#6b7280' }}>
                  💼 {duplicateWarning.existingContact.designation}
                </p>
              )}
              {duplicateWarning.existingContact.company && (
                <p style={{ margin: '0', fontSize: '13px', color: '#6b7280' }}>
                  🏢 {duplicateWarning.existingContact.company}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDuplicateWarning({ show: false, existingContact: null, pendingSave: false })}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#f3f4f6',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e5e7eb'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f3f4f6'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  window.location.href = `/contacts/${duplicateWarning.existingContact?.id}`
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                View Existing Contact
              </button>

              <button
                onClick={() => {
                  setDuplicateWarning({ show: false, existingContact: null, pendingSave: false })
                  handleSaveContact(true)
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#fbbf24',
                  color: '#111827',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Add Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Dashboard */}
      <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
        <div style={{ background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#0369a1' }}>{stats.total}</div>
          <div style={{ fontSize: '12px', color: '#0c4a6e', fontWeight: '600', marginTop: '4px' }}>Total Contacts</div>
        </div>
        {Object.entries(stats.byStatus).map(([status, count]) => (
          <div key={status} style={{ background: status === 'NEW' ? '#dbeafe' : status === 'LEAD' ? '#fef3c7' : status === 'ACTIVE' ? '#d1fae5' : '#fecaca', border: `1px solid ${status === 'NEW' ? '#bfdbfe' : status === 'LEAD' ? '#fcd34d' : status === 'ACTIVE' ? '#6ee7b7' : '#fca5a5'}`, borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: status === 'NEW' ? '#0369a1' : status === 'LEAD' ? '#92400e' : status === 'ACTIVE' ? '#047857' : '#991b1b' }}>{count}</div>
            <div style={{ fontSize: '12px', color: status === 'NEW' ? '#0c4a6e' : status === 'LEAD' ? '#78350f' : status === 'ACTIVE' ? '#065f46' : '#7c2515', fontWeight: '600', marginTop: '4px' }}>{status}</div>
          </div>
        ))}
      </div>

      {/* Advanced Filters */}
      <div style={{ marginBottom: '24px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#111827' }}>🔍 Advanced Filters</h3>
          {(advancedFilters.status || advancedFilters.industry || advancedFilters.dateFrom || advancedFilters.dateTo || advancedFilters.assignedTo) && (
            <button
              onClick={() => {
                setAdvancedFilters({ status: '', industry: '', dateFrom: '', dateTo: '', assignedTo: '' })
                setCurrentPage(1)
              }}
              style={{ fontSize: '12px', color: '#2563eb', cursor: 'pointer', background: 'none', border: 'none', fontWeight: '600' }}
            >
              Clear All
            </button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>Status</label>
            <select
              value={advancedFilters.status}
              onChange={(e) => {
                setAdvancedFilters({ ...advancedFilters, status: e.target.value })
                setCurrentPage(1)
              }}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
            >
              <option value="">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="LEAD">LEAD</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>Industry</label>
            <input
              type="text"
              placeholder="Filter by industry..."
              value={advancedFilters.industry}
              onChange={(e) => {
                setAdvancedFilters({ ...advancedFilters, industry: e.target.value })
                setCurrentPage(1)
              }}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>Date From</label>
            <input
              type="date"
              value={advancedFilters.dateFrom}
              onChange={(e) => {
                setAdvancedFilters({ ...advancedFilters, dateFrom: e.target.value })
                setCurrentPage(1)
              }}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>Date To</label>
            <input
              type="date"
              value={advancedFilters.dateTo}
              onChange={(e) => {
                setAdvancedFilters({ ...advancedFilters, dateTo: e.target.value })
                setCurrentPage(1)
              }}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>Column Visibility</label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {Object.entries(visibleColumns).map(([col, visible]) => (
                <label key={col} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) => saveColumnPreferences({ ...visibleColumns, [col]: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{col}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <input
          type="text"
          placeholder="🔍 Search by name, email, company, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '11px 14px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#374151',
            backgroundColor: 'white',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#2563eb'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb'
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
          }}
        />
        <select
          value={filters.company}
          onChange={(e) => setFilters({ company: e.target.value })}
          style={{
            padding: '10px 14px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#374151',
            backgroundColor: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#2563eb'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb'
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <option value="">All Companies ({Object.keys(groupedContacts).reduce((sum, c) => sum + groupedContacts[c].length, 0)})</option>
          {Object.keys(groupedContacts).map(company => (
            <option key={company} value={company}>{company} ({groupedContacts[company].length})</option>
          ))}
        </select>
      </div>

      {/* Sort & Pagination Controls */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
        {/* Sort Controls */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '65px' }}>Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as 'name' | 'date' | 'status' | 'company')
              setCurrentPage(1)
            }}
            style={{
              padding: '9px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#374151',
              backgroundColor: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              minWidth: '140px',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#2563eb'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db'
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <option value="name">📝 Name</option>
            <option value="date">📅 Date Added</option>
            <option value="status">🏷️ Status</option>
            <option value="company">🏢 Company</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            style={{
              padding: '9px 14px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              minWidth: '80px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f3f4f6'
              e.currentTarget.style.borderColor = '#9ca3af'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.borderColor = '#d1d5db'
            }}
          >
            {sortOrder === 'asc' ? '↑ ASC' : '↓ DESC'}
          </button>
        </div>

        {/* Per Page Controls */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '70px' }}>Per Page:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            style={{
              padding: '9px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#374151',
              backgroundColor: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              minWidth: '140px',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#2563eb'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db'
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <option value="15">15 contacts</option>
            <option value="30">30 contacts</option>
            <option value="50">50 contacts</option>
            <option value="100">100 contacts</option>
          </select>
        </div>

        {totalContacts > 0 && (
          <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
            Showing <strong>{startIndex + 1}–{Math.min(endIndex, totalContacts)}</strong> of <strong>{totalContacts}</strong>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              background: currentPage === 1 ? '#f3f4f6' : 'white',
              color: currentPage === 1 ? '#9ca3af' : '#374151',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (currentPage > 1) {
                e.currentTarget.style.background = '#f3f4f6'
                e.currentTarget.style.borderColor = '#d1d5db'
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage > 1) {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.borderColor = '#e5e7eb'
              }
            }}
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => {
              const diff = Math.abs(page - currentPage)
              return diff === 0 || diff === 1 || page === 1 || page === totalPages
            })
            .map((page, idx, arr) => {
              const prevPage = arr[idx - 1]
              return [
                prevPage && page - prevPage > 1 ? (
                  <span key={`ellipsis-${page}`} style={{ color: '#9ca3af', fontSize: '13px' }}>...</span>
                ) : null,
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: '6px 10px',
                    border: page === currentPage ? 'none' : '1px solid #e5e7eb',
                    borderRadius: '6px',
                    background: page === currentPage ? '#2563eb' : 'white',
                    color: page === currentPage ? 'white' : '#374151',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    minWidth: '32px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (page !== currentPage) {
                      e.currentTarget.style.background = '#f3f4f6'
                      e.currentTarget.style.borderColor = '#d1d5db'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (page !== currentPage) {
                      e.currentTarget.style.background = 'white'
                      e.currentTarget.style.borderColor = '#e5e7eb'
                    }
                  }}
                >
                  {page}
                </button>,
              ]
            })
            .flat()}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              background: currentPage === totalPages ? '#f3f4f6' : 'white',
              color: currentPage === totalPages ? '#9ca3af' : '#374151',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (currentPage < totalPages) {
                e.currentTarget.style.background = '#f3f4f6'
                e.currentTarget.style.borderColor = '#d1d5db'
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage < totalPages) {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.borderColor = '#e5e7eb'
              }
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Action Toolbar - Import/Export/Bulk Delete */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          {selectedContacts.size > 0 && (
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#0369a1' }}>
              ✓ {selectedContacts.size} contact{selectedContacts.size !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Bulk Status Update */}
          {selectedContacts.size > 0 && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={bulkStatusValue}
                onChange={(e) => setBulkStatusValue(e.target.value)}
                style={{
                  padding: '10px 12px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  minWidth: '120px'
                }}
              >
                <option value="NEW">NEW</option>
                <option value="LEAD">LEAD</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="CLOSED">CLOSED</option>
              </select>
              <button
                onClick={() => setShowBulkStatusModal(true)}
                style={{
                  padding: '10px 16px',
                  background: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#7c3aed'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(139, 92, 246, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#8b5cf6'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                📋 Update Status
              </button>
            </div>
          )}

          {/* Download Template Button */}
          <a
            href="/api/contacts/template"
            download
            style={{
              padding: '10px 16px',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#7c3aed'
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(139, 92, 246, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#8b5cf6'
              e.currentTarget.style.boxShadow = 'none'
            }}
            title="Download Excel template for importing contacts"
          >
            📋 Template
          </a>

          {/* Import Button */}
          <label style={{
            padding: '10px 16px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#059669'
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#10b981'
            e.currentTarget.style.boxShadow = 'none'
          }}>
            📥 Import Excel
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
          </label>

          {/* Export Button */}
          <button
            onClick={exportToExcel}
            disabled={selectedContacts.size === 0}
            style={{
              padding: '10px 16px',
              background: selectedContacts.size > 0 ? '#2563eb' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: selectedContacts.size > 0 ? 'pointer' : 'not-allowed',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              opacity: selectedContacts.size > 0 ? 1 : 0.5
            }}
            onMouseEnter={(e) => {
              if (selectedContacts.size > 0) {
                e.currentTarget.style.background = '#1d4ed8'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(37, 99, 235, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedContacts.size > 0) {
                e.currentTarget.style.background = '#2563eb'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
          >
            📊 Export Excel
          </button>

          {/* Bulk Delete Button */}
          <button
            onClick={() => setShowBulkDeleteConfirm(true)}
            disabled={selectedContacts.size === 0}
            style={{
              padding: '10px 16px',
              background: selectedContacts.size > 0 ? '#dc2626' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: selectedContacts.size > 0 ? 'pointer' : 'not-allowed',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              opacity: selectedContacts.size > 0 ? 1 : 0.5
            }}
            onMouseEnter={(e) => {
              if (selectedContacts.size > 0) {
                e.currentTarget.style.background = '#b91c1c'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(220, 38, 38, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedContacts.size > 0) {
                e.currentTarget.style.background = '#dc2626'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
          >
            🗑️ Delete Selected
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: '60px 40px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #e5e7eb', borderTop: '4px solid #2563eb', animation: 'spin 1s linear infinite' }}></div>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500', margin: '0' }}>Loading contacts...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '60px 40px', textAlign: 'center', background: '#fee2e2', borderRadius: '12px', border: '1px solid #fecaca' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#991b1b', margin: '0 0 8px 0' }}>Error Loading Contacts</h3>
          <p style={{ fontSize: '14px', color: '#7c2515', margin: '0' }}>{error}</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div style={{ padding: '60px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>No contacts found</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Add your first contact to get started</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white',
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#374151', width: '50px' }}>
                  <input
                    type="checkbox"
                    checked={paginatedContacts.length > 0 && selectedContacts.size === paginatedContacts.length}
                    onChange={toggleSelectAll}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                    title="Select all contacts on this page"
                  />
                </th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>Name</th>
                {visibleColumns.company && <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>Company</th>}
                {visibleColumns.designation && <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>Designation</th>}
                {visibleColumns.phone && <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>Phone</th>}
                {visibleColumns.email && <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>Email</th>}
                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedContacts.map((contact, idx) => (
                <tr
                  key={contact.id}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: idx % 2 === 0 ? 'white' : '#fafbfc',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#f0f9ff'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px #bfdbfe'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = idx % 2 === 0 ? 'white' : '#fafbfc'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                  }}
                  onClick={() => (window.location.href = `/contacts/${contact.id}`)}
                >
                  <td style={{ padding: '14px 12px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedContacts.has(contact.id)}
                      onChange={() => toggleContactSelection(contact.id)}
                      style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                    />
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '14px',
                          flexShrink: 0,
                        }}
                      >
                        {contact.name
                          .split(' ')
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontWeight: '600', color: '#111827' }}>{contact.name}</span>
                        {contact.createdAt && (
                          <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '400' }}>
                            📅 {new Date(contact.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {contact.remarks && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {contact.remarks.split(',').map((tag, idx) => (
                              <span key={idx} style={{ fontSize: '11px', background: '#dbeafe', color: '#0369a1', padding: '3px 8px', borderRadius: '12px', fontWeight: '500' }}>
                                🏷️ {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {visibleColumns.company && (
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#6b7280', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {contact.company || '—'}
                    </td>
                  )}
                  {visibleColumns.designation && (
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#6b7280', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {contact.designation || '—'}
                    </td>
                  )}
                  {visibleColumns.phone && (
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#6b7280', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {contact.phone ? (
                        <a href={`tel:${contact.phone}`} onClick={(e) => e.stopPropagation()} style={{ color: '#2563eb', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')} onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}>
                          {contact.phone}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  )}
                  {visibleColumns.email && (
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#6b7280', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {contact.email ? (
                        <a href={`mailto:${contact.email}`} onClick={(e) => e.stopPropagation()} style={{ color: '#2563eb', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')} onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}>
                          {contact.email}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  )}
                  <td style={{ padding: '14px 20px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          setSelectedContactForModal(contact)
                          setShowTagsModal(true)
                        }}
                        style={{
                          padding: '6px 10px',
                          background: '#f3f4f6',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#e5e7eb'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f3f4f6'
                        }}
                        title="Manage tags"
                      >
                        🏷️
                      </button>
                      <button
                        onClick={() => {
                          setSelectedContactForModal(contact)
                          setShowNotesModal(true)
                        }}
                        style={{
                          padding: '6px 10px',
                          background: '#f3f4f6',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#e5e7eb'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f3f4f6'
                        }}
                        title="Add/view notes"
                      >
                        📝
                      </button>
                      <button
                        onClick={() => handleEditContact(contact)}
                        style={{
                          padding: '6px 10px',
                          background: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#1d4ed8'
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(37, 99, 235, 0.3)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#2563eb'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact.id, contact.name)}
                        style={{
                          padding: '6px 10px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#fecaca'
                          e.currentTarget.style.color = '#991b1b'
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(220, 38, 38, 0.3)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fee2e2'
                          e.currentTarget.style.color = '#dc2626'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                        title="Delete this contact"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0' }}>📥 Import Contacts</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0' }}>
              Found <strong>{importData.length}</strong> contact{importData.length !== 1 ? 's' : ''} to import
            </p>

            {importData.length > 0 && (
              <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '24px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600' }}>Name</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600' }}>Email</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600' }}>Company</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importData.slice(0, 10).map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? 'white' : '#fafbfc' }}>
                        <td style={{ padding: '8px 12px' }}>{row['Name'] || row['name'] || '—'}</td>
                        <td style={{ padding: '8px 12px' }}>{row['Email'] || row['email'] || '—'}</td>
                        <td style={{ padding: '8px 12px' }}>{row['Company'] || row['company'] || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportData([])
                }}
                style={{
                  padding: '10px 20px',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#d1d5db')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#e5e7eb')}
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkImport}
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#059669'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#10b981'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                ✓ Import {importData.length} Contact{importData.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tags Modal */}
      {showTagsModal && selectedContactForModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 24px 0' }}>
              🏷️ Manage Tags - {selectedContactForModal.name}
            </h2>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>
                Available Tags
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {availableTags.map(tag => {
                  const currentTags = selectedContactForModal.remarks ? selectedContactForModal.remarks.split(',').map(t => t.trim()) : []
                  const isSelected = currentTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(selectedContactForModal.id, tag)}
                      style={{
                        padding: '8px 16px',
                        background: isSelected ? '#dbeafe' : '#f3f4f6',
                        color: isSelected ? '#0369a1' : '#6b7280',
                        border: `2px solid ${isSelected ? '#bfdbfe' : '#e5e7eb'}`,
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                      }}
                    >
                      {isSelected ? '✓ ' : ''}{tag}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowTagsModal(false)
                  setSelectedContactForModal(null)
                }}
                style={{
                  padding: '10px 24px',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#d1d5db')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#e5e7eb')}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && selectedContactForModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 24px 0' }}>
              📝 Notes - {selectedContactForModal.name}
            </h2>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                Add Note
              </label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type your note here..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  minHeight: '100px',
                  boxSizing: 'border-box',
                  marginBottom: '12px',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <button
                onClick={() => handleAddNote(selectedContactForModal.id, newNote)}
                style={{
                  padding: '10px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#059669'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#10b981'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                ✓ Add Note
              </button>
            </div>

            {selectedContactForModal.location && (
              <div style={{ marginBottom: '24px', background: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', maxHeight: '300px', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#374151', margin: '0 0 16px 0', textTransform: 'uppercase' }}>
                  📋 Previous Notes
                </h3>
                <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.8', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {selectedContactForModal.location}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowNotesModal(false)
                  setSelectedContactForModal(null)
                  setNewNote('')
                }}
                style={{
                  padding: '10px 24px',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#d1d5db')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#e5e7eb')}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Status Update Modal */}
      {showBulkStatusModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '400px',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0' }}>
              Update Status
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0' }}>
              Update {selectedContacts.size} contact{selectedContacts.size !== 1 ? 's' : ''} to:
            </p>

            <select
              value={bulkStatusValue}
              onChange={(e) => setBulkStatusValue(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '24px',
                cursor: 'pointer',
              }}
            >
              <option value="NEW">NEW</option>
              <option value="LEAD">LEAD</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="CLOSED">CLOSED</option>
            </select>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowBulkStatusModal(false)}
                style={{
                  padding: '10px 24px',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#d1d5db')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#e5e7eb')}
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkStatusUpdate}
                style={{
                  padding: '10px 24px',
                  background: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#7c3aed'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(139, 92, 246, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#8b5cf6'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                ✓ Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#991b1b', margin: '0 0 8px 0' }}>
              Delete {selectedContacts.size} Contact{selectedContacts.size !== 1 ? 's' : ''}?
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0', lineHeight: '1.6' }}>
              This action cannot be undone. All selected contacts will be permanently deleted from your CRM.
            </p>

            {/* Password Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                🔐 Enter Delete Password
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter password to confirm deletion"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: deletePassword === storedPassword ? '2px solid #10b981' : '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = deletePassword === storedPassword ? '#10b981' : '#cbd5e1'
                }}
              />
              {deletePassword && deletePassword !== storedPassword && (
                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>❌ Incorrect password</p>
              )}
              {deletePassword === storedPassword && (
                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#10b981', fontWeight: '500' }}>✅ Password correct</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowBulkDeleteConfirm(false)
                  setDeletePassword('')
                }}
                style={{
                  padding: '10px 24px',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  flex: 1,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#d1d5db')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#e5e7eb')}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deletePassword === storedPassword) {
                    confirmBulkDelete()
                  } else {
                    showToast('error', 'Incorrect password')
                  }
                }}
                disabled={deletePassword !== storedPassword}
                style={{
                  padding: '10px 24px',
                  background: deletePassword === storedPassword ? '#dc2626' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: deletePassword === storedPassword ? 'pointer' : 'not-allowed',
                  fontWeight: '600',
                  fontSize: '14px',
                  flex: 1,
                  opacity: deletePassword === storedPassword ? 1 : 0.5,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (deletePassword === storedPassword) {
                    e.currentTarget.style.background = '#b91c1c'
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(220, 38, 38, 0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (deletePassword === storedPassword) {
                    e.currentTarget.style.background = '#dc2626'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                🗑️ Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ContactsPage() {
  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(400px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading contacts...</div>}>
        <ContactsContent />
      </Suspense>
    </>
  )
}
