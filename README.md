# rollup-circular-dependencies-plugin

Detect modules with circular dependencies when bundling with Rollup.

Circular dependencies are often a necessity in complex software, the presence of a circular dependency doesn't always imply a bug, but in the case where you believe a bug exists, this module may help find it.

## Why?

Rollup already has a built-in mechanism for detecting circular dependencies. But it doesn't work the way I would like: it is not very informative, it detects circular dependencies in `node_modules`, it is difficult to disable ([One](https://rollupjs.org/configuration-options/#onlog), [Two](https://github.com/rollup/rollup/issues/1089#issuecomment-365395213)).

Also, Vite is known to use Rollup "under the hood", but for some reason Vite doesn't report circular dependencies in any way.

This plugin works with both Rollup and Vite and allows you to configure circular dependencies notifications in a couple of properties to suit your needs, or disable notifications completely.

## Installation

```shell
npm install --save-dev rollup-plugin-circular-dependencies

# yarn add --dev rollup-plugin-circular-dependencies
# pnpm install --dev rollup-plugin-circular-dependencies
```

## Basic usage

Without any configuration. The result will be output to the console.

```typescript
import circularDependencies from 'rollup-plugin-circular-dependencies';
// or
// import { circularDependencies } from 'rollup-plugin-circular-dependencies';

export default {
  input: 'src/main.js',
  output: {
    file: 'bundle.js',
    format: 'cjs',
  },
  plugins: [circleDependency()],
};
```

## Advanced usage

```typescript
import path from 'node:path';
import circularDependencies, { DefaultFormatters } from 'rollup-plugin-circular-dependencies';
// or
// import { circularDependencies, DefaultFormatters } from 'rollup-plugin-circular-dependencies';

export default {
  input: 'src/main.js',
  output: {
    file: 'bundle.js',
    format: 'cjs',
  },
  plugins: [
    circularDependencies({
      // Include specific files based on a RegExp or a glob pattern
      include: [/\.[jt]sx?$/],
      // Exclude specific files based on a RegExp or a glob pattern
      exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/],
      // Throw Rollup error instead of warning
      throwOnError: true,
      // Path to the file with scan results. By default, the result is output to the console
      outputFilePath: './circular-deps-output',
      // Formats the output module path
      formatOutModulePath: (filePath) => path.relative(process.cwd(), filePath),
      // Formats the given data into a specific output format
      formatOut: DefaultFormatters.Pretty({ colors: false }),
      // or
      // formatOut: (data) => data,
    }),
  ],
};
```
