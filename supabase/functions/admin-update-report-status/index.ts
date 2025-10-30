/**
 * Admin Update Report Status Edge Function
 * Allows admins to update the status of a plugin report
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyAdmin, corsHeaders } from '../_shared/admin-auth.ts';

type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'rejected';

Deno.serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only accept POST/PATCH requests
    if (req.method !== 'POST' && req.method !== 'PATCH') {
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
    const { reportId, status, adminNote } = body;

    if (!reportId || !status) {
      return new Response(
        JSON.stringify({ success: false, error: 'reportId and status are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate status
    const validStatuses: ReportStatus[] = ['pending', 'reviewing', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare update data
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Add reviewed_at and reviewed_by for resolved/rejected statuses
    if (status === 'resolved' || status === 'rejected') {
      updateData.reviewed_at = new Date().toISOString();
      updateData.reviewed_by = adminCheck.githubUser?.login;
    }

    // Add admin note if provided
    if (adminNote) {
      updateData.admin_note = adminNote;
    }

    // Update report status
    const { data, error } = await supabase
      .from('plugin_reports')
      .update(updateData)
      .eq('id', reportId)
      .select()
      .single();

    if (error) {
      console.error('[admin-update-report-status] Database error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update report status' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(
      `[admin-update-report-status] ✅ Report ${reportId} status updated to ${status} by ${adminCheck.githubUser?.login}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        report: data,
        message: `Report status updated to ${status}`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[admin-update-report-status] Unexpected error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
