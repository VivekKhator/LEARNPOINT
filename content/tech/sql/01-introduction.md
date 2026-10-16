---
title: Introduction to SQL
description: What a relational database is, what SQL does and does not do, and the shape of every query you will ever write.
keywords: [what is sql, relational database, rdbms, sql vs nosql, declarative]
updated: 2026-10-09
quiz:
  - q: SQL is a declarative language. What does that mean?
    options:
      - You describe the result you want; the engine decides how to get it
      - You write step-by-step instructions for reading each row
      - It only works on declared variables
      - It cannot be used in programs
    answer: 0
    explain: You state what you want. The query planner chooses the access path, join order and algorithms — which is why the same query can be fast on one schema and slow on another.
  - q: In which order does a database logically evaluate a SELECT query?
    options:
      - "SELECT, FROM, WHERE, GROUP BY, ORDER BY"
      - "FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY"
      - "WHERE, FROM, SELECT, ORDER BY"
      - "Whichever order you write the clauses in"
    answer: 1
    explain: "Logical evaluation starts at FROM and ends at ORDER BY. This is why a column alias defined in SELECT can be used in ORDER BY but not in WHERE."
faq:
  - q: Is SQL the same in every database?
    a: The core — SELECT, joins, aggregation — is standard and transfers everywhere. Dates, string functions, window-function details, upserts and limit syntax differ between PostgreSQL, MySQL, SQL Server, Oracle and SQLite. Learn the core once; look up the dialect when you switch.
  - q: Should I learn SQL or a NoSQL database first?
    a: SQL. The relational model and its query language are the lingua franca of data — analytics tools, BI platforms and most back-end services assume it. Document stores are easier to start with and harder to query well later.
---

SQL is the language for asking questions of a **relational database** — data stored in tables of rows and columns, where relationships between tables are expressed by matching values rather than by pointers.

## The model in one example

Two tables, one relationship:

```sql
-- customers
id | name   | city
1  | Ada    | Pune
2  | Alan   | London

-- orders
id | customer_id | amount | placed_on
10 | 1           | 2400   | 2026-03-01
11 | 1           | 900    | 2026-03-04
12 | 2           | 1500   | 2026-03-05
```

Nothing in `orders` physically contains customer data. The link is the value in `customer_id` matching an `id` in `customers`. That is the entire idea behind "relational", and the reason joins exist.

## Declarative, not procedural

You do not tell the database *how* to find rows. You describe the result:

```sql
SELECT name, city
FROM customers
WHERE city = 'Pune';
```

The **query planner** decides whether to scan the whole table or use an index, in which order to join, and which algorithm to use for each step. This is powerful and occasionally infuriating: two queries that look equivalent can differ by three orders of magnitude in run time, because one of them let the planner use an index and the other did not.

:::note
This is why "learning SQL" eventually means learning a little about query plans. You cannot write fast SQL by instinct alone, but you can learn to recognise the handful of patterns that stop a planner from using an index.
:::

## The shape of a query

Nearly every SELECT you write is some subset of this skeleton, always in this written order:

```sql
SELECT   column_list          -- what to return
FROM     table                -- where to read from
JOIN     other ON condition   -- what to attach
WHERE    row_condition        -- which rows to keep
GROUP BY column_list          -- how to bucket them
HAVING   group_condition      -- which buckets to keep
ORDER BY column_list          -- how to sort the result
LIMIT    n;                   -- how many to return
```

The database **evaluates** them in a different order:

`FROM` → `JOIN` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`

That mismatch explains two things that confuse everyone at first:

1. An alias created in `SELECT` cannot be used in `WHERE` — `WHERE` ran before `SELECT` existed. It *can* be used in `ORDER BY`, which runs after.
2. `WHERE` filters rows and `HAVING` filters groups. Filtering an aggregate (`COUNT(*) > 3`) belongs in `HAVING`, because at `WHERE` time no groups exist yet.

:::tip
Write queries in evaluation order while thinking — "from orders, keep March, group by customer, keep the big spenders, show name and total" — then transcribe into SQL order. It removes most structural mistakes before you type them.
:::

## Statement categories

| Category | Statements | Purpose |
|---|---|---|
| **DQL** | `SELECT` | Read data |
| **DML** | `INSERT`, `UPDATE`, `DELETE` | Change data |
| **DDL** | `CREATE`, `ALTER`, `DROP` | Change structure |
| **DCL** | `GRANT`, `REVOKE` | Change permissions |
| **TCL** | `COMMIT`, `ROLLBACK` | Control transactions |

In daily work SELECT dominates — most people read data far more often than they change it.

## NULL is not zero, and not empty

`NULL` means *unknown*, and it propagates:

```sql
SELECT 100 + NULL;        -- NULL, not 100
SELECT NULL = NULL;       -- NULL, not true
```

Because of this, equality never matches NULL. You must use `IS NULL` / `IS NOT NULL`:

```sql
SELECT * FROM orders WHERE shipped_on IS NULL;   -- correct
SELECT * FROM orders WHERE shipped_on = NULL;    -- returns nothing, always
```

:::danger
`WHERE status != 'cancelled'` silently drops rows where `status` is NULL, because `NULL != 'cancelled'` is NULL, not true. If NULL should be included, write `WHERE status IS DISTINCT FROM 'cancelled'` or `WHERE status != 'cancelled' OR status IS NULL`.
:::

## Trying this yourself

You do not need to install a server. SQLite ships with Python and most operating systems:

```bash
sqlite3 practice.db
```

```sql
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT);
INSERT INTO customers (name, city) VALUES ('Ada', 'Pune'), ('Alan', 'London');
SELECT * FROM customers;
```

Everything in the next chapters works in SQLite unless noted.

## What to remember

- Relationships are matched values, not pointers — that is what joins operate on.
- Written order and evaluation order differ; that difference explains the WHERE/HAVING rule.
- NULL means unknown, poisons comparisons, and needs `IS NULL`.
- SQL is declarative, so performance is a property of the schema and indexes, not just the query text.
