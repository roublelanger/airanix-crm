# Error Messages & Diagnostics Guide

## How Error Messages Have Improved

### Before (Generic)
❌ User sees: "Failed to save deal"
- No indication of what went wrong
- No way to fix the issue
- User frustration 😤

### After (Specific)
✅ User sees one of:
- "Lead name is required" - Clear validation error
- "Lead value must be greater than 0" - Clear validation error  
- "Database error: column 'owner' does not exist" - Clear DB schema issue
- "Server error (500): {details}" - Clear server error with details
- "Lead created successfully!" - Clear success message

---

## All Possible Error Messages

### Client-Side Validation Errors

These appear in the toast notification (top-right red box) when you try to save invalid data:

#### 1. Missing Lead Name
```
❌ Lead name is required
```
**When:** Lead Name field is empty or only whitespace
**Fix:** Enter a lead name

#### 2. Lead Name Too Long
```
❌ Lead name must be less than 100 characters
```
**When:** Lead Name exceeds 100 characters
**Fix:** Shorten the name to ≤ 100 characters

#### 3. Invalid Lead Value
```
❌ Lead value must be greater than 0
```
**When:** Value field is empty, zero, or negative
**Fix:** Enter a positive number (e.g., 50000)

#### 4. Notes Too Long
```
❌ Notes must be less than 500 characters
```
**When:** Notes field exceeds 500 characters
**Fix:** Shorten notes to ≤ 500 characters

---

### Server-Side Validation Errors

These occur when the API receives invalid data and appear in red toast:

#### 1. Database Column Missing
```
❌ Database error: column 'owner' does not exist
```
**Root Cause:** The `deals` table doesn't have an `owner` column
**What This Means:** Database schema is incomplete
**Fix:** Add the missing column to Supabase `deals` table

```sql
ALTER TABLE deals ADD COLUMN owner TEXT;
```

**Similar errors for:**
- `column 'close_date' does not exist`
- `column 'last_activity' does not exist`
- `column 'notes' does not exist`

#### 2. Invalid Data Type
```
❌ Database error: invalid input syntax for type integer
```
**Root Cause:** `value` field contains non-numeric data
**What This Means:** The value can't be converted to a number
**Fix:** Ensure value field only contains numbers

#### 3. Database Connection Error
```
❌ Database error: connection refused
```
**Root Cause:** Cannot connect to Supabase
**What This Means:** Supabase service is down or credentials are wrong
**Fix:** Check .env.local has correct SUPABASE_URL and KEY

---

### Network/API Errors

#### 1. Server Not Responding (Timeout)
```
❌ Server error (504): Gateway Timeout
```
**Root Cause:** API server is taking too long to respond
**What This Means:** Server might be overloaded or crashed
**Fix:** Wait a moment and try again, or check server logs

#### 2. Bad Request (400)
```
❌ Server error (400): Bad Request
```
**Root Cause:** API received malformed request
**What This Means:** Form data format is incorrect
**Fix:** Try refreshing page and submitting again

#### 3. Unauthorized (401)
```
❌ Server error (401): Unauthorized
```
**Root Cause:** Your Supabase token expired
**What This Means:** You're not authenticated
**Fix:** Log out and log back in

#### 4. Forbidden (403)
```
❌ Server error (403): Forbidden
```
**Root Cause:** You don't have permission to access this resource
**What This Means:** Row-level security (RLS) policy denied access
**Fix:** Check Supabase RLS policies allow your user

#### 5. Server Error (500)
```
❌ Server error (500): Internal Server Error
```
**Root Cause:** Unexpected error in API code
**What This Means:** Something broke on the backend
**Fix:** Check server logs for `[API POST /deals] Error:` message

---

## Success Messages

### Create Lead
```
✅ Lead created successfully!
```
**When:** POST /api/deals returns status 201
**What Happens:** Form clears, lead appears in kanban, page refreshes

### Update Lead
```
✅ Lead updated successfully!
```
**When:** PUT /api/deals/[id] returns status 200
**What Happens:** Modal closes, lead card updates, page refreshes

### Delete Lead
```
✅ Lead deleted successfully!
```
**When:** DELETE /api/deals/[id] returns status 200
**What Happens:** Lead card disappears, stage counts update

### Move Lead
```
✅ Lead moved successfully!
```
**When:** PUT /api/deals/[id] with stage change returns status 200
**What Happens:** Lead moves to new stage column, counts update

### Load Leads
```
✅ Leads loaded successfully (no toast shown)
```
**When:** GET /api/deals returns status 200
**What Happens:** Kanban board displays leads in correct stages

---

## Console Logging for Debugging

### Browser Console Logs

All logs are prefixed with `[Lead Save]` for easy filtering:

**Successful Create:**
```javascript
[Lead Save] POST /api/deals
{
  name: "Test Lead",
  value: 50000,
  stage: "PROSPECTING",
  owner: null,
  close_date: null,
  last_activity: null,
  notes: null
}
[Lead Save] Response status: 201
[Lead Save] Response body: {"id":"abc123","name":"Test Lead",...}
```

**Validation Error:**
```javascript
[Lead Save] Error: Lead name is required
```

**API Error:**
```javascript
[Lead Save] Error: Database error: column 'owner' does not exist
```

**Network Error:**
```javascript
[Lead Save] Error: Server error (500): Internal Server Error
```

### Server Console Logs

All logs are prefixed with `[API POST /deals]`, `[API PUT /deals]`, etc.

**Successful Create:**
```
[API POST /deals] Creating lead: {
  name: "Test Lead",
  value: 50000,
  stage: "PROSPECTING",
  owner: null
}
[API POST /deals] Lead created successfully: abc-123-def-456
```

