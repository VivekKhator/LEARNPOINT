---
title: Python Lists and Tuples
description: Ordered collections — how to add, remove, slice, sort and copy them, what each operation costs, and when a tuple is the better choice.
keywords: [python list, python tuple, append, slice, sort, list methods, time complexity]
updated: 2026-10-12
quiz:
  - q: What is the cost of `my_list.insert(0, x)` on a list of n items?
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"]
    answer: 2
    explain: Inserting at the front shifts every existing element one position right. Use `collections.deque` if you need fast insertion at both ends.
  - q: Which of these can be used as a dictionary key?
    options: ["[1, 2]", "(1, 2)", "{1, 2}", "{'a': 1}"]
    answer: 1
    explain: Keys must be hashable, which in practice means immutable. A tuple of immutable values qualifies; a list, set or dict does not.
  - q: What does `sorted(items)` return compared with `items.sort()`?
    options:
      - They are identical
      - "`sorted` returns a new list; `.sort()` sorts in place and returns None"
      - "`.sort()` returns a new list; `sorted` sorts in place"
      - "`sorted` only works on numbers"
    answer: 1
    explain: "The in-place methods (`sort`, `reverse`, `append`) return None. Writing `items = items.sort()` sets items to None — a classic one-line bug."
faq:
  - q: Is a tuple faster than a list?
    a: Marginally, and the difference almost never decides anything. Choose a tuple because the contents should not change, not for speed.
  - q: How do I remove duplicates but keep the order?
    a: "`list(dict.fromkeys(items))`. Dict keys are unique and insertion-ordered, so this works in one pass. `list(set(items))` also dedupes but loses the order."
---

A **list** is a mutable, ordered sequence. A **tuple** is the same thing frozen. Most of the time you want a list; the cases where you want a tuple are specific and worth recognising.

## Creating and accessing

```python
scores = [91, 88, 76, 95]

print(scores[0])     # 91
print(scores[-1])    # 95
print(scores[1:3])   # [88, 76]
print(len(scores))   # 4
print(95 in scores)  # True
```

Indexing, slicing and `in` work exactly as they do on strings — one mental model covers both.

## Adding and removing

```python
items = ["a", "b"]

items.append("c")          # ['a', 'b', 'c']        — add one, at the end
items.extend(["d", "e"])   # ['a','b','c','d','e']  — add many
items.insert(0, "z")       # ['z','a',...]          — add at a position
items.remove("b")          # delete by VALUE (first match)
last = items.pop()         # remove and return the last item
first = items.pop(0)       # remove and return by index
items.clear()              # empty it
```

:::warning
`append` and `extend` are not interchangeable. `items.append(["d", "e"])` adds **one** element that happens to be a list, giving a nested structure. `extend` adds the elements individually.
:::

## What the operations cost

This table explains most "why is my script slow" questions:

| Operation | Cost | Why |
|---|---|---|
| `lst[i]` | O(1) | Direct offset into contiguous memory |
| `lst.append(x)` | O(1) amortised | Occasionally reallocates, usually not |
| `lst.pop()` | O(1) | Nothing moves |
| `lst.insert(0, x)` | O(n) | Everything shifts right |
| `lst.pop(0)` | O(n) | Everything shifts left |
| `x in lst` | O(n) | Linear scan |
| `lst.sort()` | O(n log n) | Timsort |

Two consequences worth internalising:

- **Building a queue out of a list is a trap.** `pop(0)` in a loop is O(n²). Use `collections.deque`, which pops from either end in O(1).
- **Membership testing in a loop is a trap.** `if x in big_list` inside a loop over another list is O(n·m). Convert to a `set` first and the test becomes O(1).

```python
# Slow for large inputs
matches = [x for x in a if x in b]

# Fast
b_set = set(b)
matches = [x for x in a if x in b_set]
```

## Sorting

```python
scores = [91, 88, 76, 95]

print(sorted(scores))                  # new list, ascending
print(sorted(scores, reverse=True))    # descending
scores.sort()                          # in place, returns None

people = [("Ada", 36), ("Grace", 45), ("Alan", 41)]
print(sorted(people, key=lambda p: p[1]))        # by age
print(sorted(people, key=lambda p: (-p[1], p[0])))  # age desc, then name
```

```output
[76, 88, 91, 95]
```

The `key` function is called once per element and the results are sorted. Returning a tuple from `key` gives you multi-level sorting, and negating a number reverses just that level.

:::danger
`scores = scores.sort()` sets `scores` to `None`. In-place methods return `None` by design, so that you cannot accidentally chain them and lose the original.
:::

## Copying

```python
original = [[1, 2], [3, 4]]

shallow = original.copy()      # or original[:] or list(original)
shallow[0].append(99)
print(original)                # [[1, 2, 99], [3, 4]]  ← inner list is shared

import copy
deep = copy.deepcopy(original) # fully independent
```

A shallow copy duplicates the outer list only. If the elements are themselves mutable, both lists point at the same inner objects.

## Unpacking

```python
first, second, *rest = [1, 2, 3, 4, 5]
print(first, second, rest)     # 1 2 [3, 4, 5]

a, b = b, a                    # swap, no temporary needed
```

The starred name absorbs however many items are left over, including none.

## When to use a tuple

```python
point = (3, 4)          # a fixed-size record, not a collection
coords = {(0, 0): "origin", (3, 4): "corner"}   # usable as a dict key
```

Reach for a tuple when:

1. **The length is part of the meaning.** A 2-D point always has exactly two components. A list of scores has however many scores there are.
2. **You need a dict key or set member.** Lists are unhashable because they can change; tuples of immutable values are hashable.
3. **You want to signal "do not modify this".** Returning a tuple tells the caller the result is a snapshot.

For named fields, `collections.namedtuple` or a `dataclass` beats a bare tuple — `point.x` reads better than `point[0]` and survives someone adding a third field.

## What to remember

- Lists are mutable and ordered; indexing is O(1) but front insertion is O(n).
- Convert to a `set` before repeated membership tests.
- In-place methods return `None` — never assign their result.
- `copy()` is shallow; nested mutables are still shared.
- Use tuples for fixed-shape records and anything that must be hashable.
