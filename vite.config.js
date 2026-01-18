import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 移除vite-plugin-style-import插件，避免生成错误的绝对路径导入
  ],
  // GitHub Pages部署配置
  base: '/douyu-monitor/',
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
  server: {
    proxy: {
      // 配置真实房间号API代理
      '/api/roominfo': {
        target: 'https://wxapp.douyucdn.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/roominfo/, '/Live/Room/info'),
        secure: true
      },
      // 配置背包礼物配置API代理
      '/api/giftconfig': {
        target: 'http://webconf.douyucdn.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/giftconfig/, '/resource/common/prop_gift_list/prop_gift_config.json'),
        secure: false
      }
    }
  }
})
