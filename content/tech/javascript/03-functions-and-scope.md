---
title: Functions, Scope and Closures
description: Function declarations versus arrow functions, lexical scope, closures as a deliberate tool, and what `this` actually binds to.
keywords: [javascript functions, arrow function, closure, lexical scope, this keyword, hoisting, callback]
updated: 2026-10-09
quiz:
  - q: What is a closure?
    options:
      - A function that has finished executing
      - A function together with the scope it was defined in, which it keeps access to after that scope returns
      - A way to close a browser tab
      - A function with no arguments
    answer: 1
    explain: The inner function keeps a live reference to the outer variables. That is how private state and factory functions work in JavaScript.
  - q: How does `this` differ inside an arrow function?
    options:
      - It is always undefined
      - Arrow functions have no own `this`; they use the `this` of the enclosing scope
      - It always refers to window
      - It refers to the function itself
    answer: 1
    explain: That is exactly why arrows are preferred for callbacks inside methods — and exactly why they are wrong as object methods that need the object as `this`.
  - q: What does this log? `const f = () => 1; console.log(typeof f)`
    options: ["'arrow'", "'function'", "'object'", "'undefined'"]
    answer: 1
    explain: Arrow functions are functions. The differences are in `this`, `arguments`, and the absence of a prototype — not in their type.
faq:
  - q: When should I use a function declaration instead of an arrow?
    a: Use a declaration for named, top-level functions — they hoist, so order in the file does not matter, and they show a useful name in stack traces. Use arrows for short callbacks and anywhere you want the enclosing `this`.
  - q: Are closures a memory leak?
    a: Not inherently, but a closure keeps its captured variables alive. A long-lived callback that closes over a large object keeps that object in memory. Capture only what you need.
---

## Three ways to define a function

```js
function add(a, b) {        // declaration — hoisted
  return a + b;
}

const sub = function (a, b) {   // expression — not hoisted
  return a - b;
};

const mul = (a, b) => a * b;    // arrow — implicit return
```

Arrow syntax has a few forms worth recognising:

```js
x => x * 2                  // one parameter, no brackets needed
(x, y) => x + y             // multiple parameters
() => 42                    // none
x => ({ value: x })         // returning an object literal needs brackets
x => { return x * 2; }      // a block body needs an explicit return
```

:::warning
`x => { value: x }` does not return an object. The braces are read as a function body and `value:` as a label, so the function returns `undefined`. Wrap the object in round brackets.
:::

## Hoisting

```js run
console.log(declared(2));      // 4 — works

function declared(n) { return n * 2; }

try {
  console.log(expressed(2));   // ReferenceError
} catch (e) {
  console.log(e.constructor.name);
}

const expressed = n => n * 2;
```

Function *declarations* are fully hoisted — defined before any code runs. `const` and `let` bindings are hoisted too, but sit in a "temporal dead zone" until the declaration line executes, so touching them early throws rather than giving `undefined`.

## Parameters

```js
function greet(name, greeting = 'Hello', ...rest) {
  console.log(greeting, name, rest);
}

greet('Ada');                        // Hello Ada []
greet('Ada', 'Hi', 1, 2, 3);         // Hi Ada [1, 2, 3]

// Destructuring with defaults — common for options objects
function connect({ host = 'localhost', port = 5432, secure = false } = {}) {
  return `${secure ? 'https' : 'http'}://${host}:${port}`;
}
connect();                           // http://localhost:5432
connect({ port: 8080, secure: true });
```

The `= {}` at the end matters: without it, calling `connect()` with no argument tries to destructure `undefined` and throws.

## Lexical scope

A function can see the variables of the scope it was **written in**, not the one it is called from:

```js
const outer = 'visible';

function inner() {
  console.log(outer);      // works — lexical scope
}
```

Scope nests outward: block → function → module → global. The first match wins.

## Closures

A closure is a function bundled with the scope it was created in. The outer function returns, and its variables stay alive because the inner function still refers to them.

```js run
function makeCounter(start = 0) {
  let count = start;                 // private — nothing outside can touch it
  return {
    increment: () => ++count,
    value: () => count,
  };
}

const counter = makeCounter(10);
counter.increment();
counter.increment();
console.log(counter.value());        // 12
console.log(counter.count);          // undefined — genuinely private
```

This is the standard way to get private state in JavaScript. The same mechanism powers memoisation, once-only functions, and every callback that "remembers" something.

```js run
function once(fn) {
  let called = false;
  let result;
  return (...args) => {
    if (!called) { called = true; result = fn(...args); }
    return result;
  };
}

const init = once(() => { console.log('initialising'); return 'ready'; });
console.log(init(), init(), init());   // logs once, returns 'ready' three times
```

:::danger
A closure captures the **variable**, not its value at capture time. In a loop with `var`, every closure shares one binding and sees the final value. With `let`, each iteration gets its own.
:::

## this

`this` is determined by **how a function is called**, not where it is defined — except for arrows, which have no `this` of their own.

```js run
const user = {
  name: 'Ada',
  regular() { return this.name; },
  arrow: () => (typeof this === 'undefined' ? 'no this' : 'module this'),
};

console.log(user.regular());    // 'Ada'  — called as a method
const detached = user.regular;
console.log(detached?.());      // undefined — `this` is no longer user
```

The four binding rules, in precedence order:

1. `new Foo()` → `this` is the new object.
2. `fn.call(obj)` / `fn.apply(obj)` / `fn.bind(obj)` → `this` is `obj`.
3. `obj.fn()` → `this` is `obj`.
4. Plain `fn()` → `undefined` in strict mode (modules are always strict).

Arrows skip all four and inherit from the enclosing scope. That makes them right for callbacks inside a method:

```js
class Timer {
  constructor() { this.seconds = 0; }
  start() {
    setInterval(() => { this.seconds++; }, 1000);   // arrow keeps `this`
  }
}
```

and wrong as the method itself — `arrow: () => this.name` would not see the object.

## What to remember

- Declarations hoist; `const`/`let` bindings throw if touched early.
- A closure keeps its outer scope alive — the basis of private state.
- `this` depends on the call site, except in arrows, which have none.
- Arrows for callbacks, declarations for named top-level functions.
