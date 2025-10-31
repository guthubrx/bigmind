# Cartae Verdaccio Registry

Private npm registry for Cartae scoped packages (`@cartae/*`).

## Quick Start

### Development

```bash
# 1. Create htpasswd file for authentication
cp .htpasswd.example htpasswd
# Edit htpasswd and add your credentials (see .htpasswd.example for instructions)

# 2. Start the registry
docker-compose up -d

# 3. Configure npm to use the registry
npm set registry http://localhost:4873/
npm adduser --registry http://localhost:4873/

# 4. Publish a package
npm publish --registry http://localhost:4873/
```

### Production

```bash
# Set environment variables
export VERDACCIO_JWT_SECRET=your-secret-here
export POSTGRES_PASSWORD=your-db-password-here

# Start with production settings
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Configuration

### config.yaml

Main configuration file for Verdaccio. See inline comments for details.

Key sections:
- **auth**: htpasswd-based authentication
- **uplinks**: Proxy to public npm registry
- **packages**: Access control for @cartae/* packages
- **security**: JWT configuration

### htpasswd

Authentication file. Create using:

```bash
htpasswd -nbB username password >> htpasswd
```

## Usage

### Publishing Packages

```bash
# Login first
npm login --registry http://localhost:4873/

# Publish
npm publish --registry http://localhost:4873/
```

### Installing Packages

```bash
# Configure npm
npm set registry http://localhost:4873/

# Or use .npmrc in project
echo "registry=http://localhost:4873/" > .npmrc

# Install
npm install @cartae/plugin-sdk
```

### Scoped Configuration

To use Verdaccio only for @cartae scope:

```bash
npm config set @cartae:registry http://localhost:4873/
```

## URLs

- **Web UI**: http://localhost:4873/
- **Health Check**: http://localhost:4873/-/ping
- **Package Search**: http://localhost:4873/-/v1/search?text=plugin

## Security

- Uses bcrypt for password hashing
- JWT tokens for authentication
- HTTPS recommended for production
- CSP headers enabled

## Monitoring

Check logs:

```bash
docker-compose logs -f verdaccio
```

Health check:

```bash
curl http://localhost:4873/-/ping
```

## Backup

Storage is in Docker volume `verdaccio-storage`. Backup:

```bash
docker run --rm -v verdaccio-storage:/source -v $(pwd):/backup alpine tar czf /backup/verdaccio-backup.tar.gz -C /source .
```

Restore:

```bash
docker run --rm -v verdaccio-storage:/target -v $(pwd):/backup alpine tar xzf /backup/verdaccio-backup.tar.gz -C /target
```
