import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const XLSX = require('xlsx')

    // Create template data with example row
    // Headers must match the import validation function expectations
    const templateData = [
      {
        'name': 'John Doe',
        'email': 'john@example.com',
        'phone': '+1234567890',
        'company': 'Tech Corp',
        'designation': 'Sales Manager',
        'location': 'New York, USA',
        'industry': 'Technology',
        'remarks': 'Met at conference',
        'assigned_to': 'Your Name'
      },
      {
        'name': 'Jane Smith',
        'email': 'jane@example.com',
        'phone': '+9876543210',
        'company': 'Innovation Inc',
        'designation': 'CEO',
        'location': 'San Francisco, USA',
        'industry': 'Software',
        'remarks': 'Interested in partnership',
        'assigned_to': 'Your Name'
      }
    ]

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts')

    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, // name
      { wch: 25 }, // email
      { wch: 15 }, // phone
      { wch: 20 }, // company
      { wch: 20 }, // designation
      { wch: 15 }, // location
      { wch: 15 }, // industry
      { wch: 30 }, // remarks
      { wch: 15 }  // assigned_to
    ]

    // Add instructions sheet
    const instructionsData = [
      ['Contact Import Template - Instructions'],
      [],
      ['Column Name', 'Required?', 'Description', 'Example'],
      ['name', 'YES ✓', 'Full name of contact', 'John Doe'],
      ['email', 'YES ✓', 'Email address (or NA if not available)', 'john@example.com or NA'],
      ['phone', 'NO', 'Phone number', '+1234567890'],
      ['company', 'NO', 'Company name', 'Tech Corp'],
      ['designation', 'NO', 'Job title/designation', 'Sales Manager'],
      ['location', 'NO', 'City or location', 'New York, USA'],
      ['industry', 'NO', 'Industry type', 'Technology'],
      ['remarks', 'NO', 'Additional notes/remarks', 'Met at conference'],
      ['assigned_to', 'NO', 'Team member name', 'Your Name'],
      [],
      ['Important Notes:'],
      ['• Name is REQUIRED for each contact'],
      ['• Email is required OR use NA if not available'],
      ['• Duplicate records (same name+email) will be skipped'],
      ['• All column headers must be lowercase (name, email, company, etc.)'],
      ['• If email is NA or missing, it will be stored as "NA"'],
      ['• Delete the example rows before importing your data'],
      ['• Supported file formats: .xlsx, .csv']
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
