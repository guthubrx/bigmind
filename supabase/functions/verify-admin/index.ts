/**
 * Verify Admin Edge Function
 * Verifies if a GitHub user is an admin by checking the admin_users table
 *
 * This function:
 * 1. Receives a GitHub token in Authorization header
 * 2. Calls GitHub API to get user info
 * 3. Checks admin_users table for this GitHub user ID
 * 4. Updates last_login timestamp if admin
 * 5. Returns admin status, role, and user info
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
}

interface AdminUser {
  id: string;
  github_user_id: string;
  github_username: string;
  role: string;
  is_active: boolean;
  last_login: string | null;
}

Deno.serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only accept GET and POST requests
    if (req.method !== 'GET' && req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get GitHub token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ isAdmin: false, error: 'No authorization header provided' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract token (format: "Bearer TOKEN" or just "TOKEN")
    const token = authHeader.replace('Bearer ', '').trim();

    // Fetch user info from GitHub
    const githubResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!githubResponse.ok) {
      console.error('[verify-admin] GitHub API error:', githubResponse.status);
      return new Response(
        JSON.stringify({
          isAdmin: false,
          error: 'Failed to verify GitHub token',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const githubUser: GitHubUser = await githubResponse.json();
    console.log(
      `[verify-admin] Checking admin status for GitHub user: ${githubUser.login} (ID: ${githubUser.id})`
    );

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is admin in admin_users table
    const { data: adminUser, error: queryError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('github_user_id', githubUser.id.toString())
      .eq('is_active', true)
      .single();

    if (queryError) {
      if (queryError.code === 'PGRST116') {
        // No rows returned - user is not an admin
        console.log(`[verify-admin] User ${githubUser.login} is not an admin`);
        return new Response(
          JSON.stringify({
            isAdmin: false,
            message: 'User is not an admin',
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.error('[verify-admin] Database error:', queryError);
      return new Response(
        JSON.stringify({
          isAdmin: false,
          error: 'Database error',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // User is admin! Update last_login timestamp
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('github_user_id', githubUser.id.toString());

    if (updateError) {
      console.error('[verify-admin] Failed to update last_login:', updateError);
      // Non-critical error, continue
    }

    console.log(`[verify-admin] ✅ User ${githubUser.login} is ${adminUser.role}`);

    // Return success with admin info
    return new Response(
      JSON.stringify({
        isAdmin: true,
        role: adminUser.role,
        user: {
          id: githubUser.id,
          login: githubUser.login,
          name: githubUser.name,
          email: githubUser.email,
          avatar_url: githubUser.avatar_url,
        },
        adminInfo: {
          role: adminUser.role,
          lastLogin: adminUser.last_login,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[verify-admin] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        isAdmin: false,
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
