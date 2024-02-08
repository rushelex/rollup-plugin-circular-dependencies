import typescript from '@rollup/plugin-typescript';
import { type RollupOptions } from 'rollup';
import circularDependencies from 'rollup-plugin-circular-dependencies';

const config: RollupOptions = {
  input: 'src/fixtures/data/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
  },
  plugins: [
    typescript(),
    circularDependencies({
      enabled: false,
    }),
  ],
};

// eslint-disable-next-line import/no-default-export
export default config;
