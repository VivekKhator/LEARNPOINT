---
title: Arrays and Objects
description: The array methods that replace most loops, object destructuring and spread, and the shallow-copy rule behind a lot of state bugs.
keywords: [javascript array methods, map filter reduce, destructuring, spread operator, shallow copy, optional chaining]
updated: 2026-10-09
quiz:
  - q: What does `map` return?
    options:
      - The original array, modified in place
      - A new array of the same length with each element transformed
      - The first matching element
      - A single accumulated value
    answer: 1
    explain: "`map` always returns a new array of the same length. If you are not using the result, you wanted `forEach`."
  - q: "After `const b = {...a}` where `a = { nested: { x: 1 } }`, what happens to `a` when you set `b.nested.x = 2`?"
    options:
      - "`a.nested.x` stays 1"
      - "`a.nested.x` becomes 2 — the spread is a shallow copy and the inner object is shared"
      - An error is thrown
      - "`a` becomes undefined"
    answer: 1
    explain: Spread copies the top level only. For a deep copy use `structuredClone(a)`.
  - q: Which method should you use to find out whether any element matches a condition?
    options: ["map", "filter", "some", "reduce"]
    answer: 2
    explain: "`some` returns a boolean and short-circuits at the first match. `filter(...).length > 0` works but scans the whole array."
faq:
  - q: Is `reduce` worth learning?
    a: Yes, but it is overused. Reach for it when you are genuinely folding a list into one value — a sum, a grouping, a lookup table. If a `reduce` needs a comment to explain it, a `for...of` loop is better code.
  - q: How do I copy an object deeply?
    a: "`structuredClone(obj)` is built into modern browsers and Node 17+. It handles nested objects, arrays, Maps, Sets and Dates, though not functions."
---

## Array basics

```js
const scores = [91, 88, 76, 95];

scores.length        // 4
scores[0]            // 91
scores.at(-1)        // 95  — cleaner than scores[scores.length - 1]
scores.includes(88)  // true
scores.indexOf(76)   // 2
```

## The methods that replace loops

```js run
const products = [
  { name: 'Keyboard', price: 2400, inStock: true },
  { name: 'Mouse',    price:  900, inStock: false },
  { name: 'Monitor',  price: 14000, inStock: true },
];

// map — transform each element, same length out
const names = products.map(p => p.name);

// filter — keep matching elements
const available = products.filter(p => p.inStock);

// find / findIndex — first match, or undefined
const mouse = products.find(p => p.name === 'Mouse');

// some / every — booleans, short-circuiting
const anyExpensive = products.some(p => p.price > 10000);
const allCheap     = products.every(p => p.price < 1000);

// reduce — fold into one value
const total = products.reduce((sum, p) => sum + p.price, 0);

// sort — IN PLACE, and compares as strings by default
const byPrice = [...products].sort((a, b) => a.price - b.price);

console.log({ names, anyExpensive, allCheap, total });
```

:::danger
`sort()` mutates the array **and** converts elements to strings unless given a comparator. `[10, 9, 1].sort()` returns `[1, 10, 9]`. Always pass `(a, b) => a - b` for numbers, and copy first (`[...arr].sort(...)`) unless you intend to mutate.
:::

`toSorted()`, `toReversed()` and `with()` are the newer non-mutating versions, available in current browsers and Node 20+.

### Chaining

```js run
const products = [
  { name: 'Keyboard', price: 2400, inStock: true },
  { name: 'Mouse',    price:  900, inStock: false },
  { name: 'Monitor',  price: 14000, inStock: true },
];

const label = products
  .filter(p => p.inStock)
  .map(p => `${p.name}: ₹${p.price.toLocaleString('en-IN')}`)
  .join('\n');

console.log(label);
```

Each step is one idea. Readability beats the extra passes over the array for anything under a few thousand elements; if it matters, measure before restructuring.

## Objects

```js
const user = {
  name: 'Ada',
  age: 36,
  address: { city: 'Pune', pin: '411001' },
};

user.name            // dot access
user['name']         // bracket access — needed for dynamic keys
user.address?.city   // optional chaining — undefined instead of a crash
user.missing?.deep   // undefined, no TypeError
```

Iterating:

```js run
const user = { name: 'Ada', age: 36 };

Object.keys(user);                   // ['name', 'age']
Object.values(user);                 // ['Ada', 36]
Object.entries(user);                // [['name','Ada'], ['age',36]]

for (const [key, value] of Object.entries(user)) {
  console.log(`${key} = ${value}`);
}
```

## Destructuring

```js run
const user = { name: 'Ada', age: 36, address: { city: 'Pune' } };

const { name, age } = user;
const { name: fullName } = user;              // rename
const { country = 'IN' } = user;              // default for a missing key
const { address: { city } } = user;           // nested
const { name: n, ...rest } = user;            // rest collects the remainder

const [first, second = 0, ...others] = [1];   // arrays too
console.log({ fullName, country, city, rest, first, second });
```

Destructuring in a parameter list is the standard way to accept an options object:

```js
function createUser({ name, role = 'member', active = true }) { /* ... */ }
createUser({ name: 'Ada', role: 'admin' });
```

## Spread, and the shallow-copy rule

```js run
const defaults = { theme: 'light', lang: 'en' };
const overrides = { theme: 'dark' };

const settings = { ...defaults, ...overrides };   // later wins
const numbers = [...[1, 2], ...[3, 4]];

console.log(settings, numbers);
```

```js run
const a = { nested: { x: 1 } };
const b = { ...a };
b.nested.x = 2;
console.log(a.nested.x);        // 2 — the inner object is SHARED
```

Spread copies one level. Everything below that is still the same object. This is the cause of a large share of "why did my state change?" bugs in React and similar frameworks.

```js
const deep = structuredClone(a);    // genuinely independent
```

## Grouping with reduce

The one reduce pattern worth memorising:

```js run
const people = [
  { name: 'Ada', team: 'eng' },
  { name: 'Alan', team: 'eng' },
  { name: 'Grace', team: 'ops' },
];

const byTeam = people.reduce((acc, person) => {
  (acc[person.team] ??= []).push(person.name);
  return acc;
}, {});

console.log(byTeam);
```

```output
{ eng: [ 'Ada', 'Alan' ], ops: [ 'Grace' ] }
```

`Object.groupBy(people, p => p.team)` does the same thing natively in current runtimes.

## What to remember

- `map`/`filter`/`find`/`some`/`every` replace most loops and say what they mean.
- `sort` mutates and stringifies — always pass a comparator and copy first.
- Spread and `{...obj}` are shallow; use `structuredClone` for deep copies.
- `?.` and `??` remove most defensive `if (x && x.y)` chains.
