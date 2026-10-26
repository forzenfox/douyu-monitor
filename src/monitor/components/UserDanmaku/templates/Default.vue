<template>
  <div
    class="user-danmaku-item"
    :class="{
      'user-danmaku-item--expired': data.isExpired,
      fadeInLeft: showAnimation,
    }"
    :style="{
      borderColor: data.isExpired ? '#CCCCCC' : color,
      cursor: 'pointer',
    }"
    @click.stop="$emit('click')"
  >
    <div class="user-row">
      <!-- 头像 -->
      <span class="user-avatar">
        <img
          class="avatar"
          :src="getAvatarUrl(data.userInfo?.avatar)"
          alt="avatar"
          loading="lazy"
          @error="handleAvatarError"
        />
      </span>

      <!-- 用户名 -->
      <span
        class="username"
        :style="{ color: data.isExpired ? '#999999' : '' }"
        >{{ data.userName }}</span
      >

      <!-- 弹幕内容 -->
      <div class="content">
        <span
          class="content-text"
          :style="{ color: data.isExpired ? '#999999' : '' }"
          >{{ data.content }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    required: true,
  },
  color: {
    type: String,
    default: '#9c27b0',
  },
  showAnimation: {
    type: Boolean,
    default: true,
  },
});

defineEmits(['click']);

// 获取头像URL
const getAvatarUrl = avatar => {
  if (!avatar) {
    return '';
  }
  if (avatar.startsWith('http') || avatar.startsWith('https')) {
    return avatar;
  }
  if (avatar.endsWith('_small.jpg')) {
    return `https://apic.douyucdn.cn/upload/${avatar}`;
  }
  return `https://apic.douyucdn.cn/upload/${avatar}_small.jpg`;
};

// 处理头像加载错误
const handleAvatarError = e => {
  e.target.src = '';
  e.target.style.display = 'none';
};
</script>

<style lang="scss" scoped>
@use '@/global/styles/themes/index.scss' as *;

.user-danmaku-item {
  @include fontColor('txtColor');

  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 5px;
  transition: all 0.3s ease;
  border: 2px solid;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  :deep(.day) & {
    background-color: rgba(255, 255, 255, 0.9);
  }

  :deep(.night) & {
    background-color: rgba(0, 0, 0, 0.3);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .user-row {
    display: flex;
    align-items: center;
    width: 100%;
  }

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
        border-color: rgba(156, 39, 176, 0.3);
      }
    }
  }

  .username {
    font-size: 14px;
    font-weight: bold;
    margin-right: 8px;
    flex-shrink: 0;
    @include fontColor('nicknameColor');
  }

  .content {
    display: flex;
    align-items: center;
    flex: 1;
    font-size: 14px;
    min-width: 0;

    .content-text {
      word-break: break-all;
      flex: 1;
    }
  }

  // 失效样式，与指令弹幕保持一致
  &.user-danmaku-item--expired {
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
