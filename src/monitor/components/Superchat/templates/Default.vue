<template>
    <div :class="[
        `superchat-item ${showAnimation?'fadeInLeft' : ''}`,
        `superchat-level-${data.level}`,
        { 'superchat-item--expired': data.isExpired }
    ]" :style="{
        backgroundColor: data.isExpired ? '#f0f0f0' : (data.bgColor?.body || '#FF6B6B'),
        '--superchat-header-color': data.isExpired ? 'transparent' : (data.bgColor?.header || data.bgColor?.body || '#FF6B6B')
    }">
        <!-- 前景色进度条 -->
        <div class="superchat-progress" :style="{
            backgroundColor: data.bgColor?.body || '#FF6B6B',
            animationDuration: `${data.duration || 30}s`
        }"></div>
        
        <div class="superchat-content">
            <div class="superchat-header" :style="{
                backgroundColor: 'transparent'
            }">
                <!-- 粉丝牌 -->
                <span v-if="options?.superchat?.show?.includes('fans') && data.fansName" class="superchat-fans" :class="`fansLevel-${data.fansLv}`">
                    {{ data.fansName }} Lv{{ data.fansLv }}
                </span>
                <!-- 贵族 -->
                <span v-if="options?.superchat?.show?.includes('noble') && data.noble" class="superchat-noble">
                    贵族
                </span>
                <!-- 房管 -->
                <span v-if="options?.superchat?.show?.includes('roomAdmin') && data.roomAdmin" class="superchat-roomAdmin">
                    房管
                </span>
                <!-- 钻粉 -->
                <span v-if="options?.superchat?.show?.includes('diamond') && data.diamond" class="superchat-diamond">
                    钻粉
                </span>
                <span class="superchat-nickname" :style="{ color: data.isExpired ? '#999999' : (data.nicknameColor || '#FFFFFF') }">{{ data.nn || '匿名用户' }}</span>
                <span class="superchat-price" :style="{ 
                    backgroundColor: data.isExpired ? '#CCCCCC' : (data.bgColor?.header || data.bgColor?.body || '#FF6B6B'),
                    color: data.isExpired ? '#999999' : '#FFFFFF' 
                }">¥{{ data.price }}</span>
                <!-- 时间 -->
                <span v-if="options?.superchat?.show?.includes('time')" class="superchat-time">
                    {{ formatTime(data.time) }}
                </span>
            </div>
            <div class="superchat-message" :style="{ 
                color: data.isExpired ? '#999999' : (data.textColor || '#FFFFFF')
            }">
                <!-- 确保弹幕内容总是显示，即使为空 -->
                <span>{{ data.txt || '暂无内容' }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

let props = defineProps({
    data: {
        type: Object,
        required: true
    },
    mode: {
        type: String,
        default: 'day'
    },
    showAnimation: {
        type: Boolean,
        default: true
    },
    options: {
        type: Object,
        default: () => ({})
    }
})

/**
 * 格式化时间
 * @param {number} time - 时间戳
 * @returns {string} 格式化后的时间
 */
const formatTime = (time) => {
    if (!time) {
        return ''
    }
    const date = new Date(time * 1000);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
}

// 组件挂载时，设置自动移除计时器
onMounted(() => {
    // 30秒后自动移除超级弹幕
    const timer = setTimeout(() => {
        // 这里可以通过事件通知父组件移除该弹幕
    }, 30000)
})

</script>

<style lang="scss" scoped>
.superchat-item {
    display: flex;
    align-items: flex-start;
    padding: 12px 16px;
    margin: 8px 16px;
    border-radius: 8px;
    background-color: #FF6B6B; /* 默认背景色，会被动态样式覆盖 */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;
    animation: fadeInLeft 0.5s ease-out;
    max-width: 90%;
    word-break: break-word;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    
    border: 1px solid rgba(255, 255, 255, 0.2);

    // 前景色进度条
    .superchat-progress {
        position: absolute;
        top: 0;
        right: 0;
        height: 100%;
        width: 100%;
        z-index: 0;
        opacity: 0.8;
        animation: progressBarRightToLeft linear forwards;
        pointer-events: none;
    }

    // 确保内容在进度条之上
    .superchat-avatar,
    .superchat-content {
        position: relative;
        z-index: 1;
    }

    // 添加脉冲效果
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    // 等级1 - 最低等级
    &.superchat-level-1 {
        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
        animation: fadeInLeft 0.5s ease-out;
    }

    // 等级2 - 较低等级
    &.superchat-level-2 {
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
        animation: fadeInLeft 0.5s ease-out;
    }

    // 等级3 - 中等等级
    &.superchat-level-3 {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        animation: fadeInLeft 0.5s ease-out, shimmer 3s ease-in-out infinite;
    }

    // 等级4 - 较高等级
    &.superchat-level-4 {
        box-shadow: 0 5px 18px rgba(0, 0, 0, 0.25);
        animation: fadeInLeft 0.5s ease-out, float 3s ease-in-out infinite;
        border-width: 2px;
        border-color: rgba(255, 255, 255, 0.25);
    }

    // 等级5 - 很高等级
    &.superchat-level-5 {
        box-shadow: 0 5px 18px rgba(0, 0, 0, 0.3);
        animation: fadeInLeft 0.5s ease-out, float 3s ease-in-out infinite;
        border-width: 2px;
        border-color: rgba(255, 255, 255, 0.25);
    }

    // 等级6 - 最高等级
    &.superchat-level-6 {
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
        animation: fadeInLeft 0.5s ease-out, pulse 2s ease-in-out infinite;
        border-width: 2px;
        border-color: rgba(255, 255, 255, 0.3);
    }
}

.superchat-avatar {
    margin-right: 12px;
    flex-shrink: 0;
    
    .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    
    &.placeholder {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.3);
    }
}

