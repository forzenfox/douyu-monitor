/**
 * 斗鱼礼物数据兼容层
 * 功能：兼容原有接口，同时支持从礼物数据管理器获取最新数据
 */

// 导入礼物数据管理器
import * as giftManager from './giftManager.js';

// 原有接口兼容导出，优先使用运行时数据，其次使用构建时数据
export const giftData = new Proxy(
  {},
  {
    get(target, property) {
      // 获取最新的礼物数据
      const allGiftData = giftManager.getAllGiftData();
      return allGiftData[property];
    },
    ownKeys(target) {
      // 获取最新的礼物数据键
      const allGiftData = giftManager.getAllGiftData();
      return Reflect.ownKeys(allGiftData);
    },
    has(target, property) {
      // 检查属性是否存在
      const allGiftData = giftManager.getAllGiftData();
      return property in allGiftData;
    },
    getOwnPropertyDescriptor(target, property) {
      // 获取属性描述符
      const allGiftData = giftManager.getAllGiftData();
      const descriptor = Object.getOwnPropertyDescriptor(allGiftData, property);
      if (descriptor) {
        return {
          enumerable: true,
          configurable: true,
          ...descriptor,
        };
      }
      return undefined;
    },
  }
);

// 导出礼物数据管理器的所有方法，方便直接使用
export * from './giftManager.js';
export * from './giftHelper.js';

// 导出辅助函数
export { default } from './giftManager.js';
