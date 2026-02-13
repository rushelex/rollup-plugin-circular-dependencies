/* eslint-disable no-console */
import type { RollupOptions } from 'rollup';

import { relative, resolve } from 'node:path';

import typescript from '@rollup/plugin-typescript';
import circularDependencies from 'rollup-plugin-circular-dependencies';

const testRoot = resolve(import.meta.dirname, '../../..');

const config: RollupOptions = {
  input: resolve(testRoot, 'src/fixtures/data/index.ts'),
  output: {
    dir: resolve(testRoot, 'dist'),
    format: 'esm',
  },
  plugins: [
    typescript(),
    circularDependencies({
      throwOnError: false,
      onStart: () => {
        console.info('[circularDependencies] onStart');
      },
      onDetected: (modulePath) => {
        console.info('[circularDependencies] onDetected | modulePath :>>', relative(testRoot, modulePath));
      },
      onEnd: ({ rawOutput, formattedOutput }) => {
        const relativeRawOutput: Record<string, string[][]> = {};

        for (const [modulePath, cycles] of Object.entries(rawOutput)) {
          relativeRawOutput[relative(testRoot, modulePath)] = cycles.map((cycle) => {
            return cycle.map((cycleModulePath) => {
              return relative(testRoot, cycleModulePath);
            });
          });
        }

        console.info('[circularDependencies] onEnd | rawOutput :>>', relativeRawOutput);
        console.info('[circularDependencies] onEnd | formattedOutput :>>', formattedOutput);
      },
    }),
  ],
};

export default config;
