# Multi-stage build for SwipeSavvy Mobile App
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build for EAS (if needed)
RUN npm run build:ios || true
RUN npm run build:android || true

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install runtime dependencies only
COPY package*.json ./
RUN npm ci --production

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/build ./build
COPY . .

# Expose Expo dev server ports
EXPOSE 8081
EXPOSE 19000
EXPOSE 19001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8081', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start Expo dev server
CMD ["npm", "start"]
