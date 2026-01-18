const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // 实现任务事件监听器
    },
    baseUrl: 'http://localhost:3000', // 设置测试基础URL
    specPattern: 'cypress/integration/**/*.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js'
  },
  viewportWidth: 1280,
  viewportHeight: 720
})
