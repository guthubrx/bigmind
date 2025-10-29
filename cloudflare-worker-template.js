/**
 * BigMind Plugin Registry API - Cloudflare Worker
 *
 * Déploiement:
 * 1. npm install -g wrangler
 * 2. wrangler login
 * 3. Copier ce fichier dans un dossier et le renommer worker.js
 * 4. Créer wrangler.toml (voir DEPLOYMENT_GUIDE.md)
 * 5. wrangler deploy
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS headers pour permettre les requêtes depuis BigMind app
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Gérer les requêtes OPTIONS (preflight CORS)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // GET /api/plugins - Liste tous les plugins
    if (url.pathname === '/api/plugins') {
      try {
        const registry = await env.R2_BUCKET.get('registry.json');

        if (!registry) {
          // Si registry.json n'existe pas encore, retourner liste vide
          return new Response(JSON.stringify({ plugins: [] }), {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=60'
            }
          });
        }

        const data = await registry.text();
        return new Response(data, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60'
          }
        });
      } catch (error) {
        console.error('Error fetching plugins:', error);
        return new Response(JSON.stringify({
          error: 'Failed to fetch plugins',
          details: error.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // GET /api/plugins/:id - Récupère un plugin spécifique
    const pluginMatch = url.pathname.match(/^\/api\/plugins\/([^\/]+)$/);
    if (pluginMatch && request.method === 'GET') {
      const pluginId = pluginMatch[1];

      try {
        const registry = await env.R2_BUCKET.get('registry.json');

        if (!registry) {
          return new Response(JSON.stringify({
            error: 'Plugin not found',
            pluginId
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const data = JSON.parse(await registry.text());
        const plugin = data.plugins.find(p => p.id === pluginId);

        if (!plugin) {
          return new Response(JSON.stringify({
            error: 'Plugin not found',
            pluginId
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify(plugin), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300'
          }
        });
      } catch (error) {
        console.error('Error fetching plugin:', error);
        return new Response(JSON.stringify({
          error: 'Failed to fetch plugin',
          details: error.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // GET /api/plugins/:id/download - Télécharge le ZIP du plugin
    const downloadMatch = url.pathname.match(/^\/api\/plugins\/([^\/]+)\/download$/);
    if (downloadMatch && request.method === 'GET') {
      const pluginId = downloadMatch[1];
      const version = url.searchParams.get('version') || 'latest';

      try {
        // Récupérer les infos du plugin depuis registry.json
        const registry = await env.R2_BUCKET.get('registry.json');

        if (!registry) {
          return new Response('Registry not found', {
            status: 404,
            headers: corsHeaders
          });
        }

        const data = JSON.parse(await registry.text());
        const plugin = data.plugins.find(p => p.id === pluginId);

        if (!plugin) {
          return new Response('Plugin not found', {
            status: 404,
            headers: corsHeaders
          });
        }

        // Déterminer la version à télécharger
        const targetVersion = version === 'latest' ? plugin.version : version;
        const zipPath = `plugins/${pluginId}/${pluginId}-${targetVersion}.zip`;

        console.log(`Downloading plugin: ${zipPath}`);

        // Récupérer le fichier ZIP depuis R2
        const zipFile = await env.R2_BUCKET.get(zipPath);

        if (!zipFile) {
          return new Response(`Plugin ZIP not found: ${zipPath}`, {
            status: 404,
            headers: corsHeaders
          });
        }

        // Retourner le ZIP
        return new Response(zipFile.body, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${pluginId}-${targetVersion}.zip"`,
            'Cache-Control': 'public, max-age=86400' // Cache 24h
          }
        });
      } catch (error) {
        console.error('Error downloading plugin:', error);
        return new Response(JSON.stringify({
          error: 'Failed to download plugin',
          details: error.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // GET /api/health - Health check
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'bigmind-plugin-registry',
        timestamp: new Date().toISOString()
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Route inconnue
    return new Response(JSON.stringify({
      error: 'Not found',
      path: url.pathname,
      availableEndpoints: [
        'GET /api/plugins',
        'GET /api/plugins/:id',
        'GET /api/plugins/:id/download?version=latest',
        'GET /api/health'
      ]
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};
