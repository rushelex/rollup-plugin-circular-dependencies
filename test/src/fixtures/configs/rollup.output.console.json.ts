import typescript from '@rollup/plugin-typescript';
import { type RollupOptions } from 'rollup';
import circularDependencies, { DefaultFormatters } from 'rollup-plugin-circular-dependencies';

const config: RollupOptions = {
  input: 'src/fixtures/data/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
  },
  plugins: [
    typescript(),
    circularDependencies({
      throwOnError: false,
      formatOut: DefaultFormatters.JSON(),
    }),
  ],
};

// eslint-disable-next-line import/no-default-export
export default config;
