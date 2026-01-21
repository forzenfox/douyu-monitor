/**
 * Playwright 配置文件
 * 功能：配置 Playwright 测试运行环境和选项
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 测试文件目录
  testDir: './tests/e2e/playwright/specs',
  // 测试文件匹配模式
  testMatch: /.*\.spec\.(js|mjs|ts|mts)$/,

  // 全局超时设置
  timeout: 60000,

  // 每个测试用例的超时时间
  expect: {
    timeout: 10000,
  },

  // 并发测试设置
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // 报告配置 - 只输出列表格式和JSON报告，不生成HTML报告
  reporter: [
    ['list'],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],

  // 浏览器配置
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        headless: true,
        // 截图和视频配置
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
        headless: true,
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
        headless: true,
      },
    },
  ],

  // 开发服务器配置（用于本地测试）
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
