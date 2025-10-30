# Plugin Reports System - Setup Guide

## Phase 7: Report Plugin System

This system allows users to report problematic plugins for moderation.

## Database Setup

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select project: **BigMind** (rfnvtosfwvxoysmncrzz)
3. Navigate to **SQL Editor**
4. Copy the content of `supabase/migrations/20251030_plugin_reports.sql`
5. Paste and execute

### Option 2: Via CLI (Alternative)

If you prefer using the CLI and have `psql` access:

```bash
# The SQL file is located at:
supabase/migrations/20251030_plugin_reports.sql

# Or:
PLUGIN_REPORTS_SETUP.sql
```

## Database Schema

The system creates two tables:

### 1. `plugin_reports`

Main table for storing plugin reports:

- **id**: UUID (primary key)
- **pluginId**: TEXT (plugin being reported)
- **category**: TEXT (malware, spam, inappropriate, broken, copyright, other)
- **description**: TEXT (detailed description)
- **reporter_email**: TEXT (optional, for follow-up)
- **reporter_ip**: TEXT (for rate limiting)
- **status**: TEXT (pending, reviewing, resolved, rejected)
- **admin_note**: TEXT (admin notes)
- **created_at**, **updated_at**, **reviewed_at**: TIMESTAMP
- **reviewed_by**: TEXT (admin who reviewed)

### 2. `report_submissions`

For rate limiting (3 reports/plugin/IP/24h):

- **id**: UUID
- **pluginId**: TEXT
- **ip_address**: TEXT
- **created_at**: TIMESTAMP

## Indexes

Performance indexes created for:
- Plugin ID lookups
- Status filtering
- Date-based queries
- IP-based rate limiting

## Helper Function

`get_plugin_report_count(plugin_id TEXT)` - Returns report counts by status

## Permissions

- **anon**: SELECT, INSERT (users can report and see reports)
- **authenticated**: Full access (admins can moderate)

## Rate Limiting

- Users limited to 3 reports per plugin per 24 hours (by IP)
- Enforced via `report_submissions` table

## Next Steps

After database setup:

1. Create `PluginReportService.ts` service
2. Create `ReportPluginModal` component
3. Integrate report button in plugin cards
4. Create admin moderation panel
5. Add warning badges for flagged plugins

## Verification

After executing the SQL, verify:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%report%';

-- Test function
SELECT * FROM get_plugin_report_count('com.example.test');
```
