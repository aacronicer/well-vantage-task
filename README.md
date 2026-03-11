# well-vantage-tak

A NestJS REST API for managing personal workout plans, with Google OAuth2 authentication and JWT session handling. Built with Bun and backed by SQLite via Prisma.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime / Package Manager | [Bun](https://bun.sh) 1.x |
| Framework | NestJS 11 |
| Database | SQLite (via Prisma 7 + better-sqlite3) |
| Auth | Google OAuth2 (Passport) + JWT |
| Language | TypeScript |

---

## Prerequisites

- [Bun](https://bun.sh) >= 1.3
- A Google Cloud project with OAuth 2.0 credentials ([guide](https://developers.google.com/identity/protocols/oauth2))

---

## Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd well-vantage-tak
bun install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="file:./dev.db"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
JWT_SECRET="your-jwt-secret-change-me"
```

**Google OAuth setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add `http://localhost:3000/auth/google/callback` as an Authorized Redirect URI
4. Copy the Client ID and Secret into `.env`

### 3. Run database migrations and generate the Prisma client

```bash
bun run prisma:migrate    # applies migrations and creates dev.db
bun run prisma:generate   # generates the TypeScript client
```

### 4. Start the development server

```bash
bun run start:dev
```

The API will be available at `http://localhost:3000`.

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start:dev` | `nest start --watch` | Start with hot reload |
| `start` | `nest start` | Start without watch |
| `build` | `nest build` | Compile to `dist/` |
| `start:prod` | `node .` | Run compiled production build |
| `prisma:migrate` | `prisma migrate dev` | Run migrations |
| `prisma:generate` | `prisma generate` | Regenerate Prisma client |

---

## API Reference

Base URL: `http://localhost:3000`

### Authentication

#### `GET /auth/google`

Initiates the Google OAuth2 login flow. Redirect the user's browser to this URL.

- **Auth required:** No
- **Response:** `302` redirect to Google's consent screen

#### `GET /auth/google/callback`

Google redirects here after the user approves access. The server finds or creates the user in the database and returns a JWT.

- **Auth required:** No (handled by Google)
- **Response:**

```json
{
  "access_token": "<jwt-token>"
}
```

Store this token and include it in the `Authorization` header for all subsequent requests.

---

### Workouts

All workout endpoints require a valid JWT in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Results are always scoped to the authenticated user.

#### `POST /workouts`

Create a new workout plan.

- **Auth required:** Yes (JWT)
- **Request body:**

```json
{
  "title": "Morning Run",
  "description": "5km easy jog at an easy pace",
  "scheduledAt": "2026-03-15T07:00:00.000Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Name of the workout |
| `description` | `string` | Details about the workout |
| `scheduledAt` | `string` (ISO 8601) | When the workout is scheduled |

- **Response `201`:**

```json
{
  "id": "cmmm6bz7c0000l0a6d5areh1u",
  "title": "Morning Run",
  "description": "5km easy jog at an easy pace",
  "scheduledAt": "2026-03-15T07:00:00.000Z",
  "createdAt": "2026-03-11T15:08:33.912Z",
  "userId": "clxyz..."
}
```

#### `GET /workouts`

Fetch all workout plans for the authenticated user, ordered by `scheduledAt` ascending.

- **Auth required:** Yes (JWT)
- **Response `200`:**

```json
[
  {
    "id": "cmmm6bz7c0000l0a6d5areh1u",
    "title": "Morning Run",
    "description": "5km easy jog at an easy pace",
    "scheduledAt": "2026-03-15T07:00:00.000Z",
    "createdAt": "2026-03-11T15:08:33.912Z",
    "userId": "clxyz..."
  },
  {
    "id": "cmmm6ciop0001l0a63ovb3vh5",
    "title": "Evening Weights",
    "description": "Upper body push/pull",
    "scheduledAt": "2026-03-15T18:30:00.000Z",
    "createdAt": "2026-03-11T15:08:59.161Z",
    "userId": "clxyz..."
  }
]
```

---

## Authentication Flow

```
Browser                    API                      Google
   |                        |                          |
   |-- GET /auth/google --> |                          |
   |                        |-- 302 redirect --------> |
   |                        |                          |
   |<-------- Google consent screen ------------------|
   |                        |                          |
   |-- approves ----------> |                          |
   |                        |<-- GET /auth/google/callback (with code)
   |                        |-- findOrCreate user      |
   |                        |-- sign JWT               |
   |<-- { access_token } ---|                          |
   |                        |                          |
   |-- GET /workouts        |                          |
   |   Authorization: Bearer <token>                   |
   |<-- 200 [...plans] -----|                          |
```

---

## Data Models

### User

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (cuid) | Primary key |
| `googleId` | `string` | Google account ID (unique) |
| `email` | `string` | User email (unique) |
| `displayName` | `string` | Name from Google profile |
| `createdAt` | `DateTime` | Account creation timestamp |

### WorkoutPlan

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (cuid) | Primary key |
| `title` | `string` | Workout title |
| `description` | `string` | Workout details |
| `scheduledAt` | `DateTime` | Scheduled date/time |
| `createdAt` | `DateTime` | Record creation timestamp |
| `userId` | `string` | Foreign key → User |

---

## Project Structure

```
src/
├── main.ts                    # Entry point
├── app.module.ts              # Root module
├── prisma/
│   ├── prisma.module.ts       # Global Prisma module
│   └── prisma.service.ts      # Database service
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts        # findOrCreateUser, signToken
│   ├── auth.controller.ts     # /auth/google routes
│   ├── google.strategy.ts     # Passport Google strategy
│   ├── jwt.strategy.ts        # Passport JWT strategy
│   └── jwt-auth.guard.ts      # JWT guard decorator
└── workouts/
    ├── workouts.module.ts
    ├── workouts.service.ts    # Business logic
    ├── workouts.controller.ts # /workouts routes
    └── create-workout.dto.ts  # Request body shape

prisma/
├── schema.prisma              # Database schema
└── migrations/                # Migration history

prisma.config.ts               # Prisma 7 datasource config
.env.example                   # Environment variable template
```

---

## Example Usage with curl

```bash
# 1. Open in browser to log in with Google and get your token:
#    http://localhost:3000/auth/google

TOKEN="<paste access_token here>"

# 2. Create a workout plan
curl -X POST http://localhost:3000/workouts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Morning Run","description":"5km easy jog","scheduledAt":"2026-03-15T07:00:00.000Z"}'

# 3. List all your workout plans
curl http://localhost:3000/workouts \
  -H "Authorization: Bearer $TOKEN"
```
