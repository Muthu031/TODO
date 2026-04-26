# URL Shortener - Complete Working Flow Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [System Components](#system-components)
4. [Request/Response Flow](#requestresponse-flow)
5. [Data Flow](#data-flow)
6. [Deployment Architecture](#deployment-architecture)
7. [Key Features](#key-features)
8. [Error Handling](#error-handling)

---

## Architecture Overview

The URL Shortener is a **production-grade, scalable full-stack application** built with a clean **3-layer architecture pattern**:

```
┌─────────────────────────────────────────────────────────┐
│                      Browser/Client                      │
├─────────────────────────────────────────────────────────┤
│                    Frontend (React 18)                   │
│            (TypeScript, React Query, Tailwind)           │
├─────────────────────────────────────────────────────────┤
│           HTTP/REST API (Express.js + Node.js)           │
├─────────────────────────────────────────────────────────┤
│  Controllers → Services → Repositories (3-Layer)         │
├─────────────────────────────────────────────────────────┤
│        PostgreSQL (Persistence) + Redis (Cache)          │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend
- **Runtime**: Node.js 20 (LTS)
- **Framework**: Express.js 4.18.2
- **Language**: TypeScript 5.3.3
- **ORM**: Prisma 5.7.0
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Logging**: Winston 3.11.0
- **Rate Limiting**: Custom sliding window algorithm (Redis)

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Language**: TypeScript 5.3.3
- **State Management**: React Query 3.39.3
- **Styling**: Tailwind CSS 3.3.6
- **HTTP Client**: Axios
- **Charts**: Recharts 2.10.3

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Services**: PostgreSQL, Redis, Backend, Frontend

---

## System Components

### 1. Frontend Application

**Location**: `frontend/src/`

**Key Components**:
- **Pages**:
  - `Home.tsx`: Link creation interface with form validation
  - `Dashboard.tsx`: Link management and analytics visualization
  - `Analytics.tsx`: Detailed analytics per shortened link

- **Services**:
  - `api.ts`: Centralized Axios client with error handling
  - `config/index.ts`: Environment configuration (API base URL, app settings)

- **Custom Hooks**:
  - `useCreateLink()`: Mutation hook for creating links
  - `useLinks()`: Query hook for fetching all links with pagination
  - `useLink()`: Query hook for single link details
  - `useUpdateLink()`: Mutation hook for updating links
  - `useDeleteLink()`: Mutation hook for deleting links
  - `useAnalytics()`: Query hook for analytics data

- **Styling**: Tailwind CSS responsive components + custom styles in `common/` folder

**API Endpoint**: `http://localhost:3000/api` (Docker) or `/api` (local dev via Vite proxy)

### 2. Backend Application

**Location**: `backend/src/`

**Architecture Layers**:

#### Layer 1: Controllers
**File**: `controllers/LinkController.ts`

Handles HTTP requests and responses:
- `createLink(POST)`: Creates new shortened URL
- `getLink(GET)`: Retrieves link by ID
- `getAllLinks(GET)`: Paginated list of all links
- `updateLink(PATCH)`: Updates link details
- `deleteLink(DELETE)`: Removes link
- `redirect(GET)`: Handles link redirects (301 status)
- `getAnalytics(GET)`: Returns analytics for a link
- `health(GET)`: Health check endpoint

#### Layer 2: Services
**File**: `services/LinkService.ts`

Business logic implementation:
- **URL Validation**: Blocks malicious protocols (javascript:, data:, file:) and private IPs
- **Custom Alias Support**: Sanitization and uniqueness validation
- **Auto-generation**: Base62 encoded short codes (default 6 chars)
- **Caching**: Redis integration with TTL (Time To Live)
- **Expiration**: Validates and enforces link expiration dates
- **Analytics**: Tracks clicks and generates summaries

#### Layer 3: Repositories
**File**: `repositories/LinkRepository.ts`

Data access layer using Prisma ORM:
- `create()`: Insert new link record
- `findById()`: Query by link ID
- `findByShortCode()`: Query by short code (for redirects)
- `findByCustomAlias()`: Query by custom alias
- `update()`: Modify link record
- `delete()`: Remove link record
- `findAll()`: Paginated queries with filtering

### 3. Database Schema

**Prisma Schema**: `backend/prisma/schema.prisma`

**Models**:

```prisma
model Link {
  id         String   @id @default(cuid())
  shortCode  String   @unique
  customAlias String?
  originalUrl String
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  clicks      Int      @default(0)
  clicks      Click[]  // Relationship
}

model Click {
  id        String   @id @default(cuid())
  linkId    String
  userAgent String?
  ipAddress String?
  createdAt DateTime @default(now())
  link      Link     @relation(fields: [linkId], references: [id])
}
```

### 4. Middleware Pipeline

**File**: `middleware/`

Request processing order:
1. **CORS**: Cross-Origin Resource Sharing for frontend communication
2. **Body Parser**: JSON/URL-encoded request body parsing
3. **Request Logging**: Winston logger for all requests
4. **Rate Limiter**: Sliding window algorithm (100 req/min per IP, configurable)
5. **Route Handlers**: Application logic
6. **Error Handler**: Centralized error processing

### 5. Error Handling

**File**: `middleware/errorHandler.ts`

Custom error classes:
- `AppError`: Base application error
- `ValidationError`: Request validation failures
- `NotFoundError`: Resource not found (404)
- `ConflictError`: Duplicate resource (409)
- `RateLimitError`: Rate limit exceeded (429)

**AsyncHandler Wrapper**: Auto-try-catch for route handlers

---

## Request/Response Flow

### Flow 1: Creating a Shortened Link

```
1. User Input (Frontend)
   └─> Form with: URL, optional custom alias, optional expiration date

2. Validation (Client-side)
   └─> URL format check, alias sanitization

3. HTTP Request (POST /api/links)
   └─> Axios sends JSON payload with: originalUrl, customAlias, expiresAt

4. Backend Receives Request
   ├─> Middleware processing (CORS, body parser, logging, rate limit check)
   └─> LinkController.createLink() handler

5. Service Layer (LinkService.createLink)
   ├─> URL Validation (protocol check, private IP detection)
   ├─> Custom alias sanitization (remove special chars, max 255 chars)
   ├─> Generate Base62 short code if no custom alias
   ├─> Check expiration date validity
   └─> Call repository to save

6. Repository Layer (LinkRepository.create)
   ├─> Execute: prisma.link.create()
   ├─> Store in PostgreSQL
   └─> Return Link object with ID

7. Service Caching (LinkService)
   ├─> Cache link in Redis: key = shortCode/customAlias
   ├─> Set TTL (Time To Live)
   └─> Return link data

8. HTTP Response (201 Created)
   ├─> Status: 201
   ├─> Body: { success: true, data: { id, shortCode, originalUrl, ... } }
   └─> Frontend receives response

9. Frontend State Update
   ├─> React Query invalidates cache
   ├─> Dashboard list refreshes
   └─> Success message displayed to user

10. User Sees Result
    └─> "Link created successfully" message with short URL
```

### Flow 2: Redirecting via Short Link

```
1. User clicks shortened URL in browser
   └─> GET /:identifier (e.g., /abc123)

2. Backend Receives Request
   ├─> LinkController.redirect() handler
   ├─> Extract identifier from URL path
   └─> Call service to find and track click

3. Service Layer (LinkService)
   ├─> Check Redis cache first (fast path)
   └─> If not cached, query database

4. Validation
   ├─> Check if link exists
   ├─> Verify not expired
   ├─> Increment click counter
   └─> Create Click record for analytics

5. Tracking (Click Model)
   ├─> Record: timestamp, user agent, IP address
   └─> Store in PostgreSQL

6. HTTP Response (301 Moved Permanently)
   ├─> Status: 301
   ├─> Location header: original URL
   └─> Browser automatically redirects

7. Analytics Updated
   └─> Click count incremented for dashboard display
```

### Flow 3: Fetching Analytics

```
1. User navigates to link details (Dashboard/Analytics)
   └─> Frontend calls GET /api/analytics/:linkId

2. Backend Receives Request
   ├─> LinkController.getAnalytics() handler
   └─> Call service to aggregate data

3. Service Layer (LinkService.getAnalyticsSummary)
   ├─> Query Link record (total clicks, creation date, etc.)
   ├─> Fetch Click records (click distribution)
   ├─> Calculate metrics (clicks over time, devices, browsers)
   └─> Return aggregated data

4. Data Processing (Frontend)
   ├─> React Query caches response
   ├─> Format data for Recharts
   ├─> Prepare chart data (line, bar, pie charts)
   └─> Render analytics visualizations

5. Frontend Display
   ├─> Show charts and statistics
   ├─> Display click timeline
   ├─> Show device/browser breakdown
   └─> Allow date range filtering
```

---

## Data Flow

### Creating a Link - Data Journey

```
PostgreSQL               Redis Cache              Frontend State
┌──────────┐            ┌──────────┐             ┌─────────────┐
│ Link     │◄──────────►│ shortCode│◄─────────┐  │ React Query │
│ Table    │  Prisma    │ : LinkObj│          │  │ Cache       │
│          │            │          │  Axios   │  │             │
│ (Persist)│            │(Cache)   │◄────────┘  │(Frontend UI)│
└──────────┘            └──────────┘            └─────────────┘
     ▲                        ▲                          ▲
     │                        │                          │
     └────────────────────────┴──────────────────────────┘
     Data saved → Cache updated → UI refreshed
```

### Redirect Flow - Data Journey

```
User Request
     │
     ▼
     ┌──────────────────┐
     │ Redis Cache      │
     │ (Check first)    │
     └────────┬─────────┘
              │ Hit/Miss
              ▼
     ┌──────────────────┐
     │ PostgreSQL       │
     │ (Query if miss)  │
     └────────┬─────────┘
              │
              ▼
     ┌──────────────────┐
     │ Validation       │
     │ (Not expired?)   │
     └────────┬─────────┘
              │
              ▼
     ┌──────────────────┐
     │ Create Click     │
     │ Record (Analytics)
     └────────┬─────────┘
              │
              ▼
     Browser 301 Redirect
     to Original URL
```

---

## Deployment Architecture

### Docker Compose Services

**docker-compose.yml** orchestrates 4 services:

```
┌─────────────────────────────────────────────────────┐
│          Docker Compose Network                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  PostgreSQL  │  │    Redis     │  │ Backend   │ │
│  │  (Port 5432) │  │ (Port 6379)  │  │(Port 3000)│ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│         ▲                ▲                   ▲      │
│         │ depends_on     │ depends_on        │      │
│         └────────────────┴───────────────────┘      │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │    Frontend (React + Serve)                  │   │
│  │            (Port 5173)                       │   │
│  └──────────────────────────────────────────────┘   │
│                          ▲                          │
│                          │ http requests            │
│                    Backend API 3000                 │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Service Details**:

| Service | Image | Port | Health Check | Dependencies |
|---------|-------|------|--------------|--------------|
| PostgreSQL | postgres:16-alpine | 5432 | SQL query | None |
| Redis | redis:7-alpine | 6379 | Redis ping | None |
| Backend | todo-backend:latest | 3000 | GET /health | postgres, redis |
| Frontend | todo-frontend:latest | 5173 | HTTP 200 | backend |

### Build Process

```
┌─ Backend Build
│  1. Stage 1: Dependencies - npm ci (install packages)
│  2. Stage 2: Build
│     ├─> Copy source code
│     ├─> Run: prisma generate (generate Prisma client)
│     ├─> Run: tsc (compile TypeScript to JavaScript)
│     └─> Output: dist/ folder with compiled JS
│  3. Stage 3: Runtime
│     ├─> Copy dist/, prisma/, and node_modules
│     ├─> Create non-root user (security)
│     └─> Expose port 3000
│
└─ Frontend Build
   1. Stage 1: Build
      ├─> npm ci (install dependencies)
      ├─> npm run build (Vite production build)
      └─> Output: dist/ folder with optimized bundle
   2. Stage 2: Runtime
      ├─> Install 'serve' (static server)
      ├─> Copy dist/ folder
      ├─> Run: serve -s dist -l 5173
      └─> Expose port 5173
```

---

## Key Features

### 1. URL Validation & Security

**What's Blocked**:
- Malicious protocols: `javascript:`, `data:`, `file:`
- Private IPs: `127.x.x.x`, `192.168.x.x`, `10.x.x.x`, `172.16-31.x.x`, `::1`, `fc00::`, `fe80::`
- Invalid URLs (protocol errors, malformed structure)

**What's Allowed**:
- Standard HTTP/HTTPS URLs only
- External URLs with valid domain names
- URL parameters and query strings

### 2. Custom Aliases

**Features**:
- User-defined custom short identifiers
- Sanitization removes special characters
- Maximum 255 characters
- Uniqueness constraint (no duplicates)
- Fallback to auto-generated Base62 codes

**Example**:
- Custom: `https://short.com/my-awesome-link`
- Auto-generated: `https://short.com/a3b2c1`

### 3. Expiration Dates

**Features**:
- Optional expiration timestamp
- Links become inaccessible after expiration
- Validation on redirect (404 if expired)
- Stored with timezone awareness (DateTime type)

### 4. Rate Limiting

**Algorithm**: Sliding window using Redis sorted sets

**Configuration**:
- Default: 100 requests per minute per IP
- Window: 60 seconds
- Response: 429 Too Many Requests (when exceeded)

**Implementation**:
```
1. Get current timestamp
2. Remove expired entries from sorted set
3. Count remaining entries
4. If count < limit: allow + add entry
5. If count >= limit: reject (429)
```

### 5. Analytics & Tracking

**Tracked Data**:
- Total clicks per link
- Click timestamps
- User agents (browser, device)
- IP addresses (for geographic analysis)
- Click distribution over time

**Visualization** (Frontend):
- Line chart: Clicks over time
- Bar chart: Clicks by day
- Pie chart: Device type distribution

### 6. Caching Strategy

**Redis Cache**:
- Key: `link:{shortCode}` or `link:{customAlias}`
- Value: Link object (JSON)
- TTL: 24 hours (configurable)
- Cache hits reduce database load significantly

**Cache Invalidation**:
- On link update: Clear cache
- On link delete: Clear cache
- On manual cache flush: Available via admin endpoint

### 7. Pagination

**Features**:
- Default page size: 10 links per page
- Configurable via query parameters
- Supported query: `?page=1&limit=20`
- Total count returned for pagination UI

---

## Error Handling

### Error Response Format

All errors return JSON with consistent structure:

```json
{
  "success": false,
  "error": {
    "message": "User-friendly error message",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "path": "/api/endpoint",
    "method": "POST",
    "timestamp": "2026-04-26T10:00:00Z"
  }
}
```

### Common Error Codes

| Code | Status | Cause | Solution |
|------|--------|-------|----------|
| `INVALID_URL` | 400 | URL validation failed | Use valid HTTP/HTTPS URL |
| `CUSTOM_ALIAS_EXISTS` | 409 | Alias already taken | Choose different alias |
| `LINK_NOT_FOUND` | 404 | Link ID/code not found | Verify link exists |
| `LINK_EXPIRED` | 410 | Link expired | Link no longer available |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Wait before retrying |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected error | Check server logs |

### Logging

**Winston Logger Configuration**:
- Format: `timestamp [level]: message { context }`
- Levels: error, warn, info, http, debug
- Transport: Console + rotating file
- Structured logging for error traces

---

## Development Workflow

### Local Development

```bash
# Install dependencies
npm run install:all

# Start backend dev server (ts-node with hot reload)
npm run dev --prefix backend

# Start frontend dev server (Vite with hot reload)
npm run dev --prefix frontend

# Both start with TypeScript watching + Vite HMR
```

### Docker Deployment

```bash
# Build and start all services
npm run docker:up

# View logs in real-time
npm run docker:logs

# Stop all services
npm run docker:down

# Reinitialize database
docker-compose exec backend npx prisma db push
```

---

## Summary

The URL Shortener application provides a **complete, production-ready solution** with:

✅ **Scalable Architecture**: 3-layer clean pattern (Controllers → Services → Repositories)
✅ **Type Safety**: Full TypeScript across frontend and backend
✅ **Performance**: Redis caching, rate limiting, optimized queries
✅ **Security**: URL validation, private IP blocking, rate limiting
✅ **Analytics**: Click tracking with device/browser insights
✅ **Reliability**: Error handling, health checks, graceful shutdown
✅ **Containerization**: Docker + Docker Compose for consistent deployment
✅ **Developer Experience**: Hot module replacement, structured logging, clean code organization

---

**Created**: 2026-04-26
**Version**: 1.0.0
**Status**: Production-Ready
