# API Reference

Complete documentation of the URL Shortener REST API.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://api.example.com` (replace with actual domain)

## Response Format

All successful responses follow this format:
```json
{
  "success": true,
  "data": { /* response data */ },
  "timestamp": "2024-12-25T10:00:00Z"
}
```

All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-12-25T10:00:00Z"
}
```

## Rate Limiting

All endpoints are rate-limited to **100 requests per minute per IP address**.

Rate limit information is included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 98
Retry-After: 45  (if rate limited)
```

## Endpoints

### 1. Create Shortened Link

Create a new shortened URL with optional custom alias and expiration.

**Endpoint**
```
POST /api/links
```

**Request Headers**
```
Content-Type: application/json
```

**Request Body**
```json
{
  "originalUrl": "https://example.com/very/long/url/that/needs/shortening",
  "customAlias": "my-link",
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

**Parameters**
- `originalUrl` (required): Valid http/https URL, max 2048 characters
- `customAlias` (optional): 3-255 characters, alphanumeric + hyphen/underscore
- `expiresAt` (optional): ISO 8601 date string, must be in future

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "id": "clr7xh8km0000qz088z0z0z0z",
    "shortCode": "a3b2c1",
    "originalUrl": "https://example.com/very/long/url/that/needs/shortening",
    "customAlias": "my-link",
    "expiresAt": "2025-12-31T23:59:59Z",
    "createdAt": "2024-12-25T10:00:00Z",
    "updatedAt": "2024-12-25T10:00:00Z"
  },
  "timestamp": "2024-12-25T10:00:00Z"
}
```

**Error Examples**

Validation Error (400):
```json
{
  "success": false,
  "error": "Invalid URL format. Ensure it starts with http:// or https://",
  "code": "VALIDATION_ERROR"
}
```

Custom Alias Already Taken (409):
```json
{
  "success": false,
  "error": "Custom alias \"my-link\" is already taken",
  "code": "CONFLICT"
}
```

**CURL Example**
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://github.com/user/repo",
    "customAlias": "my-repo"
  }'
```

---

### 2. Get All Links

Retrieve all shortened links with pagination.

**Endpoint**
```
GET /api/links?page=1&limit=10
```

**Query Parameters**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 10, max 100

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": "clr7xh8km0000qz088z0z0z0z",
      "shortCode": "a3b2c1",
      "originalUrl": "https://github.com/user/repo",
      "customAlias": "my-repo",
      "expiresAt": null,
      "createdAt": "2024-12-25T10:00:00Z",
      "updatedAt": "2024-12-25T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10
  },
  "timestamp": "2024-12-25T10:00:00Z"
}
```

**CURL Example**
```bash
curl "http://localhost:3000/api/links?page=1&limit=5"
```

---

### 3. Get Link by ID

Retrieve a specific link by its ID.

**Endpoint**
```
GET /api/links/:id
```

**Path Parameters**
- `id` (required): Link ID

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "clr7xh8km0000qz088z0z0z0z",
    "shortCode": "a3b2c1",
    "originalUrl": "https://github.com/user/repo",
    "customAlias": "my-repo",
    "expiresAt": null,
    "createdAt": "2024-12-25T10:00:00Z",
    "updatedAt": "2024-12-25T10:00:00Z"
  },
  "timestamp": "2024-12-25T10:00:00Z"
}
```

**Error: 404 Not Found**
```json
{
  "success": false,
  "error": "Link not found",
  "code": "NOT_FOUND"
}
```

**CURL Example**
```bash
curl http://localhost:3000/api/links/clr7xh8km0000qz088z0z0z0z
```

---

### 4. Update Link

Update link properties (custom alias or expiration).

**Endpoint**
```
PATCH /api/links/:id
```

**Request Body** (at least one field required)
```json
{
  "customAlias": "new-alias",
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "clr7xh8km0000qz088z0z0z0z",
    "shortCode": "a3b2c1",
    "originalUrl": "https://github.com/user/repo",
    "customAlias": "new-alias",
    "expiresAt": "2025-12-31T23:59:59Z",
    "createdAt": "2024-12-25T10:00:00Z",
    "updatedAt": "2024-12-25T10:30:00Z"
  }
}
```

**CURL Example**
```bash
curl -X PATCH http://localhost:3000/api/links/clr7xh8km0000qz088z0z0z0z \
  -H "Content-Type: application/json" \
  -d '{"customAlias": "updated-alias"}'
