# Relational Databases

> Tables, relationships, and SQL — the default, battle-tested choice when your data has structure and you need correctness guarantees.

## Concepts

- **Relational model:** data lives in **tables** (relations) of **rows** (records) and **columns**
  (attributes). Rows are linked by **keys** — a **primary key** uniquely identifies a row; a **foreign
  key** references another table's primary key.
- **Normalization:** organize columns to remove redundancy and update anomalies.
  - *1NF:* atomic values, no repeating groups (no comma-lists in a column).
  - *2NF:* 1NF + every non-key column depends on the **whole** primary key.
  - *3NF:* 2NF + no non-key column depends on another non-key column.
- **Indexes:** a sorted lookup structure (usually a B-tree) that turns a full table scan into a fast
  seek. They speed reads but cost storage and slow writes — every insert/update maintains them.
- **Transactions & ACID:** a transaction groups statements so they **A**ll succeed or **A**ll roll
  back — **A**tomicity, **C**onsistency, **I**solation, **D**urability. This is the relational
  superpower for money, inventory, and bookings.
- **Joins:** combine rows across tables on a key (`INNER`, `LEFT`, etc.).

## Best Practices

- Normalize to 3NF first; denormalize later, deliberately, only where reads prove it's needed.
- Index the columns you filter, join, and sort on — but only those; unused indexes are pure write cost.
- **Always parameterize queries** — never concatenate user input into SQL (SQL injection).
- Wrap multi-step writes in a transaction; keep transactions short to avoid lock contention.
- Select only the columns you need; let the database do filtering and aggregation, not the app.

## Patterns & Examples

```sql
-- PostgreSQL query fragment for a driver using $1 placeholders.
-- Assumes orders/customers tables; send the customer ID separately as a value.
CREATE INDEX idx_orders_customer ON orders (customer_id);

SELECT o.id, o.total, c.name
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.customer_id = $1
ORDER BY o.created_at DESC;
```

A transaction alone does not prove that both accounts exist or that a debit has funds.
The following **illustrative PostgreSQL 16 demo** uses temporary accounts, one currency and
integer cents. Account IDs remain immutable, and every transfer acquires locks in ID order.
It is not executed by this repository's Node test suite.

```sql
BEGIN;
CREATE TEMP TABLE demo_accounts (
  id bigint PRIMARY KEY,
  balance_cents bigint NOT NULL CHECK (balance_cents >= 0)
) ON COMMIT DROP;
INSERT INTO demo_accounts VALUES (1, 1000), (2, 200);

DO $$
DECLARE
  from_id bigint := 1;
  to_id bigint := 2;
  amount_cents numeric := 100;
  locked_count integer;
BEGIN
  IF from_id IS NULL OR to_id IS NULL OR from_id = to_id THEN
    RAISE EXCEPTION 'Two distinct account IDs are required';
  END IF;
  IF amount_cents IS NULL OR amount_cents <= 0
     OR amount_cents <> trunc(amount_cents)
     OR amount_cents > 9223372036854775807 THEN
    RAISE EXCEPTION 'Amount must be positive integer cents within bigint range';
  END IF;

  -- Lock both existing rows consistently before checking or changing balances.
  PERFORM id FROM demo_accounts
    WHERE id IN (from_id, to_id) ORDER BY id FOR UPDATE;
  GET DIAGNOSTICS locked_count = ROW_COUNT;
  IF locked_count <> 2 THEN
    RAISE EXCEPTION 'Account not found';
  END IF;

  UPDATE demo_accounts
    SET balance_cents = balance_cents - amount_cents::bigint
    WHERE id = from_id AND balance_cents >= amount_cents::bigint;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient funds';
  END IF;

  -- A bigint overflow here aborts the transaction, including the debit.
  UPDATE demo_accounts
    SET balance_cents = balance_cents + amount_cents::bigint WHERE id = to_id;
END;
$$;

SELECT id, balance_cents FROM demo_accounts ORDER BY id;
ROLLBACK; -- Disposable demo: persist nothing.
```

For an application, validate inputs before conversion, bind values through its driver and use
one connection for the entire transaction. Roll back on errors; do not continue after an aborted
transaction. Test missing accounts, insufficient funds, overflow and concurrent opposite transfers
against the actual database. Handle deadlocks/serialization failures with bounded retries, and use
an idempotency policy for client retries. Authorization and a durable ledger are separate concerns.

| Engine | Pick when |
|---|---|
| **PostgreSQL** | Default open-source choice: rich types (JSONB), extensions, strict standards. |
| **SQL Server** | .NET/enterprise stacks, strong tooling, T-SQL, Windows shops. |
| **MySQL** | Ubiquitous web hosting, read-heavy apps, large ecosystem. |
| **MariaDB** | MySQL fork; verify version and feature compatibility before migrating. |
| **Oracle** | Large enterprises with existing Oracle investment and support needs. |
| **SQLite** | Embedded/single-file: mobile apps, tests, small local tools — no server. |

## Common Pitfalls / Anti-patterns

- **N+1 queries:** one query for a list, then one more per row in a loop. Fix with a join or a single
  batched `IN (...)` query.
- **Missing indexes:** filtering or joining on an unindexed column forces full scans that get slower
  as the table grows.
- **`SELECT *`:** pulls columns you don't need, breaks when the schema changes, and defeats covering
  indexes. List the columns.
- **String-built SQL:** the classic SQL-injection hole. Parameterize, always.

## References

- PostgreSQL documentation — https://www.postgresql.org/docs/
- Use The Index, Luke! (indexing & performance) — https://use-the-index-luke.com/
- OWASP SQL Injection Prevention Cheat Sheet — https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html

<!-- level: intermediate -->
