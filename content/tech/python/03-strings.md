---
title: Python Strings
description: Slicing, formatting, the methods you will actually use, and why strings being immutable changes how you build them in a loop.
keywords: [python strings, f-string, string slicing, string methods, join, split]
updated: 2026-10-11
quiz:
  - q: What does `"python"[1:4]` evaluate to?
    options: ["'pyt'", "'yth'", "'ytho'", "'ythn'"]
    answer: 1
    explain: Slicing is start-inclusive and end-exclusive, so indices 1, 2 and 3 are taken — 'y', 't', 'h'.
  - q: Why is `"".join(parts)` preferred over `s += part` inside a loop?
    options:
      - It is only a style preference
      - Strings are immutable, so `+=` builds a new string each iteration, making the loop quadratic
      - "`join` sorts the parts first"
      - "`+=` does not work on strings"
    answer: 1
    explain: Each `+=` allocates and copies a whole new string. Over n iterations that is O(n²) work. `join` measures once, allocates once, copies once.
  - q: What does `"  Hi  ".strip()` return?
    options: ["'Hi'", "'  Hi'", "'Hi  '", "'HI'"]
    answer: 0
    explain: "`strip()` removes leading and trailing whitespace. `lstrip()` and `rstrip()` do one side each."
faq:
  - q: Single or double quotes?
    a: Functionally identical. Pick one for consistency and use the other when the string contains a quote, to avoid escaping. Most formatters standardise on double quotes.
  - q: What is the difference between `str` and `bytes`?
    a: "`str` is Unicode text; `bytes` is raw binary. Encode to go from text to bytes (`s.encode('utf-8')`) and decode to come back. Files and sockets deal in bytes; your program should deal in `str`."
---

A Python string is an immutable sequence of Unicode characters. Both halves of that sentence matter: *sequence* means indexing and slicing work, *immutable* means every "modification" actually produces a new string.

## Indexing and slicing

```python
word = "python"
print(word[0])      # p   — first character
print(word[-1])     # n   — last character
print(word[1:4])    # yth — index 1 up to, not including, 4
print(word[:3])     # pyt — from the start
print(word[3:])     # hon — to the end
print(word[::-1])   # nohtyp — step of -1 reverses
```

Slices are **start-inclusive, end-exclusive**. The payoff is that `s[:n] + s[n:] == s` for any `n`, and that `len(s[a:b]) == b - a` when both are in range. Off-by-one errors mostly disappear once you internalise this.

:::note
Out-of-range slicing is silent: `"abc"[10:20]` returns `""` rather than raising. Out-of-range *indexing* (`"abc"[10]`) raises `IndexError`.
:::

## Formatting: use f-strings

```python
name, score = "Ada", 0.9134

print(f"{name} scored {score:.1%}")
print(f"{name:>10}|")          # right-align in 10 columns
print(f"{score:08.3f}")        # zero-padded, 3 decimals
print(f"{name=}, {score=}")    # debugging form
```

```output
Ada scored 91.3%
       Ada|
0000.913
name='Ada', score=0.9134
```

The format spec after `:` is a small language of its own — alignment, width, precision, thousands separators (`{n:,}`), and type codes. It is worth ten minutes of your life because it eliminates most string-building code.

:::tip
`f"{value!r}"` inserts `repr(value)` instead of `str(value)`. In logs and error messages that is almost always what you want, because it shows quotes and escapes.
:::

## The methods you will actually use

```python
s = "  Data Science, 2026  "

s.strip()                    # 'Data Science, 2026'
s.lower()                    # '  data science, 2026  '
s.replace("2026", "2027")    # substitution
s.strip().split(", ")        # ['Data Science', '2026']
"Data Science".startswith("Data")   # True
"2026".isdigit()             # True
", ".join(["a", "b", "c"])   # 'a, b, c'
"abc".find("z")              # -1  (index, or -1 if absent)
```

Two notes that save debugging time:

- Every one of these **returns a new string**. `s.strip()` on its own line does nothing; you must assign the result.
- `split()` with no argument splits on any run of whitespace and discards empties — usually what you want for human-entered text. `split(" ")` splits on exactly one space and will hand you empty strings.

## Immutability and the loop trap

```python
# Slow: quadratic in the number of parts
out = ""
for part in parts:
    out += part

# Fast: one allocation
out = "".join(parts)
```

Because strings cannot be modified in place, `out += part` allocates a fresh string and copies everything already accumulated. Over `n` parts that is O(n²) copying. `join` walks the list once to compute the total size, allocates once, and copies once.

For a few dozen pieces nobody notices. For a few hundred thousand lines of a log file, this is the difference between a script that finishes and one you kill.

## Multi-line strings and escapes

```python
query = """
SELECT id, name
FROM users
WHERE active = true
"""

path = r"C:\Users\new\table"   # raw string — backslashes stay literal
```

Without the `r`, `\n` and `\t` in that path would become a newline and a tab. Raw strings are standard for Windows paths and regular expressions.

## Encoding, briefly

A `str` is text. A `bytes` is raw data. Converting is explicit:

```python
text = "café"
raw = text.encode("utf-8")   # b'caf\xc3\xa9' — 5 bytes for 4 characters
print(len(text), len(raw))   # 4 5
print(raw.decode("utf-8"))   # café
```

:::warning
`len()` on a string counts Unicode code points, not bytes and not visual characters. An emoji with a skin-tone modifier can be two code points that render as one glyph. If you are enforcing a length limit for a database column measured in bytes, measure the bytes.
:::

## What to remember

- Slices are half-open; that is what makes them compose cleanly.
- f-strings are the default; learn the format spec after the colon.
- String methods return new strings — assign the result.
- Build strings with `join`, not `+=` in a loop.
