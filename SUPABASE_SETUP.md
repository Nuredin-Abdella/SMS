# Supabase Setup Guide for MESOB Bot

This guide will help you set up Supabase as the database for your MESOB Telegram Bot.

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Click "New Project"
4. Choose your organization
5. Set project name: `mesob-bot`
6. Set database password (save this!)
7. Choose region closest to you
8. Click "Create new project"

### 2. Get Project Credentials

After project creation:

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **API Key (anon/public)**: `eyJhbGciOiJIUzI1NiIs...`

### 3. Update Environment Variables

Add to your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 4. Create Database Tables

Go to **SQL Editor** in Supabase dashboard and run this SQL:

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    chat_id TEXT UNIQUE NOT NULL,
    personal_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table  
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    tracking_number TEXT UNIQUE NOT NULL,
    chat_id TEXT NOT NULL,
    service TEXT NOT NULL,
    status TEXT DEFAULT 'submitted',
    form_data JSONB,
    documents JSONB DEFAULT '[]',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_chat_id ON users(chat_id);
CREATE INDEX idx_applications_chat_id ON applications(chat_id);
CREATE INDEX idx_applications_tracking ON applications(tracking_number);
CREATE INDEX idx_applications_status ON applications(status);

-- Enable Row Level Security (RLS) for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - you can tighten this later)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on applications" ON applications FOR ALL USING (true);
```

### 5. Test Connection

Start your bot:

```bash
npm start
```

You should see:
```
✅ Supabase connected successfully
```

If you see "Using in-memory storage fallback", check your environment variables.

## 🔧 Configuration Options

### Development vs Production

**Development (current setup):**
- Uses anon key
- Full access policies
- Simple setup

**Production (recommended):**
- Create service role key for server operations
- Implement proper RLS policies
- Add user authentication

### Database Schema

The bot uses these main tables:

**users:**
- `chat_id`: Telegram chat ID (unique)
- `personal_info`: JSON with name, phone, etc.
- `created_at/updated_at`: Timestamps

**applications:**
- `tracking_number`: Unique application ID
- `chat_id`: Links to user
- `service`: Type of service (passport, national_id, etc.)
- `status`: submitted, approved, rejected
- `form_data`: JSON with application form data
- `documents`: JSON array of document IDs
- `notes`: Admin notes

## 🔍 Monitoring

### View Data

In Supabase dashboard:
1. Go to **Table Editor**
2. Select `users` or `applications` table
3. View real-time data

### Query Data

Use the **SQL Editor** to run queries:

```sql
-- Count users by registration status
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN personal_info->>'phoneVerified' = 'true' THEN 1 END) as verified_users
FROM users;

-- View recent applications
SELECT 
  tracking_number,
  service,
  status,
  created_at
FROM applications 
ORDER BY created_at DESC 
LIMIT 10;
```

## ✅ Benefits of Supabase vs MongoDB

✅ **No local setup needed**  
✅ **Built-in admin dashboard**  
✅ **Real-time subscriptions**  
✅ **Automatic backups**  
✅ **PostgreSQL (more reliable than document DB for structured data)**  
✅ **Free tier: 500MB storage, 2M API requests/month**  
✅ **Built-in authentication (for future features)**  

## 🚨 Troubleshooting

### "Using in-memory storage fallback"
- Check SUPABASE_URL and SUPABASE_ANON_KEY in .env
- Verify project is active in Supabase dashboard
- Check internet connection

### "Table doesn't exist" error
- Run the SQL commands above in SQL Editor
- Make sure table names match exactly

### Permission denied errors
- Check RLS policies are created
- Verify anon key has proper permissions

## 🔐 Security Best Practices

1. **Never commit .env file to git**
2. **Use environment variables in production**
3. **Implement proper RLS policies for production**
4. **Monitor usage in Supabase dashboard**
5. **Rotate keys periodically**

Your bot now uses Supabase for reliable, cloud-based data storage! 🎉