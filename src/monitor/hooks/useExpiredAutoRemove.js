import { onBeforeUnmount } from 'vue';

// 自动移除时间未配置时的兜底值（秒）
export const DEFAULT_AUTO_REMOVE_DELAY = 30;

/**
 * 灰置弹幕自动移除
 * @param {Function} getConfig - 返回当前模块配置（含 autoRemoveExpired / autoRemoveDelay）
 * @param {Function} getList - 返回当前弹幕列表
 * @returns {{ schedule: Function }} schedule(id) 为指定弹幕安排移除定时器
 */
export function useExpiredAutoRemove(getConfig, getList) {
  const timers = new Map();

  function schedule(id) {
    const config = getConfig();
    if (!config?.autoRemoveExpired || timers.has(id)) return;

    const seconds = Number(config.autoRemoveDelay);
    const delay =
      Number.isFinite(seconds) && seconds > 0
        ? seconds
        : DEFAULT_AUTO_REMOVE_DELAY;

    timers.set(
      id,
      setTimeout(() => {
        timers.delete(id);
        const list = getList();
        const index = list.findIndex(item => item.id === id);
        if (index !== -1) list.splice(index, 1);
      }, delay * 1000)
    );
  }

  onBeforeUnmount(() => {
    timers.forEach(timer => clearTimeout(timer));
    timers.clear();
  });

  return { schedule };
}
