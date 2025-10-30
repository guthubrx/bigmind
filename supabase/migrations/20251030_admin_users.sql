-- ============================================
-- ADMIN USERS SYSTEM - SETUP
-- Système de gestion des administrateurs basé sur GitHub
-- ============================================

-- ============================================
-- STEP 1: Drop existing table if any
-- ============================================
DROP TABLE IF EXISTS admin_users CASCADE;

-- ============================================
-- STEP 2: Create admin_users table
-- ============================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- GitHub identifiers (source of truth)
  github_user_id TEXT NOT NULL UNIQUE,
  github_username TEXT NOT NULL,
  github_email TEXT,
  github_avatar_url TEXT,

  -- Role management
  role TEXT NOT NULL DEFAULT 'moderator' CHECK (role IN ('moderator', 'admin', 'super_admin')),

  -- Audit trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  last_action TIMESTAMP WITH TIME ZONE,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Notes
  notes TEXT
);

-- ============================================
-- STEP 3: Create indexes for performance
-- ============================================
CREATE INDEX idx_admin_users_github_id ON admin_users(github_user_id);
CREATE INDEX idx_admin_users_github_username ON admin_users(github_username);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);
CREATE INDEX idx_admin_users_last_login ON admin_users(last_login DESC);

-- ============================================
-- STEP 4: Disable RLS (use Edge Functions for security)
-- ============================================
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Grant permissions
-- ============================================

-- Anonymous users: NO access (admin table)
-- Authenticated users: READ ONLY (for audit purposes)
GRANT SELECT ON admin_users TO authenticated;

-- Service role: FULL access (Edge Functions use this)
-- Note: Service role is used by Edge Functions to manage admins

-- ============================================
-- STEP 6: Insert initial super admin
-- ============================================

-- Initial super admin: guthubrx (GitHub ID: 158686865)
-- Retrieved via: curl https://api.github.com/users/guthubrx

INSERT INTO admin_users (
  github_user_id,
  github_username,
  github_email,
  github_avatar_url,
  role,
  notes
) VALUES (
  '158686865',            -- GitHub numeric ID
  'guthubrx',             -- GitHub username
  'githubrx@runbox.com',  -- Email
  'https://avatars.githubusercontent.com/u/158686865?v=4',  -- Avatar
  'super_admin',          -- Full privileges
  'Initial super admin - Project owner'
) ON CONFLICT (github_user_id) DO NOTHING;

-- ============================================
-- STEP 7: Create helper functions
-- ============================================

-- Function to check if a GitHub user is admin
CREATE OR REPLACE FUNCTION is_github_user_admin(gh_user_id TEXT)
RETURNS TABLE(
  is_admin BOOLEAN,
  role TEXT,
  username TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (admin_users.is_active = true) as is_admin,
    admin_users.role,
    admin_users.github_username
  FROM admin_users
  WHERE admin_users.github_user_id = gh_user_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to update last login timestamp
CREATE OR REPLACE FUNCTION update_admin_last_login(gh_user_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE admin_users
  SET last_login = NOW()
  WHERE github_user_id = gh_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update last action timestamp
CREATE OR REPLACE FUNCTION update_admin_last_action(gh_user_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE admin_users
  SET last_action = NOW()
  WHERE github_user_id = gh_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get all active admins
CREATE OR REPLACE FUNCTION get_active_admins()
RETURNS TABLE(
  github_username TEXT,
  role TEXT,
  last_login TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    admin_users.github_username,
    admin_users.role,
    admin_users.last_login
  FROM admin_users
  WHERE admin_users.is_active = true
  ORDER BY admin_users.role DESC, admin_users.last_login DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'admin_users'
ORDER BY ordinal_position;

-- Verify indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'admin_users';

-- Verify permissions
SELECT
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'admin_users'
ORDER BY grantee, privilege_type;

-- Test functions
SELECT * FROM is_github_user_admin('YOUR_GITHUB_USER_ID');
SELECT * FROM get_active_admins();

-- Show current admins
SELECT
  github_username,
  role,
  is_active,
  created_at,
  last_login
FROM admin_users
ORDER BY created_at;
