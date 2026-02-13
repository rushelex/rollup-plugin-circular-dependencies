# rollup-plugin-circular-dependencies

**Detect and report circular dependencies in your Rollup & Vite projects.**

[![npm version](https://img.shields.io/npm/v/rollup-plugin-circular-dependencies)](https://www.npmjs.com/package/rollup-plugin-circular-dependencies)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/rollup-plugin-circular-dependencies)](https://bundlephobia.com/package/rollup-plugin-circular-dependencies)
[![npm downloads](https://img.shields.io/npm/dm/rollup-plugin-circular-dependencies)](https://www.npmjs.com/package/rollup-plugin-circular-dependencies)
[![license](https://img.shields.io/npm/l/rollup-plugin-circular-dependencies)](./LICENSE)

---

A Rollup/Vite plugin that analyses your module graph using [Tarjan's algorithm](https://en.wikipedia.org/wiki/Tarjan%27s_strongly_connected_components_algorithm) and reports every circular dependency it finds. It replaces Rollup's built-in circular dependency warnings with richer, configurable output — including pretty-printed console logs, JSON file reports, per-cycle filtering, lifecycle hooks, and detection metrics.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [`circularDependencies()`](#circularDependenciesoptions)
  - [`DefaultFormatters`](#defaultformatters)
  - [`Options`](#options)
  - [`Metrics`](#metrics)
  - [`CircularDependenciesData`](#circulardependenciesdata)
- [Configuration / Options](#configuration--options)
- [Advanced Usage](#advanced-usage)
  - [Vite Integration](#vite-integration)
  - [Output to File](#output-to-file)
  - [Custom Formatters](#custom-formatters)
  - [Lifecycle Hooks](#lifecycle-hooks)
  - [Ignoring Specific Cycles](#ignoring-specific-cycles)
  - [Custom Module Path Formatting](#custom-module-path-formatting)
  - [Debug Mode](#debug-mode)
  - [Watch Mode](#watch-mode)
- [Compatibility & Peer Dependencies](#compatibility--peer-dependencies)
- [Troubleshooting / FAQ](#troubleshooting--faq)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

## Installation

```bash
# npm
npm install -D rollup-plugin-circular-dependencies

# pnpm
pnpm add -D rollup-plugin-circular-dependencies

# yarn
yarn add -D rollup-plugin-circular-dependencies
```

## Quick Start

```ts
// rollup.config.js
import { circularDependencies } from 'rollup-plugin-circular-dependencies';

export default {
  input: 'src/index.js',
  output: { dir: 'dist', format: 'esm' },
  plugins: [circularDependencies()],
};
```

If circular dependencies exist, the build will **error** by default. Set `throwOnError: false` to emit warnings instead.

## API Reference

### `circularDependencies(options?)`

Creates a Rollup plugin instance that detects circular dependencies in your project.

**Signature:**

```ts
function circularDependencies(options?: Options): Plugin;
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | [`Options`](#options) | Plugin configuration. All fields are optional. |

**Returns:** `Plugin` — a Rollup plugin object.

**Example:**

```ts
import { circularDependencies } from 'rollup-plugin-circular-dependencies';

// Zero-config — errors on any cycle
circularDependencies();

// Warn instead of error
circularDependencies({ throwOnError: false });
```

---

### `DefaultFormatters`

An object containing built-in output formatters.

#### `DefaultFormatters.JSON()`

Creates a JSON formatter that serializes cycle data with 2-space indentation.

**Signature:**

```ts
function JSON(): (data: CircularDependenciesData) => string;
```

**Returns:** A formatter function producing a JSON string.

**Example:**

```ts
import { circularDependencies, DefaultFormatters } from 'rollup-plugin-circular-dependencies';

circularDependencies({
  formatOut: DefaultFormatters.JSON(),
});
```

#### `DefaultFormatters.Pretty(config?)`

Creates a human-readable formatter with optional color support. Colors are enabled by default unless disabled via environment variables (`NO_COLOR`, `NODE_DISABLE_COLORS`, or `FORCE_COLOR=0`).

**Signature:**

```ts
function Pretty(config?: { colors?: boolean }): (data: CircularDependenciesData) => string;
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `config.colors` | `boolean` | `true` (unless env-disabled) | Enable ANSI color output |

**Returns:** A formatter function producing a styled string.

**Example:**

```ts
import { circularDependencies, DefaultFormatters } from 'rollup-plugin-circular-dependencies';

// Disable colors explicitly
circularDependencies({
  formatOut: DefaultFormatters.Pretty({ colors: false }),
});
```

---

### `Options`

Configuration object for the plugin. All fields are optional.

```ts
interface Options {
  enabled?: boolean;
  include?: FilterPattern;
  exclude?: FilterPattern;
  throwOnError?: boolean;
  outputFilePath?: string;
  debug?: boolean;
  formatOutModulePath?: (path: string) => string;
  formatOut?: (data: CircularDependenciesData) => unknown;
  ignoreCycle?: (cyclePaths: string[]) => boolean;
  onStart?: (pluginContext: PluginContext) => void;
  onDetected?: (modulePath: string, pluginContext: PluginContext) => void;
  onEnd?: (params: { rawOutput: CircularDependenciesData; formattedOutput: unknown; metrics: Metrics }, pluginContext: PluginContext) => void;
}
```

See the [Configuration / Options](#configuration--options) table for detailed descriptions.

---

### `Metrics`

Metrics collected during circular dependency detection. Provided in the `onEnd` callback.

```ts
interface Metrics {
  readonly modulesChecked: number;
  readonly cyclesFound: number;
  readonly largestCycleSize: number;
  readonly detectionTimeMs: number;
}
```

| Field | Type | Description |
|-------|------|-------------|
| `modulesChecked` | `number` | Total number of modules analyzed |
| `cyclesFound` | `number` | Number of unique cycles detected |
| `largestCycleSize` | `number` | Number of modules in the largest cycle |
| `detectionTimeMs` | `number` | Detection time in milliseconds |

---

### `CircularDependenciesData`

The raw data structure representing detected cycles, grouped by entry module.

```ts
type CircularDependenciesData = Record<string, string[][]>;
```

Each key is a module ID (file path). Each value is an array of cycles, where each cycle is an array of module IDs forming the circular chain.

**Example value:**

```json
{
  "src/a.ts": [
    ["src/a.ts", "src/b.ts"],
    ["src/a.ts", "src/c.ts", "src/d.ts"]
  ]
}
```

## Configuration / Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable or disable the plugin entirely. |
| `include` | `FilterPattern` | `[/\.(c\|m)?[jt]s(x)?$/]` | Glob or RegExp patterns for files to include. |
| `exclude` | `FilterPattern` | `[/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/]` | Glob or RegExp patterns for files to exclude. `node_modules` and `.git` are always excluded. |
| `throwOnError` | `boolean` | `true` | `true` = build error on detected cycles. `false` = warning only. |
| `outputFilePath` | `string` | `""` | Path to write results to a file. Empty string = console output. |
| `debug` | `boolean` | `false` | Enable verbose debug logging (module count, timing, cycle details). |
| `formatOutModulePath` | `(path: string) => string` | `path.relative(cwd, path)` | Transform module paths in the output. |
| `formatOut` | `(data: CircularDependenciesData) => unknown` | `Pretty()` (console) / `JSON()` (file) | Custom formatter for the output data. |
| `ignoreCycle` | `(cyclePaths: string[]) => boolean` | `() => false` | Return `true` to ignore a specific cycle. Receives the array of module paths forming the cycle. |
| `onStart` | `(pluginContext: PluginContext) => void` | `() => {}` | Called before cycle detection starts. |
| `onDetected` | `(modulePath: string, pluginContext: PluginContext) => void` | `() => {}` | Called for each module that is part of a cycle. |
| `onEnd` | `(params, pluginContext: PluginContext) => void` | `() => {}` | Called after detection completes. Receives `{ rawOutput, formattedOutput, metrics }`. |

> **Note:** `FilterPattern` is the type from [`@rollup/pluginutils`](https://github.com/rollup/plugins/tree/master/packages/pluginutils) — it accepts `string | RegExp | Array<string | RegExp> | null`.

## Advanced Usage

### Vite Integration

The plugin works with Vite out of the box:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { circularDependencies } from 'rollup-plugin-circular-dependencies';

export default defineConfig({
  plugins: [
    circularDependencies({
      throwOnError: false,
    }),
  ],
});
```

### Output to File

Write detection results to a file instead of the console. When `outputFilePath` is set, the default formatter automatically switches to `DefaultFormatters.JSON()`.

```ts
import { circularDependencies } from 'rollup-plugin-circular-dependencies';

circularDependencies({
  outputFilePath: './reports/circular-deps.json',
  throwOnError: false,
});
```

To use the pretty formatter for file output instead:

```ts
import { circularDependencies, DefaultFormatters } from 'rollup-plugin-circular-dependencies';

circularDependencies({
  outputFilePath: './reports/circular-deps.txt',
  formatOut: DefaultFormatters.Pretty({ colors: false }),
});
```

### Custom Formatters

Replace the built-in formatters with your own:

```ts
import { circularDependencies } from 'rollup-plugin-circular-dependencies';

circularDependencies({
  formatOut: (data) => {
    const allCycles = Object.values(data).flat();
    const summary = allCycles.map((cycle) => cycle.join(' → ')).join('\n');
    return `Found ${allCycles.length} cycle(s):\n${summary}`;
  },
});
```

### Lifecycle Hooks

Use lifecycle hooks to integrate with your CI pipeline, logging, or monitoring:

```ts
import { circularDependencies } from 'rollup-plugin-circular-dependencies';

circularDependencies({
  throwOnError: false,

  onStart: (pluginContext) => {
    console.log('Scanning for circular dependencies...');
  },

  onDetected: (modulePath, pluginContext) => {
    console.log(`Cycle member: ${modulePath}`);
  },

  onEnd: ({ rawOutput, formattedOutput, metrics }, pluginContext) => {
    console.log(`Checked ${metrics.modulesChecked} modules`);
    console.log(`Found ${metrics.cyclesFound} cycle(s)`);
    console.log(`Largest cycle: ${metrics.largestCycleSize} modules`);
    console.log(`Detection took ${metrics.detectionTimeMs.toFixed(1)}ms`);

    // Example: fail CI if too many cycles
    if (metrics.cyclesFound > 10) {
      process.exit(1);
    }
  },
});
```

### Ignoring Specific Cycles

Filter out known or acceptable cycles using the `ignoreCycle` callback:

```ts
import { circularDependencies } from 'rollup-plugin-circular-dependencies';

circularDependencies({
  ignoreCycle: (cyclePaths) => {
    // Ignore cycles in generated code
    if (cyclePaths.some((p) => p.includes('/generated/'))) {
      return true;
    }

    // Ignore a specific known cycle
    if (cyclePaths.some((p) => p.endsWith('store/index.ts'))) {
      return true;
    }

    return false;
  },
});
```

### Custom Module Path Formatting

By default, output paths are relative to the current working directory. Customize this behavior with `formatOutModulePath`:

```ts
import { circularDependencies } from 'rollup-plugin-circular-dependencies';

circularDependencies({
  // Strip everything before 'src/'
  formatOutModulePath: (modulePath) => {
    const srcIndex = modulePath.indexOf('src/');
    return srcIndex >= 0 ? modulePath.slice(srcIndex) : modulePath;
  },
});
```

### Debug Mode

Enable verbose logging to see detection details in the Rollup info channel:

```ts
circularDependencies({
  debug: true,
});
```

Output example:

```
[circular-dependencies] Checked 142 modules in 3.2ms. Found 2 cycle(s), largest cycle size: 3.
[circular-dependencies] Cycle: src/a.ts → src/a.ts → src/b.ts
[circular-dependencies] Cycle: src/c.ts → src/c.ts → src/d.ts → src/e.ts
```

### Watch Mode

The plugin fully supports Rollup's watch mode. Internal state is automatically reset on each rebuild, ensuring accurate results without stale data or memory leaks.

```ts
// rollup.config.js
import { circularDependencies } from 'rollup-plugin-circular-dependencies';

export default {
  input: 'src/index.js',
  output: { dir: 'dist', format: 'esm' },
  watch: { clearScreen: false },
  plugins: [
    circularDependencies({
      throwOnError: false,
    }),
  ],
};
```

```bash
rollup -c --watch
```

See the [watch-mode example](../../examples/watch-mode) for a complete demo.

## Compatibility & Peer Dependencies

| Dependency | Version | Note |
|------------|---------|------|
| **Node.js** | `>=20.12.0` | Required runtime |
| **rollup** | `^3.0.0 \|\| ^4.0.0` | Peer dependency |

The plugin ships both ESM and CJS builds:

| Format | Entry |
|--------|-------|
| ESM | `dist/index.mjs` |
| CJS | `dist/index.cjs` |
| Types | `dist/index.d.cts` |

**Runtime dependency:** [`@rollup/pluginutils`](https://github.com/rollup/plugins/tree/master/packages/pluginutils) `^5.3.0` — used for include/exclude file filtering.

## Troubleshooting / FAQ

### The plugin reports no cycles, but I know they exist

Make sure your files match the default include pattern `[/\.(c|m)?[jt]s(x)?$/]`. If your files use non-standard extensions, configure the `include` option explicitly:

```ts
circularDependencies({
  include: [/\.vue$/, /\.[jt]sx?$/],
});
```

### I see "No files to check" in the console

This means no modules passed the include/exclude filters. Check your patterns:

```ts
// Debug by logging which modules are processed
circularDependencies({
  debug: true,
  onDetected: (modulePath) => {
    console.log('Processing:', modulePath);
  },
});
```

### I want warnings instead of errors

Set `throwOnError` to `false`:

```ts
circularDependencies({
  throwOnError: false,
});
```

### Colors are not showing in my terminal

The plugin respects the [`NO_COLOR`](https://no-color.org/) convention. Colors are disabled when any of these environment variables are set:

- `NO_COLOR=1` / `NO_COLOR=true`
- `NODE_DISABLE_COLORS=1` / `NODE_DISABLE_COLORS=true`
- `FORCE_COLOR=0` / `FORCE_COLOR=false`

You can also disable colors explicitly:

```ts
import { circularDependencies, DefaultFormatters } from 'rollup-plugin-circular-dependencies';

circularDependencies({
  formatOut: DefaultFormatters.Pretty({ colors: false }),
});
```

### How does the plugin differ from Rollup's built-in circular dependency warnings?

Rollup emits individual `CIRCULAR_DEPENDENCY` warnings for each cycle it finds. This plugin:

1. **Suppresses** Rollup's built-in warnings to avoid duplicates
2. **Groups** cycles by entry module for clearer output
3. **Provides structured data** (`CircularDependenciesData`) for programmatic use
4. **Adds filtering** (`ignoreCycle`), **lifecycle hooks**, and **metrics**
5. **Supports file output** for CI integration

### Can I use this with Vite?

Yes. Vite uses Rollup under the hood for production builds, so the plugin works as-is. See [Vite Integration](#vite-integration).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed history of all releases.

## License

[MIT](./LICENSE) © [Aleksey Shelementev](https://github.com/rushelex)
