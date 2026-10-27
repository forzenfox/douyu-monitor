// 驴酱青春团团播看板默认配置（独立存储键，避免与主监控页配置互相污染）
export const defaultLvjiangOptions = {
  // 日间day 夜间night模式
  mode: 'day',
  // 字号
  fontSize: 14,
  // 开启动画
  animation: true,
  // 消息上限
  threshold: 100,
  // 确认回复的发送者昵称
  assistantName: '新驴酱团播小助手',
  // 团员名单（用于解析消歧，含纯数字昵称）
  members: ['145'],
  // 确认窗口（秒）
  confirmTimeout: 60,
  // 有效条目显示「指令 → 确认」耗时
  showConfirmCost: true,
  // 点击置灰自动移除
  autoRemoveHandled: false,
  // 自动移除时间（秒）
  autoRemoveDelay: 30,
};

// 独立存储键
export const LOCAL_NAME = 'lvjiang_options';

// 默认房间号（驴酱青春团）
export const DEFAULT_RID = '317422';

// 页面路径标识
export const PAGE_TYPE = 'lvjiang';
