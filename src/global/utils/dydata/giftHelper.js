/**
 * 斗鱼礼物辅助函数模块
 * 功能：提供礼物数据相关的辅助函数
 */

/**
 * 格式化礼物价格
 * @param {number} price - 礼物价格（单位：分）
 * @param {boolean} withUnit - 是否包含单位
 * @returns {string} 格式化后的价格
 */
export const formatGiftPrice = (price, withUnit = true) => {
  if (typeof price !== 'number') {
    price = parseInt(price) || 0;
  }

  const formattedPrice = (price / 100).toFixed(2);

  return withUnit ? `${formattedPrice} 元` : formattedPrice;
};

/**
 * 获取礼物图片URL
 * @param {Object} gift - 礼物对象
 * @param {string} picUrlPrefix - 图片URL前缀
 * @returns {string} 完整的图片URL
 */
export const getGiftImageUrl = (gift, picUrlPrefix = '') => {
  if (!gift || !gift.icon) return '';

  const icon = gift.icon;

  // 如果已经是完整URL，直接返回
  if (icon.startsWith('http://') || icon.startsWith('https://')) {
    return icon;
  }

  // 处理相对路径
  let url = icon;

  // 移除可能的前缀
  if (icon.startsWith('/')) {
    url = icon;
  } else {
    url = `/${icon}`;
  }

  // 添加前缀
  if (picUrlPrefix) {
    // 确保前缀末尾没有斜杠
    const prefix = picUrlPrefix.endsWith('/')
      ? picUrlPrefix.slice(0, -1)
      : picUrlPrefix;
    url = `${prefix}${url}`;
  }

  return url;
};

/**
 * 礼物数据验证
 * @param {Object} giftData - 礼物数据对象
 * @returns {boolean} 数据是否有效
 */
export const validateGiftData = giftData => {
  if (!giftData || typeof giftData !== 'object') {
    return false;
  }

  // 检查是否包含必要字段
  for (const key in giftData) {
    const gift = giftData[key];
    if (!gift || typeof gift !== 'object') {
      continue;
    }

    // 检查礼物的必要字段
    if (!gift.id || !gift.name) {
      return false;
    }
  }

  return true;
};

/**
 * 礼物数据转换，兼容旧版本数据格式
 * @param {Object} giftData - 礼物数据对象
 * @returns {Object} 转换后的礼物数据
 */
export const convertGiftData = giftData => {
  if (!giftData || typeof giftData !== 'object') {
    return {};
  }

  const converted = {};

  for (const key in giftData) {
    const gift = giftData[key];
    if (!gift || typeof gift !== 'object') {
      continue;
    }

    // 兼容旧版本数据格式
    converted[key] = {
      id: gift.id || gift.gid || key,
      name: gift.name || gift.n || gift.giftName || '',
      price: gift.price || gift.pc || gift.cost || 0,
      type: gift.type || gift.giftType || 0,
      icon: gift.icon || gift.pic || gift.himg || '',
      onceLimit: gift.onceLimit || 0,
      skinData: gift.skinData || {},
    };
  }

  return converted;
};

/**
 * 根据价格过滤礼物
 * @param {Object} giftData - 礼物数据对象
 * @param {number} minPrice - 最低价格（单位：分）
 * @param {number} maxPrice - 最高价格（单位：分）
 * @returns {Object} 过滤后的礼物数据
 */
export const filterGiftsByPrice = (
  giftData,
  minPrice = 0,
  maxPrice = Infinity
) => {
  if (!giftData || typeof giftData !== 'object') {
    return {};
  }

  const filtered = {};

  for (const key in giftData) {
    const gift = giftData[key];
    if (!gift || typeof gift !== 'object') {
      continue;
    }

    const price = gift.price || 0;
    if (price >= minPrice && price <= maxPrice) {
      filtered[key] = gift;
    }
  }

  return filtered;
};

/**
 * 根据类型过滤礼物
 * @param {Object} giftData - 礼物数据对象
 * @param {Array<number>} types - 礼物类型数组
 * @returns {Object} 过滤后的礼物数据
 */
export const filterGiftsByType = (giftData, types) => {
  if (!giftData || typeof giftData !== 'object') {
    return {};
  }

  if (!Array.isArray(types) || types.length === 0) {
    return giftData;
  }

  const filtered = {};

  for (const key in giftData) {
    const gift = giftData[key];
    if (!gift || typeof gift !== 'object') {
      continue;
    }

    if (types.includes(gift.type)) {
      filtered[key] = gift;
    }
  }

  return filtered;
};

/**
 * 搜索礼物
 * @param {Object} giftData - 礼物数据对象
 * @param {string} keyword - 搜索关键词
 * @returns {Object} 搜索结果
 */
export const searchGifts = (giftData, keyword) => {
  if (!giftData || typeof giftData !== 'object' || !keyword) {
    return {};
  }

  const searchLower = keyword.toLowerCase();
  const result = {};

  for (const key in giftData) {
    const gift = giftData[key];
    if (!gift || typeof gift !== 'object') {
      continue;
    }

    const giftName = (gift.name || '').toLowerCase();
    if (giftName.includes(searchLower)) {
      result[key] = gift;
    }
  }

  return result;
};

/**
 * 获取礼物分类
 * @param {Array} tabs - 分类标签数组
 * @param {Object} giftData - 礼物数据对象
 * @returns {Object} 分类后的礼物数据
 */
export const getGiftCategories = (tabs, giftData) => {
  if (!Array.isArray(tabs) || tabs.length === 0 || !giftData) {
    return {};
  }

  const categories = {};

  tabs.forEach(tab => {
    if (!tab || !tab.id || !Array.isArray(tab.giftIds)) {
      return;
    }

    const categoryGifts = {};
    tab.giftIds.forEach(giftId => {
      if (giftData[giftId]) {
        categoryGifts[giftId] = giftData[giftId];
      }
    });

    if (Object.keys(categoryGifts).length > 0) {
      categories[tab.id] = {
        ...tab,
        gifts: categoryGifts,
      };
    }
  });

  return categories;
};

/**
 * 计算礼物总价值
 * @param {Array} giftList - 礼物列表
 * @param {Object} allGiftData - 所有礼物数据
 * @returns {number} 总价值（单位：分）
 */
export const calculateTotalGiftValue = (giftList, allGiftData) => {
  if (!Array.isArray(giftList) || !allGiftData) {
    return 0;
  }

  return giftList.reduce((total, gift) => {
    if (!gift || !gift.gfid) {
      return total;
    }

    const giftData = allGiftData[gift.gfid];
    if (!giftData) {
      return total;
    }

    const count = parseInt(gift.gfcnt || gift.count || '1') || 1;
    return total + giftData.price * count;
  }, 0);
};

/**
 * 检查礼物是否为特效礼物
 * @param {Object} gift - 礼物对象
 * @returns {boolean} 是否为特效礼物
 */
export const isSpecialEffectGift = gift => {
  if (!gift) return false;

  // 根据礼物类型判断
  const specialTypes = [1, 2, 3, 4]; // 假设这些类型是特效礼物
  return specialTypes.includes(gift.type);
};

/**
 * 获取礼物皮肤信息
 * @param {Object} gift - 礼物对象
 * @param {string} skinId - 皮肤ID
 * @returns {Object|null} 皮肤信息
 */
export const getGiftSkin = (gift, skinId = '0') => {
  if (!gift || !gift.skinData) return null;

  return gift.skinData[skinId] || null;
};
