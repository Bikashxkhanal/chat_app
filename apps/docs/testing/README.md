# Testing

## Current State

| Area | Coverage | Location |
|------|----------|----------|
| Shared types | Minimal unit test | `packages/types/src/message.type.test.ts` |
| API (`apps/api`) | None | — |
| Web (`apps/web`) | None | — |
| SDK (`sdk-core`) | None | — |
| E2E | None | — |

## Running Existing Tests

```bash
# Types package only
pnpm --filter @repo/types test
```

This runs Node's built-in test runner:

```bash
node --import tsx --test src/**/*.test.ts
```

### What Is Tested

`MESSAGE_STATUS` enum values are validated in `message.type.test.ts`:

```typescript
import { MESSAGE_STATUS } from "./message.type";
// Asserts: sending, sent, delivered, seen, failed
```

## Workspace Commands

```bash
pnpm check-types   # TypeScript across all packages
pnpm lint          # ESLint across workspace
pnpm build         # Compile all packages
```

## Recommended Test Strategy

### 1. Unit Tests — `packages/`

| Package | Priority | Suggested tests |
|---------|----------|-----------------|
| `@repo/types` | High | Schema/type guards, enum completeness |
| `@repo/utils` | High | `ApiResponse`, `ApiError` serialization |
| `@repo/sdk-core` | High | Mock axios/socket, method calls, event relay |
| `@repo/db-nosql` | Medium | Model validation, indexes |

**Suggested runner:** Vitest or Node test runner (`tsx`)

```bash
# Example future script in packages/sdk-core/package.json
"test": "node --import tsx --test src/**/*.test.ts"
```

### 2. API Integration Tests — `apps/api`

Test against an in-memory or test MongoDB instance.

| Module | Test cases |
|--------|------------|
| Auth | Login, register, refresh, SSO with mock tenant |
| Users | Conversation list, search tenant isolation |
| Conversations | Create direct, fetch messages |
| Groups | Create group, member validation |
| Messages | Mark seen, unread counts |

**Suggested stack:**

```bash
pnpm add -D vitest supertest mongodb-memory-server --filter @repo/api
```

**Example structure:**

```
apps/api/
└── src/
    └── __tests__/
        ├── auth.test.ts
        ├── conversations.test.ts
        └── groups.test.ts
```

**Example test skeleton:**

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { httpServer } from "../app";

describe("POST /api/v1/auth/login", () => {
  it("returns 401 for invalid credentials", async () => {
    const res = await request(httpServer)
      .post("/api/v1/auth/login")
      .send({ type: "normal", phone_number: "000", password: "wrong" });
    expect(res.status).toBe(401);
  });
});
```

### 3. WebSocket Tests

Use `socket.io-client` in integration tests:

```typescript
import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
  auth: { accessToken: testToken },
  transports: ["websocket"],
});

socket.on("connected", () => {
  socket.emit("joinChat", conversationId);
  socket.emit("sendMessage", { conversationId, text: "test", recipientId });
});
```

### 4. Web Component Tests — `apps/web`

**Suggested stack:** Vitest + React Testing Library

| Component | Test focus |
|-----------|------------|
| `chatContext` | Message dedup, typing, unread |
| `UserCard` | Unread badge rendering |
| `ChatWindow` | Send message, group avatars |

```bash
pnpm add -D vitest @testing-library/react jsdom --filter @repo/web
```

### 5. E2E Tests

**Suggested stack:** Playwright

| Flow | Steps |
|------|-------|
| Standalone signup | Register → login → dashboard |
| Direct chat | Search user → send → receive (two contexts) |
| Group chat | Create group → send → verify author avatar |
| Mobile layout | Chat full screen, back navigation |

```bash
pnpm create playwright
```

## Manual Testing Checklist

### Auth

- [ ] Register new standalone user
- [ ] Login with valid credentials
- [ ] Login rejected for tenant user on standalone login
- [ ] Token refresh on 401
- [ ] Logout clears session

### Direct Messaging

- [ ] Search user by phone
- [ ] Create conversation
- [ ] Send message (optimistic UI + server confirm)
- [ ] Receive message in other browser
- [ ] Delivery receipt (double tick)
- [ ] Seen receipt (blue tick)
- [ ] Typing indicator

### Group Messaging

- [ ] Create group with 2+ members
- [ ] Send group message
- [ ] Author avatar and name shown
- [ ] All members receive message

### Mobile

- [ ] Conversation list with bottom tab bar
- [ ] Full-screen chat when opened
- [ ] Back button returns to list
- [ ] Message input not blocked by tab bar
- [ ] Light/dark theme toggle

### SDK / SSO

- [ ] SSO login with valid partner JWT
- [ ] SSO rejected with wrong origin
- [ ] Tenant user cannot access `/users/me`

## CI Recommendations

Add to GitHub Actions (future):

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7
        ports: ["27017:27017"]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install
      - run: pnpm check-types
      - run: pnpm --filter @repo/types test
      - run: pnpm --filter @repo/api test  # when added
```

## API Contract Testing

Validate API against OpenAPI spec:

```bash
# Using schemathesis or dredd (future)
npx @redocly/cli lint apps/docs/api/openapi.yaml
```

## Load Testing (Production)

| Tool | Use case |
|------|----------|
| k6 | REST endpoint load |
| Artillery | WebSocket message throughput |

Target metrics:
- Message delivery latency < 200ms (local)
- 1000 concurrent socket connections per instance

## Related Documentation

- [OpenAPI Spec](../api/openapi.yaml)
- [Architecture](../architecture/README.md)
- [Getting Started](../getting-started.md)
