# React

> A component-based library for building UIs from small, composable pieces of state and view. The dominant way to build interactive web frontends.

## Concepts

- **Component:** a function that takes **props** and returns UI (JSX). The unit of composition.
- **Props:** read-only inputs passed from parent to child. A component never mutates its props.
- **State:** data a component owns and can change over time; changing it re-renders the component.
- **Hooks:** functions that add capabilities to components.
  - `useState` — local state plus its setter.
  - `useEffect` — run a side effect (subscriptions, fetches) after render, with a dependency array
    controlling when it re-runs.
- **Composition:** build complex UIs by nesting small components, passing data down via props and
  `children`.
- **Lifting state up:** when two components need the same data, move it to their nearest common parent
  and pass it down.
- **Keys:** a stable, unique `key` on each item in a list lets React track elements across renders.
- **Controlled inputs:** the form value lives in state; the input reflects state and updates it on
  change.

## Best Practices

- Keep components small and focused; derive values during render instead of mirroring props into state.
- Give every list item a stable `key` (an ID, never the array index for dynamic lists).
- Use `useEffect` only for *synchronizing with external systems* (network, subscriptions, the DOM) —
  not for computing derived data.
- Lift shared state to the closest common parent; reach for context only when prop-passing gets deep.

## Patterns & Examples

```jsx
import { useState } from 'react';

// A small, self-contained component with controlled input and derived UI.
function SearchableList({ items }) {
  const [query, setQuery] = useState('');           // owned state

  // Derived during render — no extra state, no effect needed.
  const visible = items.filter((it) =>
    it.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <label htmlFor="q">Filter</label>
      <input
        id="q"
        value={query}                                // controlled: value from state
        onChange={(e) => setQuery(e.target.value)}   // update state on change
      />
      <ul>
        {visible.map((it) => (
          <li key={it.id}>{it.name}</li>             {/* stable key */}
        ))}
      </ul>
    </div>
  );
}
```

## Common Pitfalls / Anti-patterns

- **Effect misuse:** using `useEffect` to compute derived state from props/state. That's just a
  calculation during render — an effect adds an extra render and bugs. Compute it inline.
- **Index as key:** `key={index}` on a reorderable/filterable list confuses React's reconciliation,
  causing wrong items to update. Use a stable ID.
- **Prop drilling:** threading a prop through many intermediate components that don't use it. Lift to
  context or restructure when it gets painful.
- **Mutating state directly:** `state.push(x)` won't re-render; create a new value
  (`setItems([...items, x])`).

## References

- React documentation — https://react.dev/
- You Might Not Need an Effect — https://react.dev/learn/you-might-not-need-an-effect
- Rules of Hooks — https://react.dev/reference/rules/rules-of-hooks

<!-- level: intermediate -->
