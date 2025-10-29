# Supabase Setup Guide - Plugin Ratings

## 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign up (free tier)
3. Create new project
4. Region: Choose closest to your users (Europe/US)
5. Database password: Save it somewhere secure

## 2. Get Your Credentials

Once project is created:
1. Go to **Settings** → **API**
2. Copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

## 3. Create plugin_ratings Table

Copy this SQL into Supabase SQL Editor:

```sql
-- Create plugin_ratings table
CREATE TABLE plugin_ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pluginId TEXT NOT NULL,
  userName TEXT NOT NULL,
  email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_plugin_ratings_pluginId ON plugin_ratings(pluginId);
CREATE INDEX idx_plugin_ratings_created_at ON plugin_ratings(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE plugin_ratings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to READ
CREATE POLICY "Allow public read" ON plugin_ratings
  FOR SELECT USING (true);

-- Allow anyone to INSERT (public ratings)
CREATE POLICY "Allow public insert" ON plugin_ratings
  FOR INSERT WITH CHECK (true);
```

Run the SQL in the **SQL Editor** section.

## 4. Verify Setup

1. Go to **Table Editor**
2. You should see `plugin_ratings` table with columns:
   - id
   - pluginId
   - userName
   - email
   - rating
   - comment
   - created_at
   - updated_at

## 5. Add Environment Variables

Create `.env.local` in `/apps/web/`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 6. Test Connection

In your app, the ratings should:
- ✅ Load existing ratings
- ✅ Submit new ratings (no auth needed!)
- ✅ Show aggregated stats

## Security Notes

### Current Setup (Public)
- Anyone can READ ratings (good for transparency)
- Anyone can INSERT ratings (no spam protection yet)
- ✅ No sensitive data exposed

### Future Improvements
- Add rate limiting (prevent spam)
- Add email verification (optional)
- Add moderation workflow
- Archive old ratings

## Troubleshooting

### "Failed to connect to Supabase"
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check `.env.local` file exists
- Restart dev server

### "No ratings showing"
- Check table exists: go to **Table Editor**
- Check policies are enabled (should see green checkmarks)
- Open browser console for errors

### "Can't submit ratings"
- Check RLS policy allows INSERT
- Check table columns match interface
- Check error message in browser console

## Cost (Free Tier)

- ✅ Unlimited API calls
- ✅ 500MB storage
- ✅ 2 projects
- ✅ Perfect for our use case!

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime) (optional, for live updates)
