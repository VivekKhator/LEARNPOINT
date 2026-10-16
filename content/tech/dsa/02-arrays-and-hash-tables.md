---
title: Arrays and Hash Tables
description: The two structures behind most code — contiguous memory versus hashing, what each is fast at, and the patterns built on them.
keywords: [array, dynamic array, hash table, hash map, collision, two pointers, sliding window, prefix sum]
updated: 2026-10-07
quiz:
  - q: Why is array indexing O(1)?
    options:
      - Arrays are sorted
      - Elements are the same size in contiguous memory, so the address is a single arithmetic calculation
      - Arrays use hashing
      - It is actually O(n)
    answer: 1
    explain: "address = base + index × element_size. No searching is involved at any size."
  - q: What happens when two keys hash to the same bucket?
    options:
      - One key is lost
      - A collision — resolved by chaining entries in that bucket or probing for the next free slot
      - The table crashes
      - The hash is recomputed until unique
    answer: 1
    explain: Collisions are normal and expected. They are why the O(1) guarantee is an average rather than a worst case.
  - q: Which problem is the sliding-window pattern for?
    options:
      - Sorting an array
      - Finding the best contiguous subarray of a given or variable length
      - Searching a sorted array
      - Reversing a linked list
    answer: 1
    explain: The window keeps a running result while two indices move forward, turning an O(n²) recheck into a single O(n) pass.
faq:
  - q: When does a hash table degrade to O(n)?
    a: When many keys collide — either because the table is overloaded or because the hash function is poor for your key distribution. Language implementations randomise hashes to prevent an attacker from engineering collisions deliberately.
  - q: Why can a list not be a dictionary key?
    a: Keys must hash to a stable value. A list can change after insertion, which would move its correct bucket and make it unfindable. Immutability is what makes a key safe.
---

Nearly every program is built on two structures. Arrays give you order and position; hash tables give you lookup by name. Knowing the cost of each operation is most of what "knowing data structures" means in practice.

## Arrays

An array stores elements of equal size in one contiguous block. The address of element `i` is `base + i × size`, so reaching any element is a single calculation regardless of length.

```python
items = [10, 20, 30, 40]
items[2]            # O(1) — arithmetic, not search
```

What costs more is **changing the shape**:

| Operation | Cost | Why |
|---|---|---|
| Read/write by index | O(1) | Direct address |
| Append | O(1) amortised | Occasional resize-and-copy |
| Insert/delete at the front | O(n) | Everything shifts |
| Search unsorted | O(n) | No shortcut |
| Search sorted | O(log n) | Binary search |

Contiguity also buys **cache locality**: when the CPU fetches one element it pulls in the neighbours too, so a linear scan over an array is far faster than the same scan over a structure of scattered nodes — often by 5–10×, which Big O does not show.

## Hash tables

A hash table turns a key into an array index:

1. Hash the key to an integer.
2. Take that integer modulo the number of buckets.
3. Store the entry in that bucket.

Lookup repeats the same calculation, which is why it is O(1) on average rather than a search.

```python
prices = {"apple": 40, "banana": 10}
prices["apple"]       # hash("apple") → bucket → entry
```

**Collisions** are when two keys land in the same bucket. Two standard fixes: *chaining* (the bucket holds a small list) and *open addressing* (probe forward for the next free slot). Either way, a well-distributed hash keeps chains short. If the table gets too full, it is resized and every entry rehashed — an occasional O(n) operation, same amortisation argument as the array.

:::note
Worst case for a hash table is O(n), when every key collides. In practice this is only reachable with an adversarial input, which is why runtimes randomise their hash seeds per process.
:::

## The lookup-table pattern

The single most useful application: convert a repeated search into a lookup.

```python
# O(n²) — a scan inside a loop
def two_sum_slow(numbers, target):
    for i, a in enumerate(numbers):
        for j in range(i + 1, len(numbers)):
            if a + numbers[j] == target:
                return i, j

# O(n) — remember what we have seen
def two_sum(numbers, target):
    seen = {}                       # value → index
    for i, value in enumerate(numbers):
        complement = target - value
        if complement in seen:
            return seen[complement], i
        seen[value] = i
    return None
```

One pass, one dictionary. This "remember what you have seen" shape solves an enormous number of problems: duplicates, anagram grouping, first non-repeating element, subarray sums.

## Two pointers

When an array is sorted, two indices moving toward each other replace a nested loop:

```python
def pair_sum_sorted(numbers, target):
    left, right = 0, len(numbers) - 1
    while left < right:
        current = numbers[left] + numbers[right]
        if current == target:
            return left, right
        if current < target:
            left += 1          # need a bigger sum
        else:
            right -= 1         # need a smaller sum
    return None
```

O(n) time, O(1) space — better than the hash-table version on memory, at the cost of requiring sorted input.

## Sliding window

For problems about a contiguous run of elements, keep a window and move its edges instead of recomputing:

```python
def max_sum_window(numbers, k):
    """Largest sum of any k consecutive elements. O(n)."""
    window = sum(numbers[:k])
    best = window
    for i in range(k, len(numbers)):
        window += numbers[i] - numbers[i - k]   # add one, drop one
        best = max(best, window)
    return best
```

The naive version recomputes each window from scratch — O(n·k). The sliding version does constant work per step.

The variable-size variant grows the right edge and shrinks the left when a constraint breaks:

```python
def longest_unique(text):
    """Length of the longest substring with no repeated character."""
    last_seen = {}
    start = best = 0
    for i, char in enumerate(text):
        if char in last_seen and last_seen[char] >= start:
            start = last_seen[char] + 1     # shrink past the duplicate
        last_seen[char] = i
        best = max(best, i - start + 1)
    return best
```

## Prefix sums

When many range-sum queries hit the same array, precompute once:

```python
def build_prefix(numbers):
    totals = [0]
    for n in numbers:
        totals.append(totals[-1] + n)
    return totals

prefix = build_prefix([3, 1, 4, 1, 5])
# sum of numbers[1:4] == prefix[4] - prefix[1]
```

O(n) to build, then O(1) per query instead of O(n).

## Choosing

| Need | Structure |
|---|---|
| Order, position, iteration | Array |
| Lookup by key | Hash table |
| Membership testing | Hash set |
| Counting | Hash table (`Counter`) |
| Sorted order with fast insert | Balanced tree / heap |

## What to remember

- Arrays: O(1) by index, O(n) to insert at the front, excellent cache behaviour.
- Hash tables: O(1) average, O(n) worst, keys must be immutable.
- "Remember what you have seen" in a dictionary converts O(n²) to O(n).
- Two pointers, sliding window and prefix sums cover a large share of array problems.
