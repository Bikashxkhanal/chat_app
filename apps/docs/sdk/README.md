# SDK Overview

The Chat SDK enables partner applications to embed real-time messaging without building a custom client.

## Packages

| Package | NPM name | Platform | Description |
|---------|----------|----------|-------------|
| `@repo/sdk-core` | workspace | Universal (Node, Web, RN) | `ChatSDK` class |
| `@repo/sdk-web` | workspace | Browser / React | `createChatSDK()` factory |

> **React Native** uses `@repo/sdk-core` directly. There is no separate `@repo/sdk-react-native` package yet — see [React Native guide](./react-native.md).

## Architecture

```
Partner App
    │
    ├── SSO: Partner JWT + API key ──► POST /auth/sso/login
    │
    └── ChatSDK
          ├── axios (REST)
          └── socket.io-client (WebSocket)
```

## Installation

### Within monorepo (workspace)

```json
{
  "dependencies": {
    "@repo/sdk-web": "workspace:*"
  }
}
```

### External consumer (when published)

```bash
npm install @your-org/sdk-web @your-org/sdk-core
```

## Configuration

```typescript
interface ChatSDKConfig {
  apiBaseUrl: string;   // e.g. "http://localhost:8000/api/v1"
  socketUrl?: string;   // optional, defaults to apiBaseUrl without /api/v1
}
```

## Authentication Modes

| Mode | Method | Use case |
|------|--------|----------|
| Standalone | `sdk.login(phone, password)` | First-party apps |
| Tenant SSO | `sdk.ssoLogin({ apiKey, accessToken })` | Partner embed |

After auth, call `sdk.connect(accessToken)` to open WebSocket.

## Public API Reference

### Auth

| Method | Description |
|--------|-------------|
| `login(phoneNumber, password)` | Standalone login |
| `ssoLogin({ apiKey, accessToken })` | Tenant SSO login |
| `logout()` | Logout + disconnect socket |
| `getAccessToken()` | Current token |
| `setAccessToken(token)` | Set token manually |

### Connection

| Method | Description |
|--------|-------------|
| `connect(accessToken?)` | Open Socket.IO connection |
| `disconnect()` | Close socket, clear listeners |
| `on(event, callback)` | Subscribe to events |
| `off(event, callback)` | Unsubscribe |

### Conversations & Messages

| Method | Description |
|--------|-------------|
| `getConversations()` | List all conversations |
| `getMessages(userId, page?, limit?)` | Direct message history |
| `getMessagesByConversationId(id, page?, limit?)` | Group/direct by conversation ID |
| `createDirectConversation(recipientId)` | Start DM |
| `createGroup({ name, memberIds, avatar? })` | Create group |
| `searchUsers(phone)` | Search by phone |
| `markConversationSeen(conversationId)` | Mark seen (socket + REST) |

### Real-Time

| Method | Description |
|--------|-------------|
| `joinConversation(conversationId)` | Join socket room |
| `leaveConversation(conversationId)` | Leave socket room |
| `sendMessage(payload)` | Send message via socket |
| `ackMessage(messageId, conversationId)` | Delivery ack |
| `startTyping(conversationId)` | Typing indicator |
| `stopTyping(conversationId)` | Stop typing |

### Not in SDK (use REST directly)

- `GET/PATCH /users/me` (standalone profile)
- `POST /auth/refresh`
- `GET /groups/conversation/:id`

## Event Constants

Import from `@repo/types`:

```typescript
import { chatEventEnums } from "@repo/types";

chatEventEnums.MESSAGE_RECEIVED_EVENT  // "messageReceived"
chatEventEnums.MESSAGE_SENT_EVENT      // "messageSent"
chatEventEnums.TYPING_EVENT            // "typing"
// ... see api/websocket.md for full list
```

## Guides

- [Web / React Integration](./web.md)
- [React Native Integration](./react-native.md)
