import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contacts } = body

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts provided' }, { status: 400 })
    }

    const diagnostics: any = {
      totalContacts: contacts.length,
      steps: [],
      issues: [],
      database: { tables: {}, status: 'unknown' }
    }

    // STEP 1: Validate table access
    console.log('[DIAGNOSE] Step 1: Checking database tables...')
    try {
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('count', { count: 'exact', head: true })

      diagnostics.database.tables.contacts = {
        accessible: !contactsError,
        error: contactsError?.message,
        count: contactsData ? 'unknown' : 0
      }

      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('count', { count: 'exact', head: true })

      diagnostics.database.tables.companies = {
        accessible: !companiesError,
        error: companiesError?.message
      }

      diagnostics.steps.push({
        name: 'Database Access',
        status: !contactsError && !companiesError ? 'OK' : 'FAILED',
        details: diagnostics.database
      })

      if (contactsError || companiesError) {
        diagnostics.issues.push('Database tables not accessible')
        return NextResponse.json(diagnostics, { status: 400 })
      }
    } catch (error: any) {
      diagnostics.issues.push(`Database check error: ${error.message}`)
      diagnostics.steps.push({ name: 'Database Access', status: 'ERROR', error: error.message })
      return NextResponse.json(diagnostics, { status: 400 })
    }

    // STEP 2: Validate CSV data
    console.log('[DIAGNOSE] Step 2: Validating CSV data...')
    const validation = {
      totalRows: contacts.length,
      validEmails: 0,
      invalidEmails: 0,
      missingNames: 0,
      missingEmails: 0,
      sampleRows: []
    }

    contacts.slice(0, 5).forEach((c: any, idx: number) => {
      const name = c.contact_name || c.name || ''
      const email = c.email || ''
      const company = c.company_name || 'Unassigned'

      const isValid = name && (email && email.includes('@') && email.includes('.'))
      const issues = []

      if (!name) issues.push('missing name')
      if (!email) issues.push('missing email')
      if (email && !email.includes('@')) issues.push('no @ in email')
      if (email && !email.includes('.')) issues.push('no . in email')

      validation.sampleRows.push({
        row: idx + 1,
        name,
        email,
        company,
        valid: isValid,
        issues
      })

      if (isValid) validation.validEmails++
      else {
        validation.invalidEmails++
        if (!name) validation.missingNames++
        if (!email) validation.missingEmails++
      }
    })

    diagnostics.steps.push({
      name: 'Data Validation',
      status: validation.invalidEmails === 0 ? 'OK' : 'ISSUES',
      details: validation
    })

    // STEP 3: Test company creation
    console.log('[DIAGNOSE] Step 3: Testing company creation...')
    const testCompanyName = `TEST_IMPORT_${Date.now()}`
    let companyCreationWorks = false
    let companyError = null

    try {
      const { data: newCompany, error: createError } = await supabase
        .from('companies')
        .insert([
          {
            name: testCompanyName,
            industry: null,
            location: null,
            remarks: 'Test import'
          }
        ])
        .select('id')
        .single()

      if (createError) {
        companyError = createError.message
        diagnostics.issues.push(`Company creation failed: ${createError.message}`)
      } else {
        companyCreationWorks = true
        // Clean up test company
        await supabase.from('companies').delete().eq('name', testCompanyName)
      }
    } catch (error: any) {
      companyError = error.message
      diagnostics.issues.push(`Company creation error: ${error.message}`)
    }

    diagnostics.steps.push({
      name: 'Company Creation Test',
      status: companyCreationWorks ? 'OK' : 'FAILED',
      error: companyError
    })

    // STEP 4: Test contact insertion (without company requirement)
    console.log('[DIAGNOSE] Step 4: Testing contact insertion...')
    let contactInsertionWorks = false
    let contactError = null

    try {
      const testContact = {
        name: `TEST_${Date.now()}`,
        email: `test_${Date.now()}@test.local`,
        company_id: null,
        phone: null,
        location: null,
        designation: null,
        industry: null,
        remarks: null,
        assigned_to: null,
        status: 'NEW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const { data: newContact, error: insertError } = await supabase
        .from('contacts')
        .insert([testContact])
        .select('id')

      if (insertError) {
        contactError = insertError.message
        diagnostics.issues.push(`Contact insertion failed: ${insertError.message}`)
      } else {
        contactInsertionWorks = true
        // Clean up test contact
        if (newContact && newContact.length > 0) {
          await supabase.from('contacts').delete().eq('id', newContact[0].id)
        }
      }
    } catch (error: any) {
      contactError = error.message
      diagnostics.issues.push(`Contact insertion error: ${error.message}`)
    }

    diagnostics.steps.push({
      name: 'Contact Insertion Test',
      status: contactInsertionWorks ? 'OK' : 'FAILED',
      error: contactError
    })

    // STEP 5: Identify root cause
    console.log('[DIAGNOSE] Step 5: Analyzing root cause...')
    const rootCause = {
      databaseOK: diagnostics.database.tables.contacts?.accessible && diagnostics.database.tables.companies?.accessible,
      dataOK: validation.invalidEmails === 0,
      companiesCanBeCreated: companyCreationWorks,
      contactsCanBeInserted: contactInsertionWorks,
      likelyIssue: 'Unknown'
    }

    if (!rootCause.databaseOK) {
      rootCause.likelyIssue = 'Database connectivity issue - tables not accessible'
    } else if (!rootCause.companiesCanBeCreated) {
      rootCause.likelyIssue = 'Company table has constraints preventing creation'
    } else if (!rootCause.contactsCanBeInserted) {
      rootCause.likelyIssue = 'Contacts table has constraints preventing insertion'
    } else if (!rootCause.dataOK) {
      rootCause.likelyIssue = `Data validation issues: ${validation.invalidEmails} contacts with invalid data`
    } else {
      rootCause.likelyIssue = 'Unknown - all components working'
    }

    diagnostics.rootCause = rootCause

    return NextResponse.json({
      success: true,
      diagnostics,
      summary: {
        healthy: diagnostics.issues.length === 0,
        issueCount: diagnostics.issues.length,
        issues: diagnostics.issues,
        rootCause: rootCause.likelyIssue
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Diagnostic failed' },
      { status: 500 }
    )
  }
}
