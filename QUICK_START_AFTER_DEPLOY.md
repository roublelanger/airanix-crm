# Quick Start Guide - After Vercel Deployment

## ⏱️ 5-Minute Setup After Deploy

After your Vercel deployment is complete, follow these steps:

---

## Step 1: Verify Deployment (1 min)

```
1. Go to https://vercel.com/dashboard
2. Find airanix-crm project
3. Should show "Ready" status
4. Click "Visit" to open app
```

---

## Step 2: Test Login (1 min)

```
1. Enter your email: rouble@airanix.com
2. Click "🔗 Send Login Link"
3. Check your email for magic link
4. Click link to log in
```

---

## Step 3: Test Create Lead (1 min)

```
1. Navigate to Leads page
2. Click "+ Add leads"
3. Fill in:
   - Lead Name: "Test Lead"
   - Value: 50000
4. Leave owner/dates/notes empty for now
5. Click "Save Lead"
6. Should see: ✅ "Lead created successfully!"
```

---

## Step 4: Test New Fields (1 min)

```
1. Click "+ Add leads" again
2. Fill in ALL fields:
   - Lead Name: "Full Test"
   - Value: 100000
   - Stage: "Proposal"
   - Owner: "Your Name"
   - Close Date: 2025-12-31
   - Notes: "Test with all fields"
3. Click "Save Lead"
4. Should save without errors
5. Lead appears in "Proposal" column
```

---

## Step 5: Test Error Messages (1 min)

```
1. Click "+ Add leads"
2. Leave "Lead Name" empty
3. Enter Value: 50000
4. Click "Save Lead"
5. Should see: ❌ "Lead name is required"
   (NOT generic "Failed to save deal")
```

---

## ✅ All Tests Passing?

Great! The deployment is successful. Users can now:
- ✅ Create leads with owner, close date, and notes
- ✅ See specific error messages (not generic)
- ✅ Update and delete leads
- ✅ Move leads between stages
- ✅ Filter by owner, date ranges, etc.

---

## ❌ Something Broken?

### Error: "Database error: column 'X' does not exist"

This means Supabase table is missing the column.

**Fix:**
1. Go to Supabase Dashboard
2. Open SQL Editor
3. Copy & paste:

```sql
ALTER TABLE deals ADD COLUMN owner TEXT;
ALTER TABLE deals ADD COLUMN close_date DATE;
ALTER TABLE deals ADD COLUMN last_activity DATE;
ALTER TABLE deals ADD COLUMN notes TEXT;
```

4. Run the query
5. Try creating lead again

### Error: "Failed to save lead" (generic message)

This shouldn't happen with new code. 

**Verify:**
1. Check Vercel deployed code is from commit `bfc0c15`
2. Check browser console (F12) for [Lead Save] logs
3. If deployment was before commit, trigger manual redeploy

**Manual Redeploy:**
1. Go to Vercel Dashboard
2. Click Deployments
3. Find commit `bfc0c15`
4. Click "Redeploy" button
5. Wait for "Ready" status

### Error: Application Won't Load

Might be environment variable issue.

**Check:**
1. Vercel Project → Settings → Environment Variables
2. Verify these exist:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
3. If missing, add them
4. Trigger redeploy

---

## 🎯 Success Indicators

✅ You've succeeded if:
- App loads at Vercel domain
- Can login
- Can create leads
- Error messages are SPECIFIC (not generic)
- New fields save correctly
- Leads appear in kanban
- Can move leads between stages

❌ Something's wrong if:
- Generic "Failed to save deal" message
- Errors in browser console
- Leads don't appear
- Can't move leads
- Database column errors

---

## 📚 More Help

- **Testing details** → See FIXES_AND_TESTING.md (15 test cases)
- **Error explanations** → See ERROR_MESSAGES_GUIDE.md
- **Code changes** → See CHANGES_SUMMARY.md
- **Deployment help** → See DEPLOYMENT_CHECKLIST.md

---

## 🚀 You're Good to Go!

After verifying all 5 steps above, the system is ready for production use.

```
✅ Deployment complete
✅ All fixes applied
✅ Tested and working
✅ Ready for users
```

