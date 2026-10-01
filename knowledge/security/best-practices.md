# Security Best Practices

> Secure-by-default engineering: assume input is hostile, grant the least access that works, and never store secrets in code. Security is a property of every layer, not a feature you bolt on.

## Concepts

- **Threat awareness:** identify trust boundaries and sensitive data. Use the relevant OWASP Top 10
  edition as a risk checklist, not proof that the application is secure.
- **Input validation & output handling:** validate at the boundary against an allow-list. Use
  context-specific encoding for HTML, attributes and URLs; parameterize SQL. Avoid shell
  interpolation: use a fixed executable and validated argument arrays with the shell disabled.
- **Auth & session hygiene:** hash passwords with a slow, salted algorithm (bcrypt/argon2 — never
  plain MD5/SHA), use short-lived tokens, set `HttpOnly`/`Secure`/`SameSite` cookies, and enforce
  HTTPS everywhere.
- **Secrets management:** use slow salted hashes for passwords. Recoverable API keys and service
  credentials belong in a secret manager or encrypted storage, with controlled key access and
  rotation. Inject secrets at runtime; never commit or log them.
- **Dependency / CVE hygiene:** third-party code is your attack surface. Pin versions, audit
  regularly, and patch known vulnerabilities promptly.
- **Least privilege:** every user, service, token, and DB account gets the minimum access it needs —
  nothing more.

## Best Practices

- Validate input with allow-lists; reject by default. Parameterize queries and avoid shell interpolation.
- Encode output for its sink (HTML-encode to stop XSS, parameterize to stop SQLi).
- Store only password *hashes* (Argon2id, or an appropriate vetted alternative); never log secrets.
- Authorize every resource and tenant access on the server; authentication alone is insufficient.
- Cookie-authenticated writes need CSRF defenses in addition to cookie flags and HTTPS.
- Run dependency audits in CI and keep components current.
- Default every grant to the narrowest scope and expand only with cause.

## Patterns & Examples

```javascript
// Illustrative: db uses node-postgres and users.email has a UNIQUE constraint.
// Pin compatible pg/argon2 versions in the consuming app; this repo installs neither.
import argon2 from 'argon2';

async function login(db, email, password) {
  if (typeof email !== 'string' || typeof password !== 'string') return null;
  const result = await db.query(
    'SELECT id, password_hash FROM users WHERE email = $1', [email],
  );
  const user = result.rows[0];
  if (!user) return null;
  if (typeof user.password_hash !== 'string') {
    throw new Error('Invalid password hash record');
  }

  // Verification may throw for a malformed hash or an operational failure.
  // Let errors reach the server error handler; never grant a session on failure.
  const matches = await argon2.verify(user.password_hash, password);
  return matches ? { id: user.id } : null;
}
```

```text
Secrets: read from the environment / a secret manager — never hardcode.
  ✗  const apiKey = "sk_live_9f1c…";              // committed → compromised forever
  ✓  const apiKey = process.env.STRIPE_API_KEY;   // injected at deploy, rotatable
```

This example is not a complete login endpoint or a constant-time route: absent users skip hashing,
DB timing varies, and rate limits, request-size bounds, session creation and safe logging are omitted.
Return generic credential errors. Malformed hashes must fail closed; report verification/DB failures
through a generic server error and protected operational logs, rather than swallowing every exception
as a wrong password. Consult the installed library's documented error behavior.

See **`core/05-guardrails.md`** for the agent's security stance. The login snippet requires app-level
integration tests; it is not executed by this repository's zero-dependency test suite.

## Common Pitfalls / Anti-patterns

- **Trusting client input:** validating only in the browser; the API is called directly. Validate on
  the server, always.
- **String-built queries/commands:** the root of SQL injection and command injection. Parameterize.
- **Rolling your own crypto / storing plaintext passwords:** use vetted libraries and slow hashes.
- **Secrets in Git:** even deleted-then-committed keys live in history. Rotate and use a vault.
- **Over-privileged accounts:** one leaked admin token = full compromise. Scope everything.

## References

- OWASP Top 10 — https://owasp.org/www-project-top-ten/
- OWASP Password Storage — https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- OWASP Authentication — https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- node-postgres query results — https://node-postgres.com/apis/result
- node-argon2 usage and verification errors — https://github.com/ranisalt/node-argon2
- See also: `core/05-guardrails.md` (the agent's security-by-default stance)

<!-- level: intermediate -->
