---
title: Introduction to JavaScript
description: Where JavaScript runs, what the language is responsible for versus what the browser provides, and how to run your first script.
keywords: [what is javascript, javascript engine, ecmascript, browser console, node js]
updated: 2026-10-08
quiz:
  - q: What is the relationship between JavaScript and ECMAScript?
    options:
      - They are unrelated languages
      - ECMAScript is the language specification; JavaScript is the implementation of it that engines ship
      - ECMAScript replaced JavaScript in 2015
      - ECMAScript only runs on servers
    answer: 1
    explain: TC39 publishes the ECMAScript specification each year. Engines such as V8 and SpiderMonkey implement it, and the result is what everyone calls JavaScript.
  - q: Is `document.querySelector` part of the JavaScript language?
    options:
      - Yes, it is in the specification
      - "No — it comes from the DOM API the browser provides; the language itself has no concept of a document"
      - Only in modern browsers
      - Only in Node.js
    answer: 1
    explain: The language gives you values, functions and objects. The browser supplies the DOM, fetch, timers and storage. Node.js supplies a different set, which is why `document` does not exist there.
faq:
  - q: Do I need to install anything to start?
    a: No. Every browser has a JavaScript console — F12 or Cmd+Option+I — and it will run anything in this tutorial.
  - q: Is TypeScript a different language?
    a: TypeScript is JavaScript plus a static type system that is erased at build time. Every valid JavaScript file is valid TypeScript. Learn JavaScript first; the types make much more sense once you know what they are describing.
---

JavaScript started as a scripting language for web pages and is now the only language that runs natively in every browser. Through Node.js, Deno and Bun it also runs on servers, in build tools and on the command line.

## Language versus environment

This distinction clears up a lot of early confusion:

| Provided by the **language** | Provided by the **environment** |
|---|---|
| Numbers, strings, objects, arrays | `document`, `window` (browser) |
| Functions, classes, closures | `fetch`, `localStorage` (browser) |
| `Promise`, `async`/`await` | `setTimeout`, `console` (both) |
| `Map`, `Set`, `JSON` | `fs`, `process` (Node.js) |

`console.log` is not in the specification. Neither is `fetch`. They are supplied by whatever is hosting the engine — which is why code that works in a browser can fail in Node.js and vice versa.

## Running your first script

In a browser, open the console and type directly. In a file:

```html run title=index.html
<!doctype html>
<html>
  <body>
    <h1 id="title">Hello</h1>
    <button id="go">Change it</button>

    <script>
      const title = document.getElementById('title');
      const button = document.getElementById('go');
      let clicks = 0;

      button.addEventListener('click', () => {
        clicks += 1;
        title.textContent = `Clicked ${clicks} time${clicks === 1 ? '' : 's'}`;
      });
    </script>
  </body>
</html>
```

Press **Try it yourself** above to open that in the playground and change it.

Three things are already on display: `const` and `let` for declarations, template literals with backticks, and an arrow function passed as an event handler. All three are the modern default.

## Script loading matters

```html
<script src="app.js"></script>           <!-- blocks parsing until fetched and run -->
<script src="app.js" defer></script>     <!-- downloads in parallel, runs after parsing -->
<script src="app.js" async></script>     <!-- downloads in parallel, runs as soon as ready -->
<script type="module" src="app.js"></script>  <!-- deferred by default, supports import -->
```

Use `defer` or `type="module"` for application code. A plain `<script>` in the `<head>` stops the browser from building the page until the file arrives, which is the single easiest way to make a fast site feel slow.

:::note
`type="module"` also changes the rules: modules are always strict mode, have their own scope rather than polluting `window`, and support `import`/`export`. For anything beyond a one-liner, that is what you want.
:::

## Yearly versions

ECMAScript 2015 (also called ES6) was the big one — `let`/`const`, arrow functions, classes, modules, promises, template literals. Since then a smaller set of features lands each year. Anything in ES2015 is safe in every browser in current use; anything from the last two years deserves a compatibility check.

## The console is the tool

```js run
const user = { name: 'Ada', roles: ['admin', 'dev'] };

console.log(user);              // expandable object
console.table(user.roles);      // array as a table
console.time('loop');
for (let i = 0; i < 1e6; i++);
console.timeEnd('loop');        // prints elapsed time
```

`console.table` and `console.time` are worth knowing — they replace a surprising amount of ad-hoc debugging code.

## What to remember

- The language and the environment are separate; `document` belongs to the browser.
- Load application scripts with `defer` or as modules.
- Modules are strict, scoped and importable — use them.
- The console is a real development tool, not just `log`.
