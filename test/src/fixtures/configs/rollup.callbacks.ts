import { relative } from 'node:path';
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
      throwOnError: false,
      onStart: () => {
        console.info('[circularDependencies] onStart');
      },
      onDetected: (modulePath) => {
        console.info('[circularDependencies] onDetected | modulePath :>>', relative(process.cwd(), modulePath));
      },
      onEnd: ({ rawOutput, formattedOutput }) => {
        const relativeRawOutput: Record<string, string[][]> = {};

        for (const [modulePath, cycles] of Object.entries(rawOutput)) {
          relativeRawOutput[relative(process.cwd(), modulePath)] = cycles.map((cycle) => {
            return cycle.map((cycleModulePath) => {
              return relative(process.cwd(), cycleModulePath);
            });
          });
        }

        console.info('[circularDependencies] onEnd | rawOutput :>>', relativeRawOutput);
        console.info('[circularDependencies] onEnd | formattedOutput :>>', formattedOutput);
      },
    }),
  ],
};

// eslint-disable-next-line import/no-default-export
export default config;
