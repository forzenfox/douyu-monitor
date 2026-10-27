# 指定用户弹幕展示区需求设计文档

## 1. 功能概述

直播过程中，主播或场控往往需要单独关注某些固定用户（如小号、场控、金主）的发言。普通弹幕区在弹幕量大时容易遗漏这些用户的消息。为此新增「指定用户弹幕」展示区：按用户配置的昵称精确抓取弹幕并独立展示，点击弹幕后可将其标记为已处理（变灰），交互效果与指令弹幕一致。

## 2. 功能需求

### 2.1 指定用户弹幕展示区
- **独立展示**：新增独立模块，与进场、礼物、普通弹幕、超级弹幕、指令弹幕模块并列。
- **精确匹配**：按昵称精确匹配（忽略首尾空格），不做模糊匹配。
- **独立抓取**：不受普通弹幕的等级、关键词、昵称屏蔽规则影响；关闭普通弹幕模块时仍可正常抓取。
- **实时更新**：实时接收并展示命中用户的弹幕，自动滚动到底部，支持「回到底部」。
- **点击变灰**：点击任意一条指定用户弹幕后，该条弹幕立即置灰（半透明、灰底、头像降低不透明度），与指令弹幕的过期效果一致。
- **灰置自动删除**：开启「灰置弹幕自动删除」后，点击变灰的弹幕会在配置的时间后自动从列表移除；未开启时仅变灰、不移除。
- **空态提示**：无命中弹幕时显示「暂无指定用户弹幕」。

### 2.2 指定用户配置
- **用户列表**：支持添加、删除指定用户，支持单独启用/禁用某个用户。
- **精确去重**：同一昵称（去除首尾空格）不允许重复添加。
- **灰置自动删除配置**：提供「灰置弹幕自动删除」开关与「自动移除时间」（单位秒，默认 30）；仅开关开启时可编辑移除时间。
- **配置项顺序**：已添加用户（含用户列表）→ 添加用户 → 灰置弹幕自动删除 → 自动移除时间。
- **配置页签**：在配置弹窗中新增「指定用户弹幕」页签，配置变更实时生效；该页签仅在通用设置勾选「指定用户弹幕」时显示。
- **统一配色**：指定用户弹幕使用统一强调色（`#9c27b0`），不提供按用户配置颜色的能力。

## 3. 技术设计

### 3.1 组件设计

| 组件名称 | 功能描述 | 文件路径 |
|---------|---------|----------|
| UserDanmaku | 指定用户弹幕展示主组件 | src/monitor/components/UserDanmaku/UserDanmaku.vue |
| UserDanmakuItem | 单条指定用户弹幕模板 | src/monitor/components/UserDanmaku/templates/Default.vue |
| UserDanmakuConfig | 指定用户配置组件 | src/monitor/components/UserDanmaku/UserDanmakuConfig.vue |

### 3.2 配置数据结构

```javascript
// options.js
const userDanmaku = {
  // 指定用户列表，按昵称精确匹配
  users: [
    {
      id: 'user-1720000000000', // 唯一标识
      name: '主播小号', // 斗鱼昵称
      enabled: true, // 是否启用
    },
  ],
  // 灰置弹幕自动删除
  autoRemoveExpired: false,
  // 灰置弹幕自动删除时间（秒）
  autoRemoveDelay: 30,
};
```

模块占比与排序（占比可直接拖动画面分割线调整，单个区域下限 5%；隐藏模块的占比会保留，重新勾选时按比例缩放）：

```javascript
size: {
  enter: 10,
  gift: 11,
  danmaku: 28,
  superchat: 17,
  commandDanmaku: 17,
  userDanmaku: 17,
},
order: {
  enter: 0,
  gift: 1,
  danmaku: 2,
  superchat: 3,
  commandDanmaku: 4,
  userDanmaku: 5,
},
switch: [
  'enter',
  'gift',
  'danmaku',
  'superchat',
  'commandDanmaku',
  'userDanmaku',
],
```

### 3.3 弹幕数据结构

```javascript
const userDanmakuItem = {
  id: '1001', // 消息 cid
  userId: '67890', // 用户 uid
  userName: '主播小号', // 昵称
  userLevel: 10, // 用户等级
  content: '你好', // 弹幕内容
  timestamp: 1720000000000, // 接收时间
  isExpired: false, // 是否已点击变灰
  userInfo: {
    avatar: 'avatar_v3/202001/abc', // 头像
    fansLevel: 8, // 粉丝牌等级
    nobleLevel: 3, // 贵族等级
    isRoomAdmin: true, // 是否房管
  },
};
```

### 3.4 消息处理流程

