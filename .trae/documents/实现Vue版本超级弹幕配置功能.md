# 实现Vue版本超级弹幕配置功能

## 功能分析

Remix版本的超级弹幕配置功能包含以下核心配置项：

1. **触发关键词**：用于触发超级弹幕的关键词
2. **等级配置**：
   - 最低触发价格
   - 停留时间（秒）
   - 背景颜色配置（header和body分开）
3. **显示选项**：
   - fans（粉丝牌）
   - noble（贵族）
   - roomAdmin（房管）
   - diamond（钻粉）
   - time（时间）
4. **语音播报**：是否开启语音播报功能

## 实现计划

### 1. 更新配置文件结构

修改 `src/packages/Monitor/options.js` 中的超级弹幕配置，使其与Remix版本保持一致：

- 将单个color字段拆分为bgColor对象，包含header和body两个颜色配置
- 添加语音播报配置项
- 调整默认价格区间和颜色配置，与Remix版本保持一致

### 2. 更新WebSocket处理逻辑

修改 `src/packages/Monitor/hooks/useWebsocket.js` 中的超级弹幕生成逻辑：

- 支持新的bgColor配置，分别设置header和body颜色
- 确保生成的超级弹幕对象包含正确的颜色信息
- 调整价格区间判断逻辑，与新配置匹配

### 3. 更新组件模板

修改超级弹幕组件模板，支持新的颜色配置：

- 分离header和body的样式，使用不同的颜色
- 确保组件能正确显示新的配置项

### 4. 测试验证

- 运行测试用例，确保更新后的代码能正常工作
- 构建项目，确保没有语法错误
- 验证超级弹幕功能正常，颜色显示正确

## 预期效果

- Vue版本的超级弹幕配置与Remix版本保持一致
- 支持更详细的颜色配置，增强视觉效果
- 支持语音播报功能
- 配置结构统一，便于后续维护和更新

## 实现步骤

1. 首先更新配置文件 `src/packages/Monitor/options.js`
2. 然后更新WebSocket处理逻辑 `src/packages/Monitor/hooks/useWebsocket.js`
3. 接着更新组件模板 `src/packages/Monitor/components/Superchat/templates/Default.vue`
4. 最后运行测试和构建，验证功能

## 配置示例

```javascript
superchat: {
    keyword: "#sc",
    show: ["fans", "noble", "roomAdmin", "diamond", "time"],
    speak: false,
    options: [
        {
            minPrice: 1000,
            time: 200,
            bgColor: {
                header: "rgb(208,0,0)",
                body: "rgb(230,33,23)"
            }
        },
        // 更多等级配置...
    ]
}
```