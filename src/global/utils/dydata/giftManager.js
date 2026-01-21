/**
 * 斗鱼礼物数据管理模块
 * 功能：管理礼物数据的获取、更新和缓存，提供统一的数据访问接口
 */

import { ref, computed, watch } from 'vue';
import * as giftApi from './giftApi.js';

// 导入构建时生成的静态数据
let generatedGiftData = {};
let generatedTabs = [];
let generatedCommonConfig = {};
let generatedVersion = '';

// 初始化函数，用于加载构建时生成的静态数据
let isGeneratedDataLoaded = false;

/**
 * 加载构建时生成的礼物数据
 */
export const loadGeneratedGiftData = async () => {
  if (isGeneratedDataLoaded) return;

  try {
    // 尝试导入构建时生成的静态数据
    // 注意：这个文件在构建阶段生成，开发阶段可能不存在
    const generated = await import('./giftData.generated.js');
    generatedGiftData = generated.giftData || {};
    generatedTabs = generated.tabs || [];
    generatedCommonConfig = generated.commonConfig || {};
    generatedVersion = generated.giftDataVersion || '';
    isGeneratedDataLoaded = true;
  } catch (e) {
    console.log('未找到构建时生成的礼物数据，将使用运行时获取的数据');
  }
};

// 在模块初始化时尝试加载生成的数据
loadGeneratedGiftData().catch(e => {
  console.log('加载生成的礼物数据失败:', e.message);
});

// 运行时礼物数据
const runtimeGiftData = ref({});
const runtimeTabs = ref([]);
const runtimeCommonConfig = ref({});
const isLoading = ref(false);
const error = ref(null);
const lastUpdateTime = ref(0);

// 事件监听器
const updateListeners = new Set();

// 数据更新频率限制（5分钟）
const UPDATE_INTERVAL = 5 * 60 * 1000;

/**
 * 获取当前环境是否为开发环境
 * @returns {boolean} 是否为开发环境
 */
const isDevEnvironment = () => {
  return import.meta.env.DEV;
};

/**
 * 获取所有礼物数据
 * @returns {Object} 礼物数据对象
 */
export const getAllGiftData = () => {
  // 优先使用运行时数据，其次使用构建时数据
  return Object.keys(runtimeGiftData.value).length > 0
    ? runtimeGiftData.value
    : generatedGiftData;
};

/**
 * 根据ID获取礼物数据
 * @param {string} giftId - 礼物ID
 * @returns {Object|null} 礼物数据，找不到返回null
 */
export const getGiftById = giftId => {
  if (!giftId) return null;

  // 优先从运行时数据中查找
  if (runtimeGiftData.value[giftId]) {
    return runtimeGiftData.value[giftId];
  }

  // 从构建时数据中查找
  return generatedGiftData[giftId] || null;
};

/**
 * 获取礼物分类标签
 * @returns {Array} 分类标签数组
 */
export const getGiftTabs = () => {
  return runtimeTabs.value.length > 0 ? runtimeTabs.value : generatedTabs;
};

/**
 * 获取礼物公共配置
 * @returns {Object} 公共配置对象
 */
export const getGiftCommonConfig = () => {
  return Object.keys(runtimeCommonConfig.value).length > 0
    ? runtimeCommonConfig.value
    : generatedCommonConfig;
};

/**
 * 获取当前数据版本
 * @returns {string} 数据版本
 */
export const getGiftDataVersion = () => {
  return generatedVersion || '0';
};

/**
 * 更新礼物数据
 * @param {string} roomId - 房间ID
 * @returns {Promise<boolean>} 更新是否成功
 */
