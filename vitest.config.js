import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'src/**/*.cert.test.{js,jsx,ts,tsx}',
      'src/**/*.test.{js,jsx,ts,tsx}'
    ],
    exclude: [
      'node_modules',
      'dist',
      'coverage'
    ],
    globals: true,
    passWithNoTests: false,
    testTimeout: 10000
  }
});