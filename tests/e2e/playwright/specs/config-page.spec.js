/**
 * 配置页面端到端测试
 * 功能：测试监控页配置面板的功能和交互
 */

import { test, expect } from '@playwright/test';

import {
  ROOM_ID,
  SELECTORS,
  gotoMonitorPage,
  openMonitorConfig,
} from '../utils/entryPrompt.js';

test.describe('Config Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 直接通过路径进入监控页，避免入口弹窗影响
    await gotoMonitorPage(page, ROOM_ID);
  });

  test('should be able to interact with page elements', async ({ page }) => {
    // 点击监控区域打开配置面板
    await openMonitorConfig(page);

    // 验证配置面板包含页签与输入框等交互元素
    const tabs = page.locator('.van-tab');
    expect(await tabs.count()).toBeGreaterThanOrEqual(1);

    const inputs = page.locator(`${SELECTORS.popup} input`);
    expect(await inputs.count()).toBeGreaterThanOrEqual(1);
  });

  test('should handle input and button interactions', async ({ page }) => {
    await openMonitorConfig(page);

    // 修改「消息上限」输入框的值
    const thresholdInput = page.locator(`${SELECTORS.popup} input`).first();
    await thresholdInput.fill('50');
    await expect(thresholdInput).toHaveValue('50');

    // 切换到「弹幕」配置页签
    const danmakuTab = page.locator('.van-tab').filter({ hasText: /^弹幕$/ });
    await danmakuTab.click();
    await expect(page.locator('.van-tab--active')).toHaveText('弹幕');
  });

  test('should support page reload', async ({ page }) => {
    // 刷新页面
    await page.reload();

    // 验证页面能够重新加载，使用正确的标题
    await expect(page).toHaveTitle(/DouyuEx弹幕助手/);

    // 验证监控区域仍然存在，配置面板可以再次打开
    await expect(page.locator(SELECTORS.monitor)).toBeVisible();
    await openMonitorConfig(page);
  });

  test('should handle different room ids', async ({ page }) => {
    // 测试不同的房间号
    const roomIds = ['317422', '123456', '999999'];

    for (const roomId of roomIds) {
      // 直接通过路径访问不同房间号的监控页
      await page.goto(`/${roomId}`);
      // 等待页面加载
      await page.waitForLoadState('domcontentloaded');

      // 验证页面加载成功，使用正确的标题
      await expect(page).toHaveTitle(/DouyuEx弹幕助手/);
      await expect(page.locator(SELECTORS.monitor)).toBeVisible();

      // 等待1秒钟，避免请求过于频繁
      await page.waitForTimeout(1000);
    }
  });

  test('should take screenshot of config-related elements', async ({
    page,
  }) => {
    // 打开配置面板并截图，用于验证页面状态
    await openMonitorConfig(page);
    await page.screenshot({
      path: 'tests/e2e/playwright/screenshots/config-elements.png',
      fullPage: true,
    });
  });
});
