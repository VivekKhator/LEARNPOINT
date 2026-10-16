---
title: Indexes and Query Performance
description: What an index actually is, when the planner can and cannot use one, how to read a query plan, and the trade-off indexes impose on writes.
keywords: [sql index, b-tree, query plan, explain, composite index, covering index, sargable]
updated: 2026-10-11
quiz:
  - q: Why does `WHERE UPPER(email) = 'A@B.COM'` usually ignore an index on `email`?
    options:
      - Indexes do not work on text
      - The index stores the raw column values, not the result of the function, so the engine cannot look the computed value up
      - UPPER is slow
      - It only affects MySQL
    answer: 1
    explain: Wrapping a column in a function makes the predicate non-sargable. Either index the expression itself, or store a normalised copy of the column.
  - q: You have an index on `(country, city)`. Which query can use it?
    options:
      - "WHERE city = 'Pune'"
      - "WHERE country = 'IN'"
      - "WHERE city = 'Pune' AND population > 1000"
      - None of them
    answer: 1
    explain: A composite index is usable left-to-right. `country` alone works; `city` alone does not, because it is the second column of a sorted pair.
  - q: What is the main cost of adding an index?
    options:
      - It makes SELECTs slower
      - Every INSERT, UPDATE and DELETE must also update the index, and it consumes disk
      - It locks the table permanently
      - There is no cost
    answer: 1
    explain: Indexes trade write throughput and storage for read speed. A table with twelve indexes is usually a table nobody has audited.
faq:
  - q: Should I index every column?
    a: No. Each index slows writes and takes space, and the planner can only use one or two per table scan anyway. Index the columns that appear in WHERE, JOIN and ORDER BY on queries that actually run often.
  - q: Does a primary key create an index?
    a: Yes, automatically, and it is unique. Foreign keys do not get one automatically in most databases — and an unindexed foreign key is a classic cause of slow joins and slow cascading deletes.
---

An index is a separate, sorted data structure that lets the database find rows without reading the whole table. Almost all of them are B-trees: balanced, sorted, with O(log n) lookup.

The trade is simple and absolute: **reads get faster, writes get slower, disk usage goes up.**

## Without and with

```sql
SELECT * FROM orders WHERE customer_id = 42;
```

Without an index, the database performs a **sequential scan**: read every row, keep the matches. On 10 million rows that is 10 million comparisons.

```sql
CREATE INDEX idx_orders_customer ON orders (customer_id);
```

Now it descends a tree perhaps 4 levels deep and jumps straight to the matching entries — roughly 24 comparisons instead of 10 million.

:::note
For a *small* table, a sequential scan is genuinely faster, and a good planner will choose it. Reading 500 rows sequentially beats a tree descent plus random I/O per hit. Trust the plan over your intuition.
:::

## Sargability: when the planner cannot use an index

A predicate is **sargable** when it can be satisfied by searching the index. These break it:

```sql
-- NOT sargable: column wrapped in a function
WHERE YEAR(placed_on) = 2026
WHERE UPPER(email) = 'A@B.COM'
WHERE amount + 10 > 100

-- Sargable rewrites
WHERE placed_on >= '2026-01-01' AND placed_on < '2027-01-01'
WHERE email = 'a@b.com'          -- store it lowercased on write
WHERE amount > 90
```

Leading wildcards are the other common case:

```sql
WHERE name LIKE 'Ada%'    -- can use an index: it is a range scan
WHERE name LIKE '%Ada'    -- cannot: no prefix to seek on
```

A trailing `%` is a prefix, and prefixes are exactly what a sorted structure is good at. A leading `%` means "could start anywhere", which needs a full scan or a specialised index (trigram, full-text).

:::tip
If you need case-insensitive lookups, either store a normalised column and index that, or create an expression index: `CREATE INDEX ON users (LOWER(email));` — which then makes `WHERE LOWER(email) = ...` sargable after all.
:::

## Composite indexes and column order

```sql
CREATE INDEX idx_orders_cust_date ON orders (customer_id, placed_on);
```

Think of it as a phone book sorted by surname, then first name. You can find all "Khator"s instantly, and "Khator, Vivek" instantly. You cannot efficiently find everyone named "Vivek".

| Query | Uses the index? |
|---|---|
| `WHERE customer_id = 1` | Yes |
| `WHERE customer_id = 1 AND placed_on > '2026-01-01'` | Yes, fully |
| `WHERE placed_on > '2026-01-01'` | No — not the leading column |
| `ORDER BY customer_id, placed_on` | Yes, sort avoided entirely |

**Rule of thumb:** equality columns first, then the range or sort column.

A **covering index** includes every column a query needs, so the table itself is never touched:

```sql
CREATE INDEX idx_cover ON orders (customer_id, placed_on, amount);
-- SELECT amount FROM orders WHERE customer_id = 1 → index-only scan
```

This is the main practical reason to avoid `SELECT *`: adding one unneeded column can turn an index-only scan into a table lookup per row.

## Reading a query plan

```sql
EXPLAIN ANALYZE
SELECT c.name, SUM(o.amount)
FROM customers c JOIN orders o ON o.customer_id = c.id
WHERE c.city = 'Pune'
GROUP BY c.name;
```

You do not need to understand everything in the output. Look for four things:

1. **Seq Scan on a large table** where you expected an index. Usually a sargability problem or a missing index.
2. **Rows estimated vs actual.** A planner expecting 10 rows and getting 100,000 will have chosen a bad strategy. Fix with fresher statistics (`ANALYZE`).
3. **Nested Loop over a big input.** Fine for small outer inputs, catastrophic for large ones.
4. **Sort or Hash spilling to disk.** Means the working set exceeded memory.

`EXPLAIN` alone shows the plan; `EXPLAIN ANALYZE` actually runs the query and shows real timings. Use the latter on anything you are tuning — and remember it executes the statement, so be careful with `UPDATE`.

## The write cost

Every index must be kept in sync. An `INSERT` into a table with six indexes does seven writes. A bulk load into a heavily indexed table can be ten times slower than into a bare one — which is why the standard bulk-load recipe is: drop the indexes, load, rebuild.

:::warning
Indexes that are never used are pure cost. Most databases expose usage statistics (`pg_stat_user_indexes` in PostgreSQL). Auditing those once a year is one of the highest-return hours available to anyone running a database.
:::

## A practical checklist

1. Index foreign keys — they are not indexed automatically.
2. Index columns used in `WHERE`, `JOIN` and `ORDER BY` on your frequent queries.
3. Put equality columns before range columns in composite indexes.
4. Keep predicates sargable: no functions on the indexed column.
5. Measure with `EXPLAIN ANALYZE` before and after. An index that does not change the plan is not helping.
6. Delete indexes nothing uses.

## What to remember

- An index is a sorted structure; it trades write speed and disk for read speed.
- Functions on columns and leading wildcards defeat indexes.
- Composite indexes work left-to-right — order the columns deliberately.
- `EXPLAIN ANALYZE` is the only reliable way to know; intuition about query speed is frequently wrong.
