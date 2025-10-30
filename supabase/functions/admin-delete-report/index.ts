/**
 * Admin Delete Report Edge Function
 * Allows admins to permanently delete a plugin report
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyAdmin, corsHeaders } from '../_shared/admin-auth.ts';

Deno.serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only accept DELETE/POST requests
    if (req.method !== 'DELETE' && req.method !== 'POST') {
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

    // Verify that user has sufficient privileges (at least admin role)
    if (adminCheck.role !== 'admin' && adminCheck.role !== 'super_admin') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Insufficient privileges - Admin or Super Admin role required',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const body = await req.json();
    const { reportId } = body;

    if (!reportId) {
      return new Response(JSON.stringify({ success: false, error: 'reportId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Delete the report permanently
    const { error } = await supabase.from('plugin_reports').delete().eq('id', reportId);

    if (error) {
      console.error('[admin-delete-report] Database error:', error);
      return new Response(JSON.stringify({ success: false, error: 'Failed to delete report' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(
      `[admin-delete-report] ✅ Report ${reportId} permanently deleted by ${adminCheck.githubUser?.login} (${adminCheck.role})`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Report deleted successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[admin-delete-report] Unexpected error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
