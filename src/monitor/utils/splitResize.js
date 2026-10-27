// 各区域固定顺序，与 options.order 的初始值一致
export const MODULE_KEYS = [
  'enter',
  'gift',
  'danmaku',
  'superchat',
  'commandDanmaku',
  'userDanmaku',
];

// 拖动分割线时单个区域允许的最小占比（%）
export const MIN_MODULE_SIZE = 5;

/**
 * 获取当前勾选并显示的模块，按 order 升序排列
 * @param {Object} options - 当前配置
 * @returns {string[]} 可见模块的 key 列表
 */
export function getVisibleModules(options) {
  if (!options || !Array.isArray(options.switch)) return [];
  const order = options.order || {};
  return MODULE_KEYS.filter(key => options.switch.includes(key)).sort(
    (a, b) => (Number(order[a]) || 0) - (Number(order[b]) || 0)
  );
}

/**
 * 把拖动位移换算为占比变化（%）
 * @param {Object} params
 * @param {number} params.startX - 按下时的 X 坐标
 * @param {number} params.startY - 按下时的 Y 坐标
 * @param {number} params.x - 当前的 X 坐标
 * @param {number} params.y - 当前的 Y 坐标
 * @param {string} params.direction - column 纵向 / row 横向
 * @param {number} params.containerSize - 容器主轴方向的像素尺寸
 * @returns {number} 占比变化，正数表示前一个区域变大
 */
export function calcDragDelta({
  startX = 0,
  startY = 0,
  x = 0,
  y = 0,
  direction = 'column',
  containerSize = 0,
}) {
  if (!containerSize) return 0;
  const pixels = direction === 'row' ? x - startX : y - startY;
  return (pixels / containerSize) * 100;
}

/**
 * 把当前可见模块的占比归一化到合计 100%
 * 隐藏模块的占比保留，重新勾选时再按比例缩放，避免隐藏模块占用可视空间
 * @param {Object} options - 当前配置
 * @param {number} [target] - 归一化目标合计
 * @returns {Object} 新的占比对象
 */
export function normalizeVisibleSizes(options, target = 100) {
  const sizes = { ...(options?.size || {}) };
  const keys = getVisibleModules(options);
  if (!keys.length) return sizes;

  const rawTotal = keys.reduce(
    (sum, key) => sum + (Number(sizes[key]) || 0),
    0
  );
  // 全为 0 时按等分处理
  const useRaw = rawTotal > 0;
  const total = useRaw ? rawTotal : keys.length;

  keys.forEach(key => {
    const weight = useRaw ? Number(sizes[key]) || 0 : 1;
    sizes[key] = Math.round((weight / total) * target);
  });

  // 修正四舍五入误差，保证合计为目标值
  const roundedTotal = keys.reduce((sum, key) => sum + sizes[key], 0);
  const diff = target - roundedTotal;
  if (diff !== 0) {
    const largestKey = keys.reduce((a, b) => (sizes[a] >= sizes[b] ? a : b));
    sizes[largestKey] += diff;
  }
  return sizes;
}

/**
 * 计算相邻两个区域拖动后的新占比，二者合计保持不变
 * @param {Object} params
 * @param {number} params.first - 前一个区域当前占比
 * @param {number} params.second - 后一个区域当前占比
 * @param {number} params.delta - 占比变化，正数表示前一个区域变大
 * @param {number} [params.minSize] - 单个区域最小占比
 * @returns {{first: number, second: number}} 新的占比
 */
export function resolveResize({
  first = 0,
  second = 0,
  delta = 0,
  minSize = MIN_MODULE_SIZE,
}) {
  const firstSize = Number(first) || 0;
  const secondSize = Number(second) || 0;
  // 已低于最小值的区域以当前值为下限，避免拖动瞬间被抬高
  const floorFirst = Math.min(firstSize, minSize);
  const floorSecond = Math.min(secondSize, minSize);
  const clampedDelta = Math.max(
    floorFirst - firstSize,
    Math.min(secondSize - floorSecond, Number(delta) || 0)
  );

  const firstResult = Math.round(firstSize + clampedDelta);
  return {
    first: firstResult,
    second: Math.round(firstSize + secondSize) - firstResult,
  };
}
