/**
 * 首页入口弹窗的公共操作
 * 功能：封装「选择入口 → 输入房间号 → 进入监控页」的通用流程，供各 e2e 用例复用
 */

import { expect } from '@playwright/test';

// 测试使用的房间号
export const ROOM_ID = '317422';

export const SELECTORS = {
  modal: '.entry-modal',
  title: '.entry-title',
  optionLvjiang: '.entry-option--lvjiang',
  optionMonitor: '.entry-option--monitor',
  cancel: '.entry-cancel',
  input: '.entry-input',
  confirm: '.entry-confirm',
  back: '.entry-back',
  monitor: '.monitor',
  popup: '.van-popup',
};

/**
 * 打开首页并等待入口选择弹窗出现
 * @param {import('@playwright/test').Page} page - 页面对象
 */
export async function openEntryPrompt(page) {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator(SELECTORS.modal)).toBeVisible();
}

/**
 * 在入口弹窗中选择「通用监控」，进入房间号输入步骤
 * @param {import('@playwright/test').Page} page - 页面对象
 */
export async function gotoRoomIdStep(page) {
  await openEntryPrompt(page);
  await page.locator(SELECTORS.optionMonitor).click();
  await expect(page.locator(SELECTORS.input)).toBeVisible();
}

/**
 * 通过入口弹窗输入房间号并进入监控页
 * @param {import('@playwright/test').Page} page - 页面对象
 * @param {string} rid - 房间号
 */
export async function enterMonitor(page, rid = ROOM_ID) {
  await gotoRoomIdStep(page);
  await page.locator(SELECTORS.input).fill(rid);
  await page.locator(SELECTORS.confirm).click();
  await page.waitForURL(`**/${rid}`);
  await expect(page.locator(SELECTORS.monitor)).toBeVisible();
}

/**
 * 直接通过路径进入监控页（跳过入口弹窗）
 * @param {import('@playwright/test').Page} page - 页面对象
 * @param {string} rid - 房间号
 */
export async function gotoMonitorPage(page, rid = ROOM_ID) {
  await page.goto(`/${rid}`);
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator(SELECTORS.monitor)).toBeVisible();
}

/**
 * 点击监控区域打开配置面板
 * @param {import('@playwright/test').Page} page - 页面对象
 */
export async function openMonitorConfig(page) {
  await page.locator(SELECTORS.monitor).click();
  await expect(page.locator(SELECTORS.popup)).toBeVisible();
}
