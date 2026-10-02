# Non-Relational Databases (NoSQL)

> Storage engines that trade the relational model for a specific access pattern, scale, or flexibility. Powerful when chosen for a real reason — a foot-gun when chosen to dodge modeling.

## Concepts

NoSQL is not one thing; it's a set of families, each optimized for a different shape of data and
access:

- **Document (MongoDB, Couchbase):** stores schema-flexible JSON-like documents. Pick when records
  are self-contained aggregates read/written as a whole (a product, an order with its line items).
  Consistency is tunable; default reads are strongly consistent on the primary.
- **Key-value (Redis, Memcached):** a giant hash map — `GET`/`SET` by key, in-memory and very fast.
  Pick when you need caching, sessions, rate limiters, leaderboards, or ephemeral state. Eventual
  consistency across replicas; Redis is single-threaded-fast per node.
- **Wide-column (Cassandra, ScyllaDB):** rows with flexible columns, partitioned for massive write
  throughput across many nodes. Pick when you have huge write volume and queries known in advance
  (time-series, event logs). Tunable consistency (quorum reads/writes).
- **Managed/cloud (DynamoDB, Firebase/Firestore):** fully managed key-value/document stores with
  autoscaling and pay-per-use. Pick when you want zero ops and predictable single-digit-ms access at
  scale; model around access patterns, not entities. Configurable consistency (eventual by default).

**CAP theorem (one paragraph):** in a distributed store, a network **P**artition is inevitable, so you
must choose what to sacrifice during one: **C**onsistency (every read sees the latest write) or
**A**vailability (every request still gets a response). Cassandra/Dynamo lean **AP** (stay available,
reconcile later); a strongly-consistent store leans **CP** (refuse stale reads during a partition).
In practice most engines let you tune this per operation.

## Best Practices

- **Model around your queries.** In NoSQL you design for the reads you'll do, often duplicating data
  to avoid joins the engine can't do well.
- Choose the family that matches the access pattern; don't default to "NoSQL" generically.
- Set explicit consistency levels per operation where the engine allows it.
- Use a key-value store (Redis) as a cache in front of any database, regardless of the primary store.

## Patterns & Examples

```json
// Document store: an order kept as one self-contained aggregate (no joins to read it).
{
  "_id": "ord_1029",
  "customer": { "id": "cus_55", "name": "Ada Lovelace" },
  "items": [
    { "sku": "BOOK-01", "qty": 2, "priceCents": 1999 },
    { "sku": "PEN-07",  "qty": 1, "priceCents": 499 }
  ],
  "status": "paid",
  "totalCents": 4497
}
```

```text
# Key-value (Redis): cache + session + rate-limit, all by key.
SET   session:abc123  "{userId:55}"  EX 3600     # session, expires in 1h
GET   session:abc123                             # O(1) lookup
INCR  ratelimit:ip:203.0.113.7                   # request counter
```

## Common Pitfalls / Anti-patterns

- **Using NoSQL to avoid modeling:** schemaless ≠ no schema. Without an enforced shape, the schema
  just moves into scattered, undocumented application code — and rots.
- **Joining in the application:** pulling several collections and stitching them in code reinvents a
  slow, buggy join engine. Model the aggregate so a single read suffices.
- **Unbounded documents/partitions:** a document that grows forever (an array you keep appending to)
  or a hot partition key throttles the whole store.
- **Relational data forced into documents:** highly interconnected, frequently-joined data usually
  wants a relational DB — don't fight the model.

## References

- MongoDB data modeling guide — https://www.mongodb.com/docs/manual/data-modeling/
- Redis documentation — https://redis.io/docs/
- DynamoDB best practices — https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html

<!-- level: intermediate -->
