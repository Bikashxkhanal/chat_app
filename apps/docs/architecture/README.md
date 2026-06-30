# Architecture

## Overview

The Chat App is a **Turborepo monorepo** delivering:

1. **Standalone web application** — phone/password auth, profile settings, 1:1 and group chat
2. **Embeddable SDK** — tenant partners integrate chat via API key + SSO JWT
3. **Real-time messaging** — Socket.IO for live delivery, typing, presence, read receipts

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
├──────────────────────────────┬──────────────────────────────────────────┤
│  apps/web (Standalone)       │  Partner App (Tenant)                    │
│  React 19 + Vite             │  React / React Native + @repo/sdk-core   │
│  @repo/sdk-web               │                                          │
└──────────────┬───────────────┴──────────────────┬───────────────────────┘
               │                                   │
               │  HTTPS REST (/api/v1/*)           │
               │  WebSocket (Socket.IO)            │
               ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         apps/api (Express 5)                             │
├─────────────────────────────────────────────────────────────────────────┤
│  Middleware: CORS, cookie-parser, verifyJWT, verifyAPIKEY, ssoVerifyJWT│
│  Modules: auth, users, conversations, messages, groups                  │
│  WebSocket: join/leave, sendMessage, typing, presence, markSeen        │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    packages/db-nosql (Mongoose)                        │
│  User │ Conversation │ Message │ Group │ Tenant                          │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │   MongoDB   │
                        │  chat_app   │
                        └─────────────┘
```

## Package Dependency Graph

```
apps/web ──► @repo/sdk-web ──► @repo/sdk-core ──► @repo/types
apps/api ──► @repo/db-nosql ──► @repo/types
           ──► @repo/utils
packages/sdk-core ──► @repo/types
packages/db-nosql ──► mongoose
```

## Shared Packages

### `@repo/types`

Single source of truth for:

- API request/response interfaces
- `MESSAGE_STATUS`, `chatEventEnums`, `USER_ROLE`
- `ConversationListItem`, `MessageReceivedPayload`, `SendMessagePayload`

### `@repo/utils`

- `ApiResponse` — standardized success envelope
- `ApiError` — throwable error with `statusCode`

### `@repo/db-nosql`

Mongoose models and `connectDB()`. Database name: `chat_app`.

### `@repo/sdk-core`

`ChatSDK` class — axios HTTP client + Socket.IO client with event relay.

### `@repo/sdk-web`

Thin factory: `createChatSDK(config)` → `new ChatSDK(config)`.

## Request / Response Envelope

All REST responses follow a consistent shape:

**Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "data": { },
  "message": "Human-readable message"
}
```

**Error:**

```json
{
  "success": false,
  "statusCode": 401,
  "errors": [],
  "message": "Unauthorized request"
}
```

## Authentication Architecture

### Standalone Users

| Property | Value |
|----------|-------|
| `tenant_id` | `null` |
| `type` | `normal` |
| Login | Phone + password |
| Profile API | `GET/PATCH /users/me` |
| Token storage | localStorage + httpOnly cookies |

### Tenant / SDK Users

| Property | Value |
|----------|-------|
| `tenant_id` | Reference to `Tenant` |
| `type` | `tenant` |
| Login | Partner JWT + API key + Origin |
| Profile API | Not available (403) |
| Provisioning | Auto `findOrCreateTenantUser` on SSO login |

### JWT Flow

```
Login/SSO ──► accessToken (short-lived) + refreshToken (httpOnly cookie)
     │
     ├── REST: Authorization: Bearer <accessToken>
     └── WS:   auth: { accessToken: "<accessToken>" }

401 ──► POST /auth/refresh (cookie or body) ──► new accessToken
```

## Messaging Lifecycle

```
sending ──► sent ──► delivered ──► seen
              └──► failed (on socket error)
```

| Stage | Trigger |
|-------|---------|
| `sending` | Client optimistic UI |
| `sent` | Server `messageSent` to sender |
| `delivered` | Recipient `messageAck` or online delivery |
| `seen` | Recipient `markSeen` while viewing chat |
| `failed` | Server `socketError` with `clientMessageId` |

## Conversation Types

| Type | `is_group` | Message fetch | Send payload |
|------|------------|---------------|--------------|
| Direct | `false` | `GET /users/conv-message/:userId` | `recipientId` required |
| Group | `true` | `GET /conversations/:id/messages` | `isGroup: true`, no `recipientId` |

## Real-Time Room Model

On WebSocket connect, each user joins a personal room: `user._id`.

On `joinChat`, user joins conversation room: `conversationId`.

| Event delivery | Strategy |
|----------------|----------|
| Direct messages | Conversation room + recipient user room |
| Group messages | Each participant's user room |
| Typing | Conversation room + participant user rooms |
| Presence | Broadcast `userOnline` / `userOffline` |

## Tenant Isolation

Enforced at API level:

- User search scoped by `tenant_id` (or standalone-only users)
- Cannot message users from another tenant
- Cannot add tenant users to standalone groups
- Group creation validates all members share tenant context

## Database Schema Summary

### User

`full_name`, `phone_number`, `email`, `avatar`, `type`, `tenant_id`, `hashed_password`, `refresh_token`, `last_active_at`

### Conversation

`participants[]`, `type` (`direct`|`group`), `is_group`, `group_id?`, `is_deleted`

### Message

`author`, `conversation_Id`, `text`, `status`, `clientMessageId`, `delivered_at`, `seen_at`, `is_Deleted`

### Group

`name`, `avatar`, `created_By`, `admin[]`

### Tenant

`name`, `api_key`, `access_token_secret`, `origin`

## Deployment Considerations

| Concern | Recommendation |
|---------|----------------|
| CORS | Set `CORS_ORIGIN` to production web URL |
| Cookies | `NODE_ENV=production` enables `secure` + `sameSite: none` |
| WebSocket | Same origin as API or configure `socketUrl` in SDK |
| Secrets | Rotate `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET` |
| MongoDB | Use replica set for production |
| Horizontal scale | Socket.IO requires sticky sessions or Redis adapter |

## Key Source Files

| Concern | Path |
|---------|------|
| API bootstrap | `apps/api/src/index.ts` |
| Route registration | `apps/api/src/app.ts` |
| WebSocket handlers | `apps/api/src/websocket/events/register-chat-event.ts` |
| Message service | `apps/api/src/services/message.service.ts` |
| ChatSDK | `packages/sdk-core/src/ChatClient.ts` |
| Web chat context | `apps/web/src/context/chatContext.tsx` |
