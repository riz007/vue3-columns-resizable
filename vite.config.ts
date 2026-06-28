import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    // This is a library build — don't copy the demo app's public assets into dist.
    copyPublicDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/plugins/vue3-columns-resizable/index.ts'),
      name: 'Vue3ColumnsResizable',
      fileName: (format) => `vue3-columns-resizable.${format}.js`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
