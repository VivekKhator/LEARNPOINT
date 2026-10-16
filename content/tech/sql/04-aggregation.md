---
title: Grouping and Aggregation
description: COUNT, SUM, AVG and friends, GROUP BY, the HAVING versus WHERE distinction, and why COUNT(*) and COUNT(column) differ.
keywords: [sql group by, having, count, sum, avg, aggregate functions, distinct count]
updated: 2026-10-10
quiz:
  - q: What is the difference between `COUNT(*)` and `COUNT(city)`?
    options:
      - They are identical
      - "`COUNT(*)` counts rows; `COUNT(city)` counts rows where city is not NULL"
      - "`COUNT(city)` counts distinct cities"
      - "`COUNT(*)` is slower and otherwise the same"
    answer: 1
    explain: Aggregate functions ignore NULLs. That is the whole difference, and it is a common source of mismatched totals.
  - q: You want only groups with more than 5 orders. Where does that condition go?
    options: ["WHERE", "HAVING", "ON", "ORDER BY"]
    answer: 1
    explain: "`WHERE` filters rows before grouping, when no group counts exist yet. `HAVING` filters the groups after aggregation."
  - q: "`SELECT city, name, COUNT(*) FROM customers GROUP BY city` — what happens?"
    options:
      - It returns one arbitrary name per city
      - It is an error in standard SQL because `name` is neither grouped nor aggregated
      - It returns every name
      - It groups by city and name
    answer: 1
    explain: Every selected column must be in GROUP BY or inside an aggregate. PostgreSQL and SQL Server reject it; MySQL historically allowed it and returned an arbitrary value, which is worse.
faq:
  - q: Does `AVG` ignore NULLs?
    a: Yes — it divides by the count of non-NULL values. If you want NULL treated as zero, write `AVG(COALESCE(amount, 0))`, and be sure that is what you mean.
  - q: How do I count rows matching a condition inside a grouped query?
    a: "`COUNT(*) FILTER (WHERE status = 'paid')` in PostgreSQL, or the portable `SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END)`."
---

Aggregation collapses many rows into one summary row. `GROUP BY` says how to bucket them first.

## The aggregate functions

```sql
SELECT
  COUNT(*)        AS orders,
  SUM(amount)     AS revenue,
  AVG(amount)     AS average,
  MIN(amount)     AS smallest,
  MAX(amount)     AS largest
FROM orders;
```

```output
orders  revenue  average  smallest  largest
3       4800     1600.0   900       2400
```

With no `GROUP BY`, the whole table is one group and you get exactly one row.

:::warning
**Every aggregate except `COUNT(*)` ignores NULLs.** `AVG(amount)` over the values `100, NULL, 200` returns 150, not 100. Whether that is right depends on whether NULL means "zero" or "we do not know" — which is a question about your data, not about SQL.
:::

## COUNT has three forms

```sql
COUNT(*)              -- number of rows
COUNT(city)           -- number of rows where city IS NOT NULL
COUNT(DISTINCT city)  -- number of different non-NULL cities
```

If `COUNT(*)` and `COUNT(column)` disagree, you have found NULLs. That is often a useful diagnostic in itself.

## GROUP BY

```sql
SELECT customer_id, COUNT(*) AS orders, SUM(amount) AS total
FROM orders
GROUP BY customer_id;
```

```output
customer_id  orders  total
1            2       3300
2            1       1500
```

One output row per distinct value of the grouping column. The rule that follows from this: **every column in `SELECT` must either appear in `GROUP BY` or be wrapped in an aggregate.** Anything else is ambiguous — if a customer has two different cities across their orders, which one should the engine show you?

Grouping by several columns buckets by the combination:

```sql
SELECT city, status, COUNT(*)
FROM orders
GROUP BY city, status;
```

## WHERE versus HAVING

This is the distinction the whole chapter turns on:

```sql
SELECT customer_id, SUM(amount) AS total
FROM orders
WHERE placed_on >= '2026-01-01'   -- filters ROWS, before grouping
GROUP BY customer_id
HAVING SUM(amount) > 2000          -- filters GROUPS, after aggregating
ORDER BY total DESC;
```

- `WHERE` runs **before** `GROUP BY`. It cannot see aggregates, because none exist yet.
- `HAVING` runs **after**. It is the only place an aggregate condition can go.

:::tip
Put every condition you can in `WHERE`, not `HAVING`. `WHERE` discards rows before the expensive grouping work; `HAVING` discards results after it. Same answer, less work.
:::

## Conditional aggregation

Counting subsets without multiple queries:

```sql
SELECT
  customer_id,
  COUNT(*)                                           AS all_orders,
  SUM(CASE WHEN status = 'paid'      THEN 1 ELSE 0 END) AS paid,
  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
  SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS paid_revenue
FROM orders
GROUP BY customer_id;
```

This pattern — one scan, several conditional measures — is how most reporting queries are built. PostgreSQL offers the tidier `COUNT(*) FILTER (WHERE status = 'paid')`.

## Window functions, briefly

Sometimes you want an aggregate **alongside** each row rather than instead of it:

```sql
SELECT
  name,
  amount,
  SUM(amount) OVER (PARTITION BY customer_id) AS customer_total,
  amount * 100.0 / SUM(amount) OVER ()        AS pct_of_all,
  RANK()      OVER (ORDER BY amount DESC)     AS rank
FROM orders;
```

`OVER` turns an aggregate into a window function: it computes over a set of rows but does not collapse them. `PARTITION BY` is the window equivalent of `GROUP BY`. This single feature replaces an enormous amount of self-join gymnastics — running totals, rankings, percent-of-total, period-over-period comparisons.

## Common mistakes

```sql
-- Dividing integers truncates in some databases
SELECT SUM(paid) / COUNT(*) FROM orders;        -- might be 0
SELECT SUM(paid) * 1.0 / COUNT(*) FROM orders;  -- force a real division

-- AVG of an AVG is not the overall average
-- (unless every group is the same size)
```

:::danger
Averaging averages is wrong unless the groups are equal-sized. To get a true overall average from grouped data, keep the sums and counts and divide at the end: `SUM(total) / SUM(count)`.
:::

## What to remember

- Aggregates ignore NULLs; `COUNT(*)` does not.
- Every selected column must be grouped or aggregated.
- `WHERE` filters rows before grouping, `HAVING` filters groups after.
- Conditional aggregation with `CASE` gives several measures from one scan.
- Window functions aggregate without collapsing — learn them early.
