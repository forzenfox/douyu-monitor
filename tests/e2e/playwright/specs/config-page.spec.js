/**
 * 配置页面端到端测试
 * 功能：测试配置页面的功能和交互
 */

import { test, expect } from '@playwright/test';

test.describe('Config Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 访问测试页面，使用房间号参数
    await page.goto('/?roomId=317422');
    // 等待页面加载完成
    await page.waitForLoadState('domcontentloaded');
    // 等待3秒钟，让动态内容加载
    await page.waitForTimeout(3000);
  });

  test('should be able to interact with page elements', async ({ page }) => {
    // 验证页面包含基本交互元素
    const buttons = await page.locator('button');
    const buttonsCount = await buttons.count();
    expect(buttonsCount).toBeGreaterThanOrEqual(1);

    const inputs = await page.locator('input');
    const inputsCount = await inputs.count();
    expect(inputsCount).toBeGreaterThanOrEqual(1);
  });

  test('should handle input and button interactions', async ({ page }) => {
    // 查找房间号输入框并输入房间号
    const roomInput = await page.locator('input[type="text"]');
    await roomInput.fill('317422');

    // 验证输入成功
    await expect(roomInput).toHaveValue('317422');

    // 查找并点击确定按钮，使用更精确的定位
    const confirmButton = await page.locator('button:has-text("确定")');
    await confirmButton.click();

    // 验证页面响应点击，这里可以添加更多验证逻辑
    console.log('Confirm button clicked successfully');
  });

  test('should support page reload', async ({ page }) => {
    // 刷新页面
    await page.reload();

    // 验证页面能够重新加载，使用正确的标题
    await expect(page).toHaveTitle(/DouyuEx弹幕助手/);

    // 验证页面元素仍然存在
    await expect(page.locator('input')).toBeVisible();

    // 验证页面包含按钮，使用count验证而不是toBeVisible
    const buttons = await page.locator('button');
    const buttonsCount = await buttons.count();
    expect(buttonsCount).toBeGreaterThanOrEqual(1);
  });

  test('should handle different room ids', async ({ page }) => {
    // 测试不同的房间号
    const roomIds = ['317422', '123456', '999999'];

    for (const roomId of roomIds) {
      // 访问不同房间号的URL
      await page.goto(`/?roomId=${roomId}`);
      // 等待页面加载
      await page.waitForLoadState('domcontentloaded');

      // 验证页面加载成功，使用正确的标题
      await expect(page).toHaveTitle(/DouyuEx弹幕助手/);

      // 等待1秒钟，避免请求过于频繁
      await page.waitForTimeout(1000);
    }
  });

  test('should take screenshot of config-related elements', async ({
    page,
  }) => {
    // 截取页面截图，用于验证页面状态
    await page.screenshot({
      path: 'tests/e2e/playwright/screenshots/config-elements.png',
      fullPage: true,
    });
  });
});
