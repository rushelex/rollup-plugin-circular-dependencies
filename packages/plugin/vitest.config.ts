import circularDependency from 'vite-plugin-circular-dependency';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [circularDependency()],
  test: {
    globals: true,
    env: { NO_COLOR: '1', FORCE_COLOR: '0' },
    coverage: {
      provider: 'v8',
      thresholds: { 100: true },
      include: ['src/**/*.(c|m)?[jt]s(x)?'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/*.d.ts', '**/index.ts', '**/types.ts'],
    },
  },
});
