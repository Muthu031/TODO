# Frontend Dockerfile
# Multi-stage build: dependencies -> build -> runtime

# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build React app
RUN npm run build

# Stage 2: Runtime (serve with simple HTTP server)
FROM node:20-alpine
WORKDIR /app

# Install serve to run the built app
RUN npm install -g serve

# Copy package.json for metadata
COPY package.json ./

# Copy built app from build stage
COPY --from=build /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD wget --quiet --tries=1 --spider http://localhost:5173/ || exit 1

# Start application
CMD ["serve", "-s", "dist", "-l", "5173"]
