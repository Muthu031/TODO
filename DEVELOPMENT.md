# Development Guide

This guide covers development setup, workflows, and best practices for the URL Shortener project.

## 👨‍💻 Development Environment Setup

### Prerequisites
- Node.js 18+ or Docker/Docker Compose
- Git
- Code editor (VS Code recommended)

### Option 1: Using Docker Compose (Recommended)

```bash
# Clone and enter project
git clone <repo-url>
cd url-shortener

# Start all services
docker-compose up

# In another terminal, setup database
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:seed

# Services ready
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# PostgreSQL: localhost:5432 (user:password)
# Redis: localhost:6379 (no password)
```

### Option 2: Local Development (Without Docker)

**Prerequisites:**
- PostgreSQL running locally (port 5432)
- Redis running locally (port 6379)

```bash
# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with local postgres/redis credentials
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev
```

## 📝 Code Style & Conventions

### TypeScript

- Use strict mode (enabled in tsconfig.json)
- Prefer `interface` for object shapes
- Use type guards for runtime checks
- Add JSDoc comments for public APIs

```typescript
/**
 * Generates a unique short code
 * @param length - Code length
 * @returns Generated short code
 */
export const generateShortCode = (length: number): string => {
  // Implementation
};
```

### File Structure

Follow this naming convention:
```
src/
├── controllers/    # HTTP handlers (PascalCase + Controller suffix)
├── services/       # Business logic (PascalCase + Service suffix)
├── repositories/   # Data access (PascalCase + Repository suffix)
├── middleware/     # Express middleware (camelCase)
├── utils/          # Utilities (descriptive camelCase)
├── types/          # Interfaces (descriptive PascalCase)
└── config/         # Configuration (camelCase)
```

### Formatting

Code formatting is configured in `.prettierrc`:
```bash
# Format all files
npm run format  # (add this script to package.json if needed)

# Or use Prettier extension in VS Code
```

### Comments

Add comments for:
- Complex business logic
- Non-obvious workarounds
- Important performance considerations
- Security implications

Avoid comments for obvious code:
```typescript
// ❌ Bad
let count = 0;  // Set count to 0

// ✅ Good
// Use sliding window algorithm for O(1) rate limit check
const windowStart = now - windowMs;
```

## 🔄 Development Workflows

### Adding a New API Endpoint

1. **Update Prisma Schema** (if needed)
   ```prisma
   model NewEntity {
     id String @id @default(cuid())
     // Add fields
   }
   ```

2. **Run Migration**
   ```bash
   cd backend
   npm run prisma:migrate -- --name add_new_entity
   ```

3. **Create Repository** (`src/repositories/NewRepository.ts`)
   ```typescript
   export class NewRepository {
     // Database operations
   }
   ```

4. **Create Service** (`src/services/NewService.ts`)
   ```typescript
   export class NewService {
     // Business logic
   }
   ```

5. **Add Controller Method** (`src/controllers/LinkController.ts`)
   ```typescript
   newEndpoint = asyncHandler(async (req, res) => {
     // Handle request
   });
   ```

6. **Register Route** (`src/app.ts`)
   ```typescript
   app.post('/api/new', controller.newEndpoint);
   ```

### Adding Frontend Feature

1. **Create Component** (`src/components/NewComponent.tsx`)
   ```typescript
   export const NewComponent: React.FC = () => {
     // Component code
   };
   ```

2. **Create Hook** (if needed) (`src/hooks/useNew.ts`)
   ```typescript
   export const useNewData = () => {
     return useQuery('key', () => ApiService.newMethod());
   };
   ```

3. **Update API Service** (`src/services/api.ts`)
   ```typescript
   static async newMethod(): Promise<Type> {
     // API call
   }
   ```

4. **Integrate into Page** (`src/pages/Page.tsx`)
   ```typescript
   const data = useNewData();
   return <NewComponent data={data} />;
   ```

### Debugging

#### Backend
```bash
# 1. Add logger calls
logger.info('Debug message', { context: data });

// 2. Use VS Code debugger with launch config
{
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/backend/dist/index.js",
  "preLaunchTask": "npm: build",
  "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"]
}

# 3. Check logs
docker-compose logs backend
docker-compose logs postgres
```

#### Frontend
```bash
# 1. Use React DevTools
# - Install browser extension
# - Inspect components and state

# 2. Use Network tab
# - Check API requests
# - Verify payloads and responses

# 3. Use Console
# - Keyboard shortcut: F12
# - Check for errors and warnings
```

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Unit tests (add when present)
npm test

# Integration tests
npm run test:integration

# Check a single file
npm test -- LinkService.test.ts
```

**Testing Pattern:**
```typescript
describe('LinkService', () => {
  it('should create a short link', async () => {
    const link = await service.createLink({
      originalUrl: 'https://example.com'
    });
    expect(link.shortCode).toBeDefined();
  });
});
```

### Frontend Testing

```bash
cd frontend

# Unit tests
npm test

