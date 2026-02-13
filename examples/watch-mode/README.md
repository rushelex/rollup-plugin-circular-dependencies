# Watch Mode Example

Demonstrates how `rollup-plugin-circular-dependencies` works in watch mode (`rollup --watch`).

## Setup

From the **repository root**:

```bash
pnpm install
pnpm -r run build
```

## Usage

```bash
cd examples/watch-mode
pnpm run watch
```

## Reproducing the Behavior

### Step 1: Start Watch Mode (No Cycles)

```bash
pnpm run watch
```

The initial source files have **no circular dependencies**.
Rollup builds successfully without warnings:

```
bundles src/index.js → dist...
created dist in XXms
```

### Step 2: Introduce a Circular Dependency

While the watcher is running, edit `src/b.js` and add an import from `a.js`:

```js
import { greet } from './a.js';  // ← add this line

export function format(message) {
  return `[${new Date().toISOString()}] ${message}`;
}
```

Rollup detects the change, rebuilds, and the plugin reports the cycle:

```
bundles src/index.js → dist...

src/a.js
    src/a.js -> src/b.js

(!) [plugin circular-dependencies] Circular dependencies detected: 1 cycle(s) found
created dist in XXms
```

### Step 3: Fix the Circular Dependency

Remove the import you added in `src/b.js`:

```js
export function format(message) {
  return `[${new Date().toISOString()}] ${message}`;
}
```

Rollup rebuilds and the cycle warning disappears:

```
bundles src/index.js → dist...
created dist in XXms
```

### Step 4: Stop Watching

Press `Ctrl+C` to stop the watcher.
