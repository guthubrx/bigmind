/**
 * Admin Reject Rating Edge Function
 * Allows admins to reject/delete a plugin rating
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyAdmin, corsHeaders } from '../_shared/admin-auth.ts';

Deno.serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only accept POST/DELETE requests
    if (req.method !== 'POST' && req.method !== 'DELETE') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify admin
    const authHeader = req.headers.get('Authorization');
    const adminCheck = await verifyAdmin(authHeader);

    if (!adminCheck.isAdmin) {
      return new Response(
        JSON.stringify({
          success: false,
          error: adminCheck.error || 'Unauthorized - Admin access required',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const body = await req.json();
    const { ratingId } = body;

    if (!ratingId) {
      return new Response(JSON.stringify({ success: false, error: 'ratingId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Delete the rating
    const { error } = await supabase.from('plugin_ratings').delete().eq('id', ratingId);

    if (error) {
      console.error('[admin-reject-rating] Database error:', error);
      return new Response(JSON.stringify({ success: false, error: 'Failed to reject rating' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(
      `[admin-reject-rating] ✅ Rating ${ratingId} rejected/deleted by ${adminCheck.githubUser?.login}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Rating rejected successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[admin-reject-rating] Unexpected error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
