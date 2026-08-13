# Enhanced CSV Import Implementation Guide

## Phase 1: Database Schema Setup ✅

### Step 1: Run SQL Migrations in Supabase

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query and paste the contents of `DATABASE_SCHEMA.sql`
3. Execute the query

**This creates:**
- `companies` table with fields: id, name, industry, location, remarks, created_at, updated_at
- New columns in `contacts` table: company_id, designation, location, industry, remarks, assigned_to
- Proper indexes for performance

### Step 2: Migrate Existing Data (Optional)

To link existing contacts to companies:

```sql
INSERT INTO companies (name)
SELECT DISTINCT company FROM contacts
WHERE company IS NOT NULL AND company != ''
ON CONFLICT (name) DO NOTHING;

UPDATE contacts
SET company_id = companies.id
FROM companies
WHERE contacts.company = companies.name
AND contacts.company_id IS NULL;
```

---

## Phase 2: API Endpoints ✅

### New Endpoints Created:

**1. GET `/api/companies`**
- Returns all companies with contact count
- Used for company dropdown/selection

**2. POST `/api/companies`**
- Create new company
- Request: `{ name, industry?, location?, remarks? }`
- Response: Company object with ID

**3. POST `/api/contacts/import-v2`**
- Enhanced import with company relationships
- Handles:
  - CSV parsing
  - Company creation/matching
  - Batch contact insertion
  - Error tracking per row
  - Transaction-safe operations

---

## Phase 3: Frontend Component ✅

### EnhancedExcelImport Component

**Features:**
- ✅ File upload with drag-drop
- ✅ CSV preview (first 5 rows)
- ✅ Real-time validation
- ✅ Company auto-creation
- ✅ Error reporting per row
- ✅ Import summary with stats

**CSV Format Supported:**
```
Company Name, Contact Name, Designation, Email, Phone, Location, Industry, Remarks, Assigned To
```

**Example:**
```csv
Acme Corp,John Doe,Sales Manager,john@acme.com,9876543210,New York,Technology,High priority,Sarah
Acme Corp,Jane Smith,CTO,jane@acme.com,9876543211,New York,Technology,Decision maker,Sarah
Tech Inc,Bob Johnson,CEO,bob@tech.com,9876543212,San Francisco,SaaS,Initial meeting,Mike
```

---

## Deployment Steps

### 1. Database Migration
```bash
# Execute DATABASE_SCHEMA.sql in Supabase SQL Editor
```

### 2. Deploy Code
```bash
git add -A
git commit -m "Add enhanced CSV import with company management"
git push origin main
```

Vercel will auto-deploy once pushed.

### 3. Test the Feature

1. Navigate to Dashboard
2. Scroll to "Import Contacts from CSV"
3. Upload test CSV file
4. Verify:
   - Preview shows correctly
   - Companies are created
   - Contacts linked properly
   - Email validation works

---

## Files Changed/Created

### New Files:
- `DATABASE_SCHEMA.sql` - Schema migrations
- `app/api/companies/route.ts` - Companies API
- `app/api/contacts/import-v2/route.ts` - Enhanced import API
- `components/EnhancedExcelImport.tsx` - Import UI component
- `IMPLEMENTATION_GUIDE.md` - This file

### Modified Files:
- `app/page.tsx` - Uses EnhancedExcelImport instead of old component

### Unchanged:
- `app/api/contacts/import/route.ts` - Kept for backward compatibility
- All existing contact APIs work as before

---

## Features Delivered

### ✅ Company Management
- Automatic company creation during import
- Prevents duplicate company names
- One-to-many relationship (company → contacts)
- Company data: name, industry, location, remarks

### ✅ Enhanced Contact Fields
- Designation (job title)
- Location
- Industry
- Remarks (notes)
- Assigned To (sales rep name)

### ✅ Multiple Contacts Per Company
- Same company in multiple rows = single company + multiple contacts
- Automatic deduplication
- Proper foreign key relationships

### ✅ Data Validation
- Required: Contact name + Email
- Per-row error tracking
- Detailed error messages
- Skips invalid rows, imports valid ones

### ✅ User Experience
- CSV preview before import
- Real-time feedback
- Import summary with stats
- Error details shown inline

---

## Database Schema

### Companies Table
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY
  name TEXT UNIQUE NOT NULL
  industry TEXT
  location TEXT
  remarks TEXT
  created_at TIMESTAMP
  updated_at TIMESTAMP
)
```

### Contacts Table (Enhanced)
```sql
ALTER TABLE contacts ADD:
  company_id UUID (FK → companies.id)
  designation TEXT
  location TEXT
  industry TEXT
  remarks TEXT
  assigned_to TEXT
```

---

## Backward Compatibility

✅ Existing contacts still work
✅ Old import endpoint still available at `/api/contacts/import`
✅ Contacts without company_id are linked to "Unassigned" company
✅ Old company field kept for reference

---

## Future Enhancements

### Phase 4: Contacts UI Update
- Display company hierarchy
- Show all contacts under company
- Company detail view
- Bulk actions by company

### Phase 5: Advanced Features
- Duplicate contact detection
- Email validation
- Phone number formatting
- Activity tracking on import

### Phase 6: Export & Reporting
- Export contacts by company
- Export companies with contact counts
- Sales rep performance by assigned_to
- Industry breakdown

---

## Troubleshooting

### Issue: "Company name already exists"
**Solution:** Duplicate company in CSV or already in database. Check CSV for typos.

### Issue: Contact shows but no company linked
**Solution:** company_id might be NULL. Re-run migration script in SQL editor.

### Issue: Import fails silently
**Solution:** Check browser console for errors. Review error list in import result.

### Issue: CSV not parsing correctly
**Solution:** 
- Ensure headers match exactly (case-insensitive)
- No extra spaces in column names
- UTF-8 encoding

---

## Support

For issues, check:
1. Browser console (F12)
2. Supabase logs
3. Database schema is created
4. API endpoints responding (Network tab)
