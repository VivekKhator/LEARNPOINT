---
title: Introduction to Python
description: What Python is, what it is genuinely good at, where it is the wrong tool, and how to run your first program.
keywords: [python introduction, what is python, python interpreter, python use cases]
updated: 2026-10-10
quiz:
  - q: Python is usually described as an "interpreted" language. What does that mean in practice?
    options:
      - The code is converted to machine code once, ahead of time, and shipped as a binary
      - A program (the interpreter) reads and executes your source at run time
      - Python cannot be compiled at all
      - Python runs only inside a web browser
    answer: 1
    explain: CPython compiles your source to bytecode and an interpreter loop executes it. There is a compile step, but it happens on the fly rather than producing a standalone binary.
  - q: Which of these is the weakest reason to choose Python for a project?
    options:
      - The team already knows it
      - The task is data analysis or scripting
      - You need the lowest possible latency per request under heavy CPU load
      - You need a large library ecosystem
    answer: 2
    explain: Tight CPU-bound latency is where Python is at its worst. That work usually gets pushed into C extensions, or the service gets written in Go, Rust or Java.
faq:
  - q: Should I learn Python 2 or Python 3?
    a: Python 3. Python 2 reached end of life in 2020 and receives no security fixes. Any tutorial still teaching `print "x"` as a statement is out of date.
  - q: Is Python slow?
    a: The interpreter is slow relative to compiled languages, often 20–50× slower on tight numeric loops. It matters far less than people expect, because most real programs are waiting on a network, a disk or a database, and the heavy numeric work is done by libraries written in C.
---

Python is a general-purpose programming language designed so that reading code is easy even when writing it was hard. That single priority explains most of its design: significant indentation instead of braces, a small set of keywords, and a standard library large enough that many scripts need no third-party packages at all.

## What Python is actually used for

Python is not uniformly popular — it dominates particular niches and is nearly absent from others.

| Area | How Python is used | Realistic alternative |
|---|---|---|
| Data analysis, machine learning | The default. pandas, NumPy, PyTorch | R, Julia |
| Automation and scripting | Glue between tools, file and API wrangling | Bash, PowerShell |
| Backend web services | Django, FastAPI; very common | Go, Java, Node.js |
| Testing and tooling | pytest, build scripts, CI glue | Shell, Make |
| Mobile apps, browser front-ends, game engines | Rare to nonexistent | Swift/Kotlin, JavaScript, C++ |

The pattern: Python wins where developer time costs more than CPU time, and loses where the reverse holds.

## Interpreted, but not the way people mean it

When your file runs, CPython — the reference implementation — compiles the source into **bytecode**, a compact instruction format, and then an interpreter loop executes those instructions one at a time. There is a compilation step; it just produces bytecode rather than a native binary, and it happens automatically.

That design buys the things people like about Python — no build step, an interactive prompt, introspection at run time — and costs the thing people complain about: raw speed on CPU-bound loops.

:::note
The `__pycache__` folder that appears next to your scripts holds cached bytecode. It is safe to delete; Python regenerates it.
:::

## Your first program

Create a file called `hello.py`:

```python title=hello.py
name = input("What is your name? ")
print(f"Hello, {name}. You typed {len(name)} characters.")
```

Run it from a terminal:

```bash
python3 hello.py
```

```output
What is your name? Ada
Hello, Ada. You typed 3 characters.
```

Three things are already visible in those two lines:

- **No type declarations.** `name` holds a string because `input()` returned one, not because you said so.
- **f-strings.** Prefixing a string with `f` lets you embed expressions in `{}`. It is the standard way to build strings in modern Python.
- **Everything is an object.** `len(name)` works because the string object knows its own length.

## The interactive prompt

Typing `python3` with no arguments opens a REPL — read, evaluate, print, loop. It is the fastest way to answer "what does this actually return?":

```python
>>> 7 / 2
3.5
>>> 7 // 2
3
>>> type(7 // 2)
<class 'int'>
```

Get in the habit of checking behaviour here rather than guessing. Two minutes in the REPL beats twenty minutes of reasoning about what a function probably does.

:::tip
`help(str.split)` and `dir(str)` work inside the REPL. The documentation for anything installed is already on your machine.
:::

## Indentation is syntax

In most languages indentation is a courtesy. In Python it is the grammar — a block is defined by how far it is indented, and mixing tabs with spaces is an error, not a style issue.

```python
total = 0
for n in [1, 2, 3]:
    total += n        # inside the loop
print(total)          # outside the loop — runs once
```

```output
6
```

Use four spaces. Configure your editor to insert spaces when you press Tab and the whole category of problem disappears.

## What to remember

- Python optimises for reading, and trades run-time speed for development speed.
- It is the default choice for data work and scripting, a solid choice for backends, and the wrong choice for latency-critical CPU-bound code.
- The REPL is a tool, not a toy — use it to check behaviour instead of assuming.
- Indentation defines blocks. Four spaces, never tabs.
