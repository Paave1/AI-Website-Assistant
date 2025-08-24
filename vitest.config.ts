import {defineConfig} from 'vitest/config';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/tests/**/*.test.ts']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});


