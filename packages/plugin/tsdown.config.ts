import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'src/index.ts',
  format: ['cjs', 'esm'],
  platform: 'node',
  outputOptions: {
    exports: 'named',
  },
  exports: true,
  minify: false,
  dts: true,
  attw: { profile: 'node16' },
});