```

---

### 5. Delete Link

Delete a link and all associated analytics.

**Endpoint**
```
DELETE /api/links/:id
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "message": "Link deleted successfully"
  },
  "timestamp": "2024-12-25T10:00:00Z"
}
```

**CURL Example**
```bash
curl -X DELETE http://localhost:3000/api/links/clr7xh8km0000qz088z0z0z0z
```

---

### 6. Redirect to Original URL

Redirects to the original long URL associated with the short code.

**Endpoint**
```
GET /:shortCode
GET /:customAlias
```

**Path Parameters**
- `shortCode` or `customAlias`: Short identifier

**Response: 301 Moved Permanently**
```
Location: https://original-url.com
```

**Note**: This endpoint also records analytics:
- Request IP address
- User agent
- Timestamp
- Geographic location (if available)

**CURL Example**
```bash
curl -L http://localhost:3000/a3b2c1
# or with custom alias
curl -L http://localhost:3000/my-repo
```

---

### 7. Get Link Analytics

Retrieve detailed analytics for a specific link.

**Endpoint**
```
GET /api/analytics/:linkId
```

**Path Parameters**
- `linkId` (required): Link ID

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "linkId": "clr7xh8km0000qz088z0z0z0z",
    "shortCode": "a3b2c1",
    "originalUrl": "https://github.com/user/repo",
    "totalClicks": 42,
    "uniqueVisitors": 35,
    "createdAt": "2024-12-25T10:00:00Z",
    "lastClickedAt": "2024-12-25T15:30:00Z",
    "topCountries": {
      "US": 15,
      "GB": 8,
      "DE": 5,
      "FR": 4,
      "CA": 3
    },
    "clicksOverTime": [
      { "date": "2024-12-20", "count": 2 },
      { "date": "2024-12-21", "count": 5 },
      { "date": "2024-12-22", "count": 8 },
      { "date": "2024-12-23", "count": 12 },
      { "date": "2024-12-24", "count": 15 }
    ]
  },
  "timestamp": "2024-12-25T10:00:00Z"
}
```

**Analytics Fields**
- `totalClicks`: Total number of times link was accessed
- `uniqueVisitors`: Count of distinct IP addresses
- `topCountries`: Map of country codes to click counts
- `clicksOverTime`: Array of daily click aggregations (last 30 days)
- `lastClickedAt`: Timestamp of most recent click

**CURL Example**
```bash
curl http://localhost:3000/api/analytics/clr7xh8km0000qz088z0z0z0z
```

---

### 8. Health Check

Check if API service and dependencies are healthy.

**Endpoint**
```
GET /health
```

**Response: 200 OK**
```json
{
  "success": true,
  "service": "url-shortener-api",
  "status": "healthy",
  "timestamp": "2024-12-25T10:00:00Z"
}
```

**CURL Example**
```bash
curl http://localhost:3000/health
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists (e.g., alias taken) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

---

## Common Patterns

### Using JavaScript/TypeScript

```typescript
// Create link
const response = await fetch('http://localhost:3000/api/links', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    originalUrl: 'https://example.com',
    customAlias: 'my-link'
  })
});

const { data: link } = await response.json();
console.log(`Short URL: http://localhost:3000/${link.shortCode}`);
```

### Using Python

```python
import requests

response = requests.post('http://localhost:3000/api/links', json={
    'originalUrl': 'https://example.com',
    'customAlias': 'my-link'
})

data = response.json()
print(f"Short URL: http://localhost:3000/{data['data']['shortCode']}")
```

---

## Webhook Notifications (Future Feature)

Planned feature to send webhooks on:
- Link creation
- Click recorded
- Link expiration
- Analytics updates

---

## Rate Limiting Details

Uses sliding window algorithm:
- Window: 60 seconds
- Limit: 100 requests per IP
- Tracking: Redis sorted sets by timestamp

Example: First request at 10:00:00, can make 100 more until 10:01:00

---

## Best Practices

1. **Cache redirects**: Shortened links don't change, cache them aggressively
2. **Batch analytics**: Don't query analytics for every redirect, aggregate periodically
3. **Retry on failure**: Implement exponential backoff for API calls
4. **Monitor limits**: Watch X-RateLimit headers to stay under limits
5. **Validate locally**: Validate URLs client-side before API calls to fail fast

---

For more information, see the [main README](../README.md).