**Validation Error (server-side):**
```
[API POST /deals] Error: Lead value must be greater than 0
```

**Database Error:**
```
[API POST /deals] Supabase error: {
  message: "column \"owner\" of relation \"deals\" does not exist",
  code: "42703",
  details: "..."
}
[API POST /deals] Error: Database error: column 'owner' does not exist
```

---

## Debugging Flowchart

When you see an error, follow this chart:

```
❌ Error Message Appears
│
├─ "Lead name is required"
│  └─→ Check: Did you enter a lead name? If not, enter one.
│
├─ "Lead name must be less than 100 characters"
│  └─→ Check: Name is > 100 chars? If yes, shorten it.
│
├─ "Lead value must be greater than 0"
│  └─→ Check: Is value empty or ≤ 0? If yes, enter positive number.
│
├─ "Notes must be less than 500 characters"
│  └─→ Check: Notes > 500 chars? If yes, shorten.
│
├─ "Database error: column 'X' does not exist"
│  └─→ Action: Add missing column to Supabase
│      1. Open Supabase SQL Editor
│      2. Run: ALTER TABLE deals ADD COLUMN owner TEXT;
│      3. Retry saving
│
├─ "Database error: connection refused"
│  └─→ Check: Is Supabase online? Check status.supabase.com
│      Check: Are credentials in .env.local correct?
│
├─ "Server error (500): ..."
│  └─→ Check: Server console has [API POST /deals] Error: message
│      Look for that message to understand what failed
│
└─ "Server error (404): Not Found"
   └─→ Check: Is /api/deals endpoint working?
       Check: Did you create the route file?
```

---

## Network Tab Debugging

Open DevTools → Network tab, then try to save a lead:

**Successful Request:**
```
Request URL: http://localhost:3000/api/deals
Request Method: POST
Status: 201 Created
Headers:
  Content-Type: application/json
Response:
  {"id":"...", "name":"Test", "value":50000, ...}
```

**Failed Request:**
```
Request URL: http://localhost:3000/api/deals
Request Method: POST
Status: 500 Internal Server Error
Headers:
  Content-Type: application/json
Response:
  {"error":"Database error: column 'owner' does not exist"}
```

**Check This:**
- ✅ Status should be 200/201 for success, 4xx/5xx for errors
- ✅ Response should be valid JSON, not HTML error page
- ✅ Response body should have "error" field if failed
- ✅ Request body should have all required fields

---

## Common Issues & Solutions

### Issue 1: Always Getting "Failed to save deal"
**Symptom:** Error message is generic, not specific
**Solution:** This was the original bug. You should now see specific messages.
- Confirm you have the latest code changes
- Check browser console for `[Lead Save]` logs
- Look for actual error message in console

### Issue 2: "Database error: column 'X' does not exist"
**Symptom:** Getting this for every field (owner, close_date, etc.)
**Solution:** Supabase table schema is incomplete
1. Go to Supabase Dashboard
2. Open SQL Editor
3. Run migration to add missing columns
4. Retry the operation

### Issue 3: Form Says "Success" But Lead Doesn't Appear
**Symptom:** Toast says "✅ Lead created successfully!" but no lead shows
**Solution:** Form is lying. Check actual server response:
1. Open DevTools → Network tab
2. Look for POST /api/deals request
3. Check the response status code
4. If 500, check server logs for `[API POST /deals] Error:`

### Issue 4: Can't Update Lead With New Fields
**Symptom:** Can fill in owner/close_date but they don't save
**Solution:** API endpoint might be old version
1. Confirm you have latest `/api/deals/[id]/route.ts`
2. Check that PUT endpoint handles all 7 fields
3. Check server logs for `[API PUT /deals/[id]] Updating lead:`

### Issue 5: No Console Logs Appearing
**Symptom:** Can't see `[Lead Save]` or `[API POST]` messages
**Solution:** Logging wasn't enabled or console is not open
1. Open DevTools (F12)
2. Go to Console tab
3. Refresh page
4. Try the operation again
5. Look for messages starting with `[`

---

## Quick Reference: Error → Fix

| Error Message | Fix |
|------|-----|
| "Lead name is required" | Enter a lead name |
| "Lead name must be less than 100 characters" | Shorten name |
| "Lead value must be greater than 0" | Enter positive number |
| "Notes must be less than 500 characters" | Shorten notes |
| "column 'owner' does not exist" | ALTER TABLE deals ADD COLUMN owner TEXT; |
| "column 'close_date' does not exist" | ALTER TABLE deals ADD COLUMN close_date DATE; |
| "column 'last_activity' does not exist" | ALTER TABLE deals ADD COLUMN last_activity DATE; |
| "column 'notes' does not exist" | ALTER TABLE deals ADD COLUMN notes TEXT; |
| "Server error (500): ..." | Check server logs |
| "connection refused" | Check Supabase status |
| "Unauthorized" | Log out and log back in |

---

## How to Report Bugs

When something goes wrong, provide:

1. **The exact error message** (from red toast at top-right)
2. **Browser console screenshot** (F12 → Console tab, look for `[Lead Save]`)
3. **Server console screenshot** (terminal with dev server)
4. **What you were trying to do** (create/update/delete/move)
5. **What data you entered** (name, value, stage, etc.)

Example bug report:
```
Error Message: "Database error: column 'owner' does not exist"
Browser Console: [Lead Save] POST /api/deals, Response status: 500
Server Console: [API POST /deals] Supabase error: column 'owner' does not exist
Action: Trying to create a lead with owner "John Doe"
Expected: Lead should be saved with owner
Actual: Error message, lead not created
```

With this information, the issue can be diagnosed immediately!

