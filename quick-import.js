#!/usr/bin/env node

/**
 * Quick Import Script
 *
 * Usage:
 * 1. Export your Excel to CSV
 * 2. Update the CSV_FILE_PATH below to point to your CSV
 * 3. Run: node quick-import.js
 */

const fs = require('fs');
const path = require('path');

// ========== CONFIGURATION ==========
const CSV_FILE_PATH = './contacts.csv'; // Update this to your CSV file path
const API_URL = 'https://airanix-crm.vercel.app/api/contacts/import-direct';
// ===================================

// Simple CSV parser
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim().length > 0);
  if (lines.length < 2) throw new Error('CSV must have header and data rows');

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const contacts = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));

    const contact = {};
    headers.forEach((header, idx) => {
      const value = values[idx];
      if (value && value.length > 0) {
        // Map common header variations
        if (header.includes('contact') || header === 'name') {
          contact.contact_name = value;
        } else if (header.includes('email')) {
          contact.email = value;
        } else if (header.includes('company')) {
          contact.company_name = value;
        } else if (header.includes('phone')) {
          contact.phone = value;
        } else if (header.includes('designation') || header.includes('title')) {
          contact.designation = value;
        } else if (header.includes('location') || header.includes('city')) {
          contact.location = value;
        } else if (header.includes('industry')) {
          contact.industry = value;
        } else if (header.includes('remark')) {
          contact.remarks = value;
        } else if (header.includes('assigned')) {
          contact.assigned_to = value;
        }
      }
    });

    if (contact.contact_name) {
      contacts.push(contact);
    }
  }

  return contacts;
}

// Main import function
async function importContacts() {
  try {
    console.log('📥 Quick Import Script');
    console.log('='.repeat(50));

    // Check if CSV exists
    if (!fs.existsSync(CSV_FILE_PATH)) {
      console.error(`\n❌ Error: CSV file not found at: ${CSV_FILE_PATH}`);
      console.log('\nSteps:');
      console.log('1. Export your Excel to CSV');
      console.log('2. Save as: contacts.csv (in this folder)');
      console.log('3. Run: node quick-import.js\n');
      process.exit(1);
    }

    // Read and parse CSV
    console.log(`\n📖 Reading CSV file: ${CSV_FILE_PATH}`);
    const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    const contacts = parseCSV(csvContent);

    console.log(`✅ Parsed ${contacts.length} contacts from CSV`);

    if (contacts.length === 0) {
      console.error('\n❌ No contacts found in CSV');
      process.exit(1);
    }

    // Show sample
    console.log('\n📋 Sample contacts:');
    contacts.slice(0, 3).forEach((c, idx) => {
      console.log(`  ${idx + 1}. ${c.contact_name} (${c.email || 'no-email'}) - ${c.company_name || 'no-company'}`);
    });
    if (contacts.length > 3) {
      console.log(`  ... and ${contacts.length - 3} more`);
    }

    // Call import API
    console.log(`\n🚀 Importing to CRM...`);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contacts })
    });

    const result = await response.json();

    // Show results
    console.log('\n' + '='.repeat(50));
    console.log('✅ IMPORT COMPLETE');
    console.log('='.repeat(50));

    if (result.success) {
      console.log(`\n📊 RESULTS:`);
      console.log(`  ✅ Imported: ${result.imported}`);
      console.log(`  ❌ Failed: ${result.failed}`);
      console.log(`  📝 Total requested: ${result.total}`);
      console.log(`  ⚠️  Generated temp emails: ${result.summary.generatedEmails || 0}`);
      console.log(`\n🎉 Success! Check your CRM now.`);
      console.log(`\nExpected new total: ${67 + result.imported} contacts`);
    } else {
      console.error(`\n❌ Import failed:`);
      console.error(`  Error: ${result.error}`);
    }

    if (result.errors && result.errors.length > 0) {
      console.log(`\n⚠️  Errors:`);
      result.errors.slice(0, 5).forEach(err => {
        console.log(`  - ${err.error}`);
      });
    }

    console.log('\n' + '='.repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure CSV file exists');
    console.error('2. Make sure CSV has headers: contact_name, email, company_name');
    console.error('3. Check internet connection');
    process.exit(1);
  }
}

// Run
importContacts();
