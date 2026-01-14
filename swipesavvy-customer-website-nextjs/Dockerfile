# SwipeSavvy Customer Website
# Static HTML website served via Nginx

FROM nginx:1.25-alpine

# Install curl for healthcheck and remove default nginx config
RUN apk add --no-cache curl && rm -f /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy static website files
COPY --chown=nginx:nginx . /usr/share/nginx/html

# Remove unnecessary files from the container
RUN rm -f /usr/share/nginx/html/Dockerfile \
    /usr/share/nginx/html/nginx.conf \
    /usr/share/nginx/html/docker-compose.yml \
    /usr/share/nginx/html/.DS_Store \
    /usr/share/nginx/html/Archive.zip \
    /usr/share/nginx/html/.dockerignore

# Expose port 8080 (non-privileged)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
