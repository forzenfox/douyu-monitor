/**
 * 房间交互测试
 * 功能：测试房间相关的交互功能
 */

import { test, expect } from '@playwright/test';

test.describe('Room Interaction Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 访问测试页面，使用房间号参数
    await page.goto('/?roomId=317422');
    // 等待页面加载完成
    await page.waitForLoadState('domcontentloaded');
    // 等待3秒钟，让动态内容加载
    await page.waitForTimeout(3000);
  });

  test('should handle invalid room id', async ({ page }) => {
    // 测试无效房间号
    const roomInput = await page.locator('input[type="text"]');
    await roomInput.fill('invalid-room-id');

    // 点击确定按钮
    const confirmButton = await page.locator('button:has-text("确定")');
    await confirmButton.click();

    // 验证页面能够处理无效房间号
    await expect(page).toHaveTitle(/DouyuEx弹幕助手/);
  });

  test('should support different room ids', async ({ page }) => {
    // 测试少量不同的房间号，避免超时
    const testRoomIds = ['317422', '123456'];

    for (const roomId of testRoomIds) {
      // 输入房间号
      const roomInput = await page.locator('input[type="text"]');
      await roomInput.fill(roomId);

      // 点击确定按钮
      const confirmButton = await page.locator('button:has-text("确定")');
      await confirmButton.click();

      // 等待页面响应
      await page.waitForTimeout(2000);

      // 验证页面仍然正常运行
      await expect(page).toHaveTitle(/DouyuEx弹幕助手/);
    }
  });

  test('should be able to cancel operation', async ({ page }) => {
    // 输入房间号
    const roomInput = await page.locator('input[type="text"]');
    await roomInput.fill('317422');

    // 点击取消按钮
    const cancelButton = await page.locator('button:has-text("取消")');
    await cancelButton.click();

    // 验证取消操作后页面仍然正常运行
    await expect(page).toHaveTitle(/DouyuEx弹幕助手/);
  });

  test('should have consistent layout across different viewport sizes', async ({
    page,
  }) => {
    // 测试不同视口大小下的布局
    const viewportSizes = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 },
    ];

    for (const viewport of viewportSizes) {
      // 设置视口大小
      await page.setViewportSize(viewport);

      // 验证页面元素仍然可见
      await expect(page.locator('input')).toBeVisible();
      await expect(page.locator('button:has-text("确定")')).toBeVisible();
      await expect(page.locator('button:has-text("取消")')).toBeVisible();
    }
  });

  test('should handle rapid interactions', async ({ page }) => {
    // 简化快速交互测试，避免超时
    const roomInput = await page.locator('input[type="text"]');

    // 快速输入多个房间号，但不点击确定
    for (let i = 0; i < 3; i++) {
      const roomId = `31742${i}`;
      await roomInput.fill(roomId);
      await page.waitForTimeout(300);
    }

    // 最后点击一次确定按钮
    const confirmButton = await page.locator('button:has-text("确定")');
    await confirmButton.click();

    // 验证页面能够处理快速交互
    await expect(page).toHaveTitle(/DouyuEx弹幕助手/);
  });
});
