---
title: Python Dictionaries and Sets
description: Hash-based collections — constant-time lookup, the safe ways to read a missing key, counting and grouping patterns, and set algebra.
keywords: [python dictionary, dict get, setdefault, defaultdict, Counter, python set, hashable]
updated: 2026-10-13
quiz:
  - q: What does `prices.get("mango")` return when the key is absent?
    options: ["KeyError", "None", "0", "An empty string"]
    answer: 1
    explain: "`get` returns None by default, or whatever second argument you pass. Square-bracket access raises KeyError instead."
  - q: Why is `x in my_set` faster than `x in my_list` for large collections?
    options:
      - Sets are stored sorted, so a binary search is used
      - A set hashes x and jumps straight to a bucket — O(1) rather than scanning
      - Sets are kept in faster memory
      - They are the same speed
    answer: 1
    explain: Hashing gives direct addressing. A list has no choice but to compare against each element in turn.
  - q: Which of these cannot be an element of a set?
    options: ["(1, 2)", "'text'", "[1, 2]", "42"]
    answer: 2
    explain: Set members must be hashable. A list is mutable, so its hash could change while it sits in the set — Python forbids it outright.
faq:
  - q: Are dictionaries ordered?
    a: Yes. Since Python 3.7 dicts preserve insertion order as a language guarantee. They are still hash tables; the order is maintained alongside, not by sorting.
  - q: When should I use `defaultdict` instead of `dict`?
    a: When every missing key should start from the same empty value — a list to append to, an int to add to. For anything more subtle, `setdefault` or an explicit check is clearer.
---

Dictionaries and sets are both built on hashing, which is what buys them constant-time lookup. A `dict` maps keys to values; a `set` is the same machinery with the values thrown away.

## Dictionary basics

```python
prices = {"apple": 40, "banana": 10, "cherry": 120}

print(prices["apple"])        # 40
prices["date"] = 90           # insert
prices["apple"] = 45          # update
del prices["banana"]          # remove
print(len(prices))            # 3
print("cherry" in prices)     # True — tests KEYS, not values
```

Keys must be **hashable**, which in practice means immutable: strings, numbers, and tuples of immutable things. Values can be anything.

## Reading a key that might not be there

This is where most dictionary bugs live. There are four tools and they are not interchangeable:

```python
prices["mango"]                  # KeyError — crashes
prices.get("mango")              # None
prices.get("mango", 0)           # 0 — your own default
prices.setdefault("mango", 0)    # inserts 0 if absent, then returns it
```

Use `[]` when a missing key means the program is broken and should say so loudly. Use `get` when absence is a normal case you are prepared to handle.

:::danger
`get` with a default does **not** insert the key. `setdefault` does. If you write `prices.get("mango", 0) + 1` expecting the dict to grow, nothing happens.
:::

## Iterating

```python
for name in prices:                      # keys
    print(name)

for name, price in prices.items():       # key and value — the usual one
    print(f"{name}: {price}")

for price in prices.values():
    print(price)
```

```output
apple: 45
cherry: 120
date: 90
```

Sorting by value is a one-liner once you know the shape:

```python
cheapest = sorted(prices.items(), key=lambda item: item[1])
```

:::warning
Do not add or delete keys while iterating over a dict — Python raises `RuntimeError: dictionary changed size during iteration`. Iterate over `list(prices.keys())` if you must modify as you go.
:::

## Counting and grouping

These two patterns cover an enormous share of real data-wrangling code.

```python
from collections import Counter, defaultdict

words = "the quick brown fox the lazy dog the end".split()

# Counting
counts = Counter(words)
print(counts.most_common(2))
```

```output
[('the', 3), ('quick', 1)]
```

```python
# Grouping
by_length = defaultdict(list)
for word in words:
    by_length[len(word)].append(word)

print(dict(by_length))
```

```output
{3: ['the', 'fox', 'the', 'dog', 'the', 'end'], 5: ['quick', 'brown'], 4: ['lazy']}
```

`defaultdict(list)` creates an empty list the first time any key is touched, so the `if key not in d: d[key] = []` boilerplate disappears.

## Merging and comprehensions

```python
defaults = {"theme": "light", "lang": "en"}
user     = {"theme": "dark"}

settings = defaults | user          # Python 3.9+; right side wins
print(settings)
```

```output
{'theme': 'dark', 'lang': 'en'}
```

```python
doubled = {k: v * 2 for k, v in prices.items()}
cheap   = {k: v for k, v in prices.items() if v < 100}
```

## Sets

A set holds unique, unordered, hashable elements.

```python
a = {1, 2, 3, 4}
b = {3, 4, 5}

print(a | b)   # {1, 2, 3, 4, 5}  union
print(a & b)   # {3, 4}           intersection
print(a - b)   # {1, 2}           difference — in a, not in b
print(a ^ b)   # {1, 2, 5}        symmetric difference
print(a <= b)  # False            subset test
```

The single most useful property is O(1) membership testing:

```python
banned = {"spam", "scam", "phish"}
clean = [msg for msg in messages if msg.tag not in banned]
```

With `banned` as a list, that comprehension is O(n·m). As a set it is O(n).

:::tip
`{}` creates an empty **dict**, not an empty set. Use `set()` for an empty set — a small wart in the syntax that catches everyone once.
:::

Sets are also the shortest way to answer "what changed":

```python
before = {"a.txt", "b.txt", "c.txt"}
after  = {"b.txt", "c.txt", "d.txt"}

print(f"added:   {after - before}")
print(f"removed: {before - after}")
```

```output
added:   {'d.txt'}
removed: {'a.txt'}
```

## Choosing between them

| Need | Use |
|---|---|
| Look something up by a key | `dict` |
| Test membership fast | `set` |
| Keep order and allow duplicates | `list` |
| Count occurrences | `Counter` |
| Group items under a key | `defaultdict(list)` |
| A fixed-shape record | `tuple` / `dataclass` |

## What to remember

- Dict and set lookups are O(1); list membership is O(n).
- `get`, `setdefault` and `[]` fail differently — pick deliberately.
- `Counter` and `defaultdict` replace most hand-rolled counting and grouping.
- `{}` is an empty dict; `set()` is an empty set.
