# BigMind Verdaccio Registry Dockerfile
# Multi-stage build for optimized production image

FROM node:20-alpine AS base

# Install verdaccio globally
RUN npm install -g verdaccio@5.29.0

# Create verdaccio user and directories
RUN addgroup -S verdaccio && \
    adduser -S -G verdaccio verdaccio && \
    mkdir -p /verdaccio/storage /verdaccio/conf /verdaccio/plugins && \
    chown -R verdaccio:verdaccio /verdaccio

# Set working directory
WORKDIR /verdaccio

# Copy configuration
COPY --chown=verdaccio:verdaccio config.yaml /verdaccio/conf/config.yaml
COPY --chown=verdaccio:verdaccio htpasswd /verdaccio/conf/htpasswd

# Switch to verdaccio user
USER verdaccio

# Expose default port
EXPOSE 4873

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4873/-/ping || exit 1

# Volume for persistent storage
VOLUME ["/verdaccio/storage", "/verdaccio/conf"]

# Environment variables
ENV VERDACCIO_USER_NAME=verdaccio \
    VERDACCIO_USER_UID=10001 \
    VERDACCIO_PORT=4873 \
    VERDACCIO_PROTOCOL=http

# Start verdaccio
CMD ["verdaccio", "--config", "/verdaccio/conf/config.yaml", "--listen", "0.0.0.0:4873"]
