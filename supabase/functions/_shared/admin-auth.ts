/**
 * Shared Admin Authentication Module
 * Provides reusable function to verify admin status
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

export interface AdminVerification {
  isAdmin: boolean;
  role?: string;
  githubUser?: GitHubUser;
  error?: string;
}

/**
 * Verifies if the request comes from an admin user
 * @param authHeader - The Authorization header value
 * @returns AdminVerification object with admin status
 */
export async function verifyAdmin(authHeader: string | null): Promise<AdminVerification> {
  // Check if Authorization header exists
  if (!authHeader) {
    return {
      isAdmin: false,
      error: 'No authorization header provided',
    };
  }

  // Extract token (format: "Bearer TOKEN" or just "TOKEN")
  const token = authHeader.replace('Bearer ', '').trim();

  // Fetch user info from GitHub
  try {
    const githubResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!githubResponse.ok) {
      console.error('[admin-auth] GitHub API error:', githubResponse.status);
      return {
        isAdmin: false,
        error: 'Invalid GitHub token',
      };
    }

    const githubUser: GitHubUser = await githubResponse.json();
    console.log(
      `[admin-auth] Verifying admin for GitHub user: ${githubUser.login} (ID: ${githubUser.id})`
    );

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is admin in admin_users table
    const { data: adminUser, error: queryError } = await supabase
      .from('admin_users')
      .select('role, is_active')
      .eq('github_user_id', githubUser.id.toString())
      .eq('is_active', true)
      .single();

    if (queryError || !adminUser) {
      console.log(`[admin-auth] User ${githubUser.login} is not an admin`);
      return {
        isAdmin: false,
        githubUser,
        error: 'User is not authorized as admin',
      };
    }

    // Update last_action timestamp
    await supabase
      .from('admin_users')
      .update({ last_action: new Date().toISOString() })
      .eq('github_user_id', githubUser.id.toString());

    console.log(`[admin-auth] ✅ Admin verified: ${githubUser.login} (${adminUser.role})`);

    return {
      isAdmin: true,
      role: adminUser.role,
      githubUser,
    };
  } catch (error) {
    console.error('[admin-auth] Unexpected error:', error);
    return {
      isAdmin: false,
      error: 'Internal server error during admin verification',
    };
  }
}

/**
 * CORS headers for cross-origin requests
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
