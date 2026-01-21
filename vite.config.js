import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

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
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.vue', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 移除additionalData中重复的导入，避免重复编译
        additionalData: '',
        charset: false,
      },
    },
    devSourcemap: false,
  },
  server: {
    proxy: {
      // 配置真实房间号API代理
      '/api/roominfo': {
        target: 'https://wxapp.douyucdn.cn',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/roominfo/, '/Live/Room/info'),
        secure: true,
      },
      // 配置背包礼物配置API代理
      '/api/giftconfig': {
        target: 'http://webconf.douyucdn.cn',
        changeOrigin: true,
        rewrite: path =>
          path.replace(
            /^\/api\/giftconfig/,
            '/resource/common/prop_gift_list/prop_gift_config.json'
          ),
        secure: false,
      },
    },
    // 提高开发服务器启动速度
    hmr: {
      overlay: true,
    },
    // 启用文件系统缓存
    fs: {
      strict: true,
    },
  },
  build: {
    // 生成sourcemap用于调试
    sourcemap: false,
    // 启用代码分割
    rollupOptions: {
      output: {
        // 配置代码分割
        manualChunks: {
          // 第三方依赖单独打包
          'vue-vendor': ['vue', 'vant', 'vue-clipboard3'],
          // 工具函数单独打包
          utils: ['@/global/utils'],
        },
        // 配置输出文件名
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // 缓存构建结果
    cache: true,
    // 启用并行构建
    chunkSizeWarningLimit: 1000,
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['vue', 'vant', 'vue-clipboard3'],
    exclude: [],
    // 启用依赖预构建缓存
    cache: true,
    // 并行处理依赖
    esbuildOptions: {
      // 配置esbuild优化选项
      target: 'es2020',
      // 启用tree shaking
      treeShaking: true,
    },
  },
});
