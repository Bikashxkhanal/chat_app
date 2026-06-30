# REST API Reference

> **Interactive docs:** Open [swagger.html](./swagger.html) in a browser or view the [OpenAPI 3.0 spec](./openapi.yaml).

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

| Method | Header / Cookie | Used by |
|--------|-----------------|---------|
| Bearer JWT | `Authorization: Bearer <accessToken>` | All protected routes |
| Access cookie | `chatappAccessToken` | Browser clients |
| Refresh cookie | `chatappRefreshToken` | Token refresh |

### SSO (Tenant) Additional Requirements

| Header | Purpose |
|--------|---------|
| `Origin` | Must match tenant `origin` in database |
| `Authorization: Bearer <partnerJWT>` | Partner-signed JWT (on `/auth/sso/login`, `/auth/sdk/register`) |

Partner JWT payload:

```json
{
  "phone_number": "9800000001",
  "name": "Jane Doe",
  "email": "jane@partner.com",
  "role": "user"
}
```

## Response Format

### Success

```json
{
  "success": true,
  "statusCode": 200,
  "data": { },
  "message": "Operation successful"
}
```

### Error

```json
{
  "success": false,
  "statusCode": 400,
  "errors": [],
  "message": "Validation failed"
}
```

## Endpoints Summary

### Auth — `/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/login` | None | Standalone or SDK login |
| POST | `/logout` | Optional | Invalidate session |
| POST | `/refresh` | Refresh token | Get new access token |
| POST | `/preregister` | None | Check phone before signup |
| POST | `/register` | None | Create standalone account |
| POST | `/sso/login` | API key + partner JWT | Tenant SSO login |
| POST | `/sdk/register` | API key + partner JWT | Provision tenant user |

### Users — `/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/me` | JWT + standalone | Get profile |
| PATCH | `/me` | JWT + standalone | Update profile |
| GET | `/getAllConversationUsers` | JWT | List conversations |
| GET | `/conv-message/:userId` | JWT | Direct message history |
| GET | `/search?phone=` | JWT | Search users by phone |

### Conversations — `/conversations`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/direct` | JWT | Create/get DM |
| GET | `/:conversationId/messages` | JWT | Messages by conversation |

### Messages — `/messages`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/:conversationId/seen` | JWT | Mark messages seen |

### Groups — `/groups`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | JWT | Create group |
| GET | `/conversation/:conversationId` | JWT | Group details + members |

## Pagination

Message endpoints accept query parameters:

| Param | Default | Description |
|-------|---------|-------------|
| `page` | `1` | Page number |
| `limit` | `30` | Messages per page |

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (group) |
| 400 | Bad request / validation |
| 401 | Unauthorized |
| 403 | Forbidden (tenant isolation, standalone-only) |
| 404 | Not found |
| 500 | Internal server error |

## Rate Limiting

Not currently implemented. Recommended for production.

## Related Documentation

- [WebSocket Events](./websocket.md)
- [Architecture](../architecture/README.md)
- [SDK — Web](../sdk/web.md)
