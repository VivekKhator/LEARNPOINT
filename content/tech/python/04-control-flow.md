---
title: Python Control Flow
description: if/elif/else, for and while loops, break and continue, and the comprehension syntax that replaces most short loops.
keywords: [python if else, python for loop, while loop, range, break continue, list comprehension, match case]
updated: 2026-10-11
quiz:
  - q: How many times does `for i in range(2, 10, 3)` iterate?
    options: ["2", "3", "4", "8"]
    answer: 1
    explain: "`range(2, 10, 3)` yields 2, 5 and 8 — it stops before 10. Three iterations."
  - q: When does the `else` clause of a `for` loop run?
    options:
      - Always, after the loop
      - Only if the loop body never ran
      - Only if the loop finished without hitting `break`
      - Only if an exception was raised
    answer: 2
    explain: "`for ... else` runs the else block when the loop completes normally. It is designed for search loops: break on found, else report not found."
  - q: What is the main reason to prefer a list comprehension over an equivalent for loop with `append`?
    options:
      - It is always dramatically faster
      - It states the intent — build a list from this iterable — in one expression
      - It uses less memory in every case
      - Loops are deprecated
    answer: 1
    explain: Comprehensions are modestly faster, but the real benefit is readability. A comprehension that needs a comment is better written as a loop.
faq:
  - q: Does Python have a ternary operator?
    a: "Yes, written in reading order: `status = \"on\" if enabled else \"off\"`."
  - q: Why is there no do-while loop?
    a: "Python has no `do ... while`. The idiom is `while True:` with a `break` at the bottom of the body when the exit condition is met."
---

Control flow in Python is deliberately small: two branching forms, two loops, and comprehensions that cover the common case of building a collection.

## Conditionals

```python
score = 72

if score >= 85:
    grade = "A"
elif score >= 70:
    grade = "B"
elif score >= 50:
    grade = "C"
else:
    grade = "F"

print(grade)
```

```output
B
```

Order matters: the first true branch wins and the rest are skipped. Writing the bands from highest to lowest means each test only needs one bound.

Comparisons can be chained the way they are in mathematics:

```python
if 0 <= score <= 100:
    print("valid")
```

This is not two separate comparisons joined by `and` under the hood — `score` is evaluated once, which matters if it is an expensive call.

## for loops iterate over things, not indices

```python
for language in ["Python", "SQL", "Go"]:
    print(language)
```

If you need the position too, use `enumerate` rather than manual counters:

```python
for i, language in enumerate(["Python", "SQL", "Go"], start=1):
    print(f"{i}. {language}")
```

```output
1. Python
2. SQL
3. Go
```

To walk two sequences together, use `zip`:

```python
for name, score in zip(["Ada", "Alan"], [91, 88]):
    print(name, score)
```

:::danger
`zip` stops at the shortest input and says nothing. If the lists should be the same length, pass `strict=True` (Python 3.10+) so a mismatch raises instead of silently dropping data.
:::

`range` generates numbers lazily:

```python
range(5)         # 0 1 2 3 4
range(2, 10, 3)  # 2 5 8
range(10, 0, -2) # 10 8 6 4 2
```

Like slices, `range` is end-exclusive, so `range(len(items))` covers exactly the valid indices.

## while loops

Use `while` when the number of iterations is not known in advance:

```python
balance = 1000
years = 0
while balance < 2000:
    balance *= 1.07
    years += 1
print(f"Doubled in {years} years")
```

```output
Doubled in 11 years
```

:::warning
Every `while` loop needs something in the body that can make the condition false. If the loop variable is only read and never written, you have written an infinite loop.
:::

## break, continue, and the for/else clause

```python
users = ["ada", "alan", "grace"]

for user in users:
    if user.startswith("z"):
        print("found", user)
        break
else:
    print("no match")
```

```output
no match
```

The `else` belongs to the `for`, not to the `if`, and runs only when the loop finished **without** a `break`. It is purpose-built for search loops and removes the `found = False` flag that would otherwise be needed.

`continue` skips to the next iteration:

```python
for n in range(10):
    if n % 2:
        continue        # skip odds
    print(n, end=" ")
```

```output
0 2 4 6 8
```

## Comprehensions

Most short loops that build a list are clearer as a comprehension:

```python
squares = [n * n for n in range(6)]
evens   = [n for n in range(20) if n % 2 == 0]
lengths = {word: len(word) for word in ["a", "bb", "ccc"]}
unique  = {word.lower() for word in ["Go", "go", "SQL"]}
```

```output
[0, 1, 4, 9, 16, 25]
```

The shape is always *expression*, then *for*, then optional *if*. Dict and set comprehensions use the same grammar with different brackets.

:::tip
A comprehension with two `for` clauses and a condition is usually past the point where it helps. If you have to read it twice, write the loop.
:::

For large data, a **generator expression** uses round brackets and produces items on demand instead of building a whole list:

```python
total = sum(n * n for n in range(1_000_000))   # constant memory
```

## Structural pattern matching

Python 3.10 added `match`, which is closer to a destructuring switch than to C's:

```python
def describe(point):
    match point:
        case (0, 0):
            return "origin"
        case (x, 0):
            return f"on the x-axis at {x}"
        case (x, y) if x == y:
            return "on the diagonal"
        case _:
            return "somewhere else"
```

It earns its place when you are branching on the *shape* of data. For comparing one value against a few constants, `if/elif` is still clearer.

## What to remember

- Iterate over items; reach for `enumerate` and `zip` before indices.
- `range` and slices are both end-exclusive — the same mental model covers both.
- `for ... else` means "the loop never broke".
- Comprehensions for simple transformations; a real loop when it gets complicated.
