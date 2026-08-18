# Automated Daily Lead Import Setup (9 AM IST)

## ✅ What's Configured

- **Schedule:** Daily at 9:00 AM IST (3:30 AM UTC)
- **Source:** Google Sheets (you add LinkedIn exports)
- **Verification:** Hunter.io email validation
- **Destination:** Airanix CRM (auto-import)
- **Cost:** FREE

---

## 🔧 SETUP REQUIRED (15 minutes)

### **1. Get Hunter.io API Key (5 mins) - FREE**

1. Go to: https://hunter.io
2. Sign up (free account)
3. Dashboard → Settings → API
4. Copy API Key
5. Add to `.env.local`:
```
HUNTER_API_KEY=your_api_key_here
```

**Free Tier:** 100 email verifications/month (enough for 100+ leads)

---

### **2. Create Google Sheet (5 mins) - FREE**

1. Go to: https://sheets.google.com
2. Create new sheet
3. Name it: "Airanix Leads"
4. Add columns:
   ```
   A: Name
   B: Company
   C: Designation
   D: Email
   E: Phone
   F: LinkedIn URL
   G: Company Size
   ```
5. **Example row:**
   ```
   Rajesh Kumar | TechCorp | Sales Manager | rajesh@techcorp.com | +91-9876543210 | linkedin.com/in/rajesh | 250-500
   ```

---

### **3. Enable Google Sheets API (5 mins)**

1. Go to: https://console.cloud.google.com
2. Create new project: "Airanix CRM"
3. Search for "Google Sheets API" → Enable it
4. Create "Service Account" credentials
5. Download JSON key
6. Copy Sheet ID from URL (middle part)
7. Share sheet with service account email

Add to `.env.local`:
```
GOOGLE_SHEETS_API_KEY=your_api_key_here
GOOGLE_SHEET_ID=your_sheet_id_here
CRON_SECRET=your_random_secret_here
```

---

### **4. Deploy to Vercel**

```bash
git add -A
git commit -m "feat: Automated daily lead import via Vercel Cron"
git push origin main
```

Vercel auto-deploys → Cron runs every day at 9 AM IST

---

## 📊 HOW IT WORKS

### **Daily Flow (Automatic):**

```
9:00 AM IST (Daily)
    ↓
Cron triggers /api/cron/import-leads
    ↓
Read Google Sheet (LinkedIn exports)
    ↓
Verify emails with Hunter.io (90% confidence)
    ↓
Remove duplicates (check existing CRM)
    ↓
Bulk import new leads
    ↓
Log report to console
```

### **Your Job (Manual - 2 mins/day):**

1. Export LinkedIn search results as CSV
2. Paste data into Google Sheet
3. **System does the rest automatically!**

---

## 🎯 EXACT GOOGLE SHEET FORMAT

| Name | Company | Designation | Email | Phone | LinkedIn URL | Company Size |
|------|---------|-------------|-------|-------|--------------|--------------|
| Rajesh Kumar | TechCorp | Sales Manager | rajesh@techcorp.com | +91-9876543210 | linkedin.com/in/rajesh | 250-500 |
| Priya Singh | SoftCo | Operations Manager | priya@softco.com | +91-8765432109 | linkedin.com/in/priya | 100-250 |

---

## 📈 RESULTS IN CRM

Each imported lead gets:
- ✅ Name
- ✅ Email (verified)
- ✅ Phone
- ✅ Company
- ✅ Designation
- ✅ Status: "NEW"
- ✅ Source: "LinkedIn"
- ✅ Email Confidence Score
- ✅ Auto-timestamp

---

## 🔍 MONITOR IMPORTS

### Check Cron Logs:
1. Go to: https://vercel.com/dashboard/airanix-crm
2. Click "Deployments"
3. View "Cron Jobs" tab
4. See run history + results

### Check CRM:
- Go to /contacts
- Filter by Status = "NEW"
- See today's imports

---

## ⚠️ TROUBLESHOOTING

**Issue:** No leads imported
- **Check:** Google Sheet ID is correct
- **Check:** Sheet has data in correct columns
- **Check:** Hunter.io API key is valid

**Issue:** Leads not verified
- **Check:** Email format is correct (name@company.com)
- **Check:** Hunter.io quota (100/month free)

**Issue:** Cron not running
- **Check:** vercel.json is committed
- **Check:** Environment variables set in Vercel dashboard
- **Check:** API endpoint is working (`/api/cron/import-leads`)

---

## 🚀 QUICK START

```bash
# 1. Install dependencies (if needed)
npm install

# 2. Build
npm run build

# 3. Add environment variables to .env.local
HUNTER_API_KEY=xxx
GOOGLE_SHEETS_API_KEY=xxx
GOOGLE_SHEET_ID=xxx
CRON_SECRET=xxx

# 4. Commit and push
git add -A
git commit -m "Setup: Automated lead import"
git push

# 5. Add env vars to Vercel dashboard
# Done! Cron runs daily at 9 AM IST
```

---

## 📞 NEXT STEPS

1. ✅ Get Hunter.io API key
2. ✅ Create Google Sheet
3. ✅ Get Google Sheets API key
4. ✅ Add to .env.local
5. ✅ Push to GitHub
6. ✅ Add env vars to Vercel
7. ✅ Test by manually triggering: `curl https://your-domain.com/api/cron/import-leads`

**That's it! Fully automated now.** 🎯
