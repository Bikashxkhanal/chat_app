# Chat App — Documentation

Production-grade real-time messaging platform with a standalone web application and embeddable JavaScript SDK for tenant (SSO) integrations.

## Documentation Index

| Document | Description |
|----------|-------------|
| [Getting Started](./getting-started.md) | Prerequisites, installation, local development |
| [Architecture](./architecture/README.md) | System design, monorepo layout, data flows |
| [REST API](./api/README.md) | HTTP endpoints, auth, response format |
| [OpenAPI / Swagger](./api/openapi.yaml) | Machine-readable API specification (OpenAPI 3.0) |
| [Swagger UI](./api/swagger.html) | Interactive API explorer (open in browser) |
| [WebSocket Events](./api/websocket.md) | Real-time event reference |
| [SDK Overview](./sdk/README.md) | Package structure and integration model |
| [SDK — Web](./sdk/web.md) | React / browser integration guide |
| [SDK — React Native](./sdk/react-native.md) | Mobile integration guide |
| [Testing](./testing/README.md) | Test strategy, commands, and recommendations |

## Quick Links

```
apps/
├── api/          Express 5 + Socket.IO backend
├── web/          Standalone React chat UI
└── docs/         This documentation

packages/
├── db-nosql/     Mongoose models & MongoDB connection
├── types/        Shared TypeScript types & enums
├── utils/        ApiResponse, ApiError helpers
├── sdk-core/     ChatSDK (HTTP + WebSocket client)
└── sdk-web/      Browser factory: createChatSDK()
```

## API Base URL

| Environment | REST | WebSocket |
|-------------|------|-----------|
| Local | `http://localhost:8000/api/v1` | `http://localhost:8000` |
| Production | `https://<your-domain>/api/v1` | `https://<your-domain>` |

## Authentication Modes

| Mode | Use case | Login endpoint |
|------|----------|----------------|
| **Standalone** | First-party web app (`apps/web`) | `POST /auth/login` (phone + password) |
| **Tenant / SDK** | Partner apps embedding chat | `POST /auth/sso/login` (API key + partner JWT) |

## View Swagger UI

From the repository root:

```bash
# Option 1: Open the static HTML file directly
open apps/docs/api/swagger.html

# Option 2: Serve docs locally
pnpm docs:api
# Then visit http://localhost:8080/swagger.html
```

## Version

| Component | Version |
|-----------|---------|
| API | 1.0.0 |
| OpenAPI spec | 1.0.0 |
| SDK (`@repo/sdk-core`) | workspace |
