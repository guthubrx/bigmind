# Rate Limiting Setup Guide

## Overview
Protège contre les abus en limitant les ratings à **5 par IP par plugin par heure**.

---

## Step 1: Create Rating Attempts Table

Go to **Supabase Dashboard → SQL Editor** and run this SQL:

```sql
-- Table to track rating attempts by IP
CREATE TABLE rating_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  plugin_id TEXT NOT NULL,
  attempted_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_rating_attempts_ip_plugin
  ON rating_attempts(ip_address, plugin_id, attempted_at DESC);

-- Enable RLS
ALTER TABLE rating_attempts ENABLE ROW LEVEL SECURITY;

-- Allow function to read and insert
CREATE POLICY "Allow rate limit function" ON rating_attempts
  FOR ALL USING (true) WITH CHECK (true);

-- Optional: Auto-cleanup old records (run daily)
CREATE OR REPLACE FUNCTION cleanup_old_rating_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM rating_attempts
  WHERE attempted_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
```

---

## Step 2: Deploy Edge Function

1. Go to **Supabase Dashboard → Edge Functions**
2. Click **"Create New Function"**
3. Name it: `check-rate-limit`
4. Paste this code:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { pluginId } = await req.json()

    if (!pluginId) {
      return new Response(
        JSON.stringify({ error: 'Missing pluginId' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Extract IP from request headers (works in production)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               req.headers.get('cf-connecting-ip') ||
               'unknown'

    console.log(`[Rate Limit] IP: ${ip}, Plugin: ${pluginId}`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check how many ratings from this IP for this plugin in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const { data: attempts, error: queryError } = await supabase
      .from('rating_attempts')
      .select('id', { count: 'exact' })
      .eq('ip_address', ip)
      .eq('plugin_id', pluginId)
      .gte('attempted_at', oneHourAgo)

    if (queryError) {
      console.error('[Rate Limit] Query error:', queryError)
      // Don't block on error
      return new Response(
        JSON.stringify({ allowed: true }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    const attemptCount = (attempts?.length || 0)
    const RATE_LIMIT = 5

    console.log(`[Rate Limit] Attempts in last hour: ${attemptCount}/${RATE_LIMIT}`)

    if (attemptCount >= RATE_LIMIT) {
      console.log(`[Rate Limit] BLOCKED - Too many attempts`)
      return new Response(
        JSON.stringify({
          allowed: false,
          message: `Trop de tentatives (${RATE_LIMIT} max par heure). Réessayez plus tard.`
        }),
        { status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Record this attempt
    const { error: insertError } = await supabase
      .from('rating_attempts')
      .insert([{
        ip_address: ip,
        plugin_id: pluginId,
        attempted_at: new Date().toISOString()
      }])

    if (insertError) {
      console.error('[Rate Limit] Insert error:', insertError)
    }

    return new Response(
      JSON.stringify({ allowed: true }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )

  } catch (error) {
    console.error('[Rate Limit] Error:', error)
    // Fail open - allow if there's an error
    return new Response(
      JSON.stringify({ allowed: true }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})
```

5. Click **"Deploy"** button
6. Wait for success message ✅

---

## Step 3: Test It

1. Go to plugin modal
2. Try to submit 6 ratings quickly
3. On the 6th attempt, you should see: **"Trop de tentatives (5 max par heure). Réessayez plus tard."**

---

## How It Works

```
User submits rating
       ↓
Frontend calls Edge Function
       ↓
Function reads IP from request header
       ↓
Function queries rating_attempts table
       ↓
Counts attempts from this IP for this plugin in last hour
       ↓
If < 5: Insert record, return allowed: true
       ↓
If ≥ 5: Return allowed: false with message
       ↓
Frontend shows error message
```

---

## IP Detection Methods (in order)

The function tries to detect IP from:
1. `x-forwarded-for` header (most common, used by CloudFlare, nginx)
2. `cf-connecting-ip` header (CloudFlare)
3. Falls back to `'unknown'` if both missing

This works automatically in production. Locally during dev, it may show `'127.0.0.1'`.

---

## Optional: Increase Limit for Testing

To allow more ratings during testing, modify the function:

```typescript
const RATE_LIMIT = 50  // Change from 5 to 50
```

---

## Monitoring

Check the Edge Function logs in Supabase:
1. Go to **Edge Functions → check-rate-limit**
2. Click **"View all logs"**
3. See IP tracking and blocked attempts

---

## Configuration

Current limits (editable in Edge Function):
- **5 ratings** per IP
- **Per plugin**
- **Per hour**

To change, modify `const RATE_LIMIT = 5` in the function.

---

## Cleanup

Old records are automatically kept for debugging. To manually delete old records:

```sql
DELETE FROM rating_attempts
WHERE attempted_at < NOW() - INTERVAL '24 hours';
```