export const refreshGiftData = async roomId => {
  // 检查更新频率，避免频繁请求
  if (
    Date.now() - lastUpdateTime.value < UPDATE_INTERVAL &&
    Object.keys(runtimeGiftData.value).length > 0
  ) {
    console.log('礼物数据更新频率限制，跳过更新');
    return false;
  }

  isLoading.value = true;
  error.value = null;

  try {
    console.log('开始更新礼物数据');

    // 获取礼物列表数据
    const giftListResponse = await giftApi.fetchRoomGiftList(roomId);

    if (giftListResponse && giftListResponse.data) {
      const { giftList, tabs, onceLimit, skinData } = giftListResponse.data;

      // 处理礼物数据
      const processedGiftData = {};
      if (giftList && Array.isArray(giftList)) {
        giftList.forEach(gift => {
          if (!gift || !gift.id) return;

          processedGiftData[gift.id] = {
            id: gift.id,
            name: gift.name || gift.n || '',
            price: gift.price || gift.pc || 0,
            type: gift.type || 0,
            icon: gift.icon || gift.pic || '',
            onceLimit: onceLimit?.[gift.id] || 0,
            skinData: skinData?.[gift.id] || {},
          };
        });
      }

      // 更新运行时数据
      runtimeGiftData.value = processedGiftData;
      runtimeTabs.value = tabs || [];
      lastUpdateTime.value = Date.now();

      // 通知监听器
      notifyUpdateListeners();

      console.log(
        `成功更新礼物数据，共 ${Object.keys(processedGiftData).length} 个礼物`
      );

      return true;
    }

    return false;
  } catch (err) {
    error.value = err.message;
    console.error('更新礼物数据失败:', err.message);

    return false;
  } finally {
    isLoading.value = false;
  }
};

/**
 * 监听礼物数据更新事件
 * @param {Function} callback - 回调函数
 * @returns {Function} 取消监听的函数
 */
export const onGiftDataUpdate = callback => {
  if (typeof callback !== 'function') {
    throw new Error('回调函数必须是函数类型');
  }

  updateListeners.add(callback);

  // 返回取消监听的函数
  return () => {
    updateListeners.delete(callback);
  };
};

/**
 * 通知所有更新监听器
 */
const notifyUpdateListeners = () => {
  updateListeners.forEach(callback => {
    try {
      callback();
    } catch (e) {
      console.error('礼物数据更新监听器执行失败:', e.message);
    }
  });
};

/**
 * 初始化礼物数据管理器
 * @param {string} roomId - 房间ID
 */
export const initGiftManager = async roomId => {
  console.log('初始化礼物数据管理器');

  // 在开发环境或构建时数据为空时，自动更新数据
  if (isDevEnvironment() || Object.keys(generatedGiftData).length === 0) {
    if (roomId) {
      await refreshGiftData(roomId);
    } else {
      console.log('未提供房间ID，无法初始化礼物数据');
    }
  }
};

/**
 * 检查礼物数据是否需要更新
 * @returns {boolean} 是否需要更新
 */
export const shouldUpdateGiftData = () => {
  // 构建时数据为空时需要更新
  if (Object.keys(generatedGiftData).length === 0) {
    return true;
  }

  // 开发环境强制更新
  if (isDevEnvironment()) {
    return true;
  }

  // 超过更新间隔需要更新
  return Date.now() - lastUpdateTime.value > UPDATE_INTERVAL;
};

/**
 * 获取礼物数据统计信息
 * @returns {Object} 统计信息
 */
export const getGiftDataStats = () => {
  const allGiftData = getAllGiftData();
  const allTabs = getGiftTabs();

  return {
    totalGifts: Object.keys(allGiftData).length,
    totalTabs: allTabs.length,
    isUsingGeneratedData: Object.keys(runtimeGiftData.value).length === 0,
    lastUpdateTime: lastUpdateTime.value,
    version: generatedVersion,
    hasRuntimeData: Object.keys(runtimeGiftData.value).length > 0,
  };
};

// 默认导出
const giftManager = {
  getAllGiftData,
  getGiftById,
  getGiftTabs,
  getGiftCommonConfig,
  getGiftDataVersion,
  refreshGiftData,
  onGiftDataUpdate,
  initGiftManager,
  shouldUpdateGiftData,
  getGiftDataStats,
  isLoading,
  error,
  lastUpdateTime,
};

export default giftManager;
