---
title: SQL Joins
description: INNER, LEFT, RIGHT and FULL joins explained by what they do to row counts, plus the three mistakes that produce wrong answers silently.
keywords: [sql join, inner join, left join, outer join, cross join, self join, on vs where]
updated: 2026-10-10
quiz:
  - q: A LEFT JOIN returns which rows?
    options:
      - Only rows that match in both tables
      - Every row from the left table, with NULLs where the right table has no match
      - Every row from the right table
      - Every combination of rows from both tables
    answer: 1
    explain: The left table is preserved in full. Unmatched right-side columns come back as NULL, which is exactly how you find "customers with no orders".
  - q: Why does putting a right-table condition in WHERE break a LEFT JOIN?
    options:
      - It is a syntax error
      - WHERE runs after the join and discards the NULL-filled rows, turning it into an INNER JOIN
      - It makes the query slower but returns the same rows
      - It only affects MySQL
    answer: 1
    explain: "The join produces NULLs for unmatched rows; `WHERE o.status = 'paid'` then evaluates to NULL for those rows and drops them. Move the condition into the ON clause to keep them."
  - q: Joining a 1,000-row table to a 1,000-row table on a non-unique key can return how many rows?
    options:
      - At most 1,000
      - Exactly 1,000
      - Up to 1,000,000
      - Always 2,000
    answer: 2
    explain: Rows multiply. If every row on each side shares the same key value, you get the full cross product. This is the usual reason a SUM after a join is inflated.
faq:
  - q: Is RIGHT JOIN ever necessary?
    a: Not really. Any RIGHT JOIN can be written as a LEFT JOIN with the table order swapped, and most teams standardise on LEFT because it reads in the direction people think.
  - q: Does the order of tables in an INNER JOIN matter?
    a: Not for the result — INNER JOIN is commutative. The planner reorders them anyway based on statistics. For LEFT JOIN, order absolutely matters.
---

A join combines rows from two tables by matching a condition. The thing to hold on to is that a join is fundamentally about **row counts**: which rows survive, and how many copies of each.

Working data for this chapter:

```sql
-- customers          -- orders
id | name             id | customer_id | amount
1  | Ada              10 | 1           | 2400
2  | Alan             11 | 1           |  900
3  | Grace            12 | 2           | 1500
```

Ada has two orders, Alan has one, Grace has none.

## INNER JOIN — only matches

```sql
SELECT c.name, o.amount
FROM customers c
INNER JOIN orders o ON o.customer_id = c.id;
```

```output
name   amount
Ada     2400
Ada      900
Alan    1500
```

Three rows. Grace vanished — she has no matching order. Ada appears twice, because she has two.

:::note
`INNER` is the default; `JOIN` alone means `INNER JOIN`. Writing it out is still worth the five characters when a query mixes join types.
:::

## LEFT JOIN — keep everything on the left

```sql
SELECT c.name, o.amount
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id;
```

```output
name   amount
Ada     2400
Ada      900
Alan    1500
Grace   NULL
```

Grace is back, with NULL where her order data would be. This is the standard tool for "all X, with their Y if any".

Combined with an `IS NULL` test it answers the "which ones have none?" question:

```sql
SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;        -- customers who have never ordered
```

```output
name
Grace
```

## The three mistakes

### 1. A right-table filter in WHERE silently un-does the LEFT JOIN

```sql
-- WRONG: this is now effectively an INNER JOIN
SELECT c.name, o.amount
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.amount > 1000;

-- RIGHT: condition belongs to the join
SELECT c.name, o.amount
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.amount > 1000;
```

Grace's row has `o.amount = NULL`. `NULL > 1000` is NULL, not true, so `WHERE` discards her — exactly what the LEFT JOIN was there to prevent.

**Rule:** conditions on the *preserved* table go in `WHERE`; conditions on the *optional* table go in `ON`.

### 2. Fan-out inflates aggregates

```sql
-- WRONG: order_items multiplies the customer rows before SUM sees them
SELECT c.name, SUM(o.amount), SUM(i.quantity)
FROM customers c
JOIN orders o      ON o.customer_id = c.id
JOIN order_items i ON i.order_id    = o.id
GROUP BY c.name;
```

If an order has three items, that order's `amount` is counted three times. The query runs, returns a number, and the number is wrong — the worst failure mode there is.

Aggregate each branch separately before joining:

```sql
SELECT c.name, o.total, i.items
FROM customers c
LEFT JOIN (SELECT customer_id, SUM(amount) AS total
           FROM orders GROUP BY customer_id) o ON o.customer_id = c.id
LEFT JOIN (SELECT o.customer_id, SUM(i.quantity) AS items
           FROM orders o JOIN order_items i ON i.order_id = o.id
           GROUP BY o.customer_id) i ON i.customer_id = c.id;
```

:::danger
Whenever a join is followed by `SUM` or `COUNT`, ask: can the join produce more than one row per entity? If yes, the aggregate is inflated. This is the most common source of wrong-but-plausible numbers in business reporting.
:::

### 3. A missing ON clause

```sql
SELECT * FROM customers, orders;     -- CROSS JOIN: 3 × 3 = 9 rows
```

The old comma syntax makes this easy to do by accident, especially with four or five tables. Explicit `JOIN ... ON` makes a forgotten condition a syntax error rather than a silent cross product.

## FULL OUTER JOIN

Keeps unmatched rows from both sides:

```sql
SELECT c.name, o.amount
FROM customers c
FULL OUTER JOIN orders o ON o.customer_id = c.id;
```

Useful for reconciliation — "what is in system A but not B, and vice versa". Not supported by MySQL or older SQLite; emulate with `LEFT JOIN ... UNION ALL ... RIGHT-side-only`.

## Self join

A table joined to itself, which needs aliases to disambiguate:

```sql
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id;
```

`LEFT` matters here: the CEO has no manager, and an INNER join would delete them from the org chart.

## Quick reference

| Join | Keeps |
|---|---|
| `INNER JOIN` | Rows matching in both |
| `LEFT JOIN` | All left rows + matches |
| `RIGHT JOIN` | All right rows + matches |
| `FULL OUTER JOIN` | All rows from both |
| `CROSS JOIN` | Every combination |

## What to remember

- Joins change row counts; fan-out breaks aggregates silently.
- Filter the optional table in `ON`, the preserved table in `WHERE`.
- `LEFT JOIN ... WHERE right.id IS NULL` is the "has none" idiom.
- Always write an explicit `ON` — a forgotten condition should be an error, not a cross product.
