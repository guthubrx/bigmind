/**
 * GitHub OAuth Callback Handler
 * Exchanges authorization code for access token
 *
 * This Edge Function handles the OAuth callback from GitHub.
 * It exchanges the authorization code for an access token securely on the server side.
 */

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Parse request body
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization code is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get GitHub OAuth credentials from environment variables
    const clientId = Deno.env.get('GITHUB_CLIENT_ID');
    const clientSecret = Deno.env.get('GITHUB_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.error('[github-oauth] Missing GitHub OAuth credentials');
      return new Response(JSON.stringify({ success: false, error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('[github-oauth] GitHub token exchange failed:', tokenResponse.status);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to exchange code for token' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('[github-oauth] GitHub error:', tokenData.error_description);
      return new Response(
        JSON.stringify({
          success: false,
          error: tokenData.error_description || 'GitHub authentication failed',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return new Response(JSON.stringify({ success: false, error: 'No access token received' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch user information
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      console.error('[github-oauth] Failed to fetch user info:', userResponse.status);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch user information' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userData = await userResponse.json();

    console.log(`[github-oauth] Successfully authenticated user: ${userData.login}`);

    // Return token and user data to client
    return new Response(
      JSON.stringify({
        success: true,
        token: accessToken,
        user: {
          id: userData.id,
          login: userData.login,
          name: userData.name,
          email: userData.email,
          avatar_url: userData.avatar_url,
          html_url: userData.html_url,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[github-oauth] Unexpected error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
