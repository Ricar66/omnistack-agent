# Data Modeling

> Turning a domain into entities, attributes, and relationships before you write a line of SQL. Good modeling prevents most data bugs; bad modeling guarantees them.

## Concepts

- **Entity:** a thing the system tracks (Customer, Order, Product). Becomes a table.
- **Attribute:** a property of an entity (a Customer's `email`, an Order's `total`). Becomes a column.
- **Relationship:** how entities connect (a Customer *places* Orders). Becomes a foreign key or a
  join table.
- **Cardinality:** how many of one entity relate to another — **1:1**, **1:N** (one-to-many), or
  **N:M** (many-to-many, resolved with a junction table).
- **Keys:** a **primary key** uniquely identifies a row; a **foreign key** points at another table's
  primary key, enforcing referential integrity.
- **ER / DER diagrams:** Entity-Relationship diagrams draw entities as boxes, attributes as fields,
  and relationships as connecting lines annotated with cardinality (crow's-foot notation: `─o<` for
  "many", `─||` for "one").
- **Logical vs. physical model:** the *logical* model is implementation-free (entities, attributes,
  relationships); the *physical* model adds types, indexes, constraints, and engine-specific details.

## Best Practices

- Model the domain first (logical), then map to tables (physical) — don't start from columns.
- Give every table a stable primary key (a surrogate `id` or `uuid` is usually safest).
- Enforce relationships with real foreign-key constraints, not just application code.
- Resolve every N:M with a junction table carrying the two foreign keys (and any link attributes).
- Name consistently: singular or plural tables, `snake_case` columns — pick one and hold the line.

## Patterns & Examples

```text
Textual ER model — an e-commerce slice (crow's-foot cardinality):

  CUSTOMER ──places──< ORDER >──contains──< ORDER_ITEM >──refers──── PRODUCT
   (1)                  (N)   (1)            (N)          (N)         (1)

  CUSTOMER(  id PK, email UNIQUE, name )
  ORDER(     id PK, customer_id FK -> CUSTOMER.id, status, created_at )
  PRODUCT(   id PK, sku UNIQUE, name, price_cents )
  ORDER_ITEM(id PK, order_id FK -> ORDER.id,
                    product_id FK -> PRODUCT.id, qty, unit_price_cents )
            -- ORDER_ITEM is the junction resolving ORDER N:M PRODUCT,
            -- and it carries link attributes (qty, unit_price_cents).
```

```sql
-- The same relationships expressed physically, with integrity enforced.
CREATE TABLE order_item (
  id              BIGINT       PRIMARY KEY,
  order_id        BIGINT       NOT NULL REFERENCES "order"(id),
  product_id      BIGINT       NOT NULL REFERENCES product(id),
  qty             INT          NOT NULL CHECK (qty > 0),
  unit_price_cents INT         NOT NULL CHECK (unit_price_cents >= 0)
);
```

**When to denormalize:** introduce controlled redundancy (e.g., store `order.total_cents` instead of
re-summing items, or cache a `comment_count`) only when reads are hot and the cost of keeping the
copy in sync is acceptable — and write down how it stays consistent.

## Common Pitfalls / Anti-patterns

- **No primary key / natural keys that change:** using a mutable business value (email, SSN) as the PK
  cascades pain when it changes. Prefer a surrogate key.
- **Many-to-many without a junction table:** stuffing a comma-separated list of IDs into a column
  breaks 1NF and every query against it.
- **Premature denormalization:** copying data everywhere before reads prove it's needed, then fighting
  drift between the copies.
- **Modeling the UI, not the domain:** shaping tables around one screen instead of the underlying
  entities locks you into that screen.

## References

- Microsoft: Database design basics — https://learn.microsoft.com/sql/relational-databases/databases/database-design
- Hernandez, *Database Design for Mere Mortals*
- Crow's-foot notation overview — https://www.lucidchart.com/pages/er-diagrams

<!-- level: intermediate -->
