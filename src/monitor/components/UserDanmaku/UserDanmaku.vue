<template>
  <div ref="domUserDanmaku" class="user-danmaku">
    <div class="user-danmaku-list">
      <Default
        v-for="item in displayList"
        v-memo="[options.mode, options.animation]"
        :key="item.id"
        :data="item"
        :color="USER_DANMAKU_COLOR"
        :showAnimation="options.animation"
        @click="handleUserDanmakuClick(item.id)"
      ></Default>
      <div v-if="displayList.length === 0" class="empty-tip">
        暂无指定用户弹幕
      </div>
    </div>
    <div
      v-show="isLock"
      class="gobottom"
      @click.stop="
        goToScrollBottom(
          domUserDanmaku.value?.querySelector('.user-danmaku-list')
        )
      "
    >
      回到底部
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUpdated } from 'vue';
import Default from './templates/Default.vue';

import { useFlexStyle } from '../../hooks/useFlexStyle.js';
import { useBorderStyle } from '../../hooks/useBorderStyle.js';
import { useScroll } from '../../hooks/useScroll.js';
import { useExpiredAutoRemove } from '../../hooks/useExpiredAutoRemove.js';

// 指定用户弹幕统一强调色
const USER_DANMAKU_COLOR = '#9c27b0';

const props = defineProps({
  maxOrder: {
    type: Number,
  },
  options: {
    type: Object,
  },
  userDanmakuList: {
    type: Array,
    default: () => [],
  },
});

const domUserDanmaku = ref(null);
let { flexStyle, orderStyle } = useFlexStyle(props, 'userDanmaku');
let { borderBottomStyle, borderRightStyle } = useBorderStyle(
  props,
  'userDanmaku'
);
let { isLock, onScroll, onScrollUpdate, goToScrollBottom } = useScroll();
const { schedule } = useExpiredAutoRemove(
  () => props.options?.userDanmaku,
  () => props.userDanmakuList
);

const displayList = computed(() => props.userDanmakuList);

// 监听列表变化，自动滚动到底部
watch(
  () => props.userDanmakuList.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      setTimeout(() => {
        goToScrollBottom(
          domUserDanmaku.value?.querySelector('.user-danmaku-list')
        );
      }, 100);
    }
  }
);

/**
 * 处理指定用户弹幕点击事件，效果与指令弹幕一致（变灰）
 * @param {string} id - 弹幕ID
 */
const handleUserDanmakuClick = id => {
  const index = props.userDanmakuList.findIndex(item => item.id === id);
  if (index !== -1) {
    props.userDanmakuList[index].isExpired = true;
    schedule(id);
  }
};

onUpdated(() => {
  const listDom = domUserDanmaku.value?.querySelector('.user-danmaku-list');
  if (listDom) {
    onScrollUpdate(listDom);
  }
});

onMounted(() => {
  const listDom = domUserDanmaku.value?.querySelector('.user-danmaku-list');
  if (listDom) {
    listDom.addEventListener('mousewheel', () => {
      onScroll(listDom);
    });
    listDom.addEventListener('touchmove', () => {
      onScroll(listDom);
    });
  }
});
</script>

<style lang="scss" scoped>
.user-danmaku {
  height: 100%;
  display: flex;
  flex-direction: column;
  order: v-bind(orderStyle);
  flex: v-bind(flexStyle);
  border-bottom: v-bind(borderBottomStyle);
  border-right: v-bind(borderRightStyle);
  overflow: hidden;

  background-color: transparent;
  color: inherit;

  .user-danmaku-list {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 5px 10px 10px;

    :deep(.day) & {
      background-color: rgba(255, 255, 255, 0.9);
    }

    :deep(.night) & {
      background-color: rgba(0, 0, 0, 0.3);
    }

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;

      :deep(.night) & {
        background: rgba(255, 255, 255, 0.05);
      }
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;

      &:hover {
        background: rgba(255, 255, 255, 0.5);
      }

      :deep(.night) & {
        background: rgba(255, 255, 255, 0.2);

        &:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      }
    }
  }

  .empty-tip {
    text-align: center;
    padding: 20px;
    color: rgba(0, 0, 0, 0.5);
    font-size: 14px;

    :deep(.night) & {
      color: rgba(255, 255, 255, 0.3);
    }
  }
}
</style>
