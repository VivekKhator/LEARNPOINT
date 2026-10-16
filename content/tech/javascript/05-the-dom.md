---
title: The DOM — Reading and Changing the Page
description: Selecting elements, changing content and classes safely, building nodes, and handling events with delegation.
keywords: [javascript dom, queryselector, addeventlistener, textcontent innerhtml, event delegation, classlist]
updated: 2026-10-10
quiz:
  - q: Why prefer `textContent` over `innerHTML` when inserting user-supplied text?
    options:
      - It is shorter to type
      - "`innerHTML` parses the string as HTML, so a crafted value can inject script — `textContent` always inserts literal text"
      - "`textContent` is faster only"
      - They are identical
    answer: 1
    explain: This is the classic DOM-based XSS vector. Use textContent for text, and only use innerHTML with markup you constructed yourself.
  - q: What is event delegation?
    options:
      - Attaching a listener to each child element
      - Attaching one listener to a common ancestor and using `event.target` to identify the source
      - Delegating events to a web worker
      - Removing all listeners
    answer: 1
    explain: One listener handles any number of children, including ones added later. It is both faster and simpler than attaching and removing listeners per element.
  - q: What does `event.preventDefault()` do?
    options:
      - Stops the event reaching ancestor elements
      - Cancels the browser's default action, such as following a link or submitting a form
      - Deletes the event
      - Pauses the page
    answer: 1
    explain: "Stopping propagation to ancestors is `stopPropagation()` — a different thing, and one to use sparingly."
faq:
  - q: Should I learn the DOM before a framework?
    a: Yes. Frameworks are abstractions over exactly this. Debugging React or Vue means reading the DOM they produced, and plenty of small features never need a framework at all.
  - q: Why is my script finding no elements?
    a: It almost certainly ran before the elements existed. Add `defer` to the script tag, or use `type="module"`, both of which run after the document is parsed.
---

The DOM is the browser's live, tree-shaped representation of the page. Changing it changes what the user sees.

## Selecting elements

```js
document.querySelector('#title');          // first match for any CSS selector
document.querySelectorAll('.card');        // all matches — a static NodeList
document.getElementById('title');          // marginally faster, id only

const list = document.querySelector('#list');
list.querySelector('li');                  // scoped to that subtree
```

`querySelectorAll` returns a `NodeList`, not an array. It has `forEach`, but for `map` or `filter` convert first: `[...document.querySelectorAll('.card')]`.

## Changing content

```js
const title = document.querySelector('#title');

title.textContent = 'New heading';          // plain text — safe
title.innerHTML = '<em>New</em> heading';   // parsed as HTML — only for trusted markup
title.insertAdjacentHTML('beforeend', '<span>!</span>');
```

:::danger
`element.innerHTML = userInput` is the single most common cross-site scripting bug in front-end code. A value like `<img src=x onerror=alert(1)>` executes. Use `textContent` for anything a user supplied, and build structure with `createElement` rather than string concatenation.
:::

## Attributes, classes and styles

```js
const button = document.querySelector('#go');

button.setAttribute('aria-expanded', 'true');
button.getAttribute('data-id');
button.dataset.id;                       // data-id attribute, as a property

button.classList.add('is-active');
button.classList.remove('is-loading');
button.classList.toggle('is-open');            // flip it
button.classList.toggle('is-open', isOpen);    // force a state
button.classList.contains('is-active');

button.style.setProperty('--accent', '#0b5cff');
```

Prefer toggling a class over writing inline styles. The appearance stays in the stylesheet where it can be themed, and the JavaScript stays about state.

## Creating and inserting nodes

```js run
const list = document.createElement('ul');
const items = ['Read', 'Run', 'Check'];

const fragment = document.createDocumentFragment();
for (const text of items) {
  const li = document.createElement('li');
  li.textContent = text;
  li.className = 'item';
  fragment.append(li);
}
list.append(fragment);        // one DOM insertion, not three
document.body.append(list);

console.log(document.body.innerHTML);
```

A `DocumentFragment` is an off-screen container. Building inside it and appending once means the browser recalculates layout a single time instead of per element — the difference is visible at a few hundred nodes.

## Events

```js
const button = document.querySelector('#go');

button.addEventListener('click', (event) => {
  console.log('clicked', event.target);
});
```

The handler receives an event object. The parts you will use:

| Property / method | Meaning |
|---|---|
| `event.target` | The element the event originated on |
| `event.currentTarget` | The element the listener is attached to |
| `event.preventDefault()` | Cancel the browser's default action |
| `event.stopPropagation()` | Stop the event travelling to ancestors |
| `event.key` | Which key, for keyboard events |

### Delegation

Instead of a listener per row, attach one to the container:

```html run title=delegation.html
<!doctype html>
<html>
  <body>
    <ul id="todos">
      <li><button data-action="done">Task A</button></li>
      <li><button data-action="done">Task B</button></li>
    </ul>
    <button id="add">Add a task</button>
    <p id="log"></p>

    <script>
      const todos = document.getElementById('todos');
      const log = document.getElementById('log');
      let n = 2;

      // One listener covers every button, including ones added later.
      todos.addEventListener('click', (event) => {
        const button = event.target.closest('[data-action="done"]');
        if (!button) return;
        button.closest('li').remove();
        log.textContent = 'Removed: ' + button.textContent;
      });

      document.getElementById('add').addEventListener('click', () => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.dataset.action = 'done';
        button.textContent = 'Task ' + String.fromCharCode(65 + n++);
        li.append(button);
        todos.append(li);
      });
    </script>
  </body>
</html>
```

`event.target.closest(selector)` walks up from the clicked node until it finds a match. It handles the case where the click landed on an icon *inside* the button, which a bare `event.target.matches(...)` check would miss.

### Forms

```js
form.addEventListener('submit', (event) => {
  event.preventDefault();                    // stop the page reloading
  const data = Object.fromEntries(new FormData(form));
  console.log(data);                         // { email: '...', password: '...' }
});
```

`FormData` plus `Object.fromEntries` reads every named field without touching them individually.

## Performance notes

- Reading a layout property (`offsetHeight`, `getBoundingClientRect`) forces the browser to flush pending style changes. Alternating reads and writes in a loop causes **layout thrashing** — batch all reads, then all writes.
- Use `requestAnimationFrame` for visual updates rather than `setTimeout`.
- One delegated listener beats a thousand individual ones, in both memory and setup cost.

## What to remember

- `textContent` for user data; `innerHTML` only for markup you built.
- Toggle classes, do not write inline styles.
- Build in a fragment, insert once.
- Delegate events to a container and use `closest()` to identify the source.
