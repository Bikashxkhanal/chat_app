# SDK — Web & React

Guide for integrating the Chat SDK in browser and React applications.

## Installation

```bash
# Monorepo workspace
pnpm add @repo/sdk-web --filter your-app

# Dependencies (transitive via sdk-core)
# axios, socket.io-client
```

## Quick Start

```typescript
import { createChatSDK } from "@repo/sdk-web";
import { chatEventEnums } from "@repo/types";

const sdk = createChatSDK({
  apiBaseUrl: import.meta.env.VITE_API_URL, // http://localhost:8000/api/v1
});

// Tenant SSO flow
await sdk.ssoLogin({
  apiKey: "your-tenant-api-key",
  accessToken: partnerJwt, // signed by partner with tenant secret
});

sdk.connect();

sdk.on(chatEventEnums.MESSAGE_RECEIVED_EVENT, (msg) => {
  console.log("New message:", msg);
});
```

## Standalone Login (First-Party)

```typescript
const response = await sdk.login("9800000000", "password123");
const token = sdk.getAccessToken();
sdk.connect(token);
```

## React Integration Pattern

The standalone web app (`apps/web`) demonstrates a production React pattern using Context:

```
ChatProvider
  ├── createChatSDK({ apiBaseUrl })
  ├── connect on mount with localStorage token
  ├── subscribe to socket events once (refs avoid loops)
  └── expose: selectChat, sendMessage, conversations, etc.
```

### Minimal React Hook Example

```tsx
import { useEffect, useRef, useState, useCallback } from "react";
import { createChatSDK } from "@repo/sdk-web";
import { chatEventEnums, type MessageReceivedPayload } from "@repo/types";

const API_BASE = "http://localhost:8000/api/v1";

export function useChatSDK(accessToken: string | null) {
  const sdkRef = useRef(createChatSDK({ apiBaseUrl: API_BASE }));
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<MessageReceivedPayload[]>([]);

  useEffect(() => {
    if (!accessToken) return;

    const sdk = sdkRef.current;
    sdk.setAccessToken(accessToken);
    const socket = sdk.connect(accessToken);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onMessage = (payload: unknown) => {
      const msg = payload as MessageReceivedPayload;
      setMessages((prev) => [...prev, msg]);
      sdk.ackMessage(msg._id, msg.conversation_Id);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    sdk.on(chatEventEnums.MESSAGE_RECEIVED_EVENT, onMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      sdk.off(chatEventEnums.MESSAGE_RECEIVED_EVENT, onMessage);
      sdk.disconnect();
    };
  }, [accessToken]);

  const sendMessage = useCallback(
    (conversationId: string, text: string, recipientId?: string, isGroup?: boolean) => {
      const clientMessageId = crypto.randomUUID();
      sdkRef.current.sendMessage({
        conversationId,
        text,
        recipientId,
        clientMessageId,
        isGroup,
      });
    },
    []
  );

  return { sdk: sdkRef.current, connected, messages, sendMessage };
}
```

## Tenant SSO Integration

### 1. Partner signs JWT

```typescript
import jwt from "jsonwebtoken";

const partnerToken = jwt.sign(
  {
    phone_number: user.phone,
    name: user.displayName,
    email: user.email,
  },
  TENANT_ACCESS_TOKEN_SECRET,
  { expiresIn: "5m" }
);
```

### 2. Exchange for chat token

```typescript
await sdk.ssoLogin({
  apiKey: process.env.CHAT_API_KEY,
  accessToken: partnerToken,
});

sdk.connect();
```

### 3. Required headers (handled by SDK)

| Header | Value |
|--------|-------|
| `Origin` | Your app's origin (must match tenant config) |
| `Authorization` | `Bearer <partnerJWT>` on SSO request only |

## Direct Messages

```typescript
// 1. Search user
const users = await sdk.searchUsers("9800");

// 2. Create conversation
const conv = await sdk.createDirectConversation(users[0]._id);

// 3. Join room & load history
sdk.joinConversation(conv._id);
const { messages } = await sdk.getMessages(users[0]._id);

// 4. Send
sdk.sendMessage({
  conversationId: conv._id,
  text: "Hello!",
  recipientId: users[0]._id,
  clientMessageId: crypto.randomUUID(),
});
```

## Group Messages

```typescript
const { group, conversation } = await sdk.createGroup({
  name: "Project Team",
  memberIds: ["userId1", "userId2"],
});

sdk.joinConversation(conversation._id);

const { messages } = await sdk.getMessagesByConversationId(conversation._id);

sdk.sendMessage({
  conversationId: conversation._id,
  text: "Hello team!",
  isGroup: true,
  clientMessageId: crypto.randomUUID(),
});
```

## Event Handling Best Practices

```typescript
// 1. Ignore own messages on messageReceived
sdk.on(chatEventEnums.MESSAGE_RECEIVED_EVENT, (payload) => {
  const msg = payload as MessageReceivedPayload;
  if (msg.author === currentUserId) return;
  // append to UI, ack delivery
  sdk.ackMessage(msg._id, msg.conversation_Id);
});

// 2. Merge optimistic sends via clientMessageId
sdk.on(chatEventEnums.MESSAGE_SENT_EVENT, (payload) => {
  // upsert by clientMessageId
});

// 3. Refresh conversation list on newChat
sdk.on(chatEventEnums.NEW_CHAT_EVENT, () => {
  refreshConversations();
});

// 4. Typing — debounce on input
sdk.startTyping(conversationId);
// after 2s idle:
sdk.stopTyping(conversationId);
```

## Token Refresh

The standalone web app uses an axios interceptor (`apps/web/src/services/api.ts`):

```typescript
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await apiClient.post("/auth/refresh");
      return apiClient.request(error.config);
    }
    throw error;
  }
);
```

For SDK-only apps, implement similar logic or call `POST /auth/refresh` and `sdk.setAccessToken(newToken)`.

## CORS & Cookies

SDK uses `withCredentials: true`. Ensure:

- API `CORS_ORIGIN` matches your web app origin
- Cookies work for refresh token flow
- For cross-origin embeds, set `sameSite: none` + `secure` in production

## Reference Implementation

| Feature | File |
|---------|------|
| Full React context | `apps/web/src/context/chatContext.tsx` |
| Auth + refresh | `apps/web/src/services/api.ts` |
| SDK factory | `packages/sdk-web/src/index.ts` |

## Environment Variables

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Socket URL is derived automatically: `http://localhost:8000`
