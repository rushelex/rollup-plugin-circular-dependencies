/* eslint-disable no-console */
import type { RollupOptions } from 'rollup';

import { AsyncLocalStorage } from 'node:async_hooks';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { format } from 'node:util';

import { rollup, VERSION } from 'rollup';

const rollupMajor = Number.parseInt(VERSION.split('.')[0], 10);

const testRoot = resolve(import.meta.dirname, '..');

process.chdir(testRoot);

export interface RollupBuildResult {
  stdout: string;
  warnings: string[];
  hasError: boolean;
  output?: string;
}

interface RollupConfigModule {
  default: RollupOptions;
  outputFilePath?: string;
}

interface ConsoleStore {
  lines: string[];
}

const consoleStorage = new AsyncLocalStorage<ConsoleStore>();

const originalInfo = console.info;

console.info = (...args: unknown[]) => {
  const store = consoleStorage.getStore();

  if (store) {
    store.lines.push(format(...args));
    return;
  }

  originalInfo(...args);
};

/**
 * Builds a rollup config using Rollup JS API.
 * Captures console.info output as `stdout` and plugin warnings.
 *
 * Uses `import()` for IDE autocompletion and compile-time validation of config paths.
 * Safe for concurrent execution via `AsyncLocalStorage`.
 *
 * @example
 * ```ts
 * const result = await buildWithRollup(
 *   import('./fixtures/configs/rollup.output.console.basic.ts'),
 * );
 * ```
 */
export async function buildWithRollup(
  configPromise: Promise<RollupConfigModule>,
): Promise<RollupBuildResult> {
  const { default: config, outputFilePath } = await configPromise;

  const store: ConsoleStore = { lines: [] };
  const warnings: string[] = [];
  let hasError = false;

  await consoleStorage.run(store, async () => {
    try {
      const warningInterceptor = rollupMajor >= 3
        ? {
            onLog(level: string, log: { message: string }) {
              if (level === 'warn') {
                warnings.push(log.message);
              }
            },
          }
        : {
            onwarn(warning: string | { message: string }) {
              const message = typeof warning === 'string' ? warning : warning.message;
              warnings.push(message);
            },
          };

      const rollupOptions = {
        ...config,
        ...warningInterceptor,
      } as RollupOptions;

      const bundle = await rollup(rollupOptions);

      const outputOptions = Array.isArray(config.output) ? config.output[0] : config.output;

      if (outputOptions) {
        await bundle.write(outputOptions);
      }

      if (bundle.close !== undefined && typeof bundle.close === 'function') {
        await bundle.close();
      }
    }
    catch (error) {
      hasError = true;

      if (error instanceof Error) {
        warnings.push(error.message);
      }
    }
  });

  let output: string | undefined;

  if (outputFilePath && existsSync(outputFilePath)) {
    output = readFileSync(outputFilePath, { encoding: 'utf-8' });
    rmSync(outputFilePath);
  }

  return {
    stdout: store.lines.join('\n'),
    warnings,
    hasError,
    output,
  };
}
