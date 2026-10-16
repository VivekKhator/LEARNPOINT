---
title: Subqueries and CTEs
description: Scalar, row and table subqueries, EXISTS versus IN, and the WITH clause that turns an unreadable query into a readable one.
keywords: [sql subquery, cte, with clause, exists, in, correlated subquery, recursive cte]
updated: 2026-10-11
quiz:
  - q: When is `EXISTS` preferable to `IN`?
    options:
      - Never, they are identical
      - When the subquery may return NULLs, or when you only need to know whether a match exists
      - Only in MySQL
      - When the subquery returns one row
    answer: 1
    explain: "`NOT IN` with a NULL in the result set returns no rows at all. `EXISTS` is NULL-safe and can stop at the first match instead of materialising the full list."
  - q: What does a correlated subquery mean?
    options:
      - A subquery that references a column from the outer query, so it is conceptually evaluated per outer row
      - A subquery joined to another subquery
      - A subquery that returns one value
      - A subquery in the FROM clause
    answer: 0
    explain: The inner query depends on the current outer row. Planners often rewrite these into joins, but the semantics are per-row.
  - q: What is the main advantage of a CTE over a nested subquery?
    options:
      - It is always faster
      - Readability — it names the intermediate result and lets you build a query in steps
      - It uses less memory
      - It allows more joins
    answer: 1
    explain: "CTEs are primarily a readability feature. Performance is usually the same; in some databases a CTE used to act as an optimisation fence, so check your version before assuming."
faq:
  - q: Are CTEs slower than subqueries?
    a: "In modern PostgreSQL (12+), MySQL 8 and SQL Server, a CTE is generally inlined and planned like a subquery. Older PostgreSQL materialised every CTE, which could be much slower; `MATERIALIZED` / `NOT MATERIALIZED` now lets you choose explicitly."
  - q: Can I UPDATE using a CTE?
    a: Yes in PostgreSQL and SQL Server — `WITH ... UPDATE ... FROM cte`. MySQL supports CTEs in UPDATE from version 8.0.
---

A subquery is a query inside another query. Used well it expresses a step in a calculation; used badly it produces the kind of five-level-nested SQL that nobody wants to inherit. CTEs fix the readability half of that problem.

## Scalar subqueries — returning one value

```sql
SELECT name, amount
FROM orders
WHERE amount > (SELECT AVG(amount) FROM orders);
```

The inner query runs once and produces a single number. If it returns more than one row, the database raises an error.

## Subqueries in FROM — a derived table

```sql
SELECT city, AVG(order_count) AS avg_orders
FROM (
    SELECT customer_id, city, COUNT(*) AS order_count
    FROM orders
    GROUP BY customer_id, city
) AS per_customer
GROUP BY city;
```

This is how you aggregate twice: once per customer, then again per city. The alias (`AS per_customer`) is mandatory in most databases.

## IN, EXISTS, and the NULL trap

```sql
-- IN: build the list, then test membership
SELECT name FROM customers
WHERE id IN (SELECT customer_id FROM orders WHERE amount > 1000);

-- EXISTS: stop at the first match
SELECT name FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id = c.id AND o.amount > 1000
);
```

Both answer "customers with a big order". The difference shows up in the negative case:

```sql
-- DANGEROUS: returns zero rows if ANY blocked_id is NULL
SELECT name FROM customers WHERE id NOT IN (SELECT blocked_id FROM blocklist);

-- SAFE
SELECT name FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM blocklist b WHERE b.blocked_id = c.id);
```

:::danger
`x NOT IN (1, 2, NULL)` is never true. SQL reads it as "x ≠ 1 AND x ≠ 2 AND x ≠ NULL", and the last comparison is NULL — unknown — so the whole expression can never be true. `NOT EXISTS` has no such problem. Default to `NOT EXISTS` and you will never debug this at 11 p.m.
:::

## Correlated subqueries

```sql
SELECT
  c.name,
  (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS order_count
FROM customers c;
```

The inner query references `c.id` from the outer query, so conceptually it runs once per customer. Planners frequently rewrite this into a join, but when they cannot — complex conditions, functions, certain database versions — the cost is linear in the outer row count.

For a handful of rows it is fine and often clearer than the equivalent join. For a million rows, write the join.

## Common Table Expressions

A CTE names a result set up front with `WITH`:

```sql
WITH monthly AS (
    SELECT
      customer_id,
      DATE_TRUNC('month', placed_on) AS month,
      SUM(amount) AS revenue
    FROM orders
    WHERE placed_on >= '2026-01-01'
    GROUP BY customer_id, DATE_TRUNC('month', placed_on)
),
ranked AS (
    SELECT
      *,
      RANK() OVER (PARTITION BY month ORDER BY revenue DESC) AS position
    FROM monthly
)
SELECT month, customer_id, revenue
FROM ranked
WHERE position <= 3
ORDER BY month, position;
```

Read top to bottom: bucket this year's orders by customer and month, rank customers within each month, keep the top three. The same logic as nested subqueries, but each step has a name and can be reasoned about alone.

:::tip
To debug a CTE chain, replace the final `SELECT` with `SELECT * FROM monthly` and work forward one stage at a time. That is far easier than picking apart nested brackets.
:::

## Recursive CTEs

For hierarchies — org charts, category trees, bill of materials:

```sql
WITH RECURSIVE chain AS (
    -- anchor: start at the top
    SELECT id, name, manager_id, 1 AS depth
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- recursive step: everyone reporting to someone already in `chain`
    SELECT e.id, e.name, e.manager_id, c.depth + 1
    FROM employees e
    JOIN chain c ON e.manager_id = c.id
)
SELECT depth, name FROM chain ORDER BY depth, name;
```

The anchor runs once; the recursive member runs repeatedly against the rows added in the previous round until it adds none.

:::warning
A cycle in the data — A reports to B reports to A — makes a recursive CTE loop forever. Guard with a depth limit (`WHERE c.depth < 20`) or track visited ids in an array.
:::

## Choosing between them

| Situation | Use |
|---|---|
| One value needed in a comparison | Scalar subquery |
| "Does a match exist?" | `EXISTS` |
| "Does a match not exist?" | `NOT EXISTS` (never `NOT IN`) |
| Aggregating twice | Derived table or CTE |
| Multi-step logic, or reused twice | CTE |
| Hierarchy traversal | Recursive CTE |

## What to remember

- `NOT IN` plus NULL equals zero rows — use `NOT EXISTS`.
- Correlated subqueries are per-row; prefer joins at scale.
- CTEs buy readability, which is worth more than it sounds on a query you will revisit.
- Recursive CTEs handle hierarchies, and need a cycle guard.
