# BigMind CDN Infrastructure

Phase 4 - Sprint 2 - CDN & Caching Strategy

## Overview

High-performance content delivery network for plugin distribution with multi-layer caching.

## Architecture

```
User → CDN (Nginx) → Cache → Verdaccio Registry → npm
                   ↓
                Origin Server
```

## Features

- **Immutable caching**: Plugin packages cached for 1 year
- **Metadata caching**: 5-minute cache with stale-while-revalidate
- **Rate limiting**: Protection against abuse
- **Compression**: Gzip + Brotli support
- **Security headers**: CSP, CORS, SRI
- **Cache purging**: Admin API for invalidation

## Quick Start

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f nginx

# Stop services
docker-compose down
```

## Cache Zones

### plugins (10GB)
- Plugin packages (.tgz)
- Immutable content
- 30-day inactivity timeout

### metadata (1GB)
- Package manifests
- Version lists
- 5-minute inactivity timeout

## Cache Performance

- **HIT**: Content served from cache
- **MISS**: Content fetched from origin
- **STALE**: Expired content served while revalidating
- **UPDATING**: Content being refreshed in background
- **BYPASS**: Not cacheable

## Monitoring

```bash
# Cache statistics
curl http://localhost/metrics

# Health check
curl http://localhost/health
```

## Cache Purge

```bash
# Purge specific package
curl -X PURGE http://localhost/purge/?key=/@bigmind/my-plugin/-/my-plugin-1.0.0.tgz

# Purge metadata
curl -X PURGE http://localhost/purge/?key=/@bigmind/my-plugin/
```

## Security

- Rate limiting: 100 req/s for API, 50 req/s for downloads
- CORS enabled for plugin assets
- Admin endpoints restricted to private networks
- Security headers on all responses

## Performance Tuning

Edit `nginx.conf` to adjust:
- `worker_connections`: Concurrent connections per worker
- `proxy_cache_valid`: Cache duration per status code
- Cache zone sizes in `proxy_cache_path`
- Rate limit zones

## See Also

- [CacheManager](../../apps/web/src/distribution/CacheManager.ts)
- [AssetUploader](../../apps/web/src/distribution/AssetUploader.ts)
- [Verdaccio Config](../verdaccio/README.md)
