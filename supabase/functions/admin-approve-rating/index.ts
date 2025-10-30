/**
 * Admin Approve Rating Edge Function
 * Allows admins to approve a plugin rating
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyAdmin, corsHeaders } from '../_shared/admin-auth.ts';

Deno.serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
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

    // Update rating to approved
    const { data, error } = await supabase
      .from('plugin_ratings')
      .update({
        is_approved: true,
        approved_at: new Date().toISOString(),
        approved_by: adminCheck.githubUser?.login,
      })
      .eq('id', ratingId)
      .select()
      .single();

    if (error) {
      console.error('[admin-approve-rating] Database error:', error);
      return new Response(JSON.stringify({ success: false, error: 'Failed to approve rating' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(
      `[admin-approve-rating] ✅ Rating ${ratingId} approved by ${adminCheck.githubUser?.login}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        rating: data,
        message: 'Rating approved successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[admin-approve-rating] Unexpected error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
