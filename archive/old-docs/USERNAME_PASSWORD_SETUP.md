# Username & Password Change Setup Guide

## What's New?

You can now change your username and password from the profile page!

## Setup Required

You need to add two new fields to your database:

### Option 1: Run SQL in Supabase Dashboard

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Run this SQL:

```sql
-- Add username column (unique)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Add password_hash column for storing hashed passwords
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Update existing admin user with default credentials
UPDATE users 
SET username = 'admin'
WHERE email = 'admin@pos.com' AND username IS NULL;

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
```

### Option 2: Use the SQL file

The SQL is also available in `lib/add-auth-fields.sql`

## How to Use

### Change Username

1. Go to My Profile page
2. Click "Change Username" button
3. Enter your new username (minimum 3 characters)
4. Click "Change Username"
5. You'll be logged out automatically
6. Login again with your new username and existing password

### Change Password

1. Go to My Profile page
2. Click "Change Password" button
3. Enter:
   - Current password (default is `admin123`)
   - New password (minimum 6 characters)
   - Confirm new password
4. Click "Change Password"
5. Your password is now updated!

## Current Login Credentials

- Username: `admin`
- Password: `admin123`
- Email: `admin@pos.com` (or your updated email)

## Important Notes

- Username must be unique across all users
- Password must be at least 6 characters
- Changing username will log you out
- Passwords are securely hashed using bcrypt
- You can still login with username `admin` and password `admin123` until you change them

## Features

✅ Change username (requires re-login)
✅ Change password (secure bcrypt hashing)
✅ Edit profile (name, email, phone)
✅ Duplicate email/username detection
✅ Toast notifications for all actions
