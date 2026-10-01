# API Design

> The contract between your backend and everyone who calls it. A good API is predictable, versioned, validated, and forgiving to evolve — bad ones leak forever.

## Concepts

- **REST resource design:** model the domain as **nouns** (resources) at URLs (`/orders`,
  `/orders/42/items`), acted on by HTTP verbs. Plural collections, IDs for members; avoid verbs in
  paths.
- **HTTP verbs & status codes:** `GET` (read, safe), `POST` (create), `PUT`/`PATCH` (replace/update),
  `DELETE` (remove). Return meaningful status: `200/201/204` success, `400` bad input, `401`/`403`
  auth, `404` missing, `409` conflict, `422` validation, `500` server error.
- **Versioning:** never break a published contract. Version via URL (`/v1/...`) or header; add fields
  additively, deprecate before removing.
- **Validation:** reject malformed input at the edge with a clear, structured error — never trust the
  client.
- **Pagination:** never return unbounded lists; page with `limit`/`offset` or cursors.
- **Error envelopes:** return errors in a consistent, machine-readable shape across every endpoint.
- **Idempotency:** the same `PUT`/`DELETE` (or a `POST` with an idempotency key) applied twice yields
  the same result — essential for safe retries.

## Best Practices

- Use nouns and HTTP verbs; let the method convey the action, not the URL.
- Validate inputs with structured field errors. Use `400` for malformed requests and `422` for
  semantically invalid content when that distinction fits the documented contract.
- Page all collection endpoints and document the limits.
- Keep one error envelope for the whole API; include a stable error `code`, a human `message`, and
  details.
- For retryable writes, define idempotency-key scope, persistence, retention and payload matching;
  a header alone does not prevent duplicate charges or orders.

## Patterns & Examples

```http
GET /v1/orders?limit=20&cursor=eyJpZCI6NDJ9   →  200 OK
{
  "data": [ { "id": 43, "status": "paid", "totalCents": 4497 } ],
  "page": { "nextCursor": "eyJpZCI6NDN9", "limit": 20 }
}

POST /v1/orders        (Idempotency-Key: 9f1c…)   →  201 Created
DELETE /v1/orders/43                              →  204 No Content
```

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request body is invalid.",
    "details": [
      { "field": "email", "issue": "must be a valid email address" }
    ]
  }
}
```

**Authentication:** distinguish token format (JWT or opaque), transport (Authorization header or
cookie), and server state. A JWT can be verified locally but may still use revocation or session
state; opaque tokens commonly require a shared lookup. Either can travel in a header or cookie,
and either architecture can scale with appropriate shared storage. Check expiry, issuer, audience,
allowed algorithms and revocation policy where applicable. Use HTTPS and never put credentials
in URLs. Cookie-authenticated writes need CSRF protection; use HttpOnly/Secure/SameSite cookie
settings appropriate to the app. Authenticate callers, then authorize each resource and tenant.

**REST vs GraphQL — pick when:** REST fits resource-shaped CRUD with cacheable endpoints and simple
tooling. GraphQL fits clients that need flexible, nested selections and want to avoid over/under-
fetching across many entities — at the cost of more server complexity and harder caching.

## Common Pitfalls / Anti-patterns

- **Verbs in URLs:** `/getOrders`, `/createOrder` — re-implements HTTP in the path. Use `GET /orders`.
- **Wrong/uniform status codes:** returning `200` with `{"error": ...}` breaks clients that rely on
  status. Use the right code.
- **Unversioned breaking changes:** removing or renaming a field with no version bump shatters every
  consumer.
- **Unbounded responses:** returning every row; the first big tenant takes the service down.

## References

- MDN HTTP methods & status codes — https://developer.mozilla.org/docs/Web/HTTP
- Microsoft REST API design guidelines — https://github.com/microsoft/api-guidelines
- GraphQL — https://graphql.org/learn/

<!-- level: intermediate -->
