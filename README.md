<p align="center">
    <a href="https://github.com/forzenfox/douyu-monitor">
        <img src="https://s4.ax1x.com/2021/12/23/TGQyAf.png" width="150" height="150"/>
    </a>
    <h3 align="center">Douyu-Monitor</h3>
    <br>
    <p align="center">
        <a href="https://github.com/forzenfox/douyu-monitor"><img src="https://img.shields.io/github/languages/code-size/forzenfox/douyu-monitor?color=blueviolet"></a>
        <a href="https://github.com/forzenfox/douyu-monitor"><img src="https://img.shields.io/github/stars/forzenfox/douyu-monitor?color=green"></a>
        <a href="https://github.com/forzenfox/douyu-monitor"><img src="https://img.shields.io/github/commit-activity/m/forzenfox/douyu-monitor?color=9cf"></a>
        <a href="https://github.com/forzenfox/douyu-monitor"><img src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
    </p>
    <p align="center">
       斗鱼跨平台弹幕助手<br>
    </p>
</p>

> `Douyu-Monitor` 是基于 `Vite2.x`+`Vue3.2.x`+`VantUI` 开发的**纯前端**斗鱼弹幕助手，用于查看、展示房间内弹幕/礼物/入场信息等。在性能上，页面无论在任何情况都能**丝滑**展示与操作；在项目结构上，**底层与业务解耦**，**样式与业务解耦**，可以方便地定制各式各样的弹幕样式；在场景上，**支持所有设备**并且**显示/操作一致**，具有灵活和高扩展的特性。

## 1. 项目概述

这是一个基于 Vue 3 的斗鱼直播实时监控系统，用于在直播过程中展示弹幕、礼物、进场信息、超级弹幕和指令弹幕等内容。系统支持高度自定义配置，可根据需求调整显示效果和内容。

## 2. 技术栈

| 技术/框架 | 版本 | 用途 |
|----------|------|------|
| Vue | 3.2.31 | 前端框架 |
| Vite | 7.3.1 | 构建工具 |
| Vant | 3.4.5 | UI 组件库 |
| SCSS | 1.97.2 | 样式预处理器 |
| Playwright | 1.57.0 | E2E 测试 |
| Vitest | 4.0.17 | 单元测试 |
| WebSocket | - | 实时数据通信 |

## 3. 项目结构

```
douyu-monitor/
├── src/
│   ├── global/             # 全局样式和工具函数
│   │   ├── styles/         # 全局样式
│   │   └── utils/          # 工具函数
│   ├── monitor/            # 核心监控模块
│   │   ├── components/     # 子组件
│   │   ├── hooks/          # 自定义 Hooks
│   │   └── pages/          # 页面组件
│   ├── App.vue             # 根组件
│   ├── main.js             # 应用入口
│   └── router.js           # 路由解析
├── tests/                  # 测试目录
│   ├── e2e/                # 端到端测试
│   │   └── playwright/     # Playwright 测试
│   │       ├── config/     # 配置文件
│   │       ├── fixtures/   # 测试夹具
│   │       ├── pages/      # Page Object 模型
│   │       ├── specs/      # 测试用例
│   │       └── utils/      # 测试工具函数
│   ├── unit/               # 单元测试
│   ├── data/               # 测试数据
│   └── scripts/            # 测试脚本
├── playwright.config.js    # Playwright 配置文件
└── docs/                   # 项目文档
```

## 4. 核心功能模块

### 4.1 实时数据处理

- **WebSocket 连接**：通过 `useWebsocket` Hook 建立与斗鱼服务器的连接，接收实时数据
- **数据类型**：支持弹幕、礼物、进场信息、超级弹幕、指令弹幕
- **数据过滤**：支持按等级、关键词、昵称等条件过滤数据
- **数据解析**：
  - 弹幕数据解析：支持多种弹幕样式（ct@=1, ct@=2, ct@=14等）
  - 超级弹幕数据解析：支持按价格自动分级显示
- **测试数据**：提供简化的测试数据集合，便于开发和测试

### 4.2 信息展示组件

