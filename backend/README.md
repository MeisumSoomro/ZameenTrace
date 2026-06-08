# Backend API

Express API scaffold with core parcel endpoints for ZameenTrace.

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database connection (required)
DATABASE_URL=postgres://postgres:postgres@localhost:5432/zameentrace

# JWT secret for authentication (required, should be strong in production)
JWT_SECRET=your-super-secret-key-change-this-in-production

# JWT token expiration time
JWT_EXPIRES_IN=12h

# Server port
PORT=4000

# CORS origin for frontend
CORS_ORIGIN=http://localhost:3000

# Request body size limit
REQUEST_BODY_LIMIT=1mb

# Enable demo auth endpoint for local development
DEMO_AUTH_ENABLED=true
```

## Available endpoints

### `POST /api/parcels`

Create a parcel from GPS boundary coordinates.

**Authentication:** Required (Bearer token)

Expected body shape:

```json
{
  "parcelId": "ZT-PK-SND-0001",
  "ownerName": "Ali Khan",
  "province": "Sindh",
  "district": "Tando Allahyar",
  "tehsil": "Chamber",
  "village": "Mir Wah",
  "coordinates": [
    [68.7151, 25.4621],
    [68.7162, 25.4621],
    [68.7162, 25.4632],
    [68.7151, 25.4621]
  ]
}
```

**Response** (201 Created):
```json
{
  "id": "uuid-here",
  "parcelId": "ZT-PK-SND-0001",
  "ownerName": "Ali Khan",
  "currentBoundary": {
    "type": "Polygon",
    "coordinates": [[...]],
    "areaSquareMeters": 5000,
    "centroid": [68.7157, 25.4626]
  },
  "versionNumber": 1,
  "createdAt": "2024-05-30T07:00:00Z",
  "status": "active"
}
```

---

### `GET /api/parcels/:parcelId`

Fetch a parcel by external parcel ID, including:

- current parcel state
- version history
- approvals
- disputes

**Authentication:** Required (Bearer token)

**Response** (200 OK):
```json
{
  "id": "uuid-here",
  "parcelId": "ZT-PK-SND-0001",
  "ownerName": "Ali Khan",
  "currentBoundary": {...},
  "versionNumber": 2,
  "versions": [
    {
      "versionNumber": 1,
      "boundary": {...},
      "createdAt": "2024-05-30T06:00:00Z"
    },
    {
      "versionNumber": 2,
      "boundary": {...},
      "createdAt": "2024-05-30T07:00:00Z"
    }
  ],
  "approvals": [
    {
      "neighborId": "ZT-PK-SND-0002",
      "approvedAt": "2024-05-30T07:15:00Z",
      "status": "approved"
    }
  ],
  "disputes": []
}
```

---

### `PUT /api/parcels/:parcelId/boundary`

Create a new parcel version and update the active boundary.

**Authentication:** Required (Bearer token)

Expected body:
```json
{
  "coordinates": [
    [68.7150, 25.4620],
    [68.7163, 25.4620],
    [68.7163, 25.4633],
    [68.7150, 25.4620]
  ]
}
```

**Response** (200 OK): Updated parcel object with new version

---

### `POST /api/parcels/:parcelId/verify`

Create or update a neighbor approval for the current parcel version.

**Authentication:** Required (Bearer token)

Expected body:
```json
{
  "neighborParcelId": "ZT-PK-SND-0002",
  "status": "approved"
}
```

Possible status values: `approved`, `disputed`, `pending`

**Response** (201 Created / 200 OK): Approval record

---

### `GET /api/parcels?province=...&district=...`

Retrieve parcels for a region using one or more region filters:

**Query Parameters:**
- `province` - Filter by province name
- `district` - Filter by district name
- `tehsil` - Filter by tehsil name
- `village` - Filter by village name
- `limit` - Number of results (default: 20, max: 100)
- `offset` - Pagination offset (default: 0)

**Authentication:** Required (Bearer token)

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid-here",
      "parcelId": "ZT-PK-SND-0001",
      "ownerName": "Ali Khan",
      "province": "Sindh",
      "district": "Tando Allahyar",
      "currentBoundary": {...}
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

---

## Authentication

All endpoints (except `/api/auth/*`) require Bearer token authentication:

```
Authorization: Bearer <your-jwt-token>
```

### `POST /api/auth/login` (Demo only - requires DEMO_AUTH_ENABLED=true)

Get a demo JWT token for local testing.

```json
{
  "username": "demo",
  "password": "demo"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "12h"
}
```

---

## Geospatial behavior

- polygons are validated in PostGIS
- area is computed in square meters by the database
- centroid is computed by the database
- boundary updates create new version rows in `land_parcel_versions`

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ with PostGIS extension
- npm or yarn

### Installation

```bash
npm install
```

### Local Development

1. Set up `.env` file (see Environment Variables above)
2. Run the database migrations
3. Start the server:

```bash
npm run dev
```

The API will be available at `http://localhost:4000/api`

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting & Formatting

```bash
# Lint code and auto-fix
npm run lint

# Format code with Prettier
npm run format
```

## Notes

- This step assumes the database migration in `database/migrations/0001_core_schema.sql` has been applied.
- Dependencies were scaffolded in `backend/package.json`, but install/run verification still needs to happen in a later pass.
- Pre-commit hooks are enabled via husky - code is automatically linted before commits.