`src/monitor/hooks/useWebsocket.js` 中的 `handleMsg` 对 `chatmsg` 的处理顺序调整为：

1. 解析消息：`stt.deserialize(msg)`。
2. **指定用户抓取**：调用 `matchUserDanmaku(userDanmaku, data.nn)` 精确匹配昵称；命中后生成弹幕对象、按 `threshold` 截断并写入 `userDanmakuList`；开启数据保存时同时记录原始消息。
3. **普通弹幕逻辑**：仅当 `switch` 包含 `danmaku` 时继续执行原有的等级/关键词/昵称屏蔽、超级弹幕关键词、普通弹幕与指令弹幕逻辑；否则直接结束当前消息处理。

匹配函数作为纯函数导出，便于单元测试：

```javascript
export function matchUserDanmaku(userDanmakuConfig, nickname) {
  if (!userDanmakuConfig || !Array.isArray(userDanmakuConfig.users)) {
    return false;
  }
  const target = String(nickname || '').trim();
  if (target === '') return false;
  return userDanmakuConfig.users.some(user => {
    if (!user || user.enabled === false) return false;
    return String(user.name || '').trim() === target;
  });
}
```

### 3.5 点击交互与灰置自动删除

`UserDanmaku` 组件点击单条弹幕后，将对应对象的 `isExpired` 置为 `true`；`Default.vue` 通过 `user-danmaku-item--expired` 类应用灰化样式（`opacity: 0.6`、`scale(0.98)`、灰色背景、头像 `opacity: 0.5`），与指令弹幕保持一致。

灰置自动删除由通用 Hook `useExpiredAutoRemove` 实现（`src/monitor/hooks/useExpiredAutoRemove.js`）：

- 点击变灰时若 `autoRemoveExpired` 为 `true`，按 `autoRemoveDelay` 秒数注册定时器；
- 同一弹幕只注册一次定时器，到期后从响应式列表中移除；时间非法或为空时回退 30 秒；
- 组件卸载时统一清理定时器；
- 未开启开关时不注册定时器，仅保留变灰效果。

### 3.6 旧配置兼容

页面加载、模块勾选变化、恢复默认设置时执行 `normalizeModuleSize`（内部复用纯函数 `normalizeVisibleSizes`）：

- 将当前**可见**模块的占比归一化到合计 100%，保证区域铺满；
- 隐藏模块的占比保留，重新勾选时再与其他可见模块一起按比例缩放，避免隐藏模块占用可视空间；
- 修正四舍五入误差，保证合计为 100%；
- 搭配分割线拖拽（下限 5%），任意区域的可见高度都能被拖动到预期比例，不再出现「指定用户弹幕无法继续缩小」的问题。

## 4. 测试与验收

### 4.1 单元测试

| 测试文件 | 覆盖内容 |
|---------|---------|
| tests/unit/hooks/useWebsocket.userDanmaku.test.js | 精确匹配、忽略首尾空格、禁用用户、空配置、多用户；关闭普通弹幕仍抓取；屏蔽规则不影响抓取；threshold 截断；数据保存 |
| tests/unit/components/UserDanmaku.test.js | 列表渲染、空态、点击后 isExpired 与灰化类、初始过期状态、开启/关闭灰置自动删除的移除行为与计时 |
| tests/unit/components/UserDanmakuConfig.test.js | 列表渲染、添加、删除、启用/禁用、空态、灰置自动删除开关与时间（默认 30 秒、开关关闭时禁用编辑）、配置项顺序 |
| tests/unit/pages/index.test.js | 分割线拖拽调整占比、可见模块占比归一化、配置页签仅显示已勾选模块 |

### 4.2 验收标准

- 配置页可添加多个昵称，重启后配置仍保留。
- 命中的用户弹幕出现在指定用户弹幕区，未命中的不出现。
- 关闭普通弹幕模块后，指定用户弹幕仍正常展示。
- 点击弹幕后立即变灰，且仅影响被点击的那一条。
- 开启灰置自动删除并设置时间后，被点击的弹幕在设定时间后自动移除；关闭开关时点击变灰的弹幕不会被移除。
- 通用设置取消勾选「指定用户弹幕」时，其配置页签同步隐藏。
- 旧版本配置加载后布局正常；任意区域可通过分割线拖动调整到预期比例（单个区域不小于 5%）。

## 5. 风险与边界

- **昵称变更**：匹配基于昵称，用户修改昵称后需重新配置。
- **同名用户**：斗鱼存在同名昵称时会一并抓取，属于预期行为。
- **数据导出**：本次需求未要求导出指定用户弹幕，暂不纳入「保存数据」。
- **性能**：沿用 `threshold` 上限，列表不会无限增长。
