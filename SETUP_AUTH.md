# Authentication Setup Guide

## 1. Create the crm_users Table in Supabase

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create crm_users table
CREATE TABLE IF NOT EXISTS crm_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'sales' CHECK (role IN ('admin', 'manager', 'sales')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE crm_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all profiles" ON crm_users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON crm_users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can manage all profiles" ON crm_users
  FOR ALL USING ((SELECT role FROM crm_users WHERE id = auth.uid()) = 'admin');

-- Create admin user (replace with your email)
-- First, the auth user will be created via the admin API in app/api/admin/users/route.ts
```

## 2. Create the Admin User

You have two options:

### Option A: Use the Admin API (Recommended)
1. Set up a temporary admin creation endpoint or run it manually
2. Use the `/api/admin/users` POST endpoint with:
   - Email: `rouble@airanix.com`
   - Password: `191288`
   - Name: `Admin`
   - Role: `admin`

### Option B: Create via Supabase Dashboard
1. Go to Authentication > Users in Supabase
2. Create a new user with email `rouble@airanix.com` and password `191288`
3. Then insert into crm_users table:

```sql
INSERT INTO crm_users (id, email, name, role)
VALUES (
  '(user_id_from_auth)',
  'rouble@airanix.com',
  'Admin',
  'admin'
);
```

## 3. Update Activities Table to Track User ID

Run this SQL to add user tracking to activities:

```sql
ALTER TABLE activities ADD COLUMN user_id UUID;
ALTER TABLE activities ADD COLUMN created_by VARCHAR(255);

ALTER TABLE activities ADD CONSTRAINT activities_user_id_fk
  FOREIGN KEY (user_id) REFERENCES crm_users(id) ON DELETE SET NULL;
```

## 4. Update Contacts Table for Audit Trail

Run this SQL to track who modified contacts:

```sql
ALTER TABLE contacts ADD COLUMN last_modified_by UUID;
ALTER TABLE contacts ADD COLUMN last_modified_by_name VARCHAR(255);
ALTER TABLE contacts ADD COLUMN last_modified_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE contacts ADD CONSTRAINT contacts_user_id_fk
  FOREIGN KEY (last_modified_by) REFERENCES crm_users(id) ON DELETE SET NULL;
```

## 5. Test the Login

1. Navigate to http://localhost:3000/login
2. Login with:
   - Email: `admin@airanix.com`
   - Password: `191288`
3. You should be redirected to the home page
4. Click "Admin Panel" to manage users

## Environment Variables Required

Make sure you have these in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Features Implemented

✅ Login/Logout with Supabase Auth
✅ Admin Panel for user management
✅ Create/Delete/Reset users
✅ Remember Me functionality
✅ Protected routes (redirects to login if not authenticated)
✅ User context provider for global state
✅ User info display in sidebar
✅ Role-based UI (Admin panel only visible to admins)

## Next Steps

1. Update your API routes to capture user_id in activities
2. Update contact modification endpoints to track last_modified_by
3. Add user filtering/audit log viewer
