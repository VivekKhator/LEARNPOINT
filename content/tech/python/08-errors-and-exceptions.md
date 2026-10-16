---
title: Python Errors and Exceptions
description: Reading a traceback, catching exceptions precisely, try/except/else/finally, and why a bare except is the worst line in your codebase.
keywords: [python exceptions, try except, traceback, raise, finally, custom exception, error handling]
updated: 2026-10-13
quiz:
  - q: Where do you start reading a Python traceback?
    options:
      - At the top — the first line is the cause
      - At the bottom — the last line names the exception and the innermost frame is just above it
      - In the middle
      - Order does not matter
    answer: 1
    explain: "Python prints the call stack outermost-first, so the deepest frame and the actual error type are at the bottom. Read upward from there."
  - q: What is wrong with `except:` with no exception type?
    options:
      - Nothing, it is concise
      - It catches everything including KeyboardInterrupt and SystemExit, hiding bugs and making the program unkillable
      - It is a syntax error
      - It only catches ValueError
    answer: 1
    explain: A bare except swallows typos, memory errors and your own Ctrl-C. If you truly need a catch-all, use `except Exception:`, which at least leaves the system-exiting exceptions alone.
  - q: When does the `finally` block run?
    options:
      - Only when no exception occurred
      - Only when an exception occurred
      - Always, including when the try block returns or raises
      - Only if you call it explicitly
    answer: 2
    explain: "`finally` runs on every path out of the try block. It exists for cleanup that must happen regardless of outcome."
faq:
  - q: Should I use exceptions for control flow?
    a: "In Python, more than you might expect. The community convention is EAFP — easier to ask forgiveness than permission — so `try: value = d[k] / except KeyError:` is idiomatic. What you should not do is raise exceptions for ordinary, expected outcomes in a hot loop, since they are slower than a plain check."
  - q: What is the difference between an error and an exception?
    a: "In Python, syntax errors are caught before the program runs and cannot be handled. Everything else — exceptions — happens at run time and can be caught."
---

Things go wrong: a file is missing, a server times out, a user types "abc" into a number field. Exception handling is how you decide which of those your program recovers from and which it refuses to continue past.

## Reading a traceback

```output
Traceback (most recent call last):
  File "report.py", line 22, in <module>
    main()
  File "report.py", line 15, in main
    total = compute(rows)
  File "report.py", line 8, in compute
    return sum(int(r["amount"]) for r in rows)
ValueError: invalid literal for int() with base 10: 'N/A'
```

Read it **from the bottom**:

1. The last line is the exception type and message — `ValueError`, caused by `'N/A'`.
2. The frame directly above it is where the failure happened — line 8 in `compute`.
3. Everything above that is how execution got there.

The fix here is not a `try/except`. It is deciding what `'N/A'` should mean: skip the row, treat it as zero, or reject the file.

## try / except

```python
try:
    value = int(user_input)
except ValueError:
    print("That is not a whole number.")
    value = 0
```

Catch the **specific** exception you know how to handle. Several types at once:

```python
try:
    config = json.loads(raw)
except (ValueError, TypeError) as error:
    print(f"Bad config: {error}")
```

Binding with `as error` gives you the exception object — useful for logging the real message rather than a vague one of your own.

:::danger
```python
try:
    do_everything()
except:          # ← never
    pass
```

This catches `KeyboardInterrupt`, so Ctrl-C stops working. It catches `NameError`, so your typo becomes a silent no-op. It catches `MemoryError`, so the process limps on in a broken state. If you genuinely need a wide net, write `except Exception as e:` and **log `e`**.
:::

## else and finally

```python
try:
    handle = open("data.csv")
except FileNotFoundError:
    print("No data file; using defaults.")
    rows = []
else:
    rows = handle.read().splitlines()   # runs only if no exception
finally:
    print("Attempted to load data.")    # runs no matter what
```

- `else` holds the code that should run **only on success**. Keeping it out of `try` means you are not accidentally catching exceptions raised by the success path.
- `finally` runs on every exit — normal, exception, even `return`. It is for cleanup.

In practice, context managers replace most `finally` blocks:

```python
with open("data.csv") as handle:
    rows = handle.read().splitlines()
# file is closed here, exception or not
```

## Raising

```python
def withdraw(balance, amount):
    if amount <= 0:
        raise ValueError(f"amount must be positive, got {amount}")
    if amount > balance:
        raise InsufficientFunds(f"balance {balance} < {amount}")
    return balance - amount
```

Validate at the boundary and fail immediately with a message that includes the offending value. An error that says `amount must be positive, got -50` is debuggable; one that says `invalid input` is not.

Define your own type when callers need to distinguish your failure from everyone else's:

```python
class InsufficientFunds(Exception):
    """Raised when a withdrawal exceeds the available balance."""
```

That is the whole class. Inherit from `Exception`, not from `BaseException`.

## Re-raising and chaining

```python
try:
    rows = parse(raw)
except ValueError as error:
    raise ConfigError("config file is malformed") from error
```

`from error` preserves the original traceback, so the log shows both your high-level message and the low-level cause. A bare `raise` inside an `except` block re-raises the current exception unchanged — useful when you want to log and then let it propagate.

:::warning
Catching an exception only to `raise RuntimeError("something went wrong")` destroys the information you needed. Either handle it or let it travel.
:::

## EAFP over LBYL

Two styles:

```python
# Look before you leap
if "amount" in row and row["amount"].isdigit():
    value = int(row["amount"])

# Easier to ask forgiveness than permission — the Python default
try:
    value = int(row["amount"])
except (KeyError, ValueError):
    value = 0
```

The second is preferred in Python, partly for readability and partly because the first has a race condition when the thing being checked is a file or a shared resource: it can disappear between the check and the use.

## What to remember

- Read tracebacks from the bottom.
- Catch narrow exception types; `except Exception as e` with logging is the widest acceptable net, and a bare `except:` is never one.
- `else` for the success path, `finally` for cleanup, `with` instead of `finally` wherever a context manager exists.
- Raise early, with the offending value in the message, and chain with `from` when you wrap.
