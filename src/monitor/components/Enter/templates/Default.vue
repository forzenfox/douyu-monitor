<template>
  <div
    :class="`item ${showAnimation ? 'fadeInLeft' : ''} ${getItemClass(data)}`"
  >
    <span
      v-if="showLevel"
      :class="`item__level ${mode === 'night' && Number(data.lv) < 70 ? 'fansLevelNight' : ''} UserLevel UserLevel--${data.lv}`"
    ></span>
    <span v-if="!!data.noble && showNoble" class="item__noble"
      ><img
        :src="`${data.noble in nobleData ? nobleData.prefix + nobleData[data.noble].pic : ''}`"
        loading="lazy"
    /></span>
    <span v-if="showAvatar" class="item__avatar"
      ><img
        class="avatar"
        :src="getAvatarUrl(data.avatar)"
        @error="handleAvatarError"
        loading="lazy"
    /></span>
    <span class="item__name"
      ><span>{{ data.nn }}</span> 进入了直播间</span
    >
  </div>
</template>

<script setup>
import { nobleData } from '@/global/utils/dydata/nobleData.js';
let props = defineProps([
  'data',
  'mode',
  'keywords',
  'showAnimation',
  'showLevel',
  'showNoble',
  'showAvatar',
]);

/**
 * 获取头像URL
 * @param {string} avatar - 头像标识
 * @returns {string} 完整的头像URL
 */
const getAvatarUrl = avatar => {
  if (!avatar) {
    return '';
  }
  // 如果avatar已经包含完整路径或特殊格式，直接返回
  if (avatar.startsWith('http') || avatar.startsWith('https')) {
    return avatar;
  }
  // 检查avatar是否已经包含_small.jpg后缀
  if (avatar.endsWith('_small.jpg')) {
    return `https://apic.douyucdn.cn/upload/${avatar}`;
  }
  return `https://apic.douyucdn.cn/upload/${avatar}_small.jpg`;
};

/**
 * 处理头像加载错误
 * @param {Event} e - 错误事件
 */
const handleAvatarError = e => {
  // 可以设置默认头像或清空无效图片
  e.target.src = '';
  e.target.style.display = 'none';
};

// 控制高亮以及日夜模式的背景色
function getItemClass(item) {
  let keywords = props.keywords ? props.keywords.trim() : '';
  if (keywords !== '') {
    let arr = keywords.split(' ');
    for (let i = 0; i < arr.length; i++) {
      if (item.nn && item.nn.indexOf(arr[i]) !== -1) {
        if (props.mode === 'night') {
          return 'highlight-night';
        } else {
          return 'highlight-day';
        }
      }
    }
  }
  if (item.noble) {
    if (props.mode === 'night') {
      return 'noble-night';
    } else {
      return 'noble-day';
    }
  }
  return '';
}
</script>

<style lang="scss" scoped>
@use '@/global/styles/themes/index.scss' as *;
.item {
  vertical-align: middle;
  width: 100%;
  margin-bottom: 5px;
  padding: 0 4px;
  box-sizing: border-box;
  &:first-child {
    margin-top: 5px;
  }
  > * {
    vertical-align: middle;
    margin-right: 5px;
  }

  .item__name {
    @include fontColor('contentColor');
    span {
      @include fontColor('nicknameColor');
    }
  }
}

.highlight-day {
  background-color: rgb(255, 243, 223);
  border-top: 1px solid #ffe4b8;
  border-bottom: 1px solid #ffe4b8;
}
.highlight-night {
  background-color: #494949;
  background-image: linear-gradient(90deg, #494949 0%, #9a9a9a 100%);
}

.noble-day {
  background-color: rgb(227, 230, 232);
}

.noble-night {
  background-color: rgb(55, 55, 55);
  border-top: 1px solid rgb(90, 90, 90);
  border-bottom: 1px solid rgb(90, 90, 90);
}
</style>
