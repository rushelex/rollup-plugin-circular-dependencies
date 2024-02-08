import typescript from '@rollup/plugin-typescript';
import { type RollupOptions } from 'rollup';
import circularDependencies, { DefaultFormatters } from 'rollup-plugin-circular-dependencies';

import { OUTPUT_FILE_RELATIVE_PATH } from '../../utils.js';

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
      outputFilePath: OUTPUT_FILE_RELATIVE_PATH,
      formatOut: DefaultFormatters.Pretty({ colors: false }),
    }),
  ],
};

// eslint-disable-next-line import/no-default-export
export default config;
