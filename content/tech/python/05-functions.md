---
title: Python Functions
description: Parameters, defaults, *args and **kwargs, return values, scope, and the mutable default argument that bites everyone exactly once.
keywords: [python functions, def, default arguments, args kwargs, return, scope, lambda, type hints]
updated: 2026-10-12
quiz:
  - q: "What does this print on the second call? `def add(item, bucket=[]): bucket.append(item); return bucket`"
    options: ["[1] then [2]", "[1] then [1, 2]", "An error", "[2] then [2]"]
    answer: 1
    explain: The default list is created once, when the function is defined, and reused on every call that omits the argument. Use `None` as the default and build the list inside the body.
  - q: What does a function return if it has no `return` statement?
    options: ["0", "An empty string", "None", "It raises an error"]
    answer: 2
    explain: Every Python function returns something; with no explicit return it is `None`.
  - q: What do `*args` and `**kwargs` collect?
    options:
      - Nothing — they are only documentation
      - Extra positional arguments into a tuple, extra keyword arguments into a dict
      - Extra positional arguments into a list, extra keyword arguments into a set
      - Only arguments that have defaults
    answer: 1
    explain: "`*args` is a tuple of the leftover positional arguments; `**kwargs` is a dict of the leftover keyword arguments."
faq:
  - q: Are type hints enforced at run time?
    a: No. Python ignores them during execution. They exist for readers, editors and static checkers such as mypy or pyright. A wrong hint will not raise — it will just mislead.
  - q: When should I use a lambda?
    a: When you need a one-expression function inline, typically as a `key=` argument to `sorted`, `min` or `max`. If it needs a name or a second line, use `def`.
---

A function packages a piece of behaviour behind a name so that the rest of the program can stop caring how it works. In Python, functions are ordinary objects: you can pass them around, store them in lists, and return them from other functions.

## Defining and calling

```python
def area(width, height):
    """Return the area of a rectangle."""
    return width * height

print(area(3, 4))
print(area(height=4, width=3))   # keyword arguments, order irrelevant
```

```output
12
12
```

The string on the first line of the body is the **docstring**. It is not a comment — it is stored on the function and shown by `help(area)`. Write one for anything another person will call.

## Default arguments

```python
def greet(name, greeting="Hello", punctuation="!"):
    return f"{greeting}, {name}{punctuation}"

greet("Ada")                      # 'Hello, Ada!'
greet("Ada", "Welcome")           # 'Welcome, Ada!'
greet("Ada", punctuation="?")     # 'Hello, Ada?'
```

Parameters with defaults must come after those without. Once you pass one argument by keyword, everything after it must also be keyword.

:::danger
**Never use a mutable object as a default.**

```python
def add(item, bucket=[]):     # the list is created ONCE, at definition time
    bucket.append(item)
    return bucket

add(1)   # [1]
add(2)   # [1, 2]  ← not what anyone expects
```

The correct form:

```python
def add(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket
```
:::

## Variable numbers of arguments

```python
def summarise(*values, label="total", **options):
    print(label, sum(values), options)

summarise(1, 2, 3)
summarise(1, 2, label="sum", precision=2)
```

```output
total 6 {}
sum 3 {'precision': 2}
```

- `*values` collects leftover positional arguments into a **tuple**.
- `**options` collects leftover keyword arguments into a **dict**.

The same syntax unpacks in the other direction at the call site:

```python
numbers = [1, 2, 3]
config = {"label": "score"}
summarise(*numbers, **config)
```

## Returning more than one value

```python
def divide(a, b):
    return a // b, a % b      # this is a tuple

quotient, remainder = divide(17, 5)
print(quotient, remainder)
```

```output
3 2
```

There is no special multiple-return feature — you are returning one tuple and unpacking it.

## Scope

Names assigned inside a function are **local** to it. Reading an outer name works; assigning to one creates a new local instead:

```python
count = 0

def increment():
    count = count + 1    # UnboundLocalError

increment()
```

Python sees the assignment, marks `count` as local for the whole function, and then the read on the right-hand side fails because the local has no value yet. Rather than reaching for `global`, return the new value:

```python
def increment(count):
    return count + 1

count = increment(count)
```

:::tip
A function that needs `global` is usually a function that should take an argument and return a result. Code that communicates through arguments and return values is testable; code that communicates through module state is not.
:::

## Type hints

```python
def area(width: float, height: float) -> float:
    return width * height

def find(names: list[str], prefix: str) -> str | None:
    for name in names:
        if name.startswith(prefix):
            return name
    return None
```

Hints are not checked at run time — Python will happily run `area("a", 3)` and fail later. Their value is that an editor can autocomplete, a checker can catch mistakes before you run anything, and a reader can tell what `find` returns without reading its body. The `str | None` form is the honest way to say "this can come back empty".

## Lambdas

```python
people = [("Ada", 36), ("Alan", 41), ("Grace", 45)]
by_age = sorted(people, key=lambda person: person[1])
```

A `lambda` is an anonymous function limited to a single expression. It exists for exactly this case: a small key or callback passed inline. Assigning a lambda to a name (`f = lambda x: x + 1`) gains nothing over `def` and loses the name in tracebacks.

## What to remember

- Default arguments are evaluated once, at definition — never make them mutable.
- `*args` is a tuple, `**kwargs` is a dict, and both work in reverse at the call site.
- Assigning inside a function makes a local; prefer parameters and return values over `global`.
- Type hints are for humans and tools, not the interpreter — but they pay for themselves.
