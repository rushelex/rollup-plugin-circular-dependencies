# rollup-plugin-circular-dependencies

**Detect and report circular dependencies in your Rollup & Vite projects.**

[![CI](https://github.com/rushelex/rollup-plugin-circular-dependencies/actions/workflows/checking.yml/badge.svg)](https://github.com/rushelex/rollup-plugin-circular-dependencies/actions/workflows/checking.yml)
[![npm version](https://img.shields.io/npm/v/rollup-plugin-circular-dependencies)](https://www.npmjs.com/package/rollup-plugin-circular-dependencies)
[![license](https://img.shields.io/npm/l/rollup-plugin-circular-dependencies)](./packages/plugin/LICENSE)

---

Circular dependencies cause subtle bugs — from `undefined` imports at runtime to broken hot module replacement. **rollup-plugin-circular-dependencies** catches every cycle _before_ your code ships. It plugs into the Rollup/Vite build pipeline, analyses the full module graph with [Tarjan's algorithm](https://en.wikipedia.org/wiki/Tarjan%27s_strongly_connected_components_algorithm), and gives you flexible output, lifecycle hooks, and granular filtering.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Rollup](#rollup)
  - [Vite](#vite)
  - [Output to File](#output-to-file)
  - [Custom Formatters](#custom-formatters)
  - [Lifecycle Hooks](#lifecycle-hooks)
  - [Ignoring Specific Cycles](#ignoring-specific-cycles)
- [Changelog](#changelog)
- [License](#license)
- [Authors](#authors)

## Features

- 🔍 **Accurate detection** — Tarjan's strongly connected components algorithm running in O(V + E)
- ⚡ **Rollup 3 & 4 support** — works as a native Rollup plugin
- 🛠️ **Vite compatible** — drop-in support for Vite projects
- 🔄 **Watch mode ready** — automatically resets state between rebuilds
- 🎨 **Built-in formatters** — pretty (colorized) console output or JSON
- 📁 **File output** — write results to a file for CI integration
- 🎯 **Granular filtering** — include/exclude patterns and per-cycle ignore rules
- 📊 **Metrics** — module count, cycle count, largest cycle size, detection time
- 🪝 **Lifecycle hooks** — `onStart`, `onDetected`, `onEnd` callbacks with full Rollup context
- 🐛 **Debug mode** — verbose logging for troubleshooting

## Quick Start

```bash
# Install
npm install -D rollup-plugin-circular-dependencies
```

```ts
// rollup.config.js
import { circularDependencies } from 'rollup-plugin-circular-dependencies';

export default {
  input: 'src/index.js',
  output: { dir: 'dist', format: 'esm' },
  plugins: [circularDependencies()],
};
```

That's it. If circular dependencies exist, the build will **error** by default. Set `throwOnError: false` to emit warnings instead.

## Prerequisites

| Requirement | Version |
|-------------|---------|
| **Node.js** | `>=20.12.0` |
| **Rollup**  | `^3.0.0 \|\| ^4.0.0` |

## Installation

```bash
# npm
npm install -D rollup-plugin-circular-dependencies

# pnpm
pnpm add -D rollup-plugin-circular-dependencies

# yarn
yarn add -D rollup-plugin-circular-dependencies
```

## Configuration

All options are optional. See the [full API reference](./packages/plugin#api-reference) for details.

```ts
import { circularDependencies, DefaultFormatters } from 'rollup-plugin-circular-dependencies';

circularDependencies({
  // Enable or disable the plugin
  enabled: true,

  // File inclusion pattern (glob or RegExp)
  include: [/\.(c|m)?[jt]s(x)?$/],

  // File exclusion pattern (always includes node_modules and .git)
  exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/],

  // Throw a build error on detected cycles (false = warning only)
  throwOnError: true,

  // Write output to a file instead of the console
  outputFilePath: '',

  // Enable verbose debug logging
  debug: false,

  // Transform module paths in the output
  formatOutModulePath: (p) => p,

  // Customize output format
  formatOut: DefaultFormatters.Pretty({ colors: true }),

  // Selectively ignore specific cycles
  ignoreCycle: (paths) => paths.some((p) => p.includes('generated')),

  // Lifecycle callbacks
  onStart: (pluginContext) => {},
  onDetected: (modulePath, pluginContext) => {},
  onEnd: ({ rawOutput, formattedOutput, metrics }, pluginContext) => {},
});
```

## Usage

### Rollup

```ts
// rollup.config.js
import { circularDependencies } from 'rollup-plugin-circular-dependencies';

export default {
  input: 'src/index.js',
  output: { dir: 'dist', format: 'esm' },
  plugins: [
    circularDependencies({
      throwOnError: false,
    }),
  ],
};
```

### Vite

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

Write detection results to a file (useful for CI pipelines):

```ts
circularDependencies({
  outputFilePath: './reports/circular-deps.json',
  throwOnError: false,
});
```

When `outputFilePath` is set, the default formatter switches to `DefaultFormatters.JSON()` automatically.

### Custom Formatters

Use the built-in formatters or provide your own:

```ts
import circularDependencies, { DefaultFormatters } from 'rollup-plugin-circular-dependencies';

// JSON output to console
circularDependencies({
  formatOut: DefaultFormatters.JSON(),
});

// Pretty output without colors
circularDependencies({
  formatOut: DefaultFormatters.Pretty({ colors: false }),
});

// Fully custom formatter
circularDependencies({
  formatOut: (data) => {
    const count = Object.values(data).flat().length;
    return `Total cycles: ${count}`;
  },
});
```

### Lifecycle Hooks

React to detection events with lifecycle callbacks:

```ts
circularDependencies({
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
  },
});
```

### Ignoring Specific Cycles

Filter out known or acceptable cycles:

```ts
circularDependencies({
  ignoreCycle: (cyclePaths) => {
    // Ignore cycles involving generated files
    return cyclePaths.some((p) => p.includes('/generated/'));
  },
});
```

## Package Documentation

- [`rollup-plugin-circular-dependencies`](./packages/plugin) — Full API reference, configuration options, and advanced usage

## Changelog

See [CHANGELOG.md](./packages/plugin/CHANGELOG.md) for a detailed history of changes.

## License

This project is licensed under the [MIT License](./LICENSE).

## Authors

- **Aleksey Shelementev** ([@rushelex](https://github.com/rushelex)) — creator & maintainer

---

<div align="center">

If this plugin helps you, consider giving it a ⭐ on [GitHub](https://github.com/rushelex/rollup-plugin-circular-dependencies)!

</div>
