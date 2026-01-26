import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,vue}'],
      exclude: [
        'src/main.js',
        'src/router.js',
        'src/global/utils/websocket.js',
      ],
    },
    globals: true,
    setupFiles: ['./tests/setup.js'],
    // 确保测试环境中也能正确解析别名
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
