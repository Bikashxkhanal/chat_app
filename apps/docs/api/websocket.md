# WebSocket API

Real-time messaging uses **Socket.IO** on the same host as the HTTP API.

## Connection

```typescript
import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
  auth: { accessToken: "<chat-app-jwt>" },
  transports: ["websocket"],
  reconnection: true,
});
```

| Config | Value |
|--------|-------|
| URL | API origin without `/api/v1` (e.g. `http://localhost:8000`) |
| Auth | `{ accessToken: string }` — chat app JWT from login/SSO |
| Transport | WebSocket only |

### Connection Lifecycle

```
connect ──► server emits "connected"
       └──► server joins client to room: user._id

disconnect ──► presence: userOffline (if last socket)
```

On auth failure, server emits `socketError`.

## Room Model

| Room | Joined when | Purpose |
|------|-------------|---------|
| `user._id` | On connect | Direct delivery to user |
| `conversationId` | Client emits `joinChat` | In-room broadcast |

Always call `joinChat` when opening a conversation.

## Client → Server Events

### `joinChat`

```typescript
socket.emit("joinChat", conversationId);
```

### `leaveChat`

```typescript
socket.emit("leaveChat", conversationId);
```

### `sendMessage`

```typescript
socket.emit("sendMessage", {
  conversationId: string,
  text: string,
  recipientId?: string,      // required for direct messages
  clientMessageId?: string,    // UUID for optimistic UI dedup
  isGroup?: boolean,           // true for group chats
});
```

### `messageAck`

Acknowledge delivery (recipient → sender gets `messageDelivered`).

```typescript
socket.emit("messageAck", {
  messageId: string,
  conversationId: string,
});
```

### `markSeen`

```typescript
socket.emit("markSeen", { conversationId: string });
```

Also available via REST: `POST /messages/:conversationId/seen`

### `typing` / `stopTyping`

```typescript
socket.emit("typing", { conversationId: string });
socket.emit("stopTyping", { conversationId: string });
```

## Server → Client Events

### `connected`

Emitted after successful authentication.

### `messageSent`

Sent to message author with `status: "sent"`.

```typescript
interface MessageReceivedPayload {
  _id: string;
  author: string;
  conversation_Id: string;
  text: string;
  status: "sent" | "delivered" | "seen" | "failed" | "sending";
  clientMessageId?: string;
  delivered_at?: string | null;
  seen_at?: string | null;
  createdAt: string;
  authorProfile?: { _id: string; full_name?: string; avatar?: string | null };
}
```

### `messageReceived`

Incoming message for recipients. Sender should ignore their own `messageReceived` (use `messageSent` + optimistic UI).

### `messageDelivered`

```typescript
{
  messageId: string;
  conversationId: string;
  status: "delivered";
  delivered_at: string;
  clientMessageId?: string;
}
```

### `messageSeen`

```typescript
{
  messageId: string;
  conversationId: string;
  status: "seen";
  seen_at: string;
}
```

### `newChat`

Conversation list should refresh.

```typescript
{
  conversationId: string;
  lastMessage?: MessageReceivedPayload;
  isGroup?: boolean;
  groupName?: string;
}
```

### `typing` / `stopTyping`

```typescript
{ conversationId: string; userId: string }
```

### `userOnline` / `userOffline`

```typescript
{
  userId: string;
  isOnline: boolean;
  lastActiveAt?: string;
}
```

### `socketError`

```typescript
// string
"Failed to send message"

// or object (failed send with clientMessageId)
{
  message: string;
  clientMessageId: string;
  status: "failed";
}
```

## Message Status Flow

```
Client optimistic (sending)
        │
        ▼
   messageSent (sent) ──► messageDelivered ──► messageSeen
        │
        └── socketError (failed)
```

## SDK Event Subscription

```typescript
import { chatEventEnums } from "@repo/types";

sdk.on(chatEventEnums.MESSAGE_RECEIVED_EVENT, (payload) => {
  console.log("New message", payload);
});

sdk.on(chatEventEnums.TYPING_EVENT, ({ conversationId, userId }) => {
  console.log(`${userId} is typing in ${conversationId}`);
});
```

## Events Defined but Not Implemented

These exist in `chatEventEnums` but have no server handlers yet:

- `reconnecting`
- `updateGroupName`
- `conversationCreated` / `conversationUpdated`
- `messageDeleted` / `messageEdited`
- `tokenExpired`

## Recommended Client Patterns

1. **Join room** on conversation open, **leave** on close
2. **Ack** every incoming `messageReceived` for delivery receipts
3. **Mark seen** only when user is actively viewing that conversation
4. **Ignore** `messageReceived` when `author === currentUserId`
5. **Debounce** typing events (SDK sends stop after 2s idle)
6. Use `clientMessageId` to merge optimistic and server messages
