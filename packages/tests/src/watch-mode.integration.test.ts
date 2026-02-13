import type { RollupOptions } from 'rollup';

import path from 'node:path';
import process from 'node:process';

import typescript from '@rollup/plugin-typescript';
import { rollup } from 'rollup';
import circularDependencies from 'rollup-plugin-circular-dependencies';

const testRoot = path.resolve(import.meta.dirname, '..');

const CIRCULAR_DEPS_ERROR = 'Circular dependencies detected';

process.chdir(testRoot);

/**
 * Simulates watch mode by reusing the same plugin instance across
 * sequential rollup() calls. In watch mode, Rollup keeps the same
 * plugin object and calls buildStart → moduleParsed → generateBundle
 * for each rebuild. Sharing the plugin instance means sharing the
 * internal Context — this is what makes these tests different from
 * independent builds with separate plugin instances.
 */
describe('Watch mode (sequential builds with shared plugin instance)', () => {
  it('should detect cycles on second build after error on first build', async () => {
    // Single plugin instance shared across builds — same as watch mode
    const plugin = circularDependencies({ throwOnError: true });

    const createConfig = (): RollupOptions => ({
      input: path.resolve(testRoot, 'src/fixtures/data/index.ts'),
      output: { dir: path.resolve(testRoot, 'dist'), format: 'esm' },
      plugins: [typescript(), plugin],
      onLog(_level, _log, _defaultHandler) {},
    });

    const firstResult = await safeBuild(createConfig());

    expect(firstResult.hasError).toBe(true);
    expect(firstResult.errorMessage).toContain(CIRCULAR_DEPS_ERROR);

    // Without buildStart reset, Context retains stale state from first
    // build and the second build produces corrupted results
    const secondResult = await safeBuild(createConfig());

    expect(secondResult.hasError).toBe(true);
    expect(secondResult.errorMessage).toContain(CIRCULAR_DEPS_ERROR);
  });

  it('should detect cycles on second build after warn on first build', async () => {
    const warnings: string[] = [];
    const plugin = circularDependencies({ throwOnError: false });

    const createConfig = (): RollupOptions => ({
      input: path.resolve(testRoot, 'src/fixtures/data/index.ts'),
      output: { dir: path.resolve(testRoot, 'dist'), format: 'esm' },
      plugins: [typescript(), plugin],
      onLog(level, log) {
        if (level === 'warn') {
          warnings.push(log.message);
        }
      },
    });

    await safeBuild(createConfig());

    const firstBuildWarnings = [...warnings];
    warnings.length = 0;

    expect(firstBuildWarnings).toEqual(
      expect.arrayContaining([expect.stringContaining(CIRCULAR_DEPS_ERROR)]),
    );

    await safeBuild(createConfig());

    expect(warnings).toEqual(
      expect.arrayContaining([expect.stringContaining(CIRCULAR_DEPS_ERROR)]),
    );
  });

  it('should call onEnd callback on every build', async () => {
    const onEndCalls: number[] = [];
    const plugin = circularDependencies({
      throwOnError: false,
      onEnd: ({ metrics }) => {
        onEndCalls.push(metrics.cyclesFound);
      },
    });

    const createConfig = (): RollupOptions => ({
      input: path.resolve(testRoot, 'src/fixtures/data/index.ts'),
      output: { dir: path.resolve(testRoot, 'dist'), format: 'esm' },
      plugins: [typescript(), plugin],
      onLog() {},
    });

    await safeBuild(createConfig());
    await safeBuild(createConfig());
    await safeBuild(createConfig());

    expect(onEndCalls).toHaveLength(3);
    expect(onEndCalls.every((count) => count > 0)).toBe(true);
  });

  it('should report consistent cycle count across rebuilds', async () => {
    const cycleCounts: number[] = [];
    const plugin = circularDependencies({
      throwOnError: false,
      onEnd: ({ metrics }) => {
        cycleCounts.push(metrics.cyclesFound);
      },
    });

    const createConfig = (): RollupOptions => ({
      input: path.resolve(testRoot, 'src/fixtures/data/index.ts'),
      output: { dir: path.resolve(testRoot, 'dist'), format: 'esm' },
      plugins: [typescript(), plugin],
      onLog() {},
    });

    await safeBuild(createConfig());
    await safeBuild(createConfig());

    // Without proper reset, stale nodes accumulate in Context,
    // causing the cycle count to differ between builds
    expect(cycleCounts[0]).toBeGreaterThan(0);
    expect(cycleCounts[1]).toBe(cycleCounts[0]);
  });
});

// Helpers

interface SafeBuildResult {
  hasError: boolean;
  errorMessage: string;
}

async function safeBuild(config: RollupOptions): Promise<SafeBuildResult> {
  try {
    const bundle = await rollup(config);
    const outputOptions = Array.isArray(config.output) ? config.output[0] : config.output;

    if (outputOptions) {
      await bundle.write(outputOptions);
    }

    await bundle.close();

    return { hasError: false, errorMessage: '' };
  }
  catch (error) {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
}