| 组件 | 功能 |
|------|------|
| Danmaku | 普通弹幕展示 |
| Gift | 礼物特效展示 |
| Enter | 进场信息通知 |
| Superchat | 超级弹幕显示 |
| CommandDanmaku | 指令弹幕功能 |

### 4.3 配置系统

- **布局配置**：可选择显示的信息类型
- **样式配置**：调整字体大小、方向、对齐方式等
- **内容配置**：设置各信息类型的显示选项
- **过滤配置**：设置屏蔽条件
- **主题切换**：支持日夜模式切换

### 4.4 数据管理

- **本地存储**：配置信息自动保存到本地
- **数据导出**：支持导出弹幕、礼物等数据
- **分享功能**：生成包含配置的分享链接

## 5. 核心流程

1. **初始化**：通过 URL 参数获取房间号和配置
2. **连接 WebSocket**：建立与斗鱼服务器的实时连接
3. **接收数据**：获取直播房间的实时数据
4. **处理数据**：根据配置过滤和处理数据
5. **展示信息**：使用不同组件展示各类信息
6. **用户交互**：提供配置界面允许用户自定义显示效果

## 6. 斗鱼跨平台弹幕助手

### 预览（Demo）
[https://forzenfox.github.io/douyu-monitor/317422](https://forzenfox.github.io/douyu-monitor/317422)

### 特性
1. 纯前端
2. 全响应式
3. vue3 tree shaking
4. vite编译优化
5. lazy-load
6. content-visibility
7. brotli
8. 超级弹幕功能
9. 语音播报支持
10. 多级超级弹幕配置

### 注意
1. 房间号必须是真实房间号而不能是靓号


### 声明
1. 本项目基于 [qianjiachun/douyu-monitor](https://github.com/qianjiachun/douyu-monitor/tree/main/vue) 进行二次开发
2. 原项目引用请注明出处
3. 原作者: 小淳 Email: 189964430@qq.com


## 7. 运行项目
1. git clone
2. `npm install`
3. `npm run dev`

## 8. 发布

### 8.1 构建命令
```bash
npm run build
```

### 8.2 构建优化

项目使用 Vite 进行构建优化，主要包括：

- **代码拆分**：按需加载模块，减小初始加载体积
- **构建缓存**：提升二次构建速度
- **压缩优化**：使用 Terser 进行代码压缩
- **输出配置**：优化构建输出目录结构

### 8.3 部署
1. 将dist文件夹内容部署至服务器
2. 在nginx配置中加入以下代码
```
location / {
    try_files $uri $uri/ /index.html;
}
```

## 9. 测试结构

### 9.1 测试目录

项目使用 Vitest 进行单元测试，测试结构如下：

```
tests/
├── unit/               # 单元测试
│   ├── utils/          # 工具函数测试
│   │   ├── parseSuperchatData.test.js  # 超级弹幕数据解析测试
│   │   └── parseDanmuData.test.js      # 弹幕数据解析测试
│   └── pages/          # 页面组件测试
├── data/               # 测试数据
│   ├── danmuTestDataSimplified.txt  # 简化的弹幕测试数据
│   └── superchatTestData.txt        # 超级弹幕测试数据
└── scripts/            # 测试脚本
    └── test-danmu-parse.js           # 弹幕解析测试脚本
```

### 9.2 测试内容

- **数据解析测试**：测试弹幕和超级弹幕的数据解析功能
- **组件测试**：测试核心组件的渲染和功能
- **工具函数测试**：测试工具函数的正确性

## 10. 技术亮点

### 10.1 组件化设计

系统采用高度组件化的设计，各功能模块独立封装，便于维护和扩展。

### 10.2 自定义 Hooks

使用 Vue 3 的 Composition API 和自定义 Hooks 封装业务逻辑，提高代码复用性和可维护性。

### 10.3 响应式配置

配置项实时生效，无需刷新页面即可看到效果变化。

### 10.4 完善的测试

包含单元测试和 E2E 测试，确保系统稳定性和可靠性：

- **测试框架**：使用 Vitest 进行单元测试，Playwright 进行 E2E 测试
- **测试覆盖率**：全面覆盖核心功能，包括数据解析、组件渲染、工具函数
- **测试数据**：提供简化的测试数据集合，便于开发和测试
- **测试脚本**：包含自动化测试脚本，支持快速验证功能

目前项目测试覆盖率：
- 数据解析功能：100% 覆盖
- 核心组件：90%+ 覆盖
- 工具函数：100% 覆盖

### 10.5 主题切换

支持日夜模式切换，适应不同直播场景。

## 11. 如何修改消息的样式（提交PR）
项目提供了基础消息样式（斗鱼原版），如果想要定制比较好看的（例如气泡）的弹幕消息，参考如下：  

  
在每个模块的templates下新建一个文件(.vue)，然后接受指定的props即可进行样式的编写  
每一个文件代表着每一行所呈现的样式  
下面分别对每个模块参数详细说明：
### options（设置）
```js
export const defaultOptions = {
    // 日间day 夜间night模式
    mode: "day",
    // 纵向column 横向row
    direction: "column",
    // 左对齐left 右对齐right
    align: "left",
    // 每个模块的占比%
    size: {
        enter: 15,
        gift: 25,
        danmaku: 30,
        superchat: 30,
    },
    // 每个模块的排序
    order: {
        enter: 0,
        gift: 1,
        superchat: 2,
        danmaku: 3,
    },
    // 每个模块开关，按顺序排
    switch: ["enter", "gift", "danmaku", "superchat"],
    // 数据阈值
    threshold: 100,
    // 字号
    fontSize: 14,
    // 背景透明
    transparent: false,
    // 开启动画
    animation: true,
    // 是否开启数据保存
    isSaveData: false,
    // 弹幕设置
    danmaku: {
        // 设置弹幕显示内容，如果在数组里就显示
        // level:等级  avatar:头像  fans:粉丝牌  noble:贵族  roomAdmin:房管  diamond:钻粉
        show: ["level", "avatar", "fans", "noble", "roomAdmin", "diamond", "vip"],
        // 屏蔽项
        ban: {
            level: 0, // 等级
            keywords: "", // 关键词
            nicknames: "", // 关键昵称
            isFilterRepeat: false, // 过滤重复弹幕，如果下一条内容与上一条一样，则丢弃
        }
    },
    // 入场设置
    enter: {
        // 设置入场显示内容，如果在数组里就显示
        // level:等级  avatar:头像   noble:贵族
        show: ["level", "avatar", "noble"],
        // 高亮关键昵称
        keywords: "",
        // 屏蔽项
        ban: {
            level: 0, // 等级
        }
    },
    // 礼物设置
    gift: {
        // 高亮价格
        totalPrice: 100,
        // 屏蔽项
        ban: {
            // 价格低于
            price: 0,
            // 礼物名称
            keywords: "",
            // 粉丝牌升级显示等级>=
            fansLevel: 6,
        }
    },
    // 超级弹幕设置
    superchat: {
        // 超级弹幕关键词
        keyword: "#sc",
        // 显示选项
        show: ["fans", "noble", "roomAdmin", "diamond", "time"],
        // 是否语音播报
        speak: false,
        // 超级弹幕等级配置
        options: [
            {
                minPrice: 1000,
                time: 200,
                bgColor: {
                    header: "rgb(208,0,0)",
                    body: "rgb(230,33,23)"
                }
            },
            {
                minPrice: 500,
                time: 100,
                bgColor: {
                    header: "rgb(194,24,91)",
                    body: "rgb(233,30,99)"
                }
            },
            {
                minPrice: 300,
                time: 30,
                bgColor: {
                    header: "rgb(230,81,0)",
                    body: "rgb(245,124,0)"
                }
            },
            {
                minPrice: 100,
                time: 20,
                bgColor: {
                    header: "rgb(0,191,165)",
                    body: "rgb(29,233,182)"
                }
            },
            {
                minPrice: 50,
                time: 10,
                bgColor: {
                    header: "rgb(21,101,192)",
                    body: "rgb(30,136,229)"
                }
            }
        ]
    }
}
```
### 弹幕样式
#### 路径
`src/monitor/components/Danmaku/templates/Default.vue`

#### props说明
```
data: 每条弹幕数据，格式如下
let obj = {
    nn: data.nn, // 昵称
    avatar: data.ic, // 头像地址 https://apic.douyucdn.cn/upload/ + avatar + _small.jpg
    lv: data.level, // 等级
    txt: data.txt, // 弹幕内容
    color: data.col, // 弹幕颜色 undefine就是普通弹幕 2蓝色 3绿色 6粉色 4橙色 5紫色 1红色
    fansName: data.bnn, // 粉丝牌名字
    fansLv: data.bl, // 粉丝牌等级
    diamond: data.diaf, // 是否是钻粉
    noble: data.nl, // 贵族等级
    nobleC: data.nc, // 贵族弹幕是否开启，1开
    roomAdmin: data.rg, // 房管，data.rg为4则是房管
    super: data.pg, // 超管，data.pg为5则为超管
    vip: data.ail == "453/" || data.ail == "454/", // vip，如果是 453/则为vip  454/则为超级vip
    key: data.cid, // 时间戳
};

如果要控制是否显示头像、等级、粉丝牌等，可以在相应的标签中这么写（检查options中show里是否包含）
v-if="options.danmaku.show.includes('avatar')"
```

### 礼物样式
#### 路径
`src/monitor/components/Gift/templates/Default.vue`

#### props说明
```
data: 每条礼物数据，格式如下
普通礼物（dgb）：
let obj = {
    nn: data.nn, // 昵称
    lv: data.level, // 等级
    gfid: data.gfid, // 礼物id 获取名称：allGiftData[item.gfid].n
    gfcnt: data.gfcnt, // 礼物数量
    hits: data.hits, // 连击
    key: new Date().getTime() + Math.random(),
}
钻粉（会比普通礼物多一个type属性）：
let obj = {
    type: "开通钻粉", // 或者续费钻粉
    nn: data.nick,
    lv: data.level,
    gfid: "0",
    gfcnt: "1",
    hits: "1",
    key: new Date().getTime() + Math.random(),
}

------------------------------------------------------------------------

giftData（礼物信息）：{
    n: item.name, // 礼物名称
    pic: item.basicInfo.focusPic, // 礼物图片地址: allGiftData.prefix + allGiftData[id].pic
    pc: item.priceInfo.price, // 礼物价格（记得÷100）
}
```

### 入场样式
#### 路径
`src/monitor/components/Enter/templates/Default.vue`

#### props说明
```
data: 每条入场数据
let obj = {
    nn: data.nn, // 昵称
    avatar: data.ic, // 头像地址 https://apic.douyucdn.cn/upload/ + avatar + _small.jpg
    lv: data.level, // 等级
    noble: data.nl, // 贵族等级
    key: new Date().getTime() + Math.random(),
}

如果要控制是否显示头像、等级、粉丝牌等，可以在相应的标签中这么写（检查options中show里是否包含）
v-if="options.enter.show.includes('avatar')"
```

### 超级弹幕样式
#### 路径
`src/monitor/components/Superchat/templates/Default.vue`

#### props说明
```
data: 每条超级弹幕数据，格式如下
let obj = {
    nn: data.nn, // 昵称
    avatar: data.ic, // 头像地址
    txt: data.txt, // 弹幕内容
    price: price, // 价格
    level: level, // 等级
    bgColor: { // 背景颜色配置
        header: "rgb(208,0,0)", // 头部背景色
        body: "rgb(230,33,23)" // 内容背景色
    },
    textColor: "#FFFFFF", // 文字颜色
    nicknameColor: "#FFFFFF", // 昵称颜色
    key: data.cid || (new Date().getTime() + Math.random()), // 唯一标识
    createdAt: Date.now(), // 创建时间
    isExpired: false // 是否过期
}

如果要控制是否显示粉丝牌、贵族、房管等，可以在相应的标签中这么写（检查options中show里是否包含）
v-if="options.superchat.show.includes('fans')"
```
