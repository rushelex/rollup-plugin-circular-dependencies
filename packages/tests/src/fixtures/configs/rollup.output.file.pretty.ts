import type { RollupOptions } from 'rollup';

import { resolve } from 'node:path';

import typescript from '@rollup/plugin-typescript';
import circularDependencies, { DefaultFormatters } from 'rollup-plugin-circular-dependencies';

const testRoot = resolve(import.meta.dirname, '../../..');

export const outputFilePath = resolve(testRoot, 'src/fixtures/output/pretty');

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
      outputFilePath,
      formatOut: DefaultFormatters.Pretty(),
    }),
  ],
};

export default config;
