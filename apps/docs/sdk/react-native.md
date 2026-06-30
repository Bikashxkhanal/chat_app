# SDK — React Native

Guide for integrating `@repo/sdk-core` in React Native applications.

> There is no dedicated `@repo/sdk-react-native` package. Use **`@repo/sdk-core`** directly — it depends only on `axios` and `socket.io-client`, both compatible with React Native.

## Installation

```bash
# In your React Native app
pnpm add @repo/sdk-core axios socket.io-client

# Required polyfills for some RN setups
pnpm add react-native-url-polyfill
```

### Metro / Bundler Setup

At app entry (`index.js` or `App.tsx`):

```typescript
import "react-native-url-polyfill/auto";
```

### Socket.IO on React Native

`socket.io-client` works with React Native when using the WebSocket transport (default in SDK):

```typescript
// ChatSDK already sets transports: ["websocket"]
```

For Android cleartext HTTP in development, add to `android/app/src/main/AndroidManifest.xml`:

```xml
<application android:usesCleartextTraffic="true" ...>
```

Use HTTPS in production.

## Package Import

```typescript
import { ChatSDK } from "@repo/sdk-core";
import type { ChatSDKConfig, SSOAuthConfig } from "@repo/sdk-core";
import { chatEventEnums } from "@repo/types";
```

If `@repo/types` is not available externally, copy the event enum values or import from your published types package.

## Initialize SDK

```typescript
const sdk = new ChatSDK({
  apiBaseUrl: "https://api.yourchat.com/api/v1",
  socketUrl: "https://api.yourchat.com", // optional
});
```

## Authentication

### Tenant SSO (Recommended for RN partner apps)

```typescript
async function authenticateChat(partnerJwt: string) {
  const response = await sdk.ssoLogin({
    apiKey: process.env.CHAT_API_KEY!,
    accessToken: partnerJwt,
  });

  const token = sdk.getAccessToken();
  if (!token) throw new Error("No access token returned");

  sdk.connect(token);
  return response;
}
```

Partner JWT must be signed server-side with the tenant's `access_token_secret`. **Never embed the secret in the mobile app.**

### Token from Your Backend

Recommended flow:

```
Mobile App ──► Your Backend ──► Chat API /auth/sso/login
                (holds api_key + signs JWT)
Mobile App ◄── chat accessToken
```

```typescript
const { accessToken } = await fetch("https://your-api.com/chat/token").then((r) => r.json());
sdk.setAccessToken(accessToken);
sdk.connect(accessToken);
```

## React Native Hook Example

```tsx
import { useEffect, useRef, useState, useCallback } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { ChatSDK } from "@repo/sdk-core";
import { chatEventEnums, type MessageReceivedPayload } from "@repo/types";

const sdk = new ChatSDK({
  apiBaseUrl: "https://api.example.com/api/v1",
});

export function useChat(accessToken: string | null) {
  const [connected, setConnected] = useState(false);
  const [conversations, setConversations] = useState([]);
  const currentConversation = useRef<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    sdk.setAccessToken(accessToken);
    const socket = sdk.connect(accessToken);

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    sdk.getConversations().then(setConversations);

    const onMessage = (payload: unknown) => {
      const msg = payload as MessageReceivedPayload;
      sdk.ackMessage(msg._id, msg.conversation_Id);
      // update local state / store
    };

    sdk.on(chatEventEnums.MESSAGE_RECEIVED_EVENT, onMessage);

    // Reconnect when app returns to foreground
    const onAppState = (state: AppStateStatus) => {
      if (state === "active" && !socket.connected) {
        sdk.connect(accessToken);
      }
    };
    const sub = AppState.addEventListener("change", onAppState);

    return () => {
      sub.remove();
      sdk.off(chatEventEnums.MESSAGE_RECEIVED_EVENT, onMessage);
      sdk.disconnect();
    };
  }, [accessToken]);

  const openChat = useCallback(async (conversationId: string, userId?: string, isGroup?: boolean) => {
    currentConversation.current = conversationId;
    sdk.joinConversation(conversationId);

    if (isGroup) {
      return sdk.getMessagesByConversationId(conversationId);
    }
    return sdk.getMessages(userId!);
  }, []);

  const send = useCallback(
    (conversationId: string, text: string, opts?: { recipientId?: string; isGroup?: boolean }) => {
      sdk.sendMessage({
        conversationId,
        text,
        recipientId: opts?.recipientId,
        isGroup: opts?.isGroup,
        clientMessageId: `${Date.now()}-${Math.random()}`,
      });
    },
    []
  );

  return { connected, conversations, openChat, send, sdk };
}
```

## Screen Navigation Pattern

Industry-standard mobile pattern (matches standalone web app):

| Screen | Shows |
|--------|-------|
| ConversationList | `getConversations()` |
| ChatScreen | Messages + input (full screen) |
| Back | `leaveConversation` + navigate back |

```typescript
// On mount ChatScreen
sdk.joinConversation(conversationId);

// On unmount
sdk.leaveConversation(conversationId);
sdk.stopTyping(conversationId);
```

## Direct vs Group Messages

```typescript
// Direct
sdk.sendMessage({
  conversationId,
  text: "Hi",
  recipientId: otherUserId,
  clientMessageId: uuid(),
});

// Group
sdk.sendMessage({
  conversationId,
  text: "Hi team",
  isGroup: true,
  clientMessageId: uuid(),
});
```

## Typing Indicators

```typescript
import { useRef } from "react";

function useTyping(conversationId: string) {
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const onChangeText = (text: string) => {
    if (text.length > 0) {
      sdk.startTyping(conversationId);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => sdk.stopTyping(conversationId), 2000);
    } else {
      sdk.stopTyping(conversationId);
    }
  };

  return { onChangeText };
}
```

## Push Notifications (Recommended)

Socket.IO alone does not deliver when the app is backgrounded. For production RN:

1. Store device tokens server-side
2. Send FCM/APNs on `messageReceived` when recipient is offline
3. On notification tap → navigate to `ChatScreen` → `joinConversation`

*Not yet implemented in this codebase — planned integration point.*

## Secure Storage

Store `accessToken` in secure storage, not AsyncStorage:

```bash
pnpm add react-native-keychain
```

```typescript
import * as Keychain from "react-native-keychain";

await Keychain.setGenericPassword("chat", accessToken);
const creds = await Keychain.getGenericPassword();
sdk.setAccessToken(creds.password);
```

## Differences from Web SDK

| Aspect | Web (`@repo/sdk-web`) | React Native (`@repo/sdk-core`) |
|--------|----------------------|--------------------------------|
| Import | `createChatSDK()` | `new ChatSDK()` |
| Cookies | `withCredentials: true` | Not reliable — use Bearer token |
| Token refresh | httpOnly cookie | Backend-mediated refresh |
| Background | Tab visibility | `AppState` listener |
| Polyfills | None | `react-native-url-polyfill` |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Socket won't connect | Check `socketUrl`, use WSS in production |
| 403 on SSO | Verify `Origin` / tenant `api_key` |
| Messages not received | Call `joinConversation` before sending |
| Duplicate messages | Ignore `messageReceived` when `author === self` |
| Android HTTP blocked | `usesCleartextTraffic` or use HTTPS |

## Full API

See [SDK Overview](./README.md) and [WebSocket Events](../api/websocket.md).
