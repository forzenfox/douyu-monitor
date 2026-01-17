import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 移除vite-plugin-style-import插件，避免生成错误的绝对路径导入
  ],
  resolve: {
    alias: {
        '@': path.resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 移除additionalData中重复的导入，避免重复编译
        additionalData: '',
        charset: false,
      }
    }
  },
})
