---
title: Asynchronous JavaScript
description: The event loop, promises, async/await, error handling that actually catches things, and running work in parallel instead of in sequence.
keywords: [javascript async, promise, async await, event loop, fetch, promise.all, callback hell]
updated: 2026-10-10
quiz:
  - q: JavaScript is single-threaded. How does it handle concurrent work?
    options:
      - It spawns threads automatically
      - Long operations are handed to the environment, and their callbacks are queued and run when the call stack is empty
      - It does not — everything blocks
      - Through web workers only
    answer: 1
    explain: The engine runs one call stack. Timers, network requests and file I/O are handled outside it, and their callbacks are queued for the event loop.
  - q: What is wrong with awaiting inside a loop over independent requests?
    options:
      - Nothing
      - Each iteration waits for the previous one, making total time the sum rather than the maximum
      - It throws a syntax error
      - It only works with fetch
    answer: 1
    explain: Ten independent 200 ms requests take 2 s sequentially and about 200 ms with `Promise.all`. Sequential awaiting is correct only when each step depends on the previous.
  - q: Does `fetch` reject on a 404 response?
    options:
      - Yes, any non-200 rejects
      - "No — it only rejects on network failure; you must check `response.ok` yourself"
      - Only in Node.js
      - Only for POST requests
    answer: 1
    explain: A 404 is a successful HTTP exchange from fetch's point of view. This surprises nearly everyone once.
faq:
  - q: Is `async`/`await` better than `.then()`?
    a: For sequential logic, yes — it reads top to bottom and `try/catch` works normally. `.then()` is still convenient for a single transformation, and `Promise.all` is often cleaner than awaiting in sequence.
  - q: What happens to an unhandled promise rejection?
    a: "In browsers it fires `unhandledrejection` and logs an error. In Node.js it terminates the process by default. Always attach a `.catch` or wrap in `try/catch`."
---

JavaScript runs on a single thread. It stays responsive by handing slow work — network, timers, disk — to the environment and continuing. When that work finishes, its callback is queued and run once the call stack is clear.

## The event loop, briefly

```js run
console.log('1 — synchronous');

setTimeout(() => console.log('4 — macrotask'), 0);

Promise.resolve().then(() => console.log('3 — microtask'));

console.log('2 — synchronous');
```

```output
1 — synchronous
2 — synchronous
3 — microtask
4 — macrotask
```

Synchronous code runs to completion first. Then **all** queued microtasks (promise callbacks) drain. Then one macrotask (timer, I/O callback). `setTimeout(fn, 0)` does not mean "now" — it means "after the current work and all pending promise callbacks".

## Promises

A promise is an object representing a value that is not available yet. It is *pending*, then either *fulfilled* with a value or *rejected* with a reason, and never changes again.

```js
fetch('/api/users')
  .then(response => response.json())
  .then(users => console.log(users))
  .catch(error => console.error('failed:', error))
  .finally(() => console.log('done either way'));
```

Each `.then` returns a new promise, which is what makes chaining work. Returning a promise from inside a `.then` flattens it rather than nesting.

## async / await

The same chain, written as if it were sequential:

```js
async function loadUsers() {
  try {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const users = await response.json();
    return users;
  } catch (error) {
    console.error('failed:', error);
    return [];
  }
}
```

Two rules make this unsurprising:

- An `async` function **always returns a promise**, whatever you write in the `return`.
- `await` pauses that function only. The rest of the program keeps running.

:::danger
`fetch` rejects only on network failure. A 404 or a 500 is a perfectly successful HTTP exchange as far as it is concerned, so `response.ok` must be checked explicitly. Forgetting this means parsing an error page as JSON and getting a confusing syntax error instead of the real problem.
:::

## Sequential versus parallel

```js
// Sequential — 3 × 200 ms = 600 ms. Wrong, if the calls are independent.
const a = await fetchUser(1);
const b = await fetchUser(2);
const c = await fetchUser(3);

// Parallel — about 200 ms
const [a, b, c] = await Promise.all([fetchUser(1), fetchUser(2), fetchUser(3)]);
```

The loop version of the same mistake:

```js
// Slow
const users = [];
for (const id of ids) {
  users.push(await fetchUser(id));
}

// Fast
const users = await Promise.all(ids.map(id => fetchUser(id)));
```

Await in sequence only when a step genuinely needs the previous result.

### The four combinators

| Method | Resolves when | Rejects when |
|---|---|---|
| `Promise.all` | All fulfil | Any rejects — immediately |
| `Promise.allSettled` | All settle | Never |
| `Promise.race` | First settles | First settles, if it rejected |
| `Promise.any` | First fulfils | All reject |

`allSettled` is the one for "try all of these and tell me what happened":

```js run
const results = await Promise.allSettled([
  Promise.resolve('ok'),
  Promise.reject(new Error('nope')),
]);

console.log(results.map(r => r.status));   // ['fulfilled', 'rejected']
```

## Errors

```js
// try/catch catches awaited rejections
try {
  const data = await load();
} catch (error) {
  // handled
}

// It does NOT catch this — the rejection escapes the try block
try {
  load();           // no await
} catch (error) {
  // never runs
}
```

:::warning
A missing `await` turns a handled error into an unhandled rejection, and the function returns a pending promise instead of a value. Most linters have a rule for this (`no-floating-promises`); turn it on.
:::

## Timeouts and cancellation

```js
async function fetchWithTimeout(url, ms = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}
```

`AbortController` is the standard cancellation mechanism — it works with `fetch`, and with your own functions if you pass the signal through. The `finally` block ensures the timer is cleared on every path, including the error one.

## What to remember

- Synchronous code first, then microtasks, then one macrotask — that is the whole ordering rule.
- An `async` function always returns a promise; `await` pauses only that function.
- `fetch` does not reject on 4xx/5xx — check `response.ok`.
- Independent work goes in `Promise.all`; sequential awaiting is a deliberate choice, not a default.
