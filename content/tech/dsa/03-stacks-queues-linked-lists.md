---
title: Stacks, Queues and Linked Lists
description: Structures defined by their access rules — LIFO, FIFO and pointer-linked nodes — and the problems each one makes easy.
keywords: [stack, queue, linked list, lifo, fifo, deque, call stack, bfs]
updated: 2026-10-08
quiz:
  - q: Which structure matches balanced-bracket checking?
    options: ["Queue", "Stack", "Hash table", "Binary tree"]
    answer: 1
    explain: Push each opening bracket, pop on each closing one and check that it matches. The most recently opened bracket must close first — exactly LIFO.
  - q: What is a linked list's main advantage over an array?
    options:
      - Faster index access
      - Insertion and deletion at a known position is O(1) with no shifting
      - Less memory
      - Better cache behaviour
    answer: 1
    explain: There is no contiguous block to shift. The costs are O(n) index access, extra memory per node and poor cache locality.
  - q: Why use `collections.deque` instead of a list for a queue in Python?
    options:
      - It is sorted
      - "`list.pop(0)` is O(n) because every element shifts; `deque.popleft()` is O(1)"
      - deque uses less memory
      - Lists cannot hold queue data
    answer: 1
    explain: A list used as a queue is O(n) per dequeue, which makes a loop over n items O(n²). A deque is doubly linked in blocks and pops from either end in constant time.
faq:
  - q: Do I need to implement a linked list in real work?
    a: Almost never — language runtimes provide better-tuned structures. You need to understand it because LRU caches, queues and tree and graph traversal all rest on the same pointer-following idea, and interviewers test it.
  - q: What is the difference between a stack and the call stack?
    a: The same data structure, used by the runtime. Each function call pushes a frame; returning pops it. Infinite recursion overflows it, which is what "stack overflow" literally means.
---

Arrays and hash tables are defined by their layout. Stacks and queues are defined by a **rule about access** — and that restriction is what makes certain algorithms obvious.

## Stack — last in, first out

Only the most recently added item is reachable.

```python
stack = []
stack.append('a')      # push   O(1)
stack.append('b')
top = stack[-1]        # peek   O(1)
item = stack.pop()     # pop    O(1) → 'b'
```

A Python list is already a stack; appending and popping at the end are both O(1).

**Balanced brackets** — the canonical example:

```python
def is_balanced(text):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for char in text:
        if char in '([{':
            stack.append(char)
        elif char in pairs:
            if not stack or stack.pop() != pairs[char]:
                return False
    return not stack       # anything left open means unbalanced
```

```python
is_balanced("{[()]}")    # True
is_balanced("{[(])}")    # False
```

Stacks also underpin undo histories, expression evaluation, back-button navigation, depth-first traversal, and the call stack itself.

:::note
Any recursive algorithm can be rewritten iteratively with an explicit stack. That is occasionally necessary when the recursion depth would overflow — Python's default limit is around 1,000 frames.
:::

## Queue — first in, first out

The oldest item is served first.

```python
from collections import deque

queue = deque()
queue.append('a')        # enqueue    O(1)
queue.append('b')
item = queue.popleft()   # dequeue    O(1) → 'a'
```

:::danger
Do not use a plain list as a queue. `list.pop(0)` shifts every remaining element left — O(n) per dequeue, so processing n items becomes O(n²). On 100,000 items that is the difference between instant and roughly a minute.
:::

Queues model anything processed in arrival order: job queues, request buffers, print spoolers — and **breadth-first search**, which is how you find the shortest path in an unweighted graph:

```python
from collections import deque

def shortest_path_length(graph, start, goal):
    queue = deque([(start, 0)])
    visited = {start}
    while queue:
        node, distance = queue.popleft()
        if node == goal:
            return distance
        for neighbour in graph[node]:
            if neighbour not in visited:
                visited.add(neighbour)
                queue.append((neighbour, distance + 1))
    return -1
```

Swap the `deque` for a stack and you get depth-first search — which finds *a* path, not the shortest one. The only difference between the two algorithms is which end you take from.

## Deque — both ends

A double-ended queue supports O(1) insertion and removal at either end. It is the right structure for sliding-window maxima, undo/redo pairs, and fixed-size recent-history buffers:

```python
from collections import deque
recent = deque(maxlen=5)     # automatically drops the oldest
for page in pages:
    recent.append(page)
```

## Linked lists

A linked list stores each element in a node that holds a value and a reference to the next node. Nothing is contiguous.

```python
class Node:
    def __init__(self, value, next_node=None):
        self.value = value
        self.next = next_node

# 1 → 2 → 3 → None
head = Node(1, Node(2, Node(3)))
```

| Operation | Linked list | Array |
|---|---|---|
| Access by index | O(n) | O(1) |
| Insert/delete at a known node | O(1) | O(n) |
| Insert/delete at the front | O(1) | O(n) |
| Search | O(n) | O(n) |
| Memory overhead | A pointer per node | None |
| Cache behaviour | Poor | Excellent |

The trade is clear: linked lists win when you are constantly inserting and removing in the middle and already hold a reference to the position. Arrays win at almost everything else, and the cache advantage is larger than the table suggests.

### Two classic manipulations

**Reversing**, in place, O(n) time and O(1) space:

```python
def reverse(head):
    previous = None
    current = head
    while current:
        following = current.next    # save the rest
        current.next = previous     # flip the pointer
        previous = current          # advance
        current = following
    return previous                 # new head
```

**Cycle detection** — Floyd's two-pointer algorithm. A slow pointer moves one node at a time, a fast one moves two. If there is a loop, they must eventually meet:

```python
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False
```

O(n) time, O(1) space — no set of visited nodes required.

## Choosing

| Need | Structure |
|---|---|
| Most recent first, undo, DFS | Stack |
| Oldest first, BFS, job processing | Queue (`deque`) |
| Fast at both ends, bounded history | Deque |
| Constant-time splice at a held position | Linked list |
| Anything else | Array |

## What to remember

- Stack = LIFO, queue = FIFO; the access rule is what makes the algorithm fall out.
- Never use `list.pop(0)` as a dequeue — it is O(n).
- BFS and DFS differ only in stack versus queue.
- Linked lists trade index access and cache locality for O(1) splicing.
