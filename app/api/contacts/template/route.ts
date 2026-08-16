import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const XLSX = require('xlsx')

    // Create template data with example row
    const templateData = [
      {
        'Name': 'John Doe',
        'Email': 'john@example.com',
        'Phone': '+1234567890',
        'Company': 'Tech Corp',
        'Designation': 'Sales Manager',
        'Location': 'New York, USA',
        'Industry': 'Technology',
        'Status': 'LEAD',
        'Assigned To': 'Your Name',
        'Platform': 'LinkedIn',
        'Remarks': 'Met at conference'
      },
      {
        'Name': 'Jane Smith',
        'Email': 'jane@example.com',
        'Phone': '+9876543210',
        'Company': 'Innovation Inc',
        'Designation': 'CEO',
        'Location': 'San Francisco, USA',
        'Industry': 'Software',
        'Status': 'ACTIVE',
        'Assigned To': 'Your Name',
        'Platform': 'Email',
        'Remarks': 'Interested in partnership'
      }
    ]

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(templateData)
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
      { wch: 30 }  // Remarks
    ]

    // Add instructions sheet
    const instructionsData = [
      ['Contact Import Template - Instructions'],
      [],
      ['Column Name', 'Required?', 'Description', 'Example'],
      ['Name', 'YES ✓', 'Full name of contact', 'John Doe'],
      ['Email', 'YES ✓', 'Email address (must be unique)', 'john@example.com'],
      ['Phone', 'NO', 'Phone number', '+1234567890'],
      ['Company', 'NO', 'Company name', 'Tech Corp'],
      ['Designation', 'NO', 'Job title/designation', 'Sales Manager'],
      ['Location', 'NO', 'City or location', 'New York, USA'],
      ['Industry', 'NO', 'Industry type', 'Technology'],
      ['Status', 'NO', 'Status (NEW/LEAD/ACTIVE/CLOSED)', 'LEAD'],
      ['Assigned To', 'NO', 'Team member name', 'Your Name'],
      ['Platform', 'NO', 'Source platform', 'LinkedIn'],
      ['Remarks', 'NO', 'Additional notes', 'Met at conference'],
      [],
      ['Important Notes:'],
      ['• Name and Email are REQUIRED for each contact'],
      ['• Duplicate emails will be skipped'],
      ['• All other fields are optional'],
      ['• Status options: NEW, LEAD, ACTIVE, CLOSED (default: NEW)'],
      ['• Delete the example rows before importing your data'],
      ['• File format: .xlsx or .csv']
    ]

    const instructionSheet = XLSX.utils.aoa_to_sheet(instructionsData)
    instructionSheet['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 40 },
      { wch: 25 }
    ]

    XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Instructions')

    // Generate buffer
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })

    // Return as download
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Airanix_Contacts_Template_${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    })
  } catch (error) {
    console.error('Template generation error:', error)
    return new NextResponse('Failed to generate template', { status: 500 })
  }
}