.superchat-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.superchat-header {
        display: flex;
        align-items: center;
        margin: -12px -16px 8px -16px;
        padding: 8px 16px;
        position: relative;
        flex-wrap: wrap;
    }

    .superchat-header::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 16px;
        width: auto;
        max-width: 60%; /* 控制下划线长度 */
        height: 1px;
        background-color: var(--superchat-header-color);
        opacity: 0.6;
    }

.superchat-nickname {
    font-weight: bold;
    font-size: 14px;
    margin-right: 8px;
    flex-shrink: 0;
}

.superchat-fans,
.superchat-noble,
.superchat-roomAdmin,
.superchat-diamond {
    font-size: 12px;
    font-weight: bold;
    color: #FFFFFF;
    padding: 2px 6px;
    border-radius: 8px;
    margin-right: 6px;
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.3);
}

.superchat-time {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    margin-left: 8px;
    flex-shrink: 0;
}

.superchat-price {
    font-size: 12px;
    font-weight: bold;
    color: #FFFFFF;
    padding: 2px 8px;
    border-radius: 10px;
    margin-left: 6px;
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.2);
}

.superchat-message {
    font-size: 16px;
    line-height: 1.4;
    word-wrap: break-word;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    // 确保弹幕内容总是显示，即使为空
    min-height: 1.4em;
    display: block;
    padding: 4px 0;
}

// 动画效果
@keyframes fadeInLeft {
    from {
        opacity: 0;
        transform: translateX(-30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes progressBar {
    from {
        width: 100%;
    }
    to {
        width: 0;
    }
}

// 从右到左的进度条动画
@keyframes progressBarRightToLeft {
    from {
        width: 100%;
    }
    to {
        width: 0;
    }
}

// 脉冲动画 - 用于最高级超级弹幕
@keyframes pulse {
    0%, 100% {
        transform: translateY(0) scale(1);
        box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
    }
    50% {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 8px 25px rgba(255, 107, 107, 0.5);
    }
}

// 浮动动画 - 用于高级超级弹幕
@keyframes float {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-3px);
    }
}

// 闪光动画 - 用于中级超级弹幕
@keyframes shimmer {
    0%, 100% {
        box-shadow: 0 4px 16px rgba(78, 205, 196, 0.3);
    }
    50% {
        box-shadow: 0 6px 20px rgba(78, 205, 196, 0.5);
    }
}

// 夜间模式适配过期超级弹幕样式
.superchat-item--expired {
    // 降低透明度
    opacity: 0.6;
    
    // 移除动画效果
    animation: none;
    
    // 移除进度条
    .superchat-progress {
        display: none;
    }
    
    // 移除渐变背景，使用灰色
    background: #f0f0f0 !important;
    
    // 调整阴影
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;
    
    // 调整文字和元素颜色
    .superchat-avatar {
        .avatar {
            border-color: rgba(0, 0, 0, 0.1);
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }
    }
    
    .superchat-content {
        .superchat-header {
            // 确保过期状态下也显示用户名
            display: flex;
            
            .superchat-fans,
            .superchat-noble,
            .superchat-roomAdmin,
            .superchat-diamond {
                background-color: #CCCCCC !important;
                color: #999999 !important;
            }
            
            .superchat-time {
                color: #999999 !important;
            }
            
            .superchat-nickname {
                color: #999999 !important;
                display: block;
            }
            
            .superchat-price {
                background-color: #CCCCCC !important;
                color: #999999 !important;
            }
        }
        
        .superchat-message {
            color: #999999 !important;
            text-shadow: none !important;
            // 确保过期状态下也显示弹幕内容
            display: block;
        }
    }
}

// 夜间模式适配
[data-theme="night"] .superchat-item {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

// 夜间模式下的过期超级弹幕
[data-theme="night"] .superchat-item--expired {
    background: #333333 !important;
    
    .superchat-avatar {
        .avatar {
            border-color: rgba(255, 255, 255, 0.1);
        }
    }
    
    .superchat-content {
        .superchat-header {
            .superchat-fans,
            .superchat-noble,
            .superchat-roomAdmin,
            .superchat-diamond {
                background-color: #444444 !important;
                color: #666666 !important;
            }
            
            .superchat-time {
                color: #666666 !important;
            }
            
            .superchat-nickname {
                color: #666666 !important;
            }
            
            .superchat-price {
                background-color: #444444 !important;
                color: #666666 !important;
            }
        }
        
        .superchat-message {
            color: #666666 !important;
        }
    }
}
</style>