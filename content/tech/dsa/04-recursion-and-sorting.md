---
title: Recursion and Sorting
description: How to write a recursion that terminates, why merge sort is O(n log n), and what your language's built-in sort is actually doing.
keywords: [recursion, base case, memoisation, merge sort, quicksort, timsort, divide and conquer, stable sort]
updated: 2026-10-08
quiz:
  - q: What must every recursive function have?
    options:
      - A loop
      - A base case, and a recursive step that moves measurably toward it
      - A global variable
      - At least two parameters
    answer: 1
    explain: Without a base case it never stops. Without progress toward it, the base case is never reached — both end in a stack overflow.
  - q: Why is merge sort O(n log n)?
    options:
      - It compares every pair
      - There are log n levels of halving, and each level does O(n) work merging
      - It uses a hash table
      - It is actually O(n²)
    answer: 1
    explain: Halving gives the log n depth; merging all the pieces at each level touches every element once, giving O(n) per level.
  - q: What does it mean for a sort to be stable?
    options:
      - It never crashes
      - Equal elements keep their original relative order
      - It always runs in the same time
      - It uses no extra memory
    answer: 1
    explain: Stability lets you sort by one key and then another to get a reliable multi-level ordering. Python's sort and Java's object sort are stable; C's qsort is not.
faq:
  - q: Is recursion slower than iteration?
    a: Usually slightly, because each call allocates a stack frame, and Python in particular has no tail-call optimisation. Use recursion where it makes the code clearly simpler — trees, graphs, divide and conquer — and a loop where a loop is natural.
  - q: Should I implement quicksort in real code?
    a: No. Use the built-in sort — it is better tested and tuned than anything you will write. Learn the algorithms to understand complexity and to answer interview questions.
---

## Recursion

A recursive function calls itself on a smaller version of the problem. Two parts are mandatory:

1. A **base case** that returns without recursing.
2. A **recursive step** that measurably approaches the base case.

```python
def factorial(n):
    if n <= 1:          # base case
        return 1
    return n * factorial(n - 1)    # recursive step, n gets smaller
```

The call stack unwinds in reverse: `factorial(4)` waits for `factorial(3)`, which waits for `factorial(2)`, and so on until the base case returns and the multiplications resolve back up.

:::warning
Each pending call occupies a stack frame. Python's default recursion limit is around 1,000, so recursing over a million-element list will crash. Depth proportional to the *input size* is a red flag; depth proportional to the *log* of it (as in a balanced tree) is fine.
:::

### The naive recursion trap

```python
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

This is O(2ⁿ) — `fib(40)` makes over a billion calls, because the same subproblems are recomputed endlessly. Caching fixes it completely:

```python
from functools import cache

@cache
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

Now each `n` is computed once: O(n) time, O(n) space. This is **memoisation**, and the gap between the two versions — a billion operations versus forty — is the single most dramatic demonstration of why complexity analysis matters.

### Recursion that fits the data

Recursion is at its best when the data is itself recursive:

```python
def total_size(node):
    """Sum file sizes in a nested directory structure."""
    if node["type"] == "file":
        return node["size"]
    return sum(total_size(child) for child in node["children"])
```

Written iteratively this needs an explicit stack and is longer and harder to follow.

## Sorting

### Merge sort — the clean O(n log n)

Divide, sort each half, merge:

```python
def merge_sort(items):
    if len(items) <= 1:
        return items

    middle = len(items) // 2
    left = merge_sort(items[:middle])
    right = merge_sort(items[middle:])

    merged, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:        # <= keeps it STABLE
            merged.append(left[i]); i += 1
        else:
            merged.append(right[j]); j += 1
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged
```

Why O(n log n): halving gives `log n` levels, and merging at each level touches every element once — O(n) per level. Guaranteed, not average. The cost is O(n) extra memory for the merged lists.

### Quicksort — faster in practice, worse in theory

Pick a pivot, partition into smaller and larger, recurse:

```python
def quicksort(items):
    if len(items) <= 1:
        return items
    pivot = items[len(items) // 2]
    smaller = [x for x in items if x < pivot]
    equal   = [x for x in items if x == pivot]
    larger  = [x for x in items if x > pivot]
    return quicksort(smaller) + equal + quicksort(larger)
```

Average O(n log n) and typically faster than merge sort because a good in-place implementation has excellent cache behaviour and no allocation. Worst case O(n²), when the pivot is consistently the smallest or largest element — which is exactly what happens on already-sorted input with a naive first-element pivot. Real implementations pick the median of three, or randomise.

### Comparison

| Algorithm | Average | Worst | Space | Stable |
|---|---|---|---|---|
| Bubble sort | O(n²) | O(n²) | O(1) | Yes |
| Insertion sort | O(n²) | O(n²) | O(1) | Yes |
| Merge sort | O(n log n) | O(n log n) | O(n) | Yes |
| Quicksort | O(n log n) | O(n²) | O(log n) | No |
| Heapsort | O(n log n) | O(n log n) | O(1) | No |
| Timsort | O(n log n) | O(n log n) | O(n) | Yes |

Insertion sort is O(n²) and still useful: it is O(n) on nearly-sorted data and beats everything else below about 20 elements.

### What your language actually runs

Python's `sorted()` and Java's `Arrays.sort()` for objects use **Timsort** — a hybrid that finds already-sorted runs in the input, sorts short pieces with insertion sort, and merges. On real data, which is often partly ordered, it frequently beats a textbook O(n log n) sort outright. It is stable, which is why this works:

```python
# Sort by team, then by score descending, by sorting twice
people.sort(key=lambda p: -p.score)
people.sort(key=lambda p: p.team)      # stable: ties keep the score order
```

Or in one pass with a tuple key:

```python
people.sort(key=lambda p: (p.team, -p.score))
```

:::tip
Never write your own sort for production. The built-in is better tested, better tuned and handles edge cases you have not thought of. Learn these algorithms to reason about cost, not to use them.
:::

## What to remember

- Every recursion needs a base case and measurable progress toward it.
- Memoisation turns exponential recursion into linear — `@cache` is one line.
- Merge sort guarantees O(n log n) at O(n) memory; quicksort averages the same in place but degrades to O(n²).
- Stability is what lets you sort by multiple keys in sequence.
