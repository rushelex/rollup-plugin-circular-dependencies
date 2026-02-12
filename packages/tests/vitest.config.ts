import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    env: { NO_COLOR: '1', FORCE_COLOR: '0' },
  },
});
