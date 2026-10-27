/**
 * 主页面端到端测试
 * 功能：测试首页入口弹窗、房间号输入以及监控页加载
 */

import { test, expect } from '@playwright/test';

import {
  ROOM_ID,
  SELECTORS,
  openEntryPrompt,
  gotoMonitorPage,
  openMonitorConfig,
} from '../utils/entryPrompt.js';

test.describe('Main Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 访问测试页面，等待入口选择弹窗出现
    await openEntryPrompt(page);
  });

  test('should load main page correctly', async ({ page }) => {
    // 验证页面加载成功，使用正确的标题
    await expect(page).toHaveTitle(/DouyuEx弹幕助手/);

    // 验证入口弹窗包含两种页面入口和取消按钮
    await expect(page.locator(SELECTORS.title)).toHaveText('请选择进入的页面');
    await expect(page.locator(SELECTORS.optionLvjiang)).toBeVisible();
    await expect(page.locator(SELECTORS.optionMonitor)).toBeVisible();
    await expect(page.locator(SELECTORS.cancel)).toBeVisible();
  });

  test('should have input and button elements', async ({ page }) => {
    // 第一步弹窗中包含按钮
    const buttons = page.locator('.entry-option');
    expect(await buttons.count()).toBeGreaterThanOrEqual(1);

    // 选择通用监控后出现房间号输入框与确定按钮
    await page.locator(SELECTORS.optionMonitor).click();
    await expect(page.locator(SELECTORS.input)).toBeVisible();
    await expect(page.locator(SELECTORS.confirm)).toBeVisible();
  });

  test('should handle room id input', async ({ page }) => {
    // 进入房间号输入步骤并输入房间号
    await page.locator(SELECTORS.optionMonitor).click();
    const roomInput = page.locator(SELECTORS.input);
    await roomInput.fill(ROOM_ID);

    // 验证输入成功
    await expect(roomInput).toHaveValue(ROOM_ID);
  });

  test('should be able to click confirm button', async ({ page }) => {
    // 输入房间号并点击确定按钮
    await page.locator(SELECTORS.optionMonitor).click();
    await page.locator(SELECTORS.input).fill(ROOM_ID);
    await page.locator(SELECTORS.confirm).click();

    // 验证跳转到对应房间页并渲染监控区域
    await page.waitForURL(`**/${ROOM_ID}`);
    await expect(page.locator(SELECTORS.monitor)).toBeVisible();
  });

  test('should take screenshot of main page', async ({ page }) => {
    // 截取页面截图，用于验证页面状态
    await page.screenshot({
      path: 'tests/e2e/playwright/screenshots/main-page.png',
      fullPage: true,
    });
  });

  test('should test config page access', async ({ page }) => {
    // 直接通过路径进入监控页，点击监控区域打开配置面板
    await gotoMonitorPage(page, ROOM_ID);
    await openMonitorConfig(page);

    // 验证配置面板加载成功
    const bodyContent = await page.textContent('body');
    expect(bodyContent).not.toContain('404');
    expect(bodyContent).not.toContain('Not Found');
    await expect(page.locator(SELECTORS.popup)).toBeVisible();

    // 截图记录配置页面状态
    await page.screenshot({
      path: 'tests/e2e/playwright/screenshots/config-page.png',
      fullPage: true,
    });
  });
});