# Component tests
npm test -- Button.test.tsx

# Coverage
npm test -- --coverage
```

## 🐛 Common Issues & Solutions

### "Connection refused" PostgreSQL

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Or locally
psql -U user -h localhost -d url_shortener

# Connection string should be
DATABASE_URL="postgresql://user:password@postgres:5432/url_shortener"
```

### "Connection refused" Redis

```bash
# Check if Redis is running
docker ps | grep redis

# Test connection
redis-cli -h localhost -p 6379 ping

# Should return: PONG
```

### Prisma Client not found

```bash
cd backend
npm run prisma:generate
```

### Port already in use

```bash
# Find process using port
lsof -i :3000  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # PostgreSQL

# Kill process
kill -9 <PID>
```

### Clear Docker volumes

```bash
# Remove all containers and volumes (WARNING: clears data)
docker-compose down -v

# Restart fresh
docker-compose up
```

## 📊 Database Management

### Run Migrations
```bash
cd backend
npm run prisma:migrate

# Optional: with custom name
npm run prisma:migrate -- --name descriptive_name
```

### View Database Schema
```bash
# Open Prisma Studio
cd backend
npm run prisma:studio

# Then visit http://localhost:5555
```

### Seed Sample Data
```bash
cd backend
npm run prisma:seed
```

### Reset Database (⚠️ Destructive)
```bash
cd backend
npm run prisma:migrate reset

# Confirm when prompted
```

## 🔍 Monitoring & Logging

### Backend Logs

```typescript
// Different log levels
logger.error('Critical error', { context });  // Error
logger.warn('Warning', { context });          // Warning
logger.info('Info message', { context });     // Info
logger.debug('Debug info', { context });      // Debug

// View logs
docker-compose logs -f backend
```

### Database Queries

Enable query logging in `.env`:
```
DATABASE_LOG="query,warn"
```

### Redis Commands

```bash
# Monitor Redis commands
docker-compose exec redis redis-cli

# Check keys
redis> KEYS *

# Check rate limit
redis> ZRANGE ratelimit:127.0.0.1 0 -1
```

## 🚀 Performance Optimization

### Backend Optimization

1. **Add Database Indexes**
   ```prisma
   model Link {
     shortCode String @unique @@index
   }
   ```

2. **Cache Frequently Accessed Data**
   ```typescript
   // Already implemented for link lookups
   await this.redis.setex(`link:${code}`, 3600, url);
   ```

3. **Batch Operations**
   ```typescript
   // Use Prisma batch instead of loops
   await prisma.click.createMany({ data: clicks });
   ```

### Frontend Optimization

1. **Code Splitting**
   ```typescript
   // Vite handles this automatically
   // Check build output for chunk sizes
   ```

2. **Lazy Loading**
   ```typescript
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   ```

3. **Memoization**
   ```typescript
   const Component = memo(({ data }) => {
     return <div>{data}</div>;
   });
   ```

## 🔐 Security Best Practices

1. **Never commit `.env` files**
   ```bash
   # Already in .gitignore
   echo ".env" >> .gitignore
   ```

2. **Validate all inputs**
   ```typescript
   if (!validateUrl(url)) {
     throw new ValidationError('Invalid URL');
   }
   ```

3. **Use parameterized queries**
   ```typescript
   // Prisma does this automatically
   // Never use string concatenation for queries
   ```

4. **Sanitize output**
   ```typescript
   // XSS prevention
   // React does this by default with JSX
   ```

5. **Rate limit sensitive endpoints**
   ```typescript
   // Already configured via middleware
   app.use(rateLimitMiddleware());
   ```

## 📚 Useful Commands

```bash
# Backend
npm run dev              # Start dev server
npm run build            # Build TypeScript
npm start                # Run built code
npm run prisma:studio    # Open database GUI
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed data

# Frontend
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview build locally
npm run lint             # Check code quality

# Docker
docker-compose up        # Start all services
docker-compose down      # Stop all services
docker-compose logs -f   # View logs
docker-compose exec backend sh  # Shell into container
```

## 🎯 Git Workflow

```bash
# Create feature branch
git checkout -b feature/description

# Make changes and commit
git add .
git commit -m "feat: add description"

# Push to remote
git push origin feature/description

# Create pull request on GitHub/GitLab

# After review, merge to main
git checkout main
git merge feature/description
```

### Commit Message Format

Follow conventional commits:
```
feat: add new feature
fix: fix a bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add/update tests
chore: update dependencies
```

## 📞 Getting Help

1. **Check logs**: `docker-compose logs <service>`
2. **Read code comments**: Hover over functions (VS Code)
3. **Check API docs**: [API.md](./API.md)
4. **Review README**: [README.md](./README.md)
5. **Debug with DevTools**: Browser F12 or Node debugger

## ✅ Pre-deployment Checklist

- [ ] All tests pass
- [ ] No console warnings/errors
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Dependencies updated
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Performance tested
- [ ] Security review completed

---

Happy coding! 🚀
