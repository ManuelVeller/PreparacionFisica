# Multi-stage Dockerfile for EduFísica Fullstack Platform

# 1. Build Client (React + Vite)
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# 2. Build Server (Express + TypeScript + Sharp)
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npm run build

# 3. Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install dependencies required for sharp on alpine (if needed, sharp has prebuilt binaries)
RUN apk add --no-cache vips-dev build-base

WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev

# Copy compiled files
COPY --from=server-builder /app/server/dist ./dist
COPY --from=client-builder /app/client/dist /app/client/dist

# Expose port
EXPOSE 4000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Start server
CMD ["node", "dist/index.js"]
