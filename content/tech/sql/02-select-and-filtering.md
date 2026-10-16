---
title: SELECT and Filtering Rows
description: Projecting columns, filtering with WHERE, the comparison and pattern operators, and sorting and limiting results.
keywords: [sql select, where clause, like, in, between, order by, limit, distinct]
updated: 2026-10-09
quiz:
  - q: Which query correctly finds names starting with 'A'?
    options:
      - "WHERE name = 'A%'"
      - "WHERE name LIKE 'A%'"
      - "WHERE name CONTAINS 'A'"
      - "WHERE name STARTS 'A'"
    answer: 1
    explain: "`LIKE` with `%` as the multi-character wildcard. `=` compares the whole value literally, so it would only match the two-character string 'A%'."
  - q: What is wrong with `SELECT *` in production application code?
    options:
      - Nothing, it is always fine
      - It returns columns the code does not need, breaks when columns are added or reordered, and prevents index-only scans
      - It is slower to parse
      - It does not work with joins
    answer: 1
    explain: "`SELECT *` is excellent for exploring. In shipped code it couples your application to the exact current shape of the table and moves more bytes than needed."
  - q: Where does `LIMIT 10` apply relative to `ORDER BY`?
    options:
      - Before sorting — it takes 10 arbitrary rows then sorts them
      - After sorting — the 10 rows are the top of the sorted result
      - They cannot be combined
      - It depends on the index
    answer: 1
    explain: "ORDER BY is evaluated before LIMIT, so you always get the true top N. Without ORDER BY, LIMIT returns an arbitrary 10 rows that can change between runs."
faq:
  - q: Is `LIKE` case-sensitive?
    a: It depends on the database and the column's collation. PostgreSQL's `LIKE` is case-sensitive (use `ILIKE`); MySQL's default collation is case-insensitive. Never assume — test it.
  - q: How do I paginate results?
    a: "`LIMIT n OFFSET m` is the obvious answer and is fine for the first few pages. For deep pagination it gets slow, because the database still has to produce and discard the skipped rows. Keyset pagination — `WHERE id > :last_seen_id ORDER BY id LIMIT n` — stays fast at any depth."
---

`SELECT` does two things: choose which columns come back (projection) and, with `WHERE`, choose which rows (selection).

## Projection

```sql
SELECT name, city FROM customers;
SELECT * FROM customers;                    -- every column
SELECT name AS customer_name FROM customers;  -- rename in the output
SELECT DISTINCT city FROM customers;        -- unique values only
```

`SELECT *` is the right tool while exploring a table and the wrong one in application code: it ties your code to today's column list, ships bytes you do not use, and stops the planner from satisfying the query from an index alone.

Expressions are allowed anywhere a column is:

```sql
SELECT
  name,
  amount,
  amount * 0.18 AS tax,
  UPPER(city)   AS city_code
FROM orders;
```

## Filtering with WHERE

```sql
SELECT * FROM orders WHERE amount > 1000;
SELECT * FROM orders WHERE city = 'Pune' AND amount > 1000;
SELECT * FROM orders WHERE city = 'Pune' OR city = 'Mumbai';
SELECT * FROM orders WHERE NOT shipped;
```

:::warning
`AND` binds tighter than `OR`. `WHERE a = 1 OR a = 2 AND b = 3` means `a = 1 OR (a = 2 AND b = 3)` — almost certainly not what you meant. Use brackets whenever both appear.
:::

### The operators worth memorising

```sql
WHERE amount BETWEEN 500 AND 2000        -- inclusive on BOTH ends
WHERE city IN ('Pune', 'Mumbai', 'Delhi')
WHERE city NOT IN ('Pune')
WHERE name LIKE 'A%'                      -- starts with A
WHERE name LIKE '%son'                    -- ends with son
WHERE name LIKE '_a%'                     -- 'a' as the second character
WHERE shipped_on IS NULL
```

`%` matches any run of characters; `_` matches exactly one.

:::danger
`WHERE city NOT IN (SELECT city FROM blocked)` returns **nothing at all** if the subquery produces even one NULL, because `x NOT IN (a, NULL)` evaluates to NULL rather than true. Use `NOT EXISTS` instead, or filter NULLs out of the subquery.
:::

### Dates

```sql
SELECT * FROM orders WHERE placed_on >= '2026-03-01' AND placed_on < '2026-04-01';
```

Note the half-open range rather than `BETWEEN '2026-03-01' AND '2026-03-31'`. If `placed_on` is a timestamp, `BETWEEN` silently drops everything that happened on 31 March after midnight. The `>= start AND < next_start` pattern is correct for both dates and timestamps.

:::danger
`WHERE YEAR(placed_on) = 2026` is correct but usually slow: wrapping the column in a function prevents the database from using an index on it. Rewrite as a range on the bare column — `placed_on >= '2026-01-01' AND placed_on < '2027-01-01'`.
:::

## Sorting

```sql
SELECT name, amount
FROM orders
ORDER BY amount DESC, name ASC;
```

Sorting is by the first column; ties are broken by the next. `ASC` is the default and can be omitted.

NULLs sort together, but *where* depends on the database — PostgreSQL puts them last for `ASC`, SQLite and MySQL put them first. If it matters, say so explicitly: `ORDER BY amount DESC NULLS LAST`.

## Limiting

```sql
SELECT name, amount
FROM orders
ORDER BY amount DESC
LIMIT 5;
```

```output
name   amount
Ada    2400
Alan   1500
Ada     900
```

:::warning
A `LIMIT` without an `ORDER BY` returns an arbitrary set of rows. It may look stable in testing and change the moment the planner picks a different access path. "Top 5" always means `ORDER BY ... LIMIT 5`.
:::

Dialect note: SQL Server and older Oracle use `TOP n` and `FETCH FIRST n ROWS ONLY` respectively. PostgreSQL, MySQL and SQLite all use `LIMIT`.

## Putting it together

```sql
SELECT
  name,
  amount,
  placed_on
FROM orders
WHERE placed_on >= '2026-03-01'
  AND placed_on <  '2026-04-01'
  AND amount > 500
  AND status IN ('paid', 'shipped')
ORDER BY amount DESC
LIMIT 20;
```

Read it in evaluation order: from orders, keep March, keep the ones over 500 that are paid or shipped, sort by amount descending, take the first 20.

## What to remember

- Name your columns in application code; keep `SELECT *` for exploration.
- Bracket any mix of `AND` and `OR`.
- Use half-open date ranges, and never wrap an indexed column in a function in `WHERE`.
- `LIMIT` is only meaningful alongside `ORDER BY`.
- `NOT IN` plus a NULL equals no rows — reach for `NOT EXISTS`.
