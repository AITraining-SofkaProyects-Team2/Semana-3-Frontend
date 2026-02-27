import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    threads: false,
    setupFiles: ['./src/test/setup.ts'],
  },
});
