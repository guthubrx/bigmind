import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const RATE_LIMIT = 5; // Max 5 submissions per plugin per 24 hours
const TIME_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

Deno.serve(async req => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Parse request body
    const body = await req.json();
    const { pluginId } = body;

    if (!pluginId) {
      return new Response(JSON.stringify({ error: 'pluginId is required', allowed: false }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get client IP from headers
    const ip =
      req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase credentials', allowed: false }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check submissions in last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - TIME_WINDOW).toISOString();

    const { data: submissions, error: fetchError } = await supabase
      .from('rating_submissions')
      .select('id', { count: 'exact' })
      .eq('pluginId', pluginId)
      .eq('ip_address', ip)
      .gte('created_at', twentyFourHoursAgo);

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = table doesn't exist, which is OK on first run
      console.error('[check-rate-limit] Error fetching submissions:', fetchError);
      return new Response(JSON.stringify({ error: 'Database error', allowed: false }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const submissionCount = submissions?.length || 0;

    if (submissionCount >= RATE_LIMIT) {
      return new Response(
        JSON.stringify({
          allowed: false,
          message: `Vous avez atteint la limite de ${RATE_LIMIT} avis par plugin par 24h. Veuillez réessayer demain.`,
          remaining: 0,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Record this submission attempt
    const { error: insertError } = await supabase.from('rating_submissions').insert({
      pluginId,
      ip_address: ip,
      created_at: new Date().toISOString(),
    });

    if (insertError && insertError.code !== 'PGRST116') {
      console.error('[check-rate-limit] Error recording submission:', insertError);
      // Don't block submission if we can't record it
    }

    return new Response(
      JSON.stringify({
        allowed: true,
        message: 'OK',
        remaining: RATE_LIMIT - submissionCount - 1,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[check-rate-limit] Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', allowed: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
