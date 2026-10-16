---
title: JavaScript Variables and Types
description: let versus const, the seven primitives, why 0.1 + 0.2 is not 0.3, and the coercion rules behind == that make === the default.
keywords: [javascript let const var, javascript types, typeof, null undefined, coercion, triple equals]
updated: 2026-10-08
quiz:
  - q: What does `typeof null` return?
    options: ["'null'", "'object'", "'undefined'", "'boolean'"]
    answer: 1
    explain: "A bug from 1995 that can never be fixed without breaking the web. To test for null, compare directly: `value === null`."
  - q: Why does `0.1 + 0.2 === 0.3` evaluate to false?
    options:
      - JavaScript has a rounding bug
      - Numbers are IEEE-754 binary floats, and 0.1 has no exact binary representation
      - "`===` does not work on numbers"
      - It is true in modern browsers
    answer: 1
    explain: Every language using binary floating point has this behaviour. Compare with a tolerance, or work in integer units such as cents.
  - q: What is the difference between `null` and `undefined`?
    options:
      - They are identical
      - "`undefined` means a value was never assigned; `null` means it was deliberately set to empty"
      - "`null` is a number"
      - "`undefined` only appears in old code"
    answer: 1
    explain: The engine produces `undefined` for missing things. `null` is something a programmer assigns to say "intentionally nothing".
faq:
  - q: Should I ever use `var`?
    a: No. `var` is function-scoped and hoisted in ways that surprise people. `const` by default, `let` when you must reassign.
  - q: Does `const` make an object immutable?
    a: No. It prevents rebinding the name. `const user = {}` then `user.name = 'Ada'` is perfectly legal. Use `Object.freeze(user)` for a shallow freeze.
---

## Declarations

```js
const MAX = 100;       // cannot be reassigned
let count = 0;         // can be reassigned
count += 1;

var old = 'avoid';     // function-scoped, hoisted — legacy
```

Default to `const`. Switch to `let` only when you actually reassign. That is not a style preference: a `const` tells the reader that the binding never changes, which removes a whole category of thing to track while reading.

```js
const user = { name: 'Ada' };
user.name = 'Grace';      // fine — the object is mutable
user = { name: 'Alan' };  // TypeError — the BINDING is constant
```

`let` and `const` are block-scoped, which behaves the way people expect:

```js run
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log('let:', i), 0);     // 0, 1, 2
}
for (var j = 0; j < 3; j++) {
  setTimeout(() => console.log('var:', j), 0);     // 3, 3, 3
}
```

`let` creates a fresh binding per iteration. `var` creates one shared binding for the whole function, so by the time the callbacks run, it holds the final value. This exact example used to be a standard interview question, and `let` is the reason it stopped being one.

## The primitives

| Type | Example | Notes |
|---|---|---|
| `string` | `'hi'` | UTF-16, immutable |
| `number` | `42`, `3.14` | One type for integers and floats |
| `boolean` | `true` | |
| `undefined` | `undefined` | Declared but unassigned |
| `null` | `null` | Deliberately empty |
| `bigint` | `9007199254740993n` | Integers beyond 2⁵³ |
| `symbol` | `Symbol('id')` | Unique keys |

Everything else — arrays, functions, dates, regexes — is an object.

## Numbers are floats

```js run
console.log(0.1 + 0.2);                 // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3);         // false
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON);  // true
console.log(9007199254740992 + 1);      // 9007199254740992 — silently wrong
```

There is one numeric type and it is a 64-bit binary float. Two consequences:

- Decimal fractions are approximate. **Never store money in a `number`** — use integer paise/cents, or a decimal library.
- Integers are exact only up to `Number.MAX_SAFE_INTEGER` (2⁵³ − 1). Beyond that, use `BigInt`.

:::danger
`parseInt('08')` is 8 in modern engines, but `parseInt` still stops at the first invalid character: `parseInt('12px')` is `12` and `parseInt('px12')` is `NaN`. For strict parsing use `Number('12px')`, which gives `NaN` as you would hope.
:::

## null, undefined, and checking for them

```js
let a;                     // undefined — never assigned
const b = null;            // null — deliberately empty
const c = { x: 1 };
console.log(c.missing);    // undefined — property does not exist
```

Modern JavaScript has two operators built for this:

```js run
const config = { timeout: 0, retries: null };

console.log(config.timeout ?? 30);      // 0   — ?? only falls back on null/undefined
console.log(config.timeout || 30);      // 30  — || falls back on ANY falsy value
console.log(config.user?.name);         // undefined, no crash
```

`??` (nullish coalescing) is almost always what you meant when you reached for `||`. The difference matters whenever `0` or `''` is a legitimate value.

## Coercion and the case for ===

```js run
console.log(1 == '1');        // true  — string converted to number
console.log(0 == false);      // true
console.log(null == undefined); // true
console.log([] == false);     // true  (!)

console.log(1 === '1');       // false — no conversion
console.log(0 === false);     // false
```

`==` applies a table of conversion rules that nobody remembers correctly. `===` compares type and value with no conversion.

**Use `===` and `!==` always.** The one idiomatic exception is `value == null`, which is a compact test for "null or undefined" — and even that is clearer as `value === null || value === undefined`, or avoided entirely with `??`.

## Truthiness

Falsy: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, `NaN`. Everything else is truthy — including `[]`, `{}` and `'0'`.

```js run
if ([]) console.log('empty array is truthy');       // prints
console.log([] == false);                           // true — and yet
```

Both lines are consistent with the specification and the combination is indefensible. This is precisely why `===` and explicit length checks exist.

## Checking types

```js
typeof 'hi'          // 'string'
typeof 42            // 'number'
typeof undefined     // 'undefined'
typeof null          // 'object'  ← the historic bug
typeof []            // 'object'
typeof function(){}  // 'function'

Array.isArray([])            // true   — the correct array check
Number.isNaN(NaN)            // true   — safer than the global isNaN
value === null               // the correct null check
```

## What to remember

- `const` by default, `let` when reassigning, never `var`.
- One number type, binary floating point — not for money.
- `??` and `?.` handle missing values without swallowing `0` and `''`.
- `===` always; `typeof null` is `'object'` and always will be.
