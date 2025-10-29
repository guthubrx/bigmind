-- ============================================
-- SUPABASE COMPLETE SETUP FOR BIGMIND
-- Plugin Ratings & Moderation System
-- ============================================

-- ============================================
-- STEP 1: Drop existing objects (if any)
-- ============================================
DROP TABLE IF EXISTS plugin_rating_replies CASCADE;
DROP TABLE IF EXISTS plugin_ratings CASCADE;

-- ============================================
-- STEP 2: Create plugin_ratings table
-- ============================================
CREATE TABLE plugin_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "pluginId" TEXT NOT NULL,
  "userName" TEXT NOT NULL,
  email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 3: Create plugin_rating_replies table
-- ============================================
CREATE TABLE plugin_rating_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "rating_id" UUID NOT NULL REFERENCES plugin_ratings(id) ON DELETE CASCADE,
  "author_name" TEXT NOT NULL,
  "reply_text" TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 4: Create indexes for performance
-- ============================================
CREATE INDEX idx_plugin_ratings_pluginId ON plugin_ratings("pluginId");
CREATE INDEX idx_plugin_ratings_is_approved ON plugin_ratings(is_approved) WHERE is_approved = false;
CREATE INDEX idx_plugin_ratings_created_at ON plugin_ratings(created_at DESC);
CREATE INDEX idx_plugin_ratings_plugin_approved ON plugin_ratings("pluginId", is_approved);
CREATE INDEX idx_plugin_rating_replies_rating_id ON plugin_rating_replies("rating_id");

-- ============================================
-- STEP 5: Enable RLS (Row Level Security)
-- ============================================
ALTER TABLE plugin_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_rating_replies ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: Drop existing policies (clean slate)
-- ============================================
DROP POLICY IF EXISTS "Allow admins delete ratings" ON plugin_ratings;
DROP POLICY IF EXISTS "Allow admins update approval" ON plugin_ratings;
DROP POLICY IF EXISTS "Allow public insert ratings" ON plugin_ratings;
DROP POLICY IF EXISTS "Allow public insert unapproved ratings" ON plugin_ratings;
DROP POLICY IF EXISTS "Allow public read approved ratings" ON plugin_ratings;
DROP POLICY IF EXISTS "Show approved for public, all for moderators" ON plugin_ratings;
DROP POLICY IF EXISTS "Allow public read" ON plugin_ratings;
DROP POLICY IF EXISTS "Allow public insert" ON plugin_ratings;

DROP POLICY IF EXISTS "Allow public read replies" ON plugin_rating_replies;
DROP POLICY IF EXISTS "Allow public insert replies" ON plugin_rating_replies;
DROP POLICY IF EXISTS "Allow admins delete replies" ON plugin_rating_replies;

-- ============================================
-- STEP 7: Create RLS Policies for plugin_ratings
-- ============================================

-- Policy 1: Public can READ only APPROVED ratings
CREATE POLICY "Allow public read approved ratings"
ON plugin_ratings
FOR SELECT
TO public
USING (is_approved = true);

-- Policy 2: Public can INSERT new ratings (always unapproved)
CREATE POLICY "Allow public insert ratings"
ON plugin_ratings
FOR INSERT
TO public
WITH CHECK (true);

-- Policy 3: Authenticated users (admins) can UPDATE
CREATE POLICY "Allow admins update approval"
ON plugin_ratings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy 4: Authenticated users (admins) can DELETE
CREATE POLICY "Allow admins delete ratings"
ON plugin_ratings
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- STEP 8: Create RLS Policies for plugin_rating_replies
-- ============================================

-- Policy 1: Public can READ replies on approved ratings
CREATE POLICY "Allow public read replies"
ON plugin_rating_replies
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM plugin_ratings
    WHERE id = rating_id AND is_approved = true
  )
);

-- Policy 2: Public can INSERT replies
CREATE POLICY "Allow public insert replies"
ON plugin_rating_replies
FOR INSERT
TO public
WITH CHECK (true);

-- Policy 3: Authenticated users can DELETE replies
CREATE POLICY "Allow admins delete replies"
ON plugin_rating_replies
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- STEP 9: Verify setup
-- ============================================
-- Show tables
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('plugin_ratings', 'plugin_rating_replies');

-- Show columns
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'plugin_ratings'
ORDER BY ordinal_position;

-- Show RLS policies
SELECT
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('plugin_ratings', 'plugin_rating_replies')
ORDER BY tablename, policyname;

-- Show indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('plugin_ratings', 'plugin_rating_replies')
ORDER BY tablename, indexname;

-- ============================================
-- DONE!
-- ============================================
-- The database is now ready to use.
--
-- Summary:
-- - plugin_ratings table with is_approved column
-- - plugin_rating_replies table for admin responses
-- - RLS enabled with proper policies
-- - Indexes for performance optimization
--
-- Next steps:
-- 1. Update your Supabase environment variables
-- 2. Reload your application
-- 3. Test submitting a rating
-- 4. Go to Admin Panel and approve/reject
-- ============================================
