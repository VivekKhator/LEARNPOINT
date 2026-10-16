---
title: Python Variables and Data Types
description: How names bind to objects in Python, the built-in types you will use daily, and the mutability rule that causes the most confusing bugs.
keywords: [python variables, python data types, int float str bool, mutable immutable, type conversion]
updated: 2026-10-10
quiz:
  - q: After `a = [1, 2]` and `b = a`, what does `b` contain following `a.append(3)`?
    options: ["[1, 2]", "[1, 2, 3]", "An error is raised", "[3]"]
    answer: 1
    explain: "`b = a` copies the reference, not the list. Both names point at the same list object, so a change through one name is visible through the other."
  - q: What is the type of `5 / 2` in Python 3?
    options: ["int", "float", "Decimal", "It depends on the platform"]
    answer: 1
    explain: "`/` is true division and always produces a float, even when the result is whole. Use `//` for floor division if you want an int."
  - q: Which value is NOT falsy in Python?
    options: ["0", "[]", "'0'", "None"]
    answer: 2
    explain: "A non-empty string is truthy, including the string '0'. The falsy values are False, None, 0, 0.0, '', [], {}, set() and ()."
faq:
  - q: Does Python have constants?
    a: Not enforced ones. The convention is an ALL_CAPS name, which tells other people not to reassign it. Nothing stops them.
  - q: Why does `0.1 + 0.2` give 0.30000000000000004?
    a: Floats are binary approximations of decimal numbers, and 0.1 has no exact binary representation — the same reason 1/3 has no exact decimal one. For money, use `decimal.Decimal` or store integer paise/cents.
---

A variable in Python is not a box that holds a value. It is a **name bound to an object**. That distinction sounds academic until it produces a bug, which it will.

## Assignment binds a name

```python
x = 42        # the name x now refers to an int object with value 42
y = x         # y refers to the same object
x = 43        # x is rebound to a NEW int object; y is untouched
print(x, y)
```

```output
43 42
```

Nothing was copied. `x = 43` did not modify the object `42`; it pointed `x` at a different object. Integers are immutable, so this is the only thing that *could* have happened.

Now the same code with a list:

```python
a = [1, 2]
b = a
a.append(3)
print(a, b)
```

```output
[1, 2, 3] [1, 2, 3]
```

`append` **mutated the object itself**. Both names still refer to it, so both see the change.

:::danger
This is the single most common source of surprising behaviour for people arriving from languages with value semantics. Rebinding a name (`a = ...`) affects one name. Mutating an object (`a.append(...)`, `a[0] = ...`) affects everyone holding a reference to it.
:::

To get an independent copy, say so:

```python
b = a.copy()          # shallow copy — new list, same inner objects
import copy
c = copy.deepcopy(a)  # recursive copy
```

## The built-in types worth knowing

| Type | Example | Mutable? | Notes |
|---|---|---|---|
| `int` | `42`, `-7` | No | Arbitrary precision — no overflow |
| `float` | `3.14` | No | 64-bit binary; approximate |
| `str` | `"hello"` | No | Unicode text, not bytes |
| `bool` | `True` | No | A subclass of `int`; `True == 1` |
| `list` | `[1, 2]` | **Yes** | Ordered, index access |
| `tuple` | `(1, 2)` | No | Like a list but frozen; usable as a dict key |
| `dict` | `{"a": 1}` | **Yes** | Key → value; insertion-ordered since 3.7 |
| `set` | `{1, 2}` | **Yes** | Unique members, no order |
| `NoneType` | `None` | — | The absence of a value |

`int` having arbitrary precision is unusual and genuinely useful:

```python
print(2 ** 200)
```

```output
1606938044258990275541962092341162602522202993782792835301376
```

No overflow, no 64-bit ceiling. The cost is speed, which rarely matters at this scale.

## Checking and converting types

```python
value = "42"
print(type(value))          # <class 'str'>
print(isinstance(value, str))  # True

number = int(value)         # explicit conversion
print(number + 1)           # 43
```

Python will not convert for you across the str/number boundary:

```python
print("42" + 1)
```

```output
TypeError: can only concatenate str (not "int") to str
```

This is a feature. Languages that silently coerce here produce `"421"` and a bug report three weeks later.

:::warning
`int("3.9")` raises `ValueError` — it does not truncate. Use `int(float("3.9"))` if truncation is what you want, and be deliberate about it.
:::

## Truthiness

Every object has a boolean interpretation. These are **falsy**: `False`, `None`, `0`, `0.0`, `""`, `[]`, `{}`, `set()`, `()`. Everything else is truthy.

```python
items = []
if items:
    print("has items")
else:
    print("empty")       # this runs
```

Write `if items:` rather than `if len(items) > 0:` — it is idiomatic and works for any container.

:::danger
`if value:` and `if value is not None:` are different tests. If `value` could legitimately be `0` or `""`, the first one treats a valid value as missing. Check against `None` explicitly when zero is meaningful.
:::

## Naming

- `snake_case` for variables and functions, `PascalCase` for classes, `UPPER_SNAKE` for constants.
- A leading underscore (`_cache`) signals "internal, do not rely on this".
- A bare `_` conventionally means "I must bind this but will not use it": `for _ in range(3):`.

## What to remember

- Names bind to objects; assignment never copies.
- Mutating affects every holder of the reference; rebinding affects one name.
- `/` always returns a float; `//` floors.
- Python refuses to guess across type boundaries, and you should be glad.
