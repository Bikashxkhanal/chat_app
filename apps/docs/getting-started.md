# Getting Started

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| pnpm | 9.x |
| MongoDB | 6.x+ (local or Atlas) |

## Installation

```bash
git clone <repository-url>
cd chat_app
pnpm install
```

## Environment Setup

Copy the example environment file and fill in secrets:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | Yes | JWT signing secret for access tokens |
| `REFRESH_TOKEN_SECRET` | Yes | JWT signing secret for refresh tokens |
| `ACCESS_TOKEN_EXPIRY` | Yes | e.g. `1d` |
| `REFRESH_TOKEN_EXPIRY` | Yes | e.g. `7d` |
| `API_PORT` | No | Default `8000` |
| `CORS_ORIGIN` | Yes | Web app origin, e.g. `http://localhost:5173` |
| `VITE_API_URL` | Yes (web) | `http://localhost:8000/api/v1` |
| `NODE_ENV` | No | `development` or `production` |

## Run Locally

Open two terminals:

```bash
# Terminal 1 — API + WebSocket
cd apps/api && pnpm dev

# Terminal 2 — Web UI
cd apps/web && pnpm dev
```

| Service | URL |
|---------|-----|
| Web app | http://localhost:5173 |
| API | http://localhost:8000/api/v1 |
| Swagger UI | `apps/docs/api/swagger.html` |

## First-Time User Flow (Standalone)

1. Open http://localhost:5173
2. Sign up with phone number → create password
3. Log in
4. Search users by phone → start a direct chat
5. Or create a group via **Group** button

## Tenant / SDK Setup

1. Create a `Tenant` document in MongoDB with:
   - `name`, `api_key`, `access_token_secret`, `origin`
2. Partner app signs a JWT with `access_token_secret` containing `phone_number`, `name`, optional `email`
3. Call `POST /auth/sso/login` with API key, Origin header, and partner JWT
4. Use returned `accessToken` with `ChatSDK.connect()`

See [SDK — Web](./sdk/web.md) and [Architecture](./architecture/README.md) for details.

## Monorepo Commands

```bash
pnpm dev           # Start all apps (Turbo)
pnpm build         # Build all packages
pnpm lint          # Lint all packages
pnpm check-types   # TypeScript check across workspace
```

## Project Structure

```
chat_app/
├── apps/
│   ├── api/           # Backend server
│   ├── web/           # Standalone React app
│   └── docs/          # Documentation (you are here)
├── packages/
│   ├── db-nosql/      # Database layer
│   ├── types/         # Shared types
│   ├── utils/         # Shared utilities
│   ├── sdk-core/      # ChatSDK client
│   └── sdk-web/       # Web SDK wrapper
├── .env               # Environment (not committed)
├── .env.example       # Template
├── pnpm-workspace.yaml
└── turbo.json
```
