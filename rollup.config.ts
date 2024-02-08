import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { type RollupOptions } from 'rollup';

const config: RollupOptions = {
  input: 'src/index.ts',
  external: ['node:fs', 'node:path', 'chalk', '@rollup/pluginutils', 'lodash-es'],
  output: [
    {
      file: 'dist/index.mjs',
      format: 'esm',
      exports: 'named',
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      exports: 'named',
    },
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.build.json',
    }),
    terser(),
  ],
};

// eslint-disable-next-line import/no-default-export
export default config;
