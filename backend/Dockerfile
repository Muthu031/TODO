# Backend Dockerfile
# Multi-stage build: dependencies -> build -> runtime

# Stage 1: Dependencies
FROM node:20 AS dependencies
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm ci --only=production
RUN npm ci

# Stage 2: Build
FROM node:20 AS build
WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Generate Prisma client
RUN npm run prisma:generate

# Build TypeScript
RUN npm run build

# Stage 3: Runtime
FROM node:20
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json ./

# Copy node_modules from build stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy built application and Prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=dependencies /app/node_modules/@prisma ./node_modules/@prisma

# Create non-root user for security
RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs nodejs
USER nodejs

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
