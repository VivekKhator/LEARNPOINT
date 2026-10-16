---
title: Big O Notation
description: How to estimate the cost of code before running it — the common growth classes, how to read them off a loop, and where the notation misleads.
keywords: [big o notation, time complexity, space complexity, o(n), o(log n), amortised analysis]
updated: 2026-10-07
quiz:
  - q: What is the time complexity of two sequential (not nested) loops over the same n-element array?
    options: ["O(n²)", "O(2n), which simplifies to O(n)", "O(log n)", "O(1)"]
    answer: 1
    explain: Sequential loops add; nested loops multiply. Constant factors are dropped, so O(2n) is written O(n).
  - q: Why is binary search O(log n)?
    options:
      - It checks every second element
      - Each comparison halves the remaining range, so the number of steps is how many times n can be halved
      - It uses a hash table
      - It is actually O(n)
    answer: 1
    explain: Halving 1,000,000 items reaches one in about 20 steps. That is why logarithmic algorithms barely slow down as data grows.
  - q: An algorithm is O(n²) but n is always under 20. What follows?
    options:
      - It must be rewritten
      - Nothing — at that size the constant factors dominate and the simpler algorithm is likely faster
      - It will crash
      - Big O does not apply
    answer: 1
    explain: Big O describes growth, not speed at a specific size. Insertion sort beats quicksort on tiny inputs, which is why real sort implementations switch to it below a threshold.
faq:
  - q: Is O(n log n) much worse than O(n)?
    a: For a million items, log₂n is about 20, so n log n is roughly 20× n. Noticeable but rarely fatal. The dangerous jump is to O(n²), which at a million items is 10¹² operations.
  - q: Does Big O account for memory?
    a: Space complexity uses the same notation for memory instead of time. An algorithm can be O(n) in time and O(1) in space, which is often the better trade.
---

Big O describes how an algorithm's cost **grows** as the input grows. It deliberately ignores constant factors and hardware, because those change and the growth rate does not.

## The classes, in order

| Notation | Name | n = 1,000 | n = 1,000,000 |
|---|---|---|---|
| O(1) | Constant | 1 | 1 |
| O(log n) | Logarithmic | ~10 | ~20 |
| O(n) | Linear | 1,000 | 1,000,000 |
| O(n log n) | Linearithmic | ~10,000 | ~20,000,000 |
| O(n²) | Quadratic | 1,000,000 | 10¹² |
| O(2ⁿ) | Exponential | unusable | unusable |

The row that matters most in practice is O(n²). At a thousand items it is a million operations — fine. At a million items it is a trillion — hours or days. Most "the script never finished" stories are an accidental O(n²).

## Reading it off the code

**One loop over n → O(n):**

```python
def total(items):          # O(n) time, O(1) extra space
    result = 0
    for item in items:
        result += item
    return result
```

**Nested loops → multiply:**

```python
def has_duplicate(items):  # O(n²)
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] == items[j]:
                return True
    return False
```

**Sequential loops → add, then simplify:**

```python
def summarise(items):      # O(n) + O(n) = O(2n) = O(n)
    biggest = max(items)
    smallest = min(items)
    return biggest, smallest
```

**Halving → O(log n):**

```python
def binary_search(sorted_items, target):   # O(log n)
    low, high = 0, len(sorted_items) - 1
    while low <= high:
        mid = (low + high) // 2
        if sorted_items[mid] == target:
            return mid
        if sorted_items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
```

Each iteration discards half the remaining range. Starting from a million, you reach one in about 20 steps.

## The rules

1. **Drop constants.** O(2n) → O(n). A 2× speedup is real but does not change how the cost scales.
2. **Drop lower-order terms.** O(n² + n) → O(n²). At large n, the square dominates completely.
3. **Different inputs get different letters.** Looping over list A inside a loop over list B is O(a·b), not O(n²).

## The trade-off you will actually make

Here is the same problem solved two ways:

```python
# O(n²) — no extra memory
def has_duplicate(items):
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] == items[j]:
                return True
    return False

# O(n) time, O(n) space
def has_duplicate_fast(items):
    seen = set()
    for item in items:
        if item in seen:
            return True
        seen.add(item)
    return False
```

The second version buys time with memory. That exchange — a hash table to turn a repeated search into a lookup — is the single most common optimisation in practical programming.

## Where Big O misleads

:::warning
Big O is an asymptotic statement. It says nothing about:

- **Small inputs.** O(n²) insertion sort beats O(n log n) quicksort below roughly 20 elements. Production sorts exploit this.
- **Constant factors.** Two O(n) algorithms can differ 50× in real time.
- **Memory hierarchy.** A linear scan of a contiguous array often beats a "better" pointer-chasing structure, because the array is cache-friendly and the pointers are not.
- **The average case.** Quicksort is O(n²) in the worst case and O(n log n) in practice.
:::

Big O tells you which algorithms *cannot possibly* work at your scale. Within the survivors, measure.

## Amortised cost

`list.append` in Python is described as O(1) *amortised*. Most appends are free; occasionally the list runs out of room, allocates a larger block and copies everything, which is O(n). Because the capacity grows multiplicatively, those expensive copies are rare enough that the average cost per append stays constant.

"Amortised O(1)" means cheap on average, with an occasional expensive operation — a distinction that matters for latency-sensitive code and not much else.

## Common costs worth memorising

| Operation | Cost |
|---|---|
| Array index | O(1) |
| Hash table get/set | O(1) average |
| Append to a dynamic array | O(1) amortised |
| Insert at the front of an array | O(n) |
| Search an unsorted array | O(n) |
| Binary search a sorted array | O(log n) |
| Balanced tree insert/search | O(log n) |
| Comparison sort | O(n log n) |

## What to remember

- Nested loops multiply, sequential loops add, constants are dropped.
- O(n²) is the cliff edge — it is the usual cause of code that never finishes.
- Trading memory for time with a hash table is the most common real optimisation.
- Big O rules out; measurement decides.
