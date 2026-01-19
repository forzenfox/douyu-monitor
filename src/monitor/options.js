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
        gift: 15,
        danmaku: 25,
        superchat: 25,
        commandDanmaku: 20
    },
    // 每个模块的排序
    order: {
        enter: 0,
        gift: 1,
        danmaku: 2,
        superchat: 3,
        commandDanmaku: 4
    },
    // 每个模块开关，按顺序排
    switch: ["danmaku", "superchat", "commandDanmaku"], // 默认不勾选进场和礼物
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
        show: ["level", "avatar", "fans", "noble", "roomAdmin", "diamond", "vip", "color"],
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
        speak: false
    },
    // 指令弹幕设置
    commandDanmaku: {
        // 模块开关
        enabled: true,
        // 指令前缀
        prefix: '#',
        // 指令关键词列表
        keywords: [
            { id: 'kw-1', name: '点歌', enabled: true, color: '#007bff' },
            { id: 'kw-2', name: '转盘', enabled: true, color: '#28a745' }
        ]
    }
}