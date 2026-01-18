<template>
  <div 
    class="command-danmaku-item" 
    :class="{
      'highlight': isHighlight,
      'command-danmaku-item--expired': data.isExpired,
      'fadeInLeft': showAnimation
    }"
    :style="{
      borderColor: data.isExpired ? '#CCCCCC' : props.color,
      cursor: 'pointer'
    }"
    @click.stop="$emit('click')"
  >
    <div class="command-row">
      <!-- 头像 -->
      <span class="user-avatar">
        <img class="avatar" :src="getAvatarUrl(data.userInfo?.avatar)" alt="avatar" loading="lazy" @error="handleAvatarError" />
      </span>
      
      <!-- 用户名 -->
      <span class="username" :style="{ color: data.isExpired ? '#999999' : '' }">{{ data.userName }}</span>
      
      <!-- 指令内容 -->
      <div class="command-content">
        <span class="command-type" :style="{ color: data.isExpired ? '#CCCCCC' : '' }">{{ data.command }}：</span>
        <span class="command-text" :style="{ color: data.isExpired ? '#999999' : '' }">{{ data.commandContent || data.content }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  color: {
    type: String,
    default: '#007bff'
  },
  showAnimation: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click'])

const isHighlight = ref(true)

// 获取头像URL
const getAvatarUrl = (avatar) => {
  if (!avatar) {
    return ''
  }
  // 如果avatar已经包含完整路径或特殊格式，直接返回
  if (avatar.startsWith('http') || avatar.startsWith('https')) {
    return avatar
  }
  // 检查avatar是否已经包含_small.jpg后缀
  if (avatar.endsWith('_small.jpg')) {
    return `https://apic.douyucdn.cn/upload/${avatar}`
  }
  return `https://apic.douyucdn.cn/upload/${avatar}_small.jpg`
}

// 处理头像加载错误
const handleAvatarError = (e) => {
  e.target.src = ''
  e.target.style.display = 'none'
}

// 2秒后取消高亮
onMounted(() => {
  setTimeout(() => {
    isHighlight.value = false
  }, 2000)
})
</script>

<style lang="scss" scoped>
@use "@/global/styles/themes/index.scss" as *;

.command-danmaku-item {
  // 使用与其他弹幕一致的背景和文字颜色
  @include fontColor("txtColor");
  
  // 基础样式
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 5px;
  transition: all 0.3s ease;
  border: 2px solid;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  // 日间模式样式
  :deep(.day) & {
    background-color: rgba(255, 255, 255, 0.9);
  }
  
  // 夜间模式样式
  :deep(.night) & {
    background-color: rgba(0, 0, 0, 0.3);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  // 一行显示样式
  .command-row {
    display: flex;
    align-items: center;
    width: 100%;
  }
  
  // 头像样式
  .user-avatar {
    margin-right: 8px;
    flex-shrink: 0;
    
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      
      :deep(.day) & {
        border-color: rgba(0, 123, 255, 0.3);
      }
    }
  }
  
  // 用户名样式
  .username {
    font-size: 14px;
    font-weight: bold;
    margin-right: 8px;
    @include fontColor("nicknameColor");
  }
  
  // 指令内容样式
  .command-content {
    display: flex;
    align-items: center;
    flex: 1;
    font-size: 14px;
    
    .command-type {
      font-weight: bold;
      margin-right: 4px;
      color: #007bff;
      
      // 夜间模式指令类型样式
      :deep(.night) & {
        color: #4a9eff;
      }
    }
    
    .command-text {
      word-break: break-all;
      flex: 1;
    }
  }
  
  &.highlight {
    // 高亮样式
    :deep(.day) & {
      background-color: rgba(255, 243, 223, 0.9);
      transform: scale(1.02);
    }
    
    :deep(.night) & {
      background-color: rgba(55, 55, 55, 0.9);
      transform: scale(1.02);
    }
  }
  
  // 失效样式
  &.command-danmaku-item--expired {
    opacity: 0.6;
    transform: scale(0.98);
    
    :deep(.day) & {
      background-color: rgba(240, 240, 240, 0.9);
      box-shadow: none;
    }
    
    :deep(.night) & {
      background-color: rgba(20, 20, 20, 0.3);
      box-shadow: none;
    }
    
    .avatar {
      opacity: 0.5;
    }
    
    .command-type {
      font-weight: normal;
    }
  }
}

// 淡入动画
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 从左侧淡入动画 - 与普通弹幕保持一致
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
</style>