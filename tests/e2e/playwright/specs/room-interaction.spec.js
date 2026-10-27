/**
 * 房间交互测试
 * 功能：测试首页入口弹窗中与房间号相关的交互功能
 */

import { test, expect } from '@playwright/test';

import {
  ROOM_ID,
  SELECTORS,
  openEntryPrompt,
  enterMonitor,
} from '../utils/entryPrompt.js';

test.describe('Room Interaction Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 访问首页，等待入口选择弹窗出现
    await openEntryPrompt(page);
  });

  test('should handle invalid room id', async ({ page }) => {
    // 选择通用监控并输入无效房间号
    await page.locator(SELECTORS.optionMonitor).click();
    await page.locator(SELECTORS.input).fill('invalid-room-id');

    // 点击确定按钮
    await page.locator(SELECTORS.confirm).click();
    await page.waitForURL('**/invalid-room-id');

    // 验证页面能够处理无效房间号，仍然渲染监控区域
    await expect(page).toHaveTitle(/DouyuEx弹幕助手/);
    await expect(page.locator(SELECTORS.monitor)).toBeVisible();
  });

  test('should support different room ids', async ({ page }) => {
    // 测试少量不同的房间号，避免超时
    const testRoomIds = ['317422', '123456'];

    for (const roomId of testRoomIds) {
      // 通过入口弹窗重新输入房间号
      await enterMonitor(page, roomId);

      // 验证房间号写入 URL 且页面仍然正常运行
      await expect(page).toHaveTitle(/DouyuEx弹幕助手/);
    }
  });

  test('should be able to cancel operation', async ({ page }) => {
    // 点击取消按钮关闭入口弹窗
    await page.locator(SELECTORS.cancel).click();

    // 验证弹窗已关闭，页面停留在首页且仍然正常运行
    await expect(page.locator(SELECTORS.modal)).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);
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

      // 第一步：入口选项与取消按钮仍然可见
      await expect(page.locator(SELECTORS.optionMonitor)).toBeVisible();
      await expect(page.locator(SELECTORS.optionLvjiang)).toBeVisible();
      await expect(page.locator(SELECTORS.cancel)).toBeVisible();

      // 第二步：房间号输入框、返回与确定按钮仍然可见
      await page.locator(SELECTORS.optionMonitor).click();
      await expect(page.locator(SELECTORS.input)).toBeVisible();
      await expect(page.locator(SELECTORS.back)).toBeVisible();
      await expect(page.locator(SELECTORS.confirm)).toBeVisible();

      // 返回入口选择步骤，继续下一个视口
      await page.locator(SELECTORS.back).click();
      await expect(page.locator(SELECTORS.optionMonitor)).toBeVisible();
    }
  });

  test('should handle rapid interactions', async ({ page }) => {
    // 进入房间号输入步骤
    await page.locator(SELECTORS.optionMonitor).click();
    const roomInput = page.locator(SELECTORS.input);

    // 快速输入多个房间号，但不点击确定
    for (let i = 0; i < 3; i++) {
      await roomInput.fill(`31742${i}`);
      await page.waitForTimeout(300);
    }

    // 最后点击一次确定按钮
    await page.locator(SELECTORS.confirm).click();

    // 验证页面能够处理快速交互，跳转到最后一次输入的房间号
    await page.waitForURL(`**/${ROOM_ID}`);
    await expect(page.locator(SELECTORS.monitor)).toBeVisible();
    await expect(page).toHaveTitle(/DouyuEx弹幕助手/);
  });
});
